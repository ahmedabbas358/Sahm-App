"""
Sahm Backend — Pydantic Schemas for Batch
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BatchCreate(BaseModel):
    name: str
    college_id: uuid.UUID
    specialization_id: Optional[uuid.UUID] = None
    certificate_type: str
    graduation_year: int
    expected_count: Optional[int] = None
    notes: Optional[str] = None


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    expected_count: Optional[int] = None
    notes: Optional[str] = None


class BatchResponse(BaseModel):
    id: uuid.UUID
    name: str
    college_id: uuid.UUID
    specialization_id: Optional[uuid.UUID]
    certificate_type: str
    graduation_year: int
    status: str
    expected_count: Optional[int]
    notes: Optional[str]
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    record_count: int = 0

    model_config = {"from_attributes": True}


class BatchListResponse(BaseModel):
    items: list[BatchResponse]
    total: int
    page: int
    page_size: int
