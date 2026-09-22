# منظومة المسح الجماعي الذكي للشهادات | Smart Batch Certificate Scanner (Prompt 17)

> **المبدأ الهندسي الأساسي الصارم:**  
> **Batch automation may accelerate processing, but it must never silently authorize, merge, overwrite, publish, or destroy official student records.**  
> *(الأتمتة تسرّع المعالجة، لكنها لا تعتمد أو تدمج أو تستبدل أو تنشر أو تحذف أي سجل رسمي بصورة آلية صامتة).*

---

## 1. خط سير المعالجة متعدد المراحل (Processing Pipeline)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Smart Batch Processing Pipeline                          │
│                                                                             │
│  [1. Batch Setup] ──► [2. Continuous Capture / Streamed Import]             │
│                                 │                                           │
│                                 ▼                                           │
│                     [3. Document Detection]                                 │
│                                 │                                           │
│           ┌─────────────────────┴─────────────────────┐                     │
│           ▼                                           ▼                     │
│   Single Document Region                  Multi-Document Ambiguous          │
│           │                                   (Flag & Send to Review)       │
│           ▼                                                                 │
│   [4. Segmentation, Deskew & Perspective Correction]                        │
│           │                                                                 │
│           ▼                                                                 │
│   [5. Multi-Signal Quality Engine] ──► Low Quality Alert (Retake Suggestion)│
│           │                                                                 │
│           ▼                                                                 │
│   [6. Multi-Tier Duplicate Engine] ──► Exact SHA-256 / Perceptual / Data    │
│           │                                                                 │
│           ▼                                                                 │
│   [7. Progressive OCR & Field-Level Confidence Extraction]                  │
│           │                                                                 │
│           ▼                                                                 │
│   [8. Identity Reconciliation Matcher] (Wrong Batch & Structural Anomalies) │
│           │                                                                 │
│           ▼                                                                 │
│   [9. Review Buckets & Queue] ──► [Human Confirmation & Candidate Actions]  │
│           │                                                                 │
│           ▼                                                                 │
│   [10. Batch Reconciliation Report & Export (PDF, XLSX, CSV, JSON)]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. آلة حالات الجلسة (Batch Scan Session State Machine)

```
DRAFT ──► READY ──► CAPTURING ──► QUEUED ──► PROCESSING ──► COMPLETED
                      ▲             │            │                │
                      │             ▼            ▼                │
                      └────────── PAUSED ◄───────┘                ▼
                                    │               COMPLETED_WITH_WARNINGS
                                    ▼                             │
                              NEEDS_ATTENTION ◄───────────────────┘
                                    │
                                    ▼
                                  FAILED / CANCELLED ──► ARCHIVED
```

---

## 3. آلة حالات العنصر الفردي (Item State Machine)

```
CAPTURED ──► QUEUED ──► PREPROCESSING ──► READY_FOR_OCR ──► OCR_PROCESSING
                                                                   │
    COMPLETED ◄── VALIDATING ◄── MATCHING ◄── EXTRACTION_COMPLETE ◄┘
        ▲              │             │
        │              ▼             ▼
        └──────── NEEDS_REVIEW ◄─────┘
                       │
                       ▼
                    FAILED ──► RETRYING ──► SKIPPED / CANCELLED
```

---

## 4. محرك الجودة متعدد الإشارات (Image Quality Engine)

| الإشارة (Signal) | طريقة الحساب (Calculation) | عتبة القبول (Threshold) | الإجراء التلقائي (Remediation) |
|---|---|---|---|
| **Blur / Sharpness** | Laplacian Variance | > 100.0 | Retake Recommended: Too blurry |
| **Brightness** | Mean Luminance Histogram | 60 - 200 (0-255) | Too dark / Overexposed warning |
| **Contrast** | Standard Deviation of Gray Levels | > 35.0 | Low contrast warning |
| **Glare & Reflection** | Percent of High Luminance Clusters (>250) | < 3.5% of area | Strong glare warning |
| **Perspective Skew** | Corner Quadrilateral Aspect Ratio | Error < 15% | Auto-deskew / Perspective fix |

---

## 5. كشف التكرارات على 3 مستويات (3-Tier Duplicate Detection)

1. **Exact File Duplicate**:
   - فحص تجزئة SHA-256 لمحتوى الملف الرقمي بالكامل.
2. **Perceptual Image Similarity**:
   - حساب البصمة الإدراكية (Difference Hash - dHash) ومسافة Hamming (Hamming Distance ≤ 6 تعني تشابه بصري تام حتى مع تغيير الحجم أو الضغط).
3. **Certificate Data Duplicate**:
   - مطابقة رقم الشهادة ورقم الطالب وسنة التخرج لمنع تسجيل نفس الوثيقة لأكثر من شخص أو إدخالها مرتين.
- **القاعدة الذهبية:** لا يوجد حذف تلقائي (No Auto-Delete). تُحفظ النسختان وتُرسلان للمراجعة البشرية.

---

## 6. مساحة المراجعة وتصنيف الحالات (Review Buckets)

يتم تنظيم نتائج الدفعة داخل مساحة عمل المراجعة في مجموعات منفصلة:
- **Completed**: معالجة سليمة ومطابقة عالية الثقة.
- **Needs Review**: استخراج غير مؤكد أو جودة منخفضة.
- **Possible Duplicates**: اشتباه تكرار في الصورة أو البيانات مع خيارات (Keep Both / Mark Duplicate / Replace).
- **Identity Conflicts**: تعارض في بيانات الطالب أو رقم الشهادة.
- **Wrong Batch**: اختلاف سنة التخرج في الشهادة عن سنة الدفعة.
- **No Match**: لم يُعثر على الطالب في قاعدة البيانات، ويتم إنشاء `MissingStudentCandidate` لربطه أو إضافته رسمياً بقرار بشري.

---

## 7. المرونة والاستئناف (Resilience, Bounded Memory & Crash Recovery)

- استهلاك ذاكرة ثابت $O(1)$ عبر التدفق وتجزئة الملفات (Streaming & Chunks) لمنع انهيار الهواتف عند مسح 500 شهادة.
- حفظ الحالة محلياً في كل خطوة؛ في حال إغلاق التطبيق فجأة أو انقطاع الإنترنت، يستأنف النظام من آخر شهادة ملتقطة بنجاح.
- مفتاح فريد لكل عملية (Idempotency Key) لمنع تكرار إنشاء الشهادات أو السجلات عند إعادة الإرسال.
