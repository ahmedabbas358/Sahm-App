"""
Sahm Backend — Batches API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.batch import Batch
from app.models.record import StudentRecord
from app.schemas.batch import (
    BatchCreate,
    BatchUpdate,
    BatchResponse,
    BatchListResponse,
)

router = APIRouter(prefix="/batches", tags=["Batches"])


@router.get("", response_model=BatchListResponse)
async def list_batches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    college_id: str = Query(None),
    status: str = Query(None),
    graduation_year: int = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List batches with optional filters and pagination."""
    query = select(Batch)

    if college_id:
        query = query.where(Batch.college_id == college_id)
    if status:
        query = query.where(Batch.status == status)
    if graduation_year:
        query = query.where(Batch.graduation_year == graduation_year)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.order_by(Batch.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    batches = result.scalars().all()

    # Add record count to each batch
    items = []
    for batch in batches:
        count_result = await db.execute(
            select(func.count()).where(StudentRecord.batch_id == batch.id)
        )
        record_count = count_result.scalar()
        batch_dict = BatchResponse.model_validate(batch).model_dump()
        batch_dict["record_count"] = record_count
        items.append(BatchResponse(**batch_dict))

    return BatchListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=BatchResponse, status_code=201)
async def create_batch(
    body: BatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new batch."""
    if current_user.role not in (
        UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER, UserRole.OPERATOR
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    batch = Batch(
        **body.model_dump(),
        created_by=current_user.id,
    )
    db.add(batch)
    await db.flush()
    await db.refresh(batch)

    response = BatchResponse.model_validate(batch)
    response.record_count = 0
    return response


@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch(
    batch_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a batch by ID."""
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    count_result = await db.execute(
        select(func.count()).where(StudentRecord.batch_id == batch.id)
    )
    record_count = count_result.scalar()

    response = BatchResponse.model_validate(batch)
    response.record_count = record_count
    return response


@router.patch("/{batch_id}", response_model=BatchResponse)
async def update_batch(
    batch_id: str,
    body: BatchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a batch."""
    if current_user.role not in (
        UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(batch, key, value)

    await db.flush()
    await db.refresh(batch)

    count_result = await db.execute(
        select(func.count()).where(StudentRecord.batch_id == batch.id)
    )
    response = BatchResponse.model_validate(batch)
    response.record_count = count_result.scalar()
    return response
