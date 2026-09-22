"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Server,
  ShieldCheck,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RotateCcw,
  Sparkles,
  Award,
  Calendar,
  Layers,
} from "lucide-react";

interface ModelRecord {
  id: string;
  name: string;
  model_identifier: string;
  capability: string;
  version: string;
  status: "draft" | "evaluating" | "approved" | "active" | "disabled" | "deprecated";
  is_champion: boolean;
  provider: string;
  privacy: string;
  cer: number;
  exact_match: number;
  released_at: string;
}

export default function AIModelsRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [capabilityFilter, setCapabilityFilter] = useState("all");

  const [models, setModels] = useState<ModelRecord[]>([
    {
      id: "m-01",
      name: "Tesseract Arabic OCR Engine",
      model_identifier: "sahm-ocr-printed-v2",
      capability: "نصوص مطبوعة (Text OCR)",
      version: "v2.0.0",
      status: "active",
      is_champion: true,
      provider: "Local (On-Premise)",
      privacy: "STRICT_LOCAL",
      cer: 0.021,
      exact_match: 0.965,
      released_at: "2026-08-10",
    },
    {
      id: "m-02",
      name: "Arabic Handwriting Vision Transformer",
      model_identifier: "sahm-arabic-handwriting-v2",
      capability: "خط اليد العربي (Handwriting)",
      version: "v2.1.0",
      status: "active",
      is_champion: true,
      provider: "Self-Hosted GPU",
      privacy: "STRICT_LOCAL",
      cer: 0.048,
      exact_match: 0.912,
      released_at: "2026-09-01",
    },
    {
      id: "m-03",
      name: "Multi-signal Identity & Duplicate Matcher",
      model_identifier: "sahm-identity-matcher-v1",
      capability: "مطابقة الهويات والتكرارات",
      version: "v1.5.0",
      status: "active",
      is_champion: true,
      provider: "Local Deterministic",
      privacy: "STRICT_LOCAL",
      cer: 0.000,
      exact_match: 0.998,
      released_at: "2026-07-20",
    },
    {
      id: "m-04",
      name: "NextGen Arabic Vision Transformer Candidate",
      model_identifier: "sahm-ocr-vision-v3-candidate",
      capability: "نصوص مطبوعة (Text OCR)",
      version: "v3.0.0-rc1",
      status: "evaluating",
      is_champion: false,
      provider: "Self-Hosted GPU",
      privacy: "STRICT_LOCAL",
      cer: 0.014,
      exact_match: 0.982,
      released_at: "— (تحت التقييم)",
    },
    {
      id: "m-05",
      name: "Legacy CRNN Arabic Handwriting",
      model_identifier: "sahm-ar-handwriting-v1",
      capability: "خط اليد العربي (Handwriting)",
      version: "v1.0.0",
      status: "deprecated",
      is_champion: false,
      provider: "Local (On-Premise)",
      privacy: "STRICT_LOCAL",
      cer: 0.089,
      exact_match: 0.825,
      released_at: "2026-03-15",
    },
  ]);

  const filtered = models.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model_identifier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchQuery;
  });

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
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                سجل نماذج الذكاء الاصطناعي والإصدارات الثابتة
              </h1>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
                Model Registry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة النماذج المعتمدة، تجميد الإصدارات المنشورة، وضمان عدم التعديل العشوائي في الإنتاج
            </p>
          </div>
        </div>

        <Link
          href="/ai-control/benchmark"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>مختبر التقييم والمقارنة</span>
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم النموذج أو المعرف..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>قاعدة الثبات: النماذج المنشورة غير قابلة للتعديل (Immutable Releases)</span>
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">اسم ومعرف النموذج</th>
                  <th className="px-5 py-3.5">القدرة والنوع</th>
                  <th className="px-5 py-3.5">الإصدار</th>
                  <th className="px-5 py-3.5">الحالة في الإنتاج</th>
                  <th className="px-5 py-3.5">بيئة المعالجة</th>
                  <th className="px-5 py-3.5">دقة الحقول (Exact)</th>
                  <th className="px-5 py-3.5">معدل CER</th>
                  <th className="px-5 py-3.5">تاريخ الإطلاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.is_champion && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                            CHAMPION
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-cyan-400 text-[11px] mt-0.5">
                        {m.model_identifier}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {m.capability}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-200">
                      {m.version}
                    </td>

                    <td className="px-5 py-4">
                      {m.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>نشط (Active)</span>
                        </span>
                      ) : m.status === "evaluating" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Sparkles className="w-3 h-3" />
                          <span>قيد التقييم (Challenger)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <span>متقاعد (Deprecated)</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-200">{m.provider}</div>
                      <div className="text-[10px] text-purple-400 font-mono">{m.privacy}</div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                      {(m.exact_match * 100).toFixed(1)}%
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-300">
                      {(m.cer * 100).toFixed(2)}%
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                      {m.released_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
