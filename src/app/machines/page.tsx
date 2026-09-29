"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { MachineModal } from "@/components/machines/machine-modal";
import { Machine, MachineStatus } from "@/types";
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  CheckCircle,
} from "lucide-react";
import { getMachineStatusBadge, formatDateOnly } from "@/lib/utils";

export default function MachinesPage() {
  const { machines, addMachine, updateMachine, deleteMachine } = useData();
  const { canManageMachines } = useAuth();

  // Multi-condition Filter states (Requirement 3.5)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter machines with multiple conditions simultaneously
  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesLocation = locationFilter === "ALL" || m.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(machines.map((m) => m.location)));

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, machineId: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องจักร '${machineId}' ออกจากระบบ?`)) {
      const res = await deleteMachine(id);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: `ลบเครื่องจักร ${machineId} เรียบร้อยแล้ว` });
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "ไม่สามารถลบเครื่องจักรได้" });
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 light:text-slate-900">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Machine Master (ทะเบียนเครื่องจักร)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              จัดการข้อมูลเครื่องจักรหลัก ตรวจสอบสถานะการทำงาน และประวัติการซ่อมบำรุง
            </p>
          </div>

          {canManageMachines && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเครื่องจักรใหม่ (Add Machine)</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* 3.5 Multi-Condition Search & Filter Bar */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-md light:bg-white light:border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300 light:text-slate-700">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search & Multi-Filter (ค้นหาและกรองข้อมูลอย่างน้อย 2 เงื่อนไข)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Condition 1: Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหา Machine ID, ชื่อ, หรือประเภท..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:text-slate-900"
              />
            </div>

            {/* Condition 2: Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-mono"
              >
                <option value="ALL">สถานะทั้งหมด (All Status)</option>
                <option value="Running">🟢 Running (กำลังทำงาน)</option>
                <option value="Stop">⚪ Stop (หยุดทำงาน)</option>
                <option value="Alarm">🔴 Alarm (มีสัญญาณเตือน)</option>
                <option value="Maintenance">🟡 Maintenance (ซ่อมบำรุง)</option>
              </select>
            </div>

            {/* Condition 3: Location Filter */}
            <div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-mono"
              >
                <option value="ALL">ตำแหน่งทั้งหมด (All Locations)</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Machine Table / Cards */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl shadow-lg overflow-hidden light:bg-white light:border-slate-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 light:border-slate-200 font-mono">
            <span>ผลการค้นหา: {filteredMachines.length} เครื่องจักร</span>
            <span>แสดงตามทะเบียนเครื่องจักร</span>
          </div>

          {filteredMachines.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              ไม่พบเครื่องจักรที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800 light:bg-slate-50 light:border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Machine ID</th>
                    <th className="px-5 py-3 font-semibold">Name & Type</th>
                    <th className="px-5 py-3 font-semibold">Location</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Installed</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {filteredMachines.map((m) => {
                    const badge = getMachineStatusBadge(m.status);
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-800/30 transition-colors light:hover:bg-slate-50"
                      >
                        {/* Machine ID */}
                        <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">
                          {m.machine_id}
                        </td>

                        {/* Name & Type */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white light:text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-400">{m.type}</div>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-3.5 text-slate-300 light:text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.location}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                            <span>{m.status}</span>
                          </span>
                        </td>

                        {/* Installed Date */}
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {formatDateOnly(m.installed_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right space-x-1">
                          {/* Machine History (Bonus & CR) */}
                          <Link
                            href={`/machines/${m.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-[11px]"
                            title="ดูประวัติไทม์ไลน์เครื่องจักร (Machine History)"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                            <span>History</span>
                          </Link>

                          {/* Admin Edit & Delete */}
                          {canManageMachines && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(m)}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                                title="แก้ไขเครื่องจักร (Edit)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(m.id, m.machine_id)}
                                className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                                title="ลบเครื่องจักร (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Machine Modal */}
      <MachineModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingMachine ? (data) => updateMachine(editingMachine.id, data) : addMachine}
        initialData={editingMachine}
        existingMachineIds={machines.map((m) => m.machine_id)}
      />
    </AppShell>
  );
}
