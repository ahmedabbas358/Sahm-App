"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Layers,
  FileCheck2,
  Search,
  Share2,
  FileSpreadsheet,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import CommandPalette from "./CommandPalette";

export type RoleType = "scanner" | "reviewer" | "manager" | "admin";

export default function Navigation() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<RoleType>("admin");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "conflict">("synced");

  // Dynamic navigation items based on Role Matrix (Prompt 24 Section 5 & 6)
  const allNavItems = [
    {
      name: "لوحة العمليات",
      nameEn: "Operations",
      href: "/",
      icon: GraduationCap,
      roles: ["scanner", "reviewer", "manager", "admin"],
    },
    {
      name: "طابور المراجعة",
      nameEn: "Review Queue",
      href: "/review",
      icon: FileCheck2,
      roles: ["scanner", "reviewer", "manager", "admin"],
      badge: "9",
    },
    {
      name: "فاحص الدفعات",
      nameEn: "Scanner",
      href: "/batch-scanner",
      icon: Layers,
      roles: ["scanner", "manager", "admin"],
    },
    {
      name: "البحث الشامل",
      nameEn: "Search",
      href: "/search",
      icon: Search,
      roles: ["reviewer", "manager", "admin"],
    },
    {
      name: "تسليم العمل",
      nameEn: "Handoff",
      href: "/handoff",
      icon: Share2,
      roles: ["scanner", "reviewer", "manager", "admin"],
    },
    {
      name: "استوديو التصدير",
      nameEn: "Export Studio",
      href: "/export-studio",
      icon: FileSpreadsheet,
      roles: ["manager", "admin"],
    },
    {
      name: "منظومة التحقق",
      nameEn: "Verification",
      href: "/verifications",
      icon: ShieldCheck,
      roles: ["manager", "admin"],
    },
    {
      name: "حوكمة AI",
      nameEn: "AI Governance",
      href: "/ai-control",
      icon: Cpu,
      roles: ["admin"],
    },
  ];

  const visibleNav = allNavItems.filter((item) => item.roles.includes(activeRole));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3 transition-colors duration-200" dir="rtl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">سهم | Sahm</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                    Enterprise
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  جامعة إفريقيا العالمية • إدارة الامتحانات والشهادات
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {visibleNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Controls: Search, Sync status, Role Selector */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button (Cmd+K) */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 text-xs transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بحث سريع...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Sync Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              {syncStatus === "synced" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">متزامن</span>
                </>
              )}
              {syncStatus === "syncing" && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="text-slate-300">جار المزامنة</span>
                </>
              )}
              {syncStatus === "conflict" && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">يوجد تعارض</span>
                </>
              )}
            </div>

            {/* Role Switcher (Allows testing different permission matrices) */}
            <div className="relative flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as RoleType)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="admin" className="bg-slate-900 text-slate-200">
                  مدير النظام (Admin)
                </option>
                <option value="manager" className="bg-slate-900 text-slate-200">
                  مدير قسم (Manager)
                </option>
                <option value="reviewer" className="bg-slate-900 text-slate-200">
                  مراجع (Reviewer)
                </option>
                <option value="scanner" className="bg-slate-900 text-slate-200">
                  ماسح (Scanner)
                </option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
