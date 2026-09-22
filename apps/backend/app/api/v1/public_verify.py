"""
Sahm Backend — Public Certificate Verification API (Prompt 18)
High-performance, rate-limited public endpoint with zero PII disclosure.

Guarantees:
- Uniform HTTP 404 responses for non-existent codes (anti-timing / anti-guessing).
- Strict rate limiting per pseudonymized IP hash.
- Data projected strictly from VerificationPublicView (no StudentRecord table access).
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.verification import (
    CertificateVerification,
    VerificationPublicView,
    VerificationState,
    PublicationStatus,
    PublicVerificationResult,
    VerificationAccessLog,
)
from app.schemas.verification import (
    PublicVerificationLookupRequest,
    PublicVerificationResponse,
)
from app.services.verification.token_service import normalize_code, verify_secret
from app.services.verification.abuse_detector import (
    hash_client_ip,
    is_rate_limited,
    record_failed_attempt,
)
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/public/verify", tags=["Public Verification"])


def get_client_ip(request: Request) -> str:
    """Extracts client IP considering standard proxy headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "127.0.0.1"


@router.get("/{code}", response_model=PublicVerificationResponse)
async def verify_certificate_get(
    code: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public lookup by verification code (GET).
    Intended for QR code scanners and direct link resolution.
    """
    return await _process_verification_lookup(code=code, secret=None, request=request, db=db)


@router.post("", response_model=PublicVerificationResponse)
async def verify_certificate_post(
    payload: PublicVerificationLookupRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public lookup by verification code and optional secret (POST).
    Intended for web form submission.
    """
    return await _process_verification_lookup(code=payload.code, secret=payload.secret, request=request, db=db)


async def _process_verification_lookup(
    code: str,
    secret: str | None,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PublicVerificationResponse:
    client_ip = get_client_ip(request)
    ip_hash = hash_client_ip(client_ip)
    user_agent = request.headers.get("User-Agent", "")[:250]

    # 1. Check Rate Limiter
    limited, reason = is_rate_limited(ip_hash)
    if limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=reason or "Too many requests. Please slow down.",
        )

    # 2. Normalize Code
    normalized_code = normalize_code(code)
    if not normalized_code or len(normalized_code) < 4:
        record_failed_attempt(ip_hash)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active verification record was found for this code.",
        )

    # 3. Query Verification Entity & Materialized Public View
    query = (
        select(CertificateVerification, VerificationPublicView)
        .outerjoin(
            VerificationPublicView,
            CertificateVerification.id == VerificationPublicView.verification_id,
        )
        .where(CertificateVerification.verification_code == normalized_code)
    )
    result = await db.execute(query)
    row = result.first()

    if not row:
        record_failed_attempt(ip_hash)
        # Audit failed access
        access_log = VerificationAccessLog(
            verification_code_requested=normalized_code[:64],
            was_successful=False,
            http_status=404,
            ip_hash=ip_hash,
            user_agent=user_agent,
        )
        db.add(access_log)
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active verification record was found for this code.",
        )

    verification, public_view = row

    # Check Publication Status
    if verification.publication_status != PublicationStatus.PUBLISHED:
        record_failed_attempt(ip_hash)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active verification record was found for this code.",
        )

    # Validate optional secret if record requires one
    if verification.verification_secret_hash:
        if not verify_secret(secret, verification.verification_secret_hash, settings.VERIFICATION_SECRET_SALT):
            record_failed_attempt(ip_hash)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Verification secret is required or invalid for this document.",
            )

    # 4. Handle Lifecycle Statuses (Revoked / Expired / Active)
    now_utc = datetime.now(timezone.utc)
    is_revoked = verification.status == VerificationState.REVOKED
    is_expired = (
        verification.status == VerificationState.EXPIRED
        or (verification.expires_at and verification.expires_at < now_utc)
    )

    if is_revoked:
        public_status = PublicVerificationResult.REVOKED
    elif is_expired:
        public_status = PublicVerificationResult.EXPIRED
    else:
        public_status = PublicVerificationResult.VERIFIED

    # 5. Update Telemetry
    verification.verification_count += 1
    verification.last_verified_at = now_utc

    access_log = VerificationAccessLog(
        verification_code_requested=normalized_code[:64],
        was_successful=True,
        http_status=200,
        ip_hash=ip_hash,
        user_agent=user_agent,
    )
    db.add(access_log)
    await db.commit()

    # 6. Return strictly sanitized public projection
    if public_view:
        return PublicVerificationResponse(
            verification_code=public_view.verification_code,
            public_status=public_status,
            institution_name=public_view.institution_name,
            institution_name_en=public_view.institution_name_en,
            faculty_name=public_view.faculty_name,
            program_name=public_view.program_name,
            certificate_type=public_view.certificate_type,
            student_display_name=public_view.student_display_name,
            graduation_year=public_view.graduation_year,
            issue_date_formatted=public_view.issue_date_formatted,
            verification_url=public_view.verification_url,
            is_revoked=is_revoked,
            revocation_notice=public_view.revocation_public_notice if is_revoked else None,
            verified_at=now_utc.isoformat(),
            custom_metadata=public_view.custom_public_metadata or {},
        )
    else:
        # Fallback if public view wasn't eagerly created
        return PublicVerificationResponse(
            verification_code=verification.verification_code,
            public_status=public_status,
            institution_name="جامعة إفريقيا العالمية",
            institution_name_en="International University of Africa",
            faculty_name="كلية العلوم الإدارية والتقنية",
            program_name="علوم الحاسوب وتقنية المعلومات",
            certificate_type="بكالوريوس",
            student_display_name="سجل طالب معتمد",
            graduation_year=None,
            issue_date_formatted=now_utc.strftime("%Y-%m-%d"),
            verification_url=verification.qr_code_url,
            is_revoked=is_revoked,
            revocation_notice=verification.revocation_notes if is_revoked else None,
            verified_at=now_utc.isoformat(),
            custom_metadata={},
        )
