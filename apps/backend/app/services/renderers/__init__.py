"""
Sahm Backend — Document Renderers Factory
Dispatches rendering tasks to the dedicated format-specific engine.
"""
from typing import Optional

from app.services.renderers.base import BaseRenderer
from app.services.renderers.xlsx_renderer import XLSXRenderer
from app.services.renderers.pdf_renderer import PDFRenderer
from app.services.renderers.docx_renderer import DOCXRenderer
from app.services.renderers.data_renderers import CSVRenderer, JSONRenderer, TXTRenderer
from app.services.renderers.batch_exporter import BatchExporter


class RendererFactory:
    """Factory to retrieve format-specific renderers."""

    _renderers = {
        "xlsx": XLSXRenderer,
        "pdf": PDFRenderer,
        "print": PDFRenderer,
        "docx": DOCXRenderer,
        "csv": CSVRenderer,
        "json": JSONRenderer,
        "txt": TXTRenderer,
        "html": PDFRenderer,  # PDFRenderer natively generates styled print-ready HTML
    }

    @classmethod
    def get_renderer(cls, format_type: str) -> Optional[BaseRenderer]:
        fmt = (format_type or "pdf").lower()
        renderer_cls = cls._renderers.get(fmt)
        if renderer_cls:
            return renderer_cls()
        return None


__all__ = [
    "BaseRenderer",
    "XLSXRenderer",
    "PDFRenderer",
    "DOCXRenderer",
    "CSVRenderer",
    "JSONRenderer",
    "TXTRenderer",
    "BatchExporter",
    "RendererFactory",
]
