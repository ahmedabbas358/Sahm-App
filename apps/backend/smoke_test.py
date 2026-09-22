import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.template_engine import TemplateFieldEngine, PRESET_TEMPLATES
from app.services.export_validator import ExportValidator
from app.services.renderers.pdf_renderer import PDFRenderer
from app.services.renderers.data_renderers import CSVRenderer, JSONRenderer
from app.services.renderers.batch_exporter import BatchExporter

records = [
    {"student_name": "أحمد عباس", "university_id": "202201048", "status": "cert_ready"},
    {"student_name": "محمد أحمد", "university_id": "002201052", "status": "approved"},
]

# 1. Template Engine
ctx = TemplateFieldEngine.build_context(records_count=len(records))
resolved = TemplateFieldEngine.resolve_text("{{ university.name }} - {{ records.count }}", ctx)

# 2. Validation
report = ExportValidator.validate(records=records, template_config=PRESET_TEMPLATES[0])

# 3. PDF/HTML Render
pdf_renderer = PDFRenderer()
out_html = os.path.join(os.path.dirname(__file__), "smoke_doc.html")
pdf_renderer.render(records, PRESET_TEMPLATES[0], ctx, out_html)

# 4. CSV Render
csv_renderer = CSVRenderer()
out_csv = os.path.join(os.path.dirname(__file__), "smoke_data.csv")
csv_renderer.render(records, PRESET_TEMPLATES[0], ctx, out_csv)

# 5. Batch Export
out_zip = os.path.join(os.path.dirname(__file__), "smoke_batch.zip")
res = BatchExporter.create_batch_archive(
    generated_files=[{"status": "success", "entity_name": "كلية الحاسوب", "file_path": out_csv, "record_count": 2}],
    batch_name="SmokeBatch",
    output_zip_path=out_zip
)

results = [
    f"Template Engine: {resolved}",
    f"Validator is_valid: {report.is_valid}, ready: {report.ready_to_export}",
    f"HTML exists: {os.path.exists(out_html)} ({os.path.getsize(out_html)} bytes)",
    f"CSV exists: {os.path.exists(out_csv)} ({os.path.getsize(out_csv)} bytes)",
    f"ZIP exists: {os.path.exists(out_zip)} ({os.path.getsize(out_zip)} bytes)",
]

with open("smoke_result.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))
