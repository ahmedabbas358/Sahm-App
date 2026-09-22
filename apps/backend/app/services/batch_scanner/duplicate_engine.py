"""
Sahm Backend — 3-Tier Duplicate Detection Engine (Prompt 17 - Sections 17, 18, 19)
Tiers:
1. Exact File Hash (SHA-256)
2. Perceptual Image Similarity (dHash + Hamming Distance)
3. Certificate Data Identity (Certificate Number & University ID)
Strict Rule: Never auto-delete. Retain both and flag for human comparison.
"""
import hashlib
import os
from typing import Any, Dict, List, Optional, Tuple
from PIL import Image

from app.models.batch_scanner import DuplicateStatus


class DuplicateDetectionEngine:
    """
    Detects identical files, visually similar crops, and certificate identity collisions.
    """

    def __init__(self, db=None):
        self.db = db

    def detect_duplicates(self, item: Any) -> Dict[str, Any]:
        """
        Queries existing items in the same batch session and detects duplicate collisions.
        """
        if not self.db:
            return {
                "duplicate_status": DuplicateStatus.NO_DUPLICATE.value,
                "duplicate_of_item_id": None,
                "tier": None,
                "reasons": [],
            }

        from sqlalchemy import select
        from app.models.batch_scanner import BatchScanItem

        # Query all items in this session except the current one
        query = select(BatchScanItem).where(
            BatchScanItem.session_id == item.session_id,
            BatchScanItem.id != item.id,
        )
        existing_models = self.db.execute(query).scalars().all()

        existing_dicts = []
        for em in existing_models:
            existing_dicts.append({
                "id": str(em.id),
                "sha256_hash": em.sha256_hash or "",
                "p_hash": em.p_hash or "",
                "extracted_fields": em.extracted_fields or {},
            })

        res = self.evaluate_item_duplicates(
            current_sha256=item.sha256_hash or "",
            current_phash=item.p_hash or "",
            current_extracted_fields=item.extracted_fields or {},
            existing_items=existing_dicts,
        )

        status_val = res["duplicate_status"]
        if hasattr(status_val, "value"):
            status_val = status_val.value

        tier_val = res.get("tier")
        if tier_val == "exact_sha256":
            tier_num = 1
        elif tier_val == "perceptual_hash":
            tier_num = 2
        elif tier_val in ("certificate_number_collision", "student_id_duplicate"):
            tier_num = 3
        else:
            tier_num = None

        return {
            "duplicate_status": status_val,
            "duplicate_of_item_id": res.get("duplicate_of_item_id"),
            "tier": tier_num,
            "reasons": [res.get("reason")] if res.get("reason") else [],
        }

    @classmethod
    def compute_sha256(cls, file_path: str) -> str:
        """Calculates exact SHA-256 hash of a file on disk."""
        if not os.path.exists(file_path):
            return ""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def compute_dhash(cls, image_path: str, hash_size: int = 8) -> str:
        """
        Computes Difference Hash (dHash) for perceptual visual similarity.
        Resistant to minor scaling, compression, and contrast shifts.
        Returns a 16-character hexadecimal string.
        """
        if not os.path.exists(image_path):
            return "0" * 16

        try:
            with Image.open(image_path) as img:
                # Resize to (hash_size + 1, hash_size) in grayscale
                img_gray = img.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.BILINEAR)
                pixels = list(img_gray.getdata())

                difference = []
                for row in range(hash_size):
                    for col in range(hash_size):
                        pixel_left = pixels[row * (hash_size + 1) + col]
                        pixel_right = pixels[row * (hash_size + 1) + col + 1]
                        difference.append(pixel_left > pixel_right)

                # Convert boolean array to hex string
                decimal_val = 0
                for index, val in enumerate(difference):
                    if val:
                        decimal_val |= 1 << index
                return f"{decimal_val:016x}"
        except Exception:
            return "0" * 16

    @classmethod
    def hamming_distance(cls, hash1: str, hash2: str) -> int:
        """Calculates bitwise Hamming distance between two hex hash strings."""
        if not hash1 or not hash2:
            return 64
        try:
            val1 = int(hash1, 16)
            val2 = int(hash2, 16)
            xor_val = val1 ^ val2
            return bin(xor_val).count("1")
        except ValueError:
            return 64

    @classmethod
    def evaluate_item_duplicates(
        cls,
        current_sha256: str,
        current_phash: str,
        current_extracted_fields: Dict[str, Any],
        existing_items: List[Dict[str, Any]],
        hamming_threshold: int = 6,
    ) -> Dict[str, Any]:
        """
        Evaluates a candidate item against a set of existing items in the batch session.
        Returns duplicate status, suspected item reference, and matched tier reasons.
        """
        curr_cert_num = str(current_extracted_fields.get("certificate_number") or "").strip()
        curr_student_id = str(current_extracted_fields.get("university_id") or "").strip()

        for item in existing_items:
            item_id = item.get("id")
            existing_sha = item.get("sha256_hash", "")
            existing_phash = item.get("p_hash", "")
            existing_fields = item.get("extracted_fields", {}) or {}

            # Tier 1: Exact File Duplicate (SHA-256)
            if current_sha256 and existing_sha and current_sha256 == existing_sha:
                return {
                    "duplicate_status": DuplicateStatus.LIKELY_DUPLICATE,
                    "duplicate_of_item_id": item_id,
                    "tier": "exact_sha256",
                    "reason": "تطابق رقمي متطابق بنسبة 100% مع صورة سابقة (Exact file duplicate via SHA-256).",
                    "similarity_score": 100.0,
                }

            # Tier 2: Perceptual Image Hash (dHash)
            if current_phash and existing_phash:
                dist = cls.hamming_distance(current_phash, existing_phash)
                if dist <= hamming_threshold:
                    similarity = max(0.0, round((1.0 - dist / 64.0) * 100.0, 1))
                    return {
                        "duplicate_status": DuplicateStatus.POSSIBLE_DUPLICATE,
                        "duplicate_of_item_id": item_id,
                        "tier": "perceptual_hash",
                        "reason": f"تشابه بصري عالٍ مع صورة سابقة (مسافة الهامينج {dist} من 64).",
                        "similarity_score": similarity,
                    }

            # Tier 3: Certificate Data Identity Collision
            ex_cert_num = str(existing_fields.get("certificate_number") or "").strip()
            ex_student_id = str(existing_fields.get("university_id") or "").strip()

            if curr_cert_num and ex_cert_num and curr_cert_num == ex_cert_num:
                return {
                    "duplicate_status": DuplicateStatus.LIKELY_DUPLICATE,
                    "duplicate_of_item_id": item_id,
                    "tier": "certificate_number_collision",
                    "reason": f"تكرار رقم الشهادة الرسمي ({curr_cert_num}) المسجل بالفعل في شهادة أخرى.",
                    "similarity_score": 95.0,
                }

            if curr_student_id and ex_student_id and curr_student_id == ex_student_id:
                return {
                    "duplicate_status": DuplicateStatus.POSSIBLE_DUPLICATE,
                    "duplicate_of_item_id": item_id,
                    "tier": "student_id_duplicate",
                    "reason": f"تم مسح شهادة أخرى لنفس الرقم الجامعي ({curr_student_id}) داخل نفس الدفعة.",
                    "similarity_score": 85.0,
                }

        return {
            "duplicate_status": DuplicateStatus.NO_DUPLICATE,
            "duplicate_of_item_id": None,
            "tier": "none",
            "reason": "لم يتم العثور على أي تكرار متطابق أو إدراكي.",
            "similarity_score": 0.0,
        }


# Module-level aliases for convenient direct imports
compute_dhash = DuplicateDetectionEngine.compute_dhash
hamming_distance = DuplicateDetectionEngine.hamming_distance
compute_sha256 = DuplicateDetectionEngine.compute_sha256
