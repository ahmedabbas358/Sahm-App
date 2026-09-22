"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import ContextPanel, { RecordProvenance } from "@/components/ContextPanel";
import {
  Search,
  User,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

export default function UniversalSearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "students" | "batches" | "certificates" | "exports">("all");
  const [selectedRecord, setSelectedRecord] = useState<RecordProvenance | null>(null);

  // Mock comprehensive dataset illustrating normalized Arabic search
  const records = [
    {
      id: "rec-001",
      studentName: "أحمد بن علي العباسي",
      studentNameRaw: "احمد بن علي العباسي",
      universityId: "2026-IS-00184",
      certificateNumber: "CERT-2026-00184",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "نظم المعلومات الإدارية",
      graduationYear: 2026,
      status: "approved",
      confidenceName: 0.98,
      sourceFile: "دفعة_امتحانات_2026.pdf",
      sourcePage: 14,
      sourceRow: 3,
      verificationCode: "7KX9-QM4P-82DZ",
    },
    {
      id: "rec-002",
      studentName: "إبراهيم خليل النور عثمان",
      studentNameRaw: "ابراهيم خليل النور",
      universityId: "2026-IS-00185",
      certificateNumber: "CERT-2026-00185",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "هندسة البرمجيات",
      graduationYear: 2026,
      status: "needs_review",
      confidenceName: 0.84,
      sourceFile: "دفعة_امتحانات_2026.pdf",
      sourcePage: 14,
      sourceRow: 4,
      verificationCode: "9WF4-KL2A-18NX",
    },
    {
      id: "rec-003",
      studentName: "آمنة الصادق المهدي",
      studentNameRaw: "امنة الصادق المهدي",
      universityId: "2026-IS-00186",
      certificateNumber: "CERT-2026-00186",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "تقنية المعلومات",
      graduationYear: 2026,
      status: "approved",
      confidenceName: 0.99,
      sourceFile: "دفعة_امتحانات_2026.pdf",
      sourcePage: 15,
      sourceRow: 1,
      verificationCode: "3MN8-PQ9R-44TK",
    },
    {
      id: "rec-004",
      studentName: "عمر عبد الرحمن الشيخ",
      studentNameRaw: "عمر عبدالرحمن الشيخ",
      universityId: "2026-IS-00187",
      certificateNumber: "CERT-2026-00187",
      college: "كلية العلوم الإدارية",
      specialization: "المحاسبة والتمويل",
      graduationYear: 2026,
      status: "cert_ready",
      confidenceName: 0.95,
      sourceFile: "دفعة_محاسبة_2026.pdf",
      sourcePage: 8,
      sourceRow: 6,
      verificationCode: "5XZ2-BC7V-91LA",
    },
    {
      id: "rec-005",
      studentName: "فاطمة الزهراء عثمان مصطفى",
      studentNameRaw: "فاطمة الزهراء عثمان مصطفى",
      universityId: "2026-IS-00188",
      certificateNumber: "CERT-2026-00188",
      college: "كلية الهندسة والعمارة",
      specialization: "الهندسة المدنية",
      graduationYear: 2026,
      status: "approved",
      confidenceName: 0.97,
      sourceFile: "دفعة_هندسة_2026.pdf",
      sourcePage: 2,
      sourceRow: 5,
      verificationCode: "8RT1-GH5Y-63WE",
    },
  ];

  const normalize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ")
      .trim();

  const filtered = query.trim()
    ? records.filter((r) => {
        const nq = normalize(query);
        return (
          normalize(r.studentName).includes(nq) ||
          r.universityId.toLowerCase().includes(query.toLowerCase()) ||
          (r.certificateNumber && r.certificateNumber.toLowerCase().includes(query.toLowerCase())) ||
          (r.verificationCode && r.verificationCode.toLowerCase().includes(query.toLowerCase())) ||
          normalize(r.college).includes(nq) ||
          normalize(r.specialization).includes(nq)
        );
      })
    : records;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      <Navigation />

      <main className="max-w-6xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Search Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Search className="w-5 h-5 text-teal-400" />
            <span>البحث الشامل والمطابقة الرقمية (Unified Search)</span>
          </h1>
          <p className="text-xs text-slate-400">
            بحث متوازي معزول الصلاحيات مع تطبيع متقدم للأسماء العربية والأرقام الجامعية ورموز التحقق.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم العربي، الإنجليزي، الرقم الجامعي (2026-IS-...)، أو رمز التحقق..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-lg"
          />
        </div>

        {/* Entity Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "الكل", count: filtered.length },
              { id: "students", label: "الطلاب", count: filtered.length },
              { id: "batches", label: "الدفعات", count: 4 },
              { id: "certificates", label: "الشهادات", count: filtered.length },
              { id: "exports", label: "المشاريع والقوالب", count: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-850 px-1.5 py-0.2 rounded">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {filtered.length} نتيجة مطابقة
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">اسم الطالب (المعتمد)</th>
                <th className="p-3.5">الرقم الجامعي</th>
                <th className="p-3.5">الكلية والتخصص</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">رمز التحقق</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRecord(r)}
                  className="hover:bg-slate-800/50 cursor-pointer transition group"
                >
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100 group-hover:text-teal-400 transition">
                      {r.studentName}
                    </div>
                    {r.studentNameRaw !== r.studentName && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        الأصل: {r.studentNameRaw}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300 font-medium">
                    {r.universityId}
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-200 font-medium">{r.specialization}</div>
                    <div className="text-[10px] text-slate-400">{r.college} • {r.graduationYear}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        r.status === "approved" || r.status === "cert_ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {r.status === "approved" && "معتمد"}
                      {r.status === "cert_ready" && "الشهادة جاهزة"}
                      {r.status === "needs_review" && "بحاجة لمراجعة"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {r.verificationCode || "—"}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(r);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="عرض التفاصيل والأصل"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Side Context Panel Drawer */}
      <ContextPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
