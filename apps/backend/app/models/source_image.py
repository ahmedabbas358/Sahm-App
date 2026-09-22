"""
Sahm Backend — Source Image Model
"""
from sqlalchemy import String, Integer, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class SourceImage(Base, UUIDMixin, TimestampMixin):
    """
    Original scanned/photographed document image.
    Links records to their source for evidence and traceability.
    """

    __tablename__ = "source_images"

    batch_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batches.id"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="مسار الملف في التخزين"
    )
    file_hash: Mapped[str] = mapped_column(
        String(128), nullable=True, comment="SHA-256 hash for integrity"
    )
    file_size: Mapped[int] = mapped_column(
        BigInteger, nullable=True, comment="حجم الملف بالبايت"
    )
    page_number: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False, comment="رقم الصفحة في المستند"
    )
    total_pages: Mapped[int] = mapped_column(
        Integer, default=1, nullable=True, comment="العدد الكلي للصفحات"
    )
    uploaded_by: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Relationships
    batch = relationship("Batch", back_populates="source_images")
    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self) -> str:
        return f"<SourceImage page {self.page_number} of batch {self.batch_id}>"
