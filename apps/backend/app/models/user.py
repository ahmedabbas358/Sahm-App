"""
Sahm Backend — User Model
"""
import enum
from sqlalchemy import String, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class UserRole(str, enum.Enum):
    """User roles for RBAC."""
    ADMIN = "admin"
    MANAGER = "manager"        # مدير قسم — يمكنه اعتماد ونشر
    REVIEWER = "reviewer"      # مراجع — يمكنه مراجعة وتعديل السجلات
    OPERATOR = "operator"      # مشغّل — يمكنه التصوير وإدخال البيانات
    VIEWER = "viewer"          # مشاهد — يمكنه البحث والعرض فقط


class User(Base, UUIDMixin, TimestampMixin):
    """User account for the Sahm platform."""

    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.OPERATOR, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"
