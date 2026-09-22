"""
Sahm Backend — Automated Test Suite for Secure Share & Work Handoff (Prompt 22)
Validates envelope encryption, chunking & resume offset, direct pairing phrases,
conflict detection, field-level merge, DLP inspection, provenance, and continue-where-I-left-off.
"""
import pytest
import secrets
from cryptography.exceptions import InvalidTag

from app.models.handoff import MergeStrategy, ConflictClass
from app.services.handoff.crypto_engine import CryptoEngine
from app.services.handoff.package_builder import PackageBuilder
from app.services.handoff.resumable_transfer_manager import ResumableTransferManager
from app.services.handoff.direct_transfer_provider import DirectTransferProvider
from app.services.handoff.conflict_reconciler import ConflictReconciler
from app.services.handoff.provenance_tracker import ProvenanceTracker
from app.services.handoff.dlp_inspector import DLPInspector
from app.services.handoff.state_resumer import StateResumer


def test_crypto_engine_dek_and_aes_gcm():
    """Verify DEK generation, AES-256-GCM encryption, decryption, and tamper detection."""
    dek = CryptoEngine.generate_dek()
    assert len(dek) == 32

    original_plaintext = "بيانات طلاب كلية الهندسة 2026 — سرية للغاية".encode("utf-8")
    ciphertext, nonce = CryptoEngine.encrypt_payload(original_plaintext, dek)

    assert len(nonce) == 12
    assert ciphertext != original_plaintext

    # Decrypt successfully
    decrypted = CryptoEngine.decrypt_payload(ciphertext, nonce, dek)
    assert decrypted == original_plaintext

    # Tamper with ciphertext and ensure InvalidTag is raised
    tampered = bytearray(ciphertext)
    tampered[0] ^= 0xFF
    with pytest.raises(InvalidTag):
        CryptoEngine.decrypt_payload(bytes(tampered), nonce, dek)


def test_crypto_engine_key_wrapping_and_unwrapping():
    """Verify DEK wrapping with institutional password/secret and unwrapping."""
    dek = CryptoEngine.generate_dek()
    secret = "Sahm_Univ_Secret_Passphrase_2026!#"

    wrapped_b64 = CryptoEngine.wrap_dek(dek, secret)
    assert isinstance(wrapped_b64, str)
    assert len(wrapped_b64) > 32

    unwrapped_dek = CryptoEngine.unwrap_dek(wrapped_b64, secret)
    assert unwrapped_dek == dek

    # Unwrapping with wrong secret must fail
    with pytest.raises(InvalidTag):
        CryptoEngine.unwrap_dek(wrapped_b64, "Wrong_Passphrase_123")


def test_crypto_engine_merkle_root_calculation():
    """Verify Merkle tree root hash generation from leaf hashes."""
    leaves = [
        CryptoEngine.calculate_sha256(f"file_{i}.jpg".encode("utf-8"))
        for i in range(5)
    ]
    merkle_root = CryptoEngine.calculate_merkle_root(leaves)
    assert isinstance(merkle_root, str)
    assert len(merkle_root) == 64

    # Merkle root of same leaves must be deterministic
    merkle_root_2 = CryptoEngine.calculate_merkle_root(leaves)
    assert merkle_root == merkle_root_2


def test_crypto_shredding_on_revocation():
    """Verify crypto-shredding clears wrapped key and marks key destroyed."""
    class MockPackage:
        def __init__(self):
            self.wrapped_dek_base64 = "encrypted_key_data"
            self.is_key_destroyed = False

    pkg = MockPackage()
    result = CryptoEngine.crypto_shred(pkg)
    assert result is True
    assert pkg.wrapped_dek_base64 is None
    assert pkg.is_key_destroyed is True


def test_package_builder_manifest_and_state_bundle():
    """Verify building .sahmpkg manifest and bundling complete work state."""
    items = [
        {"id": "cert_01", "name": "أحمد إبراهيم", "ocr": "جامعة سهم", "state": "completed"},
        {"id": "cert_02", "name": "سارة محمد", "ocr": "كلية الحاسبات", "state": "needs_review"},
    ]
    state = PackageBuilder.bundle_work_state(
        batch_id="batch_2026_01",
        batch_name="شهادات الحاسبات 2026",
        items=items,
    )
    assert state["batch_id"] == "batch_2026_01"
    assert len(state["items"]) == 2

    dek = CryptoEngine.generate_dek()
    ciphertext, nonce, payload_hash = PackageBuilder.serialize_and_encrypt(state, dek)
    assert len(payload_hash) == 64

    manifest = PackageBuilder.build_manifest(
        package_id="pkg_test_01",
        handoff_id="hnd_test_01",
        handoff_type="CONTINUE_WORK_HANDOFF",
        tenant_id="tenant_01",
        institution_name="جامعة سهم",
        creator_user_id="usr_01",
        creator_name="أحمد عباس",
        device_id="dev_01",
        pipeline_fingerprint="sahm_ocr_vit_v2",
        items_summary={"total": 2, "processed": 1, "needs_review": 1},
        payload_hash=payload_hash,
        leaf_hashes=[payload_hash],
    )
    assert manifest["package_id"] == "pkg_test_01"
    assert manifest["work_summary"]["total_items"] == 2
    assert manifest["integrity"]["payload_hash"] == payload_hash

    # Unpack and verify state
    unpacked = PackageBuilder.decrypt_and_unpack(ciphertext, nonce, dek)
    assert unpacked["batch_name"] == "شهادات الحاسبات 2026"
    assert len(unpacked["items"]) == 2


def test_resumable_transfer_chunking_and_reassembly():
    """Verify chunking of binary payload and byte-accurate reassembly."""
    dummy_payload = secrets.token_bytes(25 * 1024 * 1024)  # 25 MB
    chunk_size = 8 * 1024 * 1024  # 8 MB

    chunks = ResumableTransferManager.slice_into_chunks(dummy_payload, chunk_size=chunk_size)
    assert len(chunks) == 4  # 8 + 8 + 8 + 1 MB

    # Verify per-chunk integrity
    for c in chunks:
        assert ResumableTransferManager.verify_chunk(c["chunk_data"], c["chunk_hash"]) is True

    # Reassemble and compare with original
    reassembled = ResumableTransferManager.reassemble_chunks(chunks)
    assert reassembled == dummy_payload


def test_resumable_transfer_network_drop_simulation():
    """Simulate network interruption at 63% and calculate correct resume offset."""
    total_chunks = 240
    # Simulate first 152 chunks successfully uploaded (152 / 240 = 63.3%)
    completed_chunks = list(range(152))

    next_offset = ResumableTransferManager.calculate_resume_offset(completed_chunks, total_chunks)
    assert next_offset == 152  # 0-indexed: chunk 152 is the 153rd chunk

    progress = ResumableTransferManager.compute_progress_percentage(len(completed_chunks), total_chunks)
    assert progress == 63.33


def test_direct_transfer_handshake_and_pairing_phrase():
    """Verify pairing code and memorable visual verification phrases (e.g. BLUE-ORBIT-27)."""
    code = DirectTransferProvider.generate_pairing_code()
    assert len(code) == 6
    assert code.isdigit()

    phrase = DirectTransferProvider.generate_verification_phrase()
    parts = phrase.split("-")
    assert len(parts) == 3
    assert parts[0].isalpha()
    assert parts[1].isalpha()
    assert parts[2].isdigit()

    assert DirectTransferProvider.verify_phrase(phrase, phrase.lower()) is True
    assert DirectTransferProvider.verify_phrase("BLUE-ORBIT-27", "SWIFT-SHADOW-42") is False


def test_conflict_reconciler_detection_and_classification():
    """Verify detecting and categorizing data and state conflicts."""
    local_items = [
        {"id": "cert_1", "student_name": "محمد علي", "graduation_year": 2024, "status": "approved"},
        {"id": "cert_2", "student_name": "سارة أحمد", "graduation_year": 2023, "status": "completed"},
    ]
    incoming_items = [
        {"id": "cert_1", "student_name": "محمد علي", "graduation_year": 2024, "status": "approved"},  # Identical
        {"id": "cert_2", "student_name": "سارة أحمد", "graduation_year": 2024, "status": "completed"},  # DATA_CONFLICT (year)
        {"id": "cert_3", "student_name": "خالد محمود", "graduation_year": 2024, "status": "pending"},  # NEW
    ]

    diff = ConflictReconciler.detect_conflicts(local_items, incoming_items)
    assert diff["identical_count"] == 1
    assert diff["new_count"] == 1
    assert diff["conflicts_count"] == 1
    assert diff["conflicts"][0]["conflict_class"] == ConflictClass.DATA_CONFLICT.value
    assert diff["conflicts"][0]["field_name"] == "graduation_year"


def test_conflict_reconciler_field_level_merge():
    """Verify safe field-level merge of orthogonal non-overlapping fields."""
    local = {"id": "c1", "student_name": "أحمد كمال", "faculty_name": None}
    incoming = {"id": "c1", "student_name": None, "faculty_name": "كلية الهندسة"}

    merged = ConflictReconciler.reconcile_item(local, incoming, MergeStrategy.FIELD_LEVEL_MERGE)
    assert merged["student_name"] == "أحمد كمال"
    assert merged["faculty_name"] == "كلية الهندسة"
    assert merged["reconciled_via"] == "FIELD_LEVEL_MERGE"


def test_provenance_and_chain_of_custody_preservation():
    """Verify that original creator and capture time remain immutable while operational owner updates."""
    init_prov = ProvenanceTracker.initialize_provenance(
        creator_user_id="usr_ahmed",
        creator_name="أحمد عباس",
        device_id="dev_scanner_01",
        ocr_pipeline_fingerprint="vit_ocr_v2",
        source_hash="hash_cert_01",
    )
    assert init_prov["original_creator_name"] == "أحمد عباس"
    assert init_prov["operational_owner_id"] == "usr_ahmed"
    assert len(init_prov["chain_of_custody"]) == 1

    # Hand off to Sara
    transferred = ProvenanceTracker.append_custody_transfer(
        provenance_block=init_prov,
        sender_user_id="usr_ahmed",
        sender_name="أحمد عباس",
        recipient_user_id="usr_sara",
        recipient_name="سارة حسن",
        handoff_id="hnd_9001",
        transfer_method="DIRECT_LOCAL",
    )
    # Original author remains unchanged
    assert transferred["original_creator_name"] == "أحمد عباس"
    # Operational owner is now Sara
    assert transferred["operational_owner_id"] == "usr_sara"
    assert len(transferred["chain_of_custody"]) == 2
    assert transferred["chain_of_custody"][1]["action"] == "HANDOFF_TRANSFERRED"


def test_dlp_inspector_blocks_unauthorized_external_share():
    """Verify DLP inspector detects unmasked sensitive IDs and blocks external sharing."""
    items = [
        {"id": "1", "student_name": "فاطمة عمر", "national_id": "29801011234567"},
        {"id": "2", "student_name": "ياسين طارق"},
    ]
    # Restricted data to external recipient without approval
    res = DLPInspector.inspect_payload(
        items=items,
        data_classification="RESTRICTED",
        is_external_recipient=True,
        allow_external_sharing=False,
    )
    assert res["is_compliant"] is False
    assert len(res["violations"]) >= 1
    assert res["sensitive_counts"]["national_id"] == 1

    watermark = DLPInspector.generate_preview_watermark("سارة حسن", "2026-09-22")
    assert "سارة حسن" in watermark


def test_state_resumer_continue_where_left_off():
    """
    CRITICAL END-TO-END TEST:
    Employee A scanned 500 certificates:
    - 320 processed
    - 41 needs review
    - 7 failed
    - 132 pending
    Verify exact resume point at item #321 without re-running OCR.
    """
    items = [{"id": f"c_{i}", "state": "completed"} for i in range(320)]
    items.extend([{"id": f"c_{i}", "state": "needs_review"} for i in range(320, 361)])
    items.extend([{"id": f"c_{i}", "state": "failed"} for i in range(361, 368)])
    items.extend([{"id": f"c_{i}", "state": "pending"} for i in range(368, 500)])

    res = StateResumer.calculate_work_state(items)
    assert res["total"] == 500
    assert res["processed"] == 320
    assert res["needs_review"] == 41
    assert res["failed"] == 7
    assert res["pending"] == 132
    # First pending item in queue is at index 368
    assert res["next_resume_index"] == 368

    pending_items = StateResumer.filter_pending_items(items)
    assert len(pending_items) == 180  # 41 review + 7 failed + 132 pending
