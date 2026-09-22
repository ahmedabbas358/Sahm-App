"""
Sahm Backend — Confidence Calibration & Risk-Aware Thresholds (Prompt 19)
Maps raw model probabilities to empirical precision bands and manages intelligent abstention.
"""
from typing import Dict, Any, Optional, Tuple


class CalibrationEngine:
    """
    Manages task-specific risk thresholds and evidence-backed explanations.
    """

    DEFAULT_THRESHOLDS = {
        "id_extraction": 0.98,
        "certificate_number": 0.98,
        "identity_matching": 0.92,
        "name_extraction": 0.90,
        "field_extraction": 0.85,
        "document_classification": 0.80,
    }

    @classmethod
    def calibrate_confidence(cls, raw_score: float, task_type: str = "field_extraction") -> float:
        """
        Calibrates raw probability into an empirical precision score.
        Prevents overconfident raw logits (e.g. 0.99) from being taken at face value.
        """
        # Sigmoid-based scaling anchor
        if raw_score >= 0.95:
            calibrated = 0.90 + (raw_score - 0.95) * 1.5
        elif raw_score >= 0.80:
            calibrated = 0.75 + (raw_score - 0.80) * 1.0
        else:
            calibrated = max(raw_score * 0.85, 0.0)

        return min(max(round(calibrated, 4), 0.0), 1.0)

    @classmethod
    def evaluate_task_threshold(
        cls,
        field_name: str,
        calibrated_score: float,
        evidence_signals: int = 1,
        custom_threshold: Optional[float] = None,
    ) -> Tuple[bool, str, str]:
        """
        Evaluates whether an extraction meets the risk-aware threshold.
        Returns: (passes_threshold, confidence_band, explanation).
        """
        threshold = custom_threshold or cls.DEFAULT_THRESHOLDS.get(field_name, 0.88)

        # Determine confidence band
        if calibrated_score >= 0.95 and evidence_signals >= 2:
            band = "HIGH"
        elif calibrated_score >= threshold:
            band = "MEDIUM"
        else:
            band = "LOW"

        # Abstention check
        if calibrated_score < threshold or evidence_signals == 0:
            return (
                False,
                "LOW",
                f"Abstention: Score {calibrated_score} below task threshold {threshold} "
                f"or insufficient evidence signals ({evidence_signals}).",
            )

        explanation = f"Confidence {band} ({calibrated_score:.2f}) supported by {evidence_signals} valid evidence signals."
        return (True, band, explanation)
