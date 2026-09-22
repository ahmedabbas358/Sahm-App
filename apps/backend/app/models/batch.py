"""
Sahm Backend — Batch Model
"""
import enum
from sqlalchemy import String, Integer, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class BatchStatus(str, enum.Enum):
    """Lifecycle status of a batch."""
    DRAFT = "draft"              # تم إنشاؤها
    CAPTURING = "capturing"      # جاري التصوير
    EXTRACTING = "extracting"    # جاري الاستخراج
    REVIEWING = "reviewing"      # جاري المراجعة
    APPROVED = "approved"        # معتمدة
    PUBLISHED = "published"      # منشورة
    ARCHIVED = "archived"        # مؤرشفة


class CertificateType(str, enum.Enum):
    """Type of certificate."""
    BACHELOR = "bachelor"        # بكالوريوس
    MASTER = "master"            # ماجستير
    DOCTORATE = "doctorate"      # دكتوراه
    DIPLOMA = "diploma"          # دبلوم
    HIGHER_DIPLOMA = "higher_diploma"  # دبلوم عالي


class Batch(Base, UUIDMixin, TimestampMixin):
    """
    A batch represents a group of student records from a specific
    college, specialization, and graduation year.
    """

    __tablename__ = "batches"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    college_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False
    )
    specialization_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("specializations.id"),
        nullable=True,
    )
    certificate_type: Mapped[CertificateType] = mapped_column(
        Enum(CertificateType), nullable=False
    )
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[BatchStatus] = mapped_column(
        Enum(BatchStatus), default=BatchStatus.DRAFT, nullable=False
    )
    expected_count: Mapped[int] = mapped_column(
        Integer, nullable=True, comment="العدد المتوقع من السجلات"
    )
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Relationships
    college = relationship("College", back_populates="batches")
    specialization = relationship("Specialization", back_populates="batches")
    creator = relationship("User", foreign_keys=[created_by])
    records = relationship(
        "StudentRecord", back_populates="batch", lazy="dynamic"
    )
    source_images = relationship(
        "SourceImage", back_populates="batch", lazy="dynamic"
    )

    def __repr__(self) -> str:
        return f"<Batch {self.name} ({self.status.value})>"
