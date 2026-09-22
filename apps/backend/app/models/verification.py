"""
Sahm Backend — Secure Certificate Verification & Public Portal Models (Prompt 18)
Implements:
- CertificateVerification: Authoritative verification identity decoupled from student records.
- VerificationPublicView: Server-side projection strictly limiting public exposure.
- PublicVerificationPolicy: Policy rules governing allowed fields, masking, and display modes.
- VerificationEvent: Immutable security audit log for all verification actions.
- VerificationAccessLog: Privacy-preserving operational access telemetry.
"""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, UUIDMixin, TimestampMixin


class VerificationState(str, enum.Enum):
    """Internal authoritative verification lifecycle status."""
    NOT_ISSUED = "not_issued"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    EXPIRED = "expired"
    REPLACED = "replaced"
    CANCELLED = "cancelled"


class PublicVerificationResult(str, enum.Enum):
    """Public presentation statuses shown on verification portals."""
    VERIFIED = "verified"
    VERIFIED_WITH_LIMITED_PUBLIC_DATA = "verified_with_limited_public_data"
    REVOKED = "revoked"
    EXPIRED = "expired"
    NOT_FOUND = "not_found"
    TEMPORARILY_UNAVAILABLE = "temporarily_unavailable"


class PrivacyProfile(str, enum.Enum):
    """Institution privacy profiles defining disclosure scope."""
    PUBLIC_MINIMAL = "public_minimal"
    PUBLIC_STANDARD = "public_standard"
    PUBLIC_EXTENDED = "public_extended"
    INTERNAL_ONLY = "internal_only"


class DisplayNameMode(str, enum.Enum):
    """Graduate name abbreviation options to respect privacy."""
    FULL = "full"
    ABBREVIATED_MIDDLE = "abbreviated_middle"
    FIRST_LAST_ONLY = "first_last_only"
    INITIALS = "initials"


class RevocationReason(str, enum.Enum):
    """Audited rationale for certificate revocation."""
    ADMINISTRATIVE_CORRECTION = "administrative_correction"
    REISSUED_CERTIFICATE = "reissued_certificate"
    DUPLICATE_ISSUANCE = "duplicate_issuance"
    RECORD_CORRECTION = "record_correction"
    ADMINISTRATIVE_CANCELLATION = "administrative_cancellation"
    OTHER = "other"


class PublicationStatus(str, enum.Enum):
    """Publication lifecycle distinct from certificate approval."""
    DRAFT = "draft"
    APPROVED = "approved"
    PUBLISHED = "published"
    UNPUBLISHED = "unpublished"
    REVOKED = "revoked"


class CertificateVerification(Base, UUIDMixin, TimestampMixin):
    """
    Central authoritative verification identity for an official certificate.
    Uses high-entropy, opaque public verification code.
    """
    __tablename__ = "certificate_verifications"

    verification_code: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True, comment="e.g. 7KX9-QM4P-82DZ"
    )
    record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_records.id"), nullable=False, index=True
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batches.id"), nullable=True, index=True
    )
    college_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=True, index=True
    )

    # State & Visibility
    status: Mapped[VerificationState] = mapped_column(
        Enum(VerificationState), default=VerificationState.ACTIVE, nullable=False, index=True
    )
    publication_status: Mapped[PublicationStatus] = mapped_column(
        Enum(PublicationStatus), default=PublicationStatus.PUBLISHED, nullable=False, index=True
    )
    privacy_profile: Mapped[PrivacyProfile] = mapped_column(
        Enum(PrivacyProfile), default=PrivacyProfile.PUBLIC_STANDARD, nullable=False
    )

    # Security & QR
    verification_secret_hash: Mapped[str] = mapped_column(
        String(64), nullable=True, comment="Optional SHA-256 secret for sensitive actions"
    )
    qr_code_svg: Mapped[str] = mapped_column(Text, nullable=True)
    qr_code_url: Mapped[str] = mapped_column(String(500), nullable=False)

    # Lifecycle Timestamps
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    verification_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Revocation & Reissue Lineage
    revocation_reason: Mapped[RevocationReason] = mapped_column(
        Enum(RevocationReason), nullable=True
    )
    revocation_notes: Mapped[str] = mapped_column(Text, nullable=True)
    reissued_from_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("certificate_verifications.id"), nullable=True
    )
    policy_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Relationships
    student_record = relationship("StudentRecord")
    batch = relationship("Batch")
    college = relationship("College")
    public_view = relationship("VerificationPublicView", uselist=False, back_populates="verification", cascade="all, delete-orphan")
    events = relationship("VerificationEvent", back_populates="verification", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    predecessor = relationship("CertificateVerification", remote_side="CertificateVerification.id")


class VerificationPublicView(Base, UUIDMixin, TimestampMixin):
    """
    Materialized server-side public projection for certificate verification.
    NEVER contains raw student IDs, phone numbers, emails, or internal database keys.
    """
    __tablename__ = "verification_public_views"

    verification_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("certificate_verifications.id"), nullable=False, unique=True, index=True
    )
    verification_code: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    public_status: Mapped[PublicVerificationResult] = mapped_column(
        Enum(PublicVerificationResult), default=PublicVerificationResult.VERIFIED, nullable=False
    )

    # Institutional Metadata
    institution_name: Mapped[str] = mapped_column(String(255), default="جامعة إفريقيا العالمية", nullable=False)
    institution_name_en: Mapped[str] = mapped_column(String(255), default="International University of Africa", nullable=False)
    faculty_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    program_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    certificate_type: Mapped[str] = mapped_column(String(100), default="بكالوريوس", nullable=False)

    # Policy-Sanitized Student Details
    student_display_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=True)
    issue_date_formatted: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    verification_url: Mapped[str] = mapped_column(String(500), nullable=False)

    # Revocation Transparency
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revocation_public_notice: Mapped[str] = mapped_column(String(500), nullable=True)

    # Custom Authorized Public Metadata
    custom_public_metadata: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    verification = relationship("CertificateVerification", back_populates="public_view")


class PublicVerificationPolicy(Base, UUIDMixin, TimestampMixin):
    """
    Configurable institutional policy governing which fields are projected publicly.
    """
    __tablename__ = "public_verification_policies"

    institution_id: Mapped[str] = mapped_column(String(100), default="default", unique=True, nullable=False)
    privacy_profile: Mapped[PrivacyProfile] = mapped_column(
        Enum(PrivacyProfile), default=PrivacyProfile.PUBLIC_STANDARD, nullable=False
    )
    display_name_mode: Mapped[DisplayNameMode] = mapped_column(
        Enum(DisplayNameMode), default=DisplayNameMode.FULL, nullable=False
    )
    show_student_id: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_program: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_graduation_year: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_honors: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    allowed_fields: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    masked_fields: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    policy_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)


class VerificationEvent(Base, UUIDMixin, TimestampMixin):
    """
    Immutable audit trail for all verification actions.
    """
    __tablename__ = "verification_events"

    verification_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("certificate_verifications.id"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="e.g. VerificationIssued, VerificationViewed, VerificationRevoked"
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    ip_hash: Mapped[str] = mapped_column(String(64), nullable=True, comment="Pseudonymized IP for privacy")
    user_agent: Mapped[str] = mapped_column(String(255), nullable=True)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    verification = relationship("CertificateVerification", back_populates="events")
    actor = relationship("User", foreign_keys=[actor_id])


class VerificationAccessLog(Base, UUIDMixin):
    """
    Privacy-preserving operational access telemetry for abuse detection and analytics.
    """
    __tablename__ = "verification_access_logs"

    verification_code_requested: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    was_successful: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    http_status: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    ip_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    user_agent: Mapped[str] = mapped_column(String(255), nullable=True)
