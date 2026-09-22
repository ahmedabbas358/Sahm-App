"""
Sahm Backend — Audit Log Model
"""
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, UUIDMixin, TimestampMixin


class AuditLog(Base, UUIDMixin, TimestampMixin):
    """
    Immutable audit trail for every data change.
    Records who did what, when, and what changed.
    Regular users cannot modify or delete audit logs.
    """

    __tablename__ = "audit_logs"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True,
        comment="create, update, delete, approve, publish, deliver"
    )
    entity_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True,
        comment="batch, record, college, etc."
    )
    entity_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True,
    )
    changes: Mapped[dict] = mapped_column(
        JSONB, nullable=True,
        comment="JSON diff of what changed: {field: {old, new}}"
    )
    ip_address: Mapped[str] = mapped_column(
        String(45), nullable=True, comment="Client IP address"
    )
    user_agent: Mapped[str] = mapped_column(
        String(500), nullable=True
    )
    details: Mapped[str] = mapped_column(
        Text, nullable=True, comment="ملاحظات إضافية"
    )

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} {self.entity_type} by {self.user_id}>"
