"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Share2,
  CheckCircle2,
  Play,
  ShieldCheck,
  Lock,
  Layers,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Radio,
  Eye,
} from "lucide-react";

export default function ReceiveHandoffPage() {
  const params = useParams();
  const token = params?.token || "sh_sample";

  const [confirmPhraseInput, setConfirmPhraseInput] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Simulated Handoff Snapshot Payload
  const handoffData = {
    transferId: "HND-2026-00142",
    senderName: "أحمد عباس (موظف المسح المركزي)",
    senderDevice: "جهاز مسح لوحي معتمد (iPad Pro Term-01)",
    batchName: "دفعة شهادات نظم المعلومات — دور سبتمبر 2026",
    college: "كلية الحاسبات والمعلومات",
    totalItems: 500,
    processedItems: 320,
    needsReviewItems: 41,
    failedItems: 7,
    pendingItems: 132,
    nextResumeIndex: 321,
    payloadSize: "1.84 GB",
    transferMethod: "DIRECT_LOCAL",
    pairingPhrase: "BLUE-ORBIT-27",
    dlpStatus: "PASSED (خالٍ من الأرقام القومية المسربة)",
    sha256Hash: "4c8b321a9f0e84b7211dc903e18a9942...",
  };

  const handleAcceptAndResume = () => {
    setIsAccepting(true);
    setTimeout(() => {
      setIsAccepting(false);
      setIsAccepted(true);
    }, 1000);
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
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                معاينة واستلام حزمة العمل (Receive & Resume Handoff)
              </h1>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
                {handoffData.transferId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              فحص سلامة الحزمة والتحقق من سلسلة الحيازة قبل دمجها واستئناف المعالجة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>حزمة مشفرة وموثوقة</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Accepted Success Banner */}
        {isAccepted && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-600/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  تم استلام الحزمة وربط مساحة العمل بنجاح!
                </h3>
                <p className="text-xs text-emerald-300">
                  تم الحفاظ على 320 شهادة مكتملة (دون إعادة استخراج أو مسح). العمل جاهز للاستئناف فورياً.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block">نقطة الانطلاق التشغيلية:</span>
                <span className="text-cyan-300 font-bold font-mono text-sm">
                  الشهادة رقم #{handoffData.nextResumeIndex} (من أصل 500)
                </span>
              </div>

              <Link
                href="/batch-scanner"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>متابعة مراجعة الشهادة #{handoffData.nextResumeIndex} الآن</span>
              </Link>
            </div>
          </div>
        )}

        {/* Zero Reprocessing Institutional Callout */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <span className="text-xs text-cyan-400 font-mono font-semibold block">
                {handoffData.college}
              </span>
              <h2 className="text-lg font-bold text-white">{handoffData.batchName}</h2>
              <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                <span>مرسلة من: <strong className="text-slate-200">{handoffData.senderName}</strong></span>
                <span>•</span>
                <span>الجهاز: <strong className="text-slate-200">{handoffData.senderDevice}</strong></span>
              </div>
            </div>

            <div className="text-left font-mono text-xs text-slate-400 space-y-1">
              <div>الحجم الإجمالي: <strong className="text-white">{handoffData.payloadSize}</strong></div>
              <div>قناة النقل: <strong className="text-purple-400 font-sans">نقل محلي مباشر (Direct)</strong></div>
            </div>
          </div>

          {/* Progress Breakdown Grid */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">
              حالة إنجاز الدفعة المحفوظة في الحزمة (Preserved Work State):
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] block">إجمالي الشهادات:</span>
                <span className="text-lg font-bold text-white">{handoffData.totalItems}</span>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                <span className="text-emerald-400 text-[10px] block">مكتملة الـ OCR ومطابقة:</span>
                <span className="text-lg font-bold text-emerald-400">{handoffData.processedItems}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">جاهزة دون إعادة عمل</span>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                <span className="text-amber-400 text-[10px] block">بحاجة لمراجعة يدوية:</span>
                <span className="text-lg font-bold text-amber-400">{handoffData.needsReviewItems}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">تشابك خط يد</span>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl">
                <span className="text-cyan-400 text-[10px] block">قيد الانتظار:</span>
                <span className="text-lg font-bold text-cyan-300">{handoffData.pendingItems}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">تبدأ من #{handoffData.nextResumeIndex}</span>
              </div>
            </div>
          </div>

          {/* Mutual Verification Phrase Check */}
          <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  المصادقة الأمنية المتبادلة (Mutual Verification Phrase):
                </span>
                <span className="text-slate-300 text-[11px]">
                  تأكد من تطابق العبارة التالية مع شاشة جهاز المرسل لمنع أي اعتراض على الشبكة المحلية:
                </span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-purple-900/60 border border-purple-600/60 text-purple-200 font-mono font-bold text-sm tracking-wider rounded-xl shadow-inner">
              {handoffData.pairingPhrase}
            </div>
          </div>

          {/* Diff & Reconciliation Check */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">
                فحص المقارنة مع مساحة العمل المحلية (Diff Inspection):
              </span>
              <span className="text-slate-400 text-[11px]">
                0 تعارضات حرجة • 48 حقل مدمج تلقائياً (Field-Level Safe Merge) • 132 شهادة جديدة
              </span>
            </div>

            <button
              onClick={() => setShowConflictModal(true)}
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium"
            >
              <span>معاينة تفاصيل الدمج</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Footer */}
          {!isAccepted && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  بالنقر على القبول، سيتم فك تشفير الـ DEK وحفظ سلسلة الحيازة المؤسسية باسمك.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/handoff"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                >
                  إلغاء وتراجع
                </Link>

                <button
                  onClick={handleAcceptAndResume}
                  disabled={isAccepting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-cyan-900/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAccepting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التحقق من التجزئة والدمج...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>قبول واستئناف العمل من الشهادة #{handoffData.nextResumeIndex}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Diff & Conflict Preview Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                تقرير فحص التعارضات والمطابقة (Conflict Resolution Report)
              </h3>
              <button
                onClick={() => setShowConflictModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400">الدمج الآمن للحقول (Field-Level Safe Merge):</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  تم دمج حقول الكلية والتخصص دون مساس بحالات المراجعة المكتملة مسبقاً وفق قاعدة عدم الكتابة الصامتة (No Silent Overwrite).
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-300">عينة الفروقات المحلولة:</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الشهادة: #cert_042</span>
                    <span className="text-cyan-400 font-bold">FIELD_MERGED</span>
                  </div>
                  <div className="text-slate-400">المحلي: التخصص = هندسة البرمجيات</div>
                  <div className="text-emerald-400">الوارد: التقدير = ممتاز مع مرتبة الشرف (تم ضمه)</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConflictModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
