"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Users,
  Lock,
  Clock,
  CheckCircle2,
  Share2,
  Plus,
  Play,
  Sparkles,
  AlertCircle,
  Radio,
  FileText,
} from "lucide-react";

interface WorkspaceRecord {
  id: string;
  name: string;
  college: string;
  activeMembers: Array<{ name: string; role: string }>;
  currentClaims: Array<{ itemId: string; studentName: string; claimedBy: string; remainingMinutes: number }>;
  totalItems: number;
  completedItems: number;
}

export default function SharedWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([
    {
      id: "ws-01",
      name: "مساحة مراجعة كشوفات الحاسبات 2026",
      college: "كلية الحاسبات والمعلومات",
      activeMembers: [
        { name: "سارة حسن", role: "REVIEWER" },
        { name: "أحمد عباس", role: "OPERATIONAL_OWNER" },
      ],
      currentClaims: [
        { itemId: "cert_042", studentName: "عبد الرحمن أحمد إبراهيم", claimedBy: "سارة حسن", remainingMinutes: 4 },
        { itemId: "cert_043", studentName: "مريم نور الدين مصطفى", claimedBy: "أحمد عباس", remainingMinutes: 8 },
      ],
      totalItems: 500,
      completedItems: 361,
    },
    {
      id: "ws-02",
      name: "مساحة تدقيق شهادات الهندسة الميدانية",
      college: "كلية الهندسة",
      activeMembers: [
        { name: "محمد الدسوقي", role: "PROCESSOR" },
        { name: "خالد بن الوليد", role: "REVIEWER" },
      ],
      currentClaims: [
        { itemId: "cert_109", studentName: "ياسين طارق عبد الله", claimedBy: "خالد بن الوليد", remainingMinutes: 6 },
      ],
      totalItems: 340,
      completedItems: 340,
    },
  ]);

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
                مساحات العمل التشاركية الحية (Shared Collaborative Workspaces)
              </h1>
              <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-mono">
                CONCURRENCY CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              التعاون المباشر بين عدة مدققين مع قفل الحجز المؤقت (Item Claim Lease) لمنع التضارب
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-900/20">
          <Plus className="w-3.5 h-3.5" />
          <span>إنشاء مساحة تشاركية جديدة</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Concurrency Banner */}
        <div className="bg-purple-950/30 border border-purple-800/50 rounded-2xl p-4 text-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="font-bold text-white block">نظام الحجز التنافسي الذكي (Item Lease Locks):</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              عند فتح أي مدقق لشهادة معينة، يُحجز السجل تلقائياً لمدة 10 دقائق باسمه مع ظهور شارة حية لزملائه لمنع العمل المزدوج على نفس الشهادة.
            </p>
          </div>
        </div>

        {/* Workspaces List */}
        <div className="space-y-4">
          {workspaces.map((ws) => {
            const percent = Math.round((ws.completedItems / ws.totalItems) * 100);

            return (
              <div
                key={ws.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono font-semibold block">{ws.college}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{ws.name}</h3>
                  </div>

                  <Link
                    href="/batch-scanner"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-900/20 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>دخول مساحة العمل واستئناف المراجعة</span>
                  </Link>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400">إنجاز الدفعة المشتركة:</span>
                    <span className="text-emerald-400 font-bold">
                      {ws.completedItems} من {ws.totalItems} شهادة ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Active Members & Claims Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
                  {/* Active Members */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>المدققون المتواجدون حالياً ({ws.activeMembers.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ws.activeMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 font-mono text-[11px]"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-white">{m.name}</span>
                          <span className="text-[9px] text-slate-400">({m.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Item Claims */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>الشهادات المحجوزة للمراجعة اللحظية:</span>
                    </div>
                    <div className="space-y-1.5">
                      {ws.currentClaims.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]"
                        >
                          <div className="space-x-1 space-x-reverse">
                            <span className="font-mono text-cyan-400 font-bold">{c.itemId}</span>
                            <span className="text-slate-300">• {c.studentName}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-amber-400">بواسطة: {c.claimedBy}</span>
                            <span className="text-slate-500">({c.remainingMinutes} د متبقية)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
