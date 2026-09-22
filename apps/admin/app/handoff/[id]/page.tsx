"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Clock,
  Radio,
  FileText,
  User,
  Laptop,
  Check,
  Lock,
  Layers,
} from "lucide-react";

export default function HandoffChainOfCustodyPage() {
  const params = useParams();
  const id = params?.id || "hnd-001";

  const timelineEvents = [
    {
      id: "ev-1",
      action: "CAPTURED_AND_EXTRACTED",
      title: "التصوير الميداني والاستخراج الأولي (OCR v2.1)",
      actor: "أحمد عباس (موظف المسح المركزي)",
      device: "iPad Pro Term-01 (موثوق)",
      timestamp: "2026-09-22 08:30 ص",
      details: "تم مسح 500 شهادة، إنجاز 320 بنجاح، تحويل 41 للمراجعة، وبقاء 132 قيد الانتظار.",
      badge: "ORIGINAL_CAPTURE",
    },
    {
      id: "ev-2",
      action: "HANDOFF_PREPARED",
      title: "تجميد لقطة العمل وتشفير الحزمة (Snapshot & DEK)",
      actor: "أحمد عباس",
      device: "iPad Pro Term-01",
      timestamp: "2026-09-22 10:45 ص",
      details: "إنشاء حزمة .sahmpkg مشفرة بـ AES-256-GCM، بصمة الهاش: 4c8b321a...، فحص الخصوصية DLP ناجح.",
      badge: "ENCRYPTED_DEK",
    },
    {
      id: "ev-3",
      action: "DIRECT_PAIRING_HANDSHAKE",
      title: "المصافحة الأمنية المباشرة (Direct Wi-Fi Handshake)",
      actor: "أحمد عباس ⟷ سارة حسن",
      device: "Term-01 ⟷ Review-Pad-04",
      timestamp: "2026-09-22 10:48 ص",
      details: "مطابقة رمز المصادقة المتبادل: BLUE-ORBIT-27 عبر الشبكة المحلية دون استهلاك الإنترنت.",
      badge: "MUTUAL_CONFIRMATION",
    },
    {
      id: "ev-4",
      action: "TRANSFER_COMPLETED",
      title: "اكتمال نقل القطع والتحقق من التجزئة (Resumable Slicing)",
      actor: "نظام النقل الآمن سهم",
      device: "Local Transport Channel",
      timestamp: "2026-09-22 10:52 ص",
      details: "تم نقل 240 قطعة (بحجم 1.84 GB) والتحقق من تجزئة SHA-256 بنسبة 100% دون أي تلف.",
      badge: "240_CHUNKS_OK",
    },
    {
      id: "ev-5",
      action: "ACCEPTED_AND_RESUMED",
      title: "قبول التسليم واستئناف العمل التشغيلي (Continue Handoff)",
      actor: "سارة حسن (مدققة الشهادات)",
      device: "Review-Pad-04 (موثوق)",
      timestamp: "2026-09-22 10:55 ص",
      details: "تم استلام الحزمة والربط بمساحة العمل. استئناف المعالجة فورياً من الشهادة رقم #321.",
      badge: "OPERATIONAL_OWNER",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/handoff"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                سلسلة الحيازة والتدقيق المؤسسي (Chain of Custody Timeline)
              </h1>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
                NON-REPUDIATION AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              سجل زمني غير قابل للتعديل يوثق أطراف المسح والنقل والاستلام دون فقدان الهوية الأصلية
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Chain Summary Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-cyan-400 font-mono font-bold block">
                حركة تسليم: HND-2026-00142
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                دفعة شهادات نظم المعلومات — دور سبتمبر 2026 (500 شهادة)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حيازة مستمرة ومكتملة</span>
              </span>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="relative pt-4 pl-2 pr-4 space-y-8 before:absolute before:inset-0 before:right-7 before:w-0.5 before:bg-slate-800">
            {timelineEvents.map((ev, idx) => (
              <div key={ev.id} className="relative flex items-start gap-4">
                {/* Timeline Node */}
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shrink-0 z-10 shadow-lg shadow-cyan-950/60 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>

                {/* Event Card */}
                <div className="flex-1 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-xs">{ev.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        {ev.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{ev.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    {ev.details}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                    <div>الفاعل: <strong className="text-slate-200">{ev.actor}</strong></div>
                    <div>الجهاز المستخدم: <strong className="text-slate-300 font-mono">{ev.device}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
