"""
Sahm Backend — Colleges & Specializations API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.college import College, Specialization
from app.schemas.college import (
    CollegeCreate,
    CollegeUpdate,
    CollegeResponse,
    SpecializationCreate,
    SpecializationUpdate,
    SpecializationResponse,
)

router = APIRouter(prefix="/colleges", tags=["Colleges"])


@router.get("", response_model=list[CollegeResponse])
async def list_colleges(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all colleges with their specializations."""
    result = await db.execute(
        select(College).order_by(College.name_ar)
    )
    return result.scalars().all()


@router.post("", response_model=CollegeResponse, status_code=201)
async def create_college(
    body: CollegeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new college. Admin or Manager only."""
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check for duplicate code
    existing = await db.execute(
        select(College).where(College.code == body.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="College code already exists")

    college = College(**body.model_dump())
    db.add(college)
    await db.flush()
    await db.refresh(college)
    return college


@router.get("/{college_id}", response_model=CollegeResponse)
async def get_college(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a college by ID."""
    result = await db.execute(select(College).where(College.id == college_id))
    college = result.scalar_one_or_none()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college


@router.patch("/{college_id}", response_model=CollegeResponse)
async def update_college(
    college_id: str,
    body: CollegeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a college. Admin or Manager only."""
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    result = await db.execute(select(College).where(College.id == college_id))
    college = result.scalar_one_or_none()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(college, key, value)

    await db.flush()
    await db.refresh(college)
    return college


# --- Specializations ---

@router.get("/{college_id}/specializations", response_model=list[SpecializationResponse])
async def list_specializations(
    college_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List specializations for a college."""
    result = await db.execute(
        select(Specialization)
        .where(Specialization.college_id == college_id)
        .order_by(Specialization.name_ar)
    )
    return result.scalars().all()


@router.post(
    "/{college_id}/specializations",
    response_model=SpecializationResponse,
    status_code=201,
)
async def create_specialization(
    college_id: str,
    body: SpecializationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new specialization. Admin or Manager only."""
    if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Verify college exists
    college_result = await db.execute(
        select(College).where(College.id == college_id)
    )
    if not college_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="College not found")

    spec = Specialization(
        **body.model_dump(),
    )
    # Override college_id to match the URL path
    spec.college_id = college_id
    db.add(spec)
    await db.flush()
    await db.refresh(spec)
    return spec
