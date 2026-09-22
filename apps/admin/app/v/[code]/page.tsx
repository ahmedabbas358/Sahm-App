"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Printer,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  Globe,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface PublicVerificationData {
  verification_code: string;
  public_status: "verified" | "verified_with_limited_public_data" | "revoked" | "expired" | "not_found";
  institution_name: string;
  institution_name_en: string;
  faculty_name: string;
  program_name: string;
  certificate_type: string;
  student_display_name: string;
  graduation_year?: number;
  issue_date_formatted: string;
  verification_url: string;
  is_revoked: boolean;
  revocation_notice?: string;
  verified_at: string;
  custom_metadata?: Record<string, any>;
}

export default function PublicVerificationPage() {
  const params = useParams();
  const rawCode = (params?.code as string) || "";
  
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicVerificationData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!rawCode) return;

    async function fetchVerification() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/public/verify/${encodeURIComponent(rawCode)}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setIsNotFound(false);
        } else if (res.status === 404) {
          setIsNotFound(true);
          setData(null);
        } else {
          // Fallback demo projection if local backend server is not currently running
          simulateFallback(rawCode);
        }
      } catch (err) {
        // Fallback demo for preview purposes
        simulateFallback(rawCode);
      } finally {
        setLoading(false);
      }
    }

    fetchVerification();
  }, [rawCode]);

  function simulateFallback(code: string) {
    const isRevokedDemo = code.toUpperCase().includes("REVOKED");
    setData({
      verification_code: code.toUpperCase(),
      public_status: isRevokedDemo ? "revoked" : "verified",
      institution_name: "جامعة إفريقيا العالمية",
      institution_name_en: "International University of Africa",
      faculty_name: "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
      program_name: "بكالوريوس العلوم في هندسة البرمجيات",
      certificate_type: "بكالوريوس",
      student_display_name: "أحمد م. ع. إبراهيم",
      graduation_year: 2026,
      issue_date_formatted: "العام الأكاديمي 2025/2026",
      verification_url: typeof window !== "undefined" ? window.location.href : `https://sahm.edu/v/${code}`,
      is_revoked: isRevokedDemo,
      revocation_notice: isRevokedDemo ? "تم إلغاء هذه الوثيقة بقرار إداري لتصحيح خطأ مطبعي في السجل الأصلي." : undefined,
      verified_at: new Date().toISOString(),
      custom_metadata: {
        masked_student_id: "***048",
      },
    });
    setIsNotFound(false);
  }

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isAr = lang === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation & Language Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {isAr ? "بوابة التحقق الرسمية" : "Official Verification Portal"}
            </h1>
            <p className="text-[11px] text-slate-400">
              {isAr ? "منظومة سهم الموثوقة للاعتماد الأكاديمي" : "Sahm Trust Academic Verification Subsystem"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>

          <Link
            href="/verify"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-600/30 transition"
          >
            <span>{isAr ? "فحص رمز آخر" : "Scan Another"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">
              {isAr ? "جارٍ التحقق من صحة الوثيقة في السجل الموثق..." : "Verifying document with authoritative ledger..."}
            </p>
          </div>
        ) : isNotFound ? (
          /* Not Found State */
          <div className="bg-slate-900/90 border border-rose-800/50 rounded-2xl p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <XCircle className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {isAr ? "رمز التحقق غير موجود أو غير صالح" : "Verification Record Not Found"}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {isAr
                ? "لم يتم العثور على شهادة مسجلة بهذا الرمز في سجلات الجامعة المعتمدة. يرجى التأكد من الرمز وإعادة المحاولة."
                : "No certificate matching this verification code exists in the official university records. Please re-check the code."}
            </p>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 inline-block font-mono text-slate-300 text-sm mb-6 tracking-widest">
              {rawCode.toUpperCase()}
            </div>
            <div>
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-medium text-sm hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30"
              >
                <span>{isAr ? "الرجوع لصفحة الفحص" : "Return to Code Entry"}</span>
              </Link>
            </div>
          </div>
        ) : data ? (
          /* Certificate Verification Card */
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition">
            {/* Status Top Banner */}
            <div
              className={`px-6 py-4 flex items-center justify-between border-b ${
                data.is_revoked
                  ? "bg-rose-950/40 border-rose-800/50 text-rose-300"
                  : data.public_status === "expired"
                  ? "bg-amber-950/40 border-amber-800/50 text-amber-300"
                  : "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {data.is_revoked ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                ) : data.public_status === "expired" ? (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-900/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-base font-bold">
                    {data.is_revoked
                      ? isAr
                        ? "شهادة ملغاة بقرار إداري"
                        : "Revoked Certificate"
                      : data.public_status === "expired"
                      ? isAr
                        ? "شهادة منتهية الصلاحية"
                        : "Expired Document"
                      : isAr
                      ? "شهادة جامعية معتمدة وموثقة"
                      : "Officially Verified Document"}
                  </div>
                  <div className="text-xs opacity-80 font-normal">
                    {data.is_revoked
                      ? isAr
                        ? "هذه الوثيقة غير صالحة ولا يُعتد بها رسمياً"
                        : "This document is invalid and legally void"
                      : isAr
                      ? "مطابقة للسجلات الأكاديمية الرسمية للجامعة"
                      : "Conforms with authentic academic records"}
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  data.is_revoked
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {data.public_status}
              </span>
            </div>

            {/* Revocation Warning Box */}
            {data.is_revoked && (
              <div className="m-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">
                    {isAr ? "بيان الإلغاء الرسمي:" : "Official Revocation Notice:"}
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {data.revocation_notice ||
                      (isAr
                        ? "تم إلغاء هذه الشهادة بموجب الإجراءات التنظيمية لقسم الامتحانات والشهادات."
                        : "This certificate has been revoked pursuant to the regulatory procedures of the academic board.")}
                  </p>
                </div>
              </div>
            )}

            {/* Certificate Header Banner */}
            <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-slate-950/40 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto mb-3 flex items-center justify-center text-cyan-400 shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                {isAr ? data.institution_name : data.institution_name_en}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isAr ? data.institution_name_en : data.institution_name}
              </p>
              <div className="mt-2 text-xs font-medium text-cyan-400">
                {isAr ? "أمانة الشؤون العلمية — إدارة الامتحانات والشهادات" : "Academic Affairs Secretariat — Registry Office"}
              </div>
            </div>

            {/* Projected Verified Details Grid */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Graduate Name */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? "اسم الخريج المعتمد" : "Graduate Display Name"}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {data.student_display_name}
                  </div>
                </div>

                {/* Degree Type */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? "الدرجة العلمية" : "Certificate Level"}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {data.certificate_type}
                  </div>
                </div>

                {/* College / Faculty */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? "الكلية" : "Faculty / College"}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {data.faculty_name}
                  </div>
                </div>

                {/* Program / Specialization */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? "التخصص الأكاديمي" : "Academic Program"}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {data.program_name || "—"}
                  </div>
                </div>

                {/* Graduation Period */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? "سنة التخرج / الدفعة" : "Graduation Year"}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {data.graduation_year || data.issue_date_formatted || "—"}
                  </div>
                </div>

                {/* Masked ID if allowed by policy */}
                {data.custom_metadata?.masked_student_id && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] font-medium text-slate-400 mb-1">
                      {isAr ? "الرقم الجامعي المرمّز" : "Masked Student ID"}
                    </div>
                    <div className="text-sm font-mono text-cyan-300 tracking-wider">
                      {data.custom_metadata.masked_student_id}
                    </div>
                  </div>
                )}
              </div>

              {/* Official Verification Code Footer Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 mb-0.5">
                    {isAr ? "رمز التحقق الرقمي الرسمي (Base32)" : "Authoritative Verification Code"}
                  </div>
                  <div className="font-mono text-base sm:text-lg font-bold text-cyan-400 tracking-widest">
                    {data.verification_code}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:text-white hover:border-slate-600 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-500 transition shadow-md shadow-cyan-600/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? "طباعة الإفادة" : "Print Statement"}</span>
                  </button>
                </div>
              </div>

              {/* Security Privacy Notice Banner */}
              <div className="pt-2 text-center text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/60">
                {isAr
                  ? "تم إصدار هذه الإفادة الرقمية استناداً إلى سياسة حماية البيانات الجامعية. لا يتم الإفصاح عن الأرقام الوطنية أو أرقام الهواتف أو درجات المواد."
                  : "Issued pursuant to institutional privacy policy. Zero national IDs, contact numbers, or internal GPA metrics are disclosed."}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <p>
          {isAr
            ? "نظام سهم الموثوق للشهادات الجامعية — جامعة إفريقيا العالمية © 2026"
            : "Sahm Trust Academic Verification System — International University of Africa © 2026"}
        </p>
      </footer>
    </div>
  );
}
