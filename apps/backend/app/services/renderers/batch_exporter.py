"""
Sahm Backend — Batch Document Generation & ZIP Packaging (Section 19 & 27)
Enables simultaneous multi-college/department exports with batch summary reports.
"""
import json
import os
import zipfile
from typing import Any, Dict, List
from datetime import datetime, timezone


class BatchExporter:
    """
    Executes multi-entity exports and packages generated files into a consolidated ZIP archive.
    """

    @classmethod
    def create_batch_archive(
        cls,
        generated_files: List[Dict[str, Any]],
        batch_name: str,
        output_zip_path: str,
    ) -> Dict[str, Any]:
        """
        Creates a ZIP archive containing all successfully generated documents,
        along with an automated batch manifest report (JSON and TXT).
        """
        os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)

        now = datetime.now(timezone.utc).isoformat()
        total_requested = len(generated_files)
        successful_files = [f for f in generated_files if f.get("status") == "success"]
        failed_files = [f for f in generated_files if f.get("status") != "success"]
        total_records_processed = sum(f.get("record_count", 0) for f in successful_files)

        report = {
            "batch_title": batch_name,
            "created_at": now,
            "total_requested": total_requested,
            "total_successful": len(successful_files),
            "total_failed": len(failed_files),
            "total_records_exported": total_records_processed,
            "manifest": [
                {
                    "filename": os.path.basename(f["file_path"]),
                    "entity": f.get("entity_name", "College"),
                    "format": f.get("format", "pdf"),
                    "record_count": f.get("record_count", 0),
                    "file_size_bytes": os.path.getsize(f["file_path"]) if os.path.exists(f["file_path"]) else 0,
                }
                for f in successful_files
            ],
            "failures": [
                {
                    "entity": f.get("entity_name", "Unknown"),
                    "error": f.get("error", "Unknown error"),
                }
                for f in failed_files
            ],
        }

        with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            # 1. Add all successful documents
            for f in successful_files:
                fpath = f["file_path"]
                if os.path.exists(fpath):
                    arcname = os.path.basename(fpath)
                    zipf.write(fpath, arcname=arcname)

            # 2. Add structured report manifest
            manifest_json = json.dumps(report, ensure_ascii=False, indent=2)
            zipf.writestr("BATCH_EXPORT_REPORT.json", manifest_json)

            # 3. Add text summary
            summary_txt = f"""======================================================================
سهم — تقرير التصدير المجمع (Batch Export Report)
======================================================================
اسم الحزمة: {batch_name}
التاريخ: {now}
إجمالي الملفات المطلوبة: {total_requested}
الملفات الناجحة: {len(successful_files)}
الملفات الفاشلة: {len(failed_files)}
إجمالي سجلات الطلاب المصدرة: {total_records_processed}
======================================================================
الملفات المتضمنة في الأرشيف:
"""
            for m in report["manifest"]:
                summary_txt += f"  - {m['filename']} ({m['entity']}) | {m['record_count']} طالب\n"

            if failed_files:
                summary_txt += "\nالأخطاء المسجلة:\n"
                for fl in report["failures"]:
                    summary_txt += f"  - [خطأ] {fl['entity']}: {fl['error']}\n"

            summary_txt += "======================================================================\n"
            zipf.writestr("تقرير_التصدير_المجمع.txt", summary_txt.encode("utf-8-sig"))

        return {
            "zip_path": output_zip_path,
            "zip_size_bytes": os.path.getsize(output_zip_path),
            "report": report,
        }
