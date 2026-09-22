"""
Sahm Backend — Template Expression & Preset Engine
Safely evaluates template expressions without arbitrary code execution.
Maintains institutional preset templates.
"""
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class TemplateFieldEngine:
    """
    Controlled template variable evaluator.
    Strict whitelist-based token interpolation: {{ namespace.field }}.
    Zero dynamic code execution or eval().
    """

    EXPRESSION_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}")

    @classmethod
    def build_context(
        cls,
        university_name: str = "جامعة إفريقيا العالمية",
        university_name_en: str = "International University of Africa",
        college_name: str = "كلية دراسات الحاسوب",
        department_name: str = "علوم الحاسوب",
        program_name: str = "بكالوريوس الشرف في علوم الحاسوب",
        batch_year: str = "2026",
        report_title: str = "كشف الشهادات الجاهزة للتسليم",
        records_count: int = 0,
        approved_by: str = "أ.د. عميد الكلية",
        page_number: int = 1,
        page_total: int = 1,
        additional_vars: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Constructs a normalized context dictionary for template rendering."""
        now = datetime.now(timezone.utc)
        date_ar = now.strftime("%Y/%m/%d")
        time_ar = now.strftime("%H:%M")

        context = {
            "university.name": university_name,
            "university.name_en": university_name_en,
            "college.name": college_name,
            "department.name": department_name,
            "program.name": program_name,
            "batch.year": str(batch_year),
            "report.title": report_title,
            "records.count": str(records_count),
            "approved_by": approved_by,
            "page.number": str(page_number),
            "page.total": str(page_total),
            "generated_at": f"{date_ar} {time_ar}",
            "generated_date": date_ar,
            "generated_time": time_ar,
        }

        if additional_vars:
            for k, v in additional_vars.items():
                context[k] = str(v)

        return context

    @classmethod
    def resolve_text(cls, text_template: str, context: Dict[str, Any]) -> str:
        """Substitutes safe tokens in a string with context values."""
        if not text_template or not isinstance(text_template, str):
            return text_template

        def replacer(match: re.Match) -> str:
            token = match.group(1).strip()
            return str(context.get(token, ""))

        return cls.EXPRESSION_PATTERN.sub(replacer, text_template)

    @classmethod
    def resolve_dict(cls, data: Any, context: Dict[str, Any]) -> Any:
        """Recursively resolves template tokens inside dictionaries, lists, or strings."""
        if isinstance(data, str):
            return cls.resolve_text(data, context)
        elif isinstance(data, dict):
            return {k: cls.resolve_dict(v, context) for k, v in data.items()}
        elif isinstance(data, list):
            return [cls.resolve_dict(item, context) for item in data]
        return data


# =====================================================================
# Preset Institutional Templates
# =====================================================================

PRESET_TEMPLATES: List[Dict[str, Any]] = [
    {
        "id": "tpl-official-cert-list",
        "name": "Official Certificate List",
        "name_ar": "كشف الشهادات الجاهزة — رسمي للطباعة والاعتماد",
        "description": "قالب رسمي مؤسسي عالي الدقة يتضمن ترويسة الكلية، جدول الطلاب، باركود QR للتحقق، وجدول التوقيعات المعتمدة.",
        "category": "official_list",
        "default_format": "pdf",
        "is_preset": True,
        "is_public_ready": False,
        "page_config": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 15, "bottom": 15, "left": 15, "right": 15, "unit": "mm"},
            "rtl": True,
        },
        "layout_config": {
            "header": {
                "show_logo": True,
                "university_name_ar": "جامعة إفريقيا العالمية",
                "university_name_en": "International University of Africa",
                "college_title": "{{ college.name }}",
                "department_title": "{{ department.name }}",
                "report_title": "{{ report.title }} — دفعة {{ batch.year }}",
                "show_issue_date": True,
            },
            "footer": {
                "show_page_number": True,
                "show_qr": True,
                "confidentiality_notice": "وثيقة جامعية معتمدة — أي كشط أو تعديل يلغي صحتها",
            },
            "signatures": [
                {"role": "مسجل الكلية", "title": "المراجعة والتدقيق"},
                {"role": "رئيس قسم الامتحانات والشهادات", "title": "المطابقة"},
                {"role": "عميد الكلية", "title": "الاعتماد النهائي"},
            ],
        },
        "table_config": {
            "columns": [
                {"key": "row_num", "label": "#", "width": 8, "align": "center", "visible": True},
                {"key": "student_name", "label": "اسم الطالب رباعياً", "width": 44, "align": "right", "visible": True},
                {"key": "university_id", "label": "الرقم الجامعي", "width": 24, "align": "center", "visible": True},
                {"key": "specialization", "label": "التخصص", "width": 24, "align": "center", "visible": True},
            ],
            "repeat_header_on_page": True,
            "row_height": 9,
            "header_bg_color": "#1E293B",
            "header_text_color": "#FFFFFF",
            "zebra_striping": True,
            "prevent_row_split": True,
        },
    },
    {
        "id": "tpl-public-cert-list",
        "name": "Public Certificate Publication List",
        "name_ar": "كشف الشهادات الجاهزة — للنشر والإعلان (محمي الخصوصية)",
        "description": "قالب مخصص للنشر على بوابات الجامعة ولوحات الإعلانات؛ يخفي أرقام الهواتف أو الملاحظات الخاصة.",
        "category": "public_list",
        "default_format": "pdf",
        "is_preset": True,
        "is_public_ready": True,
        "page_config": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 12, "bottom": 12, "left": 12, "right": 12, "unit": "mm"},
            "rtl": True,
        },
        "layout_config": {
            "header": {
                "show_logo": True,
                "university_name_ar": "جامعة إفريقيا العالمية",
                "college_title": "{{ college.name }}",
                "report_title": "قائمة الشهادات الجاهزة للتسليم — إعلان عام",
                "show_issue_date": True,
            },
            "footer": {
                "show_page_number": True,
                "show_qr": True,
                "confidentiality_notice": "يرجى من الطلاب المذكورة أسماؤهم مراجعة إدارة الامتحانات لاستلام شهاداتهم مصحوبين بإثبات الشخصية",
            },
            "signatures": [],
        },
        "table_config": {
            "columns": [
                {"key": "row_num", "label": "#", "width": 10, "align": "center", "visible": True},
                {"key": "student_name", "label": "اسم الطالب", "width": 50, "align": "right", "visible": True},
                {"key": "university_id", "label": "الرقم الجامعي", "width": 25, "align": "center", "visible": True},
                {"key": "status_label", "label": "الحالة", "width": 15, "align": "center", "visible": True},
            ],
            "repeat_header_on_page": True,
            "row_height": 8.5,
            "header_bg_color": "#0F766E",
            "header_text_color": "#FFFFFF",
            "zebra_striping": True,
            "prevent_row_split": True,
        },
    },
    {
        "id": "tpl-excel-administrative",
        "name": "Administrative Excel Workbook",
        "name_ar": "مصنف إكسل الإداري المؤسسي المتكامل",
        "description": "مصنف إكسل احترافي حقيقي متعدد الأوراق (بيانات الطلاب، الملخص الإحصائي، البيانات الوصفية، وسجل التدقيق) مع تفعيل RTL وتجميد الصفوف.",
        "category": "internal_list",
        "default_format": "xlsx",
        "is_preset": True,
        "is_public_ready": False,
        "page_config": {
            "size": "A4",
            "orientation": "landscape",
            "margins": {"top": 10, "bottom": 10, "left": 10, "right": 10, "unit": "mm"},
            "rtl": True,
        },
        "layout_config": {
            "sheets": [
                {"name": "كشف الشهادات", "type": "records"},
                {"name": "الملخص الإحصائي", "type": "summary"},
                {"name": "البيانات الوصفية", "type": "metadata"},
                {"name": "تقرير التحقق", "type": "validation"},
            ]
        },
        "table_config": {
            "columns": [
                {"key": "row_num", "label": "#", "width": 6, "align": "center", "visible": True},
                {"key": "student_name", "label": "اسم الطالب المعتمد", "width": 35, "align": "right", "visible": True},
                {"key": "university_id", "label": "الرقم الجامعي (نصي)", "width": 20, "align": "center", "visible": True},
                {"key": "college", "label": "الكلية", "width": 25, "align": "right", "visible": True},
                {"key": "department", "label": "القسم", "width": 25, "align": "right", "visible": True},
                {"key": "status", "label": "الحالة", "width": 18, "align": "center", "visible": True},
                {"key": "approved_by", "label": "معتمد بواسطة", "width": 25, "align": "right", "visible": True},
                {"key": "notes", "label": "الملاحظات", "width": 30, "align": "right", "visible": True},
            ],
            "autofilter": True,
            "freeze_panes": True,
            "force_string_ids": True,
        },
    },
]
