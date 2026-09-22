"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Play,
  TrendingDown,
  TrendingUp,
  Activity,
  Server,
  Sparkles,
  Flame,
  Clock,
  Lock,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Check,
} from "lucide-react";

interface DriftAlert {
  id: string;
  modelIdentifier: string;
  metricName: string;
  metricLabel: string;
  baselineValue: number;
  currentValue: number;
  threshold: number;
  severity: "CRITICAL" | "WARNING" | "INFO";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  detectedAt: string;
  rootHypothesis: string;
}

interface ReprocessingCampaign {
  id: string;
  campaignName: string;
  targetBatch: string;
  baselineModel: string;
  candidateModel: string;
  totalRecords: number;
  identicalCount: number;
  improvedCount: number;
  regressedCount: number;
  safetyInvariantPassed: boolean;
  status: "COMPLETED" | "RUNNING" | "APPLIED";
  completedAt: string;
}

export default function AIDriftAndIncidentsPage() {
  const [selectedIncidentModel, setSelectedIncidentModel] = useState("sahm-arabic-handwriting-v2");
  const [showKillSwitchModal, setShowKillSwitchModal] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState("");
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const [alerts, setAlerts] = useState<DriftAlert[]>([
    {
      id: "DFT-2026-088",
      modelIdentifier: "sahm-arabic-handwriting-v2",
      metricName: "correction_rate_drift",
      metricLabel: "ارتفاع معدل التصحيح البشري (Correction Rate Shift)",
      baselineValue: 0.052,
      currentValue: 0.148,
      threshold: 0.10,
      severity: "CRITICAL",
      status: "ACTIVE",
      detectedAt: "منذ ساعتين (10:15 ص)",
      rootHypothesis: "ورود كشوفات بخط رقعة باهت من كلية الحقوق دور سبتمبر غير مطابقة لبيانات التدريب السابقة",
    },
    {
      id: "DFT-2026-087",
      modelIdentifier: "sahm-identity-matcher-v1",
      metricName: "confidence_mean_shift",
      metricLabel: "انخفاض متوسط درجة ثقة المطابقة (Confidence Shift)",
      baselineValue: 0.945,
      currentValue: 0.885,
      threshold: 0.90,
      severity: "WARNING",
      status: "ACTIVE",
      detectedAt: "منذ 6 ساعات (06:30 ص)",
      rootHypothesis: "تكرار أسماء ثلاثية غير مسبوقة بأرقام جلوس في سجلات سنة 2018",
    },
    {
      id: "DFT-2026-085",
      modelIdentifier: "sahm-ocr-printed-v2",
      metricName: "abstention_rate_spike",
      metricLabel: "ارتفاع طلبات المراجعة البشرية (Review Trigger Rate)",
      baselineValue: 0.082,
      currentValue: 0.091,
      threshold: 0.12,
      severity: "INFO",
      status: "RESOLVED",
      detectedAt: "أمس (14:20)",
      rootHypothesis: "أوراق مائلة بزاوية > 15 درجة تمت معالجتها بفلتر التقويم",
    },
  ]);

  const [campaigns, setCampaigns] = useState<ReprocessingCampaign[]>([
    {
      id: "RPC-2026-041",
      campaignName: "إعادة معالجة مقارنة لكشوفات كلية الحقوق (دفعة سبتمبر 2026)",
      targetBatch: "BATCH-2026-SEPT-LAW (1,240 سجل)",
      baselineModel: "sahm-arabic-handwriting-v2 (v2.1.0)",
      candidateModel: "sahm-arabic-handwriting-v3 (v3.0.0-rc2)",
      totalRecords: 1240,
      identicalCount: 1042,
      improvedCount: 198,
      regressedCount: 0,
      safetyInvariantPassed: true,
      status: "COMPLETED",
      completedAt: "2026-09-22 11:30",
    },
    {
      id: "RPC-2026-039",
      campaignName: "معالجة تجريبية لشهادات الدبلوم القديمة",
      targetBatch: "BATCH-ARCHIVE-DIPLOMA-2015 (850 سجل)",
      baselineModel: "sahm-ocr-printed-v1 (v1.4.0)",
      candidateModel: "sahm-ocr-printed-v2 (v2.0.0)",
      totalRecords: 850,
      identicalCount: 710,
      improvedCount: 140,
      regressedCount: 0,
      safetyInvariantPassed: true,
      status: "APPLIED",
      completedAt: "2026-09-18 16:45",
    },
  ]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a))
    );
  };

  const handleTriggerKillSwitch = () => {
    setKillSwitchActive(true);
    setShowKillSwitchModal(false);
  };

  const handleConfirmApplyReprocessing = () => {
    setApplySuccess(true);
    setShowApplyModal(false);
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
                إدارة الانحراف الإحصائي والحوادث وإعادة المعالجة (Drift & Incidents)
              </h1>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
                DRIFT ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المراقبة المستمرة لأداء النماذج، زر الإيقاف الفوري الآمن، وإعادة المعالجة المقارنة دون الإخلال بالحقيقة الرسمية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowKillSwitchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-600/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition shadow-md shadow-rose-900/20"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>زر التعطيل الفوري (Kill Switch)</span>
          </button>
        </div>
      </header>

      {/* Kill Switch Active Warning Banner */}
      {killSwitchActive && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>تنبيه أمان: تم تفعيل زر التعطيل الطارئ للنموذج {selectedIncidentModel}.</strong> تم تحويل خط المعالجة فورياً إلى النموذج الاحتياطي (Fallback OCR) وتسجيل الحادثة في سجل الامتثال.
            </span>
          </div>
          <button
            onClick={() => setKillSwitchActive(false)}
            className="text-xs text-rose-400 hover:underline"
          >
            استعادة الحالة الطبيعية
          </button>
        </div>
      )}

      {/* Reprocessing Applied Banner */}
      {applySuccess && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 px-6 py-3 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>تم اعتماد وتطبيق نتائج إعادة المعالجة:</strong> تم تحديث السجلات الـ 198 المحسنة بعد توقيع المراجع الأكاديمي وضمان عدم تراجع أي سجل معتمد مسبقاً.
            </span>
          </div>
          <button
            onClick={() => setApplySuccess(false)}
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
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>كشف الانحراف والحوادث (Drift & Rollback)</span>
          </Link>
        </div>

        {/* Drift Alerts Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  تنبيهات الانحراف الإحصائي النشطة (Statistical Drift Alerts)
                </h3>
                <p className="text-xs text-slate-400">
                  كشف التغيرات غير الطبيعية في سلوك النماذج مقارنة بخط الأساس (Baseline) المعتمد
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-mono bg-rose-950/60 border border-rose-900 px-2.5 py-0.5 rounded-full font-bold">
                1 تنبيه حرج (CRITICAL)
              </span>
              <span className="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-900 px-2.5 py-0.5 rounded-full">
                1 تنبيه تحذيري (WARNING)
              </span>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {alerts.map((alert) => {
              const isCritical = alert.severity === "CRITICAL";
              const isWarning = alert.severity === "WARNING";
              const isResolved = alert.status === "RESOLVED";

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                    isCritical
                      ? "bg-rose-950/20 border-rose-900/50"
                      : isWarning
                      ? "bg-amber-950/20 border-amber-900/40"
                      : "bg-slate-950/50 border-slate-800/80"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-300">{alert.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-bold text-white">{alert.metricLabel}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ({alert.modelIdentifier})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                          isCritical
                            ? "bg-rose-950 text-rose-300 border-rose-800"
                            : isWarning
                            ? "bg-amber-950 text-amber-300 border-amber-800"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{alert.detectedAt}</span>
                    </div>
                  </div>

                  {/* Values comparison row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/70 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">خط الأساس المعتمد:</span>
                      <span className="text-slate-300 font-bold">
                        {(alert.baselineValue * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">الحد الأقصى المسموح (Threshold):</span>
                      <span className="text-slate-400 font-bold">
                        {(alert.threshold * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">القيمة المرصودة حالياً:</span>
                      <span
                        className={`font-bold ${
                          isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-slate-300"
                        }`}
                      >
                        {(alert.currentValue * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Hypothesis & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">فرضية السبب الجذري:</span>
                      <span>{alert.rootHypothesis}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isResolved && (
                        <>
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition"
                          >
                            تأكيد المعاينة (Acknowledge)
                          </button>
                          {isCritical && (
                            <button
                              onClick={() => {
                                setSelectedIncidentModel(alert.modelIdentifier);
                                setShowKillSwitchModal(true);
                              }}
                              className="px-2.5 py-1 bg-rose-600/30 border border-rose-600/50 hover:bg-rose-600/50 text-rose-300 font-bold rounded-lg text-[11px] transition"
                            >
                              تعطيل فوري للنموذج
                            </button>
                          )}
                        </>
                      )}
                      {isResolved && (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تمت المعالجة والإغلاق</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Safe Reprocessing Campaigns */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  حملات إعادة المعالجة المقارنة الآمنة (Shadow Reprocessing Campaigns)
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  SHADOW MODE (NO PRODUCTION OVERWRITE)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                اختبار نماذج جديدة على دفعات تاريخية كاملة ومقارنة النتائج جنباً إلى جنب دون لمس السجلات الرسمية
              </p>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-900/20">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>إطلاق حملة إعادة معالجة جديدة</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{camp.id}</span>
                      <span className="text-slate-500">•</span>
                      <h4 className="font-bold text-white text-xs">{camp.campaignName}</h4>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      الدفعة المستهدفة: {camp.targetBatch}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {camp.status === "COMPLETED" ? (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        COMPLETED (READY FOR SIGN-OFF)
                      </span>
                    ) : (
                      <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        APPLIED TO OFFICIAL RECORDS
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparison Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">إجمالي السجلات:</span>
                    <span className="text-white font-bold text-sm">{camp.totalRecords}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">سجلات متطابقة تماماً:</span>
                    <span className="text-slate-300 font-bold text-sm">
                      {camp.identicalCount} ({((camp.identicalCount / camp.totalRecords) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400 text-[10px] block">سجلات تم تحسينها:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +{camp.improvedCount} سجل
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">سجلات تراجعت (Regressions):</span>
                    <span className="text-slate-300 font-bold text-sm">
                      {camp.regressedCount} (0%)
                    </span>
                  </div>
                </div>

                {/* Safety Invariant Check & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300 text-[11px]">
                      محددات الأمان المؤسسية مستوفاة (Safety Invariant Passed: No Regression on Approved Documents)
                    </span>
                  </div>

                  {camp.status === "COMPLETED" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-900/30 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد وتطبيق التحسينات (Human Sign-off)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Emergency Kill Switch Confirmation Modal */}
      {showKillSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-rose-700/60 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">التعطيل الطارئ للنموذج (Emergency Kill Switch)</h3>
                <p className="text-xs text-rose-400">
                  إيقاف فوري للنموذج من خط الإنتاج وتحويل التدفق تلقائياً
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                أنت على وشك إيقاف النموذج <code className="text-rose-400 font-mono font-bold">{selectedIncidentModel}</code>.
                سيتم استبعاد هذا النموذج فورياً من خط معالجة الشهادات وتحويل كافة الطلبات إلى المزود الاحتياطي (Fallback Provider).
              </p>
              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">سبب التعطيل الطارئ (إلزامي للتدقيق):</label>
                <textarea
                  value={killSwitchReason}
                  onChange={(e) => setKillSwitchReason(e.target.value)}
                  placeholder="مثال: رصد انحراف بنسبة 14.8% في معدل خطأ قراءة خط اليد بدفعة الحقوق..."
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowKillSwitchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleTriggerKillSwitch}
                disabled={!killSwitchReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                تأكيد الإيقاف الفوري
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reprocessing Sign-off Dual Authorization Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-700/60 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">اعتماد نتائج إعادة المعالجة (Institutional Sign-off)</h3>
                <p className="text-xs text-emerald-400">
                  تطبيق التحسينات على السجلات الرسمية وفق قاعدة التحكم المزدوج (Four-eyes principle)
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>الدفعة:</span>
                <span className="font-mono text-white font-bold">BATCH-2026-SEPT-LAW</span>
              </div>
              <div className="flex justify-between">
                <span>عدد السجلات المحسنة:</span>
                <span className="font-mono text-emerald-400 font-bold">+198 سجل</span>
              </div>
              <div className="flex justify-between">
                <span>التراجعات:</span>
                <span className="font-mono text-emerald-400 font-bold">0 سجل (مستوفي الأمان)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              وفقاً لقواعد الحوكمة الصارمة، لن يتم استبدال أي شهادة معتمدة رسمياً إلا بموافقة صريحة وتوقيع إلكتروني من المشرف الأكاديمي.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmApplyReprocessing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg shadow-emerald-900/30"
              >
                توقيع وتطبيق التحديثات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
