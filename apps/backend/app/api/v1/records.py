"""
Sahm Backend — Student Records API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.record import StudentRecord
from app.schemas.record import (
    RecordCreate,
    RecordUpdate,
    RecordResponse,
    RecordBulkCreate,
    RecordListResponse,
)

router = APIRouter(prefix="/records", tags=["Student Records"])


@router.get("", response_model=RecordListResponse)
async def list_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    batch_id: str = Query(None),
    status: str = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List student records with optional filters."""
    query = select(StudentRecord)

    if batch_id:
        query = query.where(StudentRecord.batch_id == batch_id)
    if status:
        query = query.where(StudentRecord.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.order_by(StudentRecord.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    records = result.scalars().all()

    return RecordListResponse(
        items=[RecordResponse.model_validate(r) for r in records],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=RecordResponse, status_code=201)
async def create_record(
    body: RecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new student record."""
    if current_user.role not in (
        UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER, UserRole.OPERATOR
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    record = StudentRecord(**body.model_dump())
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


@router.post("/bulk", response_model=list[RecordResponse], status_code=201)
async def create_records_bulk(
    body: RecordBulkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create multiple student records at once (Excel/CSV import)."""
    if current_user.role not in (
        UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER, UserRole.OPERATOR
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    created = []
    for record_data in body.records:
        record = StudentRecord(**record_data.model_dump())
        db.add(record)
        created.append(record)

    await db.flush()
    for record in created:
        await db.refresh(record)

    return created


@router.get("/{record_id}", response_model=RecordResponse)
async def get_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a student record by ID."""
    result = await db.execute(
        select(StudentRecord).where(StudentRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.patch("/{record_id}", response_model=RecordResponse)
async def update_record(
    record_id: str,
    body: RecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a student record."""
    if current_user.role not in (
        UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    result = await db.execute(
        select(StudentRecord).where(StudentRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    update_data = body.model_dump(exclude_unset=True)

    # Track who reviewed/approved
    if "status" in update_data:
        if update_data["status"] == "reviewed":
            record.reviewed_by = current_user.id
        elif update_data["status"] == "approved":
            if current_user.role not in (UserRole.ADMIN, UserRole.MANAGER):
                raise HTTPException(
                    status_code=403,
                    detail="Only managers can approve records"
                )
            record.approved_by = current_user.id

    for key, value in update_data.items():
        setattr(record, key, value)

    await db.flush()
    await db.refresh(record)
    return record
