"use client";

import React, { use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import {
  Cpu,
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
  Wrench,
  Activity,
} from "lucide-react";
import {
  getMachineStatusBadge,
  getAlarmStatusBadge,
  getMaintenanceStatusBadge,
  formatDate,
  formatDateOnly,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MachineHistoryPage({ params }: PageProps) {
  const { id } = use(params);
  const { machines, alarms, maintenance } = useData();

  const machine = machines.find((m) => m.id === id);

  if (!machine) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-300">ไม่พบข้อมูลเครื่องจักร</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">อาจถูกลบหรือรหัสไม่ถูกต้อง</p>
          <Link
            href="/machines"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้ารายการเครื่องจักร</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Get all alarms and maintenance for this machine
  const machineAlarms = alarms.filter((a) => a.machine_id === machine.id);
  const machineMaintenance = maintenance.filter((m) => m.machine_id === machine.id);

  // Combine into unified chronological timeline
  type TimelineEvent = {
    id: string;
    type: "alarm" | "maintenance";
    date: string;
    title: string;
    subtitle: string;
    badgeLabel: string;
    badgeStyle: string;
    details?: string;
    resolution?: string;
    actor?: string;
  };

  const timelineEvents: TimelineEvent[] = [
    ...machineAlarms.map((a) => ({
      id: a.id,
      type: "alarm" as const,
      date: a.triggered_at,
      title: `${a.alarm_code}: ${a.description}`,
      subtitle: `Alarm Status: ${a.status} • Severity: ${a.severity}`,
      badgeLabel: a.status,
      badgeStyle: getAlarmStatusBadge(a.status).bg,
      details: a.cause ? `สาเหตุ: ${a.cause}` : undefined,
      resolution: a.resolution ? `วิธีแก้ไข: ${a.resolution}` : undefined,
    })),
    ...machineMaintenance.map((m) => ({
      id: m.id,
      type: "maintenance" as const,
      date: m.scheduled_date || m.created_at,
      title: `${m.maintenance_type}: ${m.problem}`,
      subtitle: `ช่างผู้ดูแล: ${m.technician_name}`,
      badgeLabel: m.status,
      badgeStyle: getMaintenanceStatusBadge(m.status).bg,
      details: m.action_taken ? `การปฏิบัติงาน: ${m.action_taken}` : undefined,
      actor: m.technician_name,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const badge = getMachineStatusBadge(machine.status);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <Link
            href="/machines"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่ Machine Master</span>
          </Link>

          <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            Machine History Timeline (Bonus & Change Request)
          </div>
        </div>

        {/* Machine Specification Sheet Header */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-xl light:bg-white light:border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
                  {machine.machine_id}
                </span>
                <h1 className="text-xl font-bold text-white light:text-slate-900">{machine.name}</h1>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                {machine.description || "ไม่มีรายละเอียดสเปกเพิ่มเติม"}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                <span>{machine.status}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Created: {formatDateOnly(machine.created_at)}
              </span>
            </div>
          </div>

          {/* Quick Machine Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 light:border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 text-[11px] mb-1">ประเภทเครื่องจักร</div>
              <div className="font-semibold text-slate-200 light:text-slate-800">{machine.type}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px] mb-1">สถานที่ติดตั้ง</div>
              <div className="font-semibold text-slate-200 light:text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{machine.location}</span>
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px] mb-1">ประวัติ Alarms ทั้งหมด</div>
              <div className="font-semibold font-mono text-rose-400">
                {machineAlarms.length} ครั้ง ({machineAlarms.filter((a) => a.status !== "Closed").length} ค้างอยู่)
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px] mb-1">ประวัติการซ่อมบำรุง</div>
              <div className="font-semibold font-mono text-amber-400">
                {machineMaintenance.length} ครั้ง
              </div>
            </div>
          </div>
        </div>

        {/* Chronological Event Timeline */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-6 shadow-xl light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white light:text-slate-900">
                Machine Event Lifecycle Timeline (ลำดับประวัติเหตุการณ์)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              รวม {timelineEvents.length} เหตุการณ์
            </span>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              ยังไม่มีประวัติ Alarm หรือการซ่อมบำรุงบันทึกไว้สำหรับเครื่องจักรนี้
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 light:before:bg-slate-200">
              {timelineEvents.map((event) => {
                const isAlarm = event.type === "alarm";
                return (
                  <div key={event.id} className="relative group">
                    {/* Timeline Node Marker */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isAlarm
                          ? "bg-rose-950 border-rose-500 text-rose-400"
                          : "bg-amber-950 border-amber-500 text-amber-400"
                      }`}
                    >
                      {isAlarm ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <Wrench className="w-2.5 h-2.5" />
                      )}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 ml-2 hover:border-slate-700 transition-all light:bg-slate-50 light:border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              isAlarm
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {isAlarm ? "Alarm Incident" : "Maintenance Order"}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${event.badgeStyle}`}>
                            {event.badgeLabel}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-white light:text-slate-900">{event.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{event.subtitle}</p>

                      {event.details && (
                        <div className="mt-2 text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800/60 text-slate-300 light:bg-white light:border-slate-200">
                          {event.details}
                        </div>
                      )}

                      {event.resolution && (
                        <div className="mt-2 text-xs bg-emerald-950/20 p-2.5 rounded border border-emerald-500/20 text-emerald-300">
                          <strong>แนวทางแก้ไข:</strong> {event.resolution}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
