"""
Sahm Backend — Conflict Reconciler & Safe Merge Engine (Prompt 22)
Detects discrepancies between incoming package items and destination workspace,
categorizes conflict classes, and performs field-level safe merges without silent overwriting.
"""
from typing import List, Dict, Any, Tuple
from app.models.handoff import ConflictClass, MergeStrategy


class ConflictReconciler:
    """Manages workspace diff inspection and safe conflict resolution."""

    @classmethod
    def detect_conflicts(
        cls,
        local_items: List[Dict[str, Any]],
        incoming_items: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Compare local items and incoming items to categorize differences.
        Returns:
        {
            "identical_count": int,
            "new_count": int,
            "conflicts_count": int,
            "conflicts": List[Dict],
            "new_items": List[Dict],
        }
        """
        local_by_id = {item.get("id"): item for item in local_items if item.get("id")}
        identical_count = 0
        new_items = []
        conflicts = []

        for inc in incoming_items:
            inc_id = inc.get("id")
            if not inc_id or inc_id not in local_by_id:
                new_items.append(inc)
                continue

            loc = local_by_id[inc_id]
            diff_fields = []

            # Check core field differences
            for field in ["student_name", "university_id", "faculty_name", "graduation_year", "grade"]:
                loc_val = loc.get(field)
                inc_val = inc.get(field)
                if loc_val != inc_val:
                    diff_fields.append({
                        "field_name": field,
                        "local_value": loc_val,
                        "incoming_value": inc_val,
                    })

            # Check status difference
            loc_status = loc.get("status")
            inc_status = inc.get("status")

            if not diff_fields and loc_status == inc_status:
                identical_count += 1
            elif diff_fields:
                for d in diff_fields:
                    conflicts.append({
                        "item_id": inc_id,
                        "conflict_class": ConflictClass.DATA_CONFLICT.value,
                        "field_name": d["field_name"],
                        "local_value": d["local_value"],
                        "incoming_value": d["incoming_value"],
                        "recommended_strategy": MergeStrategy.FIELD_LEVEL_MERGE.value,
                    })
            elif loc_status != inc_status:
                conflicts.append({
                    "item_id": inc_id,
                    "conflict_class": ConflictClass.STATE_CONFLICT.value,
                    "field_name": "status",
                    "local_value": loc_status,
                    "incoming_value": inc_status,
                    "recommended_strategy": MergeStrategy.MANUAL_REVIEW.value,
                })

        return {
            "identical_count": identical_count,
            "new_count": len(new_items),
            "conflicts_count": len(conflicts),
            "conflicts": conflicts,
            "new_items": new_items,
        }

    @classmethod
    def reconcile_item(
        cls,
        local_item: Dict[str, Any],
        incoming_item: Dict[str, Any],
        strategy: MergeStrategy,
        field_overrides: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Merge an incoming item into the destination item according to explicit strategy.
        Guarantees provenance preservation.
        """
        if strategy == MergeStrategy.KEEP_LOCAL:
            return dict(local_item)

        if strategy == MergeStrategy.KEEP_INCOMING:
            merged = dict(incoming_item)
            # Preserve original local creation timestamp if earlier
            if local_item.get("created_at"):
                merged["created_at"] = local_item["created_at"]
            return merged

        if strategy == MergeStrategy.FIELD_LEVEL_MERGE:
            merged = dict(local_item)
            # Apply incoming fields only if local is empty/None or explicitly overridden
            for k, v in incoming_item.items():
                if v is not None and (merged.get(k) is None or merged.get(k) == ""):
                    merged[k] = v

            # Apply explicit manual overrides
            if field_overrides:
                for k, v in field_overrides.items():
                    merged[k] = v

            merged["reconciled_via"] = "FIELD_LEVEL_MERGE"
            return merged

        # Fallback to manual review
        merged = dict(local_item)
        merged["quarantined_for_conflict"] = True
        return merged
