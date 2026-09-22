# Sahm (سهم) — Secure Certificate Verification & Public Portal Specification (Prompt 18)

## 0. Executive Summary
This document specifies the architecture, cryptographic guarantees, privacy projection model, rate limiting, and public portal design for the **Secure Certificate Verification Subsystem** in Sahm.

The fundamental security principle:
> **"Public verification must prove the authenticity of the certificate with the absolute minimum disclosure of student personal data."**

Public verification is strictly separated from internal student records:
```text
Internal Student Record (PII, OCR Raw, Audit, Phone, National ID)
         ↓
Approved Certificate (Institutional sign-off)
         ↓
Verification Identity (Opaque, High-Entropy Code e.g. 7KX9-QM4P-82DZ)
         ↓
Server-Side Public Projection (Policy-Governed View)
         ↓
Public Verification Page / QR Code (HTTPS URL only)
```

---

## 1. Threat Model & Anti-Enumeration

### 1.1 Non-Predictable Public Identifiers
Public verification codes MUST NOT be:
- Sequential integers (`/cert/1001`, `/cert/1002`)
- Derived directly or predictably from Student ID or National ID
- Derived from standard certificate numbers (which may follow sequential university numbering)

### 1.2 High-Entropy Token Specification
- **Alphabet**: Crockford Base32 (`0123456789ABCDEFGHJKMNPQRSTVWXYZ`), omitting ambiguous characters:
  - `I`, `L` (confused with `1`)
  - `O` (confused with `0`)
  - `U` (excluded to prevent accidental offensive word generation)
- **Entropy**: Minimum 60 bits of cryptographic randomness.
- **Canonical Format**: `XXXX-XXXX-XXXX` (12 characters formatted in 3 chunks of 4), optionally prefixed with `VERIFY-`.
- **Normalization**: Lookups ignore hyphens, spaces, and case differences (`7kx9qm4p82dz` == `7KX9-QM4P-82DZ`).

### 1.3 Zero Information Leakage
- Lookups for invalid tokens return a uniform, generic message: `"No active verification record was found for this code."`
- Never indicate whether a similar token exists or disclose database error strings.
- Constant-time string matching (`hmac.compare_digest`) for sensitive verification checks.
- Constant-time lookup error behavior to prevent token existence enumeration via timing attacks.

---

## 2. Verification States & Public Status Mapping

### 2.1 Internal Verification States (`VerificationState`)
1. `NOT_ISSUED`: Certificate approved but verification identity not yet published.
2. `ACTIVE`: Official verification record currently active and verifiable.
3. `SUSPENDED`: Temporarily suspended pending administrative review.
4. `REVOKED`: Permanently revoked (e.g. replaced by corrected certificate or cancelled).
5. `EXPIRED`: Time-limited certificate has exceeded its validity date.
6. `REPLACED`: Superseded by a reissued certificate version.
7. `CANCELLED`: Cancelled due to administrative order or duplicate issuance.

### 2.2 Public Status Results (`PublicVerificationResult`)
The public portal renders strictly defined, neutral institutional statuses without accusatory labels:
- **`VERIFIED`**: "This certificate was issued by the institution and its verification record is currently active."
- **`VERIFIED_WITH_LIMITED_PUBLIC_DATA`**: Active verification where institutional policy permits only minimal metadata.
- **`REVOKED`**: "This verification record is no longer active. Contact the certificate authority for details."
- **`EXPIRED`**: "This certificate's official validity period has expired."
- **`NOT_FOUND`**: "No active verification record was found for this code. Please check your verification code."
- **`TEMPORARILY_UNAVAILABLE`**: Displayed during service maintenance to prevent false negative conclusions.

---

## 3. Privacy Policy & Server-Side Projections

### 3.1 Privacy Profiles
1. `PUBLIC_MINIMAL`:
   - Verification status
   - Issuing institution & college
   - Certificate type (e.g., Bachelor)
   - Issue year
   - Verification code
2. `PUBLIC_STANDARD` (Default):
   - All fields from `PUBLIC_MINIMAL`
   - Student name (formatted per `display_name_mode`)
   - Academic program / specialization
   - Graduation year
3. `PUBLIC_EXTENDED`:
   - Fields explicitly authorized by institutional policy (e.g. GPA / honors grade if university mandates publication).
4. `INTERNAL_ONLY`:
   - No public exposure. Verification code returns `NOT_FOUND` on public portal.

### 3.2 Forbidden Fields (Never Expose Publicly)
- Full national ID / passport number
- Full student university registration number (unless explicitly masked, e.g. `2022****45`)
- Date of birth, home address, phone number, email
- Internal staff notes, reviewer names, audit timestamps
- Raw OCR text, source image files, storage URLs

### 3.3 Student Name Privacy Modes
- `FULL`: Full name as registered on certificate.
- `ABBREVIATED_MIDDLE`: First name + middle initials + family name (e.g. "أحمد م. ع. الشامي").
- `FIRST_LAST_ONLY`: First and last name only (e.g. "أحمد الشامي").

---

## 4. QR Code & Physical Print Reliability

### 4.1 Payload Rules
- QR code MUST contain ONLY the secure HTTPS verification URL:
  `https://verify.example.edu/v/{verification_code}`
- QR code MUST NOT contain student names, IDs, or raw certificate metadata.

### 4.2 Error Correction & Quiet Zone
- **Error Correction**: Level M (15% recovery) or Level Q (25% recovery) to survive paper scratches, lamination, and folding.
- **Quiet Zone**: Minimum 4 modules (unprinted border) on all 4 sides.
- **Human-Readable Code**: Verification code (e.g. `7KX9-QM4P-82DZ`) is always printed directly below or adjacent to the QR code.

---

## 5. Rate Limiting & Abuse Prevention

### 5.1 Throttling Policy
- Public IP bucket: Max 30 requests/minute.
- Burst limit: Max 10 requests in 5 seconds.
- Token brute-force penalty: Progressive delay after 5 consecutive 404s from a single IP.

### 5.2 Search Engine & Deep-Link Privacy
- Public verification pages return HTTP Header: `X-Robots-Tag: noindex, nofollow`.
- Open Graph metadata provides only generic institutional branding without graduate names or PII.
