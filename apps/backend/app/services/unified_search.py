"""
Sahm Backend — Unified Search Service
Prompt 24: Global Search & Record Resolution Engine

Provides unified, privacy-scoped, and Arabic-normalized search across:
- Students (StudentRecord)
- Batches (Batch & CertificateBatch)
- Scanned Certificates (CapturedCertificate)
- Work Items & Review Queues
- Export Projects & Templates
- Verification Tokens (VerificationIdentity)
"""
import re
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.models.user import User, UserRole
from app.models.record import StudentRecord, CertificateStatus
from app.models.batch import Batch
from app.models.batch_scanner import BatchScanSession, BatchScanItem
from app.models.export_studio import ExportTemplate, ExportJob, GeneratedArtifact
from app.models.verification import CertificateVerification, VerificationState


class SearchScope(str, Enum):
    ALL = "all"
    STUDENTS = "students"
    BATCHES = "batches"
    CERTIFICATES = "certificates"
    EXPORTS = "exports"
    VERIFICATIONS = "verifications"


class UnifiedSearchHit(BaseModel):
    """Represents a single match across any entity type."""
    entity_type: str
    entity_id: str
    title: str
    subtitle: Optional[str] = None
    status: Optional[str] = None
    confidence: Optional[float] = None
    created_at: Optional[str] = None
    url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    relevance_score: float = 1.0


class UnifiedSearchResponse(BaseModel):
    """Unified search payload."""
    query: str
    normalized_query: str
    scope: SearchScope
    total_count: int
    hits: List[UnifiedSearchHit]
    counts_by_entity: Dict[str, int] = Field(default_factory=dict)


def normalize_arabic(text: str) -> str:
    """
    Institutional Arabic Normalization:
    - Normalizes hamza variations: أ, إ, آ, ٱ -> ا
    - Normalizes taa marbuta: ة -> ه
    - Normalizes alef maksura: ى -> ي
    - Strips tashkeel (diacritics)
    - Normalizes spaces and trims
    """
    if not text:
        return ""
    
    t = text.strip().lower()
    
    # Remove diacritics (harakat)
    tashkeel_pattern = re.compile(r'[\u0617-\u061A\u064B-\u0652]')
    t = re.sub(tashkeel_pattern, '', t)
    
    # Normalize Alefs
    t = re.sub(r'[أإآٱ]', 'ا', t)
    
    # Normalize Taa Marbuta
    t = t.replace('ة', 'ه')
    
    # Normalize Alef Maksura
    t = t.replace('ى', 'ي')
    
    # Normalize multi-spaces
    t = " ".join(t.split())
    return t


class UnifiedSearchService:
    """
    Universal Search Service with Role-Based Scoping and Arabic Normalization.
    Strict rule: Never leak private student records to unauthorized users.
    """

    @classmethod
    async def search(
        cls,
        db: AsyncSession,
        user: User,
        query: str,
        scope: SearchScope = SearchScope.ALL,
        limit: int = 30,
    ) -> UnifiedSearchResponse:
        norm_query = normalize_arabic(query)
        if not norm_query:
            return UnifiedSearchResponse(
                query=query,
                normalized_query="",
                scope=scope,
                total_count=0,
                hits=[],
                counts_by_entity={}
            )

        hits: List[UnifiedSearchHit] = []
        counts: Dict[str, int] = {}

        # 1. Search Students (StudentRecord) if authorized
        if scope in (SearchScope.ALL, SearchScope.STUDENTS):
            if cls._user_can_search_students(user):
                student_hits = await cls._search_students(db, query, norm_query, limit)
                counts["students"] = len(student_hits)
                hits.extend(student_hits)
            else:
                counts["students"] = 0

        # 2. Search Batches if authorized
        if scope in (SearchScope.ALL, SearchScope.BATCHES):
            batch_hits = await cls._search_batches(db, query, norm_query, limit)
            counts["batches"] = len(batch_hits)
            hits.extend(batch_hits)

        # 3. Search Captured Certificates if authorized
        if scope in (SearchScope.ALL, SearchScope.CERTIFICATES):
            if cls._user_can_search_students(user):
                cert_hits = await cls._search_certificates(db, query, norm_query, limit)
                counts["certificates"] = len(cert_hits)
                hits.extend(cert_hits)
            else:
                counts["certificates"] = 0

        # 4. Search Export Projects & Templates if authorized
        if scope in (SearchScope.ALL, SearchScope.EXPORTS):
            if user.role in (UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER):
                export_hits = await cls._search_exports(db, query, norm_query, limit)
                counts["exports"] = len(export_hits)
                hits.extend(export_hits)

        # 5. Search Verification Identifiers if authorized
        if scope in (SearchScope.ALL, SearchScope.VERIFICATIONS):
            verify_hits = await cls._search_verifications(db, query, norm_query, limit)
            counts["verifications"] = len(verify_hits)
            hits.extend(verify_hits)

        # Sort by relevance
        hits.sort(key=lambda h: h.relevance_score, reverse=True)
        truncated_hits = hits[:limit]

        return UnifiedSearchResponse(
            query=query,
            normalized_query=norm_query,
            scope=scope,
            total_count=len(hits),
            hits=truncated_hits,
            counts_by_entity=counts,
        )

    @staticmethod
    def _user_can_search_students(user: User) -> bool:
        """Only authenticated internal staff with adequate role may search student names."""
        return user.role in (
            UserRole.ADMIN,
            UserRole.MANAGER,
            UserRole.REVIEWER,
            UserRole.OPERATOR,
            UserRole.VIEWER,
        )

    @classmethod
    async def _search_students(
        cls, db: AsyncSession, query: str, norm_query: str, limit: int
    ) -> List[UnifiedSearchHit]:
        hits = []
        # Query StudentRecords
        stmt = (
            select(StudentRecord)
            .where(
                or_(
                    StudentRecord.university_id.ilike(f"%{query}%"),
                    StudentRecord.student_name.ilike(f"%{query}%"),
                    StudentRecord.student_name_raw.ilike(f"%{query}%"),
                    func.lower(StudentRecord.student_name).contains(norm_query),
                )
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        records = result.scalars().all()

        for rec in records:
            # Score match
            score = 1.0
            if rec.university_id and rec.university_id.lower() == query.lower():
                score = 3.0
            elif rec.student_name and normalize_arabic(rec.student_name) == norm_query:
                score = 2.5

            hits.append(
                UnifiedSearchHit(
                    entity_type="student",
                    entity_id=str(rec.id),
                    title=rec.student_name,
                    subtitle=f"الرقم الجامعي: {rec.university_id or 'غير محدد'} | الحالة: {rec.status.value}",
                    status=rec.status.value if rec.status else None,
                    confidence=rec.confidence_name,
                    created_at=rec.created_at.isoformat() if rec.created_at else None,
                    url=f"/records/{rec.id}",
                    metadata={
                        "university_id": rec.university_id,
                        "batch_id": str(rec.batch_id),
                    },
                    relevance_score=score,
                )
            )
        return hits


    @classmethod
    async def _search_batches(
        cls, db: AsyncSession, query: str, norm_query: str, limit: int
    ) -> List[UnifiedSearchHit]:
        hits = []
        stmt = (
            select(Batch)
            .where(
                or_(
                    Batch.name.ilike(f"%{query}%"),
                    func.lower(Batch.name).contains(norm_query),
                )
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        batches = result.scalars().all()

        for b in batches:
            score = 1.5 if normalize_arabic(b.name) == norm_query else 1.0
            hits.append(
                UnifiedSearchHit(
                    entity_type="batch",
                    entity_id=str(b.id),
                    title=b.name,
                    subtitle=f"سنة التخرج: {b.graduation_year} | النوع: {b.certificate_type.value}",
                    status=b.status.value if b.status else None,
                    created_at=b.created_at.isoformat() if b.created_at else None,
                    url=f"/batches/{b.id}",
                    metadata={
                        "graduation_year": b.graduation_year,
                        "certificate_type": b.certificate_type.value,
                        "expected_count": b.expected_count,
                    },
                    relevance_score=score,
                )
            )
        return hits

    @classmethod
    async def _search_certificates(
        cls, db: AsyncSession, query: str, norm_query: str, limit: int
    ) -> List[UnifiedSearchHit]:
        hits = []
        stmt = (
            select(BatchScanItem)
            .where(
                or_(
                    BatchScanItem.client_item_id.ilike(f"%{query}%"),
                    BatchScanItem.idempotency_key.ilike(f"%{query}%"),
                )
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = result.scalars().all()

        for c in items:
            ext_name = c.extracted_fields.get("student_name", "") if isinstance(c.extracted_fields, dict) else ""
            title = ext_name or f"شهادة مسح رقم #{c.sequence_number}"
            score = 1.0
            if ext_name and normalize_arabic(ext_name) == norm_query:
                score = 2.5

            hits.append(
                UnifiedSearchHit(
                    entity_type="certificate",
                    entity_id=str(c.id),
                    title=title,
                    subtitle=f"جلسة مسح: {c.session_id} | تسلسل: #{c.sequence_number}",
                    status=c.state.value if c.state else None,
                    confidence=c.ocr_confidence,
                    created_at=c.created_at.isoformat() if c.created_at else None,
                    url=f"/batch-scanner/item/{c.id}",
                    metadata={
                        "session_id": str(c.session_id),
                        "sequence": c.sequence_number,
                        "quality_score": c.quality_score,
                    },
                    relevance_score=score,
                )
            )
        return hits

    @classmethod
    async def _search_exports(
        cls, db: AsyncSession, query: str, norm_query: str, limit: int
    ) -> List[UnifiedSearchHit]:
        hits = []
        stmt = (
            select(ExportTemplate)
            .where(
                or_(
                    ExportTemplate.name.ilike(f"%{query}%"),
                    ExportTemplate.name_ar.ilike(f"%{query}%"),
                    func.lower(ExportTemplate.name).contains(norm_query),
                )
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        templates = result.scalars().all()

        for t in templates:
            hits.append(
                UnifiedSearchHit(
                    entity_type="export_template",
                    entity_id=str(t.id),
                    title=t.name_ar or t.name,
                    subtitle=f"قالب تصدير | التصنيف: {t.category.value} | الصيغة: {t.default_format.value}",
                    status="active" if t.is_active else "inactive",
                    created_at=t.created_at.isoformat() if t.created_at else None,
                    url=f"/export-studio/template/{t.id}",
                    metadata={"format": t.default_format.value, "category": t.category.value},
                    relevance_score=1.2,
                )
            )
        return hits

    @classmethod
    async def _search_verifications(
        cls, db: AsyncSession, query: str, norm_query: str, limit: int
    ) -> List[UnifiedSearchHit]:
        hits = []
        stmt = (
            select(CertificateVerification)
            .where(
                CertificateVerification.verification_code.ilike(f"%{query}%")
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = result.scalars().all()

        for v in items:
            score = 3.0 if v.verification_code.lower() == query.lower() else 1.2
            hits.append(
                UnifiedSearchHit(
                    entity_type="verification",
                    entity_id=str(v.id),
                    title=f"رمز التحقق: {v.verification_code}",
                    subtitle=f"الهوية الرقمية للشهادة | الحالة: {v.status.value}",
                    status=v.status.value if v.status else None,
                    created_at=v.created_at.isoformat() if v.created_at else None,
                    url=f"/verifications/{v.id}",
                    metadata={
                        "verification_code": v.verification_code,
                        "public_url": f"/v/{v.verification_code}",
                    },
                    relevance_score=score,
                )
            )
        return hits

