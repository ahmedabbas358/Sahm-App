"""
Sahm Backend — Human Feedback & Error Quarantine Engine (Prompt 19)
Captures operator review corrections, classifies root causes, and strictly enforces training quarantine.
"""
from typing import Dict, Any, Optional

from app.models.ai_governance import FeedbackType, ErrorCategory, HumanFeedback


class FeedbackQuarantineViolation(Exception):
    """Raised if an attempt is made to automatically train on unquarantined feedback."""
    pass


def classify_error_taxonomy(ai_val: str, human_val: str, field: str) -> ErrorCategory:
    """
    Automatically infers the specific error category from the difference between
    the AI suggestion and human correction.
    """
    ai_clean = ai_val.strip()
    human_clean = human_val.strip()

    # Digits check (Student ID / Cert Number)
    if "id" in field.lower() or "number" in field.lower() or ai_clean.isdigit():
        if len(ai_clean) != len(human_clean):
            return ErrorCategory.OCR_MISSING_CHARACTER
        return ErrorCategory.OCR_WRONG_DIGIT

    # Name check
    if "name" in field.lower():
        if len(human_clean.split()) > len(ai_clean.split()):
            return ErrorCategory.OCR_MISSING_CHARACTER
        return ErrorCategory.NAME_NORMALIZATION_ERROR

    return ErrorCategory.OCR_WRONG_CHARACTER


def attribute_root_cause(error_category: ErrorCategory, image_quality_score: float = 0.85) -> str:
    """
    Identifies the underlying layer responsible for the error.
    """
    if image_quality_score < 0.60:
        return "image_quality_issue"
    if error_category in [ErrorCategory.OCR_WRONG_DIGIT, ErrorCategory.OCR_MISSING_CHARACTER]:
        return "ocr_model_issue"
    if error_category == ErrorCategory.NAME_NORMALIZATION_ERROR:
        return "normalization_issue"
    if error_category in [ErrorCategory.MATCH_FALSE_POSITIVE, ErrorCategory.MATCH_FALSE_NEGATIVE]:
        return "matching_algorithm_issue"
    return "ocr_issue"


def assert_feedback_quarantined(feedback: HumanFeedback) -> None:
    """
    Enforces Rule 5: Human feedback does not automatically become training data.
    """
    if not feedback.is_quarantined and not feedback.approved_for_evaluation:
        raise FeedbackQuarantineViolation(
            f"Security Gate Violation: Feedback record {feedback.id} cannot be injected into "
            f"model training pipeline without explicit human quality review and dataset versioning."
        )
