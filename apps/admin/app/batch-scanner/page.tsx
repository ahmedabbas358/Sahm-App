"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScanLine,
  Layers,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  UserX,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  GraduationCap,
} from "lucide-react";

interface BatchSession {
  id: string;
  batch_code: string;
  name: string;
  batch_year: number;
  college_name?: string;
  status: "draft" | "ready" | "capturing" | "queued" | "processing" | "paused" | "completed" | "completed_with_warnings" | "failed";
  processing_mode: "fast" | "balanced" | "maximum_accuracy";
  expected_count: number;
  actual_count: number;
  processed_count: number;
  completed_count: number;
  needs_review_count: number;
  duplicate_count: number;
  failed_count: number;
  last_activity_at: string;
}

export default function BatchScannerDashboard() {
  const [sessions, setSessions] = useState<BatchSession[]>([
    {
      id: "sess-2026-01",
      batch_code: "BATCH-2026-ENG-01",
      name: "دفعة خريجي كلية الهندسة وتكنولوجيا المعلومات — الدور الأول",
      batch_year: 2026,
      college_name: "كلية الهندسة وتكنولوجيا المعلومات",
      status: "processing",
      processing_mode: "balanced",
      expected_count: 100,
      actual_count: 85,
      processed_count: 72,
      completed_count: 61,
      needs_review_count: 9,
      duplicate_count: 2,
      failed_count: 0,
      last_activity_at: "منذ دقيقتين",
    },
    {
      id: "sess-2026-02",
      batch_code: "BATCH-2026-MED-04",
      name: "حصر وتدقيق شهادات الامتياز — كلية الطب البشري",
      batch_year: 2026,
      college_name: "كلية الطب والعلوم الصحية",
      status: "completed_with_warnings",
      processing_mode: "maximum_accuracy",
      expected_count: 50,
      actual_count: 50,
      processed_count: 50,
      completed_count: 44,
      needs_review_count: 4,
      duplicate_count: 2,
      failed_count: 0,
      last_activity_at: "اليوم 09:15 ص",
    },
    {
      id: "sess-2026-03",
      batch_code: "BATCH-2026-BUS-02",
      name: "شهادات بكالوريوس إدارة الأعمال ونظم المعلومات المحاسبية",
      batch_year: 2025,
      college_name: "كلية العلوم الإدارية والمالية",
      status: "paused",
      processing_mode: "fast",
      expected_count: 120,
      actual_count: 120,
      processed_count: 60,
      completed_count: 55,
      needs_review_count: 5,
      duplicate_count: 0,
      failed_count: 0,
      last_activity_at: "أمس 04:30 م",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSessionForm, setNewSessionForm] = useState({
    name: "",
    college: "كلية الهندسة وتكنولوجيا المعلومات",
    batch_year: 2026,
    expected_count: 50,
    processing_mode: "balanced",
  });

  // Calculate high-level KPIs
  const totalCertificates = sessions.reduce((acc, s) => acc + s.actual_count, 0);
  const totalCompleted = sessions.reduce((acc, s) => acc + s.completed_count, 0);
  const totalNeedsReview = sessions.reduce((acc, s) => acc + s.needs_review_count, 0);
  const totalDuplicates = sessions.reduce((acc, s) => acc + s.duplicate_count, 0);
  const globalReconcileRate = totalCertificates > 0 ? Math.round((totalCompleted / totalCertificates) * 100) : 0;

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: BatchSession = {
      id: `sess-${Date.now()}`,
      batch_code: `BATCH-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: newSessionForm.name || "دفعة شهادات جديدة",
      batch_year: Number(newSessionForm.batch_year),
      college_name: newSessionForm.college,
      status: "ready",
      processing_mode: newSessionForm.processing_mode as any,
      expected_count: Number(newSessionForm.expected_count),
      actual_count: 0,
      processed_count: 0,
      completed_count: 0,
      needs_review_count: 0,
      duplicate_count: 0,
      failed_count: 0,
      last_activity_at: "الآن",
    };
    setSessions([newSession, ...sessions]);
    setShowCreateModal(false);
  };

  const toggleSessionStatus = (id: string) => {
    setSessions(
      sessions.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "processing" ? "paused" : "processing";
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "processing") return s.status === "processing";
    if (filterStatus === "needs_review") return s.needs_review_count > 0;
    if (filterStatus === "completed") return s.status.startsWith("completed");
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition shadow-inner">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">منظومة فحص وتجزئة الدفعات</h1>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded-full border border-teal-500/30">
                  Prompt 17
                </span>
              </div>
              <p className="text-xs text-slate-400">معالجة دفعات الشهادات (10 - 500+) | O(1) Bounded Concurrency</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/export-studio"
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>استوديو التصدير</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-teal-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء دفعة فحص جديدة</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">إجمالي الشهادات المفحوصة</span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{totalCertificates}</span>
              <span className="text-xs text-slate-400">شهادة</span>
            </div>
            <div className="mt-2 text-[11px] text-teal-400/80 flex items-center gap-1">
              <Check className="w-3 h-3" /> عبر {sessions.length} دفعات كليات
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">مكتملة ومطابقة بالكامل</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{totalCompleted}</span>
              <span className="text-xs text-slate-400">سجل مؤكد</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              نسبة نجاح المطابقة التلقائية: {globalReconcileRate}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">طابور التدقيق البشري</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{totalNeedsReview}</span>
              <span className="text-xs text-slate-400">تحتاج قرار</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-400/80">
              مبدأ: لا اعتماد أو دمج صامت بدون مراجعة
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">تكرارات محتملة (3 Tiers)</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-400">{totalDuplicates}</span>
              <span className="text-xs text-slate-400">حالة اكتشاف</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              بصمات SHA256 و dHash المحمية
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">الأداء والذاكرة المحصورة</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300">O(1)</span>
              <span className="text-xs text-slate-400">120 MB Max</span>
            </div>
            <div className="mt-2 text-[11px] text-indigo-400/80">
              معالجة تدفقية دون تجميد المتصفح
            </div>
          </div>
        </section>

        {/* Sessions Filter Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "جميع الدفعات" },
              { id: "processing", label: "قيد المعالجة النشطة" },
              { id: "needs_review", label: "تحتوي على تدقيق معلق" },
              { id: "completed", label: "دفعات مكتملة" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`text-xs px-3.5 py-1.5 rounded-lg transition font-medium ${
                  filterStatus === tab.id
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>عرض {filteredSessions.length} من أصل {sessions.length} دفعة</span>
          </div>
        </div>

        {/* Sessions List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((s) => {
            const progressPct = s.actual_count > 0 ? Math.round((s.processed_count / s.actual_count) * 100) : 0;
            return (
              <div
                key={s.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold bg-slate-800 text-teal-400 px-2.5 py-1 rounded-md border border-slate-700">
                        {s.batch_code}
                      </span>
                      <h2 className="text-base font-bold text-white">{s.name}</h2>
                      <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                        دفعة {s.batch_year}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{s.college_name}</span>
                      <span>•</span>
                      <span>نمط المعالجة: {s.processing_mode === "balanced" ? "متوازن" : s.processing_mode === "fast" ? "سريع" : "أقصى دقة"}</span>
                      <span>•</span>
                      <span>آخر نشاط: {s.last_activity_at}</span>
                    </p>
                  </div>

                  {/* Status Badges & Actions */}
                  <div className="flex items-center gap-3">
                    {s.status === "processing" ? (
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        قيد المعالجة ({progressPct}%)
                      </span>
                    ) : s.status === "completed_with_warnings" ? (
                      <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مكتمل مع تنبيهات مراجعة
                      </span>
                    ) : s.status === "paused" ? (
                      <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Pause className="w-3.5 h-3.5" />
                        متوقف مؤقتاً
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
                        جاهز للالتقاط
                      </span>
                    )}

                    <button
                      onClick={() => toggleSessionStatus(s.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      title={s.status === "processing" ? "إيقاف مؤقت" : "متابعة"}
                    >
                      {s.status === "processing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <Link
                      href={`/batch-scanner/${s.id}/review`}
                      className="flex items-center gap-1.5 bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مساحة التدقيق والمراجعة</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Progress Bar & Counters */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">
                      تم فحص {s.processed_count} من أصل {s.actual_count} شهادة (المتوقع: {s.expected_count})
                    </span>
                    <span className="font-semibold text-slate-300">{progressPct}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${s.actual_count ? (s.completed_count / s.actual_count) * 100 : 0}%` }}
                      title={`مكتمل: ${s.completed_count}`}
                    />
                    <div
                      className="bg-amber-500 transition-all duration-500"
                      style={{ width: `${s.actual_count ? (s.needs_review_count / s.actual_count) * 100 : 0}%` }}
                      title={`يحتاج مراجعة: ${s.needs_review_count}`}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-500"
                      style={{ width: `${s.actual_count ? (s.duplicate_count / s.actual_count) * 100 : 0}%` }}
                      title={`تكرارات: ${s.duplicate_count}`}
                    />
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>مطابقة معتمدة: {s.completed_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>بحاجة لتدقيق: {s.needs_review_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span>تكرار مشتبه به: {s.duplicate_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                      <button
                        onClick={() => alert(`جاري تصدير تقرير الدفعة ${s.batch_code} بصيغة CSV (UTF-8 BOM)...`)}
                        className="hover:text-teal-300 underline"
                      >
                        تصدير كشف التدقيق (Excel UTF-8)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* New Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">إنشاء جلسة فحص دفعات جديدة</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">اسم الدفعة / الوصف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شهادات خريجي كلية الهندسة والمعلوماتية 2026"
                  value={newSessionForm.name}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">الكلية</label>
                  <select
                    value={newSessionForm.college}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="كلية الهندسة وتكنولوجيا المعلومات">كلية الهندسة وتكنولوجيا المعلومات</option>
                    <option value="كلية الطب والعلوم الصحية">كلية الطب والعلوم الصحية</option>
                    <option value="كلية العلوم الإدارية والمالية">كلية العلوم الإدارية والمالية</option>
                    <option value="كلية الآداب والعلوم الإنسانية">كلية الآداب والعلوم الإنسانية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">سنة التخرج (Batch Year)</label>
                  <input
                    type="number"
                    value={newSessionForm.batch_year}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, batch_year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">العدد المتوقع للشهادات</label>
                  <input
                    type="number"
                    value={newSessionForm.expected_count}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, expected_count: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">نمط المعالجة</label>
                  <select
                    value={newSessionForm.processing_mode}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, processing_mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="fast">سريع (Fast Throughput)</option>
                    <option value="balanced">متوازن (Balanced - مستحسن)</option>
                    <option value="maximum_accuracy">أقصى دقة (Maximum Accuracy)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  يضمن النظام سلامة السجلات الرسمية؛ لن يتم استبدال أي بيانات طالب معتمد تلقائياً بدون مصادقة يدوية مسجلة في سجل التدقيق.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20"
                >
                  حفظ وبدء الجلسة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
