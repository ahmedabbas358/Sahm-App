"""
Sahm Backend — Pydantic Schemas for Student Record
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RecordCreate(BaseModel):
    batch_id: uuid.UUID
    student_name: str
    student_name_raw: Optional[str] = None
    university_id: Optional[str] = None
    status: str = "extracted"
    source_image_id: Optional[uuid.UUID] = None
    source_page: Optional[int] = None
    source_row: Optional[int] = None
    confidence_name: Optional[float] = None
    confidence_id: Optional[float] = None
    notes: Optional[str] = None


class RecordUpdate(BaseModel):
    student_name: Optional[str] = None
    university_id: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class RecordResponse(BaseModel):
    id: uuid.UUID
    batch_id: uuid.UUID
    student_name: str
    student_name_raw: Optional[str]
    university_id: Optional[str]
    status: str
    source_image_id: Optional[uuid.UUID]
    source_page: Optional[int]
    source_row: Optional[int]
    confidence_name: Optional[float]
    confidence_id: Optional[float]
    reviewed_by: Optional[uuid.UUID]
    approved_by: Optional[uuid.UUID]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RecordBulkCreate(BaseModel):
    """Create multiple records at once (e.g., from Excel import)."""
    records: list[RecordCreate]


class RecordListResponse(BaseModel):
    items: list[RecordResponse]
    total: int
    page: int
    page_size: int


class SearchRequest(BaseModel):
    q: Optional[str] = None
    college_id: Optional[uuid.UUID] = None
    specialization_id: Optional[uuid.UUID] = None
    batch_id: Optional[uuid.UUID] = None
    status: Optional[str] = None
    graduation_year: Optional[int] = None
    exact_match: bool = False
    page: int = 1
    page_size: int = 20
