# سجل التغييرات | Changelog

جميع التغييرات الملحوظة في مشروع **سهم (Sahm)** موثقة في هذا الملف.
الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/ar/1.0.0/)،
وهذا المشروع يلتزم بـ [الترقيم الدلالي للنسخ (Semantic Versioning)](https://semver.org/lang/ar/).

---

## [0.1.0] - 2026-09-22

### البنية التحتية والأنظمة الأساسية (Core Systems & Infrastructure)
- **مستودع موحد (Monorepo)**: هيكلية متكاملة تجمع تطبيق الموبايل (Flutter)، لوحة الإدارة (Next.js)، والخلفية (FastAPI).
- **قاعدة البيانات ومصدر الحقيقة**: اعتماد PostgreSQL كمصدر الحقيقة النهائي (Single System of Record) وفق [ADR-001](docs/adr/001-postgresql-system-of-record.md).
- **التشغيل بدون اتصال (Offline-First Sync)**: محرك مزامنة هجين مع Drift/SQLite وقوائم انتظار مشفرة ومقسمة (8MB Chunks) وفق [ADR-002](docs/adr/002-offline-first-sync-architecture.md).
- **طبقة حوكمة ونماذج الذكاء الاصطناعي (AI/OCR Governance)**: عزل مزودي الذكاء الاصطناعي، التقييم المعياري، واكتشاف الانحراف وفق [ADR-003](docs/adr/003-ai-ocr-provider-abstraction.md).
- **بوابة التحقق الآمنة من الشهادات (Secure Public Verification)**: معرفات معتمة (Crockford Base32) مع حجب كامل للبيانات الشخصية والدرجات (Zero PII Leakage) وتحديد معدل الاستعلام وفق [ADR-004](docs/adr/004-public-verification-isolation.md).
- **نظام التسليم واستئناف العمل المشفر (Sahm Share & Handoff)**: حزم عمل `.sahmpkg` مشفرة بـ AES-256-GCM تتيح للموظف استئناف العمل فوراً دون إعادة المسح أو الـ OCR (Zero Re-OCR Resumption) وفق [ADR-005](docs/adr/005-snapshot-handoff-resumption.md).
- **محرك التأثير التعاقبي (Cascade Impact Engine)**: رصد التغييرات في السجلات وتحديد المخرجات السابقة المرتبطة كوسوم قديمة مستبدلة (`is_superseded`) تلقائياً وفق [ADR-006](docs/adr/006-cascading-impact-engine.md).

### لوحة الإدارة (Admin Workspace)
- **واجهة تفاعلية ثلاثية الألواح (Evidence-First Review Workspace)**: فحص السند الأصلي، مربعات الاستخراج المباشرة، وقرارات التدقيق بنقرة واحدة.
- **لوحة الأوامر السريعة (Command Palette `⌘K`)**: تنقل فوري وسريع بين الكليات، الدفعات، والشهادات.
- **البحث الموحد متعدد المعايير (Unified Search)**: يدعم تطبيع الحروف العربية وتجاوز أخطاء الإملاء والتطابق الجزئي للأرقام الجامعية.
- **تنبيهات التأثير التعاقبي (Impact Alerts)**: تنبيه فوري للموظف عند اكتشاف أن تصديراً سابقاً أصبح غير متطابق مع التعديل الأخير للسجل.

### تطبيق الموبايل (Mobile App)
- **الالتقاط الذكي متعدد الصفحات (Smart Batch Scanner)**: دعم مسح الدفعات الكبيرة واكتشاف الجودة وتحديد الأطراف تلقائياً.
- **تشفير التخزين المؤقت**: حماية البيانات والصور الممسوخة محلياً على أجهزة الموظفين.

### الاختبارات والموثوقية (Testing & Quality)
- **جناح الاختبار الذهبي الشامل (Golden E2E Test Suite)**: تغطية 7 بوابات تدقيق كاملة من المسح حتى التصدير والتحقق العام بنسبة نجاح 100%.
- **خطوط الأنابيب المؤتمتة (CI/CD Workflows)**: إعداد الفحص والتحقق لـ Backend, Admin, و Mobile مع خطة إصدارات مؤتمتة (GitHub Releases).
