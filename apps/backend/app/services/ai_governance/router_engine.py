"""
Sahm Backend — AI Model Routing Engine (Prompt 19)
Routes AI inference tasks based on capability, modality, image quality,
and enforces the STRICT_LOCAL hard privacy constraint.
"""
from typing import Dict, Any, List, Optional, Tuple

from app.models.ai_governance import (
    ModelCapability,
    PrivacyClassification,
    AIGovernancePolicy,
)
from app.services.ai_governance.provider_abstraction import (
    AIProvider,
    LocalOCRProvider,
    HandwritingProvider,
    ApprovedCloudOCRProvider,
    AIResult,
)


class PrivacyViolationError(Exception):
    """Raised when an action violates institutional privacy policy."""
    pass


class AIRouter:
    """
    Intelligent router directing inference tasks according to capability,
    document characteristics, and strict institutional privacy policies.
    """

    def __init__(self):
        self.providers: Dict[str, AIProvider] = {
            "local_tesseract": LocalOCRProvider(),
            "self_hosted_handwriting": HandwritingProvider(),
            "cloud_enterprise_vision": ApprovedCloudOCRProvider(),
        }

    def resolve_provider(
        self,
        capability: ModelCapability,
        is_handwritten: bool = False,
        language: str = "ar",
        policy: Optional[AIGovernancePolicy] = None,
    ) -> AIProvider:
        """
        Determines the optimal approved provider.
        Enforces STRICT_LOCAL as an absolute hard rule.
        """
        privacy_mode = policy.privacy_mode if policy else PrivacyClassification.STRICT_LOCAL

        # 1. Modality selection
        if is_handwritten or capability == ModelCapability.HANDWRITING_OCR:
            selected_provider = self.providers["self_hosted_handwriting"]
        else:
            selected_provider = self.providers["local_tesseract"]

        # 2. Hard Privacy Rule Enforcement
        if privacy_mode == PrivacyClassification.STRICT_LOCAL:
            if selected_provider.provider_type == "cloud":
                raise PrivacyViolationError(
                    f"Privacy Policy STRICT_LOCAL blocks provider '{selected_provider.provider_id}'. "
                    f"External cloud processing is strictly prohibited."
                )

        return selected_provider

    async def execute_routed_task(
        self,
        capability: ModelCapability,
        input_data: Dict[str, Any],
        is_handwritten: bool = False,
        language: str = "ar",
        policy: Optional[AIGovernancePolicy] = None,
    ) -> AIResult:
        """
        Resolves provider and executes inference with safety constraints.
        """
        provider = self.resolve_provider(
            capability=capability,
            is_handwritten=is_handwritten,
            language=language,
            policy=policy,
        )
        return await provider.execute(capability=capability, input_data=input_data)

    def evaluate_multi_model_agreement(
        self,
        result_a: Dict[str, Any],
        result_b: Dict[str, Any],
        critical_fields: Optional[List[str]] = None,
    ) -> Tuple[bool, List[str]]:
        """
        Compares outputs from two models.
        Returns (is_agreed, list_of_discrepancies).
        """
        fields_to_check = critical_fields or ["student_name", "university_id", "certificate_number"]
        discrepancies = []

        fields_a = result_a.get("extracted_fields", {})
        fields_b = result_b.get("extracted_fields", {})

        for f in fields_to_check:
            val_a = str(fields_a.get(f, "")).strip()
            val_b = str(fields_b.get(f, "")).strip()
            if val_a and val_b and val_a != val_b:
                discrepancies.append(f)

        return (len(discrepancies) == 0, discrepancies)
