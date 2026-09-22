"""
Sahm Backend — Secure Share, Work Handoff & Encrypted Data Transfer Models (Prompt 22)
Defines WorkHandoff, Snapshots, Packages, Chunks, Collaborative Workspaces,
Item Claims, Device Trust Registrations, and DLP Policies.
"""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    BigInteger,
    Float,
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


class HandoffType(str, enum.Enum):
    """Categorization of what is being shared or transferred."""
    CONTINUE_WORK_HANDOFF = "continue_work_handoff"  # First-class: operational transfer to resume work
    SHARE_BATCH = "share_batch"                      # Full certificate scan batch
    SHARE_IMPORT = "share_import"                    # Raw imported dataset session
    SHARE_REVIEW_QUEUE = "share_review_queue"        # Quarantined review items only
    SHARE_CERTIFICATE_SET = "share_certificate_set"  # Selected subset of certificates
    SHARE_WORK_ITEM = "share_work_item"              # Single work item
    SHARE_EXPORT_PROJECT = "share_export_project"    # Document studio project
    SHARE_VERIFICATION_PACKAGE = "share_verification_package"  # Issued QR verification set
    SHARE_ARCHIVE_PACKAGE = "share_archive_package"  # Historical audit archive
    SHARE_TEMPLATE = "share_template"                # Export template definition


class HandoffStatus(str, enum.Enum):
    """Explicit state machine for a handoff transfer lifecycle."""
    DRAFT = "draft"                    # Initializing transfer parameters
    PREPARING = "preparing"            # Packaging & calculating cryptographic hashes
    READY = "ready"                    # Package ready for transfer
    INVITED = "invited"                # Notification/link generated for recipient
    TRANSFERRING = "transferring"      # Active streaming or chunk upload/download
    AVAILABLE = "available"            # Arrived at destination, awaiting acceptance
    ACCEPTED = "accepted"              # Recipient accepted; integrity validated
    IN_PROGRESS = "in_progress"        # Recipient actively continuing the work
    PAUSED = "paused"                  # Temporarily suspended
    EXPIRED = "expired"                # Timed out according to TTL policy
    REVOKED = "revoked"                # Sender or administrator destroyed key access
    COMPLETED = "completed"            # Work finished and integrated
    FAILED = "failed"                  # Checksum mismatch, decryption or network failure
    CANCELLED = "cancelled"            # Aborted by sender before acceptance


class TransferMethod(str, enum.Enum):
    """Physical or network channel used for the transfer."""
    DIRECT_LOCAL = "direct_local"                  # Wi-Fi Direct / Local network mutual handshake
    CLOUD_STAGED = "cloud_staged"                  # Encrypted blob via university cloud broker
    ENCRYPTED_PACKAGE_FILE = "encrypted_package_file"  # Versioned .sahmpkg offline file
    DRIVE_ENTERPRISE = "drive_enterprise"          # Restricted Google Drive enterprise share


class ShareRole(str, enum.Enum):
    """Granular operational roles for the recipient."""
    VIEWER = "viewer"                        # Read-only inspection (no edits, no commits)
    PROCESSOR = "processor"                  # Can re-run OCR, preprocess images
    REVIEWER = "reviewer"                    # Can review, correct ambiguous fields
    APPROVER = "approver"                    # Has institutional authority to approve
    OPERATIONAL_OWNER = "operational_owner"  # Full control over batch continuation


class ConflictClass(str, enum.Enum):
    """Conflict classification when merging with existing workspaces."""
    DATA_CONFLICT = "data_conflict"              # Discrepancy in field values (e.g. 2024 vs 2023)
    STATE_CONFLICT = "state_conflict"            # State mismatch (e.g. Approved vs Needs Review)
    OWNERSHIP_CONFLICT = "ownership_conflict"    # Conflicting lock or claimed assignment
    PERMISSION_CONFLICT = "permission_conflict"  # Recipient lacks authority for an action
    VERSION_CONFLICT = "version_conflict"        # Older package schema vs newer system
    SOURCE_CONFLICT = "source_conflict"          # Hash mismatch of original source document
    PROVENANCE_CONFLICT = "provenance_conflict"  # Conflict in historical creator or timestamp


class MergeStrategy(str, enum.Enum):
    """Strategy to resolve reconciliation conflicts."""
    KEEP_LOCAL = "keep_local"                    # Prefer destination existing data
    KEEP_INCOMING = "keep_incoming"              # Overwrite with incoming data (if authorized)
    MANUAL_REVIEW = "manual_review"              # Quarantine to dual-inspector diff view
    FIELD_LEVEL_MERGE = "field_level_merge"      # Merge orthogonal non-overlapping fields
    CREATE_NEW_VERSION = "create_new_version"    # Branch into a parallel version


class DataClassification(str, enum.Enum):
    """Institutional sensitivity level governing sharing constraints."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"                    # Hard restrictions: no external, strict DLP


class DeviceTrustStatus(str, enum.Enum):
    """Hardware registration trust level."""
    TRUSTED = "trusted"
    PENDING = "pending"
    REVOKED = "revoked"
    UNKNOWN = "unknown"


class DLPPolicyAction(str, enum.Enum):
    """Data Loss Prevention enforcement actions."""
    ALLOW = "allow"
    ALLOW_WITH_AUDIT = "allow_with_audit"
    REQUIRE_APPROVAL = "require_approval"
    BLOCK_WITH_ALERT = "block_with_alert"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class WorkHandoff(Base, UUIDMixin, TimestampMixin):
    """
    Central record managing the transfer of working state between operators,
    devices, or workspaces without loss of previous processing.
    """
    __tablename__ = "work_handoffs"

    tenant_id: Mapped[str] = mapped_column(String(100), default="tenant_default", index=True, nullable=False)
    institution_id: Mapped[str] = mapped_column(String(100), default="inst_main", nullable=False)

    source_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    target_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    source_device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    handoff_type: Mapped[HandoffType] = mapped_column(Enum(HandoffType), default=HandoffType.CONTINUE_WORK_HANDOFF, nullable=False)
    source_entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "batch", "review_queue", etc.
    source_entity_id: Mapped[str] = mapped_column(String(100), nullable=False)

    package_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("handoff_packages.id"), nullable=True)

    status: Mapped[HandoffStatus] = mapped_column(Enum(HandoffStatus), default=HandoffStatus.DRAFT, nullable=False, index=True)
    assigned_role: Mapped[ShareRole] = mapped_column(Enum(ShareRole), default=ShareRole.REVIEWER, nullable=False)
    transfer_method: Mapped[TransferMethod] = mapped_column(Enum(TransferMethod), default=TransferMethod.CLOUD_STAGED, nullable=False)
    data_classification: Mapped[DataClassification] = mapped_column(Enum(DataClassification), default=DataClassification.RESTRICTED, nullable=False)

    # Scoping: capabilities enabled in the package
    permission_scope: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    # Opaque security token and mutual verification
    share_token: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    passcode_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    pairing_phrase: Mapped[str | None] = mapped_column(String(64), nullable=True)  # e.g. "BLUE-ORBIT-27"

    # Lifecycle timestamps
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    package = relationship("HandoffPackage", back_populates="handoffs", foreign_keys=[package_id])
    snapshot = relationship("HandoffSnapshot", back_populates="handoff", uselist=False)
    audit_logs = relationship("HandoffAuditLog", back_populates="handoff", cascade="all, delete-orphan")


class HandoffSnapshot(Base, UUIDMixin, TimestampMixin):
    """
    Immutable representation of work state frozen at the moment of handoff creation.
    Guarantees exact state preservation without mutating the sender's active workspace.
    """
    __tablename__ = "handoff_snapshots"

    handoff_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("work_handoffs.id"), unique=True, nullable=False)

    total_items_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_items_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    needs_review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pending_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    next_resume_item_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ocr_pipeline_fingerprint: Mapped[str] = mapped_column(String(128), nullable=False)
    source_snapshot_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256 of frozen state

    # Serialized work state container
    snapshot_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    handoff = relationship("WorkHandoff", back_populates="snapshot")


class HandoffPackage(Base, UUIDMixin, TimestampMixin):
    """
    Container representing the encrypted payload, its integrity hashes,
    and wrapped DEK (Data Encryption Key) following the envelope encryption model.
    """
    __tablename__ = "handoff_packages"

    package_identifier: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    package_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)

    manifest_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256 of manifest.json
    payload_hash: Mapped[str] = mapped_column(String(64), nullable=False)   # SHA-256 of encrypted_payload.bin
    merkle_root: Mapped[str | None] = mapped_column(String(64), nullable=True)

    payload_size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    chunk_size_bytes: Mapped[int] = mapped_column(Integer, default=8 * 1024 * 1024, nullable=False)  # 8MB standard
    total_chunks_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed_chunks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    storage_uri: Mapped[str | None] = mapped_column(String(512), nullable=True)
    encryption_algorithm: Mapped[str] = mapped_column(String(32), default="AES-256-GCM", nullable=False)

    # Wrapped DEK: encrypted with recipient or institution public key
    wrapped_dek_base64: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_key_destroyed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # Crypto-shredding flag

    chunks = relationship("HandoffChunk", back_populates="package", cascade="all, delete-orphan")
    handoffs = relationship("WorkHandoff", back_populates="package")


class HandoffChunk(Base, UUIDMixin, TimestampMixin):
    """
    Individual chunk of an encrypted package for resumable high-volume transfers.
    """
    __tablename__ = "handoff_chunks"

    package_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("handoff_packages.id"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256 of this chunk
    chunk_size: Mapped[int] = mapped_column(Integer, nullable=False)

    is_uploaded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    package = relationship("HandoffPackage", back_populates="chunks")


class HandoffAuditLog(Base, UUIDMixin, TimestampMixin):
    """
    Immutable non-repudiation audit trail recording the chain of custody.
    """
    __tablename__ = "handoff_audit_logs"

    handoff_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("work_handoffs.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    actor_device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    client_ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    payload_summary: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    handoff = relationship("WorkHandoff", back_populates="audit_logs")


class SharedWorkspace(Base, UUIDMixin, TimestampMixin):
    """
    Collaborative multi-user shared workspace supporting concurrent live review.
    """
    __tablename__ = "shared_workspaces"

    tenant_id: Mapped[str] = mapped_column(String(100), default="tenant_default", index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_batch_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    live_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    members = relationship("SharedWorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="workspace", cascade="all, delete-orphan")


class SharedWorkspaceMember(Base, UUIDMixin, TimestampMixin):
    """
    Membership and role assignment in a shared collaborative workspace.
    """
    __tablename__ = "shared_workspace_members"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shared_workspaces.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role: Mapped[ShareRole] = mapped_column(Enum(ShareRole), default=ShareRole.REVIEWER, nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    workspace = relationship("SharedWorkspace", back_populates="members")


class ItemClaim(Base, UUIDMixin, TimestampMixin):
    """
    Lease-based item lock preventing two reviewers from modifying the same certificate concurrently.
    """
    __tablename__ = "item_claims"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shared_workspaces.id"), nullable=False, index=True)
    item_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    claimed_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    claim_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    lease_token: Mapped[str] = mapped_column(String(64), nullable=False)

    workspace = relationship("SharedWorkspace", back_populates="claims")


class DeviceRegistration(Base, UUIDMixin, TimestampMixin):
    """
    Institutional device registry tracking trusted scanning terminals, tablets, and desktops.
    """
    __tablename__ = "device_registrations"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    device_name: Mapped[str] = mapped_column(String(128), nullable=False)
    platform: Mapped[str] = mapped_column(String(32), nullable=False)  # "iOS", "Android", "Windows", "macOS"
    device_fingerprint: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    trust_status: Mapped[DeviceTrustStatus] = mapped_column(Enum(DeviceTrustStatus), default=DeviceTrustStatus.TRUSTED, nullable=False)
    public_key_pem: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DataLossPreventionPolicy(Base, UUIDMixin, TimestampMixin):
    """
    Institutional data protection rules governing export, cloud staging, and PII masking.
    """
    __tablename__ = "dlp_policies"

    tenant_id: Mapped[str] = mapped_column(String(100), default="tenant_default", unique=True, nullable=False)
    policy_name: Mapped[str] = mapped_column(String(128), default="Institutional DLP Standard", nullable=False)

    classification_level: Mapped[DataClassification] = mapped_column(Enum(DataClassification), default=DataClassification.RESTRICTED, nullable=False)
    allow_external_share: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_direct_device_transfer: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    allow_offline_package_export: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    require_supervisor_approval: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    watermark_shared_previews: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_expiration_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)

    restricted_fields: Mapped[list] = mapped_column(JSONB, default=lambda: ["national_id", "phone_number", "address"], nullable=False)
