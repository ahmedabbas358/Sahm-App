"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  Download,
  Printer,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Building2,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";

interface VerificationItem {
  id: string;
  verification_code: string;
  student_name: string;
  university_id: string;
  faculty_name: string;
  certificate_type: string;
  status: "active" | "revoked" | "expired" | "replaced";
  privacy_profile: "public_minimal" | "public_standard" | "public_extended";
  issued_at: string;
  verification_count: number;
  qr_code_url: string;
  revocation_reason?: string;
}

export default function VerificationsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedItemForRevoke, setSelectedItemForRevoke] = useState<VerificationItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("administrative_correction");
  const [revokeNotes, setRevokeNotes] = useState("");

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("batch-2026-cs");

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyProfile, setPolicyProfile] = useState("public_standard");
  const [displayNameMode, setDisplayNameMode] = useState("full");
  const [showStudentId, setShowStudentId] = useState(false);

  // Mock list for demonstration
  const [items, setItems] = useState<VerificationItem[]>([
    {
      id: "v-01",
      verification_code: "7KX9-QM4P-82DZ",
      student_name: "أحمد عباس محمد إبراهيم",
      university_id: "202201048",
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      certificate_type: "بكالوريوس",
      status: "active",
      privacy_profile: "public_standard",
      issued_at: "2026-09-20 10:30",
      verification_count: 14,
      qr_code_url: "http://localhost:3000/v/7KX9-QM4P-82DZ",
    },
    {
      id: "v-02",
      verification_code: "4WB2-NP7R-91KC",
      student_name: "محمد أحمد عثمان إدريس",
      university_id: "002201052",
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      certificate_type: "بكالوريوس",
      status: "active",
      privacy_profile: "public_standard",
      issued_at: "2026-09-20 10:30",
      verification_count: 8,
      qr_code_url: "http://localhost:3000/v/4WB2-NP7R-91KC",
    },
    {
      id: "v-03",
      verification_code: "9MZ3-JH5V-62QA",
      student_name: "فاطمة الزهراء إدريس علي",
      university_id: "202201079",
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      certificate_type: "بكالوريوس",
      status: "active",
      privacy_profile: "public_standard",
      issued_at: "2026-09-20 10:30",
      verification_count: 22,
      qr_code_url: "http://localhost:3000/v/9MZ3-JH5V-62QA",
    },
    {
      id: "v-04",
      verification_code: "REVOKED-SAMPLE-01",
      student_name: "عثمان بابكر الشيخ حسن",
      university_id: "202100891",
      faculty_name: "كلية الطب والعلوم الصحية",
      certificate_type: "بكالوريوس",
      status: "revoked",
      privacy_profile: "public_minimal",
      issued_at: "2026-08-15 09:15",
      verification_count: 5,
      qr_code_url: "http://localhost:3000/v/REVOKED-SAMPLE-01",
      revocation_reason: "administrative_correction",
    },
    {
      id: "v-05",
      verification_code: "3TY8-LK2F-50XM",
      student_name: "سارة النور إبراهيم خليل",
      university_id: "202201103",
      faculty_name: "كلية الهندسة وتكنولوجيا المعلومات",
      certificate_type: "بكالوريوس",
      status: "active",
      privacy_profile: "public_standard",
      issued_at: "2026-09-21 14:00",
      verification_count: 3,
      qr_code_url: "http://localhost:3000/v/3TY8-LK2F-50XM",
    },
  ]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenRevoke = (item: VerificationItem) => {
    setSelectedItemForRevoke(item);
    setShowRevokeModal(true);
  };

  const handleConfirmRevoke = () => {
    if (!selectedItemForRevoke) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItemForRevoke.id
          ? { ...it, status: "revoked", revocation_reason: revokeReason }
          : it
      )
    );
    setShowRevokeModal(false);
    setSelectedItemForRevoke(null);
  };

  const handleBatchIssueConfirm = () => {
    alert("تم تفعيل إصدار هويات التحقق لجميع السجلات المعتمدة في الدفعة المحددة.");
    setShowBatchModal(false);
  };

  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.verification_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.student_name.includes(searchTerm) ||
      it.university_id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || it.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalIssued = items.length;
  const activeCount = items.filter((i) => i.status === "active").length;
  const revokedCount = items.filter((i) => i.status === "revoked").length;
  const totalScans = items.reduce((acc, i) => acc + i.verification_count, 0);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                منظومة التحقق الرقمي وهويات الـ QR
              </h1>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
                PROMPT 18
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة هويات الاعتماد، التصدير الطباعي، الرقابة على الخصوصية، والإلغاء الموثق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/verify"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>بوابة الفحص العامة</span>
          </Link>

          <button
            onClick={() => setShowPolicyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <span>سياسة الخصوصية</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إصدار جماعي للدفعة</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">إجمالي هويات التحقق</span>
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalIssued}</div>
            <div className="text-[11px] text-slate-400 mt-1">هوية رقمية صادرة رسمياً</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">شهادات نشطة سارية</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{activeCount}</div>
            <div className="text-[11px] text-emerald-500/80 mt-1">متاحة ومطابقة للسجلات</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">شهادات ملغاة / مستبدلة</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 tracking-tight">{revokedCount}</div>
            <div className="text-[11px] text-rose-500/80 mt-1">تظهر كملغاة عند الفحص</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">إجمالي عمليات الفحص</span>
              <QrCode className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400 tracking-tight">{totalScans}</div>
            <div className="text-[11px] text-slate-400 mt-1">مسح موثق عبر البوابة</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالرمز، اسم الطالب، الرقم الجامعي..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              {[
                { id: "all", label: "الكل" },
                { id: "active", label: "السارية" },
                { id: "revoked", label: "الملغاة" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    statusFilter === tab.id
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Export Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => window.open("http://localhost:8000/api/v1/verifications/batch/demo/print-sheet", "_blank")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>كشف ملصقات A4</span>
            </button>

            <button
              onClick={() => alert("جارٍ تنزيل حزمة رموز QR بصيغة ZIP مضغوطة...")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير حزمة QR (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">رمز التحقق الرقمي</th>
                  <th className="px-5 py-3.5">اسم الخريج / الرقم الجامعي</th>
                  <th className="px-5 py-3.5">الكلية والدرجة</th>
                  <th className="px-5 py-3.5">حالة الشهادة</th>
                  <th className="px-5 py-3.5">تاريخ الإصدار</th>
                  <th className="px-5 py-3.5">مرات الفحص</th>
                  <th className="px-5 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    {/* Verification Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold tracking-wider">
                          {item.verification_code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(item.verification_code)}
                          title="نسخ الرمز"
                          className="text-slate-400 hover:text-white transition"
                        >
                          {copiedCode === item.verification_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Base32 Entropy</div>
                    </td>

                    {/* Student Info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{item.student_name}</div>
                      <div className="font-mono text-[11px] text-slate-400">
                        الرقم: {item.university_id}
                      </div>
                    </td>

                    {/* College & Degree */}
                    <td className="px-5 py-4">
                      <div className="text-slate-300">{item.faculty_name}</div>
                      <div className="text-[11px] text-cyan-400">{item.certificate_type}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {item.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>سارية معتمدة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ملغاة</span>
                        </span>
                      )}
                    </td>

                    {/* Issued Date */}
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {item.issued_at}
                    </td>

                    {/* Verification Count */}
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[11px]">
                        {item.verification_count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/v/${item.verification_code}`}
                          target="_blank"
                          title="معاينة الصفحة العامة"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/verifications/${item.id}`}
                          title="تفاصيل وسجل التدقيق"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                        </Link>

                        {item.status === "active" && (
                          <button
                            onClick={() => handleOpenRevoke(item)}
                            title="إلغاء الشهادة"
                            className="p-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Revocation Modal */}
      {showRevokeModal && selectedItemForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إلغاء اعتماد الشهادة رسمياً</h3>
                <p className="text-xs text-slate-400">سيتم تغيير الحالة فوراً إلى ملغاة في صفحة التحقق العامة</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div><span className="text-slate-400">رمز التحقق:</span> <span className="font-mono text-cyan-400 font-bold">{selectedItemForRevoke.verification_code}</span></div>
              <div><span className="text-slate-400">اسم الخريج:</span> <span className="font-semibold text-white">{selectedItemForRevoke.student_name}</span></div>
              <div><span className="text-slate-400">الرقم الجامعي:</span> <span className="font-mono text-slate-300">{selectedItemForRevoke.university_id}</span></div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">سبب الإلغاء الإداري:</label>
              <select
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="administrative_correction">تصحيح إداري لبيانات السجل</option>
                <option value="reissued_certificate">استبدال شهادة بإصدار جديد محدث</option>
                <option value="duplicate_issuance">ازدواجية في الإصدار</option>
                <option value="record_correction">تصحيح تقدير أو درجة علمية</option>
                <option value="administrative_cancellation">إلغاء تنظيمي بقرار مجلس الكلية</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">ملاحظات الإلغاء والبيان العام:</label>
              <textarea
                value={revokeNotes}
                onChange={(e) => setRevokeNotes(e.target.value)}
                placeholder="توضيح مختصر لسبب الإلغاء يظهر في إفادة التحقق العامة..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30"
              >
                تأكيد الإلغاء النهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Issue Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إصدار هويات التحقق الرقمية لدفعة كاملة</h3>
                <p className="text-xs text-slate-400">توليد رموز Base32 وحزم QR لجميع الطلاب المعتمدين</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">اختر الدفعة الأكاديمية:</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="batch-2026-cs">دفعة علوم الحاسوب 2026 (الدور الأول - 72 طالب)</option>
                <option value="batch-2026-it">دفعة تقنية المعلومات 2026 (الدور الأول - 45 طالب)</option>
                <option value="batch-2026-med">دفعة الطب والجراحة 2026 (50 طالب)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>• سيتم تخطي السجلات التي صدرت لها هويات تحقق سارية مسبقاً لمنع التكرار.</p>
              <p>• رموز التحقق آمنة ولا يمكن تخمينها ومطبوعة وفق مواصفات هدوء QR Quiet Zone 4x.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleBatchIssueConfirm}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-900/30"
              >
                بدء التوليد والإصدار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Settings Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إعدادات سياسة الخصوصية والإفصاح العام</h3>
                <p className="text-xs text-slate-400">التحكم في الحقول المسموح بعرضها في صفحة التحقق للجمهور</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">مستوى الخصوصية (Privacy Profile):</label>
                <select
                  value={policyProfile}
                  onChange={(e) => setPolicyProfile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="public_minimal">إفصاح أدنى (Public Minimal) — اسم مختصر وكلية فقط</option>
                  <option value="public_standard">إفصاح قياسي (Public Standard) — اسم وتخصص وسنة تخرج</option>
                  <option value="public_extended">إفصاح موسع (Public Extended) — يتضمن مرتبة الشرف ورقم الطالب المرمّز</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">صيغة إظهار اسم الخريج:</label>
                <select
                  value={displayNameMode}
                  onChange={(e) => setDisplayNameMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="full">الاسم كاملاً (Full Name)</option>
                  <option value="abbreviated_middle">اختصار الأسماء الوسطى (أحمد م. ع. إبراهيم)</option>
                  <option value="first_last_only">الاسم الأول والأخير فقط (أحمد إبراهيم)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStudentId}
                    onChange={(e) => setShowStudentId(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500/20"
                  />
                  <span className="text-slate-300">إظهار آخر 3 أرقام من الرقم الجامعي (مرمّزاً: ***048)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
              >
                حفظ السياسة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
