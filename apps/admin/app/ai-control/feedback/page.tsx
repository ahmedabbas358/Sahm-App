"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  Layers,
  ChevronDown,
  UploadCloud,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
  Activity,
  Server,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from "lucide-react";

interface FieldHeatmapItem {
  fieldName: string;
  fieldLabel: string;
  totalSubmissions: number;
  correctionsCount: number;
  correctionRate: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  primaryErrorCategory: string;
  trend: "improving" | "worsening" | "stable";
}

interface QuarantinedFeedbackRecord {
  id: string;
  fieldName: string;
  fieldLabel: string;
  originalOcr: string;
  correctedText: string;
  operatorId: string;
  errorCategory: string;
  rootCause: string;
  modelIdentifier: string;
  status: "quarantined" | "promoted" | "rejected";
  timestamp: string;
}

export default function AIControlFeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [records, setRecords] = useState<QuarantinedFeedbackRecord[]>([
    {
      id: "FB-2026-0901",
      fieldName: "student_name",
      fieldLabel: "اسم الطالب",
      originalOcr: "عبد الرحمن احمد ابراهيم الدسوقي",
      correctedText: "عبد الرحمن أحمد إبراهيم الدسوقي",
      operatorId: "op_univ_704",
      errorCategory: "HANDWRITING_AMBIGUITY",
      rootCause: "فقدان همزات القطع في كتابة الرقعة بخط اليد",
      modelIdentifier: "sahm-arabic-handwriting-v2 (v2.1.0)",
      status: "quarantined",
      timestamp: "2026-09-22 10:14",
    },
    {
      id: "FB-2026-0902",
      fieldName: "university_id",
      fieldLabel: "الرقم الجامعي",
      originalOcr: "202109485",
      correctedText: "202109486",
      operatorId: "op_univ_702",
      errorCategory: "OCR_TRANSPOSITION",
      rootCause: "تشابه الرقم 5 و 6 في مسودة قديمة مهترئة الحواف",
      modelIdentifier: "sahm-ocr-printed-v2 (v2.0.0)",
      status: "quarantined",
      timestamp: "2026-09-22 09:45",
    },
    {
      id: "FB-2026-0903",
      fieldName: "specialization",
      fieldLabel: "التخصص الدقيق",
      originalOcr: "هندسة القوى الكهربائية",
      correctedText: "هندسة القوى والآلات الكهربائية",
      operatorId: "op_univ_704",
      errorCategory: "FIELD_SEGMENTATION",
      rootCause: "اقتطاع كلمة (والآلات) لوقوعها على حافة خانة الجدول الورقي",
      modelIdentifier: "sahm-arabic-handwriting-v2 (v2.1.0)",
      status: "quarantined",
      timestamp: "2026-09-22 09:12",
    },
    {
      id: "FB-2026-0904",
      fieldName: "graduation_date",
      fieldLabel: "تاريخ التخرج",
      originalOcr: "دور مايو 2023",
      correctedText: "دور مايو 2024",
      operatorId: "op_univ_701",
      errorCategory: "OCR_TRANSPOSITION",
      rootCause: "تداخل ختم الكلية مع خانة سنة التخرج",
      modelIdentifier: "sahm-ocr-printed-v2 (v2.0.0)",
      status: "promoted",
      timestamp: "2026-09-21 16:30",
    },
    {
      id: "FB-2026-0905",
      fieldName: "student_name",
      fieldLabel: "اسم الطالب",
      originalOcr: "مريم نور الدين مصطفى",
      correctedText: "مريم نور الدين مصطفى كمال",
      operatorId: "op_univ_703",
      errorCategory: "FIELD_SEGMENTATION",
      rootCause: "امتداد الاسم الرباعي إلى خارج الإطار المخصص",
      modelIdentifier: "sahm-arabic-handwriting-v2 (v2.1.0)",
      status: "quarantined",
      timestamp: "2026-09-21 14:22",
    },
  ]);

  const heatmapData: FieldHeatmapItem[] = [
    {
      fieldName: "student_name",
      fieldLabel: "اسم الطالب (Student Name)",
      totalSubmissions: 4210,
      correctionsCount: 227,
      correctionRate: 0.054,
      riskLevel: "HIGH",
      primaryErrorCategory: "خط اليد / همزات القطع",
      trend: "improving",
    },
    {
      fieldName: "university_id",
      fieldLabel: "الرقم الجامعي (University ID)",
      totalSubmissions: 4210,
      correctionsCount: 51,
      correctionRate: 0.012,
      riskLevel: "CRITICAL",
      primaryErrorCategory: "التباس الأرقام المتشابهة (5/6)",
      trend: "stable",
    },
    {
      fieldName: "graduation_date",
      fieldLabel: "تاريخ / دور التخرج (Graduation Date)",
      totalSubmissions: 4210,
      correctionsCount: 126,
      correctionRate: 0.030,
      riskLevel: "MEDIUM",
      primaryErrorCategory: "تداخل الأختام مع خانة التاريخ",
      trend: "improving",
    },
    {
      fieldName: "specialization",
      fieldLabel: "التخصص الدراسي (Specialization)",
      totalSubmissions: 4210,
      correctionsCount: 80,
      correctionRate: 0.019,
      riskLevel: "MEDIUM",
      primaryErrorCategory: "اقتطاع حواف الحقول الجدولية",
      trend: "improving",
    },
    {
      fieldName: "gpa_or_grade",
      fieldLabel: "التقدير والنسبة المئوية (Grade/GPA)",
      totalSubmissions: 4210,
      correctionsCount: 88,
      correctionRate: 0.021,
      riskLevel: "HIGH",
      primaryErrorCategory: "تشويش الفاصلة العشرية",
      trend: "stable",
    },
    {
      fieldName: "faculty_name",
      fieldLabel: "اسم الكلية (Faculty Name)",
      totalSubmissions: 4210,
      correctionsCount: 34,
      correctionRate: 0.008,
      riskLevel: "LOW",
      primaryErrorCategory: "نص مطبوع قياسي ثابت",
      trend: "improving",
    },
  ];

  const handlePromoteToGold = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: "promoted" } : r))
    );
  };

  const handleRejectRecord = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: "rejected" } : r))
    );
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.correctedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.originalOcr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = fieldFilter === "all" || r.fieldName === fieldFilter;
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesField && matchesStatus;
  });

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-control"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
            title="العودة إلى لوحة التحكم"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                حجر التغذية الراجعة وخريطة الأخطاء (Feedback & Error Heatmap)
              </h1>
              <span className="text-[10px] bg-rose-900/60 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded-full font-mono">
                QUARANTINE ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تتبع تصحيحات المدخلين، عزل التغذية الراجعة، وتحليل أسباب الأخطاء دون تعديل تلقائي للنماذج
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>حظر إعادة التدريب التلقائي: <strong>مفعل بنسبة 100%</strong></span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
          <Link
            href="/ai-control"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>نظرة عامة والكمون (Overview)</span>
          </Link>

          <Link
            href="/ai-control/models"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>سجل النماذج والإصدارات (Models)</span>
          </Link>

          <Link
            href="/ai-control/benchmark"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مختبر التقييم (Benchmark Lab)</span>
          </Link>

          <Link
            href="/ai-control/feedback"
            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold flex items-center gap-2 shadow-md shadow-rose-900/20"
          >
            <Flame className="w-3.5 h-3.5 text-white" />
            <span>التغذية الراجعة وخريطة الأخطاء (Feedback)</span>
          </Link>

          <Link
            href="/ai-control/incidents"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>كشف الانحراف والحوادث (Drift & Rollback)</span>
          </Link>
        </div>

        {/* Strict Quarantine Governance Banner */}
        <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-900/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>سياسة حجر التغذية الراجعة المؤسسية (Institutional Feedback Quarantine)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  ACTIVE POLICY: NO-SILENT-MUTATION
                </span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                وفقاً لضوابط الحوكمة، تُحجر جميع تعديلات وتصحيحات مشغلي النظام الورقي ولا يُسمح للنظام بالتعلم التلقائي الذاتي من بيانات الإنتاج.
                تخضع العينات للتدقيق وإزالة البيانات التعريفية غير المصرح بها (Sanitization)، وتُرقى يدوياً إلى مجموعات التقييم الذهبية (Gold Datasets) بعد اعتماد مسؤول الاعتماد الأكاديمي.
              </p>
            </div>
          </div>
        </div>

        {/* Field-Level Error Rate Heatmap */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  خريطة حرارة الأخطاء حسب الحقول (Field Error Heatmap)
                </h3>
                <p className="text-xs text-slate-400">
                  معدل تدخل المراجع البشري لتصحيح كل حقل من حقول الشهادة الجامعية
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              إجمالي السجلات المفحوصة: <span className="text-white font-bold">4,210</span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heatmapData.map((field) => {
              const ratePercent = (field.correctionRate * 100).toFixed(1);
              let barColor = "bg-cyan-500";
              let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";

              if (field.riskLevel === "CRITICAL") {
                barColor = "bg-rose-500";
                badgeColor = "bg-rose-950 text-rose-300 border-rose-800";
              } else if (field.riskLevel === "HIGH") {
                barColor = "bg-amber-500";
                badgeColor = "bg-amber-950 text-amber-300 border-amber-800";
              } else if (field.riskLevel === "MEDIUM") {
                barColor = "bg-cyan-500";
                badgeColor = "bg-cyan-950 text-cyan-300 border-cyan-800";
              } else {
                barColor = "bg-emerald-500";
                badgeColor = "bg-emerald-950 text-emerald-300 border-emerald-800";
              }

              return (
                <div
                  key={field.fieldName}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{field.fieldLabel}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${badgeColor}`}
                    >
                      {field.riskLevel} RISK
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="text-slate-400">معدل التدخل البشري:</span>
                      <span className="text-white font-bold">{ratePercent}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, field.correctionRate * 500)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[11px] space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>السبب الشائع:</span>
                      <span className="text-slate-300">{field.primaryErrorCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>عدد التصحيحات:</span>
                      <span className="font-mono text-white">
                        {field.correctionsCount} / {field.totalSubmissions}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quarantined Records Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>سجل العينات المحجورة (Quarantined Samples Ledger)</span>
                <span className="text-xs text-rose-400 font-mono bg-rose-950/60 border border-rose-900 px-2 py-0.5 rounded">
                  {records.filter((r) => r.status === "quarantined").length} عينات بانتظار التدقيق
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مراجعة تصحيحات المشغلين الميدانيين لتحديد ما إذا كانت تُضم لاختبارات الـ Benchmark أو تُستبعد
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في النص أو الرقم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs w-48"
                />
              </div>

              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="all">كافة الحقول</option>
                <option value="student_name">اسم الطالب</option>
                <option value="university_id">الرقم الجامعي</option>
                <option value="specialization">التخصص</option>
                <option value="graduation_date">تاريخ التخرج</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="all">كافة الحالات</option>
                <option value="quarantined">محجور (Quarantined)</option>
                <option value="promoted">مرقى إلى الذهب (Promoted)</option>
                <option value="rejected">مستبعد (Rejected)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">رقم العينة</th>
                  <th className="py-3 px-4">الحقل المستهدف</th>
                  <th className="py-3 px-4">استخراج الذكاء الاصطناعي (AI OCR)</th>
                  <th className="py-3 px-4">تصحيح المشغل البشري (Ground Truth)</th>
                  <th className="py-3 px-4">تصنيف الخطأ والسبب الجذري</th>
                  <th className="py-3 px-4">النموذج ومصدر المعالجة</th>
                  <th className="py-3 px-4 text-center">الحالة والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{r.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{r.fieldLabel}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-300 bg-rose-950/10">
                      {r.originalOcr}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300 bg-emerald-950/10">
                      {r.correctedText}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <span className="inline-block text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {r.errorCategory}
                      </span>
                      <div className="text-[11px] text-slate-400">{r.rootCause}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      <div>{r.modelIdentifier}</div>
                      <div className="text-[10px] text-slate-500">المشغل: {r.operatorId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.status === "quarantined" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handlePromoteToGold(r.id)}
                            className="px-2.5 py-1 bg-emerald-600/20 border border-emerald-600/40 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[11px] font-semibold transition"
                            title="ترقية إلى مجموعة التقييم الذهبية"
                          >
                            ترقية للذهب
                          </button>
                          <button
                            onClick={() => handleRejectRecord(r.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg text-[11px] transition"
                            title="استبعاد"
                          >
                            استبعاد
                          </button>
                        </div>
                      ) : r.status === "promoted" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مرقى للذهب</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-0.5 rounded-full">
                          <span>مستبعد</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
