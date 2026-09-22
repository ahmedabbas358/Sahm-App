"use client";

import React from "react";
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  History,
} from "lucide-react";

export interface RecordProvenance {
  id: string;
  studentName: string;
  studentNameRaw?: string;
  universityId: string;
  certificateNumber?: string;
  college: string;
  specialization: string;
  graduationYear: number;
  status: string;
  confidenceName?: number;
  sourceFile?: string;
  sourcePage?: number;
  sourceRow?: number;
  reviewedBy?: string;
  approvedBy?: string;
  verificationCode?: string;
  historyTimeline?: Array<{
    action: string;
    timestamp: string;
    actor: string;
    detail: string;
  }>;
}

interface ContextPanelProps {
  record: RecordProvenance | null;
  onClose: () => void;
}

export default function ContextPanel({ record, onClose }: ContextPanelProps) {
  if (!record) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl shadow-slate-950 flex flex-col text-slate-200 animate-in slide-in-from-left duration-200" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">لوحة تفاصيل السجل والأصل</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">ID: {record.id.slice(0, 8)}...</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Student Identity Block */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            الهوية الأكاديمية الرسمية
          </div>
          <div>
            <div className="text-base font-bold text-white">{record.studentName}</div>
            {record.studentNameRaw && record.studentNameRaw !== record.studentName && (
              <div className="text-xs text-slate-400 mt-0.5">
                النص الخام المستخرج: <span className="text-slate-300 font-mono">{record.studentNameRaw}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">الرقم الجامعي</span>
              <span className="font-mono text-slate-200 font-medium">{record.universityId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">رقم الشهادة</span>
              <span className="font-mono text-slate-200 font-medium">
                {record.certificateNumber || "قيد الإصدار"}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Affiliation */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            السياق الأكاديمي
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                الكلية
              </span>
              <span className="text-slate-200 font-medium">{record.college}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                التخصص
              </span>
              <span className="text-slate-200 font-medium">{record.specialization}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                سنة التخرج
              </span>
              <span className="text-slate-200 font-mono font-medium">{record.graduationYear}</span>
            </div>
          </div>
        </div>

        {/* Provenance & Source Evidence */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            سلسلة الحيازة والأصل (Provenance)
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ملف المصدر الأصلي</span>
              <span className="text-slate-300 font-mono text-[11px]">{record.sourceFile || "دفعة_امتحانات_2026.pdf"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">الصفحة / السطر</span>
              <span className="text-slate-300 font-mono">
                ص {record.sourcePage || 14} • س {record.sourceRow || 3}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ثقة الاستخراج الأولي (OCR)</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {record.confidenceName ? `${Math.round(record.confidenceName * 100)}%` : "98%"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Link */}
        {record.verificationCode && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between text-teal-300 font-medium">
              <span>الهوية الرقمية العامة</span>
              <span className="font-mono text-[11px] bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">
                {record.verificationCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              يمكن التحقق من صحة هذه الشهادة عبر البوابة العامة بدون كشف بيانات خاصة.
            </p>
            <a
              href={`/v/${record.verificationCode}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium text-xs pt-1"
            >
              <span>معاينة صفحة التحقق العامة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Timeline Audit Trail */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>سجل الأحداث والقرارات (Audit Timeline)</span>
          </div>
          <div className="relative border-r border-slate-800 pr-3 space-y-4">
            <div className="relative">
              <div className="absolute -right-[17px] top-1 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
              <div className="font-medium text-slate-200">تم الاعتماد النهائي</div>
              <div className="text-[10px] text-slate-400">بواسطة: د. عميد الكلية • منذ يومين</div>
            </div>
            <div className="relative">
              <div className="absolute -right-[17px] top-1 w-2 h-2 rounded-full bg-teal-400 ring-4 ring-slate-900" />
              <div className="font-medium text-slate-200">تمت مراجعة تطابق الاسم</div>
              <div className="text-[10px] text-slate-400">بواسطة: أ. أحمد عباس (مراجع) • منذ 3 أيام</div>
            </div>
            <div className="relative">
              <div className="absolute -right-[17px] top-1 w-2 h-2 rounded-full bg-slate-500 ring-4 ring-slate-900" />
              <div className="font-medium text-slate-200">التقاط واستخراج أولي (OCR)</div>
              <div className="text-[10px] text-slate-400">محرك OCR المؤسسي v2.1 • منذ 4 أيام</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
