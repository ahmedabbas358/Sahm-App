"""
Sahm Backend — Pydantic Schemas for Secure Share & Work Handoff (Prompt 22)
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from app.models.handoff import (
    HandoffType,
    HandoffStatus,
    TransferMethod,
    ShareRole,
    ConflictClass,
    MergeStrategy,
    DataClassification,
    DeviceTrustStatus,
)


class WorkHandoffCreateRequest(BaseModel):
    """Payload to initiate a new work handoff or share."""
    source_entity_type: str = Field("batch", description="Entity type being transferred")
    source_entity_id: str = Field(..., description="ID of the batch or review queue")
    target_user_id: Optional[uuid.UUID] = Field(None, description="Designated recipient user ID if known")
    target_device_id: Optional[str] = Field(None, description="Designated recipient device ID if direct")
    handoff_type: HandoffType = Field(HandoffType.CONTINUE_WORK_HANDOFF, description="Type of transfer")
    assigned_role: ShareRole = Field(ShareRole.REVIEWER, description="Role assigned to recipient")
    transfer_method: TransferMethod = Field(TransferMethod.CLOUD_STAGED, description="Network or file channel")
    data_classification: DataClassification = Field(DataClassification.RESTRICTED, description="Data sensitivity level")
    permission_scope: Dict[str, Any] = Field(default_factory=dict, description="Included/excluded capabilities")
    expiration_hours: int = Field(168, ge=1, le=720, description="Hours until handoff expires (default 7 days)")
    passcode: Optional[str] = Field(None, description="Optional one-time secret passcode")
    notes: Optional[str] = Field(None, description="Contextual note from sender")

    model_config = ConfigDict(from_attributes=True)


class WorkHandoffResponse(BaseModel):
    """Detailed summary of a created or inspected work handoff."""
    id: uuid.UUID
    tenant_id: str
    institution_id: str
    source_user_id: uuid.UUID
    target_user_id: Optional[uuid.UUID] = None
    handoff_type: HandoffType
    source_entity_type: str
    source_entity_id: str
    status: HandoffStatus
    assigned_role: ShareRole
    transfer_method: TransferMethod
    data_classification: DataClassification
    share_token: str
    pairing_phrase: Optional[str] = None
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_items: int = 0
    processed_items: int = 0
    needs_review_items: int = 0
    failed_items: int = 0
    pending_items: int = 0
    next_resume_item_index: int = 0
    payload_size_bytes: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoffPreviewResponse(BaseModel):
    """Sanitized recipient or sender preview highlighting scope and DLP summary."""
    handoff_id: str
    source_user_name: str
    target_user_name: Optional[str] = None
    source_batch_name: str
    handoff_type: HandoffType
    status: HandoffStatus
    total_items: int
    processed_items: int
    needs_review_items: int
    failed_items: int
    pending_items: int
    next_resume_index: int
    estimated_size_bytes: int
    included_capabilities: List[str]
    excluded_capabilities: List[str]
    pairing_phrase: Optional[str] = None
    dlp_status: str
    dlp_sensitive_fields_summary: Dict[str, int]
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoffAcceptRequest(BaseModel):
    """Recipient acceptance payload with optional mutual confirmation."""
    passcode: Optional[str] = None
    target_workspace_id: Optional[uuid.UUID] = None
    create_new_workspace: bool = True
    confirm_phrase: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HandoffAcceptResponse(BaseModel):
    """Response confirming handoff acceptance and immediate resume index."""
    handoff_id: uuid.UUID
    status: HandoffStatus
    accepted_at: datetime
    assigned_workspace_id: Optional[uuid.UUID] = None
    resume_item_index: int
    preserved_processed_count: int
    message: str

    model_config = ConfigDict(from_attributes=True)


class HandoffReconcileRequest(BaseModel):
    """Payload to resolve conflicts between incoming and existing workspaces."""
    strategy: MergeStrategy = Field(MergeStrategy.FIELD_LEVEL_MERGE)
    field_overrides: Optional[Dict[str, Any]] = None
    item_ids_to_skip: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)


class ConflictItemDetail(BaseModel):
    """Individual item conflict breakdown."""
    item_id: str
    conflict_class: ConflictClass
    field_name: str
    local_value: Any
    incoming_value: Any
    recommended_strategy: MergeStrategy


class HandoffReconcileResponse(BaseModel):
    """Outcome of conflict reconciliation."""
    handoff_id: uuid.UUID
    identical_items_count: int
    new_items_count: int
    conflicts_count: int
    resolved_count: int
    conflicts_detail: List[ConflictItemDetail] = []

    model_config = ConfigDict(from_attributes=True)


class ChunkUploadRequest(BaseModel):
    """Payload for uploading an individual 8MB package chunk."""
    chunk_index: int
    chunk_data_base64: str
    chunk_sha256: str

    model_config = ConfigDict(from_attributes=True)


class ChunkUploadResponse(BaseModel):
    """Chunk validation status and progress."""
    chunk_index: int
    is_verified: bool
    completed_chunks: int
    total_chunks: int
    progress_percentage: float


class DirectPairingRequest(BaseModel):
    """Direct device transfer pairing request."""
    target_device_fingerprint: str
    pairing_code: str


class DirectPairingResponse(BaseModel):
    """Session credentials for local direct transfer."""
    session_id: str
    pairing_phrase: str
    mutual_confirmed: bool
    transfer_channel: str


class HandoffHistoryItem(BaseModel):
    """Audit item representing a handoff event in chain of custody."""
    id: uuid.UUID
    event_type: str
    actor_user_id: Optional[uuid.UUID]
    timestamp: datetime
    payload_summary: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
