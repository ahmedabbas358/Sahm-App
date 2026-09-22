"""
Sahm Backend — Data Loss Prevention (DLP) & Privacy Inspector (Prompt 22)
Validates handoff payloads against institutional security constraints,
blocks unauthorized external transfers, and formats watermarks.
"""
from typing import Dict, Any, List, Tuple


class DLPInspector:
    """Enforces DLP rules, field restrictions, and watermark generation."""

    SENSITIVE_KEYS = {"national_id", "phone_number", "ssn", "personal_email", "financial_record"}

    @classmethod
    def inspect_payload(
        cls,
        items: List[Dict[str, Any]],
        data_classification: str,
        is_external_recipient: bool,
        allow_external_sharing: bool = False,
    ) -> Dict[str, Any]:
        """
        Inspect bundle items for restricted fields and evaluate institutional DLP compliance.
        """
        sensitive_counts = {k: 0 for k in cls.SENSITIVE_KEYS}
        violations = []

        for item in items:
            for k in cls.SENSITIVE_KEYS:
                if item.get(k):
                    sensitive_counts[k] += 1

        # Check external recipient rule
        if is_external_recipient and not allow_external_sharing:
            violations.append(
                f"Data classification '{data_classification}' strictly prohibits sharing with external recipients."
            )

        if is_external_recipient and sensitive_counts.get("national_id", 0) > 0:
            violations.append(
                f"Package contains {sensitive_counts['national_id']} unmasked National IDs; external transfer blocked."
            )

        is_compliant = len(violations) == 0

        return {
            "is_compliant": is_compliant,
            "violations": violations,
            "sensitive_counts": sensitive_counts,
            "total_items_scanned": len(items),
        }

    @classmethod
    def generate_preview_watermark(cls, recipient_name: str, timestamp_str: str) -> str:
        """Generate official review watermark text."""
        return f"INTERNAL REVIEW COPY • SHARED WITH: {recipient_name.upper()} • {timestamp_str}"
