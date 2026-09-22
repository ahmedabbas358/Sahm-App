"""
Sahm Backend — Pydantic Schemas for Secure Certificate Verification (Prompt 18)
Defines public and administrative request/response serialization models.
Guarantees strict separation between internal records and public projections.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.verification import (
    VerificationState,
    PublicVerificationResult,
    PrivacyProfile,
    DisplayNameMode,
    RevocationReason,
    PublicationStatus,
)


# ==========================================
# 1. Public Verification Schemas (Zero PII)
# ==========================================

class PublicVerificationLookupRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=64, description="Verification code e.g. 7KX9-QM4P-82DZ")
    secret: Optional[str] = Field(None, max_length=128, description="Optional authentication secret")


class PublicVerificationResponse(BaseModel):
    """Publicly safe projection. Never contains raw IDs, phones, or internal keys."""
    verification_code: str
    public_status: PublicVerificationResult
    institution_name: str
    institution_name_en: str
    faculty_name: str
    program_name: str
    certificate_type: str
    student_display_name: str
    graduation_year: Optional[int] = None
    issue_date_formatted: str
    verification_url: str
    is_revoked: bool = False
    revocation_notice: Optional[str] = None
    verified_at: str
    custom_metadata: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


# ==========================================
# 2. Administrative Management Schemas
# ==========================================

class VerificationIssueRequest(BaseModel):
    record_id: uuid.UUID
    privacy_profile: PrivacyProfile = PrivacyProfile.PUBLIC_STANDARD
    expires_at: Optional[datetime] = None


class BatchVerificationIssueRequest(BaseModel):
    batch_id: uuid.UUID
    privacy_profile: PrivacyProfile = PrivacyProfile.PUBLIC_STANDARD


class VerificationRevokeRequest(BaseModel):
    reason: RevocationReason
    reason_details: Optional[str] = None
    public_notice: Optional[str] = None


class VerificationReissueRequest(BaseModel):
    reason: RevocationReason = RevocationReason.REISSUED_CERTIFICATE
    new_record_id: Optional[uuid.UUID] = None
    reason_details: Optional[str] = None


class VerificationAdminResponse(BaseModel):
    id: uuid.UUID
    verification_code: str
    record_id: uuid.UUID
    batch_id: Optional[uuid.UUID] = None
    college_id: Optional[uuid.UUID] = None
    status: VerificationState
    publication_status: PublicationStatus
    privacy_profile: PrivacyProfile
    qr_code_url: str
    qr_code_svg: Optional[str] = None
    issued_at: datetime
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    verification_count: int
    revocation_reason: Optional[RevocationReason] = None
    revocation_notes: Optional[str] = None
    reissued_from_id: Optional[uuid.UUID] = None
    policy_version: str
    student_name: Optional[str] = None
    university_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VerificationAdminListResponse(BaseModel):
    items: List[VerificationAdminResponse]
    total: int
    page: int
    page_size: int


class PublicPolicyUpdateRequest(BaseModel):
    privacy_profile: Optional[PrivacyProfile] = None
    display_name_mode: Optional[DisplayNameMode] = None
    show_student_id: Optional[bool] = None
    show_program: Optional[bool] = None
    show_graduation_year: Optional[bool] = None
    show_honors: Optional[bool] = None


class PublicPolicyResponse(BaseModel):
    id: uuid.UUID
    institution_id: str
    privacy_profile: PrivacyProfile
    display_name_mode: DisplayNameMode
    show_student_id: bool
    show_program: bool
    show_graduation_year: bool
    show_honors: bool
    policy_version: str

    model_config = {"from_attributes": True}


class VerificationAnalyticsResponse(BaseModel):
    total_verifications: int
    active_count: int
    revoked_count: int
    expired_count: int
    total_scans_recorded: int
    suspicious_scans_blocked: int
