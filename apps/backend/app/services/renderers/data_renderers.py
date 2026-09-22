"""
Sahm Backend — Data Renderers (CSV with BOM, JSON, HTML, TXT)
Ensures flawless Arabic text encoding across external systems and legacy databases.
"""
import csv
import json
import os
from typing import Any, Dict, List

from app.services.renderers.base import BaseRenderer


class CSVRenderer(BaseRenderer):
    """
    Renders CSV with UTF-8 BOM ('utf-8-sig') so that Microsoft Excel
    and external tools render Arabic text flawlessly without mojibake.
    """

    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        table_config = template_config.get("table_config", {})
        columns = table_config.get("columns", [
            {"key": "row_num", "label": "#"},
            {"key": "student_name", "label": "اسم الطالب"},
            {"key": "university_id", "label": "الرقم الجامعي"},
            {"key": "status", "label": "الحالة"},
        ])

        with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            # Write BOM and Headers
            writer.writerow([col["label"] for col in columns])

            for idx, rec in enumerate(records, start=1):
                row = []
                for col in columns:
                    key = col["key"]
                    if key == "row_num":
                        row.append(idx)
                    elif key == "university_id":
                        # Prefix with tab or quote if needed to preserve leading zeroes in Excel CSV
                        val = str(rec.get("university_id") or "")
                        row.append(f'="{val}"' if val.startswith("0") else val)
                    else:
                        row.append(str(rec.get(key) or ""))
                writer.writerow(row)

        return output_path


class JSONRenderer(BaseRenderer):
    """
    Renders structured, API-ready JSON export with metadata and cryptographic verification.
    """

    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        payload = {
            "metadata": {
                "system": "Sahm University Platform — Export Studio",
                "document_number": context.get("document.number", ""),
                "verification_code": context.get("verification.code", ""),
                "verification_url": f"https://sahm.uofafrica.edu/verify/{context.get('verification.code', '')}",
                "university": context.get("university.name", ""),
                "college": context.get("college.name", ""),
                "batch_year": context.get("batch.year", ""),
                "generated_at": context.get("generated_at", ""),
                "total_records": len(records),
            },
            "records": records,
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        return output_path


class TXTRenderer(BaseRenderer):
    """
    Renders clean, fixed-width or tabulated plain text export for legacy mainframe archives.
    """

    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        univ = context.get("university.name", "جامعة إفريقيا العالمية")
        title = context.get("report.title", "كشف الشهادات الجاهزة")
        doc_num = context.get("document.number", "")

        lines = [
            "=" * 70,
            f"{univ}",
            f"{context.get('college.name', '')} — {title}",
            f"رقم الوثيقة: {doc_num} | التاريخ: {context.get('generated_at', '')}",
            "=" * 70,
            f"{'#':<4} | {'اسم الطالب':<35} | {'الرقم الجامعي':<15} | {'الحالة'}",
            "-" * 70,
        ]

        for idx, rec in enumerate(records, start=1):
            name = str(rec.get("student_name") or "")[:35]
            uid = str(rec.get("university_id") or "")[:15]
            st = str(rec.get("status") or "")
            lines.append(f"{idx:<4} | {name:<35} | {uid:<15} | {st}")

        lines.extend([
            "-" * 70,
            f"إجمالي عدد الطلاب: {len(records)}",
            "=" * 70,
        ])

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        return output_path
