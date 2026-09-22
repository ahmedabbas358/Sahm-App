"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Printer,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FolderArchive,
  RefreshCw,
  ExternalLink,
  History,
  Lock,
  Plus,
  Sparkles,
} from "lucide-react";

export default function ExportStudioPage() {
  const [activeTab, setActiveTab] = useState<"designer" | "center" | "batch">("designer");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "xlsx" | "docx" | "csv">("pdf");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"A4" | "A3" | "Letter">("A4");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<any>(null);

  // Table Designer Column Controls
  const [columns, setColumns] = useState([
    { key: "row_num", label: "#", width: 8, align: "center", visible: true },
    { key: "student_name", label: "اسم الطالب رباعياً", width: 44, align: "right", visible: true },
    { key: "university_id", label: "الرقم الجامعي", width: 24, align: "center", visible: true },
    { key: "specialization", label: "التخصص الأكاديمي", width: 24, align: "center", visible: true },
    { key: "phone", label: "رقم الهاتف (مقيد)", width: 20, align: "center", visible: false },
    { key: "notes", label: "ملاحظات إدارية", width: 25, align: "right", visible: false },
  ]);

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  // Sample approved records
  const sampleStudents = [
    { id: "202201048", name: "أحمد عباس محمد إبراهيم", spec: "علوم الحاسوب", status: "جاهزة للتسليم" },
    { id: "202201052", name: "محمد أحمد عثمان إدريس", spec: "نظم المعلومات", status: "جاهزة للتسليم" },
    { id: "202201079", name: "فاطمة الزهراء إدريس علي", spec: "تقنية المعلومات", status: "جاهزة للتسليم" },
    { id: "202201091", name: "عمر خالد محمود عبد الله", spec: "علوم الحاسوب", status: "معتمدة" },
    { id: "202201103", name: "سارة عبد الرحمن يوسف", spec: "الذكاء الاصطناعي", status: "جاهزة للتسليم" },
    { id: "202201115", name: "إبراهيم حسن علي عثمان", spec: "الأمن السيبراني", status: "جاهزة للتسليم" },
    { id: "202201128", name: "عثمان مصطفى أحمد صالح", spec: "علوم الحاسوب", status: "معتمدة" },
  ];

  // Recent Export History for Export Center
  const [artifacts, setArtifacts] = useState([
    {
      id: "art-01",
      docNumber: "CERT-2026-000184",
      title: "كشف الشهادات الجاهزة — كلية دراسات الحاسوب",
      format: "PDF",
      recordsCount: 125,
      version: 2,
      isCurrent: true,
      hash: "a4f89d3e871...b29c",
      createdDate: "2026-09-21 14:30",
      creator: "أحمد عباس (مسجل)",
    },
    {
      id: "art-02",
      docNumber: "CERT-2026-000183",
      title: "كشف الشهادات — نسخة المراجعة الأولية",
      format: "PDF",
      recordsCount: 125,
      version: 1,
      isCurrent: false,
      hash: "7bc32f910a1...e58d",
      createdDate: "2026-09-20 09:15",
      creator: "أحمد عباس (مسجل)",
      supersededReason: "تصحيح حرف في اسم أحد الخريجين",
    },
    {
      id: "art-03",
      docNumber: "ADMIN-XLSX-2026-44",
      title: "المصنف الإداري المتكامل — كلية الهندسة",
      format: "XLSX",
      recordsCount: 238,
      version: 1,
      isCurrent: true,
      hash: "991e2b40ff2...001a",
      createdDate: "2026-09-21 11:20",
      creator: "محمد عثمان (رئيس قسم الامتحانات)",
    },
  ]);

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const newDoc = {
        id: `art-${Date.now()}`,
        docNumber: `CERT-2026-000${Math.floor(Math.random() * 900 + 100)}`,
        title: `كشف الشهادات الجاهزة — كلية الحاسوب (${format.toUpperCase()})`,
        format: format.toUpperCase(),
        recordsCount: 125,
        version: 1,
        isCurrent: true,
        hash: "e3b0c44298f...7c89",
        createdDate: "الآن",
        creator: "أنت (مسؤول النظام)",
      };
      setArtifacts([newDoc, ...artifacts]);
      alert(`تم بنجاح توليد الملف بصيغة ${format.toUpperCase()} والتحقق من النزاهة الرقمية والتشفير!`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shadow-lg shadow-teal-500/5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">سهم | Export & Document Studio</h1>
                <span className="text-xs bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-mono">
                  Section 27
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                منظومة بناء القوالب، التوليد الاحترافي للوثائق، والتحقق الرقمي عبر QR
              </p>
            </div>
          </div>

          {/* Subsystem Navigation Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("designer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "designer"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>مصمم القوالب (Designer)</span>
            </button>
            <button
              onClick={() => setActiveTab("center")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "center"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>مركز التصدير (Export Center)</span>
              <span className="bg-slate-800 text-teal-400 text-xs px-2 py-0.5 rounded-full font-mono">
                {artifacts.length}
              </span>
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>التصدير المجمع (Batch ZIP)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "designer" && (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1800px] mx-auto">
          {/* Left Column: Layout & Table Controls */}
          <div className="xl:col-span-3 space-y-5">
            {/* Page & Format Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>إعدادات الصفحة والصيغة</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">صيغة التصدير الرئيسية</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pdf", label: "PDF رسمي", icon: FileText },
                      { id: "xlsx", label: "Excel حقيقي", icon: FileSpreadsheet },
                      { id: "docx", label: "Word تقرير", icon: FileText },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                          selectedFormat === fmt.id
                            ? "bg-teal-500/10 border-teal-500 text-teal-300 shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850"
                        }`}
                      >
                        <fmt.icon className="w-4 h-4" />
                        <span>{fmt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">حجم الورق</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="A4">A4 (قياسي)</option>
                      <option value="A3">A3 (عريض)</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">الاتجاه</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="portrait">رأسي (Portrait)</option>
                      <option value="landscape">أفقي (Landscape)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Designer & Column Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>مصمم الجدول والأعمدة</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {columns.filter((c) => c.visible).length} أعمدة
                </span>
              </div>

              <div className="space-y-2">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      col.visible
                        ? "bg-slate-950 border-slate-700 text-white"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-teal-500 focus:ring-0"
                      />
                      <span className="font-medium">{col.label}</span>
                    </div>
                    {col.key === "phone" && (
                      <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        حظر النشر
                      </span>
                    )}
                    {col.visible && col.key !== "phone" && (
                      <span className="text-[10px] text-teal-400 font-mono">ظاهر</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-teal-500" />
                  <span>تكرار رأس الجدول في كل صفحة (Smart Pagination)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-teal-500" />
                  <span>تلوين الصفوف بالتناوب (Zebra Striping)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 text-teal-500" />
                  <span>منع انقسام اسم الطالب بين صفحتين</span>
                </label>
              </div>
            </div>

            {/* Dynamic Expression Fields Palette */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>الحقول الديناميكية الآمنة</span>
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                تُستبدل تلقائياً ببيانات الكلية الحقيقية دون إدخال كود برمجي:
              </p>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {[
                  "{{ university.name }}",
                  "{{ college.name }}",
                  "{{ batch.year }}",
                  "{{ records.count }}",
                  "{{ page.number }}",
                  "{{ approved_by }}",
                ].map((field) => (
                  <span
                    key={field}
                    className="bg-slate-950 border border-slate-800 text-teal-300 px-2 py-1 rounded-md cursor-copy hover:border-teal-500/50 transition"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Live Document Preview Canvas */}
          <div className="xl:col-span-6 flex flex-col items-center">
            {/* Canvas Toolbar */}
            <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Eye className="w-4 h-4 text-teal-400" />
                <span className="font-semibold">المعاينة الحية للمستند</span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[11px]">
                  {orientation === "portrait" ? "رأسي A4" : "أفقي A4"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="disabled:opacity-40 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-slate-300 px-1">
                    صفحة {currentPage} من 3
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                    disabled={currentPage === 3}
                    className="disabled:opacity-40 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                    className="p-1 hover:text-white"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-300">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1 hover:text-white"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Printed Paper Container */}
            <div
              className={`bg-white text-slate-900 rounded-lg shadow-2xl p-8 transition-all overflow-hidden border border-slate-700/50 ${
                orientation === "portrait" ? "w-full max-w-[620px] min-h-[860px]" : "w-full max-w-[860px] min-h-[620px]"
              }`}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              {/* Paper Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">جامعة إفريقيا العالمية</h3>
                  <div className="text-[10px] text-slate-500 font-sans tracking-wide">
                    International University of Africa
                  </div>
                  <div className="text-xs font-semibold text-teal-800 mt-1">
                    كلية دراسات الحاسوب — قسم علوم الحاسوب
                  </div>
                </div>
                <div className="text-left font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold">
                    CERT-2026-000184
                  </div>
                  <div>التاريخ: 2026/09/22</div>
                  <div>الدفعة: 2026</div>
                </div>
              </div>

              {/* Title Banner */}
              <div className="bg-slate-900 text-white rounded p-3 mb-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">كشف الشهادات الجاهزة للتسليم</div>
                  <div className="text-[10px] text-slate-300">
                    كشف معتمد صادر من عمادة القبول والتسجيل
                  </div>
                </div>
                <div className="bg-teal-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  عدد الطلاب: {sampleStudents.length}
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-[11px] border-collapse mb-6">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {columns
                      .filter((c) => c.visible)
                      .map((c) => (
                        <th
                          key={c.key}
                          className="py-2 px-2 border border-slate-900"
                          style={{ textAlign: c.align as any, width: `${c.width}%` }}
                        >
                          {c.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleStudents.map((st, i) => (
                    <tr
                      key={st.id}
                      className={`border-b border-slate-200 ${
                        i % 2 === 1 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {columns.find((c) => c.key === "row_num")?.visible && (
                        <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-100">
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </td>
                      )}
                      {columns.find((c) => c.key === "student_name")?.visible && (
                        <td className="py-2 px-2 text-right font-medium text-slate-900">
                          {st.name}
                        </td>
                      )}
                      {columns.find((c) => c.key === "university_id")?.visible && (
                        <td className="py-2 px-2 text-center font-mono font-bold text-teal-800 bg-teal-50/50 rounded">
                          {st.id}
                        </td>
                      )}
                      {columns.find((c) => c.key === "specialization")?.visible && (
                        <td className="py-2 px-2 text-center text-slate-700">
                          {st.spec}
                        </td>
                      )}
                      {columns.find((c) => c.key === "phone")?.visible && (
                        <td className="py-2 px-2 text-center text-red-600 font-mono">
                          +249912345678
                        </td>
                      )}
                      {columns.find((c) => c.key === "notes")?.visible && (
                        <td className="py-2 px-2 text-right text-slate-500">
                          سجل معتمد
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 text-center mt-8 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-800">مسجل الكلية</div>
                  <div className="mt-8 border-b border-dotted border-slate-400"></div>
                  <div className="text-[10px] text-slate-500 mt-1">التوقيع والختم</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">رئيس قسم الامتحانات</div>
                  <div className="mt-8 border-b border-dotted border-slate-400"></div>
                  <div className="text-[10px] text-slate-500 mt-1">المطابقة والاعتماد</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">عميد الكلية</div>
                  <div className="mt-8 border-b border-dotted border-slate-400"></div>
                  <div className="text-[10px] text-slate-500 mt-1">الاعتماد النهائي</div>
                </div>
              </div>

              {/* Footer with Verification QR */}
              <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600">
                <div className="max-w-[70%] leading-relaxed">
                  <b>ملاحظة رسمية:</b> هذا الكشف وثيقة أصلية معتمدة. للتأكد من عدم التلاعب، يمكن مسح رمز التحقق الرقمي المرفق.
                </div>
                <div
                  onClick={() => setShowVerifyModal(true)}
                  className="flex items-center gap-2 bg-slate-100 p-1.5 rounded border border-slate-200 cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition"
                  title="انقر لمعاينة صفحة التحقق العامة"
                >
                  <div className="text-[9px] font-mono text-left">
                    <b>VERIFIED</b><br />
                    ID: VRF-991204
                  </div>
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pre-flight Validation & Export Actions */}
          <div className="xl:col-span-3 space-y-5">
            {/* Pre-flight Validation Report */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>فحص الجاهزية والنزاهة (Validation)</span>
                </h2>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  جاهز للتصدير
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">سلامة واكتمال السجلات:</span>
                    <p className="text-[11px] text-emerald-400/80">جميع السجلات معتمدة رسمياً ولا توجد حقول أسماء فارغة.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">الأرقام الجامعية (Bidi & String):</span>
                    <p className="text-[11px] text-emerald-400/80">لا توجد أرقام مكررة، ومحفوظة كنصوص صريحة لمنع التشويه.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">حماية الخصوصية (Privacy Guard):</span>
                    <p className="text-[11px] text-emerald-400/80">القالب محمي؛ لا يحتوي على هواتف أو ملاحظات سرية للطلاب.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">الترقيم الذكي (Smart Pagination):</span>
                    <p className="text-[11px] text-emerald-400/80">تكرار الترويسة مفعل مع منع انقسام أي صف بين الصفحات.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Generation Triggers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-white mb-2">توليد الوثيقة الرسمية</h2>

              <button
                onClick={() => handleExport(selectedFormat)}
                disabled={isExporting}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد والتحقق الرقمي...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>تصدير فوري ({selectedFormat.toUpperCase()})</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleExport("xlsx")}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel متعدد الأوراق</span>
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Word تقرير</span>
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition font-medium"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>الطباعة المباشرة (Native Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Center View */}
      {activeTab === "center" && (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">مركز التصدير وسجل الوثائق الرسمية</h2>
              <p className="text-xs text-slate-400">
                أرشيف الكشوفات الصادرة، تتبع الإصدارات (Versioning)، ومطابقة البصمة الرقمية (SHA-256)
              </p>
            </div>
            <button
              onClick={() => setActiveTab("designer")}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء تصدير جديد</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">رقم الوثيقة</th>
                  <th className="py-3 px-4">عنوان الكشف / المستند</th>
                  <th className="py-3 px-4 text-center">الصيغة</th>
                  <th className="py-3 px-4 text-center">السجلات</th>
                  <th className="py-3 px-4 text-center">الإصدار</th>
                  <th className="py-3 px-4">المنشئ والتاريخ</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {artifacts.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                      {doc.docNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{doc.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>SHA-256: {doc.hash}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                        {doc.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {doc.recordsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {doc.isCurrent ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          v{doc.version} — الحالي
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          v{doc.version} — مستبدل
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{doc.creator}</div>
                      <div className="text-[10px] text-slate-500">{doc.createdDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => alert(`جاري تنزيل الملف ${doc.docNumber}...`)}
                          className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition"
                          title="تنزيل الملف"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAuditDoc(doc);
                            setShowAuditModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                          title="سجل التدقيق والإصدارات"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Export Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-amber-400" />
              <span>التصدير المجمع لكليات الجامعة (Batch Export)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              حدد الكليات المراد استخراج كشوفاتها دفعة واحدة وتحزيمها في ملف ZIP مع تقرير إحصائي موثق:
            </p>

            <div className="space-y-2 mb-5">
              {[
                { name: "كلية دراسات الحاسوب", count: 125 },
                { name: "كلية الهندسة", count: 238 },
                { name: "كلية الاقتصاد والعلوم السياسية", count: 412 },
                { name: "كلية الطب والعلوم الصحية", count: 194 },
                { name: "كلية التربية", count: 315 },
              ].map((c) => (
                <label
                  key={c.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 text-teal-500" />
                    <span className="font-semibold text-white">{c.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{c.count} طالب</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  alert("تم بدء مهمة التصدير المجمع في الخلفية! سيتم تنزيل ملف ZIP عند اكتمال المعالجة.");
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>توليد الكل وتحزيم ZIP (1,284 طالب)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Public Verification Preview Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">بوابة التحقق الرسمية المعتمدة</h3>
            <p className="text-xs text-slate-400 mb-5">
              هذه الصفحة تظهر للجهة الخارجية عند مسح رمز الـ QR دون كشف أي بيانات شخصية حساسة:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-right space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">حالة المستند:</span>
                <span className="font-bold text-emerald-400">معتمد ورسمي (Verified)</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">الجهة المصدرة:</span>
                <span className="font-semibold text-white">جامعة إفريقيا العالمية</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">الكلية:</span>
                <span className="text-slate-200">كلية دراسات الحاسوب</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">رقم الكشف:</span>
                <span className="font-mono text-teal-400">CERT-2026-000184</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">تاريخ الإصدار:</span>
                <span className="text-slate-300">22 سبتمبر 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الطلاب بالكشف:</span>
                <span className="font-bold text-white">125 طالباً وطالبة</span>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
            >
              إغلاق نافذة المعاينة
            </button>
          </div>
        </div>
      )}

      {/* Document Audit & Version Lineage Modal */}
      {showAuditModal && selectedAuditDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" />
              <span>سجل التدقيق والنزاهة الرقمية</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              المستند: {selectedAuditDoc.docNumber}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3 mb-5">
              <div>
                <span className="text-slate-400 block text-[11px]">البصمة المشفرة المسجلة (SHA-256):</span>
                <code className="text-teal-400 font-mono text-[10px] break-all">
                  {selectedAuditDoc.hash}991823ab1104e76d
                </code>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-850">
                <div>
                  <span className="text-slate-400 block text-[11px]">حالة التطابق المادي:</span>
                  <span className="text-emerald-400 font-bold">مطابق بنسبة 100% (لم يُعدل)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">رقم الإصدار:</span>
                  <span className="text-white font-bold">الإصدار {selectedAuditDoc.version}</span>
                </div>
              </div>
              {selectedAuditDoc.supersededReason && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <b>سبب الاستبدال:</b> {selectedAuditDoc.supersededReason}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
