'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  Wrench,
  Activity,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { StatCard } from '@/components/common/stat-card';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { SeverityBadge, AlarmStatusBadge } from '@/components/common/badge';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { machines, alarms, maintenanceRecords, stats, isLoading } = useData();
  const { user, role } = useAuth();

  // Active Critical or Open Alarms
  const activeAlarms = alarms.filter((a) => a.status !== 'Closed').slice(0, 5);

  return (
    <AppShell title="SCADA Executive Dashboard">
      {/* Welcome Banner */}
      <div className="relative p-6 mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl light:from-white light:via-slate-50 light:to-cyan-50/50 light:border-slate-200">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 light:text-cyan-600 font-semibold">
                Factory Automation Live Feed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-slate-900 tracking-tight">
              ยินดีต้อนรับ, {user?.full_name || 'Operator'}
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              ภาพรวมการทำงานของเครื่องจักร, สถิติการแจ้งเตือนความผิดปกติ, และสถานะงานซ่อมบำรุง
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right light:bg-white light:border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                System Security Level
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 light:text-cyan-600 flex items-center justify-end gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ROLE: {role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Mandatory KPI Cards Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 font-mono">
            Key Performance Indicators (7 Mandatory Metrics)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Real-time Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* 1. Total Machines */}
          <StatCard
            title="เครื่องจักรทั้งหมด"
            value={stats.totalMachines}
            subtitle="Units installed"
            icon={Cpu}
            colorScheme="cyan"
          />

          {/* 2. Running Machines */}
          <StatCard
            title="Machine Running"
            value={stats.runningMachines}
            subtitle="ทำงานปกติ"
            icon={PlayCircle}
            colorScheme="emerald"
            trend={stats.totalMachines > 0 ? `${Math.round((stats.runningMachines / stats.totalMachines) * 100)}%` : undefined}
          />

          {/* 3. Stop Machines */}
          <StatCard
            title="Machine Stop"
            value={stats.stopMachines}
            subtitle="หยุดเดินเครื่อง"
            icon={StopCircle}
            colorScheme="blue"
          />

          {/* 4. Alarm Machines */}
          <StatCard
            title="Machine Alarm"
            value={stats.alarmMachines}
            subtitle="เกิดข้อผิดพลาด"
            icon={AlertTriangle}
            colorScheme="rose"
          />

          {/* 5. Maintenance Machines */}
          <StatCard
            title="Machine Mnt"
            value={stats.maintenanceMachines}
            subtitle="กำลังซ่อมบำรุง"
            icon={Wrench}
            colorScheme="amber"
          />

          {/* 6. Total Alarms */}
          <StatCard
            title="จำนวน Alarm รวม"
            value={stats.totalAlarms}
            subtitle={`${stats.openAlarms} Open / ${stats.criticalAlarms} Crit`}
            icon={Activity}
            colorScheme="rose"
          />

          {/* 7. Total Maintenance */}
          <StatCard
            title="งานบำรุงรักษารวม"
            value={stats.totalMaintenance}
            subtitle={`${stats.waitingPartMaintenance} รออะไหล่`}
            icon={Layers}
            colorScheme="amber"
          />
        </div>
      </div>

      {/* Interactive SCADA Analytics Charts */}
      <div className="mb-8">
        <DashboardCharts
          machines={machines}
          alarms={alarms}
          maintenanceRecords={maintenanceRecords}
        />
      </div>

      {/* Bottom Section: Active Alarms Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alarms Incident Ticker (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                เหตุการณ์แจ้งเตือนที่ต้องดำเนินการ (Active Alarms)
              </h3>
            </div>
            <Link
              href="/alarms"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 light:text-cyan-600 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeAlarms.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300 light:text-slate-700">
                ไม่มีการแจ้งเตือนตกค้าง
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ทุกเครื่องจักรทำงานในเกณฑ์ที่ปลอดภัย
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlarms.map((a) => {
                const machineObj = machines.find((m) => m.id === a.machine_id || m.machine_id === a.machine_id);
                return (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 light:bg-slate-50 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-rose-400">
                            {a.alarm_code}
                          </span>
                          <SeverityBadge severity={a.severity} />
                          <AlarmStatusBadge status={a.status} />
                        </div>
                        <p className="text-xs font-medium text-slate-200 light:text-slate-900 mt-1">
                          {a.alarm_description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>เครื่องจักร: <strong className="text-cyan-400">{machineObj?.machine_name || a.machine_id}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" /> {formatDate(a.occurred_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/alarms"
                      className="self-end sm:self-center px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors light:bg-slate-200 light:text-slate-800 light:hover:bg-slate-300"
                    >
                      จัดการ
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Shortcuts & System Status (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800 light:border-slate-200">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                ระบบงานด่วน (Quick Launch)
              </h3>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/machines"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 light:bg-slate-50 light:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white light:text-slate-900 group-hover:text-cyan-400">
                      Machine Master
                    </div>
                    <div className="text-[11px] text-slate-400">ตรวจสอบสเปกและพิกัดเครื่อง</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </Link>

              <Link
                href="/alarms"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 light:bg-slate-50 light:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white light:text-slate-900 group-hover:text-rose-400">
                      Alarm Monitoring
                    </div>
                    <div className="text-[11px] text-slate-400">เคลียร์สถานะข้อผิดพลาด</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
              </Link>

              <Link
                href="/maintenance"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 light:bg-slate-50 light:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white light:text-slate-900 group-hover:text-amber-400">
                      Maintenance Ops
                    </div>
                    <div className="text-[11px] text-slate-400">บันทึกแผนและงานซ่อมบำรุง</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 light:bg-slate-50 light:border-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white light:text-slate-900 group-hover:text-emerald-400">
                      Data Export & CSV
                    </div>
                    <div className="text-[11px] text-slate-400">ส่งออกรายงานข้อมูลสรุป</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 light:border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Next.js 15 App Router</span>
            <span className="font-mono text-emerald-400">● 100% Operational</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
