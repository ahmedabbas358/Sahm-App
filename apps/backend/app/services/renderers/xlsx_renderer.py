"""
Sahm Backend — Real Institutional XLSX Workbook Renderer (Section 15 & 27)
Builds multi-sheet, fully formatted Excel workbooks with RTL sheet views,
auto-filters, freeze panes, formulas, and strict string university IDs.
"""
import os
from typing import Any, Dict, List
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

from app.services.renderers.base import BaseRenderer


class XLSXRenderer(BaseRenderer):
    """
    Enterprise Excel renderer for university records.
    Never outputs CSV pretending to be XLSX.
    """

    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        wb = openpyxl.Workbook()

        # Styles definition
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=14, bold=True, color="0F172A")
        sub_font = Font(name="Calibri", size=10, italic=True, color="475569")
        bold_font = Font(name="Calibri", size=10, bold=True, color="1E293B")
        regular_font = Font(name="Calibri", size=10, color="1E293B")
        code_font = Font(name="Consolas", size=10, bold=True, color="0F766E")

        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        summary_header_fill = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")
        zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

        thin_border = Border(
            left=Side(style="thin", color="E2E8F0"),
            right=Side(style="thin", color="E2E8F0"),
            top=Side(style="thin", color="E2E8F0"),
            bottom=Side(style="thin", color="E2E8F0"),
        )
        bottom_double_border = Border(
            left=Side(style="thin", color="E2E8F0"),
            right=Side(style="thin", color="E2E8F0"),
            top=Side(style="thin", color="E2E8F0"),
            bottom=Side(style="double", color="0F172A"),
        )

        align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
        align_right = Alignment(horizontal="right", vertical="center", wrap_text=True)
        align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

        # -------------------------------------------------------------
        # SHEET 1: Certificate List (كشف الشهادات)
        # -------------------------------------------------------------
        ws_records = wb.active
        ws_records.title = "كشف الشهادات"
        ws_records.views.sheetView[0].rightToLeft = True

        # Header Title Block
        university_name = context.get("university.name", "جامعة إفريقيا العالمية")
        college_name = context.get("college.name", "كلية دراسات الحاسوب")
        report_title = context.get("report.title", "كشف الشهادات الجاهزة")
        batch_year = context.get("batch.year", "2026")
        doc_number = context.get("document.number", "CERT-2026-OFFICIAL")

        ws_records.merge_cells("A1:E1")
        ws_records["A1"] = university_name
        ws_records["A1"].font = title_font
        ws_records["A1"].alignment = align_right

        ws_records.merge_cells("A2:E2")
        ws_records["A2"] = f"{college_name} — {report_title} (دفعة {batch_year})"
        ws_records["A2"].font = bold_font
        ws_records["A2"].alignment = align_right

        ws_records.merge_cells("A3:E3")
        ws_records["A3"] = f"رقم الوثيقة: {doc_number} | تاريخ التصدير: {context.get('generated_at', '')}"
        ws_records["A3"].font = sub_font
        ws_records["A3"].alignment = align_right

        # Columns Configuration
        table_config = template_config.get("table_config", {})
        columns_def = table_config.get("columns", [
            {"key": "row_num", "label": "#", "width": 8, "align": "center"},
            {"key": "student_name", "label": "اسم الطالب رباعياً", "width": 35, "align": "right"},
            {"key": "university_id", "label": "الرقم الجامعي", "width": 22, "align": "center"},
            {"key": "status_label", "label": "حالة الشهادة", "width": 18, "align": "center"},
            {"key": "specialization", "label": "التخصص", "width": 25, "align": "right"},
        ])

        header_row_idx = 5
        for col_idx, col in enumerate(columns_def, start=1):
            cell = ws_records.cell(row=header_row_idx, column=col_idx, value=col["label"])
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = align_center
            cell.border = thin_border

        # Populate Record Rows
        row_idx = header_row_idx + 1
        for rec_num, record in enumerate(records, start=1):
            is_even = (rec_num % 2 == 0)
            current_fill = zebra_fill if is_even else PatternFill(fill_type=None)

            for col_idx, col in enumerate(columns_def, start=1):
                key = col["key"]
                align_style = align_center if col.get("align") == "center" else (align_left if col.get("align") == "left" else align_right)

                if key == "row_num":
                    val = rec_num
                    cell = ws_records.cell(row=row_idx, column=col_idx, value=val)
                    cell.number_format = "0"
                elif key == "university_id":
                    # CRITICAL REQUIREMENT: University IDs MUST be treated as strings (@)
                    # to prevent scientific notation (e.g. 2022E+10) or numeric rounding
                    val = str(record.get("university_id") or "")
                    cell = ws_records.cell(row=row_idx, column=col_idx, value=val)
                    cell.number_format = "@"
                    cell.data_type = "s"
                    cell.font = code_font
                elif key == "status_label":
                    status_raw = record.get("status", "cert_ready")
                    status_map = {
                        "cert_ready": "جاهزة للتسليم",
                        "approved": "معتمدة",
                        "needs_review": "تحتاج مراجعة",
                        "extracted": "مستخرجة",
                        "delivered": "تم التسليم",
                    }
                    val = status_map.get(status_raw, status_raw)
                    cell = ws_records.cell(row=row_idx, column=col_idx, value=val)
                else:
                    val = record.get(key, "")
                    cell = ws_records.cell(row=row_idx, column=col_idx, value=val)

                if key != "university_id":
                    cell.font = regular_font

                cell.alignment = align_style
                cell.border = thin_border
                if current_fill.fill_type:
                    cell.fill = current_fill

            row_idx += 1

        # Freeze Header Panes & Enable AutoFilter
        ws_records.freeze_panes = f"A{header_row_idx + 1}"
        end_col_letter = get_column_letter(len(columns_def))
        ws_records.auto_filter.ref = f"A{header_row_idx}:{end_col_letter}{row_idx - 1}"

        # Adjust column widths based on config or content
        for col_idx, col in enumerate(columns_def, start=1):
            col_letter = get_column_letter(col_idx)
            configured_width = col.get("width")
            if configured_width:
                ws_records.column_dimensions[col_letter].width = max(configured_width, 10)
            else:
                ws_records.column_dimensions[col_letter].width = 20

        # -------------------------------------------------------------
        # SHEET 2: Summary (الملخص الإحصائي)
        # -------------------------------------------------------------
        ws_summary = wb.create_sheet(title="الملخص الإحصائي")
        ws_summary.views.sheetView[0].rightToLeft = True

        ws_summary.merge_cells("A1:C1")
        ws_summary["A1"] = "الملخص الإحصائي لإصدار الشهادات"
        ws_summary["A1"].font = title_font
        ws_summary["A1"].alignment = align_right

        summary_headers = ["المؤشر / البيان", "القيمة", "النسبة / الملاحظة"]
        for c_idx, h in enumerate(summary_headers, start=1):
            c = ws_summary.cell(row=3, column=c_idx, value=h)
            c.font = header_font
            c.fill = summary_header_fill
            c.alignment = align_center
            c.border = thin_border

        summary_rows = [
            ("إجمالي عدد السجلات بالكشف", f"=COUNTA('كشف الشهادات'!B6:B{row_idx - 1})", "طالب/طالبة"),
            ("الشهادات الجاهزة للتسليم", f'=COUNTIF(\'كشف الشهادات\'!D6:D{row_idx - 1}, "*جاهزة*")', "جاهزة رسمياً"),
            ("الشهادات التي تم تسليمها", f'=COUNTIF(\'كشف الشهادات\'!D6:D{row_idx - 1}, "*تم التسليم*")', "مستلمة"),
            ("سجلات تحتاج مراجعة", f'=COUNTIF(\'كشف الشهادات\'!D6:D{row_idx - 1}, "*مراجعة*")', "معلقة"),
        ]

        for s_idx, (indicator, formula_val, note) in enumerate(summary_rows, start=4):
            c1 = ws_summary.cell(row=s_idx, column=1, value=indicator)
            c1.font = bold_font
            c1.alignment = align_right
            c1.border = thin_border

            c2 = ws_summary.cell(row=s_idx, column=2, value=formula_val)
            c2.font = code_font
            c2.alignment = align_center
            c2.border = thin_border

            c3 = ws_summary.cell(row=s_idx, column=3, value=note)
            c3.font = regular_font
            c3.alignment = align_right
            c3.border = thin_border

        ws_summary.column_dimensions["A"].width = 35
        ws_summary.column_dimensions["B"].width = 20
        ws_summary.column_dimensions["C"].width = 25

        # -------------------------------------------------------------
        # SHEET 3: Metadata & Integrity (البيانات الوصفية ومطابقة النزاهة)
        # -------------------------------------------------------------
        ws_meta = wb.create_sheet(title="البيانات الوصفية")
        ws_meta.views.sheetView[0].rightToLeft = True

        ws_meta["A1"] = "سجل البيانات الوصفية والنزاهة الرقمية"
        ws_meta["A1"].font = title_font
        ws_meta.merge_cells("A1:B1")

        meta_items = [
            ("معرّف الوثيقة (Document ID)", context.get("document.number", "DOC-2026-CERT")),
            ("معرّف التحقق العشوائي (Verification Token)", context.get("verification.code", "CERT-VERIF-9912")),
            ("رابط التحقق المؤسسي (Verification URL)", f"https://sahm.uofafrica.edu/verify/{context.get('verification.code', 'CERT-VERIF-9912')}"),
            ("الجهة المصدرة", context.get("university.name", "جامعة إفريقيا العالمية")),
            ("الكلية", context.get("college.name", "كلية دراسات الحاسوب")),
            ("الدفعة الأكاديمية", context.get("batch.year", "2026")),
            ("تاريخ وتوقيت التوليد", context.get("generated_at", "")),
            ("معرّف القالب المستخدم", template_config.get("id", "tpl-excel-administrative")),
            ("إصدار المحرك (Engine Version)", "Sahm Export Studio v2.0 - Section 27"),
            ("بصمة النزاهة الرقمية المتوقعة", context.get("file_hash_placeholder", "SHA-256 Calculated on Finalize")),
        ]

        for m_idx, (label, val) in enumerate(meta_items, start=3):
            c_label = ws_meta.cell(row=m_idx, column=1, value=label)
            c_label.font = bold_font
            c_label.alignment = align_right
            c_label.border = thin_border
            c_label.fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")

            c_val = ws_meta.cell(row=m_idx, column=2, value=str(val))
            c_val.font = code_font if "ID" in label or "Token" in label or "Hash" in label else regular_font
            c_val.alignment = align_left if "URL" in label or "Token" in label else align_right
            c_val.border = thin_border

        ws_meta.column_dimensions["A"].width = 38
        ws_meta.column_dimensions["B"].width = 65

        wb.save(output_path)
        return output_path
