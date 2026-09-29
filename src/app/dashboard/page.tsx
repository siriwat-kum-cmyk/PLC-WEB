"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import {
  Cpu,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  Wrench,
  Clock,
  ArrowUpRight,
  PlusCircle,
  CheckCircle2,
  PackageOpen,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { machines, alarms, maintenance, stats } = useData();
  const { isAdmin, isTechnician } = useAuth();

  const activeAlarms = alarms.filter((a) => a.status !== "Closed");
  const ongoingMaintenance = maintenance.filter((m) => m.status !== "Completed");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 light:text-slate-900">
              <span>Plant Automation SCADA Dashboard</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-normal">
                Real-Time
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ระบบภาพรวมติดตามสัญญาณเตือนและสถานะเครื่องจักรสายการผลิตอัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/machines"
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>เพิ่มเครื่องจักร (Add Machine)</span>
              </Link>
            )}
            {(isAdmin || isTechnician) && (
              <Link
                href="/alarms"
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>แจ้งเตือน Alarm</span>
              </Link>
            )}
          </div>
        </div>

        {/* 3.6 Dashboard KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Machines */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">เครื่องจักรทั้งหมด</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white light:text-slate-900">
              {stats.totalMachines}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-mono">
                {stats.totalMachines > 0
                  ? Math.round((stats.runningMachines / stats.totalMachines) * 100)
                  : 0}
                %
              </span>
              <span>พร้อมทำงาน (Availability)</span>
            </div>
          </div>

          {/* Card 2: Running Machines */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">กำลังทำงาน (Running)</span>
              <PlayCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {stats.runningMachines}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">เครื่องจักรในสายการผลิต</div>
          </div>

          {/* Card 3: Stopped Machines */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">หยุดทำงาน (Stopped)</span>
              <StopCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-300 light:text-slate-700">
              {stats.stoppedMachines}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ปิดระบบหรือพักเครื่อง</div>
          </div>

          {/* Card 4: Alarm Machines */}
          <div
            className={`border rounded-xl p-4 shadow-lg transition-all ${
              stats.alarmMachines > 0
                ? "bg-rose-500/10 border-rose-500/40"
                : "bg-[#121824] border-slate-800 light:bg-white light:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-rose-300">สัญญาณเตือน (Alarm)</span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  stats.alarmMachines > 0 ? "text-rose-400 animate-bounce" : "text-slate-400"
                }`}
              />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {stats.alarmMachines}
            </div>
            <div className="text-[11px] text-rose-300/80 mt-1">
              {stats.openAlarms} รายการรอตรวจสอบ
            </div>
          </div>

          {/* Card 5: Maintenance Machines */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">กำลังซ่อมบำรุง</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {stats.maintenanceMachines}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{stats.pendingMaintenance} งานค้าง</span>
              {stats.waitingPartMaintenance > 0 && (
                <span className="text-purple-400 font-medium">
                  ({stats.waitingPartMaintenance} รออะไหล่)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <DashboardCharts machines={machines} alarms={alarms} maintenance={maintenance} />

        {/* Operational Highlights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alarms Requiring Action */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-200 light:text-slate-800">
                  Active Alarms (สัญญาณเตือนที่ยังเปิดอยู่)
                </h3>
              </div>
              <Link
                href="/alarms"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeAlarms.length === 0 ? (
              <div className="p-6 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>ไม่มีสัญญาณเตือนค้างในระบบ เครื่องจักรทำงานปกติ</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeAlarms.slice(0, 4).map((alarm) => {
                  const m = machines.find((mac) => mac.id === alarm.machine_id);
                  return (
                    <div
                      key={alarm.id}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs light:bg-slate-50 light:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            alarm.severity === "Critical"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : alarm.severity === "High"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {alarm.alarm_code}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-200 light:text-slate-800">
                            {alarm.description}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {m?.machine_id} - {m?.name} • {formatDate(alarm.triggered_at)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                          alarm.status === "Open"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {alarm.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Maintenance Work Orders */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200 light:text-slate-800">
                  Maintenance Orders (งานซ่อมบำรุงที่กำลังดำเนินการ)
                </h3>
              </div>
              <Link
                href="/maintenance"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {ongoingMaintenance.length === 0 ? (
              <div className="p-6 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>ไม่มีงานซ่อมบำรุงคงค้าง</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ongoingMaintenance.slice(0, 4).map((maint) => {
                  const m = machines.find((mac) => mac.id === maint.machine_id);
                  return (
                    <div
                      key={maint.id}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs light:bg-slate-50 light:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                          {maint.maintenance_type.split(" ")[0]}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-200 light:text-slate-800 truncate max-w-xs">
                            {maint.problem}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {m?.machine_id} • ช่าง: {maint.technician_name}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                          maint.status === "Waiting Part"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse font-bold"
                            : maint.status === "In Progress"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {maint.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
