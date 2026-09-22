"""
Sahm Backend — College & Specialization Models
"""
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, UUIDMixin, TimestampMixin


class College(Base, UUIDMixin, TimestampMixin):
    """University college / faculty."""

    __tablename__ = "colleges"

    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=True)
    code: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )

    # Relationships
    specializations = relationship(
        "Specialization", back_populates="college", lazy="selectin"
    )
    batches = relationship("Batch", back_populates="college", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<College {self.code}: {self.name_ar}>"


class Specialization(Base, UUIDMixin, TimestampMixin):
    """Academic specialization within a college."""

    __tablename__ = "specializations"

    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    college_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False
    )

    # Relationships
    college = relationship("College", back_populates="specializations")
    batches = relationship("Batch", back_populates="specialization", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Specialization {self.code}: {self.name_ar}>"
