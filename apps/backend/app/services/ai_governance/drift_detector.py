"""
Sahm Backend — Drift Detection & Anomaly Monitoring (Prompt 19)
Monitors statistical drift in accuracy, confidence distribution, review rate, and template layouts.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.models.ai_governance import IncidentSeverity


class DriftDetector:
    """
    Evaluates rolling metrics against historical baselines to detect degradation.
    """

    DEFAULT_TOLERANCES = {
        "correction_rate": 0.05,       # +5% increase triggers alert
        "review_rate": 0.08,           # +8% increase triggers alert
        "confidence_shift": -0.06,     # -6% drop triggers alert
        "unknown_template_rate": 0.03, # >3% unknown templates triggers alert
    }

    @classmethod
    def check_metric_drift(
        cls,
        metric_name: str,
        baseline_val: float,
        observed_val: float,
        tolerance_override: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Compares observed rolling value with baseline.
        Returns drift alert payload if threshold is breached, or None.
        """
        tolerance = tolerance_override or cls.DEFAULT_TOLERANCES.get(metric_name, 0.05)
        diff = observed_val - baseline_val

        is_drift = False
        if "confidence" in metric_name or "accuracy" in metric_name:
            # Negative shift is bad
            if diff < tolerance:
                is_drift = True
        else:
            # Positive increase in error/review rate is bad
            if diff > tolerance:
                is_drift = True

        if is_drift:
            severity = IncidentSeverity.HIGH if abs(diff) > tolerance * 2 else IncidentSeverity.MEDIUM
            return {
                "metric_name": metric_name,
                "baseline_value": round(baseline_val, 4),
                "observed_value": round(observed_val, 4),
                "threshold": round(baseline_val + tolerance, 4),
                "severity": severity,
                "details": f"Statistical drift detected in '{metric_name}': shifted from {baseline_val:.2%} to {observed_val:.2%}.",
                "detected_at": datetime.now(timezone.utc).isoformat(),
            }

        return None
