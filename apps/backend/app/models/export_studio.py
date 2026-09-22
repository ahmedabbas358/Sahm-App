"""
Sahm Backend — Export & Document Studio Models (Section 27)
Separates structured university data from presentation templates,
manages renderers, versioning, cryptographic file hashes, and QR verification.
"""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, UUIDMixin, TimestampMixin


class ExportFormat(str, enum.Enum):
    """Supported export formats for documents and datasets."""
    PDF = "pdf"
    XLSX = "xlsx"
    CSV = "csv"
    DOCX = "docx"
    HTML = "html"
    JSON = "json"
    XML = "xml"
    TXT = "txt"
    PNG = "png"
    PRINT = "print"


class TemplateCategory(str, enum.Enum):
    """Institutional template categorization."""
    OFFICIAL_LIST = "official_list"          # كشف رسمي للطباعة والاعتماد
    PUBLIC_LIST = "public_list"              # كشف مخصص للنشر العام (محمي الخصوصية)
    INTERNAL_LIST = "internal_list"          # كشف إداري داخلي
    GRADUATION_LIST = "graduation_list"      # كشف خريجين معتمد
    COLLEGE_REPORT = "college_report"        # تقرير تفصيلي حسب الكلية
    DEPARTMENT_REPORT = "department_report"  # تقرير حسب القسم الأكاديمي
    OFFICIAL_LETTER = "official_letter"      # خطاب رسمي / إفادة
    ARCHIVE_EXPORT = "archive_export"        # تصدير أرشيفي شامل للبيانات الوصفية


class JobStatus(str, enum.Enum):
    """Status lifecycle of an asynchronous export generation task."""
    QUEUED = "queued"
    PROCESSING = "processing"
    FINALIZING = "finalizing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExportTemplate(Base, UUIDMixin, TimestampMixin):
    """
    Export Template definition.
    Allows complete control over page size, orientation, layout canvas,
    header, footer, table columns, dynamic expression fields, and styling.
    """
    __tablename__ = "export_templates"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[TemplateCategory] = mapped_column(
        Enum(TemplateCategory), default=TemplateCategory.OFFICIAL_LIST, nullable=False, index=True
    )
    default_format: Mapped[ExportFormat] = mapped_column(
        Enum(ExportFormat), default=ExportFormat.PDF, nullable=False
    )
    is_preset: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="قالب مؤسسي افتراضي"
    )
    is_public_ready: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="معتمد للنشر العام دون حقول سرية"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Page settings: size (A4, A3, Letter), orientation (portrait, landscape), margins (top, bottom, left, right)
    page_config: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 15, "bottom": 15, "left": 15, "right": 15, "unit": "mm"},
            "rtl": True,
        },
        nullable=False,
    )

    # Layout canvas settings: header, footer, university logo, dynamic blocks, signatures, notes, QR
    layout_config: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "header": {
                "show_logo": True,
                "university_name_ar": "جامعة إفريقيا العالمية",
                "college_title": "{{ college.name }}",
                "report_title": "{{ report.title }}",
                "show_issue_date": True,
            },
            "footer": {
                "show_page_number": True,
                "show_qr": True,
                "show_approved_by": True,
                "confidentiality_notice": "وثيقة جامعية رسمية معتمدة",
            },
            "signatures": [
                {"role": "رئيس القسم", "name": "أ.د. رئيس القسم"},
                {"role": "عميد الكلية", "name": "د. عميد الكلية"},
            ],
        },
        nullable=False,
    )

    # Table designer settings: visible columns, headers, order, alignments, borders, pagination repeat
    table_config: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "columns": [
                {"key": "row_num", "label": "#", "width": 8, "align": "center", "visible": True},
                {"key": "student_name", "label": "اسم الطالب", "width": 45, "align": "right", "visible": True},
                {"key": "university_id", "label": "الرقم الجامعي", "width": 25, "align": "center", "visible": True},
                {"key": "status_label", "label": "حالة الشهادة", "width": 22, "align": "center", "visible": True},
            ],
            "repeat_header_on_page": True,
            "row_height": 10,
            "header_bg_color": "#0F172A",
            "header_text_color": "#FFFFFF",
            "zebra_striping": True,
            "prevent_row_split": True,
        },
        nullable=False,
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    current_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    versions = relationship("TemplateVersion", back_populates="template", cascade="all, delete-orphan")
    jobs = relationship("ExportJob", back_populates="template")
    creator = relationship("User", foreign_keys=[created_by])


class TemplateVersion(Base, UUIDMixin):
    """Historical immutable snapshots of template configurations."""
    __tablename__ = "template_versions"

    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("export_templates.id"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    page_config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    layout_config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    table_config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    change_reason: Mapped[str] = mapped_column(String(500), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    template = relationship("ExportTemplate", back_populates="versions")
    creator = relationship("User", foreign_keys=[created_by])


class ExportProfile(Base, UUIDMixin, TimestampMixin):
    """Reusable export configuration presets linking templates, filters, and privacy rules."""
    __tablename__ = "export_profiles"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("export_templates.id"), nullable=False
    )
    format: Mapped[ExportFormat] = mapped_column(
        Enum(ExportFormat), default=ExportFormat.PDF, nullable=False
    )
    default_filters: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    included_fields: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    excluded_fields: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    is_public_profile: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    template = relationship("ExportTemplate")
    creator = relationship("User", foreign_keys=[created_by])


class ExportJob(Base, UUIDMixin, TimestampMixin):
    """Asynchronous background generation job tracking."""
    __tablename__ = "export_jobs"

    job_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("export_templates.id"), nullable=False
    )
    template_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("export_profiles.id"), nullable=True
    )
    format: Mapped[ExportFormat] = mapped_column(Enum(ExportFormat), nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True
    )
    total_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    parameters: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    template = relationship("ExportTemplate", back_populates="jobs")
    profile = relationship("ExportProfile")
    user = relationship("User", foreign_keys=[user_id])
    artifacts = relationship("GeneratedArtifact", back_populates="job", cascade="all, delete-orphan")


class GeneratedArtifact(Base, UUIDMixin, TimestampMixin):
    """
    The generated, immutable file artifact.
    Includes cryptographic SHA-256 hash for tamper-detection,
    versioning (Superseded / Current), and verification codes.
    """
    __tablename__ = "generated_artifacts"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("export_jobs.id"), nullable=False, index=True
    )
    document_number: Mapped[str] = mapped_column(
        String(60), unique=True, nullable=False, index=True, comment="مثال: CERT-2026-000184"
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    format: Mapped[ExportFormat] = mapped_column(Enum(ExportFormat), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    file_hash_sha256: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="SHA-256 للتأكد من عدم التلاعب بالمستند"
    )
    verification_code: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True, comment="معرّف التحقق العشوائي الآمن"
    )

    # Version tracking
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_superseded: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="هل تم استبدال هذه النسخة بنسخة أحدث"
    )
    superseded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("generated_artifacts.id"), nullable=True
    )
    change_reason: Mapped[str] = mapped_column(Text, nullable=True)

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    approved_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    job = relationship("ExportJob", back_populates="artifacts")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])
    superseded_by = relationship("GeneratedArtifact", remote_side="GeneratedArtifact.id")
    verification = relationship("DocumentVerification", uselist=False, back_populates="artifact")


class DocumentVerification(Base, UUIDMixin):
    """
    Public verification registry for QR code scans.
    Deliberately exposes ONLY institutional non-sensitive metadata.
    Does NOT contain student private PII.
    """
    __tablename__ = "document_verifications"

    artifact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("generated_artifacts.id"), nullable=False, unique=True
    )
    verification_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    public_summary: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "document_title": "",
            "issuing_institution": "جامعة إفريقيا العالمية",
            "faculty": "",
            "issue_date": "",
            "record_count": 0,
            "status": "معتمد ورسمي",
        },
        nullable=False,
    )
    scan_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    artifact = relationship("GeneratedArtifact", back_populates="verification")
