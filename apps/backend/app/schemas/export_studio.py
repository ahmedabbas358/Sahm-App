"""
Sahm Backend — Export & Document Studio Schemas (Section 27)
Pydantic models for templates, validation reports, generation jobs, and verification.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.export_studio import ExportFormat, TemplateCategory, JobStatus
from app.services.export_validator import ValidationIssue


class TemplateColumn(BaseModel):
    key: str
    label: str
    width: Optional[float] = 20
    align: Optional[str] = "center"
    visible: bool = True


class PageConfig(BaseModel):
    size: str = "A4"
    orientation: str = "portrait"
    margins: Dict[str, float] = Field(default_factory=lambda: {"top": 15, "bottom": 15, "left": 15, "right": 15})
    rtl: bool = True


class LayoutConfig(BaseModel):
    header: Dict[str, Any] = Field(default_factory=dict)
    footer: Dict[str, Any] = Field(default_factory=dict)
    signatures: List[Dict[str, str]] = Field(default_factory=list)


class TableConfig(BaseModel):
    columns: List[TemplateColumn] = Field(default_factory=list)
    repeat_header_on_page: bool = True
    row_height: Optional[float] = 10
    header_bg_color: Optional[str] = "#1E293B"
    header_text_color: Optional[str] = "#FFFFFF"
    zebra_striping: bool = True
    prevent_row_split: bool = True


# --- Templates ---

class ExportTemplateCreate(BaseModel):
    name: str
    name_ar: str
    description: Optional[str] = None
    category: TemplateCategory = TemplateCategory.OFFICIAL_LIST
    default_format: ExportFormat = ExportFormat.PDF
    is_public_ready: bool = False
    page_config: PageConfig = Field(default_factory=PageConfig)
    layout_config: LayoutConfig = Field(default_factory=LayoutConfig)
    table_config: TableConfig = Field(default_factory=TableConfig)


class ExportTemplateUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TemplateCategory] = None
    default_format: Optional[ExportFormat] = None
    is_public_ready: Optional[bool] = None
    page_config: Optional[PageConfig] = None
    layout_config: Optional[LayoutConfig] = None
    table_config: Optional[TableConfig] = None
    change_reason: Optional[str] = None


class ExportTemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    name_ar: str
    description: Optional[str]
    category: TemplateCategory
    default_format: ExportFormat
    is_preset: bool
    is_public_ready: bool
    is_active: bool
    page_config: Dict[str, Any]
    layout_config: Dict[str, Any]
    table_config: Dict[str, Any]
    current_version: int
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateVersionResponse(BaseModel):
    id: uuid.UUID
    template_id: uuid.UUID
    version_number: int
    page_config: Dict[str, Any]
    layout_config: Dict[str, Any]
    table_config: Dict[str, Any]
    change_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Validation & Preview ---

class ValidateExportRequest(BaseModel):
    template_id: Optional[uuid.UUID] = None
    template_preset_id: Optional[str] = None
    batch_id: Optional[uuid.UUID] = None
    college_id: Optional[uuid.UUID] = None
    custom_template_config: Optional[Dict[str, Any]] = None
    is_public_publication: bool = False


class ValidateExportResponse(BaseModel):
    is_valid: bool
    ready_to_export: bool
    total_records: int
    passed_checks: List[str]
    errors: List[ValidationIssue]
    warnings: List[ValidationIssue]
    privacy_cleared: bool
    metadata: Dict[str, Any]


class PreviewExportRequest(BaseModel):
    template_id: Optional[uuid.UUID] = None
    template_preset_id: Optional[str] = None
    batch_id: Optional[uuid.UUID] = None
    custom_template_config: Optional[Dict[str, Any]] = None
    sample_size: int = 15


class PreviewExportResponse(BaseModel):
    html_preview: str
    total_records: int
    page_count_estimate: int
    validation: ValidateExportResponse


# --- Jobs & Generation ---

class GenerateExportRequest(BaseModel):
    template_id: Optional[uuid.UUID] = None
    template_preset_id: Optional[str] = "tpl-official-cert-list"
    format: ExportFormat = ExportFormat.PDF
    batch_id: Optional[uuid.UUID] = None
    college_id: Optional[uuid.UUID] = None
    custom_title: Optional[str] = None
    is_public_publication: bool = False
    custom_template_config: Optional[Dict[str, Any]] = None


class ExportJobResponse(BaseModel):
    id: uuid.UUID
    job_number: str
    template_id: uuid.UUID
    template_version: int
    format: ExportFormat
    status: JobStatus
    total_records: int
    processed_records: int
    progress_percent: int
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    artifact_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class GeneratedArtifactResponse(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    document_number: str
    title: str
    format: ExportFormat
    file_size_bytes: int
    file_hash_sha256: str
    verification_code: str
    verification_url: str
    version_number: int
    is_superseded: bool
    change_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Batch Export ---

class BatchExportRequest(BaseModel):
    batch_name: str
    college_ids: List[uuid.UUID]
    template_preset_id: str = "tpl-official-cert-list"
    format: ExportFormat = ExportFormat.PDF


class BatchExportResponse(BaseModel):
    batch_title: str
    total_requested: int
    total_successful: int
    total_failed: int
    total_records_exported: int
    download_url: str
    manifest: List[Dict[str, Any]]


# --- Public Verification ---

class PublicVerificationResponse(BaseModel):
    verification_code: str
    is_valid: bool
    status_label: str
    document_title: str
    issuing_institution: str
    faculty: str
    issue_date: str
    record_count: int
    verified_at: str
