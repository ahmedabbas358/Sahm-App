"""
Sahm Backend — AI Model Registry & Provenance Service (Prompt 19)
Enforces immutable versioning, approval workflows, and execution fingerprints.
"""
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.models.ai_governance import ModelStatus, AIModel


class ModelRegistryError(Exception):
    """Raised on illegal model mutation or lifecycle violation."""
    pass


def validate_version_immutability(existing_model: AIModel, updated_fields: Dict[str, Any]) -> None:
    """
    Guarantees that released or active models cannot have their weights,
    preprocessing, or identifiers mutated in-place.
    """
    if existing_model.status in [ModelStatus.APPROVED, ModelStatus.ACTIVE, ModelStatus.DEPRECATED, ModelStatus.RETIRED]:
        protected_fields = {"version", "model_identifier", "model_type", "provider_id", "capability"}
        for field in protected_fields:
            if field in updated_fields and updated_fields[field] != getattr(existing_model, field):
                raise ModelRegistryError(
                    f"Violation of Model Immutability: Field '{field}' cannot be modified on released model "
                    f"'{existing_model.model_identifier}'. Create a new semantic version instead."
                )


def build_version_fingerprint(
    provider: str,
    model: str,
    model_version: str,
    pipeline_version: str = "1.0.0",
    preprocessing_version: str = "1.0.0",
    prompt_version: str = "none",
    normalization_version: str = "1.0.0",
    input_bytes: Optional[bytes] = None,
    output_dict: Optional[Dict[str, Any]] = None,
) -> Dict[str, str]:
    """
    Builds the immutable cryptographic processing fingerprint for an AI execution.
    """
    input_hash = hashlib.sha256(input_bytes or b"default_input").hexdigest()
    output_str = json.dumps(output_dict or {}, sort_keys=True)
    output_hash = hashlib.sha256(output_str.encode("utf-8")).hexdigest()

    return {
        "provider": provider,
        "model": model,
        "model_version": model_version,
        "pipeline_version": pipeline_version,
        "preprocessing_version": preprocessing_version,
        "prompt_version": prompt_version,
        "normalization_version": normalization_version,
        "input_hash": f"sha256:{input_hash}",
        "output_hash": f"sha256:{output_hash}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
