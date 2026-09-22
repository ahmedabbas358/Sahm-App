"""
Sahm Backend — Pydantic Schemas for College & Specialization
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# --- College ---

class CollegeCreate(BaseModel):
    name_ar: str
    name_en: Optional[str] = None
    code: str


class CollegeUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    code: Optional[str] = None


class CollegeResponse(BaseModel):
    id: uuid.UUID
    name_ar: str
    name_en: Optional[str]
    code: str
    created_at: datetime
    specializations: list["SpecializationResponse"] = []

    model_config = {"from_attributes": True}


# --- Specialization ---

class SpecializationCreate(BaseModel):
    name_ar: str
    name_en: Optional[str] = None
    code: str
    college_id: uuid.UUID


class SpecializationUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    code: Optional[str] = None


class SpecializationResponse(BaseModel):
    id: uuid.UUID
    name_ar: str
    name_en: Optional[str]
    code: str
    college_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
