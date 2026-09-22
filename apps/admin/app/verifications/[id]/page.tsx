"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Clock,
  History,
  AlertTriangle,
  RotateCcw,
  EyeOff,
  Eye,
  CheckCircle2,
  Building2,
  GraduationCap,
  Calendar,
  Lock,
  UserCheck,
} from "lucide-react";

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [copied, setCopied] = useState(false);
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [reissueReason, setReissueReason] = useState("reissued_certificate");
  const [reissueNotes, setReissueNotes] = useState("");

  // Simulated detailed record
  const [data, setData] = useState({
    id: id || "v-01",
    verification_code: "7KX9-QM4P-82DZ",
    status: "active",
    publication_status: "published",
    privacy_profile: "public_standard",
    qr_code_url: "http://localhost:3000/v/7KX9-QM4P-82DZ",
    issued_at: "2026-09-20T10:30:00Z",
    verification_count: 14,
    last_verified_at: "منذ 45 دقيقة",
    reissued_from_id: null,
    // Internal Record data
    internal: {
      student_name: "أحمد عباس محمد إبراهيم",
      student_name_raw: "احمد عباس محمد ابراهيم",
      university_id: "202201048",
      national_id: "1-99-00249871",
      phone: "+249912345678",
      gpa: 3.85,
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      program_name: "علوم الحاسوب",
      batch_name: "دفعة 2026 — الدور الأول",
      source_image: "SCAN-PAGE-014.PNG",
      notes: "تسلم باليد بموجب توكيل رسمي",
    },
    // Projected Public View data
    projected: {
      student_display_name: "أحمد عباس محمد إبراهيم",
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      program_name: "علوم الحاسوب",
      certificate_type: "بكالوريوس",
      graduation_year: 2026,
      issue_date_formatted: "العام الأكاديمي 2025/2026",
    },
    // Immutable Audit Events
    events: [
      {
        id: "evt-01",
        event_type: "VerificationIssued",
        actor: "أحمد عباس (رئيس قسم الامتحانات والشهادات)",
        timestamp: "2026-09-20 10:30",
        details: "إصدار هوية تحقق رقمية معتمدة وفق سياسة Public Standard",
      },
      {
        id: "evt-02",
        event_type: "VerificationViewed",
        actor: "بوابة الفحص العامة (Public Portal)",
        timestamp: "2026-09-20 14:15",
        details: "عملية مسح QR ناجحة — IP Hash: a89f...21c0",
      },
      {
        id: "evt-03",
        event_type: "VerificationViewed",
        actor: "بوابة الفحص العامة (Public Portal)",
        timestamp: "2026-09-22 11:20",
        details: "عملية مسح QR ناجحة — IP Hash: b43e...98d1",
      },
    ],
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(data.verification_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReissue = () => {
    alert("تم استبدال الوثيقة بنجاح وتوليد هوية تحقق جديدة مع حفظ سلسلة النسب.");
    setShowReissueModal(false);
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
            href="/verifications"
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                سجل التدقيق والتفتيش الأمني للشهادة
              </h1>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded text-xs">
                {data.verification_code}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              فحص هوية التحقق، عزل البيانات السرية، وسجل الحركات غير القابل للتعديل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/v/${data.verification_code}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>عرض الصفحة العامة</span>
          </Link>

          <button
            onClick={() => setShowReissueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>استبدال وإعادة إصدار (Reissue)</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Cards: QR Card + Lineage Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Display Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-center flex flex-col items-center justify-center">
            {/* QR SVG Box */}
            <div className="p-4 bg-white rounded-2xl shadow-md mb-4 border border-slate-200">
              <div className="w-44 h-44 flex items-center justify-center bg-slate-50 relative">
                <QrCode className="w-36 h-36 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                    سهم
                  </div>
                </div>
              </div>
            </div>

            <div className="font-mono text-lg font-bold text-cyan-400 tracking-widest mb-1">
              {data.verification_code}
            </div>
            <div className="text-xs text-slate-400 mb-4">
              Crockford Base32 • Quiet Zone 4x • ECC Level M
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "تم النسخ" : "نسخ الرمز"}</span>
              </button>

              <button
                onClick={() => alert("جارٍ تنزيل ملف الـ SVG عالي الدقة للطباعة...")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل SVG للطباعة</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics & Lineage */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>هوية تحقق سارية ومعتمدة</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    سياسة: <span className="text-purple-400 font-mono font-semibold">Public Standard</span>
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  إجمالي مرات الفحص: <span className="text-cyan-400 font-bold text-sm">{data.verification_count}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">اسم الخريج المعتمد:</span>
                  <span className="font-bold text-white text-sm">{data.internal.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">الرقم الجامعي:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{data.internal.university_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">الكلية:</span>
                  <span className="text-slate-200">{data.internal.faculty_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">التخصص:</span>
                  <span className="text-slate-200">{data.internal.program_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">تاريخ الإصدار:</span>
                  <span className="font-mono text-slate-300">2026-09-20 10:30 UTC</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">آخر فحص مسجل:</span>
                  <span className="text-emerald-400 font-medium">{data.last_verified_at}</span>
                </div>
              </div>
            </div>

            {/* Lineage Info Banner */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>سلسلة الإصدار (Lineage): إصدار أصلي أول (Original Primary)</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Privacy Guard & Disclosure Inspector */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">
                فاحص عزل الخصوصية (Privacy Disclosure Inspector)
              </h3>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>صفر تسريب لبيانات الطالب الشخصية (Zero PII Leakage)</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            مقارنة بين بيانات الطالب الكاملة المحفوظة في قاعدة بيانات الجامعة الداخلية وبين البيانات المسموح بعرضها في صفحة التحقق العامة:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Internal Record */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="font-bold text-slate-300 flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>بيانات السجل الداخلي (University Database)</span>
                </span>
                <span className="text-[10px] text-slate-500">خاص بإدارة الامتحانات</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">اسم الطالب:</span>
                <span className="text-slate-200">{data.internal.student_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">الرقم الوطني:</span>
                <span className="font-mono text-rose-300 font-bold">{data.internal.national_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="font-mono text-rose-300 font-bold">{data.internal.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">المعدل التراكمي (GPA):</span>
                <span className="font-mono text-rose-300 font-bold">{data.internal.gpa}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">ملاحظات المستلم الداخلي:</span>
                <span className="text-rose-300">{data.internal.notes}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ملف المسح الضوئي الأصلي:</span>
                <span className="font-mono text-slate-400">{data.internal.source_image}</span>
              </div>
            </div>

            {/* Public Projected View */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-2.5 text-xs">
              <div className="font-bold text-cyan-300 flex items-center justify-between pb-2 border-b border-cyan-900/40">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الإفصاح العام (Public Verification Projection)</span>
                </span>
                <span className="text-[10px] text-cyan-400">متاح للملأ / أرباب العمل</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">اسم الخريج المعتمد:</span>
                <span className="text-emerald-400 font-bold">{data.projected.student_display_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">الرقم الوطني:</span>
                <span className="text-slate-500 line-through text-[11px] flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-rose-400" />
                  <span>محجوب تماماً (Zero Leakage)</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="text-slate-500 line-through text-[11px] flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-rose-400" />
                  <span>محجوب تماماً (Zero Leakage)</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">المعدل التراكمي والدرجات:</span>
                <span className="text-slate-500 line-through text-[11px] flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-rose-400" />
                  <span>محجوب تماماً (Zero Leakage)</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">الكلية والدرجة:</span>
                <span className="text-slate-200">{data.projected.faculty_name} ({data.projected.certificate_type})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">سنة التخرج المعتمدة:</span>
                <span className="font-mono text-cyan-300 font-semibold">{data.projected.graduation_year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Immutable Audit Events Trail */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
            <History className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">سجل الحركات والأحداث غير القابل للتعديل (Audit Trail)</h3>
          </div>

          <div className="space-y-3">
            {data.events.map((evt, idx) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 mb-0.5">{evt.event_type}</div>
                    <div className="text-slate-400">{evt.details}</div>
                    <div className="text-[11px] text-slate-500 mt-1">المسؤول: {evt.actor}</div>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-400 shrink-0">{evt.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Reissue Modal */}
      {showReissueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعادة إصدار واستبدال الشهادة</h3>
                <p className="text-xs text-slate-400">إلغاء الهوية الحالية وتوليد هوية جديدة مع حفظ النسب</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">مبرر إعادة الإصدار:</label>
              <select
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="reissued_certificate">استبدال رسمي بشهادة جديدة</option>
                <option value="record_correction">تعديل بيانات أكاديمية بعد المراجعة</option>
                <option value="administrative_correction">تصحيح خطأ مطبعي في الاسم أو الرقم</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">ملاحظات وتفاصيل التغيير:</label>
              <textarea
                value={reissueNotes}
                onChange={(e) => setReissueNotes(e.target.value)}
                placeholder="أدخل مبررات إعادة الإصدار للتوثيق في سجل التدقيق..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReissueModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReissue}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-900/30"
              >
                تأكيد إعادة الإصدار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
