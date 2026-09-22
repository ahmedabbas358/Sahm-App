# مواصفات بروتوكول حزم سهم المشفرة وتشفير المغلف
## Sahm Package Format (.sahmpkg), Manifest & Cryptographic Protocol

---

## 1. بنية ملف الحزمة `.sahmpkg`

ملف `.sahmpkg` هو حاوية أرشيف مشفرة ذات إصدارات ثابتة (Versioned Container). يتكون داخلياً من:

```text
Sahm_Handoff_IS_2026_001.sahmpkg
│
├── manifest.json              # بيانات الحزمة الوصفية غير المشفرة (موقعة تشفيرياً)
├── key_envelope.json          # المفتاح المشفر (Wrapped DEK) مع بصمات الشهادات
│
└── encrypted_payload.bin      # الحاوية المشفرة بـ AES-256-GCM وتحوي:
    ├── data/
    │   ├── batch_metadata.json
    │   ├── student_records.json
    │   └── reconciliation_state.json
    ├── ocr/
    │   ├── ocr_results.json
    │   └── field_confidences.json
    ├── review/
    │   ├── review_queue.json
    │   └── item_comments.json
    ├── images/
    │   ├── source/            # الصور الأصلية (SHA-256 Verified)
    │   └── processed/         # الصور المحسنة المعالجة
    ├── evidence/
    │   └── match_evidence.json
    └── checksums/
        └── sha256_inventory.json
```

---

## 2. بنية الـ `manifest.json`

```json
{
  "$schema": "https://sahm.university.edu/schemas/v1/handoff-manifest.json",
  "manifest_version": "1.2.0",
  "package_id": "pkg_9f8d2c14_2026",
  "handoff_id": "hnd_2026_00142",
  "handoff_type": "CONTINUE_WORK_HANDOFF",
  "created_at": "2026-09-22T10:45:00Z",
  "expires_at": "2026-09-29T10:45:00Z",
  "data_classification": "RESTRICTED",
  "institution": {
    "id": "inst_univ_main",
    "name": "جامعة سهم للعلوم والتكنولوجيا",
    "tenant_id": "tenant_default"
  },
  "source_provenance": {
    "creator_user_id": "usr_ahmed_701",
    "creator_name": "أحمد عباس (موظف المسح)",
    "device_id": "dev_ios_office_pad_01",
    "scan_session_id": "scan_sess_2026_sep_04",
    "pipeline_fingerprint": "ocr_v2.1.0_ar_vit_sha256:4c8b..."
  },
  "work_summary": {
    "total_items": 500,
    "processed_count": 320,
    "needs_review_count": 41,
    "failed_count": 7,
    "pending_count": 132,
    "next_resume_item_index": 321,
    "total_payload_bytes": 1932735283
  },
  "included_capabilities": [
    "SOURCE_IMAGES",
    "PROCESSED_IMAGES",
    "OCR_RESULTS",
    "FIELD_CONFIDENCES",
    "MATCH_SUGGESTIONS",
    "REVIEW_STATE",
    "ERROR_LOGS"
  ],
  "excluded_capabilities": [
    "NATIONAL_ID_RAW",
    "FINANCIAL_FEES_DATA"
  ],
  "integrity": {
    "algorithm": "SHA-256",
    "payload_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "merkle_root": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "files_count": 1042
  }
}
```

---

## 3. نموذج التشفير المغلف (Envelope Encryption Model)

لا يتم تشفير الحزم الكبيرة مباشرة بمفاتيح المستخدمين الثابتة، بل عبر معمارية **المفتاح المزدوج**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. توليد مفتاح تشفير البيانات العشوائي (DEK): AES-256 (32 Bytes)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. تشفير كامل محتوى الحزمة بـ AES-256-GCM مع Nonce عشوائي (12 Bytes)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. تغليف الـ DEK بمفتاح المؤسسة العام (KEK): RSA-OAEP / ECDH           │
│    Wrapped_DEK = Encrypt_KEK(DEK)                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. حفظ الـ Wrapped_DEK داخل key_envelope.json بجانب الحزمة              │
└────────────────────────────────────────────────────────────────────────┘
```

### مزايا هذا النموذج:
1. **أداء فائق**: تشفير الحزم الضخمة (1GB - 5GB) بسرعة عتادية فائقة عبر AES-GCM.
2. **فصل الصلاحيات**: السيرفر أو المستلم لا يحتاج إلا لفك تغليف المفتاح (Unwrap DEK).
3. **الإتلاف الفوري عند الإلغاء (Crypto-Shredding as Revocation)**: عند قيام المشرف بالضغط على `Revoke Share`، يقوم النظام بمسح الـ Wrapped Key من قاعدة البيانات فورياً؛ مما يجعل الحزمة غير قابلة للفك نهائياً حتى لو احتفظ أحدهم بنسخة من الملف المشفر.

---

## 4. بروتوكول النقل المجزأ القابل للاستئناف (Resumable Chunking Protocol)

لتجنب فشل نقل الحزم الكبيرة (2GB) عند انقطاع شبكة الـ Wi-Fi أو الجوال:
- تُقسم الحزمة إلى قطع قياسية بحجم **8 ميجابايت (8MB Chunk Size)**.
- يُحسب لكل قطعة تجزئة مستقلة `chunk_sha256`.
- يحتفظ العميل والخادم بسجل القطع المكتملة `chunk_bitmap`.
- إذا انقطع النقل عند القطعة رقم 152 (من أصل 240 قطعة - 63.3%):
  $$\text{Resume Offset} = \text{Chunk \#153} \quad (\text{لا إعادة من 0\%})$$
- فور اكتمال كافة القطع، يتم تجميع الملف وإجراء تدقيق التجزئة الشاملة ومقارنتها مع `manifest.integrity.payload_hash`.
