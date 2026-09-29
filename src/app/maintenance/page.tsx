'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
  Calendar,
  Package,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { MaintenanceStatusBadge } from '@/components/common/badge';
import { MaintenanceModal } from '@/components/maintenance/maintenance-modal';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '@/types';
import { formatDate } from '@/lib/utils';

export default function MaintenancePage() {
  const { maintenanceRecords, machines, profiles, deleteMaintenance, isLoading } = useData();
  const { canCreateMaintenance, canEditMaintenance, canDeleteMaintenance } = useAuth();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Maintenance
  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const machineObj = machines.find((mach) => mach.id === m.machine_id || mach.machine_id === m.machine_id);
      const techObj = profiles.find((p) => p.id === m.technician_id);

      const matchesSearch =
        !q ||
        m.problem.toLowerCase().includes(q) ||
        m.action_taken.toLowerCase().includes(q) ||
        (m.spare_part_used && m.spare_part_used.toLowerCase().includes(q)) ||
        (machineObj && machineObj.machine_name.toLowerCase().includes(q)) ||
        (machineObj && machineObj.machine_id.toLowerCase().includes(q)) ||
        (techObj && techObj.full_name.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'ALL' || m.maintenance_type === selectedType;

      const matchesStatus =
        selectedStatus === 'ALL' || m.status === selectedStatus;

      const matchesMachine =
        selectedMachine === 'ALL' ||
        m.machine_id === selectedMachine ||
        (machineObj && machineObj.machine_id === selectedMachine);

      return matchesSearch && matchesType && matchesStatus && matchesMachine;
    });
  }, [maintenanceRecords, machines, profiles, searchQuery, selectedType, selectedStatus, selectedMachine]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: MaintenanceRecord) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteMaintenance(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedMachine('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedMachine !== 'ALL';

  return (
    <AppShell title="Maintenance Operations (การบำรุงรักษา)">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
              ประวัติและแผนงานซ่อมบำรุงรักษาเครื่องจักร (Maintenance Log)
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-amber-400 border border-slate-700 light:bg-slate-100 light:border-slate-200">
              {filteredRecords.length} of {maintenanceRecords.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            ติดตาม Preventive Maintenance, แก้ไขปัญหาหน้างาน, และคำขอเบิกอะไหล่ (Waiting Part Change Request)
          </p>
        </div>

        {canCreateMaintenance && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg transition-all shadow-lg shadow-amber-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกงานซ่อมบำรุงใหม่</span>
          </button>
        )}
      </div>

      {/* Search & Multi-Filters */}
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
              placeholder="ค้นหา ปัญหา, วิธีแก้ไข, หรือช่างผู้ดูแล..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">ประเภททั้งหมด (All Types)</option>
              <option value="Preventive">Preventive (เชิงป้องกัน)</option>
              <option value="Corrective">Corrective (แก้ไขหลังเสีย)</option>
              <option value="Predictive">Predictive (คาดการณ์)</option>
              <option value="Overhaul">Overhaul (ยกเครื่อง)</option>
              <option value="Emergency Repair">Emergency (ฉุกเฉิน)</option>
            </select>
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
              <option value="Planned">Planned (ตามแผน)</option>
              <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
              <option value="Waiting Part">Waiting Part (รอเบิกอะไหล่)</option>
              <option value="Completed">Completed (เสร็จสิ้น)</option>
              <option value="Cancelled">Cancelled (ยกเลิก)</option>
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

        {/* Clear Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 light:border-slate-200 text-xs">
            <span className="text-slate-400 light:text-slate-600">
              ผลการกรอง: พบ {filteredRecords.length} รายการ
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

      {/* Maintenance Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl light:bg-white light:border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 light:bg-slate-50 light:border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600">
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Problem & Action</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Spare Part / CR</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    กำลังโหลดข้อมูล Maintenance...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-semibold text-slate-300 light:text-slate-700">
                      ไม่พบรายการซ่อมบำรุงที่ตรงกับเงื่อนไข
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ลองเปลี่ยนตัวกรองหรือคำค้นหา
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((m) => {
                  const machineObj = machines.find((mach) => mach.id === m.machine_id || mach.machine_id === m.machine_id);
                  const techObj = profiles.find((p) => p.id === m.technician_id);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors"
                    >
                      {/* Machine */}
                      <td className="py-3.5 px-4">
                        {machineObj ? (
                          <Link
                            href={`/machines/${machineObj.id}`}
                            className="font-medium text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>[{machineObj.machine_id}]</span>
                            <span className="text-white light:text-slate-900 truncate max-w-[130px]">
                              {machineObj.machine_name}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        ) : (
                          <span className="font-mono text-slate-400">{m.machine_id}</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 light:bg-slate-100 light:text-slate-800 light:border-slate-200">
                          {m.maintenance_type}
                        </span>
                      </td>

                      {/* Problem & Action */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-white light:text-slate-900">
                          {m.problem}
                        </div>
                        <div className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5">
                          <span className="text-slate-500">วิธีแก้ไข:</span> {m.action_taken}
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                        {techObj?.full_name || m.technician?.full_name || 'Staff Technician'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{m.maintenance_date ? m.maintenance_date.split('T')[0] : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Spare Part / Waiting Part */}
                      <td className="py-3.5 px-4">
                        {m.spare_part_change_request ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            <Package className="w-3 h-3" />
                            CR Request
                          </span>
                        ) : m.spare_part_used ? (
                          <span className="text-slate-300 light:text-slate-700 text-[11px] truncate max-w-[120px] block">
                            {m.spare_part_used}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <MaintenanceStatusBadge status={m.status as MaintenanceStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEditMaintenance && (
                            <button
                              onClick={() => handleOpenEdit(m)}
                              title="แก้ไขข้อมูล Maintenance"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteMaintenance && (
                            <button
                              onClick={() => setDeleteTarget(m)}
                              title="ลบข้อมูล Maintenance"
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
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={editingRecord}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="ยืนยันการลบประวัติงานซ่อมบำรุง"
        message={`คุณต้องการลบรายการบำรุงรักษา '${deleteTarget?.problem}' หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันการลบ"
        isDestructive={true}
      />
    </AppShell>
  );
}
