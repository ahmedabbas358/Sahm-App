"""
Sahm Backend — Comprehensive Unit Tests for Secure Certificate Verification (Prompt 18)
Tests:
- Crockford Base32 Token Generation, Normalization & Collision Resistance
- Policy Engine, Privacy Profiles & Arabic Name Masking
- Anti-Leakage Privacy Guard & Security Assertions
- Print-Safe Vector SVG & PNG QR Generation
- Sliding-Window Rate Limiting & Brute-Force Abuse Detection
- Batch QR Packaging (ZIP and A4 Printable Grid Sheet)
"""
import zipfile
import io
import pytest

from app.models.verification import (
    PrivacyProfile,
    DisplayNameMode,
    PublicVerificationResult,
    PublicVerificationPolicy,
)
from app.services.verification.token_service import (
    generate_verification_code,
    normalize_code,
    extract_raw_token,
    hash_secret,
    verify_secret,
)
from app.services.verification.policy_engine import (
    mask_student_name,
    mask_university_id,
    build_public_projection,
    assert_no_sensitive_fields,
    SecurityError,
)
from app.services.verification.qr_service import (
    build_verification_url,
    generate_qr_svg,
    generate_qr_png_bytes,
    generate_qr_data_uri,
)
from app.services.verification.abuse_detector import (
    hash_client_ip,
    is_rate_limited,
    record_failed_attempt,
    reset_abuse_detector_for_testing,
)
from app.services.verification.batch_qr_exporter import (
    create_batch_qr_zip,
    generate_printable_qr_sheet_html,
)


# =============================================================
# 1. Token Service & Crockford Base32 Tests
# =============================================================

def test_crockford_token_format_and_entropy():
    code = generate_verification_code()
    assert len(code) == 14  # XXXX-XXXX-XXXX
    parts = code.split("-")
    assert len(parts) == 3
    for p in parts:
        assert len(p) == 4
        # Crockford alphabet: no I, L, O, U
        for char in p:
            assert char in "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def test_token_collision_resistance():
    """Generates 1,000 codes to ensure non-collision and format uniformity."""
    generated = set()
    for _ in range(1000):
        code = generate_verification_code()
        assert code not in generated
        generated.add(code)


def test_token_normalization_and_url_tolerance():
    # Human typos: lowercase, spaces, ambiguous characters
    raw = "  7kx9-qm4p-82dz  "
    norm = normalize_code(raw)
    assert norm == "7KX9-QM4P-82DZ"

    # Ambiguous characters translation (I/L -> 1, O -> 0)
    raw_ambiguous = "7KXi-OM4L-82DO"
    norm_ambiguous = normalize_code(raw_ambiguous)
    assert norm_ambiguous == "7KX1-0M41-82D0"

    # URL wrapper tolerance
    url_input = "https://sahm.edu/v/7KX9-QM4P-82DZ"
    assert normalize_code(url_input) == "7KX9-QM4P-82DZ"

    # Raw token
    raw_token = extract_raw_token("7KX9-QM4P-82DZ")
    assert raw_token == "7KX9QM4P82DZ"


def test_verification_secret_hashing():
    salt = "institutional-test-salt"
    secret = "TopSecretGraduation2026"
    h = hash_secret(secret, salt)
    assert len(h) == 64
    assert verify_secret(secret, h, salt) is True
    assert verify_secret("WrongSecret", h, salt) is False
    assert verify_secret("", h, salt) is False
    assert verify_secret(None, None, salt) is True


# =============================================================
# 2. Policy Engine & Name Masking Tests
# =============================================================

def test_arabic_name_masking_modes():
    name = "أحمد محمد عبد الله إبراهيم"

    # Full
    assert mask_student_name(name, DisplayNameMode.FULL) == "أحمد محمد عبد الله إبراهيم"

    # First and last only
    assert mask_student_name(name, DisplayNameMode.FIRST_LAST_ONLY) == "أحمد إبراهيم"

    # Abbreviated middle
    abbrev = mask_student_name(name, DisplayNameMode.ABBREVIATED_MIDDLE)
    assert abbrev.startswith("أحمد")
    assert abbrev.endswith("إبراهيم")
    assert "م." in abbrev or "ع." in abbrev

    # Initials
    initials = mask_student_name("محمد علي", DisplayNameMode.INITIALS)
    assert initials == "م. ع."


def test_university_id_masking():
    assert mask_university_id("20201015") == "***015"
    assert mask_university_id("123") == "***"
    assert mask_university_id(None) is None


def test_privacy_guard_assertions():
    # Safe payload
    safe = {
        "student_display_name": "أحمد إبراهيم",
        "faculty_name": "كلية دراسات الحاسوب",
        "graduation_year": 2026,
    }
    assert_no_sensitive_fields(safe)

    # Prohibited key should raise SecurityError
    with pytest.raises(SecurityError):
        assert_no_sensitive_fields({"student_display_name": "أحمد", "student_phone": "+249912345678"})

    with pytest.raises(SecurityError):
        assert_no_sensitive_fields({"faculty_name": "كلية الحاسوب", "national_id": "123456789"})

    # Leaked phone number pattern in string value
    with pytest.raises(SecurityError):
        assert_no_sensitive_fields({"faculty_name": "كلية الحاسوب", "contact": "+1-555-555-1234"})


# =============================================================
# 3. QR Service Tests
# =============================================================

def test_qr_code_svg_generation():
    url = "https://sahm.edu/v/7KX9-QM4P-82DZ"
    svg = generate_qr_svg(url)
    assert "<svg" in svg
    assert "</svg>" in svg
    assert 'xmlns="http://www.w3.org/2000/svg"' in svg


def test_qr_code_png_and_data_uri():
    url = "https://sahm.edu/v/7KX9-QM4P-82DZ"
    png_bytes = generate_qr_png_bytes(url)
    assert len(png_bytes) > 0
    # PNG signature check: \x89PNG\r\n\x1a\n
    assert png_bytes[:8] == b"\x89PNG\r\n\x1a\n"

    data_uri = generate_qr_data_uri(url)
    assert data_uri.startswith("data:image/")


# =============================================================
# 4. Abuse Detector & Rate Limiter Tests
# =============================================================

def test_rate_limiter_and_brute_force_block():
    reset_abuse_detector_for_testing()
    test_ip = "192.168.1.100"
    ip_h = hash_client_ip(test_ip)

    # First request should pass
    limited, _ = is_rate_limited(ip_h)
    assert limited is False

    # Simulate brute-force 404 attack (8 consecutive failures)
    for _ in range(7):
        was_blocked = record_failed_attempt(ip_h)
        assert was_blocked is False

    # 8th failure triggers block
    was_blocked = record_failed_attempt(ip_h)
    assert was_blocked is True

    # Immediate next check should be rate limited
    limited, reason = is_rate_limited(ip_h)
    assert limited is True
    assert "Too many requests" in reason

    reset_abuse_detector_for_testing()


# =============================================================
# 5. Batch QR Packaging & Printable Grid Tests
# =============================================================

def test_batch_qr_zip_export():
    sample_items = [
        {
            "verification_code": "7KX9-QM4P-82DZ",
            "verification_url": "https://sahm.edu/v/7KX9-QM4P-82DZ",
            "university_id": "20201015",
            "student_name": "محمد أحمد علي",
            "issued_at": "2026-09-22T10:00:00Z",
        },
        {
            "verification_code": "4WB2-NP7R-91KC",
            "verification_url": "https://sahm.edu/v/4WB2-NP7R-91KC",
            "university_id": "20201016",
            "student_name": "فاطمة إدريس حسن",
            "issued_at": "2026-09-22T10:00:00Z",
        },
    ]

    zip_bytes = create_batch_qr_zip(sample_items)
    assert len(zip_bytes) > 0

    # Verify contents of zip
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        names = zf.namelist()
        assert "manifest.json" in names
        assert any(n.startswith("qr_svg/") and n.endswith(".svg") for n in names)
        assert any(n.startswith("qr_png/") and n.endswith(".png") for n in names)


def test_printable_qr_sheet_html():
    sample_items = [
        {
            "verification_code": "7KX9-QM4P-82DZ",
            "verification_url": "https://sahm.edu/v/7KX9-QM4P-82DZ",
            "university_id": "20201015",
            "student_name": "محمد أحمد علي",
        }
    ]
    html = generate_printable_qr_sheet_html(sample_items)
    assert "<!DOCTYPE html>" in html
    assert "7KX9-QM4P-82DZ" in html
    assert "محمد أحمد علي" in html
    assert "qr-label" in html
    assert "data:image/" in html
