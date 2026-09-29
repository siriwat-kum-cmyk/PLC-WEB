'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Cpu,
  MapPin,
  Calendar,
  AlertTriangle,
  Wrench,
  Activity,
  History,
  Clock,
  Shield,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge, SeverityBadge, AlarmStatusBadge, MaintenanceStatusBadge } from '@/components/common/badge';
import { useData } from '@/context/data-context';
import { formatDate } from '@/lib/utils';
import { MachineStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MachineDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { getMachineById, alarms, maintenanceRecords, isLoading } = useData();

  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'ALARM' | 'MAINTENANCE'>('ALL');

  const machine = getMachineById(resolvedParams.id);

  // Filter Alarms for this machine
  const machineAlarms = useMemo(() => {
    if (!machine) return [];
    return alarms.filter((a) => a.machine_id === machine.id || a.machine_id === machine.machine_id);
  }, [machine, alarms]);

  // Filter Maintenance for this machine
  const machineMaintenance = useMemo(() => {
    if (!machine) return [];
    return maintenanceRecords.filter(
      (m) => m.machine_id === machine.id || m.machine_id === machine.machine_id
    );
  }, [machine, maintenanceRecords]);

  // Merged Chronological Timeline Events
  const timelineEvents = useMemo(() => {
    interface TimelineItem {
      id: string;
      date: string;
      type: 'ALARM' | 'MAINTENANCE';
      title: string;
      description: string;
      statusBadge: React.ReactNode;
      extraInfo?: string;
    }

    const events: TimelineItem[] = [];

    if (eventTypeFilter === 'ALL' || eventTypeFilter === 'ALARM') {
      machineAlarms.forEach((a) => {
        events.push({
          id: a.id,
          date: a.occurred_at,
          type: 'ALARM',
          title: `[${a.alarm_code}] ${a.alarm_description}`,
          description: a.cause ? `สาเหตุ: ${a.cause}` : 'ไม่มีการระบุสาเหตุเพิ่มเติม',
          statusBadge: (
            <div className="flex items-center gap-1.5">
              <SeverityBadge severity={a.severity} />
              <AlarmStatusBadge status={a.status} />
            </div>
          ),
          extraInfo: a.resolved_at ? `แก้ไขเสร็จสิ้นเมื่อ: ${formatDate(a.resolved_at)}` : 'ยังไม่ได้รับการแก้ไข',
        });
      });
    }

    if (eventTypeFilter === 'ALL' || eventTypeFilter === 'MAINTENANCE') {
      machineMaintenance.forEach((m) => {
        events.push({
          id: m.id,
          date: m.maintenance_date,
          type: 'MAINTENANCE',
          title: `[${m.maintenance_type}] ${m.problem}`,
          description: `การแก้ไข: ${m.action_taken}`,
          statusBadge: <MaintenanceStatusBadge status={m.status} />,
          extraInfo: `ช่างเทคนิค: ${m.technician?.full_name || 'Technician'} • อะไหล่: ${m.spare_part_used || 'ไม่มี'}`,
        });
      });
    }

    // Sort descending by date
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [machineAlarms, machineMaintenance, eventTypeFilter]);

  if (isLoading) {
    return (
      <AppShell title="กำลังโหลดข้อมูล...">
        <div className="py-20 text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-slate-400 font-mono text-sm">กำลังสืบค้นประวัติเครื่องจักร...</p>
        </div>
      </AppShell>
    );
  }

  if (!machine) {
    return (
      <AppShell title="ไม่พบเครื่องจักร">
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-lg mx-auto mt-10">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">ไม่พบเครื่องจักรที่ระบุ</h2>
          <p className="text-xs text-slate-400 mb-6">
            รหัสเครื่องจักร &apos;{resolvedParams.id}&apos; ไม่มีอยู่ในฐานข้อมูลหรือถูกลบไปแล้ว
          </p>
          <Link
            href="/machines"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500"
          >
            <ArrowLeft className="w-4 h-4" /> กลับสู่ทะเบียนเครื่องจักร
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Machine Details: ${machine.machine_id}`}>
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/machines"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่ทะเบียนเครื่องจักร (Back to Machine Master)</span>
        </Link>
      </div>

      {/* Machine Profile Overview Card */}
      <div className="p-6 mb-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl light:bg-white light:border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl font-extrabold font-mono text-cyan-400 light:text-cyan-600">
                  {machine.machine_id}
                </span>
                <StatusBadge status={machine.status as MachineStatus} />
                <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 light:bg-slate-100 light:text-slate-700">
                  {machine.machine_type}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white light:text-slate-900 mt-1">
                {machine.machine_name}
              </h1>
              {machine.description && (
                <p className="text-xs text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {machine.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">ตำแหน่งติดตั้ง (Location)</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-200 light:text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{machine.location}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">PLC IP Address</span>
            <div className="font-mono text-slate-200 light:text-slate-800 font-semibold">
              {machine.ip_address || 'Non-Networked'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Protocol</span>
            <div className="font-mono text-slate-200 light:text-slate-800 font-semibold">
              {machine.protocol || 'Standard I/O'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">วันที่เริ่มใช้งาน</span>
            <div className="flex items-center gap-1.5 text-slate-200 light:text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{machine.installation_date || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Timeline History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl light:bg-white light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800 light:border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white light:text-slate-900">
                ประวัติเหตุการณ์และงานซ่อมบำรุง (Machine History Timeline)
              </h2>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
              บันทึกเหตุการณ์ทั้งหมดที่เกิดขึ้นกับเครื่องจักรนี้ เรียงตามลำดับเวลา
            </p>
          </div>

          {/* Event Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 light:bg-slate-100 light:border-slate-200 text-xs">
            <button
              onClick={() => setEventTypeFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                eventTypeFilter === 'ALL'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white light:hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({machineAlarms.length + machineMaintenance.length})
            </button>
            <button
              onClick={() => setEventTypeFilter('ALARM')}
              className={`px-3 py-1 rounded-md transition-colors ${
                eventTypeFilter === 'ALARM'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white light:hover:text-slate-900'
              }`}
            >
              Alarm ({machineAlarms.length})
            </button>
            <button
              onClick={() => setEventTypeFilter('MAINTENANCE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                eventTypeFilter === 'MAINTENANCE'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white light:hover:text-slate-900'
              }`}
            >
              Maintenance ({machineMaintenance.length})
            </button>
          </div>
        </div>

        {/* Timeline Visualization */}
        {timelineEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300 light:text-slate-700">ไม่มีประวัติเหตุการณ์</p>
            <p className="text-xs text-slate-500 mt-1">เครื่องจักรนี้ยังไม่เคยมี Alarm หรือประวัติซ่อมบำรุง</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 light:before:bg-slate-200">
            {timelineEvents.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 light:border-white shadow flex items-center justify-center ${
                    event.type === 'ALARM' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />

                {/* Event Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 light:bg-slate-50 light:border-slate-200 shadow-sm transition-all hover:border-slate-700 light:hover:border-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded text-[10px] font-bold uppercase font-mono ${
                          event.type === 'ALARM'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {event.type}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white light:text-slate-900">
                        {event.title}
                      </h3>
                    </div>
                    <div>{event.statusBadge}</div>
                  </div>

                  <p className="text-xs text-slate-300 light:text-slate-700 mb-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 light:border-slate-200 text-[11px] text-slate-400 light:text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {formatDate(event.date)}
                    </span>
                    {event.extraInfo && <span>{event.extraInfo}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
