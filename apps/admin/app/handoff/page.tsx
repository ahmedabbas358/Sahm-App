"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Share2,
  ArrowRight,
  Plus,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileText,
  Lock,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Activity,
  Server,
  Zap,
  Check,
  AlertTriangle,
} from "lucide-react";

interface HandoffRecord {
  id: string;
  transferId: string;
  batchName: string;
  sourceUser: string;
  targetUser: string;
  totalItems: number;
  processedItems: number;
  needsReviewItems: number;
  pendingItems: number;
  status: "READY" | "IN_PROGRESS" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  transferMethod: "DIRECT_LOCAL" | "CLOUD_STAGED" | "ENCRYPTED_PACKAGE_FILE";
  pairingPhrase?: string;
  createdAt: string;
  expiresIn: string;
}

export default function HandoffDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
  const [selectedHandoff, setSelectedHandoff] = useState<HandoffRecord | null>(null);
  const [revocationSuccess, setRevocationSuccess] = useState<boolean>(false);

  const [records, setRecords] = useState<HandoffRecord[]>([
    {
      id: "hnd-001",
      transferId: "HND-2026-00142",
      batchName: "دفعة نظم المعلومات — دور سبتمبر 2026",
      sourceUser: "أحمد عباس (موظف المسح)",
      targetUser: "سارة حسن (مدققة الشهادات)",
      totalItems: 500,
      processedItems: 320,
      needsReviewItems: 41,
      pendingItems: 132,
      status: "IN_PROGRESS",
      transferMethod: "DIRECT_LOCAL",
      pairingPhrase: "BLUE-ORBIT-27",
      createdAt: "منذ ساعتين (10:45 ص)",
      expiresIn: "باقي 6 أيام",
    },
    {
      id: "hnd-002",
      transferId: "HND-2026-00139",
      batchName: "شهادات كلية الهندسة — قسم القوى 2025",
      sourceUser: "محمد الدسوقي",
      targetUser: "أحمد عباس",
      totalItems: 340,
      processedItems: 340,
      needsReviewItems: 0,
      pendingItems: 0,
      status: "ACCEPTED",
      transferMethod: "CLOUD_STAGED",
      createdAt: "أمس (16:20)",
      expiresIn: "مكتملة",
    },
    {
      id: "hnd-003",
      transferId: "HND-2026-00135",
      batchName: "كشوفات كلية الحقوق — دور مايو 2024",
      sourceUser: "فاطمة الزهراء",
      targetUser: "خالد بن الوليد",
      totalItems: 620,
      processedItems: 410,
      needsReviewItems: 55,
      pendingItems: 155,
      status: "READY",
      transferMethod: "ENCRYPTED_PACKAGE_FILE",
      createdAt: "منذ 3 أيام",
      expiresIn: "باقي 4 أيام",
    },
    {
      id: "hnd-004",
      transferId: "HND-2026-00128",
      batchName: "شهادات الدبلوم المهني — تجريبي",
      sourceUser: "علي مصطفى",
      targetUser: "مستخدم غير مسجل (مرفوض)",
      totalItems: 150,
      processedItems: 80,
      needsReviewItems: 20,
      pendingItems: 50,
      status: "REVOKED",
      transferMethod: "CLOUD_STAGED",
      createdAt: "منذ 5 أيام",
      expiresIn: "تم إتلاف المفاتيح",
    },
  ]);

  const handleConfirmRevoke = () => {
    if (selectedHandoff) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedHandoff.id ? { ...r, status: "REVOKED" } : r
        )
      );
      setRevocationSuccess(true);
      setShowRevokeModal(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sourceUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetUser.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "sent") return matchesSearch && r.sourceUser.includes("أحمد عباس");
    if (activeTab === "received") return matchesSearch && r.targetUser.includes("أحمد عباس");
    if (activeTab === "in_progress") return matchesSearch && (r.status === "IN_PROGRESS" || r.status === "READY");
    if (activeTab === "revoked") return matchesSearch && r.status === "REVOKED";
    return matchesSearch;
  });

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                مركز تسليم العمل والمشاركة المشفرة (Sahm Share & Handoff)
              </h1>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
                PROMPT 22
              </span>
            </div>
            <p className="text-xs text-slate-400">
              نقل حالة المعالجة ومخرجات الـ OCR والمراجعات دون تكرار العمل، مع استئناف العمل فورياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/handoff/workspaces"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>مساحات العمل التشاركية (Workspaces)</span>
          </Link>

          <Link
            href="/handoff/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs transition shadow-lg shadow-cyan-900/20"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>تسليم عمل جديد (Hand Off Work)</span>
          </Link>
        </div>
      </header>

      {/* Revocation Banner if Triggered */}
      {revocationSuccess && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>تم إلغاء المشاركة بنجاح وإتلاف مفاتيح التشفير (Crypto-Shredding):</strong> لا يمكن للمستلم أو لأي جهة فك تشفير حزمة البيانات بعد الآن.
            </span>
          </div>
          <button
            onClick={() => setRevocationSuccess(false)}
            className="text-xs text-rose-400 hover:underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Core Institutional Axiom Callout */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>المبدأ الهندسي: شارك حالة العمل بالكامل، وليس مجرد ملفات (Share Work State)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  ZERO RE-PROCESSING GUARANTEE
                </span>
              </h3>
              <p className="text-slate-300 leading-relaxed">
                أي مسح أو تحسين أو استخراج نصوص (OCR) أو ربط بهوية طالب تم إنجازه مرة واحدة، لا يُعاد تنفيذه لمجرد انتقال المسؤولية لموظف آخر.
                الحزم المنقولة تحتوي الصور والبيانات المستخرجة ودرجات الثقة وحالات المراجعة، بحيث يبدأ المستلم مباشرة من أول عنصر قيد الانتظار.
              </p>
            </div>
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">إجمالي الشهادات المنقولة</span>
              <span className="text-cyan-400 bg-cyan-500/10 p-1.5 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-white font-mono">1,610</span>
              <span className="text-xs text-slate-400">شهادة</span>
            </div>
            <div className="text-[11px] text-emerald-400 pt-2 border-t border-slate-800/80 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% تطابق بصمات الـ SHA-256</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">حالات معالجة تم حفظها</span>
              <span className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
                <Check className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">1,070</span>
              <span className="text-xs text-slate-400">دون إعادة OCR</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
              <span>توفير وقت المعالجة:</span>
              <span className="font-mono text-cyan-400 font-bold">~14.2 ساعة</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">نقل محلي مباشر (Direct)</span>
              <span className="text-purple-400 bg-purple-500/10 p-1.5 rounded-lg">
                <Radio className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-white font-mono">2.8 GB</span>
              <span className="text-xs text-slate-400">وفر إنترنت السحابة</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
              <span>مصافحة أمنية:</span>
              <span className="font-mono text-emerald-400 font-bold">BLUE-ORBIT-27</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">التسليمات الجارية والنشطة</span>
              <span className="text-amber-400 bg-amber-500/10 p-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-amber-400 font-mono">2</span>
              <span className="text-xs text-slate-400">حزم قيد المراجعة</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
              <span>أجهزة موثوقة:</span>
              <span className="font-mono text-white">4 أجهزة مسجلة</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                activeTab === "all"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-slate-800/70 text-slate-300 hover:text-white"
              }`}
            >
              كافة التسليمات ({records.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                activeTab === "sent"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-slate-800/70 text-slate-300 hover:text-white"
              }`}
            >
              التي أرسلتها (Sent)
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                activeTab === "received"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-slate-800/70 text-slate-300 hover:text-white"
              }`}
            >
              الواردة إليّ (Received)
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                activeTab === "in_progress"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-slate-800/70 text-slate-300 hover:text-white"
              }`}
            >
              قيد العمل والاستئناف
            </button>
            <button
              onClick={() => setActiveTab("revoked")}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                activeTab === "revoked"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                  : "bg-slate-800/70 text-slate-300 hover:text-white"
              }`}
            >
              ملغاة (Revoked)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم التسليم أو الدفعة أو الموظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs w-64"
            />
          </div>
        </div>

        {/* Handoff Records Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>سجل حركات تسليم العمل (Handoff Ledger)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              عرض {filteredRecords.length} حركة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">رقم الحركة والنوع</th>
                  <th className="py-3 px-4">الدفعة والمسار</th>
                  <th className="py-3 px-4">أطراف التسليم</th>
                  <th className="py-3 px-4">تقدم العمل المنجز</th>
                  <th className="py-3 px-4">قناة النقل والأمان</th>
                  <th className="py-3 px-4">الحالة والصلاحية</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r) => {
                  const percentProcessed = Math.round(
                    (r.processedItems / r.totalItems) * 100
                  );

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-cyan-400 block">{r.transferId}</span>
                        <span className="text-[10px] text-slate-500">CONTINUE_WORK</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{r.batchName}</div>
                        <div className="text-[10px] text-slate-400">{r.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                        <div className="text-slate-300">
                          <span className="text-slate-500">من:</span> {r.sourceUser}
                        </div>
                        <div className="text-cyan-300 font-semibold">
                          <span className="text-slate-500">إلى:</span> {r.targetUser}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 w-48">
                        <div className="flex justify-between text-[10px] mb-1 font-mono">
                          <span className="text-emerald-400 font-bold">{r.processedItems} مكتمل</span>
                          <span className="text-amber-400">{r.needsReviewItems} مراجعة</span>
                          <span className="text-slate-400">{r.pendingItems} قيد الانتظار</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${percentProcessed}%` }}
                          />
                          <div
                            className="h-full bg-amber-500"
                            style={{
                              width: `${Math.round((r.needsReviewItems / r.totalItems) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 text-left mt-0.5 font-mono">
                          الإجمالي: {r.totalItems} شهادة ({percentProcessed}%)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.transferMethod === "DIRECT_LOCAL" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                              <Radio className="w-3 h-3" />
                              <span>نقل محلي مباشر</span>
                            </span>
                            {r.pairingPhrase && (
                              <div className="text-[10px] text-emerald-400 font-mono">
                                رمز: {r.pairingPhrase}
                              </div>
                            )}
                          </div>
                        ) : r.transferMethod === "CLOUD_STAGED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                            <Lock className="w-3 h-3" />
                            <span>سحابي مشفر (DEK)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                            <FileText className="w-3 h-3" />
                            <span>ملف .sahmpkg</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === "IN_PROGRESS" || r.status === "READY" ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
                              <Activity className="w-3 h-3 animate-pulse" />
                              <span>نشط للاستئناف</span>
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">{r.expiresIn}</div>
                          </div>
                        ) : r.status === "ACCEPTED" ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم الاستلام والمتابعة</span>
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full">
                              <ShieldAlert className="w-3 h-3" />
                              <span>ملغاة ومحطمة</span>
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/handoff/receive/${r.id}`}
                            className="px-2.5 py-1 bg-cyan-600/20 border border-cyan-600/40 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-[11px] font-semibold transition"
                            title="معاينة واستئناف العمل فورياً"
                          >
                            معاينة واستئناف
                          </Link>

                          {r.status !== "REVOKED" && (
                            <button
                              onClick={() => {
                                setSelectedHandoff(r);
                                setShowRevokeModal(true);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg text-[11px] transition"
                              title="إلغاء أمني فوري وإتلاف المفتاح"
                            >
                              إلغاء
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Emergency Revoke & Crypto-Shred Modal */}
      {showRevokeModal && selectedHandoff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-rose-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  إلغاء المشاركة وإتلاف مفاتيح التشفير (Crypto-Shredding)
                </h3>
                <p className="text-xs text-rose-400">
                  الإلغاء الفوري لحركة التسليم {selectedHandoff.transferId}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>الدفعة:</span>
                <span className="font-mono text-white font-bold">{selectedHandoff.batchName}</span>
              </div>
              <div className="flex justify-between">
                <span>المستلم:</span>
                <span className="text-cyan-300 font-bold">{selectedHandoff.targetUser}</span>
              </div>
              <div className="flex justify-between">
                <span>الإجراء الأمني:</span>
                <span className="text-rose-400 font-bold">إتلاف مفتاح فك التشفير (Destroy Wrapped DEK)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              وفق المعيار الأمني، بمجرد الإلغاء سيتم مسح مفتاح التشفير من الخادم فورياً؛ ولن يتمكن المستلم أو أي طرف ثالث من فك تشفير حزمة البيانات بعد الآن حتى لو كان الملف محفوظاً محلياً.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-lg shadow-rose-900/30"
              >
                تأكيد الإلغاء الفوري
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
