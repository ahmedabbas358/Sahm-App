"""
Sahm Backend — Resumable Chunked Transfer Manager (Prompt 22)
Handles 8MB chunking, per-chunk SHA-256 verification, resume offsets,
and reassembly without memory bloat.
"""
import math
from typing import List, Dict, Any, Tuple
from app.services.handoff.crypto_engine import CryptoEngine


class ResumableTransferManager:
    """Manages chunked slicing, verification, and resume operations."""

    DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024  # 8MB standard chunk

    @classmethod
    def slice_into_chunks(
        cls,
        payload_bytes: bytes,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
    ) -> List[Dict[str, Any]]:
        """
        Slice raw or encrypted payload into sequential chunks with individual SHA-256 hashes.
        Returns list of chunk metadata dictionaries.
        """
        total_size = len(payload_bytes)
        if total_size == 0:
            return [{
                "chunk_index": 0,
                "chunk_size": 0,
                "chunk_hash": CryptoEngine.calculate_sha256(b""),
                "chunk_data": b"",
            }]

        chunks = []
        total_chunks = math.ceil(total_size / chunk_size)

        for i in range(total_chunks):
            start = i * chunk_size
            end = min(start + chunk_size, total_size)
            chunk_data = payload_bytes[start:end]
            chunk_hash = CryptoEngine.calculate_sha256(chunk_data)

            chunks.append({
                "chunk_index": i,
                "chunk_size": len(chunk_data),
                "chunk_hash": chunk_hash,
                "chunk_data": chunk_data,
            })

        return chunks

    @classmethod
    def verify_chunk(cls, chunk_data: bytes, expected_hash: str) -> bool:
        """Verify that an uploaded or received chunk matches its expected SHA-256."""
        actual_hash = CryptoEngine.calculate_sha256(chunk_data)
        return actual_hash.lower() == expected_hash.lower()

    @classmethod
    def reassemble_chunks(cls, chunks: List[Dict[str, Any]]) -> bytes:
        """
        Reassemble ordered chunks into a single byte stream.
        Chunks are sorted by `chunk_index` before concatenation.
        """
        sorted_chunks = sorted(chunks, key=lambda c: c["chunk_index"])
        reassembled = b"".join(c["chunk_data"] for c in sorted_chunks)
        return reassembled

    @classmethod
    def calculate_resume_offset(cls, completed_chunk_indices: List[int], total_chunks: int) -> int:
        """
        Determine the next chunk index required to resume transmission.
        E.g. if chunks 0..152 are completed, resumes at chunk 153.
        """
        if not completed_chunk_indices:
            return 0
        completed_set = set(completed_chunk_indices)
        for i in range(total_chunks):
            if i not in completed_set:
                return i
        return total_chunks  # All completed

    @classmethod
    def compute_progress_percentage(cls, completed_count: int, total_count: int) -> float:
        """Compute transfer completion percentage (0.0 to 100.0)."""
        if total_count <= 0:
            return 100.0
        return round((completed_count / total_count) * 100.0, 2)
