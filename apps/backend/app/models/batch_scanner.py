"""
Sahm Backend — Smart Batch Certificate Scanner Models (Prompt 17)
Defines sessions, high-volume items, segments, missing student candidates,
and immutable review audits adhering to strict human-in-the-loop principles.
"""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, UUIDMixin, TimestampMixin


class BatchSessionStatus(str, enum.Enum):
    """Lifecycle state machine for a high-volume batch scan session."""
    DRAFT = "draft"
    READY = "ready"
    CAPTURING = "capturing"
    QUEUED = "queued"
    PROCESSING = "processing"
    PAUSED = "paused"
    NEEDS_ATTENTION = "needs_attention"
    COMPLETED = "completed"
    COMPLETED_WITH_WARNINGS = "completed_with_warnings"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"


class ItemProcessingState(str, enum.Enum):
    """Explicit lifecycle state machine for each certificate in a batch."""
    CAPTURED = "captured"
    QUEUED = "queued"
    PREPROCESSING = "preprocessing"
    READY_FOR_OCR = "ready_for_ocr"
    OCR_PROCESSING = "ocr_processing"
    EXTRACTION_COMPLETE = "extraction_complete"
    MATCHING = "matching"
    VALIDATING = "validating"
    COMPLETED = "completed"
    NEEDS_REVIEW = "needs_review"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"
    SKIPPED = "skipped"


class ProcessingMode(str, enum.Enum):
    """Batch performance/thoroughness execution profile."""
    FAST = "fast"
    BALANCED = "balanced"
    MAXIMUM_ACCURACY = "maximum_accuracy"
    OFFLINE_FIRST = "offline_first"


class BatchPriority(str, enum.Enum):
    """Execution priority in the bounded worker queue."""
    URGENT = "urgent"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


class QualityCategory(str, enum.Enum):
    """Heuristic visual clarity classification."""
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    UNUSABLE = "unusable"


class MatchStatus(str, enum.Enum):
    """Identity reconciliation confidence status."""
    EXACT = "exact"
    HIGH_CONFIDENCE = "high_confidence"
    POSSIBLE = "possible"
    NO_MATCH = "no_match"
    CONFLICT = "conflict"


class DuplicateStatus(str, enum.Enum):
    """Multi-tier duplicate detection state."""
    NO_DUPLICATE = "no_duplicate"
    POSSIBLE_DUPLICATE = "possible_duplicate"
    LIKELY_DUPLICATE = "likely_duplicate"


class CandidateResolutionStatus(str, enum.Enum):
    """Missing Student Candidate resolution lifecycle."""
    PENDING_REVIEW = "pending_review"
    ADDED_AS_STUDENT = "added_as_student"
    ATTACHED_TO_EXISTING = "attached_to_existing"
    DISCARDED = "discarded"


class BatchScanSession(Base, UUIDMixin, TimestampMixin):
    """
    Central batch scan session managing 10 to 500+ certificates.
    Tracks overall progress, versioning, parameters, and cryptographic fingerprint.
    """
    __tablename__ = "batch_scan_sessions"

    batch_code: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True, comment="e.g. IS-2026-CERT-01"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    college_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=True, index=True
    )
    specialization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("specializations.id"), nullable=True
    )
    batch_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2026)
    certificate_type: Mapped[str] = mapped_column(String(50), default="bachelor", nullable=False)

    # State & Modes
    status: Mapped[BatchSessionStatus] = mapped_column(
        Enum(BatchSessionStatus), default=BatchSessionStatus.DRAFT, nullable=False, index=True
    )
    processing_mode: Mapped[ProcessingMode] = mapped_column(
        Enum(ProcessingMode), default=ProcessingMode.BALANCED, nullable=False
    )
    priority: Mapped[BatchPriority] = mapped_column(
        Enum(BatchPriority), default=BatchPriority.NORMAL, nullable=False
    )

    # Item Counters
    expected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    actual_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    needs_review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duplicate_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    no_match_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Subsystem Versions (Audit Lineage)
    pipeline_version: Mapped[str] = mapped_column(String(20), default="2.0.0", nullable=False)
    ocr_version: Mapped[str] = mapped_column(String(20), default="2.1.0", nullable=False)
    matcher_version: Mapped[str] = mapped_column(String(20), default="1.5.0", nullable=False)
    normalization_version: Mapped[str] = mapped_column(String(20), default="1.2.0", nullable=False)

    # Checksum & Metadata
    batch_content_hash: Mapped[str] = mapped_column(String(64), nullable=True)
    device_id: Mapped[str] = mapped_column(String(100), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), default="camera", nullable=False)

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    college = relationship("College")
    specialization = relationship("Specialization")
    creator = relationship("User", foreign_keys=[created_by])
    items = relationship("BatchScanItem", back_populates="session", cascade="all, delete-orphan")


class BatchScanItem(Base, UUIDMixin, TimestampMixin):
    """
    Individual scanned certificate item inside a batch session.
    Tracks end-to-end evidence, image quality metrics, extracted OCR, and match candidate.
    """
    __tablename__ = "batch_scan_items"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_scan_sessions.id"), nullable=False, index=True
    )
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    client_item_id: Mapped[str] = mapped_column(String(100), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)

    # State Machine
    state: Mapped[ItemProcessingState] = mapped_column(
        Enum(ItemProcessingState), default=ItemProcessingState.CAPTURED, nullable=False, index=True
    )

    # Source & Storage
    source_image_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("source_images.id"), nullable=True
    )
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_path: Mapped[str] = mapped_column(String(500), nullable=True)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    p_hash: Mapped[str] = mapped_column(String(64), nullable=True, index=True)

    # Quality Engine Signals
    quality_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    quality_category: Mapped[QualityCategory] = mapped_column(
        Enum(QualityCategory), default=QualityCategory.ACCEPTABLE, nullable=False
    )
    quality_metrics: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "blur_score": 0.0,
            "brightness_score": 0.0,
            "contrast_score": 0.0,
            "glare_score": 0.0,
            "perspective_skew": 0.0,
            "recommendations": [],
        },
        nullable=False,
    )

    # Progressive OCR Extraction
    extracted_fields: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "student_name": "",
            "student_name_en": "",
            "university_id": "",
            "certificate_number": "",
            "graduation_year": "",
            "college": "",
            "department": "",
            "field_confidences": {},
        },
        nullable=False,
    )
    ocr_confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Identity Matching & Reconciliation
    match_status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus), default=MatchStatus.NO_MATCH, nullable=False, index=True
    )
    suggested_student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_records.id"), nullable=True
    )
    match_confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Anomaly & Duplicate Detection
    duplicate_status: Mapped[DuplicateStatus] = mapped_column(
        Enum(DuplicateStatus), default=DuplicateStatus.NO_DUPLICATE, nullable=False, index=True
    )
    duplicate_of_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_scan_items.id"), nullable=True
    )
    has_batch_mismatch: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_structural_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    anomaly_reasons: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)

    # Execution & Resilience
    error_code: Mapped[str] = mapped_column(String(50), nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)

    # Relationships
    session = relationship("BatchScanSession", back_populates="items")
    source_image = relationship("SourceImage")
    suggested_student = relationship("StudentRecord", foreign_keys=[suggested_student_id])
    candidate = relationship("MissingStudentCandidate", uselist=False, back_populates="item", cascade="all, delete-orphan")
    reviews = relationship("BatchScanReview", back_populates="item", cascade="all, delete-orphan")
    segments = relationship("BatchScanSegment", back_populates="item", cascade="all, delete-orphan")


class BatchScanSegment(Base, UUIDMixin):
    """Bounding box, polygon, and deskew angle for segmented certificate regions."""
    __tablename__ = "batch_scan_segments"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_scan_items.id"), nullable=False, index=True
    )
    segment_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bounding_box: Mapped[dict] = mapped_column(JSONB, nullable=False)
    polygon: Mapped[list] = mapped_column(JSONB, nullable=True)
    rotation_angle: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    cropped_image_path: Mapped[str] = mapped_column(String(500), nullable=True)

    item = relationship("BatchScanItem", back_populates="segments")


class MissingStudentCandidate(Base, UUIDMixin, TimestampMixin):
    """
    Candidate record generated when a scanned certificate does not match any existing student.
    Ensures humans decide whether to add as a new official student or attach to an alias.
    """
    __tablename__ = "missing_student_candidates"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_scan_items.id"), nullable=False, unique=True
    )
    extracted_name: Mapped[str] = mapped_column(String(500), nullable=False)
    extracted_id: Mapped[str] = mapped_column(String(50), nullable=True)
    certificate_number: Mapped[str] = mapped_column(String(100), nullable=True)
    program: Mapped[str] = mapped_column(String(255), nullable=True)
    college: Mapped[str] = mapped_column(String(255), nullable=True)
    batch_year: Mapped[int] = mapped_column(Integer, nullable=True)

    resolution_status: Mapped[CandidateResolutionStatus] = mapped_column(
        Enum(CandidateResolutionStatus), default=CandidateResolutionStatus.PENDING_REVIEW, nullable=False
    )
    resolved_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    resolution_notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_student_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_records.id"), nullable=True
    )

    item = relationship("BatchScanItem", back_populates="candidate")
    resolver = relationship("User", foreign_keys=[resolved_by])
    created_student_record = relationship("StudentRecord", foreign_keys=[created_student_record_id])


class BatchScanReview(Base, UUIDMixin, TimestampMixin):
    """
    Audit record of every human intervention, correction, and approval decision in a batch.
    Preserves before-and-after values for legal auditability.
    """
    __tablename__ = "batch_scan_reviews"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_scan_items.id"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    action: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="e.g. approve_match, correct_field, mark_duplicate, attach_student"
    )
    field_changes: Mapped[dict] = mapped_column(
        JSONB, default=dict, nullable=False, comment="{'before': ..., 'after': ...}"
    )
    reason: Mapped[str] = mapped_column(Text, nullable=True)

    item = relationship("BatchScanItem", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
