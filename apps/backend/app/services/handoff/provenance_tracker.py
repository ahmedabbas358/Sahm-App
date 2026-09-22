"""
Sahm Backend — Provenance & Chain of Custody Tracker (Prompt 22)
Preserves original creation metadata, scan timestamps, OCR engine versions,
and maintains an unbroken institutional custody audit trail.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List


class ProvenanceTracker:
    """Manages immutable provenance and chain of custody tracking."""

    @staticmethod
    def initialize_provenance(
        creator_user_id: str,
        creator_name: str,
        device_id: str,
        ocr_pipeline_fingerprint: str,
        source_hash: str,
    ) -> Dict[str, Any]:
        """Create initial provenance block for a newly captured item."""
        now = datetime.now(timezone.utc).isoformat()
        return {
            "original_creator_id": creator_user_id,
            "original_creator_name": creator_name,
            "original_device_id": device_id,
            "captured_at": now,
            "source_hash": source_hash,
            "initial_pipeline_fingerprint": ocr_pipeline_fingerprint,
            "operational_owner_id": creator_user_id,
            "chain_of_custody": [
                {
                    "action": "CAPTURED",
                    "actor_id": creator_user_id,
                    "actor_name": creator_name,
                    "device_id": device_id,
                    "timestamp": now,
                }
            ],
        }

    @staticmethod
    def append_custody_transfer(
        provenance_block: Dict[str, Any],
        sender_user_id: str,
        sender_name: str,
        recipient_user_id: str,
        recipient_name: str,
        handoff_id: str,
        transfer_method: str,
    ) -> Dict[str, Any]:
        """
        Record a work handoff event in the chain of custody.
        Preserves original author while updating the operational owner.
        """
        updated = dict(provenance_block)
        now = datetime.now(timezone.utc).isoformat()

        # Update current operational owner
        updated["operational_owner_id"] = recipient_user_id
        updated["last_handoff_id"] = handoff_id

        # Append to immutable custody history
        custody_list = list(updated.get("chain_of_custody", []))
        custody_list.append({
            "action": "HANDOFF_TRANSFERRED",
            "from_user_id": sender_user_id,
            "from_user_name": sender_name,
            "to_user_id": recipient_user_id,
            "to_user_name": recipient_name,
            "handoff_id": handoff_id,
            "method": transfer_method,
            "timestamp": now,
        })
        updated["chain_of_custody"] = custody_list
        return updated
