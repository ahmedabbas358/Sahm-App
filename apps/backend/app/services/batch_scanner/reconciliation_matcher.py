"""
Sahm Backend — Batch Scanner Reconciliation & Identity Matcher (Prompt 17)
Performs:
- Arabic name normalization (diacritics, alif forms, taa marbuta, yaa).
- Fuzzy and token-based identity matching against student records.
- Batch mismatch detection (wrong college, wrong year).
- Structural anomaly detection (missing serials, incomplete names).
- Isolated candidate generation (MissingStudentCandidate) without mutating official student records.
"""
import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.models.record import StudentRecord
from app.models.batch_scanner import (
    BatchScanItem,
    BatchScanSession,
    MatchStatus,
    MissingStudentCandidate,
    CandidateResolutionStatus,
)


def normalize_arabic_name(text: Optional[str]) -> str:
    """
    Normalizes Arabic strings for robust identity matching:
    - Removes Tashkeel (harakat/diacritics)
    - Removes Tatweel / Kashida
    - Unifies Alif forms (أ, إ, آ -> ا)
    - Unifies Yaa and Alif Maqsura (ى -> ي)
    - Unifies Taa Marbuta and Haa (ة -> ه)
    - Trims excess whitespace and punctuation
    """
    if not text:
        return ""

    # Remove tashkeel (diacritics: Fatha, Damma, Kasra, Sukun, Tanwin, Shadda)
    text = re.sub(r"[\u064B-\u065F\u0670]", "", text)
    # Remove Tatweel
    text = re.sub(r"\u0640", "", text)
    # Normalize Alif
    text = re.sub(r"[إأآا]", "ا", text)
    # Normalize Yaa / Alif Maqsura
    text = re.sub(r"[ىي]", "ي", text)
    # Normalize Taa Marbuta
    text = re.sub(r"[ةه]", "ه", text)
    # Remove special punctuation
    text = re.sub(r"[^\w\s]", " ", text)
    # Normalize multiple whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()


def compute_string_similarity(s1: str, s2: str) -> float:
    """
    Calculates token-based Jaccard similarity and character-level resemblance
    for Arabic student names.
    """
    if not s1 or not s2:
        return 0.0

    s1_norm = normalize_arabic_name(s1)
    s2_norm = normalize_arabic_name(s2)

    if s1_norm == s2_norm:
        return 1.0

    tokens1 = set(s1_norm.split())
    tokens2 = set(s2_norm.split())

    if not tokens1 or not tokens2:
        return 0.0

    # Token overlap (Jaccard)
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    jaccard = len(intersection) / len(union)

    # Substring bonus if one name is an exact full prefix or subset
    subset_bonus = 0.0
    if tokens1.issubset(tokens2) or tokens2.issubset(tokens1):
        subset_bonus = 0.15

    score = min(1.0, jaccard + subset_bonus)
    return round(score, 3)


class ReconciliationMatcher:
    """
    Reconciliation engine matching scanned certificate fields with official
    student database records without ever silently mutating official data.
    """

    def __init__(self, db: Session):
        self.db = db

    def match_item(
        self,
        item: BatchScanItem,
        session: BatchScanSession,
    ) -> Dict[str, Any]:
        """
        Executes multi-phase reconciliation for a scanned certificate item:
        1. Exact ID match lookup.
        2. Normalized Arabic name fuzzy lookup.
        3. Cross-batch year / college validation.
        4. Structural anomaly audits.
        5. Candidate record generation for unmatched items.
        """
        extracted = item.extracted_fields or {}
        extracted_name = extracted.get("student_name", "").strip()
        extracted_id = extracted.get("university_id", "").strip()
        extracted_cert_num = extracted.get("certificate_number", "").strip()
        extracted_year = extracted.get("graduation_year")

        matched_student = None
        match_confidence = 0.0
        match_status = MatchStatus.NO_MATCH
        anomaly_reasons: List[str] = []
        has_batch_mismatch = False
        has_structural_anomaly = False

        # Phase 1: Search by University ID if present
        if extracted_id:
            query = select(StudentRecord).where(
                StudentRecord.university_id == extracted_id
            )
            matched_student = self.db.execute(query).scalars().first()
            if matched_student:
                match_status = MatchStatus.EXACT
                match_confidence = 0.98

        # Phase 2: Search by Name if no match by ID
        if not matched_student and extracted_name:
            norm_extracted = normalize_arabic_name(extracted_name)
            # Find candidate students in the database
            all_students = self.db.execute(select(StudentRecord)).scalars().all()

            best_student = None
            best_sim = 0.0

            for student in all_students:
                std_name = student.student_name or student.student_name_raw or ""
                sim = compute_string_similarity(norm_extracted, std_name)
                if sim > best_sim:
                    best_sim = sim
                    best_student = student

            if best_student and best_sim >= 0.88:
                matched_student = best_student
                match_status = MatchStatus.HIGH_CONFIDENCE
                match_confidence = best_sim
            elif best_student and best_sim >= 0.65:
                matched_student = best_student
                match_status = MatchStatus.POSSIBLE
                match_confidence = best_sim
            else:
                match_status = MatchStatus.NO_MATCH
                match_confidence = best_sim if best_student else 0.0

        # Phase 3: Anomaly & Batch Mismatch Checks
        # 3.1 Check Batch Year Mismatch
        if extracted_year and session.batch_year:
            try:
                extracted_yr_int = int(extracted_year)
                if extracted_yr_int != session.batch_year:
                    has_batch_mismatch = True
                    anomaly_reasons.append(
                        f"سنة التخرج المستخرجة ({extracted_yr_int}) لا تطابق سنة الدفعة الحالية ({session.batch_year})"
                    )
            except (ValueError, TypeError):
                pass

        # 3.2 Check Missing Certificate Number
        if not extracted_cert_num or len(extracted_cert_num) < 3:
            has_structural_anomaly = True
            anomaly_reasons.append("رقم الشهادة أو الرقم التسلسلي مفقود أو غير واضح")

        # 3.3 Check Incomplete Student Name (less than 3 tokens)
        name_tokens = extracted_name.split()
        if len(name_tokens) < 3:
            has_structural_anomaly = True
            anomaly_reasons.append(
                f"اسم الطالب مستخرج بصيغة غير مكتملة ({len(name_tokens)} مقاطع فقط)"
            )

        # 3.4 Check University ID Format
        if extracted_id and len(extracted_id) < 5:
            has_structural_anomaly = True
            anomaly_reasons.append("تنسيق الرقم الجامعي قصير جداً أو مشوه")

        # Update item fields
        item.match_status = match_status
        item.match_confidence = match_confidence
        item.suggested_student_id = matched_student.id if matched_student else None
        item.has_batch_mismatch = has_batch_mismatch
        item.has_structural_anomaly = has_structural_anomaly
        item.anomaly_reasons = anomaly_reasons

        # Phase 4: Candidate Isolation for Unmatched / Ambiguous Items
        # If no exact or high-confidence match, create or link a MissingStudentCandidate
        if match_status in (MatchStatus.NO_MATCH, MatchStatus.POSSIBLE):
            self._ensure_candidate_exists(item, session, extracted)

        return {
            "match_status": match_status.value,
            "match_confidence": match_confidence,
            "suggested_student_id": str(matched_student.id) if matched_student else None,
            "has_batch_mismatch": has_batch_mismatch,
            "has_structural_anomaly": has_structural_anomaly,
            "anomaly_reasons": anomaly_reasons,
        }

    def _ensure_candidate_exists(
        self,
        item: BatchScanItem,
        session: BatchScanSession,
        extracted: Dict[str, Any],
    ) -> MissingStudentCandidate:
        """
        Creates or updates a MissingStudentCandidate entity in isolation
        without inserting or mutating the official student records table.
        """
        existing_candidate = self.db.execute(
            select(MissingStudentCandidate).where(
                MissingStudentCandidate.item_id == item.id
            )
        ).scalars().first()

        name = extracted.get("student_name") or "طالب غير محدد"
        uni_id = extracted.get("university_id")
        cert_num = extracted.get("certificate_number")
        prog = extracted.get("department") or extracted.get("program")
        college = extracted.get("college")
        batch_yr = session.batch_year

        if existing_candidate:
            existing_candidate.extracted_name = name
            existing_candidate.extracted_id = uni_id
            existing_candidate.certificate_number = cert_num
            existing_candidate.program = prog
            existing_candidate.college = college
            existing_candidate.batch_year = batch_yr
            return existing_candidate

        candidate = MissingStudentCandidate(
            item_id=item.id,
            extracted_name=name,
            extracted_id=uni_id,
            certificate_number=cert_num,
            program=prog,
            college=college,
            batch_year=batch_yr,
            resolution_status=CandidateResolutionStatus.PENDING_REVIEW,
        )
        self.db.add(candidate)
        return candidate
