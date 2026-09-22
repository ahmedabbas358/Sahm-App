"""
Sahm Backend — Verifications Administrative API (Prompt 18)
Manages issuance, batch QR generation, revocation lineage, institutional policy, and audit inspection.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.record import StudentRecord, CertificateStatus
from app.models.batch import Batch
from app.models.verification import (
    CertificateVerification,
    VerificationPublicView,
    PublicVerificationPolicy,
    VerificationEvent,
    VerificationState,
    PublicationStatus,
    PrivacyProfile,
    DisplayNameMode,
    RevocationReason,
    PublicVerificationResult,
)
from app.schemas.verification import (
    VerificationIssueRequest,
    BatchVerificationIssueRequest,
    VerificationRevokeRequest,
    VerificationReissueRequest,
    VerificationAdminResponse,
    VerificationAdminListResponse,
    PublicPolicyUpdateRequest,
    PublicPolicyResponse,
    VerificationAnalyticsResponse,
)
from app.services.verification import (
    generate_verification_code,
    build_verification_url,
    generate_qr_svg,
    build_public_projection,
    create_batch_qr_zip,
    generate_printable_qr_sheet_html,
)

router = APIRouter(prefix="/verifications", tags=["Certificate Verifications"])


async def _get_or_create_default_policy(db: AsyncSession) -> PublicVerificationPolicy:
    """Retrieves or seeds the default institutional verification policy."""
    query = select(PublicVerificationPolicy).where(PublicVerificationPolicy.institution_id == "default")
    result = await db.execute(query)
    policy = result.scalar_one_or_none()
    if not policy:
        policy = PublicVerificationPolicy(
            institution_id="default",
            privacy_profile=PrivacyProfile.PUBLIC_STANDARD,
            display_name_mode=DisplayNameMode.FULL,
            show_student_id=False,
            show_program=True,
            show_graduation_year=True,
            show_honors=False,
            allowed_fields=["student_display_name", "faculty_name", "program_name", "graduation_year", "certificate_type"],
            masked_fields=["national_id", "student_phone", "gpa", "raw_extracted_text"],
            policy_version="1.0.0",
        )
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
    return policy


@router.get("", response_model=VerificationAdminListResponse)
async def list_verifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    batch_id: uuid.UUID = Query(None),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists certificate verification identities with filtering and search."""
    query = (
        select(CertificateVerification)
        .options(
            selectinload(CertificateVerification.student_record),
            selectinload(CertificateVerification.public_view),
        )
    )

    if status:
        query = query.where(CertificateVerification.status == status)
    if batch_id:
        query = query.where(CertificateVerification.batch_id == batch_id)
    if search:
        search_pattern = f"%{search.strip().upper()}%"
        query = query.join(StudentRecord, CertificateVerification.record_id == StudentRecord.id)
        query = query.where(
            or_(
                CertificateVerification.verification_code.ilike(search_pattern),
                StudentRecord.student_name.ilike(f"%{search.strip()}%"),
                StudentRecord.university_id.ilike(f"%{search.strip()}%"),
            )
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(CertificateVerification.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    admin_items = []
    for item in items:
        resp = VerificationAdminResponse(
            id=item.id,
            verification_code=item.verification_code,
            record_id=item.record_id,
            batch_id=item.batch_id,
            college_id=item.college_id,
            status=item.status,
            publication_status=item.publication_status,
            privacy_profile=item.privacy_profile,
            qr_code_url=item.qr_code_url,
            qr_code_svg=item.qr_code_svg,
            issued_at=item.issued_at,
            expires_at=item.expires_at,
            revoked_at=item.revoked_at,
            last_verified_at=item.last_verified_at,
            verification_count=item.verification_count,
            revocation_reason=item.revocation_reason,
            revocation_notes=item.revocation_notes,
            reissued_from_id=item.reissued_from_id,
            policy_version=item.policy_version,
            student_name=item.student_record.student_name if item.student_record else None,
            university_id=item.student_record.university_id if item.student_record else None,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        admin_items.append(resp)

    return VerificationAdminListResponse(
        items=admin_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/issue", response_model=VerificationAdminResponse, status_code=status.HTTP_201_CREATED)
async def issue_verification(
    payload: VerificationIssueRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Issues a new authoritative verification identity and public projection."""
    # 1. Fetch Student Record
    record_query = (
        select(StudentRecord)
        .options(
            selectinload(StudentRecord.batch).selectinload(Batch.college),
        )
        .where(StudentRecord.id == payload.record_id)
    )
    res = await db.execute(record_query)
    record = res.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Student record not found")

    # 2. Check for active existing verification
    existing_query = select(CertificateVerification).where(
        CertificateVerification.record_id == record.id,
        CertificateVerification.status == VerificationState.ACTIVE,
    )
    existing_res = await db.execute(existing_query)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="An active verification identity already exists for this record. Reissue to generate a new one.",
        )

    # 3. Generate Token, URL, and QR
    verification_code = generate_verification_code()
    verification_url = build_verification_url(verification_code)
    qr_svg = generate_qr_svg(verification_url)

    # 4. Get Policy & Build Public Projection
    policy = await _get_or_create_default_policy(db)
    projection_data = build_public_projection(
        record=record,
        policy=policy,
        profile_override=payload.privacy_profile,
        verification_code=verification_code,
        verification_url=verification_url,
    )

    batch_id = record.batch_id if record.batch_id else None
    college_id = record.batch.college_id if record.batch and record.batch.college_id else None

    # 5. Persist Verification Identity
    now_utc = datetime.now(timezone.utc)
    verification = CertificateVerification(
        verification_code=verification_code,
        record_id=record.id,
        batch_id=batch_id,
        college_id=college_id,
        status=VerificationState.ACTIVE,
        publication_status=PublicationStatus.PUBLISHED,
        privacy_profile=payload.privacy_profile,
        qr_code_svg=qr_svg,
        qr_code_url=verification_url,
        issued_at=now_utc,
        expires_at=payload.expires_at,
        created_by=current_user.id,
    )
    db.add(verification)
    await db.flush()

    # 6. Persist Materialized Public View
    public_view = VerificationPublicView(
        verification_id=verification.id,
        verification_code=verification_code,
        public_status=PublicVerificationResult.VERIFIED,
        institution_name=projection_data["institution_name"],
        institution_name_en=projection_data["institution_name_en"],
        faculty_name=projection_data["faculty_name"],
        program_name=projection_data["program_name"],
        certificate_type=projection_data["certificate_type"],
        student_display_name=projection_data["student_display_name"],
        graduation_year=projection_data["graduation_year"],
        issue_date_formatted=projection_data["issue_date_formatted"],
        verification_url=verification_url,
        is_revoked=False,
        custom_public_metadata=projection_data.get("custom_metadata", {}),
    )
    db.add(public_view)

    # 7. Audit Event
    event = VerificationEvent(
        verification_id=verification.id,
        event_type="VerificationIssued",
        actor_id=current_user.id,
        payload={
            "privacy_profile": payload.privacy_profile.value,
            "verification_code": verification_code,
            "record_id": str(record.id),
        },
    )
    db.add(event)

    await db.commit()
    await db.refresh(verification)

    return VerificationAdminResponse(
        id=verification.id,
        verification_code=verification.verification_code,
        record_id=verification.record_id,
        batch_id=verification.batch_id,
        college_id=verification.college_id,
        status=verification.status,
        publication_status=verification.publication_status,
        privacy_profile=verification.privacy_profile,
        qr_code_url=verification.qr_code_url,
        qr_code_svg=verification.qr_code_svg,
        issued_at=verification.issued_at,
        expires_at=verification.expires_at,
        revoked_at=verification.revoked_at,
        last_verified_at=verification.last_verified_at,
        verification_count=verification.verification_count,
        revocation_reason=verification.revocation_reason,
        revocation_notes=verification.revocation_notes,
        reissued_from_id=verification.reissued_from_id,
        policy_version=verification.policy_version,
        student_name=record.student_name,
        university_id=record.university_id,
        created_at=verification.created_at,
        updated_at=verification.updated_at,
    )


@router.post("/batch-issue", status_code=status.HTTP_200_OK)
async def batch_issue_verifications(
    payload: BatchVerificationIssueRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Issues verification identities for all approved records in a batch that lack active verifications."""
    policy = await _get_or_create_default_policy(db)

    # Find records in batch
    records_query = (
        select(StudentRecord)
        .options(selectinload(StudentRecord.batch).selectinload(Batch.college))
        .where(
            StudentRecord.batch_id == payload.batch_id,
            StudentRecord.status.in_([CertificateStatus.APPROVED, CertificateStatus.CERTIFICATE_READY, CertificateStatus.DELIVERED]),
        )
    )
    res = await db.execute(records_query)
    records = res.scalars().all()

    if not records:
        raise HTTPException(status_code=404, detail="No approved records found in the specified batch")

    # Fetch existing active verifications
    rec_ids = [r.id for r in records]
    existing_query = select(CertificateVerification.record_id).where(
        CertificateVerification.record_id.in_(rec_ids),
        CertificateVerification.status == VerificationState.ACTIVE,
    )
    existing_res = await db.execute(existing_query)
    already_issued_ids = set(existing_res.scalars().all())

    now_utc = datetime.now(timezone.utc)
    issued_count = 0

    for rec in records:
        if rec.id in already_issued_ids:
            continue

        code = generate_verification_code()
        url = build_verification_url(code)
        qr_svg = generate_qr_svg(url)
        projection_data = build_public_projection(
            record=rec,
            policy=policy,
            profile_override=payload.privacy_profile,
            verification_code=code,
            verification_url=url,
        )

        verification = CertificateVerification(
            verification_code=code,
            record_id=rec.id,
            batch_id=rec.batch_id,
            college_id=rec.batch.college_id if rec.batch else None,
            status=VerificationState.ACTIVE,
            publication_status=PublicationStatus.PUBLISHED,
            privacy_profile=payload.privacy_profile,
            qr_code_svg=qr_svg,
            qr_code_url=url,
            issued_at=now_utc,
            created_by=current_user.id,
        )
        db.add(verification)
        await db.flush()

        public_view = VerificationPublicView(
            verification_id=verification.id,
            verification_code=code,
            public_status=PublicVerificationResult.VERIFIED,
            institution_name=projection_data["institution_name"],
            institution_name_en=projection_data["institution_name_en"],
            faculty_name=projection_data["faculty_name"],
            program_name=projection_data["program_name"],
            certificate_type=projection_data["certificate_type"],
            student_display_name=projection_data["student_display_name"],
            graduation_year=projection_data["graduation_year"],
            issue_date_formatted=projection_data["issue_date_formatted"],
            verification_url=url,
            is_revoked=False,
            custom_public_metadata=projection_data.get("custom_metadata", {}),
        )
        db.add(public_view)

        event = VerificationEvent(
            verification_id=verification.id,
            event_type="VerificationIssuedInBatch",
            actor_id=current_user.id,
            payload={"batch_id": str(payload.batch_id)},
        )
        db.add(event)
        issued_count += 1

    await db.commit()
    return {"message": f"Successfully issued {issued_count} verification identities", "issued_count": issued_count}


@router.post("/{verification_id}/revoke", response_model=VerificationAdminResponse)
async def revoke_verification(
    verification_id: uuid.UUID,
    payload: VerificationRevokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Explicitly revokes an active verification identity with audited reason."""
    query = (
        select(CertificateVerification)
        .options(
            selectinload(CertificateVerification.public_view),
            selectinload(CertificateVerification.student_record),
        )
        .where(CertificateVerification.id == verification_id)
    )
    res = await db.execute(query)
    verification = res.scalar_one_or_none()

    if not verification:
        raise HTTPException(status_code=404, detail="Verification record not found")

    if verification.status == VerificationState.REVOKED:
        raise HTTPException(status_code=400, detail="Verification is already revoked")

    now_utc = datetime.now(timezone.utc)
    verification.status = VerificationState.REVOKED
    verification.revoked_at = now_utc
    verification.revocation_reason = payload.reason
    verification.revocation_notes = payload.reason_details

    # Update public view
    if verification.public_view:
        verification.public_view.is_revoked = True
        verification.public_view.public_status = PublicVerificationResult.REVOKED
        verification.public_view.revocation_public_notice = payload.public_notice or "تم إلغاء هذه الوثيقة بقرار إداري."

    # Audit event
    event = VerificationEvent(
        verification_id=verification.id,
        event_type="VerificationRevoked",
        actor_id=current_user.id,
        payload={
            "reason": payload.reason.value,
            "reason_details": payload.reason_details,
            "public_notice": payload.public_notice,
        },
    )
    db.add(event)
    await db.commit()
    await db.refresh(verification)

    return VerificationAdminResponse(
        id=verification.id,
        verification_code=verification.verification_code,
        record_id=verification.record_id,
        batch_id=verification.batch_id,
        college_id=verification.college_id,
        status=verification.status,
        publication_status=verification.publication_status,
        privacy_profile=verification.privacy_profile,
        qr_code_url=verification.qr_code_url,
        qr_code_svg=verification.qr_code_svg,
        issued_at=verification.issued_at,
        expires_at=verification.expires_at,
        revoked_at=verification.revoked_at,
        last_verified_at=verification.last_verified_at,
        verification_count=verification.verification_count,
        revocation_reason=verification.revocation_reason,
        revocation_notes=verification.revocation_notes,
        reissued_from_id=verification.reissued_from_id,
        policy_version=verification.policy_version,
        student_name=verification.student_record.student_name if verification.student_record else None,
        university_id=verification.student_record.university_id if verification.student_record else None,
        created_at=verification.created_at,
        updated_at=verification.updated_at,
    )


@router.post("/{verification_id}/reissue", response_model=VerificationAdminResponse)
async def reissue_verification(
    verification_id: uuid.UUID,
    payload: VerificationReissueRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reissues a certificate: revokes existing identity and creates a new one
    maintaining unbroken cryptographic and administrative provenance lineage.
    """
    # 1. Fetch Existing
    query = (
        select(CertificateVerification)
        .options(
            selectinload(CertificateVerification.public_view),
            selectinload(CertificateVerification.student_record).selectinload(StudentRecord.batch).selectinload(Batch.college),
        )
        .where(CertificateVerification.id == verification_id)
    )
    res = await db.execute(query)
    old_verification = res.scalar_one_or_none()

    if not old_verification:
        raise HTTPException(status_code=404, detail="Verification record not found")

    now_utc = datetime.now(timezone.utc)
    old_verification.status = VerificationState.REPLACED
    old_verification.revoked_at = now_utc
    old_verification.revocation_reason = payload.reason
    old_verification.revocation_notes = f"Replaced by reissue. {payload.reason_details or ''}".strip()
    if old_verification.public_view:
        old_verification.public_view.is_revoked = True
        old_verification.public_view.public_status = PublicVerificationResult.REVOKED
        old_verification.public_view.revocation_public_notice = "تم استبدال هذه الوثيقة بإصدار جديد محدث."

    # 2. Target Record
    target_record_id = payload.new_record_id or old_verification.record_id
    rec_query = (
        select(StudentRecord)
        .options(selectinload(StudentRecord.batch).selectinload(Batch.college))
        .where(StudentRecord.id == target_record_id)
    )
    rec_res = await db.execute(rec_query)
    record = rec_res.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Target student record not found")

    # 3. New Identity
    policy = await _get_or_create_default_policy(db)
    new_code = generate_verification_code()
    new_url = build_verification_url(new_code)
    new_qr_svg = generate_qr_svg(new_url)

    projection_data = build_public_projection(
        record=record,
        policy=policy,
        profile_override=old_verification.privacy_profile,
        verification_code=new_code,
        verification_url=new_url,
    )

    new_verification = CertificateVerification(
        verification_code=new_code,
        record_id=record.id,
        batch_id=record.batch_id,
        college_id=record.batch.college_id if record.batch else None,
        status=VerificationState.ACTIVE,
        publication_status=PublicationStatus.PUBLISHED,
        privacy_profile=old_verification.privacy_profile,
        qr_code_svg=new_qr_svg,
        qr_code_url=new_url,
        issued_at=now_utc,
        reissued_from_id=old_verification.id,
        created_by=current_user.id,
    )
    db.add(new_verification)
    await db.flush()

    new_public_view = VerificationPublicView(
        verification_id=new_verification.id,
        verification_code=new_code,
        public_status=PublicVerificationResult.VERIFIED,
        institution_name=projection_data["institution_name"],
        institution_name_en=projection_data["institution_name_en"],
        faculty_name=projection_data["faculty_name"],
        program_name=projection_data["program_name"],
        certificate_type=projection_data["certificate_type"],
        student_display_name=projection_data["student_display_name"],
        graduation_year=projection_data["graduation_year"],
        issue_date_formatted=projection_data["issue_date_formatted"],
        verification_url=new_url,
        is_revoked=False,
        custom_public_metadata=projection_data.get("custom_metadata", {}),
    )
    db.add(new_public_view)

    # Audit events
    db.add(
        VerificationEvent(
            verification_id=old_verification.id,
            event_type="VerificationReplaced",
            actor_id=current_user.id,
            payload={"replacement_id": str(new_verification.id), "new_code": new_code},
        )
    )
    db.add(
        VerificationEvent(
            verification_id=new_verification.id,
            event_type="VerificationReissued",
            actor_id=current_user.id,
            payload={"predecessor_id": str(old_verification.id), "old_code": old_verification.verification_code},
        )
    )

    await db.commit()
    await db.refresh(new_verification)

    return VerificationAdminResponse(
        id=new_verification.id,
        verification_code=new_verification.verification_code,
        record_id=new_verification.record_id,
        batch_id=new_verification.batch_id,
        college_id=new_verification.college_id,
        status=new_verification.status,
        publication_status=new_verification.publication_status,
        privacy_profile=new_verification.privacy_profile,
        qr_code_url=new_verification.qr_code_url,
        qr_code_svg=new_verification.qr_code_svg,
        issued_at=new_verification.issued_at,
        expires_at=new_verification.expires_at,
        revoked_at=new_verification.revoked_at,
        last_verified_at=new_verification.last_verified_at,
        verification_count=new_verification.verification_count,
        revocation_reason=new_verification.revocation_reason,
        revocation_notes=new_verification.revocation_notes,
        reissued_from_id=new_verification.reissued_from_id,
        policy_version=new_verification.policy_version,
        student_name=record.student_name,
        university_id=record.university_id,
        created_at=new_verification.created_at,
        updated_at=new_verification.updated_at,
    )


@router.get("/batch/{batch_id}/export-qr-zip")
async def export_batch_qr_zip(
    batch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates and streams in-memory ZIP containing SVG and PNG QRs for a batch."""
    query = (
        select(CertificateVerification)
        .options(selectinload(CertificateVerification.student_record))
        .where(
            CertificateVerification.batch_id == batch_id,
            CertificateVerification.status == VerificationState.ACTIVE,
        )
    )
    res = await db.execute(query)
    verifications = res.scalars().all()

    if not verifications:
        raise HTTPException(status_code=404, detail="No active verifications found for this batch")

    items = []
    for v in verifications:
        items.append({
            "verification_code": v.verification_code,
            "verification_url": v.qr_code_url,
            "university_id": v.student_record.university_id if v.student_record else "unknown",
            "student_name": v.student_record.student_name if v.student_record else "",
            "issued_at": v.issued_at.isoformat(),
        })

    zip_bytes = create_batch_qr_zip(items)
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=sahm_batch_{batch_id}_qr_pack.zip"},
    )


@router.get("/batch/{batch_id}/print-sheet")
async def get_printable_qr_sheet(
    batch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renders printable A4 HTML grid of QR verification labels."""
    query = (
        select(CertificateVerification)
        .options(selectinload(CertificateVerification.student_record))
        .where(
            CertificateVerification.batch_id == batch_id,
            CertificateVerification.status == VerificationState.ACTIVE,
        )
    )
    res = await db.execute(query)
    verifications = res.scalars().all()

    if not verifications:
        raise HTTPException(status_code=404, detail="No active verifications found for this batch")

    items = []
    for v in verifications:
        items.append({
            "verification_code": v.verification_code,
            "verification_url": v.qr_code_url,
            "university_id": v.student_record.university_id if v.student_record else "",
            "student_name": v.student_record.student_name if v.student_record else "",
        })

    html = generate_printable_qr_sheet_html(items, title="ملصقات التحقق الرقمي المعتمدة")
    return Response(content=html, media_type="text/html")


@router.get("/policies/default", response_model=PublicPolicyResponse)
async def get_default_policy(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves current default public verification policy."""
    policy = await _get_or_create_default_policy(db)
    return PublicPolicyResponse.model_validate(policy)


@router.put("/policies/default", response_model=PublicPolicyResponse)
async def update_default_policy(
    payload: PublicPolicyUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates public verification disclosure policy."""
    policy = await _get_or_create_default_policy(db)

    if payload.privacy_profile is not None:
        policy.privacy_profile = payload.privacy_profile
    if payload.display_name_mode is not None:
        policy.display_name_mode = payload.display_name_mode
    if payload.show_student_id is not None:
        policy.show_student_id = payload.show_student_id
    if payload.show_program is not None:
        policy.show_program = payload.show_program
    if payload.show_graduation_year is not None:
        policy.show_graduation_year = payload.show_graduation_year
    if payload.show_honors is not None:
        policy.show_honors = payload.show_honors

    await db.commit()
    await db.refresh(policy)
    return PublicPolicyResponse.model_validate(policy)


@router.get("/analytics", response_model=VerificationAnalyticsResponse)
async def get_verification_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculates operational KPIs and scan statistics."""
    total = await db.scalar(select(func.count(CertificateVerification.id))) or 0
    active = await db.scalar(select(func.count(CertificateVerification.id)).where(CertificateVerification.status == VerificationState.ACTIVE)) or 0
    revoked = await db.scalar(select(func.count(CertificateVerification.id)).where(CertificateVerification.status == VerificationState.REVOKED)) or 0
    expired = await db.scalar(select(func.count(CertificateVerification.id)).where(CertificateVerification.status == VerificationState.EXPIRED)) or 0
    total_scans = await db.scalar(select(func.coalesce(func.sum(CertificateVerification.verification_count), 0))) or 0

    return VerificationAnalyticsResponse(
        total_verifications=total,
        active_count=active,
        revoked_count=revoked,
        expired_count=expired,
        total_scans_recorded=total_scans,
        suspicious_scans_blocked=0,
    )


@router.get("/{verification_id}", response_model=VerificationAdminResponse)
async def get_verification_detail(
    verification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves full admin details for a verification identity."""
    query = (
        select(CertificateVerification)
        .options(
            selectinload(CertificateVerification.student_record),
            selectinload(CertificateVerification.public_view),
        )
        .where(CertificateVerification.id == verification_id)
    )
    res = await db.execute(query)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Verification record not found")

    return VerificationAdminResponse(
        id=item.id,
        verification_code=item.verification_code,
        record_id=item.record_id,
        batch_id=item.batch_id,
        college_id=item.college_id,
        status=item.status,
        publication_status=item.publication_status,
        privacy_profile=item.privacy_profile,
        qr_code_url=item.qr_code_url,
        qr_code_svg=item.qr_code_svg,
        issued_at=item.issued_at,
        expires_at=item.expires_at,
        revoked_at=item.revoked_at,
        last_verified_at=item.last_verified_at,
        verification_count=item.verification_count,
        revocation_reason=item.revocation_reason,
        revocation_notes=item.revocation_notes,
        reissued_from_id=item.reissued_from_id,
        policy_version=item.policy_version,
        student_name=item.student_record.student_name if item.student_record else None,
        university_id=item.student_record.university_id if item.student_record else None,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )
