"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  Activity,
  Zap,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  FileText,
  Search,
  ArrowRight,
  ShieldAlert,
  Server,
  Lock,
  ExternalLink,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function AIControlCenterDashboard() {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedModelToDisable, setSelectedModelToDisable] = useState("sahm-arabic-handwriting-v2");
  const [disableReason, setDisableReason] = useState("");
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  // Policy Simulation State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simIdThreshold, setSimIdThreshold] = useState(0.98);
  const [simNameThreshold, setSimNameThreshold] = useState(0.90);

  const handleConfirmEmergencyDisable = () => {
    setEmergencyAlertActive(true);
    setShowEmergencyModal(false);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                مركز التحكم وحوكمة الذكاء الاصطناعي (AI Control Plane)
              </h1>
              <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-mono">
                PROMPT 19
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة النماذج، اختبارات المقارنة، حجر التغذية الراجعة، كشف الانحراف، وحظر التعديل غير المنضبط
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>محاكاة السياسة (Policy Sim)</span>
          </button>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-600/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition shadow-md shadow-rose-900/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>تعطيل طارئ لنموذج</span>
          </button>
        </div>
      </header>

      {/* Emergency Active Alert Banner if triggered */}
      {emergencyAlertActive && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>تنبيه أمان عاجل:</strong> تم تعطيل النموذج <code className="bg-rose-900/60 px-1.5 py-0.5 rounded font-mono">{selectedModelToDisable}</code> فورياً من خط التوجيه. تم تحويل الطلبات تلقائياً إلى النموذج الاحتياطي.
            </span>
          </div>
          <button
            onClick={() => setEmergencyAlertActive(false)}
            className="text-xs text-rose-400 hover:underline"
          >
            إغلاق الإشعار
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
          <Link
            href="/ai-control"
            className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2 shadow-md shadow-purple-900/20"
          >
            <Activity className="w-3.5 h-3.5" />
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

        {/* Subsystem Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Printed OCR */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">OCR النصوص المطبوعة</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>سليم (Healthy)</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-white tracking-tight">96.8%</span>
              <span className="text-xs text-slate-400">دقة الحقول</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>كمون P95:</span>
                <span className="font-mono text-cyan-400 font-semibold">320ms</span>
              </div>
              <div className="flex justify-between">
                <span>معدل المراجعة:</span>
                <span className="font-mono text-slate-300">8.2%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Arabic Handwriting */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">التعرف على الخط اليدوي</span>
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Activity className="w-3 h-3" />
                <span>مستقر (Active)</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-amber-400 tracking-tight">91.2%</span>
              <span className="text-xs text-slate-400">دقة الخط العربي</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>كمون P95:</span>
                <span className="font-mono text-cyan-400 font-semibold">420ms</span>
              </div>
              <div className="flex justify-between">
                <span>معدل المراجعة:</span>
                <span className="font-mono text-slate-300">16.4%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Identity Matcher */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">مطابقة الهويات والتكرارات</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>أمان عالٍ</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-emerald-400 tracking-tight">0.01%</span>
              <span className="text-xs text-slate-400">خطأ تطابق (FP)</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>معدل الأمان الحرج:</span>
                <span className="font-mono text-emerald-400 font-semibold">&lt; 0.05% ممتثل</span>
              </div>
              <div className="flex justify-between">
                <span>حد الثقة الصارم:</span>
                <span className="font-mono text-slate-300">92.0%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Governance & Cost */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">حوكمة الخصوصية والتكلفة</span>
              <span className="flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                <Lock className="w-3 h-3" />
                <span>محلي بالكامل</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-white tracking-tight">$0.00</span>
              <span className="text-xs text-slate-400">تكلفة سحابية خارجية</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>سياسة الخصوصية:</span>
                <span className="font-mono text-purple-300 font-semibold">STRICT_LOCAL</span>
              </div>
              <div className="flex justify-between">
                <span>تغذية في الحجر:</span>
                <span className="font-mono text-cyan-400 font-bold">14 عينة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Architecture Guarantees Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white">
                المبادئ الحاكمة لسلامة قرارات الذكاء الاصطناعي (Hard Safety Enforcements)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Control Plane v1.0.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>حظر التدريب التلقائي (Training Quarantine)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                ممنوع تحويل تصحيحات المراجعين مباشرة إلى تدريب في الإنتاج؛ يجب أن تمر التغذية الراجعة بمختبر التقييم وبوابة اعتماد بشرية صريحة.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>إلزامية قيود الخصوصية (Hard Privacy Rule)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                نمط STRICT_LOCAL يمنع التوجيه للمزودين السحابيين منعاً باتاً على مستوى الباك إند بغض النظر عن دقة النموذج أو سرعته.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>بصمة الإصدار والنسب (Cryptographic Fingerprint)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                كل قرار استخراج يسجل بصمة النموذج وخط المعالجة وتجزئة المدخلات SHA-256 لضمان إعادة بناء وتفسير النتائج بدقة عبر السنين.
              </p>
            </div>
          </div>
        </div>

        {/* Latency & Throughput Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Zap className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">
                توزيع كمون الاستجابة اللحظي (Inference Latency Percentiles)
              </h3>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>معدل نجاح: 99.98%</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">الكمون المتوسط (P50)</div>
              <div className="text-xl font-bold font-mono text-cyan-400">180 ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Local Tesseract OCR</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">الكمون الحرج (P95)</div>
              <div className="text-xl font-bold font-mono text-amber-400">420 ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Arabic Handwriting Transformer</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">أقصى كمون (P99)</div>
              <div className="text-xl font-bold font-mono text-purple-400">780 ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Multi-signal Vision Segmentation</div>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Disable Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">التعطيل الطارئ الفوري لنموذج (Emergency Killswitch)</h3>
                <p className="text-xs text-slate-400">إيقاف النموذج فورياً من خط التوجيه دون حذف السجلات التاريخية</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">اختر النموذج المستهدف:</label>
              <select
                value={selectedModelToDisable}
                onChange={(e) => setSelectedModelToDisable(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="sahm-arabic-handwriting-v2">sahm-arabic-handwriting-v2 (خط يد عربي)</option>
                <option value="sahm-ocr-printed-v2">sahm-ocr-printed-v2 (نصوص مطبوعة)</option>
                <option value="sahm-identity-matcher-v1">sahm-identity-matcher-v1 (مطابقة هويات)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">مبرر التعطيل الطارئ للتوثيق الإداري:</label>
              <textarea
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="مثال: رصد انخفاض في دقة استخراج الأرقام الجامعية في دفعة كلية الطب..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 space-y-1">
              <p>• سيتم إيقاف أي دفعات جديدة تعتمد على هذا النموذج فورياً.</p>
              <p>• السجلات السابقة المعتمدة لن تتأثر وستحتفظ ببصمتها الأصلية كاملة.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmEmergencyDisable}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30"
              >
                تأكيد التعطيل الفوري
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">محاكاة أثر تعديل سياسة الحوكمة (Policy Simulation)</h3>
                <p className="text-xs text-slate-400">فحص أثر تغيير حدود الثقة على عبء المراجعة البشرية ومعدل الأمان</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">حد الثقة الصارم للأرقام الجامعية:</span>
                  <span className="font-mono text-cyan-400 font-bold">{(simIdThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.90"
                  max="0.999"
                  step="0.005"
                  value={simIdThreshold}
                  onChange={(e) => setSimIdThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-300">حد الثقة المعتدل لأسماء الطلاب:</span>
                  <span className="font-mono text-cyan-400 font-bold">{(simNameThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="0.98"
                  step="0.01"
                  value={simNameThreshold}
                  onChange={(e) => setSimNameThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-4">
                <div className="font-bold text-white mb-1">النتائج المتوقعة للمحاكاة:</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">معدل الإحالة للمراجعة البشرية:</span>
                  <span className="font-mono text-cyan-400 font-bold">11.4% (مستقر)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">معدل مخاطر التطابق الخاطئ:</span>
                  <span className="font-mono text-emerald-400 font-bold">0.000% (أمان تام)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الوفر الزمني المقدر لكل 100 شهادة:</span>
                  <span className="font-mono text-purple-300 font-bold">~45 دقيقة مراجعة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
              >
                إغلاق المحاكاة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
