"""
Sahm Backend — Batch Scanner Report Generator (Prompt 17)
Generates comprehensive reconciliation, quality, and audit reports for
high-volume batch certificate scan sessions:
- Summary Statistics (counts, rates, execution timestamps)
- Quality Breakdown (blur, glare, resolution)
- Identity Reconciliation Rates
- Excel-compatible CSV export with UTF-8 BOM for Arabic text
"""
import io
import csv
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.batch_scanner import (
    BatchScanSession,
    BatchScanItem,
    MissingStudentCandidate,
    ItemProcessingState,
    MatchStatus,
    DuplicateStatus,
)


class BatchReportGenerator:
    """Generates audit, reconciliation, and export reports for a batch scan session."""

    def __init__(self, db: Session):
        self.db = db

    def generate_summary(self, session_id: uuid.UUID) -> Dict[str, Any]:
        """Calculates rich summary metrics for a batch scan session."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        items = self.db.execute(
            select(BatchScanItem).where(BatchScanItem.session_id == session_id)
        ).scalars().all()

        total = len(items)
        completed = sum(1 for i in items if i.state == ItemProcessingState.COMPLETED)
        needs_review = sum(1 for i in items if i.state == ItemProcessingState.NEEDS_REVIEW)
        failed = sum(1 for i in items if i.state == ItemProcessingState.FAILED)

        # Match breakdown
        exact_matches = sum(1 for i in items if i.match_status == MatchStatus.EXACT)
        high_conf_matches = sum(1 for i in items if i.match_status == MatchStatus.HIGH_CONFIDENCE)
        possible_matches = sum(1 for i in items if i.match_status == MatchStatus.POSSIBLE)
        no_matches = sum(1 for i in items if i.match_status == MatchStatus.NO_MATCH)

        # Quality distribution
        avg_quality = (
            round(sum((i.quality_score or 0.0) for i in items) / total, 1) if total > 0 else 0.0
        )
        avg_ocr_conf = (
            round(sum((i.ocr_confidence or 0.0) for i in items) / total, 2) if total > 0 else 0.0
        )

        duplicates = sum(
            1 for i in items if i.duplicate_status != DuplicateStatus.NO_DUPLICATE
        )
        mismatches = sum(1 for i in items if i.has_batch_mismatch)
        structural_anomalies = sum(1 for i in items if i.has_structural_anomaly)

        reconciliation_rate = (
            round(((exact_matches + high_conf_matches) / total) * 100, 1) if total > 0 else 0.0
        )

        return {
            "session_id": str(session.id),
            "batch_code": session.batch_code,
            "name": session.name,
            "status": session.status.value,
            "batch_year": session.batch_year,
            "total_certificates": total,
            "completed_count": completed,
            "needs_review_count": needs_review,
            "failed_count": failed,
            "duplicate_count": duplicates,
            "batch_mismatch_count": mismatches,
            "structural_anomaly_count": structural_anomalies,
            "reconciliation_rate_percent": reconciliation_rate,
            "average_quality_score": avg_quality,
            "average_ocr_confidence": avg_ocr_conf,
            "match_breakdown": {
                "exact": exact_matches,
                "high_confidence": high_conf_matches,
                "possible": possible_matches,
                "no_match": no_matches,
            },
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        }

    def generate_csv(self, session_id: uuid.UUID) -> str:
        """
        Generates an Excel-compatible CSV string with UTF-8 BOM (Byte Order Mark)
        so Arabic certificate names and fields render perfectly without corruption.
        """
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        items = self.db.execute(
            select(BatchScanItem)
            .where(BatchScanItem.session_id == session_id)
            .order_by(BatchScanItem.sequence_number.asc())
        ).scalars().all()

        output = io.StringIO()
        # Write UTF-8 BOM
        output.write("\ufeff")

        writer = csv.writer(output, dialect="excel")
        # Headers in Arabic and English
        writer.writerow([
            "التسلسل (Sequence)",
            "معرف العنصر (Item ID)",
            "الحالة (State)",
            "اسم الطالب (Student Name)",
            "الاسم بالإنجليزية (English Name)",
            "الرقم الجامعي (University ID)",
            "رقم الشهادة (Cert Number)",
            "سنة التخرج (Graduation Year)",
            "الكلية (College)",
            "القسم (Department)",
            "جودة الصورة (Quality Score)",
            "تصنيف الجودة (Quality Category)",
            "حالة المطابقة (Match Status)",
            "نسبة ثقة المطابقة (Match Conf)",
            "حالة التكرار (Duplicate Status)",
            "تعارض الدفعة (Batch Mismatch)",
            "خلل هيكلي (Structural Anomaly)",
            "ملاحظات الخلل (Anomaly Reasons)",
        ])

        for item in items:
            ext = item.extracted_fields or {}
            anomalies = " | ".join(item.anomaly_reasons or [])
            writer.writerow([
                item.sequence_number,
                item.client_item_id or str(item.id),
                item.state.value,
                ext.get("student_name", ""),
                ext.get("student_name_en", ""),
                ext.get("university_id", ""),
                ext.get("certificate_number", ""),
                ext.get("graduation_year", ""),
                ext.get("college", ""),
                ext.get("department", ""),
                f"{item.quality_score:.1f}",
                item.quality_category.value,
                item.match_status.value,
                f"{item.match_confidence:.2f}",
                item.duplicate_status.value,
                "نعم" if item.has_batch_mismatch else "لا",
                "نعم" if item.has_structural_anomaly else "لا",
                anomalies,
            ])

        return output.getvalue()
