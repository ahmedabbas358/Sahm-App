# سجل نماذج الذكاء الاصطناعي والإصدارات الثابتة (Prompt 19)
## AI Model Registry, Lifecycle, Versioning & Provenance

يحدد هذا المستند دورة حياة النماذج الذكية وقواعد ثبات الإصدارات وبصمات المعالجة داخل منصة Sahm.

---

## 1. حالات دورة حياة النموذج (Model Lifecycle States)

```text
  [ DRAFT ] 
      │ (تسجيل النموذج المرشح وحفظ القيود)
      ▼
 [ EVALUATING ] ──► (اختبار في مختبر المقارنة Benchmark Lab)
      │
      ▼ (اجتياز بوابة الانحدار)
 [ APPROVED ] ──► (اعتماد المشرف المعتمد - فصل الصلاحيات)
      │
      ▼
  [ ACTIVE ] ──► (تفعيل في محرك التوجيه كـ Champion أو Canary)
      │
      ├────────────────────────┬────────────────────────┐
      ▼                        ▼                        ▼
 [ LIMITED ]              [ DISABLED ]            [ DEPRECATED ]
 (استخدام مقيد)         (تعطيل طارئ وفوري)      (إحلال بإصدار أحدث)
                               │                        │
                               └───────────┬────────────┘
                                           ▼
                                      [ RETIRED ]
                                   (أرشفة تاريخية دائمة)
```

---

## 2. ثبات الإصدارات بعد النشر (Immutable Model Versions)

* **القاعدة الحتمية**: بمجرد اعتماد وإطلاق أي إصدار نموذج (مثل `handwriting-ar-v2`)، يُقفل النموذج ويصبح **غير قابل للتعديل (Immutable)** إطلاقاً.
* أي تغيير في:
  * أوزان النموذج (Weights / Checkpoints)
  * معالجة الصور المسبقة (Preprocessing / Resizing / Binarization)
  * الرموز والتقطيع (Tokenization)
  * قوالب الاستخراج والتعليمات (Prompts / System Instructions)
  * منطق الاستخراج وتطبيع النصوص (Extraction / Normalization Logic)
  يستلزم **إنشاء إصدار جديد تماماً** (مثل `handwriting-ar-v3`).

---

## 3. بصمة معالجة القرار (Processing Version Fingerprint)

تسجل كل عملية استخراج أو فحص البصمة الكاملة المشفرة:

```json
{
  "provider": "self_hosted_gpu",
  "model": "sahm-arabic-handwriting",
  "model_version": "v2.1.0",
  "pipeline_version": "3.4.0",
  "preprocessing_version": "1.2.0",
  "prompt_version": "none",
  "normalization_version": "2.0.1",
  "matcher_version": "1.5.0",
  "input_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb924...",
  "output_hash": "sha256:8f434346648f6b96df89dda901c5176b..."
}
```

هذا يضمن إمكانية الإجابة بدقة لا تقبل الشك عن: *"لماذا استخرج النظام هذا الاسم من هذه الشهادة قبل سنتين؟"*.

---

## 4. بطاقة النموذج (Model Card Structure)

لكل نموذج مسجل بطاقة تعريفية موثقة تشتمل على:
1. **اسم ومعرف النموذج**: `model_identifier` (مثل: `sahm-ocr-printed-ar-v3`).
2. **القدرات المعتمدة**: `ModelCapability` (نص مطبوع، خط يد، استخراج حقول، كشف تكرارات).
3. **اللغات المدعومة**: (العربية، الإنجليزية، مختلط).
4. **تصنيف الخصوصية وموقع المعالجة**: `STRICT_LOCAL`, `APPROVED_PROVIDERS_ONLY`.
5. **فئات التكلفة والكمون**: `FREE_LOCAL`, `LOW_LATENCY` (P95 < 800ms).
6. **القيود المعروفة (Known Limitations)**: مثل "أداء ضعيف في خط الرقعة المتداخل أو درجات الإضاءة الخافتة دون 40 Lux".
7. **صلاحية الاستخدام المعتمدة**: متى يجوز ومتى يُحظر استخدامه.
