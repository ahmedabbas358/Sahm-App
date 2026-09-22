"""
Sahm Backend — Pydantic Schemas for AI/OCR Governance & Control Plane (Prompt 19)
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.ai_governance import (
    ModelCapability,
    ModelStatus,
    PrivacyClassification,
    CostClass,
    DatasetClassification,
    FeedbackType,
    ErrorCategory,
    IncidentSeverity,
    IncidentStatus,
    ReprocessingStatus,
)


# ==========================================
# 1. Models & Registry Schemas
# ==========================================

class ModelRegisterRequest(BaseModel):
    name: str
    provider_id: str
    capability: ModelCapability
    version: str
    model_identifier: str
    model_type: str = "transformer"
    language_support: List[str] = ["ar"]
    document_support: List[str] = ["certificate"]
    privacy_classification: PrivacyClassification = PrivacyClassification.STRICT_LOCAL
    cost_class: CostClass = CostClass.FREE_LOCAL
    accuracy_profile: Optional[Dict[str, Any]] = None
    known_limitations: Optional[List[str]] = None


class ModelApprovalRequest(BaseModel):
    conditions: Optional[str] = None
    notes: Optional[str] = None
    expires_at: Optional[datetime] = None


class ModelRollbackRequest(BaseModel):
    target_version: str
    reason: str


class ModelResponse(BaseModel):
    id: uuid.UUID
    name: str
    provider_id: str
    capability: ModelCapability
    version: str
    model_identifier: str
    model_type: str
    language_support: List[str]
    document_support: List[str]
    status: ModelStatus
    privacy_classification: PrivacyClassification
    cost_class: CostClass
    accuracy_profile: Dict[str, Any]
    known_limitations: List[str]
    is_champion: bool
    released_at: Optional[datetime] = None
    deprecated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ModelListResponse(BaseModel):
    items: List[ModelResponse]
    total: int


# ==========================================
# 2. Evaluation & Benchmark Schemas
# ==========================================

class EvaluationRunRequest(BaseModel):
    dataset_id: uuid.UUID
    model_ids: List[uuid.UUID]


class EvaluationRunResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    model_id: uuid.UUID
    model_version: str
    metrics: Dict[str, Any]
    slice_breakdown: Dict[str, Any]
    passed_regression_gate: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ModelComparisonMatrix(BaseModel):
    dataset_name: str
    models: List[Dict[str, Any]]
    champion_model_id: Optional[str] = None


# ==========================================
# 3. Governance Policy Schemas
# ==========================================

class AIGovernancePolicyUpdateRequest(BaseModel):
    privacy_mode: Optional[PrivacyClassification] = None
    student_id_threshold: Optional[float] = None
    name_threshold: Optional[float] = None
    matching_threshold: Optional[float] = None
    max_allowed_false_positive_rate: Optional[float] = None
    routing_rules: Optional[List[Dict[str, Any]]] = None


class AIGovernancePolicyResponse(BaseModel):
    id: uuid.UUID
    institution_id: str
    privacy_mode: PrivacyClassification
    student_id_threshold: float
    name_threshold: float
    matching_threshold: float
    max_allowed_false_positive_rate: float
    routing_rules: List[Dict[str, Any]]
    policy_version: str
    last_simulated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PolicySimulationRequest(BaseModel):
    proposed_student_id_threshold: float
    proposed_name_threshold: float


class PolicySimulationResponse(BaseModel):
    baseline_review_rate: float
    projected_review_rate: float
    potential_risk_match_count: int
    review_minutes_saved_per_100: float


# ==========================================
# 4. Human Feedback & Error Heatmap Schemas
# ==========================================

class HumanFeedbackCreate(BaseModel):
    document_id: Optional[uuid.UUID] = None
    field_name: str
    ai_suggestion: str
    human_correction: str
    feedback_type: FeedbackType
    error_category: ErrorCategory
    root_cause: str = "ocr_issue"
    model_version_used: str


class HumanFeedbackResponse(BaseModel):
    id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    field_name: str
    ai_suggestion: str
    human_correction: str
    feedback_type: FeedbackType
    error_category: ErrorCategory
    root_cause: str
    model_version_used: str
    is_quarantined: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ErrorHeatmapResponse(BaseModel):
    fields: Dict[str, float]  # field -> error rate %
    slices: Dict[str, float]  # modality/slice -> error rate %
    root_causes: Dict[str, int]  # cause -> count


# ==========================================
# 5. Drift, Incidents & Health Schemas
# ==========================================

class DriftAlertResponse(BaseModel):
    id: uuid.UUID
    model_id: Optional[uuid.UUID] = None
    metric_name: str
    baseline_value: float
    observed_value: float
    threshold: float
    status: str
    severity: IncidentSeverity
    details: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AIIncidentCreate(BaseModel):
    title: str
    model_id: Optional[uuid.UUID] = None
    model_version: str
    severity: IncidentSeverity
    affected_batches: List[str] = []
    root_cause: Optional[str] = None
    mitigation: Optional[str] = None
    is_emergency_disabled: bool = False


class AIIncidentResponse(BaseModel):
    id: uuid.UUID
    incident_id: str
    title: str
    model_id: Optional[uuid.UUID] = None
    model_version: str
    severity: IncidentSeverity
    status: IncidentStatus
    affected_batches: List[str]
    root_cause: Optional[str] = None
    mitigation: Optional[str] = None
    is_emergency_disabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ReprocessingCampaignCreate(BaseModel):
    title: str
    source_model_version: str
    target_model_version: str
    affected_batch_ids: List[str]


class ReprocessingCampaignResponse(BaseModel):
    id: uuid.UUID
    campaign_id: str
    title: str
    source_model_version: str
    target_model_version: str
    affected_batch_ids: List[str]
    total_items: int
    processed_items: int
    status: ReprocessingStatus
    requires_human_selection: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AIHealthResponse(BaseModel):
    overall_status: str
    active_models_count: int
    champion_models: Dict[str, str]
    latency_p50_ms: int
    latency_p95_ms: int
    latency_p99_ms: int
    daily_spend_estimated_usd: float
    active_drift_alerts_count: int
    open_incidents_count: int
    quarantined_feedback_count: int
