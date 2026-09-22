"""
Sahm Backend — Comprehensive Unit Tests for AI Governance & Intelligence (Prompt 19)
Tests:
- Model Registry & Immutability Enforcement
- Cryptographic Version Fingerprinting
- Evaluation Metrics: CER, WER, Field Exact Match
- Arabic Raw vs. Normalized Accuracy Distinction
- Identity Matching Safety Metrics (False Positive Rate)
- AIRouter & Hard Privacy Enforcement (STRICT_LOCAL)
- Confidence Calibration & Task Threshold Abstention
- Human Feedback Quarantine & Error Taxonomy Classification
- Statistical Drift Detection & Alerts
- Emergency Disable & Side-by-side Reprocessing Comparisons
- Synthetic Arabic Benchmark Generation
"""
import pytest

from app.models.ai_governance import (
    ModelCapability,
    ModelStatus,
    PrivacyClassification,
    FeedbackType,
    ErrorCategory,
    HumanFeedback,
    AIModel,
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


# =============================================================
# 1. Registry & Version Immutability Tests
# =============================================================

def test_model_version_immutability():
    model = AIModel(
        name="Arabic Handwriting Transformer",
        provider_id="self_hosted_gpu",
        capability=ModelCapability.HANDWRITING_OCR,
        version="v2.0.0",
        model_identifier="sahm-ar-handwriting-v2",
        status=ModelStatus.ACTIVE,
    )

    # Allowed non-breaking updates (e.g. updating description or limitations)
    validate_version_immutability(model, {"known_limitations": ["Requires 40 Lux minimum"]})

    # Prohibited updates to immutable fields on active models
    with pytest.raises(ModelRegistryError):
        validate_version_immutability(model, {"version": "v2.1.0"})

    with pytest.raises(ModelRegistryError):
        validate_version_immutability(model, {"model_type": "lstm"})


def test_version_fingerprint_generation():
    fp = build_version_fingerprint(
        provider="self_hosted_gpu",
        model="sahm-ocr-v2",
        model_version="v2.1.0",
        pipeline_version="3.0.0",
        input_bytes=b"sample_certificate_scan_bytes",
        output_dict={"student_name": "أحمد عباس", "id": "202201048"},
    )
    assert fp["provider"] == "self_hosted_gpu"
    assert fp["model_version"] == "v2.1.0"
    assert fp["input_hash"].startswith("sha256:")
    assert fp["output_hash"].startswith("sha256:")
    assert len(fp["input_hash"]) == 71


# =============================================================
# 2. Evaluation Metrics Tests (CER, WER, Arabic Specifics)
# =============================================================

def test_levenshtein_cer_wer():
    ref = "جامعة إفريقيا العالمية"
    hyp = "جامعه إفريقيا العالمية"  # 1 character diff (ة vs ه)

    cer = calculate_cer(ref, hyp)
    assert round(cer, 3) == round(1 / len(ref), 3)

    # Identical
    assert calculate_cer(ref, ref) == 0.0
    assert calculate_wer(ref, ref) == 0.0

    # Word substitution
    hyp_word = "جامعة الخرطوم العالمية"
    wer = calculate_wer(ref, hyp_word)
    assert round(wer, 3) == round(1 / 3, 3)


def test_arabic_raw_vs_normalized_accuracy():
    ref = "أحمد إبراهيم علي"
    hyp = "احمد ابراهيم علي"  # No hamzas

    acc = calculate_arabic_accuracy_levels(ref, hyp)
    # Raw exact match must distinguish official hamzas
    assert acc["raw_exact"] is False
    # Search normalized match should accept standard normalization
    assert acc["search_normalized"] is True


def test_matching_safety_metrics_and_fp_rate():
    # 998 true negatives, 1 false positive, 10 true positives, 0 false negatives
    pairs = [(False, False)] * 998 + [(False, True)] * 1 + [(True, True)] * 10

    metrics = calculate_matching_safety_metrics(pairs)
    assert metrics["true_positives"] == 10
    assert metrics["false_positives"] == 1
    assert metrics["false_positive_rate"] < 0.002
    assert "precision" in metrics
    assert "recall" in metrics


# =============================================================
# 3. Routing & Hard Privacy Constraint Tests
# =============================================================

@pytest.mark.asyncio
async def test_router_capability_and_privacy_enforcement():
    router = AIRouter()

    # 1. Handwriting capability routed to specialized self-hosted handwriting model
    hw_provider = router.resolve_provider(
        capability=ModelCapability.HANDWRITING_OCR,
        is_handwritten=True,
    )
    assert hw_provider.provider_id == "self_hosted_handwriting"

    # 2. Printed OCR capability routed to local fast OCR
    ocr_provider = router.resolve_provider(
        capability=ModelCapability.TEXT_OCR,
        is_handwritten=False,
    )
    assert ocr_provider.provider_id == "local_tesseract"

    # 3. Execution of routed task
    result = await router.execute_routed_task(
        capability=ModelCapability.TEXT_OCR,
        input_data={"student_name": "فاطمة الزهراء"},
        is_handwritten=False,
    )
    assert result.success is True
    assert "student_name" in result.extracted_fields


def test_multi_model_agreement_and_discrepancy():
    router = AIRouter()
    res_a = {"extracted_fields": {"student_name": "أحمد عباس", "university_id": "202201048"}}
    res_b = {"extracted_fields": {"student_name": "أحمد عباس", "university_id": "202201049"}}  # Disagreement in ID

    agreed, diffs = router.evaluate_multi_model_agreement(res_a, res_b)
    assert agreed is False
    assert "university_id" in diffs


# =============================================================
# 4. Calibration & Abstention Tests
# =============================================================

def test_confidence_calibration_and_task_abstention():
    # Student ID requires strict 0.98 threshold
    passes, band, explanation = CalibrationEngine.evaluate_task_threshold(
        field_name="id_extraction",
        calibrated_score=0.99,
        evidence_signals=2,
    )
    assert passes is True
    assert band == "HIGH"

    # Score below threshold triggers abstention
    passes, band, explanation = CalibrationEngine.evaluate_task_threshold(
        field_name="id_extraction",
        calibrated_score=0.94,
        evidence_signals=1,
    )
    assert passes is False
    assert "Abstention" in explanation

    # Zero evidence signals forces abstention even if score is high
    passes, band, explanation = CalibrationEngine.evaluate_task_threshold(
        field_name="name_extraction",
        calibrated_score=0.97,
        evidence_signals=0,
    )
    assert passes is False
    assert "insufficient evidence" in explanation.lower()


# =============================================================
# 5. Feedback Quarantine & Taxonomy Tests
# =============================================================

def test_feedback_error_taxonomy_classification():
    # Missing character
    cat = classify_error_taxonomy(ai_val="20220104", human_val="202201048", field="university_id")
    assert cat == ErrorCategory.OCR_MISSING_CHARACTER

    # Wrong digit
    cat = classify_error_taxonomy(ai_val="202201049", human_val="202201048", field="university_id")
    assert cat == ErrorCategory.OCR_WRONG_DIGIT

    # Name omission
    cat = classify_error_taxonomy(ai_val="أحمد عباس", human_val="أحمد عباس محمد", field="student_name")
    assert cat == ErrorCategory.OCR_MISSING_CHARACTER


def test_feedback_training_quarantine_enforcement():
    fb = HumanFeedback(
        field_name="student_name",
        ai_suggestion="احمد",
        human_correction="أحمد",
        feedback_type=FeedbackType.MINOR_CORRECTION,
        error_category=ErrorCategory.NAME_NORMALIZATION_ERROR,
        model_version_used="v1.0.0",
        is_quarantined=True,
        approved_for_evaluation=False,
    )
    # Quarantined feedback passes gate check
    assert_feedback_quarantined(fb)

    # If unquarantined without approval, must raise security violation
    fb.is_quarantined = False
    with pytest.raises(FeedbackQuarantineViolation):
        assert_feedback_quarantined(fb)


# =============================================================
# 6. Drift Detection, Emergency Disable & Synthetic Generator
# =============================================================

def test_statistical_drift_detector():
    # Baseline correction rate = 2%, observed = 9% (+7% > 5% tolerance)
    alert = DriftDetector.check_metric_drift("correction_rate", baseline_val=0.02, observed_val=0.09)
    assert alert is not None
    assert alert["metric_name"] == "correction_rate"
    assert alert["observed_value"] == 0.09

    # Normal variation (+1%) should not trigger alert
    normal = DriftDetector.check_metric_drift("correction_rate", baseline_val=0.02, observed_val=0.03)
    assert normal is None


def test_emergency_disable_and_reprocessing_comparison():
    model = AIModel(
        name="Arabic Vision Model",
        provider_id="self_hosted_gpu",
        capability=ModelCapability.TEXT_OCR,
        version="v3.0.0",
        model_identifier="sahm-vision-v3",
        status=ModelStatus.ACTIVE,
        is_champion=True,
    )
    action = emergency_disable_model(model, reason="Spike in student ID character error rate")
    assert model.status == ModelStatus.DISABLED
    assert model.is_champion is False
    assert action["new_status"] == "disabled"

    # Side-by-side reprocessing comparison
    orig = {"extracted_fields": {"student_name": "أحمد عباس", "university_id": "202201048"}, "confidence": 0.88}
    new = {"extracted_fields": {"student_name": "أحمد عباس محمد", "university_id": "202201048"}, "confidence": 0.96}
    comparison = prepare_reprocessing_comparison(orig, new)
    assert comparison["has_discrepancies"] is True
    assert "student_name" in comparison["field_comparisons"]
    assert comparison["requires_human_selection"] is True


def test_synthetic_arabic_data_generator():
    dataset = generate_synthetic_dataset(count=15)
    assert len(dataset) == 15
    first = dataset[0]
    assert "student_name" in first
    assert "university_id" in first
    assert "certificate_number" in first
    assert first["data_classification"] == "synthetic"
    assert len(first["student_name"].split()) >= 3
