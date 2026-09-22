"""
Sahm Backend — AI Governance & Intelligence Package (Prompt 19)
"""
from app.services.ai_governance.provider_abstraction import (
    AIProvider,
    AIResult,
    LocalOCRProvider,
    HandwritingProvider,
    ApprovedCloudOCRProvider,
)
from app.services.ai_governance.registry_service import (
    validate_version_immutability,
    build_version_fingerprint,
    ModelRegistryError,
)
from app.services.ai_governance.metrics_engine import (
    calculate_cer,
    calculate_wer,
    normalize_arabic_for_search,
    calculate_arabic_accuracy_levels,
    calculate_matching_safety_metrics,
    levenshtein_distance,
)
from app.services.ai_governance.router_engine import (
    AIRouter,
    PrivacyViolationError,
)
from app.services.ai_governance.calibration_engine import (
    CalibrationEngine,
)
from app.services.ai_governance.feedback_engine import (
    classify_error_taxonomy,
    attribute_root_cause,
    assert_feedback_quarantined,
    FeedbackQuarantineViolation,
)
from app.services.ai_governance.drift_detector import (
    DriftDetector,
)
from app.services.ai_governance.incident_and_rollback import (
    emergency_disable_model,
    prepare_reprocessing_comparison,
)
from app.services.ai_governance.synthetic_generator import (
    generate_synthetic_record,
    generate_synthetic_dataset,
)

__all__ = [
    "AIProvider",
    "AIResult",
    "LocalOCRProvider",
    "HandwritingProvider",
    "ApprovedCloudOCRProvider",
    "validate_version_immutability",
    "build_version_fingerprint",
    "ModelRegistryError",
    "calculate_cer",
    "calculate_wer",
    "normalize_arabic_for_search",
    "calculate_arabic_accuracy_levels",
    "calculate_matching_safety_metrics",
    "levenshtein_distance",
    "AIRouter",
    "PrivacyViolationError",
    "CalibrationEngine",
    "classify_error_taxonomy",
    "attribute_root_cause",
    "assert_feedback_quarantined",
    "FeedbackQuarantineViolation",
    "DriftDetector",
    "emergency_disable_model",
    "prepare_reprocessing_comparison",
    "generate_synthetic_record",
    "generate_synthetic_dataset",
]
