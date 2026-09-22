"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import {
  Check,
  X,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Edit3,
  Copy,
  ArrowLeft,
  Layers,
  History,
} from "lucide-react";

interface QueueItem {
  id: string;
  sequence: number;
  studentNameAr: string;
  studentNameEn: string;
  universityId: string;
  college: string;
  specialization: string;
  graduationYear: number;
  confidence: number;
  reason: string;
  flag: "needs_review" | "low_confidence" | "possible_duplicate" | "mismatch";
  rawOcrName: string;
  matchedStudentName: string;
  certificateNumber: string;
}

export default function ReviewWorkspace() {
  const [items, setItems] = useState<QueueItem[]>([
    {
      id: "item-001",
      sequence: 1,
      studentNameAr: "أحمد بن علي العباسي",
      studentNameEn: "Ahmed Ali Al-Abbasi",
      universityId: "2026-IS-00184",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "نظم المعلومات الإدارية",
      graduationYear: 2026,
      confidence: 0.94,
      reason: "تطابق عالي مع سجل الطالب بالرقم الجامعي؛ اختلاف بسيط في همزة الاسم بالأصل الورقي",
      flag: "needs_review",
      rawOcrName: "احمد بن علي العباسي",
      matchedStudentName: "أحمد بن علي العباسي",
      certificateNumber: "CERT-2026-00184",
    },
    {
      id: "item-002",
      sequence: 2,
      studentNameAr: "إبراهيم خليل النور عثمان",
      studentNameEn: "Ibrahim Khalil Al-Noor",
      universityId: "2026-IS-00185",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "هندسة البرمجيات",
      graduationYear: 2026,
      confidence: 0.78,
      reason: "خط يدوي متداخل في حقل التخصص؛ يتطلب تأكيد المراجع",
      flag: "low_confidence",
      rawOcrName: "ابراهيم خليل النور",
      matchedStudentName: "إبراهيم خليل النور عثمان",
      certificateNumber: "CERT-2026-00185",
    },
    {
      id: "item-003",
      sequence: 3,
      studentNameAr: "آمنة الصادق المهدي",
      studentNameEn: "Amna Al-Sadiq Al-Mahdi",
      universityId: "2026-IS-00186",
      college: "كلية علوم الحاسوب وتكنولوجيا المعلومات",
      specialization: "تقنية المعلومات",
      graduationYear: 2026,
      confidence: 0.89,
      reason: "اشتباه تكرار: يوجد سجل سابق بنفس الاسم برقم جامعي مختلف بالدفعة السابقة",
      flag: "possible_duplicate",
      rawOcrName: "آمنة الصادق المهدي",
      matchedStudentName: "آمنة الصادق المهدي",
      certificateNumber: "CERT-2026-00186",
    },
    {
      id: "item-004",
      sequence: 4,
      studentNameAr: "عمر عبد الرحمن الشيخ",
      studentNameEn: "Omer Abdelrahman Al-Shaikh",
      universityId: "2026-IS-00187",
      college: "كلية العلوم الإدارية",
      specialization: "المحاسبة والتمويل",
      graduationYear: 2026,
      confidence: 0.96,
      reason: "شهادة منقولة من قسم المحاسبة إلى دفعة تقنية المعلومات",
      flag: "mismatch",
      rawOcrName: "عمر عبد الرحمن الشيخ",
      matchedStudentName: "عمر عبد الرحمن الشيخ",
      certificateNumber: "CERT-2026-00187",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentItem = items[currentIndex];

  const handleAccept = () => {
    setStatusMessage(`تم اعتماد شهادة: ${currentItem.studentNameAr}`);
    setIsAccepted(true);
    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsAccepted(false);
        setStatusMessage(null);
      }
    }, 800);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsAccepted(false);
      setStatusMessage(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsAccepted(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      <Navigation />

      {/* Action Sub-Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>بيئة المراجعة ثلاثية الأقسام (Evidence-First Review)</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400 font-mono">
            العنصر {currentIndex + 1} من {items.length}
          </span>
        </div>

        {/* Shortcuts helper */}
        <div className="hidden md:flex items-center gap-4 text-slate-400 text-[11px]">
          <span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">A</kbd>{" "}
            قبول واعتماد
          </span>
          <span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">C</kbd>{" "}
            تصحيح يدوي
          </span>
          <span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">J / K</kbd>{" "}
            التالي / السابق
          </span>
        </div>
      </div>

      {/* Main 3-Pane Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* PANE 1: Review Queue List (3 cols) */}
        <div className="lg:col-span-3 border-l border-slate-800 bg-slate-900/30 flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">طابور الحالات المعلقة</span>
            <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold">
              {items.length} بحاجة لإجراء
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {items.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsAccepted(false);
                    setStatusMessage(null);
                  }}
                  className={`w-full text-right p-3.5 transition flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-slate-800/90 border-r-2 border-teal-400 shadow-inner"
                      : "hover:bg-slate-850/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">
                      #{item.sequence} {item.studentNameAr}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        item.flag === "needs_review"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.flag === "low_confidence"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.flag === "possible_duplicate"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.flag === "needs_review" && "مراجعة"}
                      {item.flag === "low_confidence" && "ثقة منخفضة"}
                      {item.flag === "possible_duplicate" && "اشتباه تكرار"}
                      {item.flag === "mismatch" && "اختلاف دفعة"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{item.universityId}</span>
                    <span className="text-slate-500">الثقة: {Math.round(item.confidence * 100)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Document Evidence Viewer (5 cols) */}
        <div className="lg:col-span-5 border-l border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 25, 200))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="تكبير"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 25, 50))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="تصغير"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
              >
                {zoomLevel}%
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  showBoundingBoxes
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>صناديق الـ OCR</span>
              </button>
            </div>
          </div>

          {/* Document Canvas / Simulated Certificate Image */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/80 relative">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
              className="w-[480px] h-[340px] bg-amber-50 text-slate-900 rounded-lg shadow-2xl p-6 border-4 border-amber-200/80 relative transition-transform duration-150 flex flex-col justify-between select-none"
            >
              {/* Certificate Watermark Header */}
              <div className="text-center border-b-2 border-amber-900/20 pb-3">
                <div className="text-[11px] font-bold text-amber-950">جامعة إفريقيا العالمية</div>
                <div className="text-[9px] text-amber-800">أمانة الشؤون العلمية — إدارة الامتحانات والشهادات</div>
                <div className="text-base font-extrabold text-amber-950 mt-1">شهادة تخرج جامعية</div>
              </div>

              {/* Certificate Body with Bounding Boxes */}
              <div className="space-y-3 my-auto text-xs leading-relaxed text-amber-950">
                <div>
                  تشهد الجامعة بأن الطالب:
                  <div className="inline-block mx-1 font-bold text-sm relative">
                    <span>{currentItem.rawOcrName}</span>
                    {showBoundingBoxes && (
                      <span className="absolute -inset-1 border-2 border-teal-500 bg-teal-500/10 rounded pointer-events-none" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    الرقم الجامعي:
                    <span className="font-mono font-bold mr-1 relative inline-block">
                      {currentItem.universityId}
                      {showBoundingBoxes && (
                        <span className="absolute -inset-0.5 border border-cyan-500 bg-cyan-500/10 rounded pointer-events-none" />
                      )}
                    </span>
                  </div>
                  <div>
                    رقم الشهادة:
                    <span className="font-mono font-bold mr-1">{currentItem.certificateNumber}</span>
                  </div>
                </div>

                <div>
                  قد نال درجة{" "}
                  <span className="font-bold">{currentItem.specialization}</span> من{" "}
                  <span>{currentItem.college}</span> في دورة {currentItem.graduationYear}م.
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="border-t border-amber-900/20 pt-2 flex items-center justify-between text-[9px] text-amber-800">
                <div>حررت بتاريخ: 15 سبتمبر 2026م</div>
                <div className="font-mono">VERIFIED: {currentItem.certificateNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* PANE 3: Structured Data & Safe Actions (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/40 p-6 flex flex-col justify-between h-full overflow-y-auto space-y-6">
          <div className="space-y-5">
            {/* Status notification */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Header & Verification Reason */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                سبب المراجعة والتدقيق
              </div>
              <div className="mt-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{currentItem.reason}</div>
              </div>
            </div>

            {/* Field Comparison Table */}
            <div className="space-y-3 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                مقارنة الحقول المستخرجة مع السجل الرسمي
              </div>

              <div className="bg-slate-950/60 rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                {/* Field 1: Name */}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] text-slate-400">اسم الطالب (الرسمي المعتمد)</div>
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>{currentItem.matchedStudentName}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(currentItem.matchedStudentName)}
                      className="text-slate-400 hover:text-slate-200 p-1"
                      title="نسخ الاسم"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>المستخرج من OCR:</span>
                    <span className="font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {currentItem.rawOcrName}
                    </span>
                  </div>
                </div>

                {/* Field 2: University ID */}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] text-slate-400">الرقم الجامعي</div>
                  <div className="font-mono font-semibold text-slate-100 flex items-center justify-between">
                    <span>{currentItem.universityId}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      تطابق تام (Exact ID)
                    </span>
                  </div>
                </div>

                {/* Field 3: Academic Context */}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] text-slate-400">الكلية والتخصص</div>
                  <div className="text-slate-200 font-medium">{currentItem.college}</div>
                  <div className="text-slate-400 text-[11px]">{currentItem.specialization} — دفعة {currentItem.graduationYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: 1-Click Safe Operations */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAccept}
                disabled={isAccepted}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-950/50"
              >
                <Check className="w-4 h-4" />
                <span>قبول واعتماد</span>
              </button>

              <button
                onClick={() => alert(`فتح نافذة التصحيح اليدوي للسجل #${currentItem.sequence}`)}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition"
              >
                <Edit3 className="w-4 h-4 text-teal-400" />
                <span>تصحيح يدوي</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <span className="text-[11px] text-slate-500 font-mono">
                {currentIndex + 1} / {items.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
