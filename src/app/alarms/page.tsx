'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { SeverityBadge, AlarmStatusBadge } from '@/components/common/badge';
import { AlarmModal } from '@/components/alarms/alarm-modal';
import { StatusUpdateModal } from '@/components/alarms/status-update-modal';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';
import { Alarm, AlarmSeverity, AlarmStatus } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AlarmsPage() {
  const { alarms, machines, deleteAlarm, isLoading } = useData();
  const { canCreateAlarm, canEditAlarm, canUpdateAlarmStatus, canDeleteAlarm } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<Alarm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Alarm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Alarms
  const filteredAlarms = useMemo(() => {
    return alarms.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const machineObj = machines.find((m) => m.id === a.machine_id || m.machine_id === a.machine_id);

      const matchesSearch =
        !q ||
        a.alarm_code.toLowerCase().includes(q) ||
        a.alarm_description.toLowerCase().includes(q) ||
        (a.cause && a.cause.toLowerCase().includes(q)) ||
        (machineObj && machineObj.machine_name.toLowerCase().includes(q)) ||
        (machineObj && machineObj.machine_id.toLowerCase().includes(q));

      const matchesStatus =
        selectedStatus === 'ALL' || a.status === selectedStatus;

      const matchesSeverity =
        selectedSeverity === 'ALL' || a.severity === selectedSeverity;

      const matchesMachine =
        selectedMachine === 'ALL' ||
        a.machine_id === selectedMachine ||
        (machineObj && machineObj.machine_id === selectedMachine);

      return matchesSearch && matchesStatus && matchesSeverity && matchesMachine;
    });
  }, [alarms, machines, searchQuery, selectedStatus, selectedSeverity, selectedMachine]);

  const handleOpenAdd = () => {
    setEditingAlarm(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Alarm) => {
    setEditingAlarm(a);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteAlarm(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedSeverity('ALL');
    setSelectedMachine('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'ALL' ||
    selectedSeverity !== 'ALL' ||
    selectedMachine !== 'ALL';

  return (
    <AppShell title="Alarm Incidents (บันทึกเหตุการณ์แจ้งเตือน)">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
              ศูนย์เฝ้าระวังและจัดการเหตุการณ์แจ้งเตือน (Alarm Monitor)
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-rose-400 border border-slate-700 light:bg-slate-100 light:border-slate-200">
              {filteredAlarms.length} of {alarms.length} Alarms
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            บันทึกรหัสข้อผิดพลาด, ตรวจสอบสาเหตุ, และจัดการสถานะ Open &rarr; In Progress &rarr; Closed
          </p>
        </div>

        {canCreateAlarm && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-lg transition-all shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>สร้าง Alarm ใหม่</span>
          </button>
        )}
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="p-4 mb-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-md light:bg-white light:border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Alarm Code, อาการ, หรือสาเหตุ..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">สถานะทั้งหมด (All Status)</option>
              <option value="Open">Open (ยังไม่แก้ไข)</option>
              <option value="In Progress">In Progress (กำลังตรวจสอบ)</option>
              <option value="Closed">Closed (แก้ไขเสร็จสิ้น)</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">ความรุนแรงทั้งหมด (All Severities)</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Machine Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">เครื่องจักรทั้งหมด (All Machines)</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.machine_id}] {m.machine_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 light:border-slate-200 text-xs">
            <span className="text-slate-400 light:text-slate-600">
              ผลการกรอง: พบ {filteredAlarms.length} รายการ
            </span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          </div>
        )}
      </div>

      {/* Alarm Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl light:bg-white light:border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 light:bg-slate-50 light:border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600">
                <th className="py-3 px-4">Alarm Code</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Description & Root Cause</th>
                <th className="py-3 px-4">Occurred At</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
                    กำลังโหลดข้อมูล Alarm...
                  </td>
                </tr>
              ) : filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-semibold text-slate-300 light:text-slate-700">
                      ไม่พบรายการแจ้งเตือนที่ตรงกับตัวกรอง
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ระบบและเครื่องจักรทำงานในเกณฑ์ปกติ
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((a) => {
                  const machineObj = machines.find((m) => m.id === a.machine_id || m.machine_id === a.machine_id);

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors"
                    >
                      {/* Alarm Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                        {a.alarm_code}
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4">
                        <SeverityBadge severity={a.severity} />
                      </td>

                      {/* Machine */}
                      <td className="py-3.5 px-4">
                        {machineObj ? (
                          <Link
                            href={`/machines/${machineObj.id}`}
                            className="font-medium text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>[{machineObj.machine_id}]</span>
                            <span className="text-white light:text-slate-900 truncate max-w-[140px]">
                              {machineObj.machine_name}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        ) : (
                          <span className="font-mono text-slate-400">{a.machine_id}</span>
                        )}
                      </td>

                      {/* Description & Cause */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-white light:text-slate-900">
                          {a.alarm_description}
                        </div>
                        {a.cause && (
                          <div className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5 truncate">
                            <span className="text-slate-500">สาเหตุ:</span> {a.cause}
                          </div>
                        )}
                      </td>

                      {/* Occurred At */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(a.occurred_at)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <AlarmStatusBadge status={a.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast Status Update (Technician & Admin) */}
                          {canUpdateAlarmStatus && (
                            <button
                              onClick={() => setStatusUpdateTarget(a)}
                              title="เปลี่ยนสถานะ (Open -> In Progress -> Closed)"
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Full Edit (Admin only) */}
                          {canEditAlarm && (
                            <button
                              onClick={() => handleOpenEdit(a)}
                              title="แก้ไขข้อมูล Alarm"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {canDeleteAlarm && (
                            <button
                              onClick={() => setDeleteTarget(a)}
                              title="ลบ Alarm"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AlarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alarm={editingAlarm}
      />

      <StatusUpdateModal
        isOpen={!!statusUpdateTarget}
        onClose={() => setStatusUpdateTarget(null)}
        alarm={statusUpdateTarget}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={`ยืนยันการลบ Alarm: ${deleteTarget?.alarm_code}`}
        message={`คุณต้องการลบข้อมูล Alarm '${deleteTarget?.alarm_code}' (${deleteTarget?.alarm_description}) ออกจากระบบหรือไม่?`}
        confirmLabel="ยืนยันการลบ"
        isDestructive={true}
      />
    </AppShell>
  );
}
