"""
Sahm Backend — Smart Batch Certificate Scanner API Routes (Prompt 17)
Provides comprehensive endpoints for:
- Batch Session lifecycle (start, pause, resume, progress, report)
- Manifest upload & continuous item ingestion
- Real-time progress monitoring & quality telemetry
- Bucket filtering (Needs Review, Duplicates, Mismatches, Failed, Completed)
- Human review workspace actions (field correction, match approval)
- Missing Student Candidate isolation & explicit resolution
- Excel-compatible UTF-8 BOM CSV export
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.record import StudentRecord, CertificateStatus
from app.models.batch_scanner import (
    BatchScanSession,
    BatchScanItem,
    MissingStudentCandidate,
    BatchScanReview,
    BatchSessionStatus,
    ItemProcessingState,
    QualityCategory,
    MatchStatus,
    DuplicateStatus,
    CandidateResolutionStatus,
)
from app.schemas.batch_scanner import (
    BatchScanSessionCreate,
    BatchScanSessionUpdate,
    BatchScanSessionResponse,
    BatchScanSessionListResponse,
    BatchScanSessionProgress,
    BatchScanItemCreate,
    BatchManifestUpload,
    BatchScanItemResponse,
    BatchScanItemListResponse,
    BatchScanItemReviewRequest,
    MissingStudentCandidateResponse,
    CandidateResolutionRequest,
    BatchReconciliationReportResponse,
)
from app.services.batch_scanner.queue_manager import BatchQueueManager
from app.services.batch_scanner.report_generator import BatchReportGenerator

router = APIRouter(prefix="/batch-scanner", tags=["Batch Certificate Scanner"])


# =====================================================================
# 1. Session Management
# =====================================================================

@router.post("/sessions", response_model=BatchScanSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: BatchScanSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new high-volume batch scan session."""
    batch_code = data.batch_code
    if not batch_code:
        now_str = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")
        random_suffix = str(uuid.uuid4())[:4].upper()
        batch_code = f"BATCH-{now_str}-{random_suffix}"

    session = BatchScanSession(
        name=data.name,
        batch_code=batch_code,
        college_id=data.college_id,
        specialization_id=data.specialization_id,
        batch_year=data.batch_year,
        certificate_type=data.certificate_type,
        processing_mode=data.processing_mode,
        priority=data.priority,
        expected_count=data.expected_count,
        device_id=data.device_id,
        source_type=data.source_type,
        status=BatchSessionStatus.DRAFT,
        created_by=current_user.id,
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=BatchScanSessionListResponse)
async def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[BatchSessionStatus] = Query(None, alias="status"),
    college_id: Optional[uuid.UUID] = Query(None),
    batch_year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Lists batch scan sessions with optional filtering and pagination."""
    query = select(BatchScanSession)
    if status_filter:
        query = query.where(BatchScanSession.status == status_filter)
    if college_id:
        query = query.where(BatchScanSession.college_id == college_id)
    if batch_year:
        query = query.where(BatchScanSession.batch_year == batch_year)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(desc(BatchScanSession.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    sessions = result.scalars().all()

    return {
        "items": sessions,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/sessions/{session_id}", response_model=BatchScanSessionResponse)
async def get_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieves full details of a specific batch scan session."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")
    return session


@router.patch("/sessions/{session_id}", response_model=BatchScanSessionResponse)
async def update_session(
    session_id: uuid.UUID,
    data: BatchScanSessionUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Updates batch scan session parameters."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(session, field, val)

    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/start", response_model=BatchScanSessionResponse)
async def start_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Starts/processes all pending items in a session."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    session.status = BatchSessionStatus.PROCESSING
    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()

    # Run processing engine in sync threadpool
    def _run_processing(sync_db):
        qm = BatchQueueManager(sync_db)
        return qm.process_all_queued(session_id)

    await db.run_sync(_run_processing)
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/pause", response_model=BatchScanSessionResponse)
async def pause_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Pauses an active batch session."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    session.status = BatchSessionStatus.PAUSED
    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/resume", response_model=BatchScanSessionResponse)
async def resume_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Resumes a paused batch session."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    session.status = BatchSessionStatus.PROCESSING
    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()

    def _run_processing(sync_db):
        qm = BatchQueueManager(sync_db)
        return qm.process_all_queued(session_id)

    await db.run_sync(_run_processing)
    await db.refresh(session)
    return session


@router.get("/sessions/{session_id}/progress", response_model=BatchScanSessionProgress)
async def get_session_progress(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieves live telemetry and execution progress for the batch."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    total = session.actual_count
    processed = session.processed_count
    pct = round((processed / total) * 100, 1) if total > 0 else 0.0

    return {
        "session_id": session.id,
        "status": session.status,
        "total_items": total,
        "processed_items": processed,
        "completed_items": session.completed_count,
        "needs_review_items": session.needs_review_count,
        "failed_items": session.failed_count,
        "progress_percentage": pct,
        "is_paused": session.status == BatchSessionStatus.PAUSED,
        "estimated_remaining_seconds": max(0, (total - processed) * 2),
    }


# =====================================================================
# 2. Batch Item Ingestion & Upload
# =====================================================================

@router.post("/sessions/{session_id}/upload-manifest")
async def upload_manifest(
    session_id: uuid.UUID,
    manifest: BatchManifestUpload,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    High-volume manifest upload. Ingests dozens or hundreds of items with
    idempotency protection against duplicate uploads.
    """
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    created_count = 0
    skipped_count = 0

    for item_data in manifest.items:
        # Check idempotency key
        existing = await db.execute(
            select(BatchScanItem).where(BatchScanItem.idempotency_key == item_data.idempotency_key)
        )
        if existing.scalars().first():
            skipped_count += 1
            continue

        new_item = BatchScanItem(
            session_id=session_id,
            sequence_number=item_data.sequence_number,
            client_item_id=item_data.client_item_id,
            idempotency_key=item_data.idempotency_key,
            image_path=item_data.image_path,
            thumbnail_path=item_data.thumbnail_path,
            state=ItemProcessingState.CAPTURED,
        )
        db.add(new_item)
        created_count += 1

    session.actual_count += created_count
    session.last_activity_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "message": "Manifest processed",
        "created_count": created_count,
        "skipped_duplicates": skipped_count,
        "total_session_items": session.actual_count,
    }


@router.post("/sessions/{session_id}/items", response_model=BatchScanItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item(
    session_id: uuid.UUID,
    item_data: BatchScanItemCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Adds a single scanned certificate item to a session."""
    session = await db.get(BatchScanSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Batch session not found")

    existing = await db.execute(
        select(BatchScanItem).where(BatchScanItem.idempotency_key == item_data.idempotency_key)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Item with this idempotency key already exists")

    new_item = BatchScanItem(
        session_id=session_id,
        sequence_number=item_data.sequence_number,
        client_item_id=item_data.client_item_id,
        idempotency_key=item_data.idempotency_key,
        image_path=item_data.image_path,
        thumbnail_path=item_data.thumbnail_path,
        state=ItemProcessingState.CAPTURED,
    )
    db.add(new_item)
    session.actual_count += 1
    session.last_activity_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(new_item)
    return new_item


@router.get("/sessions/{session_id}/items", response_model=BatchScanItemListResponse)
async def list_session_items(
    session_id: uuid.UUID,
    bucket: Optional[str] = Query("all", description="all, completed, needs_review, duplicates, failed"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Lists items of a session with smart bucket filtering."""
    query = select(BatchScanItem).where(BatchScanItem.session_id == session_id)

    if bucket == "completed":
        query = query.where(BatchScanItem.state == ItemProcessingState.COMPLETED)
    elif bucket == "needs_review":
        query = query.where(BatchScanItem.state == ItemProcessingState.NEEDS_REVIEW)
    elif bucket == "duplicates":
        query = query.where(BatchScanItem.duplicate_status != DuplicateStatus.NO_DUPLICATE)
    elif bucket == "failed":
        query = query.where(BatchScanItem.state == ItemProcessingState.FAILED)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(BatchScanItem.sequence_number.asc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/items/{item_id}", response_model=BatchScanItemResponse)
async def get_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieves full details of a specific scanned item."""
    item = await db.get(BatchScanItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Batch item not found")
    return item


@router.post("/items/{item_id}/process", response_model=BatchScanItemResponse)
async def process_single_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Processes or re-processes an individual item through the pipeline."""
    def _run_single(sync_db):
        qm = BatchQueueManager(sync_db)
        return qm.process_item(item_id)

    await db.run_sync(_run_single)
    item = await db.get(BatchScanItem, item_id)
    return item


# =====================================================================
# 3. Human Review & Audit Trail (Zero Silent Authorization)
# =====================================================================

@router.post("/items/{item_id}/review", response_model=BatchScanItemResponse)
async def review_item(
    item_id: uuid.UUID,
    review_req: BatchScanItemReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Executes explicit human review and intervention on an item:
    - approve_match: Confirms student identity link
    - correct_field: Overrides OCR extracted fields with before/after audit log
    - mark_duplicate: Confirms or overrides duplicate status
    - reject: Marks as rejected/unusable
    """
    item = await db.get(BatchScanItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Batch item not found")

    action = review_req.action
    before_state = {
        "state": item.state.value,
        "extracted_fields": dict(item.extracted_fields or {}),
        "match_status": item.match_status.value,
        "duplicate_status": item.duplicate_status.value,
    }
    after_state = {}

    if action == "approve_match":
        item.match_status = MatchStatus.EXACT
        item.state = ItemProcessingState.COMPLETED
        if review_req.target_student_id:
            item.suggested_student_id = review_req.target_student_id
        after_state["approved_student_id"] = str(item.suggested_student_id)

    elif action == "correct_field":
        fields = dict(item.extracted_fields or {})
        if review_req.field_changes:
            for k, v in review_req.field_changes.items():
                fields[k] = v
        item.extracted_fields = fields
        item.state = ItemProcessingState.COMPLETED
        after_state["extracted_fields"] = fields

    elif action == "mark_duplicate":
        item.duplicate_status = DuplicateStatus.LIKELY_DUPLICATE
        after_state["duplicate_status"] = DuplicateStatus.LIKELY_DUPLICATE.value

    elif action == "dismiss_duplicate":
        item.duplicate_status = DuplicateStatus.NO_DUPLICATE
        item.state = ItemProcessingState.COMPLETED
        after_state["duplicate_status"] = DuplicateStatus.NO_DUPLICATE.value

    elif action == "reject":
        item.state = ItemProcessingState.SKIPPED
        after_state["state"] = ItemProcessingState.SKIPPED.value

    # Create immutable review audit entry
    review_audit = BatchScanReview(
        item_id=item.id,
        reviewer_id=current_user.id,
        action=action,
        field_changes={"before": before_state, "after": after_state},
        reason=review_req.reason or "مراجعة واعتماد يدوي من مسؤول التدقيق",
    )
    db.add(review_audit)

    await db.commit()

    # Recalculate parent session counters
    def _update_counters(sync_db):
        qm = BatchQueueManager(sync_db)
        qm.update_session_counters(item.session_id)

    await db.run_sync(_update_counters)
    await db.refresh(item)
    return item


# =====================================================================
# 4. Missing Student Candidate Isolation & Resolution
# =====================================================================

@router.get("/sessions/{session_id}/candidates", response_model=List[MissingStudentCandidateResponse])
async def list_session_candidates(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Lists isolated missing student candidates for a session requiring decision."""
    query = (
        select(MissingStudentCandidate)
        .join(BatchScanItem, BatchScanItem.id == MissingStudentCandidate.item_id)
        .where(BatchScanItem.session_id == session_id)
        .order_by(MissingStudentCandidate.created_at.desc())
    )
    result = await db.execute(query)
    candidates = result.scalars().all()
    return candidates


@router.post("/candidates/{candidate_id}/resolve", response_model=MissingStudentCandidateResponse)
async def resolve_candidate(
    candidate_id: uuid.UUID,
    data: CandidateResolutionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Explicitly resolves a missing student candidate:
    - added_as_student: creates a new official StudentRecord
    - attached_to_existing: links to existing student
    - discarded: rejects candidate
    Never silently adds records.
    """
    candidate = await db.get(MissingStudentCandidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.resolution_status = data.action
    candidate.resolved_by = current_user.id
    candidate.resolution_notes = data.resolution_notes

    item = await db.get(BatchScanItem, candidate.item_id)

    if data.action == CandidateResolutionStatus.ADDED_AS_STUDENT:
        # Create official student record safely
        new_student = StudentRecord(
            batch_id=uuid.uuid4(),  # Or session reference
            student_name=candidate.extracted_name,
            student_name_raw=candidate.extracted_name,
            university_id=candidate.extracted_id or f"GEN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            status=CertificateStatus.APPROVED,
            approved_by=current_user.id,
            notes=f"تم إنشاؤه عبر فحص الدفعات (جلسة {candidate.item_id})",
        )
        db.add(new_student)
        await db.flush()
        candidate.created_student_record_id = new_student.id

        if item:
            item.suggested_student_id = new_student.id
            item.match_status = MatchStatus.EXACT
            item.state = ItemProcessingState.COMPLETED

    elif data.action == CandidateResolutionStatus.ATTACHED_TO_EXISTING:
        if not data.target_student_id:
            raise HTTPException(status_code=400, detail="target_student_id is required for attachment")
        candidate.created_student_record_id = data.target_student_id
        if item:
            item.suggested_student_id = data.target_student_id
            item.match_status = MatchStatus.EXACT
            item.state = ItemProcessingState.COMPLETED

    elif data.action == CandidateResolutionStatus.DISCARDED:
        if item:
            item.state = ItemProcessingState.SKIPPED

    await db.commit()

    if item:
        def _update_counters(sync_db):
            qm = BatchQueueManager(sync_db)
            qm.update_session_counters(item.session_id)
        await db.run_sync(_update_counters)

    await db.refresh(candidate)
    return candidate


# =====================================================================
# 5. Reports & Excel Export
# =====================================================================

@router.get("/sessions/{session_id}/report", response_model=BatchReconciliationReportResponse)
async def get_session_report(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieves full reconciliation, quality distribution, and audit metrics."""
    def _gen_report(sync_db):
        rg = BatchReportGenerator(sync_db)
        return rg.generate_summary(session_id)

    report_dict = await db.run_sync(_gen_report)
    return report_dict


@router.get("/sessions/{session_id}/export-csv")
async def export_session_csv(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Downloads an Excel-compatible UTF-8 BOM CSV report of all scanned certificates."""
    def _gen_csv(sync_db):
        rg = BatchReportGenerator(sync_db)
        return rg.generate_csv(session_id)

    csv_content = await db.run_sync(_gen_csv)
    filename = f"batch_report_{session_id}.csv"

    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
