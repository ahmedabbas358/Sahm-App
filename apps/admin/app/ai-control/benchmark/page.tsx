"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  BarChart2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
  Clock,
  DollarSign,
  Download,
  Flame,
  RotateCcw,
  Server,
  Activity,
} from "lucide-react";

interface SliceMetric {
  sliceName: string;
  sampleCount: number;
  championCer: number;
  challengerCer: number;
  championExact: number;
  challengerExact: number;
  status: "improved" | "regressed" | "identical";
}

interface BenchmarkSample {
  id: string;
  slice: string;
  groundTruth: string;
  championPred: string;
  challengerPred: string;
  championCer: number;
  challengerCer: number;
  resolvedIssue: boolean;
}

export default function AIBenchmarkLabPage() {
  const [selectedDataset, setSelectedDataset] = useState("gold-cert-ar-v3");
  const [selectedSlice, setSelectedSlice] = useState("all");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promotionSuccess, setPromotionSuccess] = useState(false);

  // Model comparison metadata
  const championModel = {
    id: "sahm-arabic-handwriting-v2",
    name: "Arabic Handwriting Vision Transformer (Champion)",
    version: "v2.1.0",
    releaseDate: "2026-09-01",
    overallCer: 0.048,
    normalizedCer: 0.024,
    exactMatch: 0.912,
    identityFalsePositiveRate: 0.0003, // 0.03% (< 0.05% safety bar)
    p95Latency: "480ms",
    costPer1k: "$0.00 (Local)",
  };

  const challengerModel = {
    id: "sahm-arabic-handwriting-v3-candidate",
    name: "Ensemble Hybrid Handwriting & Diacritics (Challenger)",
    version: "v3.0.0-rc2",
    releaseDate: "2026-09-20",
    overallCer: 0.031, // Improved
    normalizedCer: 0.012, // Improved
    exactMatch: 0.948, // Improved
    identityFalsePositiveRate: 0.0002, // 0.02% (< 0.05% safety bar)
    p95Latency: "510ms",
    costPer1k: "$0.00 (Local)",
  };

  const sliceMetrics: SliceMetric[] = [
    {
      sliceName: "كشوفات مكتوبة بخط اليد (Handwritten Ledgers)",
      sampleCount: 850,
      championCer: 0.058,
      challengerCer: 0.034,
      championExact: 0.884,
      challengerExact: 0.932,
      status: "improved",
    },
    {
      sliceName: "شهادات مطبوعة عالية الجودة (Pristine Printed)",
      sampleCount: 1200,
      championCer: 0.012,
      challengerCer: 0.011,
      championExact: 0.985,
      challengerExact: 0.988,
      status: "identical",
    },
    {
      sliceName: "مسودات منخفضة الدقة ومشوشة (Low-Res & Noisy Scans)",
      sampleCount: 420,
      championCer: 0.094,
      challengerCer: 0.062,
      championExact: 0.792,
      challengerExact: 0.865,
      status: "improved",
    },
    {
      sliceName: "أسماء مركبة وطويلة (Quadruple Arabic Names)",
      sampleCount: 610,
      championCer: 0.041,
      challengerCer: 0.022,
      championExact: 0.918,
      challengerExact: 0.961,
      status: "improved",
    },
    {
      sliceName: "أرقام جامعية باهتة (Faded University IDs)",
      sampleCount: 380,
      championCer: 0.028,
      challengerCer: 0.019,
      championExact: 0.962,
      challengerExact: 0.981,
      status: "improved",
    },
  ];

  const sampleDiffs: BenchmarkSample[] = [
    {
      id: "SMP-1082",
      slice: "كشوفات مكتوبة بخط اليد",
      groundTruth: "عبد الرحمن أحمد إبراهيم الدسوقي",
      championPred: "عبدالرحمن احمد ابراهيم الدسوقى",
      challengerPred: "عبد الرحمن أحمد إبراهيم الدسوقي",
      championCer: 0.12,
      challengerCer: 0.0,
      resolvedIssue: true,
    },
    {
      id: "SMP-1083",
      slice: "أرقام جامعية باهتة",
      groundTruth: "202109485",
      championPred: "202109485",
      challengerPred: "202109485",
      championCer: 0.0,
      challengerCer: 0.0,
      resolvedIssue: false,
    },
    {
      id: "SMP-1084",
      slice: "مسودات منخفضة الدقة ومشوشة",
      groundTruth: "كلية الهندسة - قسم الحاسبات والمنظومات",
      championPred: "كلية الهندسة - قسم الحاسبات والمنظوماء",
      challengerPred: "كلية الهندسة - قسم الحاسبات والمنظومات",
      championCer: 0.05,
      challengerCer: 0.0,
      resolvedIssue: true,
    },
    {
      id: "SMP-1085",
      slice: "أسماء مركبة وطويلة",
      groundTruth: "محمد نور الدين عبد القادر المحمدي",
      championPred: "محمد نورالدين عبدالقادر المحمدي",
      challengerPred: "محمد نور الدين عبد القادر المحمدي",
      championCer: 0.06,
      challengerCer: 0.0,
      resolvedIssue: true,
    },
  ];

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationComplete(true);
    }, 1200);
  };

  const handleConfirmPromote = () => {
    setPromotionSuccess(true);
    setShowPromoteModal(false);
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
            href="/ai-control"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
            title="العودة إلى لوحة التحكم"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                مختبر التقييم والمقارنة (AI Benchmark Lab)
              </h1>
              <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-mono">
                CHAMPION vs CHALLENGER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تقييم النماذج ضد مجموعات البيانات الذهبية (Gold Datasets)، تحليل الشرائح الحساسة، واختبار السلامة المؤسسية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-90 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري معالجة العينات (0/3460)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>تشغيل التقييم المقارن (Run Benchmark)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowPromoteModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>ترقية النموذج (Promote Challenger)</span>
          </button>
        </div>
      </header>

      {/* Promotion Success Banner */}
      {promotionSuccess && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 px-6 py-3 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>تمت الترقية بنجاح:</strong> أصبح النموذج{" "}
              <code className="bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono">
                {challengerModel.name} ({challengerModel.version})
              </code>{" "}
              هو النموذج القياسي (Champion) الجديد في مسار خط الإنتاج بعد استيفاء كافة شروط الأمان.
            </span>
          </div>
          <button
            onClick={() => setPromotionSuccess(false)}
            className="text-xs text-emerald-400 hover:underline"
          >
            إغلاق
          </button>
        </div>
      )}

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
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>مختبر التقييم (Benchmark Lab)</span>
          </Link>

          <Link
            href="/ai-control/feedback"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2 transition"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
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

        {/* Dataset Selector & Settings Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">مجموعة البيانات الذهبية (Benchmark Dataset):</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>كشوفات الدرجات والشهادات الذهبية الرسمية (Gold Benchmark v3.2)</span>
                <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  3,460 عينة معتمدة
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-slate-400">تصنيف البيانات:</span>
              <span className="text-emerald-400 font-mono font-semibold">INTERNAL_APPROVED (معقمة ومجهلة)</span>
            </div>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <Download className="w-3.5 h-3.5" />
              <span>تصدير النتائج (CSV)</span>
            </button>
          </div>
        </div>

        {/* Champion vs Challenger Head-to-Head Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Champion Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border-2 border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-[11px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>النموذج القياسي الحالي (Champion)</span>
            </div>

            <div className="mt-2 mb-4">
              <h3 className="text-base font-bold text-white">{championModel.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                <span>{championModel.version}</span>
                <span>•</span>
                <span>تم الاعتماد: {championModel.releaseDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">معدل خطأ الحروف (Raw CER)</div>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {(championModel.overallCer * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">شامل التشكيل والهمزات</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">CER المقنن (Normalized)</div>
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {(championModel.normalizedCer * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">بعد توحيد الرسم الإملائي</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">تطابق الحقول التام (Exact Match)</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {(championModel.exactMatch * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">دقة كاملة للحقل</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">خطأ تطابق الهوية (FP Match)</div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {(championModel.identityFalsePositiveRate * 100).toFixed(3)}%
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">مستوفي شرط الأمان (≤0.05%)</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {championModel.p95Latency}
              </span>
              <span className="font-mono text-slate-400">{championModel.costPer1k}</span>
            </div>
          </div>

          {/* Challenger Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border-2 border-cyan-500/50 shadow-xl shadow-cyan-950/30 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-cyan-400 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>النموذج المنافس المرشح (Challenger)</span>
            </div>

            <div className="mt-2 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{challengerModel.name}</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                <span>{challengerModel.version}</span>
                <span>•</span>
                <span>تاريخ الفحص: {challengerModel.releaseDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950/70 border border-cyan-900/50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">معدل خطأ الحروف (Raw CER)</div>
                <div className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                  <span>{(challengerModel.overallCer * 100).toFixed(2)}%</span>
                  <span className="text-xs text-emerald-400 flex items-center font-sans">
                    <TrendingDown className="w-3.5 h-3.5" /> -35%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">تحسن كبير في دقة الخط</div>
              </div>

              <div className="bg-slate-950/70 border border-cyan-900/50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">CER المقنن (Normalized)</div>
                <div className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                  <span>{(challengerModel.normalizedCer * 100).toFixed(2)}%</span>
                  <span className="text-xs text-emerald-400 flex items-center font-sans">
                    <TrendingDown className="w-3.5 h-3.5" /> -50%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">بعد توحيد الرسم الإملائي</div>
              </div>

              <div className="bg-slate-950/70 border border-cyan-900/50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">تطابق الحقول التام (Exact Match)</div>
                <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <span>{(challengerModel.exactMatch * 100).toFixed(1)}%</span>
                  <span className="text-xs text-emerald-400 flex items-center font-sans">
                    <TrendingUp className="w-3.5 h-3.5" /> +3.6%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">دقة متفوقة في النصوص العربية</div>
              </div>

              <div className="bg-slate-950/70 border border-cyan-900/50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-400 mb-1">خطأ تطابق الهوية (FP Match)</div>
                <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <span>{(challengerModel.identityFalsePositiveRate * 100).toFixed(3)}%</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                    PASSED
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">أعلى معايير الأمان (≤0.05%)</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="flex items-center gap-1 font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {challengerModel.p95Latency}
              </span>
              <span className="font-mono text-emerald-400 font-semibold">جاهز للترقية الفورية</span>
            </div>
          </div>
        </div>

        {/* Slice Performance Breakdown Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  تحليل الأداء حسب الشرائح الحساسة (Critical Slice Analysis)
                </h3>
                <p className="text-xs text-slate-400">
                  مقارنة تفصيلية للتأكد من عدم وجود تراجع (Regression) في أي فئة من فئات المستندات
                </p>
              </div>
            </div>
            <div className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
              0 شرائح متراجعة (Zero Regressions)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">شريحة البيانات (Slice)</th>
                  <th className="py-3 px-4">عدد العينات</th>
                  <th className="py-3 px-4">CER النموذجي (Champion)</th>
                  <th className="py-3 px-4">CER المنافس (Challenger)</th>
                  <th className="py-3 px-4">تطابق الحقل (Champion)</th>
                  <th className="py-3 px-4">تطابق الحقل (Challenger)</th>
                  <th className="py-3 px-4 text-center">حالة الشريحة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sliceMetrics.map((slice, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-medium text-white">{slice.sliceName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{slice.sampleCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {(slice.championCer * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {(slice.challengerCer * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {(slice.championExact * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {(slice.challengerExact * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {slice.status === "improved" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          <span>تحسن ملحوظ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 px-2.5 py-0.5 rounded-full">
                          <span>متطابق (مستقر)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample-Level Ground Truth Inspection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>فحص العينات المتباينة ومقارنة الحقيقة الأرضية (Ground Truth Diff Inspector)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              مراجعة العينات التي اختلف فيها النموذجان للتأكد من سلامة المعالجة اللغوية ودقة الرسم العثماني/الإملائي
            </p>
          </div>

          <div className="p-5 space-y-4">
            {sampleDiffs.map((s) => (
              <div
                key={s.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{s.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{s.slice}</span>
                  </div>
                  {s.resolvedIssue ? (
                    <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      عولجت مشكلة الهمزة / المسافة في النموذج الجديد
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                      تطابق تام
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1 font-semibold">
                      الحقيقة الأرضية الرسمية (Ground Truth):
                    </div>
                    <div className="font-mono text-white text-sm">{s.groundTruth}</div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1 font-semibold flex items-center justify-between">
                      <span>استخراج النموذج القياسي (Champion):</span>
                      <span className="font-mono text-rose-400">CER: {(s.championCer * 100).toFixed(1)}%</span>
                    </div>
                    <div className="font-mono text-rose-300 text-sm">{s.championPred}</div>
                  </div>

                  <div className="bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-900/50">
                    <div className="text-[10px] text-cyan-300 mb-1 font-semibold flex items-center justify-between">
                      <span>استخراج النموذج المنافس (Challenger):</span>
                      <span className="font-mono text-emerald-400">CER: {(s.challengerCer * 100).toFixed(1)}%</span>
                    </div>
                    <div className="font-mono text-emerald-300 text-sm">{s.challengerPred}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Promotion Confirmation Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ترقية النموذج إلى Champion رسمي</h3>
                <p className="text-xs text-slate-400">
                  تأكيد ترقية {challengerModel.name} ليكون النموذج المعتمد
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>اسم النموذج:</span>
                <span className="font-mono text-white font-bold">{challengerModel.name}</span>
              </div>
              <div className="flex justify-between">
                <span>الإصدار (Version):</span>
                <span className="font-mono text-cyan-400 font-bold">{challengerModel.version}</span>
              </div>
              <div className="flex justify-between">
                <span>فحص السلامة (False Positive):</span>
                <span className="text-emerald-400 font-bold">0.02% (مستوفي الأمان &le; 0.05%)</span>
              </div>
              <div className="flex justify-between">
                <span>الخصوصية:</span>
                <span className="text-emerald-400 font-bold">STRICT_LOCAL (على خوادم الجامعة)</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              سيتم تسجيل الترقية في سجل التدقيق غير القابل للتعديل مع بصمة المعالجة (Pipeline Fingerprint). سيتم تحويل كافة الطلبات الواردة لخط إنتاج الشهادات إلى النموذج الجديد.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmPromote}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg shadow-emerald-900/30"
              >
                تأكيد الترقية والاعتماد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
