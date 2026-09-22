"use client";

import React from "react";
import { AlertTriangle, RefreshCw, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ImpactAlertProps {
  affectedCount?: number;
  message?: string;
  projectName?: string;
  onRegenerate?: () => void;
}

export default function ImpactAlert({
  affectedCount = 1,
  message = "تم تعديل بيانات السجل الرسمي للدفعة بعد تصدير الوثيقة.",
  projectName = "كشف الخريجين المعتمد 2026",
  onRegenerate,
}: ImpactAlertProps) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-white flex items-center gap-2">
            <span>تنبيه: وثيقة مستخرجة من إصدار سابق (Stale Artifact)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {affectedCount} مستند متأثر
            </span>
          </div>
          <p className="text-xs text-amber-300/80 mt-0.5">
            {message} وثيقة «{projectName}» تحتاج إلى إعادة توليد لمطابقة البيانات الرسمية الحديثة.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRegenerate ? (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة التوليد الآن</span>
          </button>
        ) : (
          <Link
            href="/export-studio"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>فتح استوديو التصدير</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
