"""
Sahm Backend — Verification Services Package (Prompt 18)
"""
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

__all__ = [
    "generate_verification_code",
    "normalize_code",
    "extract_raw_token",
    "hash_secret",
    "verify_secret",
    "mask_student_name",
    "mask_university_id",
    "build_public_projection",
    "assert_no_sensitive_fields",
    "SecurityError",
    "build_verification_url",
    "generate_qr_svg",
    "generate_qr_png_bytes",
    "generate_qr_data_uri",
    "hash_client_ip",
    "is_rate_limited",
    "record_failed_attempt",
    "reset_abuse_detector_for_testing",
    "create_batch_qr_zip",
    "generate_printable_qr_sheet_html",
]
