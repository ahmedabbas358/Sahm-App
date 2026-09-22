"""
Sahm Backend — Package Builder (.sahmpkg Container & Manifest Generator) (Prompt 22)
Bundles source files, processed variants, OCR outputs, field confidences,
reconciliation links, and review states into a unified encrypted container.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

from app.services.handoff.crypto_engine import CryptoEngine


class PackageBuilder:
    """Constructs .sahmpkg manifests, bundles state, and encrypts containers."""

    @staticmethod
    def build_manifest(
        package_id: str,
        handoff_id: str,
        handoff_type: str,
        tenant_id: str,
        institution_name: str,
        creator_user_id: str,
        creator_name: str,
        device_id: str,
        pipeline_fingerprint: str,
        items_summary: Dict[str, int],
        payload_hash: str,
        leaf_hashes: List[str],
        data_classification: str = "RESTRICTED",
        included_capabilities: List[str] = None,
        excluded_capabilities: List[str] = None,
    ) -> Dict[str, Any]:
        """Generate official manifest.json metadata structure."""
        if included_capabilities is None:
            included_capabilities = [
                "SOURCE_IMAGES",
                "PROCESSED_IMAGES",
                "OCR_RESULTS",
                "FIELD_CONFIDENCES",
                "MATCH_SUGGESTIONS",
                "REVIEW_STATE",
                "ERROR_LOGS",
            ]
        if excluded_capabilities is None:
            excluded_capabilities = ["NATIONAL_ID_RAW", "FINANCIAL_FEES_DATA"]

        merkle_root = CryptoEngine.calculate_merkle_root(leaf_hashes)

        manifest = {
            "$schema": "https://sahm.university.edu/schemas/v1/handoff-manifest.json",
            "manifest_version": "1.2.0",
            "package_id": package_id,
            "handoff_id": handoff_id,
            "handoff_type": handoff_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data_classification": data_classification,
            "institution": {
                "id": "inst_univ_main",
                "name": institution_name,
                "tenant_id": tenant_id,
            },
            "source_provenance": {
                "creator_user_id": creator_user_id,
                "creator_name": creator_name,
                "device_id": device_id,
                "pipeline_fingerprint": pipeline_fingerprint,
            },
            "work_summary": {
                "total_items": items_summary.get("total", 0),
                "processed_count": items_summary.get("processed", 0),
                "needs_review_count": items_summary.get("needs_review", 0),
                "failed_count": items_summary.get("failed", 0),
                "pending_count": items_summary.get("pending", 0),
                "next_resume_item_index": items_summary.get("next_resume_index", 0),
            },
            "included_capabilities": included_capabilities,
            "excluded_capabilities": excluded_capabilities,
            "integrity": {
                "algorithm": "SHA-256",
                "payload_hash": payload_hash,
                "merkle_root": merkle_root,
                "files_count": len(leaf_hashes),
            },
        }
        return manifest

    @staticmethod
    def bundle_work_state(
        batch_id: str,
        batch_name: str,
        items: List[Dict[str, Any]],
        reconciliation_links: List[Dict[str, Any]] = None,
        review_queue: List[Dict[str, Any]] = None,
        audit_history: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Bundle complete working state into a structured serializable dictionary.
        Preserves all OCR results, field confidences, candidate matches, and review items.
        """
        return {
            "batch_id": batch_id,
            "batch_name": batch_name,
            "bundled_at": datetime.now(timezone.utc).isoformat(),
            "items": items,
            "reconciliation_links": reconciliation_links or [],
            "review_queue": review_queue or [],
            "audit_history": audit_history or [],
        }

    @classmethod
    def serialize_and_encrypt(
        cls,
        work_state: Dict[str, Any],
        dek: bytes,
    ) -> Tuple[bytes, bytes, str]:
        """
        Serialize work state to JSON bytes, encrypt with DEK, and return
        (ciphertext, nonce, payload_sha256).
        """
        json_bytes = json.dumps(work_state, ensure_ascii=False, sort_keys=True).encode("utf-8")
        payload_hash = CryptoEngine.calculate_sha256(json_bytes)
        ciphertext, nonce = CryptoEngine.encrypt_payload(json_bytes, dek)
        return ciphertext, nonce, payload_hash

    @classmethod
    def decrypt_and_unpack(
        cls,
        ciphertext: bytes,
        nonce: bytes,
        dek: bytes,
    ) -> Dict[str, Any]:
        """
        Decrypt and deserialize package payload back into working state dictionary.
        """
        decrypted_bytes = CryptoEngine.decrypt_payload(ciphertext, nonce, dek)
        return json.loads(decrypted_bytes.decode("utf-8"))
