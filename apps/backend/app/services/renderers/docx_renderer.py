"""
Sahm Backend — Institutional DOCX Document Renderer (Section 16 & 27)
Builds official Word documents with university branding, Arabic RTL paragraphs,
styled tables, dynamic expression fields, and signature blocks.
"""
import os
from typing import Any, Dict, List

from app.services.renderers.base import BaseRenderer

try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


class DOCXRenderer(BaseRenderer):
    """
    Renders official university letters, memorandums, and certificate reports in DOCX format.
    """

    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        if not DOCX_AVAILABLE:
            # Fallback: write an XML WordprocessingML or rich HTML-based doc file
            return self._render_xml_fallback(records, template_config, context, output_path)

        doc = docx.Document()

        # Set RTL for sections
        for section in doc.sections:
            section.top_margin = Inches(0.8)
            section.bottom_margin = Inches(0.8)
            section.left_margin = Inches(0.8)
            section.right_margin = Inches(0.8)

        # Title and Header
        university_name = context.get("university.name", "جامعة إفريقيا العالمية")
        college_name = context.get("college.name", "كلية دراسات الحاسوب")
        department_name = context.get("department.name", "علوم الحاسوب")
        report_title = context.get("report.title", "كشف الشهادات الجامعية الجاهزة")
        doc_number = context.get("document.number", "DOC-2026-CERT")
        batch_year = context.get("batch.year", "2026")
        issue_date = context.get("generated_date", "2026/09/22")

        p_univ = doc.add_paragraph()
        p_univ.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_univ = p_univ.add_run(university_name)
        r_univ.font.size = Pt(16)
        r_univ.font.bold = True
        r_univ.font.color.rgb = RGBColor(15, 23, 42)

        p_col = doc.add_paragraph()
        p_col.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_col = p_col.add_run(f"{college_name} — {department_name}")
        r_col.font.size = Pt(12)
        r_col.font.bold = True
        r_col.font.color.rgb = RGBColor(15, 118, 110)

        p_meta = doc.add_paragraph()
        p_meta.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r_meta = p_meta.add_run(f"رقم الوثيقة: {doc_number}  |  تاريخ الإصدار: {issue_date}")
        r_meta.font.size = Pt(9)
        r_meta.font.color.rgb = RGBColor(100, 116, 139)

        # Title Box
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_title = p_title.add_run(f"\n{report_title} — دفعة {batch_year}\n")
        r_title.font.size = Pt(14)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(30, 41, 59)

        # Lead text
        p_lead = doc.add_paragraph()
        p_lead.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_lead = p_lead.add_run(
            f"تفيد أمانة الشؤون العلمية وقسم الامتحانات والشهادات بأن الطلاب الموضحة أسماؤهم أدناه "
            f"والبالغ عددهم ({len(records)}) طالباً/طالبة قد استوفوا جميع متطلبات التخرج ونيل الدرجة العلمية الموضحة في كشوفات الكلية:"
        )
        r_lead.font.size = Pt(11)

        # Table
        table_config = template_config.get("table_config", {})
        columns = table_config.get("columns", [
            {"key": "row_num", "label": "#"},
            {"key": "student_name", "label": "اسم الطالب"},
            {"key": "university_id", "label": "الرقم الجامعي"},
            {"key": "status_label", "label": "حالة الشهادة"},
        ])

        table = doc.add_table(rows=1, cols=len(columns))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.style = "Table Grid"

        # Headers
        hdr_cells = table.rows[0].cells
        for idx, col in enumerate(columns):
            hdr_cells[idx].text = col["label"]
            p = hdr_cells[idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
            # Shading header
            tcPr = hdr_cells[idx]._element.get_or_add_tcPr()
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"), "clear")
            shd.set(qn("w:color"), "auto")
            shd.set(qn("w:fill"), "1E293B")
            tcPr.append(shd)

        # Rows
        for r_idx, rec in enumerate(records, start=1):
            row_cells = table.add_row().cells
            for c_idx, col in enumerate(columns):
                key = col["key"]
                if key == "row_num":
                    val = f"{r_idx:02d}"
                elif key == "university_id":
                    val = str(rec.get("university_id") or "")
                elif key == "status_label":
                    val = "جاهزة للتسليم" if rec.get("status") in ["cert_ready", "approved"] else "تحت المراجعة"
                else:
                    val = str(rec.get(key) or "")
                row_cells[c_idx].text = val
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if c_idx == 1 else WD_ALIGN_PARAGRAPH.CENTER

        # Signatures
        doc.add_paragraph("\n")
        p_sig = doc.add_paragraph()
        p_sig.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_sig = p_sig.add_run("رئيس قسم الامتحانات والشهادات                                       عميد الكلية\n\n__________________________                                       __________________________")
        r_sig.font.size = Pt(11)
        r_sig.font.bold = True

        doc.save(output_path)
        return output_path

    def _render_xml_fallback(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        """Fallback renderer generating rich Word-compatible XML."""
        univ = context.get("university.name", "جامعة إفريقيا العالمية")
        title = context.get("report.title", "كشف الشهادات")
        college = context.get("college.name", "كلية دراسات الحاسوب")

        xml_content = f"""<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>{title}</title>
<style>
body {{ font-family: 'Calibri', 'Arial'; direction: rtl; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ border: 1px solid #999; padding: 6px; text-align: right; }}
th {{ background-color: #1E293B; color: #FFF; }}
</style>
</head>
<body>
<h2>{univ}</h2>
<h3>{college} — {title}</h3>
<p>إجمالي السجلات: {len(records)}</p>
<table>
<tr><th>#</th><th>اسم الطالب</th><th>الرقم الجامعي</th><th>الحالة</th></tr>
"""
        for idx, rec in enumerate(records, start=1):
            xml_content += f"<tr><td>{idx}</td><td>{rec.get('student_name', '')}</td><td>{rec.get('university_id', '')}</td><td>{rec.get('status', 'جاهزة')}</td></tr>\n"

        xml_content += "</table><br><br><p align='center'>رئيس قسم الامتحانات &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; عميد الكلية</p></body></html>"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(xml_content)

        return output_path
