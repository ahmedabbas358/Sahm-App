"""
Sahm Backend — Batch Scanner Pydantic Schemas (Prompt 17)
Defines validation and serialization models for sessions, items, candidates,
audits, and progress reports.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.batch_scanner import (
    BatchSessionStatus,
    ItemProcessingState,
    ProcessingMode,
    BatchPriority,
    QualityCategory,
    MatchStatus,
    DuplicateStatus,
    CandidateResolutionStatus,
)


# ==========================================
# Batch Scan Session Schemas
# ==========================================

class BatchScanSessionCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    batch_code: Optional[str] = None
    college_id: Optional[uuid.UUID] = None
    specialization_id: Optional[uuid.UUID] = None
    batch_year: int = Field(default=2026, ge=1990, le=2100)
    certificate_type: str = Field(default="bachelor")
    processing_mode: ProcessingMode = ProcessingMode.BALANCED
    priority: BatchPriority = BatchPriority.NORMAL
    expected_count: int = Field(default=0, ge=0)
    device_id: Optional[str] = None
    source_type: str = Field(default="camera")


class BatchScanSessionUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[BatchSessionStatus] = None
    priority: Optional[BatchPriority] = None
    processing_mode: Optional[ProcessingMode] = None


class BatchScanSessionResponse(BaseModel):
    id: uuid.UUID
    batch_code: str
    name: str
    college_id: Optional[uuid.UUID] = None
    specialization_id: Optional[uuid.UUID] = None
    batch_year: int
    certificate_type: str
    status: BatchSessionStatus
    processing_mode: ProcessingMode
    priority: BatchPriority
    expected_count: int
    actual_count: int
    processed_count: int
    completed_count: int
    needs_review_count: int
    failed_count: int
    duplicate_count: int
    no_match_count: int
    pipeline_version: str
    ocr_version: str
    matcher_version: str
    device_id: Optional[str] = None
    source_type: str
    created_by: uuid.UUID
    last_activity_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BatchScanSessionListResponse(BaseModel):
    items: List[BatchScanSessionResponse]
    total: int
    page: int
    page_size: int


class BatchScanSessionProgress(BaseModel):
    session_id: uuid.UUID
    status: BatchSessionStatus
    total_items: int
    processed_items: int
    completed_items: int
    needs_review_items: int
    failed_items: int
    progress_percentage: float
    is_paused: bool
    estimated_remaining_seconds: Optional[int] = None


# ==========================================
# Batch Scan Item Schemas
# ==========================================

class BatchScanItemCreate(BaseModel):
    client_item_id: str
    idempotency_key: str
    sequence_number: int
    image_path: str
    thumbnail_path: Optional[str] = None


class BatchManifestUpload(BaseModel):
    session_id: uuid.UUID
    items: List[BatchScanItemCreate]


class BatchScanItemResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    sequence_number: int
    client_item_id: str
    idempotency_key: str
    state: ItemProcessingState
    image_path: str
    thumbnail_path: Optional[str] = None
    sha256_hash: Optional[str] = None
    p_hash: Optional[str] = None
    quality_score: float
    quality_category: QualityCategory
    quality_metrics: Dict[str, Any]
    extracted_fields: Dict[str, Any]
    ocr_confidence: float
    match_status: MatchStatus
    suggested_student_id: Optional[uuid.UUID] = None
    match_confidence: float
    duplicate_status: DuplicateStatus
    duplicate_of_item_id: Optional[uuid.UUID] = None
    has_batch_mismatch: bool
    has_structural_anomaly: bool
    anomaly_reasons: List[str]
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    attempt_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BatchScanItemListResponse(BaseModel):
    items: List[BatchScanItemResponse]
    total: int
    page: int
    page_size: int


class BatchScanItemReviewRequest(BaseModel):
    action: str = Field(
        ...,
        description="Action type: approve_match, correct_field, mark_duplicate, attach_student, reject"
    )
    field_changes: Optional[Dict[str, Any]] = None
    target_student_id: Optional[uuid.UUID] = None
    reason: Optional[str] = None


# ==========================================
# Missing Student Candidate Schemas
# ==========================================

class MissingStudentCandidateResponse(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    extracted_name: str
    extracted_id: Optional[str] = None
    certificate_number: Optional[str] = None
    program: Optional[str] = None
    college: Optional[str] = None
    batch_year: Optional[int] = None
    resolution_status: CandidateResolutionStatus
    resolved_by: Optional[uuid.UUID] = None
    resolution_notes: Optional[str] = None
    created_student_record_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateResolutionRequest(BaseModel):
    action: CandidateResolutionStatus = Field(
        ...,
        description="added_as_student, attached_to_existing, or discarded"
    )
    target_student_id: Optional[uuid.UUID] = None
    resolution_notes: Optional[str] = None
    student_details: Optional[Dict[str, Any]] = None


# ==========================================
# Report Schemas
# ==========================================

class BatchReconciliationReportResponse(BaseModel):
    session_id: str
    batch_code: str
    name: str
    status: str
    batch_year: int
    total_certificates: int
    completed_count: int
    needs_review_count: int
    failed_count: int
    duplicate_count: int
    batch_mismatch_count: int
    structural_anomaly_count: int
    reconciliation_rate_percent: float
    average_quality_score: float
    average_ocr_confidence: float
    match_breakdown: Dict[str, int]
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
