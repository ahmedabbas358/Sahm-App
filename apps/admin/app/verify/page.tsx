"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  QrCode,
  Lock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Camera,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
} from "lucide-react";

export default function VerifyPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    // Normalize ambiguous characters
    val = val.replace(/[IL]/g, "1").replace(/O/g, "0");
    // Remove invalid chars except alphanumeric and hyphen
    val = val.replace(/[^A-Z0-9-]/g, "");
    setCode(val);
    if (error) setError("");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean || clean.length < 4) {
      setError("يرجى إدخال رمز تحقق صالح (مثال: 7KX9-QM4P-82DZ)");
      return;
    }
    router.push(`/v/${encodeURIComponent(clean)}`);
  };

  const handleSelectDemo = (demoCode: string) => {
    setCode(demoCode);
    router.push(`/v/${encodeURIComponent(demoCode)}`);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              جامعة إفريقيا العالمية
            </h1>
            <p className="text-xs text-slate-400">
              بوابة التحقق الرقمي من صحة الشهادات والوثائق الأكاديمية
            </p>
          </div>
        </div>

        <Link
          href="/verifications"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
        >
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>لوحة إدارة التحقق (Staff)</span>
        </Link>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {/* Title & Badge */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>طبقة التحقق الأكاديمي الموثوقة — بروتوكول سهم</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            تحقق فوري من صحة وموثوقية الشهادة الجامعية
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            أدخل رمز التحقق المطبوع على وثيقة التخرج أو امسح رمز الـ QR للتأكد من مطابقتها الرسمية لسجلات الجامعة.
          </p>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                رمز التحقق الرقمي (Verification Code):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={handleInputChange}
                  placeholder="مثال: 7KX9-QM4P-82DZ"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3.5 text-base sm:text-lg font-mono text-center tracking-widest text-cyan-300 placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                  maxLength={24}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <QrCode className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              {error && <p className="mt-2 text-xs text-rose-400 font-medium">{error}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>فحص ومطابقة الوثيقة</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScanning(!isScanning)}
                className="py-3.5 px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>مسح الـ QR بكاميرا الجهاز</span>
              </button>
            </div>
          </form>

          {/* Scanner Simulation Modal */}
          {isScanning && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-cyan-800/50 text-center animate-fadeIn">
              <div className="w-40 h-40 mx-auto border-2 border-dashed border-cyan-500 rounded-lg flex flex-col items-center justify-center p-4 bg-cyan-950/20 mb-3 relative overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400 top-1/2 -translate-y-1/2 animate-pulse" />
                <QrCode className="w-12 h-12 text-cyan-400/60 mb-1" />
                <span className="text-[11px] text-cyan-300">وجّه الكاميرا نحو الـ QR</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                أو اختر رمزاً تجريبياً جاهزاً للاختبار السريع:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSelectDemo("7KX9-QM4P-82DZ")}
                  className="px-2.5 py-1 rounded bg-cyan-900/40 border border-cyan-700/50 text-xs font-mono text-cyan-300 hover:bg-cyan-800/50 transition"
                >
                  7KX9-QM4P-82DZ (معتمدة)
                </button>
                <button
                  onClick={() => handleSelectDemo("REVOKED-SAMPLE-01")}
                  className="px-2.5 py-1 rounded bg-rose-900/40 border border-rose-700/50 text-xs font-mono text-rose-300 hover:bg-rose-800/50 transition"
                >
                  REVOKED-SAMPLE (ملغاة)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards / Security Pillars */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">حماية تامة للخصوصية</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تعتمد المنظومة مبدأ الإفصاح الأدنى؛ لا يتم إظهار الأرقام الوطنية أو الهواتف أو درجات المواد العامة.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">رموز Base32 غير قابلة للتخمين</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              رموز ذات عشوائية تشفيرية عالية ومحصنة ضد محاولات التخمين التتابعي أو الهجمات الآلية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">تتبع دورة الإلغاء والاستبدال</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              أي شهادة ملغاة أو مستبدلة تظهر حالتها بوضوح لمنع استخدام الوثائق القديمة أو المنسوخة.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <p>منظومة سهم — أمانة الشؤون العلمية — جامعة إفريقيا العالمية © 2026</p>
      </footer>
    </div>
  );
}
