"""
Sahm Backend — Comprehensive Unit Tests for Export & Document Studio (Section 27)
Tests: Template Engine, Pre-flight Validator & Privacy Guard,
Real Excel Multi-sheet & String ID preservation, PDF Smart Pagination, and Batch Zipping.
"""
import os
import zipfile
import pytest
import openpyxl

from app.services.template_engine import TemplateFieldEngine, PRESET_TEMPLATES
from app.services.export_validator import ExportValidator
from app.services.renderers.xlsx_renderer import XLSXRenderer
from app.services.renderers.pdf_renderer import PDFRenderer
from app.services.renderers.docx_renderer import DOCXRenderer
from app.services.renderers.data_renderers import CSVRenderer, JSONRenderer
from app.services.renderers.batch_exporter import BatchExporter


@pytest.fixture
def sample_records():
    return [
        {
            "student_name": "أحمد عباس محمد إبراهيم",
            "university_id": "202201048",
            "status": "cert_ready",
            "specialization": "علوم الحاسوب",
            "phone": "+249912345678",
            "delivery_notes": "تسلم باليد بموجب التوكيل",
        },
        {
            "student_name": "محمد أحمد عثمان إدريس",
            "university_id": "002201052",  # Note: leading zeroes must be preserved!
            "status": "approved",
            "specialization": "نظم المعلومات",
            "phone": "+249123456789",
            "delivery_notes": "",
        },
        {
            "student_name": "فاطمة الزهراء إدريس علي",
            "university_id": "202201079",
            "status": "cert_ready",
            "specialization": "تقنية المعلومات",
            "phone": "+249998877665",
            "delivery_notes": "شهادة امتياز مع مرتبة الشرف",
        },
    ]


# -------------------------------------------------------------
# 1. Template Expression Engine Tests
# -------------------------------------------------------------

def test_template_field_engine_interpolation():
    context = TemplateFieldEngine.build_context(
        university_name="جامعة إفريقيا العالمية",
        college_name="كلية دراسات الحاسوب",
        batch_year="2026",
        records_count=3,
    )
    raw_template = "{{ university.name }} — {{ college.name }} (دفعة {{ batch.year }}) | عدد الطلاب: {{ records.count }}"
    resolved = TemplateFieldEngine.resolve_text(raw_template, context)

    assert "جامعة إفريقيا العالمية" in resolved
    assert "كلية دراسات الحاسوب" in resolved
    assert "2026" in resolved
    assert "عدد الطلاب: 3" in resolved


def test_template_field_engine_unknown_tokens():
    context = TemplateFieldEngine.build_context()
    raw_template = "Hello {{ non_existent_variable }} World"
    resolved = TemplateFieldEngine.resolve_text(raw_template, context)
    assert resolved == "Hello  World"


# -------------------------------------------------------------
# 2. Pre-flight Validation & Privacy Guard Tests
# -------------------------------------------------------------

def test_export_validator_passed_clean_data(sample_records):
    template_cfg = PRESET_TEMPLATES[0]  # Official template
    report = ExportValidator.validate(
        records=sample_records,
        template_config=template_cfg,
        is_public_publication=False,
    )
    assert report.is_valid is True
    assert report.ready_to_export is True
    assert len(report.errors) == 0
    assert "records_count_positive" in report.passed_checks
    assert "all_university_ids_present" in report.passed_checks


def test_export_validator_privacy_guard_blocks_restricted_fields(sample_records):
    """Verifies that attempting to publish private student fields in a public list is blocked."""
    leaky_template = {
        "page_config": {"orientation": "portrait"},
        "table_config": {
            "columns": [
                {"key": "student_name", "label": "الاسم", "visible": True},
                {"key": "phone", "label": "رقم الهاتف الشخصي", "visible": True},  # RESTRICTED!
            ]
        },
    }

    report = ExportValidator.validate(
        records=sample_records,
        template_config=leaky_template,
        is_public_publication=True,  # Public publication!
    )
    assert report.is_valid is False
    assert report.ready_to_export is False
    assert report.privacy_cleared is False
    assert any(err.category == "privacy" and err.field == "phone" for err in report.errors)


def test_export_validator_detects_duplicate_ids():
    records_with_dups = [
        {"student_name": "طالب أ", "university_id": "2022001", "status": "approved"},
        {"student_name": "طالب ب", "university_id": "2022001", "status": "approved"},  # Duplicate
    ]
    template_cfg = PRESET_TEMPLATES[0]
    report = ExportValidator.validate(records=records_with_dups, template_config=template_cfg)
    assert report.metadata["duplicate_ids_count"] == 1
    assert any(w.field == "university_id" and "duplicate" in w.message.lower() for w in report.warnings)


# -------------------------------------------------------------
# 3. Real XLSX Renderer Tests (RTL, String IDs, Sheets)
# -------------------------------------------------------------

def test_xlsx_renderer_real_sheets_and_rtl(sample_records, tmp_path):
    output_file = str(tmp_path / "test_certificates.xlsx")
    renderer = XLSXRenderer()
    template_cfg = PRESET_TEMPLATES[2]  # Excel preset
    context = TemplateFieldEngine.build_context(records_count=len(sample_records))

    rendered_path = renderer.render(sample_records, template_cfg, context, output_file)
    assert os.path.exists(rendered_path)

    # Load with openpyxl to verify workbook integrity
    wb = openpyxl.load_workbook(rendered_path)
    sheet_names = wb.sheetnames

    # Check multiple sheets
    assert "كشف الشهادات" in sheet_names
    assert "الملخص الإحصائي" in sheet_names
    assert "البيانات الوصفية" in sheet_names

    # Check RTL setting on primary sheet
    ws_records = wb["كشف الشهادات"]
    assert ws_records.views.sheetView[0].rightToLeft is True

    # Check that University ID cell is stored strictly as a string with leading zero preserved!
    # Row 6 is student 1 (202201048), Row 7 is student 2 (002201052)
    id_cell = ws_records["C7"]
    assert id_cell.data_type == "s"
    assert id_cell.number_format == "@"
    assert id_cell.value == "002201052"
    assert id_cell.value.startswith("00")  # Leading zero was NOT truncated!


# -------------------------------------------------------------
# 4. PDF Smart Pagination & QR Badge Tests
# -------------------------------------------------------------

def test_pdf_renderer_output(sample_records, tmp_path):
    output_file = str(tmp_path / "test_certificates.html")
    renderer = PDFRenderer()
    template_cfg = PRESET_TEMPLATES[0]
    context = TemplateFieldEngine.build_context(
        records_count=len(sample_records),
        additional_vars={"document.number": "CERT-2026-TEST", "verification.code": "VRF-UNITTEST-01"},
    )

    rendered_path = renderer.render(sample_records, template_cfg, context, output_file)
    assert os.path.exists(rendered_path)

    with open(rendered_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify RTL direction & font
    assert 'dir="rtl"' in content
    assert "IBM Plex Sans Arabic" in content
    # Verify smart pagination CSS rules
    assert "table-header-group" in content  # Repeats table header across pages
    assert "page-break-inside: avoid" in content  # Prevents row splits
    # Verify QR code badge
    assert "VRF-UNITTEST-01" in content
    assert "<svg" in content


# -------------------------------------------------------------
# 5. Batch Exporter & Packaging Tests
# -------------------------------------------------------------

def test_batch_exporter_zip_archive(tmp_path):
    # Create mock generated files
    f1 = tmp_path / "CS_Report.pdf"
    f1.write_text("Mock PDF Content 1", encoding="utf-8")
    f2 = tmp_path / "ENG_Report.xlsx"
    f2.write_text("Mock XLSX Content 2", encoding="utf-8")

    generated_files = [
        {"status": "success", "entity_name": "كلية الحاسوب", "file_path": str(f1), "record_count": 120, "format": "pdf"},
        {"status": "success", "entity_name": "كلية الهندسة", "file_path": str(f2), "record_count": 210, "format": "xlsx"},
    ]

    zip_path = str(tmp_path / "Batch_Output.zip")
    result = BatchExporter.create_batch_archive(
        generated_files=generated_files,
        batch_name="Certificates_2026_All",
        output_zip_path=zip_path,
    )

    assert os.path.exists(zip_path)
    assert result["report"]["total_successful"] == 2
    assert result["report"]["total_records_exported"] == 330

    # Inspect zip contents
    with zipfile.ZipFile(zip_path, "r") as zf:
        namelist = zf.namelist()
        assert "CS_Report.pdf" in namelist
        assert "ENG_Report.xlsx" in namelist
        assert "BATCH_EXPORT_REPORT.json" in namelist
        assert "تقرير_التصدير_المجمع.txt" in namelist
