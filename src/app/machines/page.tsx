'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  History,
  Activity,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge } from '@/components/common/badge';
import { MachineModal } from '@/components/machines/machine-modal';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';
import { Machine, MachineStatus } from '@/types';

export default function MachinesPage() {
  const { machines, deleteMachine, isLoading } = useData();
  const { canCreateMachine, canEditMachine, canDeleteMachine } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Machines
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.machine_id.toLowerCase().includes(q) ||
        m.machine_name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        (m.ip_address && m.ip_address.toLowerCase().includes(q));

      const matchesStatus =
        selectedStatus === 'ALL' || m.status === selectedStatus;

      const matchesType =
        selectedType === 'ALL' || m.machine_type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [machines, searchQuery, selectedStatus, selectedType]);

  const machineTypes = useMemo(() => {
    const types = new Set(machines.map((m) => m.machine_type));
    return Array.from(types);
  }, [machines]);

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Machine) => {
    setEditingMachine(m);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteMachine(deleteTarget.id);
    setIsDeleting(false);

    if (res.success) {
      setDeleteTarget(null);
    } else {
      setDeleteError(res.error || 'ไม่สามารถลบเครื่องจักรได้');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedStatus !== 'ALL' || selectedType !== 'ALL';

  return (
    <AppShell title="Machine Master (ทะเบียนเครื่องจักร)">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
              ทะเบียนเครื่องจักรและอุปกรณ์อุตสาหกรรม
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-cyan-400 border border-slate-700 light:bg-slate-100 light:border-slate-200">
              {filteredMachines.length} of {machines.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            ศูนย์รวมข้อมูล Machine ID, สถานะการทำงาน, ตำแหน่งพิกัดโรงงาน และการเชื่อมต่อ SCADA
          </p>
        </div>

        {canCreateMachine && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเครื่องจักรใหม่</span>
          </button>
        )}
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="p-4 mb-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-md light:bg-white light:border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วย Machine ID, ชื่อเครื่องจักร หรือ Location..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Status Multi-Filter */}
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
              <option value="Running">Running</option>
              <option value="Stop">Stop</option>
              <option value="Alarm">Alarm</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">ประเภททั้งหมด (All Types)</option>
              {machineTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 light:border-slate-200 text-xs">
            <span className="text-slate-400 light:text-slate-600">
              กำลังแสดงตัวกรองที่เลือก (พบ {filteredMachines.length} รายการ)
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

      {/* Machine Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl light:bg-white light:border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 light:bg-slate-50 light:border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600">
                <th className="py-3 px-4">Machine ID</th>
                <th className="py-3 px-4">Machine Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">SCADA Link / IP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    กำลังโหลดข้อมูลเครื่องจักร...
                  </td>
                </tr>
              ) : filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-300 light:text-slate-700">
                      ไม่พบข้อมูลเครื่องจักรที่ตรงกับเงื่อนไข
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ลองค้นหาด้วยคำอื่น หรือคลิกปุ่ม &quot;ล้างตัวกรอง&quot;
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMachines.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors group"
                  >
                    {/* Machine ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 light:text-cyan-600">
                      <Link
                        href={`/machines/${m.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        {m.machine_id}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>

                    {/* Machine Name */}
                    <td className="py-3.5 px-4 font-medium text-white light:text-slate-900">
                      <div>{m.machine_name}</div>
                      {m.description && (
                        <div className="text-[11px] text-slate-400 light:text-slate-500 truncate max-w-xs">
                          {m.description}
                        </div>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                      {m.machine_type}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{m.location}</span>
                      </div>
                    </td>

                    {/* IP & Protocol */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {m.ip_address ? (
                        <span>
                          {m.ip_address} <span className="text-slate-500">({m.protocol || 'TCP'})</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={m.status as MachineStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View History Timeline Link */}
                        <Link
                          href={`/machines/${m.id}`}
                          title="ดูประวัติเครื่องจักร (History Timeline)"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </Link>

                        {/* Edit Action (Admin only) */}
                        {canEditMachine && (
                          <button
                            onClick={() => handleOpenEdit(m)}
                            title="แก้ไขข้อมูลเครื่องจักร"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Action (Admin only) */}
                        {canDeleteMachine && (
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(m);
                            }}
                            title="ลบเครื่องจักร"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Machine Modal */}
      <MachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machine={editingMachine}
      />

      {/* Delete Confirmation Modal with Data Integrity Guard */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={`ยืนยันการลบเครื่องจักร: ${deleteTarget?.machine_id}`}
        message={
          deleteError
            ? deleteError
            : `คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องจักร '${deleteTarget?.machine_name}' (${deleteTarget?.machine_id})? ระบบจะตรวจสอบการเชื่อมโยงข้อมูลกับประวัติ Alarm และ Maintenance ก่อนทำการลบ`
        }
        confirmLabel="ยืนยันการลบ"
        isDestructive={true}
      />
    </AppShell>
  );
}
