# Sahm — Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Clients                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Flutter App │  │ Admin Panel │  │ Landing Page        │ │
│  │ (Mobile)    │  │ (Next.js)   │  │ (Static/GH Pages)   │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          │    HTTPS/TLS   │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                FastAPI Backend                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │   Auth   │ │  CRUD    │ │  Search  │             │   │
│  │  │  (JWT)   │ │  APIs    │ │  Engine  │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │  RBAC    │ │  Audit   │ │  Upload  │             │   │
│  │  │ Enforce  │ │   Log    │ │  Handler │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                │               │
          ▼                ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │    Redis     │  │   Object     │
│ (Records,    │  │  (Cache,     │  │   Storage    │
│  Audit, etc) │  │   Queue)     │  │  (Images)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Model

### Entity Relationship Diagram

```
User ──────────────────┐
  │                    │
  │ created_by         │ reviewed_by / approved_by
  ▼                    ▼
Batch ◄──────── StudentRecord
  │                    │
  │ college_id         │ source_image_id
  ▼                    ▼
College ◄──── SourceImage
  │
  │
  ▼
Specialization

AuditLog ──── User (who performed the action)
```

### Key Design Decisions

1. **UUID Primary Keys** — Supports offline-first sync without ID conflicts
2. **University ID as TEXT** — Preserves leading zeros and format variations
3. **Raw vs Approved Names** — `student_name_raw` (from OCR) vs `student_name` (human-approved)
4. **Per-field Confidence** — `confidence_name` and `confidence_id` instead of one score per record
5. **Source Traceability** — Every record links to its source image, page, and row
6. **Immutable Audit Log** — JSONB change tracking with user, timestamp, IP

## Security Model

### RBAC Roles

| Role | Create | Review | Approve | Publish | Admin |
|------|--------|--------|---------|---------|-------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reviewer | ✅ | ✅ | ❌ | ❌ | ❌ |
| Operator | ✅ | ❌ | ❌ | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ |

### Authentication Flow

1. User submits email + password
2. Backend verifies credentials
3. Returns JWT access token (60min) + refresh token (7 days)
4. Client sends access token in `Authorization: Bearer <token>` header
5. Backend validates token and checks RBAC on every request

## API Versioning

All APIs are versioned under `/api/v1/`. Breaking changes will increment the version.

---

## Export & Document Studio Subsystem (Section 27)

### Architecture & Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Export & Document Studio Pipeline                     │
│                                                                             │
│   [ Approved Dataset ] ──► [ Select Template ] ──► [ Layout Customizer ]    │
│           │                                                │                │
│           ▼                                                ▼                │
│   [ Privacy Guard ] ────► [ Validation Engine ] ──► [ Real-time Preview ]   │
│                                   │                                         │
│                                   ▼                                         │
│                      [ Background Job Queue ]                               │
│                                   │                                         │
│           ┌───────────────────────┼───────────────────────┐                 │
│           ▼                       ▼                       ▼                 │
│     [ XLSX Renderer ]       [ PDF Renderer ]       [ DOCX Renderer ]        │
│   (Multi-sheet, RTL,      (Smart Pagination,      (Official Branding,       │
│    String IDs, Formulas)   Repeated Headers, QR)   Tables, Signatures)      │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   ▼                                         │
│                       [ Generated Artifact Vault ]                          │
│                     (SHA-256 Hash, Version 1/2/...,                         │
│                      QR Public Verification Token)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data & Presentation Separation Principles
1. **Immutable Source Records**: Under no circumstances does changing a template modify the underlying database student records.
2. **Deterministic Versioning**: Historical generated artifacts remain frozen and read-only. Updates create new document versions (e.g., `Version 1 — Superseded`, `Version 2 — Current`).
3. **Institutional Template Library**: Reusable templates across colleges, departments, and programs with role-based sharing and locking.

### Dedicated Multi-Renderer Pipeline
- **XLSX Renderer (`openpyxl`)**:
  - Right-to-Left (RTL) worksheet direction.
  - Multi-sheet architecture (Sheet 1: Records, Sheet 2: Summary, Sheet 3: Metadata & Hashes, Sheet 4: Validation Report).
  - Explicit string formatting for University IDs (`@`) to avoid scientific notation or numerical loss.
  - AutoFilter, Header freeze panes, auto-fit column widths.
- **PDF Renderer**:
  - Smart pagination engine preventing row splitting.
  - Automatic repetition of table headers (`thead { display: table-header-group }`) on every page.
  - Arabic RTL text shaping and typography (IBM Plex Sans Arabic).
  - Header & Footer engine with dynamic page counting (`Page X of Y`).
  - Cryptographically secure QR verification code embedding.
- **DOCX Renderer**:
  - Official university header, dynamic fields, data tables, and signature blocks.
- **CSV / JSON / HTML / TXT Renderers**:
  - UTF-8 with BOM for Arabic CSV compatibility with Excel.
- **Batch Export**:
  - Multi-college generation packaged into ZIP archives with a comprehensive batch processing report.

### Validation & Privacy Guard
Before document generation, the system executes:
1. **Data Integrity**: Checks for required fields, duplicate IDs, and approved-state requirements.
2. **Layout & Dimensions**: Checks for margins, overflows, and column clipping.
3. **Privacy Guard**: Ensures public publication templates do not leak private administrative fields (e.g., phone numbers, reviewer notes, internal flags).
4. **Pagination Integrity**: Guarantees total row counts match without orphaned lines.

### Secure QR Verification
- QR codes point to a public institutional verification URL: `/verify/{document_id}`.
- QR payloads contain zero student PII (Personally Identifiable Information).
- The public verification view reveals only institutional authenticity: document title, issuing authority, issue date, total record count, and official status.

---

## Smart Batch Certificate Scanner Subsystem (Prompt 17)

### High-Volume Batch Architecture & Ingestion Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Smart Batch Scanner Pipeline Architecture                │
│                                                                             │
│  [ Continuous Camera / Streamed PDF ] ──► [ Boundary & Multi-Doc Detector ] │
│                       │                                    │                │
│                       ▼                                    ▼                │
│  [ Encrypted Local Disk Buffer (O(1)) ]     [ Document Segmentation & Crop ]│
│                       │                                    │                │
│                       ▼                                    ▼                │
│            [ Resumable Chunk Uploader ] ──► [ Multi-Signal Quality Engine ] │
│                                                            │                │
│                                                            ▼                │
│            [ Bounded Concurrency Queue ] ◄── [ 3-Tier Duplicate Detection ] │
│                       │                     (SHA-256, pHash, Field Match)   │
│                       ▼                                                     │
│            [ Progressive OCR Engine ]                                       │
│          (Field-level Confidence, RTL)                                      │
│                       │                                                     │
│                       ▼                                                     │
│      [ Reconciliation & Anomaly Engine ] ──► [ Wrong Batch / Conflict Alert]│
│                       │                                                     │
│                       ▼                                                     │
│        [ Human Review & Exception Buckets ] ◄── [ Missing Student Candidate]│
│                       │                                                     │
│                       ▼                                                     │
│        [ Official Audit Trail & Reconciliation Report (PDF, XLSX, CSV) ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Guarantees
1. **Strict Human-in-the-Loop Principle**: The system suggests and flags, but never automatically merges, overwrites, or authoritatively authorizes official student certificates.
2. **Crash & Network Resilience**: Complete state machines (`BatchScanSession` and `BatchScanItem`) maintain persistence across network dropouts, app restarts, or background worker terminations.
3. **Bounded Memory & Streaming**: Imports of 500+ items operate in $O(1)$ memory chunks, relying on disk-backed queues and progressive thumbnails.
4. **Multi-Signal Image Quality**: Combines Laplacian variance, exposure histogram, and contrast analysis to recommend real-time retakes before expensive OCR processing.
5. **Reconciliation & Candidate Isolation**: Unmatched certificates create a `MissingStudentCandidate` rather than polluting clean student records or silently dropping the certificate.

---

## Secure Certificate Verification & Public Portal Subsystem (Prompt 18)

The Verification Subsystem provides a cryptographically isolated public verification layer designed to prove document authenticity without exposing internal student records or sensitive PII.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Secure Certificate Verification Architecture                │
│                                                                             │
│  [ Official Approved Certificate ] ──► [ Institutional Policy Engine ]      │
│                  │                                    │                     │
│                  ▼                                    ▼                     │
│  [ High-Entropy Opaque Code Gen ]      [ Server-Side Public Projection ]    │
│  (Crockford Base32, e.g. 7KX9-QM4P)    (Zero PII: Strips ID, Phone, Notes) │
│                  │                                    │                     │
│                  ▼                                    ▼                     │
│  [ Printable QR Code Engine ] ───────► [ VerificationPublicView Model ]     │
│  (HTTPS URL only, Error Correct M/Q)                  │                     │
│                  │                                    ▼                     │
│                  │                     [ Rate-Limited Public API ]          │
│                  │                     (Anti-Enumeration, Uniform Error)    │
│                  │                                    │                     │
│                  ▼                                    ▼                     │
│     [ Printed Certificate ]                 [ Public Web Portal ]           │
│     (QR + Human-Readable Code)              (/v/{code}, Arabic/English)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Security & Privacy Axioms
1. **Server-Side Public Projections**: Public web pages render exclusively from `VerificationPublicView` projections. Raw student records, OCR output, and database primary keys never traverse to public clients.
2. **Anti-Enumeration Tokens**: Codes are generated using 60-bit entropy Crockford Base32 formats (`XXXX-XXXX-XXXX`), unguessable and completely decoupled from student IDs or serial numbers.
3. **QR Embeds URL Only**: QR codes encode only the verified HTTPS URL (e.g. `https://verify.example.edu/v/7KX9-QM4P-82DZ`), preventing data leakage when QR codes are photographed or read by generic scanner apps.
4. **State Transitions & Revocation Audit**: Full lifecycle management (`ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`, `REPLACED`) with mandatory administrative reason recording and version lineage tracking.
5. **No App Required**: Public verification works seamlessly in any mobile or desktop web browser, with integrated camera WebRTC scanning and manual code entry.

---

## AI/OCR Governance & Intelligence Subsystem (Prompt 19)

The AI Governance Subsystem functions as an authoritative **AI Control Plane**, ensuring all machine learning, OCR, handwriting recognition, and identity-matching functions remain fully auditable, immutable, calibrated, and strictly subordinate to human reviewers and institutional policy.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 AI Control Plane & Governance Architecture                  │
│                                                                             │
│  [ Document Image ] ──► [ AIRouter & Governance Policy Engine ]             │
│                               │                                             │
│                ┌──────────────┼──────────────┐                              │
│                ▼              ▼              ▼                              │
│       [ Local OCR ]   [ Handwriting ] [ Identity Matcher ]                  │
│                │              │              │                              │
│                └──────────────┼──────────────┘                              │
│                               ▼                                             │
│                 [ Deterministic Rule Engine ]                               │
│                               │                                             │
│                               ▼                                             │
│                 [ Human-in-the-Loop Review ]                                │
│                               │                                             │
│        ┌──────────────────────┴──────────────────────┐                      │
│        ▼                                             ▼                      │
│  [ Official Record (Approved) ]             [ Human Feedback (Quarantine) ] │
│                                                      │                      │
│                                                      ▼                      │
│                                             [ Benchmark Lab (Champion vs    │
│                                                Challenger Offline Test) ]   │
│                                                      │                      │
│                                                      ▼                      │
│                                             [ Approval Gate $\rightarrow$ Canary]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Tenets & Safeguards
1. **AI is Not the Truth**: Outputs are suggestions and evidence signals; official truth is established strictly by authorized human sign-off.
2. **Strict Version Immutability**: Models are immutable post-release; all changes require a new semantic version with full pipeline fingerprinting (`model_version`, `preprocessing_version`, `pipeline_version`).
3. **Hard Privacy Rule (`STRICT_LOCAL`)**: Privacy rules supersede model accuracy preferences. External cloud AI is completely prohibited when institutional policy specifies local processing.
4. **Feedback Quarantine**: Human review corrections are quarantined and never trigger automatic, unmonitored production fine-tuning.
5. **Drift & Emergency Response**: Continuous statistical drift detection triggers automated alerts with one-click emergency model disablement, version rollback, and safe side-by-side reprocessing campaigns.

---

## 31. Sahm Secure Share, Work Handoff, Encrypted Data Transfer & Continue-Where-I-Left-Off Subsystem (Prompt 22)

### 31.1 Architecture & Core Axioms
Sahm Share & Handoff enables seamless, encrypted transfer of complete working states between operators, devices, and workspaces:
> **"Share the work state, not merely the files."**
> **"Any work that has already been performed once should not have to be performed again merely because responsibility moved from one person, device, or workspace to another."**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SAHM WORK HANDOFF ENGINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Source Images (High-Res) ] ───► [ Processed Variants (Deskewed) ]       │
│  [ OCR Results (Cached) ]     ───► [ Field Confidences & Normalizations ]   │
│  [ Review Queue Items ]       ───► [ Matching Links & Duplicate Flags ]     │
│  [ Work Queue State ]         ───► [ Provenance & Chain of Custody ]        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼  (Packaging & Envelope Encryption)
┌─────────────────────────────────────────────────────────────────────────────┐
│  .sahmpkg Container (AES-256-GCM Payload + Wrapped DEK + Merkle Manifest)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ Direct Local Transfer ]     [ Secure Cloud Staging ]    [ Offline Package File ]
 (Wi-Fi Direct / Pairing Code)  (Opaque Expiring Link)       (.sahmpkg USB/Archive)
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECIPIENT INSPECTION & CONTINUE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Integrity Verification (SHA-256 & Manifest Checksum)                     │
│ 2. Privacy Scope & DLP Review (No Unexpected PII)                           │
│ 3. Diff & Conflict Reconciliation (Field-Level Safe Merge)                  │
│ 4. Single-Click [Accept & Continue Work from Item #321]                     │
│ 5. Audit Logging & Chain of Custody Preservation                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 31.2 Core Capabilities
1. **Continue-Where-I-Left-Off**: Completed items (e.g. 320/500) are preserved without re-running OCR or re-matching. The recipient starts directly at the first pending task (`next_task_index = 321`).
2. **Envelope Encryption & Crypto-Shredding**: Data Encryption Keys (DEKs) encrypt the payload. Revoking access destroys the wrapped key, rendering offline copies permanently unreadable.
3. **Resumable Chunked Transfer**: High-volume packages (1GB - 5GB) are sliced into 8MB chunks with SHA-256 validation; network interruptions resume without restarting.
4. **Direct Device Handshake**: Mutual authentication phrase (e.g. `BLUE-ORBIT-27`) and QR pairing for instant office transfers without internet bandwidth consumption.
5. **Conflict Reconciliation & Chain of Custody**: Automatic field-level safe merge where fields are orthogonal; manual review isolation for conflicting official values. Full chain of custody preserves original capture timestamps and operator identities.




