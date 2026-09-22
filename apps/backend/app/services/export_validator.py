"""
Sahm Backend — Export Validation Engine & Privacy Guard (Section 14 & 27)
Performs comprehensive pre-generation validation covering data integrity,
layout constraints, privacy rules, and pagination predictability.
"""
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field


class ValidationIssue(BaseModel):
    category: str  # "data", "layout", "privacy", "pagination"
    severity: str  # "error", "warning", "info"
    field: Optional[str] = None
    message: str
    message_ar: str
    record_index: Optional[int] = None


class ValidationReport(BaseModel):
    is_valid: bool
    ready_to_export: bool
    total_records: int
    passed_checks: List[str] = Field(default_factory=list)
    errors: List[ValidationIssue] = Field(default_factory=list)
    warnings: List[ValidationIssue] = Field(default_factory=list)
    privacy_cleared: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExportValidator:
    """
    Validates datasets and template configurations before file generation.
    Enforces privacy guards on public outputs and prevents malformed layouts.
    """

    # Fields that must NEVER be leaked in public publications
    RESTRICTED_PUBLIC_FIELDS: Set[str] = {
        "phone",
        "phone_number",
        "email",
        "national_id",
        "passport_number",
        "delivery_notes",
        "notes",
        "raw_ocr_notes",
        "confidence_name",
        "confidence_id",
        "reviewer_id",
        "source_image_id",
    }

    @classmethod
    def validate(
        cls,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        is_public_publication: bool = False,
        require_approved_state: bool = True,
    ) -> ValidationReport:
        errors: List[ValidationIssue] = []
        warnings: List[ValidationIssue] = []
        passed_checks: List[str] = []

        total_records = len(records)

        # -------------------------------------------------------------
        # 1. Data Integrity Validation
        # -------------------------------------------------------------
        if total_records == 0:
            errors.append(
                ValidationIssue(
                    category="data",
                    severity="error",
                    message="The dataset contains zero records. Nothing to export.",
                    message_ar="مجموعة البيانات لا تحتوي على أي سجلات. لا يمكن بدء التصدير.",
                )
            )
        else:
            passed_checks.append("records_count_positive")

        seen_ids: Set[str] = set()
        duplicate_ids: List[str] = []
        missing_id_count = 0
        missing_name_count = 0
        unapproved_count = 0

        for idx, rec in enumerate(records):
            # Check student name
            name = rec.get("student_name")
            if not name or not str(name).strip():
                missing_name_count += 1
                if missing_name_count <= 5:
                    errors.append(
                        ValidationIssue(
                            category="data",
                            severity="error",
                            field="student_name",
                            record_index=idx,
                            message=f"Row #{idx + 1} has an empty student name.",
                            message_ar=f"الصف #{idx + 1} لا يحتوي على اسم الطالب.",
                        )
                    )

            # Check University ID
            uid = rec.get("university_id")
            if not uid or not str(uid).strip():
                missing_id_count += 1
                if missing_id_count <= 5:
                    warnings.append(
                        ValidationIssue(
                            category="data",
                            severity="warning",
                            field="university_id",
                            record_index=idx,
                            message=f"Row #{idx + 1} ({name or 'Unknown'}) is missing a university ID.",
                            message_ar=f"الصف #{idx + 1} ({name or 'غير معروف'}) ينقصه الرقم الجامعي.",
                        )
                    )
            else:
                uid_str = str(uid).strip()
                if uid_str in seen_ids:
                    duplicate_ids.append(uid_str)
                else:
                    seen_ids.add(uid_str)

            # Check approval status if required
            status = rec.get("status")
            if require_approved_state and status not in ["approved", "cert_ready", "delivered"]:
                unapproved_count += 1

        if missing_id_count > 0:
            warnings.append(
                ValidationIssue(
                    category="data",
                    severity="warning",
                    field="university_id",
                    message=f"{missing_id_count} student records have missing university IDs.",
                    message_ar=f"يوجد {missing_id_count} سجل طالب بدون رقم جامعي.",
                )
            )
        else:
            passed_checks.append("all_university_ids_present")

        if duplicate_ids:
            unique_dups = list(set(duplicate_ids))[:10]
            warnings.append(
                ValidationIssue(
                    category="data",
                    severity="warning",
                    field="university_id",
                    message=f"Found {len(duplicate_ids)} duplicate university IDs: {', '.join(unique_dups)}",
                    message_ar=f"تم العثور على أرقام جامعية مكررة ({len(duplicate_ids)} تكراراً)، منها: {', '.join(unique_dups)}",
                )
            )
        else:
            passed_checks.append("no_duplicate_ids")

        if require_approved_state and unapproved_count > 0:
            if is_public_publication:
                errors.append(
                    ValidationIssue(
                        category="data",
                        severity="error",
                        field="status",
                        message=f"{unapproved_count} records are not yet officially approved. Public export blocked.",
                        message_ar=f"يوجد {unapproved_count} سجلاً غير معتمد رسمياً. تم حظر النشر العام حتى اكتمال الاعتماد.",
                    )
                )
            else:
                warnings.append(
                    ValidationIssue(
                        category="data",
                        severity="warning",
                        field="status",
                        message=f"{unapproved_count} records are not yet officially approved.",
                        message_ar=f"يوجد {unapproved_count} سجلاً لم تعتمد بعد.",
                    )
                )
        else:
            passed_checks.append("approval_state_verified")

        # -------------------------------------------------------------
        # 2. Privacy Guard Validation
        # -------------------------------------------------------------
        privacy_cleared = True
        table_config = template_config.get("table_config", {})
        columns = table_config.get("columns", [])
        visible_cols = [col.get("key") for col in columns if col.get("visible", True)]

        leaked_private_fields = [col for col in visible_cols if col in cls.RESTRICTED_PUBLIC_FIELDS]

        if is_public_publication and leaked_private_fields:
            privacy_cleared = False
            for field in leaked_private_fields:
                errors.append(
                    ValidationIssue(
                        category="privacy",
                        severity="error",
                        field=field,
                        message=f"Restricted private field '{field}' cannot be included in a public template.",
                        message_ar=f"الحقل المقيد '{field}' غير مسموح بنشره في القوالب العامة لحماية خصوصية الطلاب.",
                    )
                )
        else:
            passed_checks.append("privacy_guard_cleared")

        # -------------------------------------------------------------
        # 3. Layout & Dimension Validation
        # -------------------------------------------------------------
        page_config = template_config.get("page_config", {})
        orientation = page_config.get("orientation", "portrait")
        visible_cols_count = len(visible_cols)

        if orientation == "portrait" and visible_cols_count > 6:
            warnings.append(
                ValidationIssue(
                    category="layout",
                    severity="warning",
                    message=f"Table has {visible_cols_count} visible columns in Portrait orientation. Content may feel compressed. Consider switching to Landscape.",
                    message_ar=f"يحتوي الجدول على {visible_cols_count} أعمدة في الاتجاه الرأسي (Portrait). قد يحدث ضغط للنصوص. يُنصح بالتحويل للاتجاه الأفقي (Landscape).",
                )
            )
        else:
            passed_checks.append("layout_dimensions_checked")

        # -------------------------------------------------------------
        # 4. Pagination Consistency Check
        # -------------------------------------------------------------
        repeat_header = table_config.get("repeat_header_on_page", True)
        if not repeat_header and total_records > 40:
            warnings.append(
                ValidationIssue(
                    category="pagination",
                    severity="warning",
                    message="Repeating table headers is disabled for a multi-page document.",
                    message_ar="خاصية تكرار رأس الجدول معطلة في مستند يحتوي على أكثر من صفحة.",
                )
            )
        else:
            passed_checks.append("smart_pagination_ready")

        ready_to_export = len(errors) == 0

        return ValidationReport(
            is_valid=len(errors) == 0,
            ready_to_export=ready_to_export,
            total_records=total_records,
            passed_checks=passed_checks,
            errors=errors,
            warnings=warnings,
            privacy_cleared=privacy_cleared,
            metadata={
                "missing_name_count": missing_name_count,
                "missing_id_count": missing_id_count,
                "duplicate_ids_count": len(duplicate_ids),
                "unapproved_count": unapproved_count,
            },
        )
