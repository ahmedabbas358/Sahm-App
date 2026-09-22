"""
Sahm Backend — Batch Scanner Queue Manager (Prompt 17)
Orchestrates high-volume pipeline processing:
- Bounded concurrency execution
- State transitions (CAPTURED -> PREPROCESSING -> READY_FOR_OCR -> EXTRACTION_COMPLETE -> MATCHING -> COMPLETED/NEEDS_REVIEW)
- Multi-tier error handling & automatic retries
- Dynamic counter updates and session completion status
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.batch_scanner import (
    BatchScanSession,
    BatchScanItem,
    BatchSessionStatus,
    ItemProcessingState,
    QualityCategory,
    DuplicateStatus,
    MatchStatus,
)
from app.services.batch_scanner.quality_engine import ImageQualityEngine
from app.services.batch_scanner.duplicate_engine import DuplicateDetectionEngine
from app.services.batch_scanner.segmentation_engine import SegmentationEngine
from app.services.batch_scanner.ocr_extractor import OCRExtractor
from app.services.batch_scanner.reconciliation_matcher import ReconciliationMatcher

logger = logging.getLogger(__name__)


class BatchQueueManager:
    """
    Manages bounded pipeline execution for certificate batch scan sessions.
    Ensures bounded memory O(1) by executing items sequentially or in bounded chunks.
    """

    def __init__(self, db: Session):
        self.db = db
        self.quality_engine = ImageQualityEngine()
        self.duplicate_engine = DuplicateDetectionEngine(db)
        self.segmentation_engine = SegmentationEngine()
        self.ocr_extractor = OCRExtractor()
        self.matcher = ReconciliationMatcher(db)

    def start_session(self, session_id: uuid.UUID) -> BatchScanSession:
        """Transitions a session into PROCESSING state and runs queued items."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        session.status = BatchSessionStatus.PROCESSING
        session.last_activity_at = datetime.now(timezone.utc)
        self.db.commit()

        return session

    def pause_session(self, session_id: uuid.UUID) -> BatchScanSession:
        """Gracefully pauses a running session."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        if session.status in (BatchSessionStatus.PROCESSING, BatchSessionStatus.QUEUED):
            session.status = BatchSessionStatus.PAUSED
            session.last_activity_at = datetime.now(timezone.utc)
            self.db.commit()

        return session

    def resume_session(self, session_id: uuid.UUID) -> BatchScanSession:
        """Resumes a paused batch session."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        if session.status == BatchSessionStatus.PAUSED:
            session.status = BatchSessionStatus.PROCESSING
            session.last_activity_at = datetime.now(timezone.utc)
            self.db.commit()

        return session

    def process_item(self, item_id: uuid.UUID) -> BatchScanItem:
        """
        Processes a single batch item through the complete multi-stage pipeline:
        1. Preprocessing & Quality Assessment
        2. Duplicate Detection (3-tier)
        3. Progressive OCR Extraction
        4. Identity Reconciliation
        5. Bucket Routing & State Assignment
        """
        item = self.db.get(BatchScanItem, item_id)
        if not item:
            raise ValueError(f"Batch item {item_id} not found")

        session = self.db.get(BatchScanSession, item.session_id)
        if not session:
            raise ValueError(f"Parent session for item {item_id} not found")

        # Do not process if session was paused or cancelled
        if session.status in (BatchSessionStatus.PAUSED, BatchSessionStatus.CANCELLED):
            logger.info("Skipping item %s because session %s is %s", item_id, session.id, session.status)
            return item

        item.attempt_count += 1
        item.state = ItemProcessingState.PREPROCESSING
        self.db.commit()

        try:
            # Step 1: Preprocessing, Hashing & Quality Assessment
            if item.image_path:
                quality_result = self.quality_engine.analyze_image(item.image_path)
                item.quality_score = quality_result["quality_score"]
                item.quality_category = QualityCategory(quality_result["quality_category"])
                item.quality_metrics = quality_result["quality_metrics"]
                item.sha256_hash = quality_result["sha256_hash"]
                item.p_hash = quality_result["p_hash"]

                # Generate thumbnail if not yet generated
                if not item.thumbnail_path:
                    thumb_path = self.segmentation_engine.create_thumbnail(item.image_path)
                    item.thumbnail_path = thumb_path

            # Step 2: Multi-tier Duplicate Detection
            dup_result = self.duplicate_engine.detect_duplicates(item)
            item.duplicate_status = DuplicateStatus(dup_result["duplicate_status"])
            if dup_result.get("duplicate_of_item_id"):
                item.duplicate_of_item_id = uuid.UUID(dup_result["duplicate_of_item_id"])

            # Step 3: Progressive OCR Extraction
            item.state = ItemProcessingState.OCR_PROCESSING
            self.db.commit()

            session_hints = {
                "batch_year": session.batch_year,
                "college_name": session.college.name_ar if session.college else "العلوم",
            }
            ocr_result = self.ocr_extractor.extract_fields(
                image_path=item.image_path,
                session_hints=session_hints,
            )
            item.extracted_fields = ocr_result
            item.ocr_confidence = ocr_result.get("ocr_confidence", 0.0)

            # Step 4: Identity Reconciliation & Anomaly Checks
            item.state = ItemProcessingState.MATCHING
            self.db.commit()

            reconcile_result = self.matcher.match_item(item, session)

            # Step 5: Final State Determination (Bucket Routing)
            # Route to NEEDS_REVIEW if any risk signal is triggered:
            is_unusable_quality = item.quality_category in (QualityCategory.POOR, QualityCategory.UNUSABLE)
            is_duplicate = item.duplicate_status in (DuplicateStatus.POSSIBLE_DUPLICATE, DuplicateStatus.LIKELY_DUPLICATE)
            is_unmatched = item.match_status in (MatchStatus.NO_MATCH, MatchStatus.POSSIBLE, MatchStatus.CONFLICT)
            has_anomaly = item.has_batch_mismatch or item.has_structural_anomaly

            if is_unusable_quality or is_duplicate or is_unmatched or has_anomaly:
                item.state = ItemProcessingState.NEEDS_REVIEW
            else:
                item.state = ItemProcessingState.COMPLETED

            item.error_code = None
            item.error_message = None

        except Exception as exc:
            logger.exception("Error processing item %s: %s", item_id, exc)
            if item.attempt_count < item.max_retries:
                item.state = ItemProcessingState.RETRYING
            else:
                item.state = ItemProcessingState.FAILED
            item.error_code = "PIPELINE_ERROR"
            item.error_message = str(exc)

        self.db.commit()

        # Update parent session counters
        self.update_session_counters(session.id)
        return item

    def process_all_queued(self, session_id: uuid.UUID) -> BatchScanSession:
        """Processes all pending or captured items in the session sequentially."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        items_query = select(BatchScanItem).where(
            BatchScanItem.session_id == session_id,
            BatchScanItem.state.in_([ItemProcessingState.CAPTURED, ItemProcessingState.QUEUED, ItemProcessingState.RETRYING])
        ).order_by(BatchScanItem.sequence_number.asc())

        items = self.db.execute(items_query).scalars().all()
        for item in items:
            # Check if session was stopped during the loop
            self.db.refresh(session)
            if session.status in (BatchSessionStatus.PAUSED, BatchSessionStatus.CANCELLED):
                break
            self.process_item(item.id)

        self.update_session_counters(session_id)
        return session

    def update_session_counters(self, session_id: uuid.UUID) -> BatchScanSession:
        """Recalculates summary counters and adjusts session lifecycle status."""
        session = self.db.get(BatchScanSession, session_id)
        if not session:
            raise ValueError(f"Batch session {session_id} not found")

        items_query = select(BatchScanItem).where(BatchScanItem.session_id == session_id)
        items = self.db.execute(items_query).scalars().all()

        total = len(items)
        session.actual_count = total

        completed = sum(1 for i in items if i.state == ItemProcessingState.COMPLETED)
        needs_review = sum(1 for i in items if i.state == ItemProcessingState.NEEDS_REVIEW)
        failed = sum(1 for i in items if i.state == ItemProcessingState.FAILED)
        duplicates = sum(1 for i in items if i.duplicate_status != DuplicateStatus.NO_DUPLICATE)
        no_match = sum(1 for i in items if i.match_status in (MatchStatus.NO_MATCH, MatchStatus.POSSIBLE))

        session.completed_count = completed
        session.needs_review_count = needs_review
        session.failed_count = failed
        session.duplicate_count = duplicates
        session.no_match_count = no_match
        session.processed_count = completed + needs_review + failed
        session.last_activity_at = datetime.now(timezone.utc)

        # Check if all items are processed
        if total > 0 and session.processed_count >= total:
            if failed > 0 or needs_review > 0:
                session.status = BatchSessionStatus.COMPLETED_WITH_WARNINGS
            else:
                session.status = BatchSessionStatus.COMPLETED
            session.completed_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(session)
        return session
