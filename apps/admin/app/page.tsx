"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ImpactAlert from "@/components/ImpactAlert";
import {
  Layers,
  FileCheck2,
  Search,
  Share2,
  FileSpreadsheet,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  History,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const [showStaleAlert, setShowStaleAlert] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Enterprise Navigation */}
      <Navigation />

      {/* Main Command Center Body */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Stale Artifact Warning Banner (Prompt 24 Section 95) */}
        {showStaleAlert && (
          <ImpactAlert
            affectedCount={1}
            projectName="كشف خريجي نظم المعلومات 2026"
            message="تم اعتماد تصحيح اسم الطالب «أحمد بن علي العباسي» بعد توليد ملف الـ PDF الأخير."
            onRegenerate={() => {
              alert("تم إرسال مهمة إعادة توليد كشف الـ PDF إلى طابور المعالجة الخلفية.");
              setShowStaleAlert(false);
            }}
          />
        )}

        {/* Pipeline Progression Ribbon (Prompt 24 Section 2) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <span className="font-semibold text-slate-200">مسار دورة حياة الوثائق والسجلات (Sahm Lifecycle)</span>
            <span className="text-[11px] text-teal-400 font-mono">دفعة كلية علوم الحاسوب 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-3 text-xs">
            {[
              { step: "1. الالتقاط", count: "100", status: "completed", desc: "مسح ضوئي كامل" },
              { step: "2. فحص الجودة", count: "100", status: "completed", desc: "مطابق للمعايير" },
              { step: "3. استخراج OCR", count: "91", status: "active", desc: "9 بحاجة لمراجعة" },
              { step: "4. المراجعة", count: "9", status: "warning", desc: "طابور المراجعة" },
              { step: "5. الاعتماد", count: "88", status: "pending", desc: "جاهز للاعتماد" },
              { step: "6. التصدير", count: "1", status: "pending", desc: "مشروع كشف PDF" },
              { step: "7. التحقق QR", count: "88", status: "pending", desc: "رموز رقمية نشطة" },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                  s.status === "completed"
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                    : s.status === "active"
                    ? "bg-teal-500/10 border-teal-500/30 text-teal-300 ring-1 ring-teal-500/30"
                    : s.status === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <div className="font-medium text-[11px] truncate">{s.step}</div>
                <div className="font-mono text-base font-bold my-0.5 text-white">{s.count}</div>
                <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Context-Aware Continue Work (Prompt 24 Section 10 & 11) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card: Continue Where You Left Off */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/60 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30 font-bold">
                  استئناف العمل الفوري (Continue Work)
                </span>
                <span className="text-xs text-slate-400 font-mono">آخر نشاط: منذ 12 دقيقة</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                دفعة كلية علوم الحاسوب 2026 — شهادات البكالوريوس
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                توقفت عند مراجعة الشهادة رقم <span className="font-mono font-bold text-teal-400">#42</span> لطالب «إبراهيم خليل النور». تم إنجاز 41 شهادة بنجاح دون الحاجة لإعادة الـ OCR.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/review"
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>استئناف المراجعة من العنصر #42</span>
              </Link>
              <Link
                href="/handoff"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>تسليم الدفعة لموظف آخر (Handoff)</span>
              </Link>
            </div>
          </div>

          {/* Quick Action Matrix (Universal Quick Actions) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                الإجراءات السريعة المباشرة
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">وصول سريع للمهام التشغيلية المعتمدة</p>
            </div>

            <div className="space-y-2">
              <Link
                href="/batch-scanner"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span className="font-medium text-slate-200">مسح دفعة شهادات جديدة</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/search"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-slate-200">بحث فوري عن طالب أو شهادة</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/export-studio"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-slate-200">تصدير كشف رسمي (PDF/XLSX)</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
              </Link>

              <Link
                href="/verifications"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">فحص وثيقة بالـ QR الرقمي</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Priority Work Queues Grid (Prompt 24 Section 17 & 18) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              طوابير العمل ذات الأولوية (Priority Action Queues)
            </h3>
            <Link href="/review" className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1">
              <span>عرض كافة السجلات المعلقة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Queue 1: Needs Review */}
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">بحاجة لمراجعة وتدقيق</span>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  9 حالات
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                شهادات تحتوي على خط يدوي متداخل أو درجات ثقة منخفضة تتطلب قراراً بشرياً صريحاً.
              </p>
              <Link
                href="/review"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium text-xs pt-1"
              >
                <span>فتح طابور المراجعة</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>

            {/* Queue 2: Identity Conflicts */}
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">تعارضات الهوية والتكرار</span>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                  3 حالات
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                تشابه أسماء مع دفعات سابقة تم حظر دمجها آلياً عملاً بقاعدة منع الدمج الصامت.
              </p>
              <Link
                href="/review"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium text-xs pt-1"
              >
                <span>فض التعارضات بأمان</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>

            {/* Queue 3: Ready for Approval */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">جاهزة للاعتماد والنشر</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  88 شهادة
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                شهادات تم تدقيقها بالكامل وجاهزة للاعتماد وإصدار لقطات النشر ورموز الـ QR.
              </p>
              <Link
                href="/verifications"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium text-xs pt-1"
              >
                <span>إصدار الهويات الرقمية</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Operational Audit Trail Feed */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-200">النشاط العملياتي المباشر (Audit Feed)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">تتبع دقيق لسلسلة الحيازة</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {[
              {
                time: "منذ 14 دقيقة",
                actor: "أحمد عباس (مراجع)",
                action: "اعتماد مراجعة الشهادة #41",
                detail: "تطابق تام للاسم مع شهادة الثانوية المرفقة",
              },
              {
                time: "منذ 32 دقيقة",
                actor: "نظام التحقق الآلي",
                action: "كشف قطعة أثرية قديمة (Stale Artifact)",
                detail: "وسم كشف الخريجين PDF كنسخة قديمة بعد تصحيح الاسم",
              },
              {
                time: "منذ ساعة",
                actor: "د. عميد الكلية",
                action: "تصدير حزمة تسليم مشفرة (.sahmpkg)",
                detail: "نقل دفعة تقنية المعلومات مع الحفاظ على حالات الـ OCR",
              },
            ].map((feed, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <div>
                    <span className="font-semibold text-slate-200">{feed.action}</span>
                    <span className="text-slate-400 mr-2 text-[11px]">— {feed.detail}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{feed.time}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
