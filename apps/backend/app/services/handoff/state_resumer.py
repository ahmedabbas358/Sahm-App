"""
Sahm Backend — State Resumer & Work Queue Progress Tracker (Prompt 22)
Calculates exact item processing states and pinpoints the next pending work item
so the recipient continues seamlessly without re-running previous steps.
"""
from typing import List, Dict, Any


class StateResumer:
    """Calculates work progression and identifies immediate resume point."""

    @classmethod
    def calculate_work_state(cls, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze certificate items to derive work breakdown and next resume index.
        Recognizes states:
        - 'completed' / 'extracted' -> already processed
        - 'needs_review' -> requires human review
        - 'failed' -> extraction failed
        - 'pending' / 'queued' / 'captured' -> yet to be processed
        """
        total = len(items)
        processed = 0
        needs_review = 0
        failed = 0
        pending = 0
        first_pending_index = None

        for idx, it in enumerate(items):
            state = str(it.get("state") or it.get("status", "")).lower()

            if state in {"completed", "extracted", "approved", "processed"}:
                processed += 1
            elif state in {"needs_review", "review", "quarantined"}:
                needs_review += 1
            elif state in {"failed", "error", "unusable"}:
                failed += 1
            else:
                pending += 1
                if first_pending_index is None:
                    first_pending_index = idx

        # If all processed, next is total; if none pending, start at 0
        resume_index = first_pending_index if first_pending_index is not None else processed

        return {
            "total": total,
            "processed": processed,
            "needs_review": needs_review,
            "failed": failed,
            "pending": pending,
            "next_resume_index": resume_index,
        }

    @classmethod
    def filter_pending_items(cls, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract only pending items that need processing."""
        return [
            it for it in items
            if str(it.get("state") or it.get("status", "")).lower() not in {"completed", "extracted", "approved", "processed"}
        ]
