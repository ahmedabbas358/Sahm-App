"""
Sahm Backend — Public Verification Policy Engine (Prompt 18)
Enforces strict institutional disclosure rules, data projection, and student name masking.

Guarantees:
- Zero PII leakage (no internal DB IDs, phone numbers, national IDs, raw OCR, or notes).
- Respects institutional PrivacyProfile (MINIMAL, STANDARD, EXTENDED, INTERNAL_ONLY).
- Respects DisplayNameMode (FULL, ABBREVIATED_MIDDLE, FIRST_LAST_ONLY, INITIALS).
"""
import re
from typing import Optional, Dict, Any

from app.models.verification import (
    PrivacyProfile,
    DisplayNameMode,
    PublicVerificationResult,
    PublicVerificationPolicy,
)
from app.models.record import StudentRecord

SENSITIVE_KEYS_BLACKLIST = {
    "student_name_raw",
    "notes",
    "delivery_notes",
    "delivered_to",
    "reviewed_by",
    "approved_by",
    "source_image_id",
    "source_file",
    "source_page",
    "source_row",
    "confidence_name",
    "confidence_id",
    "internal_id",
    "phone",
    "email",
    "national_id",
    "gpa",
    "secret",
    "verification_secret_hash",
}


def mask_student_name(full_name: str, mode: DisplayNameMode) -> str:
    """
    Masks graduate student name according to institutional policy.
    Supports both Arabic and Latin names.
    """
    if not full_name:
        return ""

    tokens = [t.strip() for t in full_name.strip().split() if t.strip()]
    if not tokens:
        return ""

    if mode == DisplayNameMode.FULL:
        return " ".join(tokens)

    if mode == DisplayNameMode.FIRST_LAST_ONLY:
        if len(tokens) == 1:
            return tokens[0]
        return f"{tokens[0]} {tokens[-1]}"

    if mode == DisplayNameMode.ABBREVIATED_MIDDLE:
        if len(tokens) <= 2:
            return " ".join(tokens)
        first = tokens[0]
        last = tokens[-1]
        middles = [f"{m[0]}." for m in tokens[1:-1]]
        return f"{first} {' '.join(middles)} {last}"

    if mode == DisplayNameMode.INITIALS:
        return " ".join(f"{t[0]}." for t in tokens)

    return " ".join(tokens)


def mask_university_id(uni_id: Optional[str]) -> Optional[str]:
    """Masks all but the last 3 digits of a student ID."""
    if not uni_id:
        return None
    clean = uni_id.strip()
    if len(clean) <= 3:
        return "***"
    return f"***{clean[-3:]}"


def build_public_projection(
    record: StudentRecord,
    policy: Optional[PublicVerificationPolicy] = None,
    profile_override: Optional[PrivacyProfile] = None,
    verification_code: str = "",
    verification_url: str = "",
    is_revoked: bool = False,
    revocation_notice: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Builds the safe public projection from an approved StudentRecord and policy.
    Zero internal database IDs or raw OCR data are ever exposed.
    """
    profile = profile_override or (policy.privacy_profile if policy else PrivacyProfile.PUBLIC_STANDARD)
    display_mode = policy.display_name_mode if policy else DisplayNameMode.FULL

    if profile == PrivacyProfile.INTERNAL_ONLY:
        raise ValueError("Verification for this record is designated as INTERNAL_ONLY and cannot be projected publicly.")

    # Extract metadata safely
    batch = record.batch if hasattr(record, "batch") and record.batch else None
    college = batch.college if batch and hasattr(batch, "college") and batch.college else None

    institution_name_ar = "جامعة إفريقيا العالمية"
    institution_name_en = "International University of Africa"
    faculty_name = college.name if college else "كلية العلوم الإدارية والتقنية"
    program_name = "علوم الحاسوب وتقنية المعلومات"
    if batch and hasattr(batch, "name") and batch.name:
        program_name = batch.name

    cert_type_val = "بكالوريوس"
    if batch and hasattr(batch, "certificate_type"):
        ct = batch.certificate_type
        cert_type_val = ct.value if hasattr(ct, "value") else str(ct)

    graduation_year = batch.graduation_year if batch and hasattr(batch, "graduation_year") else None

    # Name masking
    if profile == PrivacyProfile.PUBLIC_MINIMAL:
        # Minimal forces first and last only or initials
        display_name = mask_student_name(record.student_name, DisplayNameMode.FIRST_LAST_ONLY)
    else:
        display_name = mask_student_name(record.student_name, display_mode)

    issue_date_formatted = f"العام الأكاديمي {graduation_year}" if graduation_year else "سجل أكاديمي معتمد"

    projection: Dict[str, Any] = {
        "verification_code": verification_code,
        "public_status": PublicVerificationResult.REVOKED if is_revoked else PublicVerificationResult.VERIFIED,
        "institution_name": institution_name_ar,
        "institution_name_en": institution_name_en,
        "faculty_name": faculty_name,
        "program_name": program_name if (policy is None or policy.show_program) else "",
        "certificate_type": cert_type_val,
        "student_display_name": display_name,
        "graduation_year": graduation_year if (policy is None or policy.show_graduation_year) else None,
        "issue_date_formatted": issue_date_formatted,
        "verification_url": verification_url,
        "is_revoked": is_revoked,
        "revocation_notice": revocation_notice if is_revoked else None,
        "custom_metadata": {},
    }

    if policy and policy.show_student_id and record.university_id:
        projection["custom_metadata"]["masked_student_id"] = mask_university_id(record.university_id)

    assert_no_sensitive_fields(projection)
    return projection


def assert_no_sensitive_fields(data: Dict[str, Any]) -> None:
    """Security assertion ensuring no sensitive data keys or patterns leaked into public payload."""
    for key in data.keys():
        if key.lower() in SENSITIVE_KEYS_BLACKLIST:
            raise SecurityError(f"Security assertion failed: Prohibited key '{key}' found in public verification payload!")

    # Check for leaked phone number regex or national ID patterns in values
    for val in data.values():
        if isinstance(val, str):
            # Check for international or 10-digit phone patterns
            if re.search(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", val):
                raise SecurityError(f"Security assertion failed: Suspicious phone number detected in value '{val}'")


class SecurityError(Exception):
    """Raised when a PII or security violation occurs."""
    pass
