"""
Sahm Backend — Base Document Renderer Interface
Every supported format implements its own dedicated renderer.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseRenderer(ABC):
    """Abstract base class for all file and document format renderers."""

    @abstractmethod
    def render(
        self,
        records: List[Dict[str, Any]],
        template_config: Dict[str, Any],
        context: Dict[str, Any],
        output_path: str,
    ) -> str:
        """
        Renders the records using the template configuration and context.
        Returns the absolute path of the generated artifact.
        """
        pass
