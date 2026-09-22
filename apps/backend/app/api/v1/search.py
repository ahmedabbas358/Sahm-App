"""
Sahm Backend — Universal Search API
The most important feature: instant search across all authorized records.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.record import StudentRecord
from app.models.batch import Batch
from app.schemas.record import RecordResponse, RecordListResponse
from app.services.unified_search import (
    UnifiedSearchService,
    SearchScope,
    UnifiedSearchResponse,
)

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/unified", response_model=UnifiedSearchResponse)
async def unified_search(
    q: str = Query(..., min_length=1, description="Search query across all entities"),
    scope: SearchScope = Query(SearchScope.ALL, description="Entity scope to search"),
    limit: int = Query(30, ge=1, le=100, description="Max results to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Prompt 24: Institutional Unified Global Search
    Searches across Students, Batches, Certificates, Exports, and Verifications
    with Arabic normalization and strict authorization gating.
    """
    return await UnifiedSearchService.search(
        db=db,
        user=current_user,
        query=q,
        scope=scope,
        limit=limit,
    )



@router.get("", response_model=RecordListResponse)
async def universal_search(
    q: str = Query(None, min_length=1, description="Search query (name or ID)"),
    college_id: str = Query(None),
    specialization_id: str = Query(None),
    batch_id: str = Query(None),
    status: str = Query(None),
    graduation_year: int = Query(None),
    exact_match: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Universal search across all student records.

    Supports:
    - Search by name (partial or full)
    - Search by university ID (partial or full)
    - Filter by college, specialization, batch, status, year
    - Flexible matching (handles spaces and common Arabic variations)
    """
    query = select(StudentRecord)

    # Join with Batch if we need college/spec/year filters
    needs_batch_join = any([college_id, specialization_id, graduation_year])
    if needs_batch_join:
        query = query.join(Batch, StudentRecord.batch_id == Batch.id)

    # Text search
    if q:
        if exact_match:
            query = query.where(
                or_(
                    StudentRecord.student_name == q,
                    StudentRecord.university_id == q,
                )
            )
        else:
            # Flexible search: normalize Arabic text
            search_term = _normalize_arabic(q)
            query = query.where(
                or_(
                    func.replace(
                        func.replace(
                            func.lower(StudentRecord.student_name),
                            "أ", "ا"
                        ),
                        "إ", "ا"
                    ).contains(search_term),
                    func.lower(StudentRecord.student_name_raw).contains(
                        q.lower()
                    ),
                    StudentRecord.university_id.contains(q),
                )
            )

    # Filters
    if batch_id:
        query = query.where(StudentRecord.batch_id == batch_id)
    if status:
        query = query.where(StudentRecord.status == status)
    if college_id:
        query = query.where(Batch.college_id == college_id)
    if specialization_id:
        query = query.where(Batch.specialization_id == specialization_id)
    if graduation_year:
        query = query.where(Batch.graduation_year == graduation_year)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate & order
    query = query.order_by(StudentRecord.student_name)
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    records = result.scalars().all()

    return RecordListResponse(
        items=[RecordResponse.model_validate(r) for r in records],
        total=total,
        page=page,
        page_size=page_size,
    )


def _normalize_arabic(text: str) -> str:
    """
    Normalize Arabic text for flexible search.
    Handles common variations in hamza, alef, and whitespace.
    """
    text = text.lower().strip()
    # Normalize alef variants
    text = text.replace("أ", "ا")
    text = text.replace("إ", "ا")
    text = text.replace("آ", "ا")
    # Normalize taa marbuta
    text = text.replace("ة", "ه")
    # Normalize extra spaces
    text = " ".join(text.split())
    return text
