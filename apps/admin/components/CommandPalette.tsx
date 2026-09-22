"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Layers,
  ShieldCheck,
  Share2,
  FileSpreadsheet,
  FileCheck2,
  Cpu,
  CornerDownLeft,
  X,
  User,
  GraduationCap,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: "action-review",
      title: "طابور المراجعة العاجلة (Review Queue)",
      desc: "فتح السجلات المعلقة للتدقيق والاعتماد البشري",
      icon: FileCheck2,
      badge: "Needs Review",
      href: "/review",
    },
    {
      id: "action-scanner",
      title: "فاحص الدفعات المستمر (Batch Scanner)",
      desc: "مسح ومعالجة دفعات الشهادات (10-500+ شهادة)",
      icon: Layers,
      badge: "Batch",
      href: "/batch-scanner",
    },
    {
      id: "action-search",
      title: "البحث الشامل والمطابقة (Universal Search)",
      desc: "البحث بالاسم العربي، الرقم الجامعي، أو رقم الشهادة",
      icon: Search,
      badge: "Search",
      href: "/search",
    },
    {
      id: "action-handoff",
      title: "تسليم العمل واستئناف المعالجة (Sahm Handoff)",
      desc: "نقل الحزم المشفرة ومتابعة العمل بدون إعادة OCR",
      icon: Share2,
      badge: ".sahmpkg",
      href: "/handoff",
    },
    {
      id: "action-export",
      title: "استوديو القوالب والتصدير (Document Studio)",
      desc: "توليد كشوفات الخريجين الرسمية (PDF, XLSX, DOCX)",
      icon: FileSpreadsheet,
      badge: "Export",
      href: "/export-studio",
    },
    {
      id: "action-verify",
      title: "منظومة التحقق الرقمي والـ QR (Verification)",
      desc: "إدارة الهويات الرقمية وفحص وثائق التخرج الرسمية",
      icon: ShieldCheck,
      badge: "QR Security",
      href: "/verifications",
    },
    {
      id: "action-ai",
      title: "مركز حوكمة الذكاء الاصطناعي (AI Governance)",
      desc: "سجل النماذج، مقاييس CER/WER، وضوابط الخصوصية",
      icon: Cpu,
      badge: "Control Plane",
      href: "/ai-control",
    },
  ];

  const filtered = query.trim()
    ? quickActions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.desc.toLowerCase().includes(query.toLowerCase())
      )
    : quickActions;

  const navigateTo = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150" dir="rtl">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في السجلات، الشهادات، الدفعات، أو الإجراءات..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Action Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            الإجراءات السريعة والوحدات
          </div>
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.href)}
                  className="w-full text-right flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition group border border-transparent hover:border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-white flex items-center gap-2">
                        <span>{item.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                      {item.badge}
                    </span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              لم يتم العثور على إجراء أو سجل يطابق «{query}»
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 text-slate-300">
                ↵
              </kbd>{" "}
              للاختيار
            </span>
            <span>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 text-slate-300">
                ESC
              </kbd>{" "}
              للإغلاق
            </span>
          </div>
          <span>منظومة سهم المركزية</span>
        </div>
      </div>
    </div>
  );
}
