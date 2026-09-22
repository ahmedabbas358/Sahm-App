"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Copy,
  UserCheck,
  UserX,
  FileSpreadsheet,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Info,
  Layers,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface CertificateItem {
  id: string;
  sequence_number: number;
  client_item_id: string;
  state: "completed" | "needs_review" | "failed" | "skipped";
  image_path: string;
  thumbnail_path: string;
  quality_score: number;
  quality_category: "excellent" | "good" | "acceptable" | "poor" | "unusable";
  quality_metrics: {
    blur_score: number;
    brightness_score: number;
    contrast_score: number;
    glare_score: number;
    recommendations?: string[];
  };
  extracted_fields: {
    student_name: string;
    student_name_en: string;
    university_id: string;
    certificate_number: string;
    graduation_year: number;
    college: string;
    department: string;
    field_confidences?: Record<string, number>;
  };
  ocr_confidence: number;
  match_status: "exact" | "high_confidence" | "possible" | "no_match";
  match_confidence: number;
  suggested_student?: {
    id: string;
    name: string;
    university_id: string;
    college: string;
  } | null;
  duplicate_status: "no_duplicate" | "possible_duplicate" | "likely_duplicate";
  has_batch_mismatch: boolean;
  has_structural_anomaly: boolean;
  anomaly_reasons: string[];
}

export default function BatchReviewWorkspace() {
  const params = useParams();
  const sessionId = params.id as string;

  // Mock Session Items for prompt 17 demonstrating 100% of pipeline conditions:
  const [items, setItems] = useState<CertificateItem[]>([
    {
      id: "item-001",
      sequence_number: 1,
      client_item_id: "IMG_20260901_001",
      state: "completed",
      image_path: "/mock/cert_001.jpg",
      thumbnail_path: "/mock/cert_001_thumb.jpg",
      quality_score: 94.5,
      quality_category: "excellent",
      quality_metrics: {
        blur_score: 185.0,
        brightness_score: 168.0,
        contrast_score: 52.0,
        glare_score: 0.01,
      },
      extracted_fields: {
        student_name: "أحمد محمد عبد الله الشامي",
        student_name_en: "Ahmed Mohammed Abdullah Al-Shami",
        university_id: "2022101045",
        certificate_number: "CERT-2026-0045",
        graduation_year: 2026,
        college: "كلية الهندسة وتكنولوجيا المعلومات",
        department: "هندسة البرمجيات",
      },
      ocr_confidence: 0.96,
      match_status: "exact",
      match_confidence: 0.99,
      suggested_student: {
        id: "std-001",
        name: "أحمد محمد عبد الله الشامي",
        university_id: "2022101045",
        college: "كلية الهندسة وتكنولوجيا المعلومات",
      },
      duplicate_status: "no_duplicate",
      has_batch_mismatch: false,
      has_structural_anomaly: false,
      anomaly_reasons: [],
    },
    {
      id: "item-002",
      sequence_number: 2,
      client_item_id: "IMG_20260901_002",
      state: "needs_review",
      image_path: "/mock/cert_002.jpg",
      thumbnail_path: "/mock/cert_002_thumb.jpg",
      quality_score: 68.0,
      quality_category: "acceptable",
      quality_metrics: {
        blur_score: 92.0,
        brightness_score: 215.0,
        contrast_score: 38.0,
        glare_score: 0.14,
        recommendations: ["وهج ضوئي ملحوظ في الجزء العلوي الأيمن من الوثيقة"],
      },
      extracted_fields: {
        student_name: "سارة طارق إبراهيم الصالح",
        student_name_en: "Sara Tariq Ibrahim Al-Saleh",
        university_id: "2022101089",
        certificate_number: "CERT-2026-0089",
        graduation_year: 2025, // Batch mismatch!
        college: "كلية الهندسة وتكنولوجيا المعلومات",
        department: "علوم الحاسوب",
      },
      ocr_confidence: 0.88,
      match_status: "exact",
      match_confidence: 0.98,
      suggested_student: {
        id: "std-002",
        name: "سارة طارق إبراهيم الصالح",
        university_id: "2022101089",
        college: "كلية الهندسة وتكنولوجيا المعلومات",
      },
      duplicate_status: "no_duplicate",
      has_batch_mismatch: true,
      has_structural_anomaly: false,
      anomaly_reasons: [
        "سنة التخرج المستخرجة (2025) لا تطابق سنة الدفعة الرسمية المعتمدة (2026)",
      ],
    },
    {
      id: "item-003",
      sequence_number: 3,
      client_item_id: "IMG_20260901_003",
      state: "needs_review",
      image_path: "/mock/cert_003.jpg",
      thumbnail_path: "/mock/cert_003_thumb.jpg",
      quality_score: 89.0,
      quality_category: "good",
      quality_metrics: {
        blur_score: 160.0,
        brightness_score: 155.0,
        contrast_score: 48.0,
        glare_score: 0.02,
      },
      extracted_fields: {
        student_name: "خالد وليد منصور العريقي",
        student_name_en: "Khaled Waleed Mansour",
        university_id: "2022101112",
        certificate_number: "CERT-2026-0112",
        graduation_year: 2026,
        college: "كلية الهندسة وتكنولوجيا المعلومات",
        department: "نظم المعلومات",
      },
      ocr_confidence: 0.92,
      match_status: "possible",
      match_confidence: 0.76,
      suggested_student: {
        id: "std-003",
        name: "خالد وليد منصور",
        university_id: "2022101112",
        college: "كلية الهندسة وتكنولوجيا المعلومات",
      },
      duplicate_status: "likely_duplicate",
      has_batch_mismatch: false,
      has_structural_anomaly: false,
      anomaly_reasons: [
        "تكرار إدراكي dHash (مسافة هامنغ 2 bit) مع الشهادة رقم #1 في نفس الدفعة",
      ],
    },
    {
      id: "item-004",
      sequence_number: 4,
      client_item_id: "IMG_20260901_004",
      state: "needs_review",
      image_path: "/mock/cert_004.jpg",
      thumbnail_path: "/mock/cert_004_thumb.jpg",
      quality_score: 85.0,
      quality_category: "good",
      quality_metrics: {
        blur_score: 150.0,
        brightness_score: 170.0,
        contrast_score: 45.0,
        glare_score: 0.03,
      },
      extracted_fields: {
        student_name: "مروان عبد الحكيم قاسم",
        student_name_en: "Marwan Abdulhakeem Qasim",
        university_id: "2022101999",
        certificate_number: "CERT-2026-0999",
        graduation_year: 2026,
        college: "كلية الهندسة وتكنولوجيا المعلومات",
        department: "الذكاء الاصطناعي",
      },
      ocr_confidence: 0.94,
      match_status: "no_match",
      match_confidence: 0.12,
      suggested_student: null,
      duplicate_status: "no_duplicate",
      has_batch_mismatch: false,
      has_structural_anomaly: false,
      anomaly_reasons: [
        "طالب غير مسجل بقاعدة بيانات الطلاب الرسمية (Missing Student Candidate)",
      ],
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(1); // default to first review item
  const [activeBucket, setActiveBucket] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedItem = items[selectedIndex] || items[0];

  // Bucket Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeBucket === "all") return true;
      if (activeBucket === "needs_review") return item.state === "needs_review";
      if (activeBucket === "completed") return item.state === "completed";
      if (activeBucket === "duplicates") return item.duplicate_status !== "no_duplicate";
      if (activeBucket === "candidates") return item.match_status === "no_match";
      return true;
    });
  }, [items, activeBucket]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is typing in input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "ArrowDown" || e.key.toLowerCase() === "n") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "p") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleApproveMatch();
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleMarkDuplicate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items]);

  // Review Actions
  const handleApproveMatch = () => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === selectedIndex) {
          return {
            ...item,
            state: "completed",
            match_status: "exact",
            duplicate_status: "no_duplicate",
            has_batch_mismatch: false,
            has_structural_anomaly: false,
          };
        }
        return item;
      })
    );
    showToast(`تم اعتماد وتأكيد الشهادة #${selectedItem.sequence_number} بنجاح (سجل تدقيق محفوظ)`);
    // auto advance
    if (selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleMarkDuplicate = () => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === selectedIndex) {
          return { ...item, duplicate_status: "likely_duplicate" };
        }
        return item;
      })
    );
    showToast(`تم تثبيت حالة التكرار للشهادة #${selectedItem.sequence_number}`);
  };

  const handleAddCandidateAsStudent = () => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === selectedIndex) {
          return {
            ...item,
            state: "completed",
            match_status: "exact",
            suggested_student: {
              id: `std-new-${Date.now()}`,
              name: item.extracted_fields.student_name,
              university_id: item.extracted_fields.university_id,
              college: item.extracted_fields.college,
            },
            anomaly_reasons: [],
          };
        }
        return item;
      })
    );
    showToast(`تمت إضافة الطالب ${selectedItem.extracted_fields.student_name} رسمياً إلى سجلات الكلية!`);
  };

  const handleFieldChange = (field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === selectedIndex) {
          return {
            ...item,
            extracted_fields: {
              ...item.extracted_fields,
              [field]: value,
            },
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col h-screen overflow-hidden" dir="rtl">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/batch-scanner"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لقائمة الدفعات</span>
          </Link>

          <div className="h-4 w-px bg-slate-800"></div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                BATCH-2026-ENG-01
              </span>
              <h1 className="text-sm font-bold text-white">
                مساحة مراجعة وتدقيق الشهادات الجامعية
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              كلية الهندسة وتكنولوجيا المعلومات | دفعة 2026 | تقدم المعالجة: {items.filter(i => i.state === "completed").length} من أصل {items.length}
            </p>
          </div>
        </div>

        {/* Hotkey Guide & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
            <span className="text-teal-400 font-bold">Enter</span> اعتماد
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-bold">D</span> تكرار
            <span className="text-slate-600">|</span>
            <span className="text-blue-400 font-bold">N/P</span> تنقل
          </div>

          <button
            onClick={() => alert("جاري تنزيل ملف CSV المحدث مع بصمة التحقق UTF-8 BOM...")}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير كشف التدقيق (Excel)</span>
          </button>
        </div>
      </header>

      {/* 3-Pane Body Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* ========================================================= */}
        {/* PANE 1: Left Filmstrip & Bucket List (w-80) */}
        {/* ========================================================= */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          {/* Bucket Filters */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => setActiveBucket("all")}
                className={`px-2.5 py-1.5 rounded-lg text-center font-medium transition ${
                  activeBucket === "all"
                    ? "bg-slate-800 text-teal-400 border border-teal-500/30"
                    : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                الكل ({items.length})
              </button>
              <button
                onClick={() => setActiveBucket("needs_review")}
                className={`px-2.5 py-1.5 rounded-lg text-center font-medium transition ${
                  activeBucket === "needs_review"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-amber-400/80 hover:bg-amber-500/10"
                }`}
              >
                يحتاج تدقيق ({items.filter((i) => i.state === "needs_review").length})
              </button>
              <button
                onClick={() => setActiveBucket("duplicates")}
                className={`px-2.5 py-1.5 rounded-lg text-center font-medium transition ${
                  activeBucket === "duplicates"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-rose-400/80 hover:bg-rose-500/10"
                }`}
              >
                تكرارات ({items.filter((i) => i.duplicate_status !== "no_duplicate").length})
              </button>
              <button
                onClick={() => setActiveBucket("completed")}
                className={`px-2.5 py-1.5 rounded-lg text-center font-medium transition ${
                  activeBucket === "completed"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-emerald-400/80 hover:bg-emerald-500/10"
                }`}
              >
                معتمدة ({items.filter((i) => i.state === "completed").length})
              </button>
            </div>
          </div>

          {/* Filmstrip Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredItems.map((item, idx) => {
              const originalIndex = items.findIndex((i) => i.id === item.id);
              const isSelected = originalIndex === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(originalIndex)}
                  className={`p-3 rounded-xl cursor-pointer transition border text-right flex items-center gap-3 ${
                    isSelected
                      ? "bg-teal-950/40 border-teal-500/60 shadow-md ring-1 ring-teal-500/30"
                      : "border-transparent hover:bg-slate-800/60 hover:border-slate-700/60"
                  }`}
                >
                  {/* Sequence Number */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-slate-800 text-xs font-mono font-bold text-slate-300">
                    #{item.sequence_number}
                  </div>

                  {/* Thumbnail / Mock Icon */}
                  <div className="w-12 h-16 rounded-md bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-[9px] text-slate-500 shrink-0 relative overflow-hidden">
                    <ScanLine className="w-5 h-5 text-slate-600 mb-1" />
                    <span className="font-mono">{item.quality_score.toFixed(0)}%</span>
                    {item.has_batch_mismatch && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl"></div>
                    )}
                    {item.duplicate_status !== "no_duplicate" && (
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-rose-400 rounded-tr"></div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate block">
                        {item.extracted_fields.student_name || "اسم غير معروف"}
                      </span>
                      {item.state === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{item.extracted_fields.university_id || "رقم مفقود"}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          item.quality_score >= 85
                            ? "text-emerald-400 bg-emerald-500/10"
                            : item.quality_score >= 65
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {item.quality_category === "excellent" ? "ممتاز" : item.quality_category === "good" ? "جيد" : "مقبول"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* PANE 2: Center Visual Canvas & High-Res Inspection (flex-1) */}
        {/* ========================================================= */}
        <section className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
          {/* Canvas Controls Bar */}
          <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono text-slate-400">عنصر #{selectedItem.sequence_number}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">
                جودة الصورة: {selectedItem.quality_score.toFixed(1)}% (
                {selectedItem.quality_category === "excellent" ? "وضوح فائق" : selectedItem.quality_category === "good" ? "جيد جداً" : "مقبول"}
                )
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="تصغير"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-slate-400 text-[11px]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="تكبير"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="إعادة ضبط"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Workspace Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div
              className="transition-transform duration-200 shadow-2xl relative border-2 border-slate-700/80 rounded-lg overflow-hidden bg-slate-900"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                width: "560px",
                height: "400px",
              }}
            >
              {/* Synthetic Visual Certificate Replica */}
              <div className="w-full h-full p-6 flex flex-col justify-between bg-slate-900 text-slate-200 select-none border-4 border-double border-teal-500/20">
                {/* Header university banner */}
                <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                  <div className="text-[11px] tracking-wider text-slate-400 font-serif">الجمهورية اليمنية — وزارة التعليم العالي والبحث العلمي</div>
                  <div className="text-sm font-bold text-white font-serif">جامعة الإمام الشافعي — كلية الهندسة</div>
                  <div className="text-[11px] text-teal-400">قسم {selectedItem.extracted_fields.department || "هندسة البرمجيات"}</div>
                </div>

                {/* Certificate Core Text */}
                <div className="text-center space-y-2 py-4">
                  <div className="text-xs text-slate-400">يشهد عميد الكلية بأن الطالب / الطالبة:</div>
                  <div className="text-lg font-extrabold text-teal-300 font-serif tracking-wide border-b border-teal-500/20 pb-1 inline-block">
                    {selectedItem.extracted_fields.student_name || "اسم الطالب هنا"}
                  </div>
                  <div className="text-xs text-slate-400">
                    الرقم الجامعي: <span className="font-mono text-white">{selectedItem.extracted_fields.university_id || "2022XXXX"}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    قد منح درجة <span className="text-white font-bold">البكالوريوس</span> بتقدير ممتاز مع مرتبة الشرف، وذلك في دورة{" "}
                    <span className="font-mono text-teal-300">{selectedItem.extracted_fields.graduation_year}</span>.
                  </div>
                </div>

                {/* Footer Serial & Signatures */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>
                    <span>رقم الشهادة: </span>
                    <span className="font-mono text-white">{selectedItem.extracted_fields.certificate_number}</span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-400/80">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>وثيقة رسمية معتمدة</span>
                  </div>
                </div>
              </div>

              {/* Segmentation Bounding Overlay Highlight */}
              <div className="absolute inset-4 border border-teal-500/40 rounded pointer-events-none flex items-start justify-between p-2">
                <span className="text-[9px] bg-teal-500/20 text-teal-300 font-mono px-1.5 py-0.5 rounded border border-teal-500/30">
                  تجزئة الشهادة (ROI 98.4%)
                </span>
                <span className="text-[9px] bg-slate-900/80 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                  زاوية الميل: 0.2°
                </span>
              </div>
            </div>
          </div>

          {/* Quality Telemetry & Diagnostics HUD Bar */}
          <div className="border-t border-slate-800 bg-slate-900/90 px-6 py-3 shrink-0 flex items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500 block text-[10px]">التباين والوضوح (Variance)</span>
                <span className="font-mono font-semibold text-slate-200">
                  {selectedItem.quality_metrics.blur_score.toFixed(1)} px²
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">مستوى الإضاءة (Luminance)</span>
                <span className="font-mono font-semibold text-slate-200">
                  {selectedItem.quality_metrics.brightness_score.toFixed(1)} / 255
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">نسبة الوهج (Glare)</span>
                <span className="font-mono font-semibold text-slate-200">
                  {(selectedItem.quality_metrics.glare_score * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">دقة التعرف على الحروف (OCR)</span>
                <span className="font-mono font-semibold text-teal-400">
                  {(selectedItem.ocr_confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {selectedItem.quality_metrics.recommendations && selectedItem.quality_metrics.recommendations.length > 0 && (
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedItem.quality_metrics.recommendations[0]}</span>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANE 3: Right Field Correction & Identity Reconciliation (w-96) */}
        {/* ========================================================= */}
        <aside className="w-96 border-r border-slate-800 bg-slate-900/70 flex flex-col shrink-0 overflow-y-auto p-5 space-y-5">
          {/* Anomaly / Alert Banner */}
          {selectedItem.anomaly_reasons.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>تنبيه تدقيق أمني / هيكلي:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-300/90 pr-1">
                {selectedItem.anomaly_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Student Identity Reconciliation Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>مطابقة سجل الطالب الجامعي</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedItem.match_status === "exact"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : selectedItem.match_status === "possible"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {selectedItem.match_status === "exact"
                  ? "تطابق تام (100%)"
                  : selectedItem.match_status === "possible"
                  ? "تطابق محتمل"
                  : "غير موجود بالقاعدة"}
              </span>
            </div>

            {selectedItem.suggested_student ? (
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{selectedItem.suggested_student.name}</span>
                  <span className="text-[10px] text-teal-400 font-mono">ثقة {(selectedItem.match_confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>الرقم: {selectedItem.suggested_student.university_id}</span>
                  <span className="text-slate-500">{selectedItem.suggested_student.college}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <UserX className="w-4 h-4" />
                  <span>مرشح طالب مفقود (Candidate Isolation)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  لم يتم العثور على طالب يطابق هذه الوثيقة. لا يتم إدخال بيانات تلقائياً بدون قرارك البشري:
                </p>
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={handleAddCandidateAsStudent}
                    className="w-full text-center py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow"
                  >
                    إضافة كطالب جديد معتمد
                  </button>
                  <button
                    onClick={() => alert("البحث في قاعدة بيانات الطلاب للربط بسجل بديل...")}
                    className="w-full text-center py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                  >
                    ربط بسجل طالب موجود
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OCR Extracted Fields Form */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ScanLine className="w-4 h-4 text-teal-400" />
              <span>البيانات المستخرجة (قابل للتصحيح)</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم الطالب (عربي)</label>
                <input
                  type="text"
                  value={selectedItem.extracted_fields.student_name}
                  onChange={(e) => handleFieldChange("student_name", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={selectedItem.extracted_fields.student_name_en}
                  onChange={(e) => handleFieldChange("student_name_en", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">الرقم الجامعي</label>
                  <input
                    type="text"
                    value={selectedItem.extracted_fields.university_id}
                    onChange={(e) => handleFieldChange("university_id", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">رقم الشهادة</label>
                  <input
                    type="text"
                    value={selectedItem.extracted_fields.certificate_number}
                    onChange={(e) => handleFieldChange("certificate_number", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">سنة التخرج</label>
                  <input
                    type="number"
                    value={selectedItem.extracted_fields.graduation_year}
                    onChange={(e) => handleFieldChange("graduation_year", e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg bg-slate-800 border text-white focus:outline-none focus:border-teal-500 font-mono ${
                      selectedItem.has_batch_mismatch ? "border-amber-500 text-amber-300" : "border-slate-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">القسم / التخصص</label>
                  <input
                    type="text"
                    value={selectedItem.extracted_fields.department}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleApproveMatch}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              <span>اعتماد السجل والانتقال للتالي (Enter)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleMarkDuplicate}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs py-2 rounded-xl border border-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5 text-rose-400" />
                <span>تثبيت تكرار (D)</span>
              </button>

              <button
                onClick={() => {
                  showToast(`تم طلب إعادة فحص الوثيقة #${selectedItem.sequence_number}`);
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-xl border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>إعادة معالجة (R)</span>
              </button>
            </div>
          </div>

          {/* Navigation between items */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <button
              disabled={selectedIndex <= 0}
              onClick={() => setSelectedIndex((p) => Math.max(0, p - 1))}
              className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق (P)</span>
            </button>
            <span className="font-mono">
              {selectedIndex + 1} / {items.length}
            </span>
            <button
              disabled={selectedIndex >= items.length - 1}
              onClick={() => setSelectedIndex((p) => Math.min(items.length - 1, p + 1))}
              className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>التالي (N)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-teal-900/90 text-teal-100 border border-teal-500/50 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
