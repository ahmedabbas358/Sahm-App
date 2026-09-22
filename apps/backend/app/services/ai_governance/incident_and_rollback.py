"""
Sahm Backend — Incident Management & Safe Rollback Coordinator (Prompt 19)
Handles emergency model disablement, version rollback, and safe side-by-side reprocessing.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.models.ai_governance import ModelStatus, AIModel, AIIncident, IncidentSeverity, IncidentStatus


def emergency_disable_model(model: AIModel, reason: str, actor_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Instantly disables a misbehaving model, preventing any new jobs from using it.
    Historical records processed by this model remain intact with provenance preserved.
    """
    model.status = ModelStatus.DISABLED
    model.is_champion = False

    return {
        "model_id": str(model.id),
        "model_identifier": model.model_identifier,
        "previous_status": "active",
        "new_status": ModelStatus.DISABLED.value,
        "disabled_at": datetime.now(timezone.utc).isoformat(),
        "reason": reason,
        "actor_id": actor_id or "system_admin",
    }


def prepare_reprocessing_comparison(
    original_data: Dict[str, Any],
    reprocessed_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Builds side-by-side comparison between Version A (Original) and Version B (Reprocessed).
    Enforces Rule: Reprocessing never silently overwrites official student records.
    """
    differences = {}
    orig_fields = original_data.get("extracted_fields", {})
    new_fields = reprocessed_data.get("extracted_fields", {})

    all_keys = set(orig_fields.keys()).union(set(new_fields.keys()))
    for key in all_keys:
        val_a = str(orig_fields.get(key, "")).strip()
        val_b = str(new_fields.get(key, "")).strip()
        if val_a != val_b:
            differences[key] = {
                "version_a_original": val_a,
                "version_b_reprocessed": val_b,
                "confidence_a": original_data.get("confidence", 0.0),
                "confidence_b": reprocessed_data.get("confidence", 0.0),
            }

    return {
        "has_discrepancies": len(differences) > 0,
        "discrepancies_count": len(differences),
        "field_comparisons": differences,
        "requires_human_selection": True,
    }
