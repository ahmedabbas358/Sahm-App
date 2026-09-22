"""
Sahm Backend — Student Record Model
"""
import enum
from sqlalchemy import String, Integer, Float, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class CertificateStatus(str, enum.Enum):
    """Status of a student's certificate."""
    EXTRACTED = "extracted"            # مستخرج من OCR — لم يُراجع بعد
    NEEDS_REVIEW = "needs_review"      # يحتاج مراجعة
    REVIEWED = "reviewed"              # تمت المراجعة
    APPROVED = "approved"              # معتمد
    CERTIFICATE_READY = "cert_ready"   # الشهادة جاهزة
    DELIVERED = "delivered"            # تم التسليم
    CORRECTION = "correction"          # يحتاج تصحيح
    REJECTED = "rejected"              # مرفوض


class StudentRecord(Base, UUIDMixin, TimestampMixin):
    """
    Digital record for a student's certificate.

    Key design decisions:
    - university_id is TEXT not INTEGER (preserves leading zeros)
    - student_name_raw stores the original extracted text
    - student_name stores the approved/corrected name
    - source_file/page/row link back to the original document
    """

    __tablename__ = "student_records"

    batch_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batches.id"), nullable=False, index=True
    )

    # --- Student Identity ---
    student_name_raw: Mapped[str] = mapped_column(
        String(500), nullable=True,
        comment="الاسم كما استُخرج من المصدر الأصلي"
    )
    student_name: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="الاسم المعتمد بعد المراجعة"
    )
    university_id: Mapped[str] = mapped_column(
        String(50), nullable=True, index=True,
        comment="الرقم الجامعي — نص وليس رقماً"
    )

    # --- Certificate Status ---
    status: Mapped[CertificateStatus] = mapped_column(
        Enum(CertificateStatus),
        default=CertificateStatus.EXTRACTED,
        nullable=False,
        index=True,
    )

    # --- Source Traceability ---
    source_image_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("source_images.id"),
        nullable=True,
    )
    source_page: Mapped[int] = mapped_column(
        Integer, nullable=True, comment="رقم الصفحة في المصدر"
    )
    source_row: Mapped[int] = mapped_column(
        Integer, nullable=True, comment="رقم الصف في الصفحة"
    )

    # --- Confidence (from OCR) ---
    confidence_name: Mapped[float] = mapped_column(
        Float, nullable=True, comment="مستوى ثقة الاسم (0-1)"
    )
    confidence_id: Mapped[float] = mapped_column(
        Float, nullable=True, comment="مستوى ثقة الرقم الجامعي (0-1)"
    )

    # --- Review & Approval ---
    reviewed_by: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    approved_by: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # --- Delivery ---
    delivered_to: Mapped[str] = mapped_column(
        String(255), nullable=True, comment="اسم المستلم إذا مختلف"
    )
    delivery_notes: Mapped[str] = mapped_column(Text, nullable=True)

    # --- Notes ---
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    batch = relationship("Batch", back_populates="records")
    source_image = relationship("SourceImage")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    approver = relationship("User", foreign_keys=[approved_by])

    def __repr__(self) -> str:
        return f"<StudentRecord {self.university_id}: {self.student_name} ({self.status.value})>"
