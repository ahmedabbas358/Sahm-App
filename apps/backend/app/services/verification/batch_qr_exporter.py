"""
Sahm Backend — Batch QR Exporter (Prompt 18)
Generates bulk QR code packages for print production and verification audit.

Features:
- In-memory ZIP archive generation containing SVG/PNG files and metadata manifest.
- Printable A4 sticker/grid layout HTML generator ready for physical printing.
- Clear human-readable verification codes beneath every QR code.
"""
import io
import json
import zipfile
from typing import List, Dict, Any

from app.services.verification.qr_service import generate_qr_svg, generate_qr_png_bytes, generate_qr_data_uri


def create_batch_qr_zip(items: List[Dict[str, Any]]) -> bytes:
    """
    Creates a ZIP archive in memory containing:
    - qr_svg/ (vector SVG files named <code_or_student_id>.svg)
    - qr_png/ (high-resolution PNG files)
    - index.json (complete mapping manifest)
    """
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        index_data = []

        for item in items:
            code = item.get("verification_code", "")
            uni_id = item.get("university_id", "record")
            url = item.get("verification_url", "")
            student_name = item.get("student_name", "")

            file_stem = f"{uni_id}_{code}".replace("/", "_")

            # 1. Add SVG
            svg_content = generate_qr_svg(url)
            zf.writestr(f"qr_svg/{file_stem}.svg", svg_content)

            # 2. Add PNG
            png_bytes = generate_qr_png_bytes(url)
            if png_bytes:
                zf.writestr(f"qr_png/{file_stem}.png", png_bytes)

            index_data.append({
                "verification_code": code,
                "university_id": uni_id,
                "student_name": student_name,
                "verification_url": url,
                "svg_filename": f"qr_svg/{file_stem}.svg",
                "png_filename": f"qr_png/{file_stem}.png",
            })

        # 3. Add Manifest
        manifest_json = json.dumps({
            "total_items": len(items),
            "generated_at": items[0].get("issued_at", "") if items else "",
            "items": index_data,
        }, ensure_ascii=False, indent=2)
        zf.writestr("manifest.json", manifest_json)

    zip_buffer.seek(0)
    return zip_buffer.getvalue()


def generate_printable_qr_sheet_html(items: List[Dict[str, Any]], title: str = "كشف رموز التحقق الرقمية") -> str:
    """
    Generates an A4 print-ready HTML page with 3 columns x 6 rows of verification labels.
    """
    labels_html = []
    for item in items:
        code = item.get("verification_code", "")
        student_name = item.get("student_name", "")
        uni_id = item.get("university_id", "")
        url = item.get("verification_url", "")
        data_uri = generate_qr_data_uri(url)

        labels_html.append(f"""
        <div class="qr-label">
            <img src="{data_uri}" class="qr-img" alt="QR {code}" />
            <div class="code-text">{code}</div>
            <div class="student-name">{student_name}</div>
            <div class="uni-id">الرقم الجامعي: {uni_id or '—'}</div>
            <div class="verify-instruction">امسح للتحقق | Scan to verify</div>
        </div>
        """)

    return f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>{title}</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 10mm;
        }}
        body {{
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #fff;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 8px;
            margin-bottom: 16px;
        }}
        .header h1 {{
            margin: 0 0 4px 0;
            font-size: 18px;
            color: #0f172a;
        }}
        .header p {{
            margin: 0;
            font-size: 12px;
            color: #64748b;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }}
        .qr-label {{
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            page-break-inside: avoid;
            background: #fafafa;
        }}
        .qr-img {{
            width: 110px;
            height: 110px;
            display: block;
            margin: 0 auto 6px auto;
        }}
        .code-text {{
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: #0284c7;
            margin-bottom: 4px;
        }}
        .student-name {{
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}
        .uni-id {{
            font-size: 11px;
            color: #475569;
            margin-top: 2px;
        }}
        .verify-instruction {{
            font-size: 9px;
            color: #94a3b8;
            margin-top: 4px;
            text-transform: uppercase;
        }}
        @media print {{
            body {{
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{title}</h1>
        <p>منظومة سهم الموثوقة للتحقق الأكاديمي — إجمالي الرموز: {len(items)}</p>
    </div>
    <div class="grid">
        {"".join(labels_html)}
    </div>
</body>
</html>"""
