"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Share2,
  CheckCircle2,
  Layers,
  UserCheck,
  ShieldCheck,
  Lock,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  Info,
  Check,
  AlertTriangle,
  Copy,
} from "lucide-react";

export default function NewHandoffWizardPage() {
  const [step, setStep] = useState<number>(1);
  const [selectedBatch, setSelectedBatch] = useState<string>("batch-is-2026");
  const [recipient, setRecipient] = useState<string>("sara_hassan");
  const [assignedRole, setAssignedRole] = useState<string>("REVIEWER");
  const [transferMethod, setTransferMethod] = useState<string>("DIRECT_LOCAL");
  const [includeImages, setIncludeImages] = useState<boolean>(true);
  const [includeOcr, setIncludeOcr] = useState<boolean>(true);
  const [includeMatching, setIncludeMatching] = useState<boolean>(true);
  const [maskNationalId, setMaskNationalId] = useState<boolean>(true);
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [handoffCreated, setHandoffCreated] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const batches = [
    {
      id: "batch-is-2026",
      name: "دفعة شهادات نظم المعلومات — دور سبتمبر 2026",
      college: "كلية الحاسبات والمعلومات",
      total: 500,
      processed: 320,
      needsReview: 41,
      failed: 7,
      pending: 132,
      nextResumeIndex: 321,
    },
    {
      id: "batch-law-2024",
      name: "كشوفات كلية الحقوق القديمة — خط يد",
      college: "كلية الحقوق",
      total: 420,
      processed: 210,
      needsReview: 65,
      failed: 12,
      pending: 133,
      nextResumeIndex: 211,
    },
  ];

  const currentBatch = batches.find((b) => b.id === selectedBatch) || batches[0];

  const handleCreateHandoff = () => {
    setIsPackaging(true);
    setTimeout(() => {
      setIsPackaging(false);
      setHandoffCreated(true);
      setStep(5);
    }, 1200);
  };

  const handleCopy = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/handoff"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              معالج تسليم العمل ونقل الحالة (Work Handoff Wizard)
            </h1>
            <p className="text-xs text-slate-400">
              خطوات سريعة ومحمية لنقل دفعة الشهادات للمستلم دون إعادة المسح أو الـ OCR
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold transition ${
                step === s
                  ? "bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/50"
                  : step > s
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-500 border border-slate-700"
              }`}
            >
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* STEP 1: Select Work */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>الخطوة 1: اختيار العمل ودفعة الشهادات المراد تسليمها</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  اختر الدفعة النشطة لنقل حالة المعالجة التي أنجزتها بالكامل
                </p>
              </div>

              <div className="space-y-3">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBatch(b.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedBatch === b.id
                        ? "bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-sm">{b.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">{b.college}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-slate-900/80 p-2.5 rounded-xl text-center text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">الإجمالي:</span>
                        <span className="text-white font-bold">{b.total}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 text-[10px] block">مكتمل OCR:</span>
                        <span className="text-emerald-400 font-bold">{b.processed}</span>
                      </div>
                      <div>
                        <span className="text-amber-400 text-[10px] block">يحتاج مراجعة:</span>
                        <span className="text-amber-400 font-bold">{b.needsReview}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">قيد الانتظار:</span>
                        <span className="text-cyan-300 font-bold">{b.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-900/20"
                >
                  التالي: تحديد المستلم والجهاز
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Recipient */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>الخطوة 2: تحديد الموظف المستلم والصلاحية التشغيلية</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  المستلم يتولى متابعة المراجعة والاستئناف دون منحه صلاحيات عامة غير مصرح بها
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    اختر الموظف المستلم (المسجلين بالجامعة):
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="sara_hassan">سارة حسن (مدققة الشهادات — جهاز لوحي مكتبي موثوق)</option>
                    <option value="mohamed_ali">محمد علي (رئيس قسم المراجعة — حاسوب المكتب)</option>
                    <option value="khaled_waleed">خالد بن الوليد (موظف التدقيق)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    الصلاحية الممنوحة للحزمة (Share Role):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setAssignedRole("REVIEWER")}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        assignedRole === "REVIEWER"
                          ? "bg-cyan-950/40 border-cyan-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">REVIEWER (موصى به)</div>
                      <div className="text-[11px] text-slate-400">
                        مراجعة الحقول وتصحيحها واستئناف المسح
                      </div>
                    </div>

                    <div
                      onClick={() => setAssignedRole("VIEWER")}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        assignedRole === "VIEWER"
                          ? "bg-cyan-950/40 border-cyan-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">VIEWER (معاينة فقط)</div>
                      <div className="text-[11px] text-slate-400">
                        قراءة ومطابقة دون تعديل أو اعتماد
                      </div>
                    </div>

                    <div
                      onClick={() => setAssignedRole("OPERATIONAL_OWNER")}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        assignedRole === "OPERATIONAL_OWNER"
                          ? "bg-cyan-950/40 border-cyan-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">OPERATIONAL_OWNER</div>
                      <div className="text-[11px] text-slate-400">
                        تولي كامل إدارة وتشغيل الدفعة
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition"
                >
                  التالي: فحص الخصوصية ونطاق الحزمة
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Privacy & DLP Preview */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>الخطوة 3: فحص الخصوصية ونطاق الحزمة (DLP Preview)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  التحكم الدقيق في البيانات المصدرة لضمان تقليل البيانات (Data Minimization)
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">تضمين صور الشهادات الأصلية والمعالجة</span>
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">تضمين نتائج الـ OCR ودرجات الثقة المحسوبة</span>
                  <input
                    type="checkbox"
                    checked={includeOcr}
                    onChange={(e) => setIncludeOcr(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">تضمين مقترحات مطابقة الطلاب وأدلة الربط</span>
                  <input
                    type="checkbox"
                    checked={includeMatching}
                    onChange={(e) => setIncludeMatching(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="font-semibold text-amber-300">
                    حجب الأرقام القومية وبيانات الرسوم المالية (إلزامي للسياسة)
                  </span>
                  <input
                    type="checkbox"
                    checked={maskNationalId}
                    disabled
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>اجتاز فحص الأمان (DLP Pass):</strong> لا توجد أي أرقام هواتف أو أرقام وطنية غير مشفرة ضمن الحزمة.
                </span>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  السابق
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition"
                >
                  التالي: قناة النقل المشفرة
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Transfer Channel */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <span>الخطوة 4: اختيار قناة النقل والتشفير</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  اختر القناة المثلى وفق بيئة تواجد الأجهزة وحجم البيانات
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  onClick={() => setTransferMethod("DIRECT_LOCAL")}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    transferMethod === "DIRECT_LOCAL"
                      ? "bg-cyan-950/40 border-cyan-500 text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <Radio className="w-6 h-6 text-purple-400 mb-2" />
                  <div className="font-bold text-sm mb-1 text-white">نقل محلي مباشر (Direct)</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    عبر الشبكة المحلية ومصافحة QR ثنائية مع عبارة التحقق (BLUE-ORBIT-27). سرعة فائقة دون إنترنت.
                  </div>
                </div>

                <div
                  onClick={() => setTransferMethod("CLOUD_STAGED")}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    transferMethod === "CLOUD_STAGED"
                      ? "bg-cyan-950/40 border-cyan-500 text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <Lock className="w-6 h-6 text-cyan-400 mb-2" />
                  <div className="font-bold text-sm mb-1 text-white">سحابي مشفر (DEK)</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    رفع مشفر مع تقسيم الحزمة لقطع 8MB واستئناف تلقائي عند انقطاع الشبكة.
                  </div>
                </div>

                <div
                  onClick={() => setTransferMethod("ENCRYPTED_PACKAGE_FILE")}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    transferMethod === "ENCRYPTED_PACKAGE_FILE"
                      ? "bg-cyan-950/40 border-cyan-500 text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <FileText className="w-6 h-6 text-amber-400 mb-2" />
                  <div className="font-bold text-sm mb-1 text-white">ملف مشفر (.sahmpkg)</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    تصدير ملف أرشيف مشفر ومحكم للنقل عبر الفلاشة أو وسائط التخزين الآمنة.
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  السابق
                </button>
                <button
                  onClick={handleCreateHandoff}
                  disabled={isPackaging}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-900/30 flex items-center gap-2"
                >
                  {isPackaging ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري تشفير الحزمة وتوليد مفاتيح الـ DEK...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>تشفير الحزمة وإطلاق التسليم</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Share Link */}
          {step === 5 && handoffCreated && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">تم إنشاء حزمة تسليم العمل وتشفيرها بنجاح!</h2>
                <p className="text-xs text-slate-400">
                  تم تجميد لقطة العمل (Snapshot) المشفرة برقم: <code className="text-cyan-400 font-mono">HND-2026-00142</code>
                </p>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs text-right max-w-md mx-auto space-y-2.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">الدفعة:</span>
                  <span className="text-white font-bold">{currentBatch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الحالات المحفوظة:</span>
                  <span className="text-emerald-400 font-bold">{currentBatch.processed} شهادة مكتملة (دون إعادة OCR)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نقطة الاستئناف الدقيقة:</span>
                  <span className="text-cyan-300 font-bold">الشهادة رقم #{currentBatch.nextResumeIndex}</span>
                </div>
                {transferMethod === "DIRECT_LOCAL" && (
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-purple-400 font-sans">عبارة التحقق المتبادلة:</span>
                    <span className="text-emerald-400 font-bold font-mono">BLUE-ORBIT-27</span>
                  </div>
                )}
              </div>

              {/* Share URL & Actions */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <input
                    type="text"
                    readOnly
                    value="http://localhost:3000/handoff/receive/sh_9f8d2c14"
                    className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none px-2"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "تم النسخ" : "نسخ الرابط"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/handoff"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
                  >
                    العودة لمركز التسليم
                  </Link>

                  <Link
                    href="/handoff/receive/sh_9f8d2c14"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-cyan-900/20"
                  >
                    معاينة صفحة المستلم والاستئناف
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
