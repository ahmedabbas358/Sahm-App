"""
Sahm Backend — AI/OCR Governance, Evaluation, Feedback & Drift Models (Prompt 19)
Implements:
- AIProviderConfig & AIModel: Multi-provider abstraction & immutable model registry.
- AIRun: Granular execution telemetry with cryptographic version fingerprints.
- EvaluationDataset, EvaluationSample & EvaluationRun: Gold benchmark integrity & metric testing.
- AIGovernancePolicy: Institutional privacy constraints, routing rules & risk-aware thresholds.
- HumanFeedback: Operator review corrections, error taxonomy & training quarantine.
- DriftAlert & AIIncident: Continuous statistical monitoring, emergency disable & rollback.
- ReprocessingCampaign: Controlled, side-by-side post-rollback record reprocessing.
"""
import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, UUIDMixin, TimestampMixin


class ModelCapability(str, enum.Enum):
    """Specific AI/ML capabilities managed by the Control Plane."""
    DOCUMENT_DETECTION = "document_detection"
    DOCUMENT_CLASSIFICATION = "document_classification"
    TEXT_OCR = "text_ocr"
    HANDWRITING_OCR = "handwriting_ocr"
    FIELD_EXTRACTION = "field_extraction"
    NAME_EXTRACTION = "name_extraction"
    ID_EXTRACTION = "id_extraction"
    CERTIFICATE_NUMBER_EXTRACTION = "certificate_number_extraction"
    TABLE_DETECTION = "table_detection"
    DUPLICATE_DETECTION = "duplicate_detection"
    IDENTITY_MATCHING = "identity_matching"
    ANOMALY_DETECTION = "anomaly_detection"


class ModelStatus(str, enum.Enum):
    """Lifecycle states for registered AI models."""
    DRAFT = "draft"
    EVALUATING = "evaluating"
    APPROVED = "approved"
    ACTIVE = "active"
    LIMITED = "limited"
    DEPRECATED = "deprecated"
    DISABLED = "disabled"
    RETIRED = "retired"


class PrivacyClassification(str, enum.Enum):
    """Institutional privacy constraints."""
    STRICT_LOCAL = "strict_local"                  # On-premise / edge processing only
    APPROVED_PROVIDERS_ONLY = "approved_providers"  # White-listed enterprise cloud
    STANDARD = "standard"


class CostClass(str, enum.Enum):
    """Economic cost class per operation."""
    FREE_LOCAL = "free_local"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DatasetClassification(str, enum.Enum):
    """Classification governing data sensitivity in test sets."""
    PUBLIC = "public"
    SYNTHETIC = "synthetic"
    INTERNAL_APPROVED = "internal_approved"
    RESTRICTED = "restricted"


class FeedbackType(str, enum.Enum):
    """Human review correction categorization."""
    CORRECT = "correct"
    MINOR_CORRECTION = "minor_correction"
    MAJOR_CORRECTION = "major_correction"
    WRONG_FIELD = "wrong_field"
    WRONG_MATCH = "wrong_match"
    MISSED_DUPLICATE = "missed_duplicate"
    FALSE_DUPLICATE = "false_duplicate"
    WRONG_CLASSIFICATION = "wrong_classification"
    UNUSABLE_OUTPUT = "unusable_output"


class ErrorCategory(str, enum.Enum):
    """Unified error taxonomy for root-cause diagnosis."""
    OCR_MISSING_CHARACTER = "ocr_missing_character"
    OCR_WRONG_CHARACTER = "ocr_wrong_character"
    OCR_WRONG_DIGIT = "ocr_wrong_digit"
    OCR_WRONG_ORDER = "ocr_wrong_order"
    OCR_LAYOUT_ERROR = "ocr_layout_error"
    FIELD_BOUNDARY_ERROR = "field_boundary_error"
    NAME_NORMALIZATION_ERROR = "name_normalization_error"
    ID_EXTRACTION_ERROR = "id_extraction_error"
    MATCH_FALSE_POSITIVE = "match_false_positive"
    MATCH_FALSE_NEGATIVE = "match_false_negative"
    DUPLICATE_FALSE_POSITIVE = "duplicate_false_positive"
    DUPLICATE_FALSE_NEGATIVE = "duplicate_false_negative"
    CLASSIFICATION_ERROR = "classification_error"
    QUALITY_MISCLASSIFICATION = "quality_misclassification"


class IncidentSeverity(str, enum.Enum):
    """Severity classification for model issues."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, enum.Enum):
    """State machine for AI incidents."""
    OPEN = "open"
    INVESTIGATING = "investigating"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ReprocessingStatus(str, enum.Enum):
    """Status of reprocessing campaigns after rollback."""
    PLANNED = "planned"
    APPROVED = "approved"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# =============================================================
# 1. Provider & Model Registry
# =============================================================

class AIProviderConfig(Base, UUIDMixin, TimestampMixin):
    """Registered AI/OCR providers with privacy and contract status."""
    __tablename__ = "ai_provider_configs"

    provider_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_type: Mapped[str] = mapped_column(String(50), default="local", nullable=False)  # local, self_hosted, cloud
    data_processing_location: Mapped[str] = mapped_column(String(100), default="on_premise", nullable=False)
    retention_policy: Mapped[str] = mapped_column(String(255), default="zero_retention", nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    allowed_data_classes: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    contract_status: Mapped[str] = mapped_column(String(100), default="active", nullable=False)


class AIModel(Base, UUIDMixin, TimestampMixin):
    """Authoritative AI model entity. Immutable post-release."""
    __tablename__ = "ai_models"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    capability: Mapped[ModelCapability] = mapped_column(Enum(ModelCapability), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # e.g. v1.0.0, v2.1.0
    model_identifier: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    model_type: Mapped[str] = mapped_column(String(100), default="transformer", nullable=False)
    language_support: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # ["ar", "en"]
    document_support: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # ["certificate", "transcript"]
    status: Mapped[ModelStatus] = mapped_column(Enum(ModelStatus), default=ModelStatus.DRAFT, nullable=False, index=True)
    privacy_classification: Mapped[PrivacyClassification] = mapped_column(
        Enum(PrivacyClassification), default=PrivacyClassification.STRICT_LOCAL, nullable=False
    )
    cost_class: Mapped[CostClass] = mapped_column(Enum(CostClass), default=CostClass.FREE_LOCAL, nullable=False)
    accuracy_profile: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    known_limitations: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    is_champion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    deprecated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class AIRun(Base, UUIDMixin):
    """Single execution telemetry recording full provenance and privacy version."""
    __tablename__ = "ai_runs"

    job_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    batch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    capability: Mapped[ModelCapability] = mapped_column(Enum(ModelCapability), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    pipeline_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    finished_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    input_hash: Mapped[str] = mapped_column(String(64), nullable=False, comment="SHA-256 of document image")
    output_hash: Mapped[str] = mapped_column(String(64), nullable=False, comment="SHA-256 of raw JSON output")
    status: Mapped[str] = mapped_column(String(50), default="success", nullable=False)
    error_code: Mapped[str] = mapped_column(String(100), nullable=True)
    cost_units: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    privacy_policy_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)


# =============================================================
# 2. Evaluation Datasets & Benchmarks
# =============================================================

class EvaluationDataset(Base, UUIDMixin, TimestampMixin):
    """Gold evaluation benchmark collections."""
    __tablename__ = "ai_evaluation_datasets"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    data_classification: Mapped[DatasetClassification] = mapped_column(
        Enum(DatasetClassification), default=DatasetClassification.SYNTHETIC, nullable=False
    )
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    capability: Mapped[ModelCapability] = mapped_column(Enum(ModelCapability), nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    samples = relationship("EvaluationSample", back_populates="dataset", cascade="all, delete-orphan")


class EvaluationSample(Base, UUIDMixin, TimestampMixin):
    """Ground truth gold label item within an evaluation dataset."""
    __tablename__ = "ai_evaluation_samples"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_evaluation_datasets.id"), nullable=False, index=True
    )
    sample_identifier: Mapped[str] = mapped_column(String(100), nullable=False)
    expected_text: Mapped[str] = mapped_column(Text, nullable=False)
    expected_fields: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    difficulty_slice: Mapped[str] = mapped_column(String(100), default="general", nullable=False)
    label_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)
    labeled_by: Mapped[str] = mapped_column(String(100), default="system_gold", nullable=False)

    dataset = relationship("EvaluationDataset", back_populates="samples")


class EvaluationRun(Base, UUIDMixin, TimestampMixin):
    """Recorded benchmark run testing a model against an evaluation dataset."""
    __tablename__ = "ai_evaluation_runs"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_evaluation_datasets.id"), nullable=False, index=True
    )
    model_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False, index=True
    )
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    metrics: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)  # CER, WER, exact_match, etc.
    slice_breakdown: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    passed_regression_gate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# =============================================================
# 3. Governance Policy & Routing Rules
# =============================================================

class AIGovernancePolicy(Base, UUIDMixin, TimestampMixin):
    """Institutional rules governing privacy, routing, and risk-aware thresholds."""
    __tablename__ = "ai_governance_policies"

    institution_id: Mapped[str] = mapped_column(String(100), default="default", unique=True, nullable=False)
    privacy_mode: Mapped[PrivacyClassification] = mapped_column(
        Enum(PrivacyClassification), default=PrivacyClassification.STRICT_LOCAL, nullable=False
    )
    student_id_threshold: Mapped[float] = mapped_column(Float, default=0.98, nullable=False)
    name_threshold: Mapped[float] = mapped_column(Float, default=0.90, nullable=False)
    matching_threshold: Mapped[float] = mapped_column(Float, default=0.92, nullable=False)
    max_allowed_false_positive_rate: Mapped[float] = mapped_column(Float, default=0.0005, nullable=False)
    routing_rules: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    policy_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    last_simulated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


# =============================================================
# 4. Human Feedback & Drift
# =============================================================

class HumanFeedback(Base, UUIDMixin, TimestampMixin):
    """Quarantined human reviewer corrections and error taxonomy diagnostics."""
    __tablename__ = "ai_human_feedback"

    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    ai_suggestion: Mapped[str] = mapped_column(Text, nullable=False)
    human_correction: Mapped[str] = mapped_column(Text, nullable=False)
    feedback_type: Mapped[FeedbackType] = mapped_column(Enum(FeedbackType), nullable=False, index=True)
    error_category: Mapped[ErrorCategory] = mapped_column(Enum(ErrorCategory), nullable=False, index=True)
    root_cause: Mapped[str] = mapped_column(String(100), default="ocr_issue", nullable=False)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    model_version_used: Mapped[str] = mapped_column(String(50), nullable=False)
    is_quarantined: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    approved_for_evaluation: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class DriftAlert(Base, UUIDMixin, TimestampMixin):
    """Statistical model, data, or template drift alerts."""
    __tablename__ = "ai_drift_alerts"

    model_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    baseline_value: Mapped[float] = mapped_column(Float, nullable=False)
    observed_value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    severity: Mapped[IncidentSeverity] = mapped_column(Enum(IncidentSeverity), default=IncidentSeverity.HIGH, nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=True)


class AIIncident(Base, UUIDMixin, TimestampMixin):
    """Audited incident management for AI models."""
    __tablename__ = "ai_incidents"

    incident_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    model_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[IncidentSeverity] = mapped_column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM, nullable=False)
    status: Mapped[IncidentStatus] = mapped_column(Enum(IncidentStatus), default=IncidentStatus.OPEN, nullable=False)
    affected_batches: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    root_cause: Mapped[str] = mapped_column(Text, nullable=True)
    mitigation: Mapped[str] = mapped_column(Text, nullable=True)
    is_emergency_disabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class ReprocessingCampaign(Base, UUIDMixin, TimestampMixin):
    """Controlled reprocessing of historical batches affected by disabled model/incident."""
    __tablename__ = "ai_reprocessing_campaigns"

    campaign_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    target_model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    affected_batch_ids: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    total_items: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_items: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[ReprocessingStatus] = mapped_column(Enum(ReprocessingStatus), default=ReprocessingStatus.PLANNED, nullable=False)
    requires_human_selection: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
