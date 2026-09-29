"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  Wrench,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useData } from "@/context/data-context";

export function Sidebar() {
  const pathname = usePathname();
  const { stats } = useData();

  const navItems = [
    {
      label: "Dashboard (แดชบอร์ด)",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Machine Master (เครื่องจักร)",
      href: "/machines",
      icon: Cpu,
      badge: stats.totalMachines,
      badgeColor: "bg-slate-700 text-slate-300",
    },
    {
      label: "Alarm Management (แจ้งเตือน)",
      href: "/alarms",
      icon: AlertTriangle,
      badge: stats.openAlarms > 0 ? stats.openAlarms : undefined,
      badgeColor: "bg-rose-500 text-white animate-pulse font-bold",
    },
    {
      label: "Maintenance (งานซ่อมบำรุง)",
      href: "/maintenance",
      icon: Wrench,
      badge: stats.waitingPartMaintenance > 0 ? `${stats.waitingPartMaintenance} รออะไหล่` : undefined,
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px]",
    },
    {
      label: "Audit Logs (ประวัติระบบ)",
      href: "/audit-logs",
      icon: ShieldCheck,
      bonus: true,
    },
    {
      label: "CSV Export (ส่งออกข้อมูล)",
      href: "/reports",
      icon: FileSpreadsheet,
      bonus: true,
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] transition-colors light:bg-slate-50 light:border-slate-200">
      <div>
        {/* Brand / Title Header */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white uppercase light:text-slate-900">
                SCADA System
              </div>
              <div className="text-[11px] font-mono text-cyan-400 font-medium">
                Automation & Maintenance
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Operations & Control
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.bonus && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      Bonus
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        item.badgeColor || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Industrial Machine Overview Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs light:bg-white light:border-slate-200">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Line Status
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            {stats.runningMachines}/{stats.totalMachines} Up
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{
              width: `${stats.totalMachines ? (stats.runningMachines / stats.totalMachines) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{
              width: `${stats.totalMachines ? (stats.alarmMachines / stats.totalMachines) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{
              width: `${stats.totalMachines ? (stats.maintenanceMachines / stats.totalMachines) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
          <span className="text-emerald-400">● {stats.runningMachines} Run</span>
          <span className="text-rose-400">● {stats.alarmMachines} Alarm</span>
          <span className="text-amber-400">● {stats.maintenanceMachines} Maint</span>
        </div>
      </div>
    </aside>
  );
}
