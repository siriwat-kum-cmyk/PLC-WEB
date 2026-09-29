"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { MaintenanceModal } from "@/components/maintenance/maintenance-modal";
import { MaintenanceRecord, MaintenanceStatus } from "@/types";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Edit2,
  Trash2,
  Package,
  User,
} from "lucide-react";
import { getMaintenanceStatusBadge, formatDateOnly } from "@/lib/utils";

export default function MaintenancePage() {
  const { machines, maintenance, addMaintenance, updateMaintenance, deleteMaintenance } = useData();
  const { canEditMaintenance, isAdmin } = useAuth();

  // Multi-condition Search & Filters (Requirement 3.5 & Change Requests)
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter Maintenance records with multiple conditions simultaneously
  const filteredRecords = maintenance.filter((m) => {
    const matchesSearch =
      m.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.technician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.action_taken && m.action_taken.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMachine = machineFilter === "ALL" || m.machine_id === machineFilter;
    const matchesType = typeFilter === "ALL" || m.maintenance_type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesDate = !dateFilter || m.scheduled_date === dateFilter;

    return matchesSearch && matchesMachine && matchesType && matchesStatus && matchesDate;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: MaintenanceRecord) => {
    setEditingRecord(rec);
    setModalOpen(true);
  };

  const handleQuickStatusChange = async (rec: MaintenanceRecord, newStatus: MaintenanceStatus) => {
    const res = await updateMaintenance(rec.id, {
      status: newStatus,
      completed_date: newStatus === "Completed" ? new Date().toISOString().split("T")[0] : undefined,
    });
    if (res.success) {
      setFeedbackMsg({
        type: "success",
        text: `อัปเดตสถานะงานซ่อมเป็น '${newStatus}' เรียบร้อยแล้ว`,
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบใบสั่งซ่อมบำรุงนี้?")) {
      const res = await deleteMaintenance(id);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "ลบใบสั่งซ่อมบำรุงเรียบร้อยแล้ว" });
        setTimeout(() => setFeedbackMsg(null), 3000);
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
              <Wrench className="w-5 h-5 text-amber-400 light:text-amber-600" />
              <span>Maintenance Work Orders (ระบบงานซ่อมบำรุง)</span>
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              จัดการใบสั่งซ่อมบำรุงเชิงป้องกัน (PM), ซ่อมด่วน (BM), รองรับสถานะรอเบิกอะไหล่ (Waiting Part)
            </p>
          </div>

          {canEditMaintenance && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>เปิดใบสั่งซ่อมบำรุง (New Work Order)</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 light:bg-emerald-50 light:text-emerald-800 light:border-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300 light:bg-rose-50 light:text-rose-800 light:border-rose-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* 3.5 & Change Request: Multi-Condition Search & Filters */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-md light:bg-white light:border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300 light:text-slate-700">
            <Filter className="w-3.5 h-3.5 text-amber-400 light:text-amber-600" />
            <span>Maintenance Multi-Filter (ค้นหาและกรองหลายเงื่อนไขรวมถึงช่วงวันที่ - CR)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Condition 1: Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาปัญหา, ช่างผู้รับผิดชอบ..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
            </div>

            {/* Condition 2: Machine Filter */}
            <div>
              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900 font-mono"
              >
                <option value="ALL">เครื่องจักรทั้งหมด (All Machines)</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.machine_id} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition 3: Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900 font-mono"
              >
                <option value="ALL">ประเภทงานทั้งหมด (All Types)</option>
                <option value="Preventive (PM)">Preventive (PM)</option>
                <option value="Breakdown (BM)">Breakdown (BM)</option>
                <option value="Corrective (CM)">Corrective (CM)</option>
              </select>
            </div>

            {/* Condition 4: Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900 font-bold"
              >
                <option value="ALL">สถานะทั้งหมด (All Status)</option>
                <option value="Pending">Pending (รอดำเนินการ)</option>
                <option value="In Progress">In Progress (กำลังซ่อม)</option>
                <option value="Waiting Part">🟣 Waiting Part (รออะไหล่ - CR)</option>
                <option value="Completed">Completed (เสร็จสิ้น)</option>
              </select>
            </div>

            {/* Condition 5: Date Filter */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono light:bg-slate-50 light:border-slate-300 light:text-slate-900"
                title="Filter by Scheduled Date"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="px-2 py-2 text-xs text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900"
                  title="Clear Date"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl shadow-lg overflow-hidden light:bg-white light:border-slate-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 light:text-slate-600 light:border-slate-200 font-mono">
            <span>แสดง: {filteredRecords.length} ใบสั่งซ่อมบำรุง</span>
            <span>บันทึกและติดตามสถานะงานซ่อม</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              ไม่พบงานซ่อมบำรุงที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800 light:bg-slate-100 light:text-slate-700 light:border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Machine</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Problem & Action Taken</th>
                    <th className="px-5 py-3 font-semibold">Technician</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {filteredRecords.map((maint) => {
                    const m = machines.find((mac) => mac.id === maint.machine_id);
                    const statusBadge = getMaintenanceStatusBadge(maint.status);

                    return (
                      <tr
                        key={maint.id}
                        className="hover:bg-slate-800/30 transition-colors light:hover:bg-slate-50"
                      >
                        {/* Machine */}
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/machines/${m?.id}`}
                            className="font-mono text-cyan-400 hover:underline font-bold text-xs flex items-center gap-1 light:text-cyan-700"
                            title="ดูประวัติเครื่องจักร"
                          >
                            <span>{m?.machine_id}</span>
                          </Link>
                          <div className="text-[11px] text-slate-400 light:text-slate-600 truncate max-w-[130px]">
                            {m?.name}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border font-medium ${
                              maint.maintenance_type === "Preventive (PM)"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 light:bg-emerald-50 light:text-emerald-800 light:border-emerald-300"
                                : maint.maintenance_type === "Breakdown (BM)"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 light:bg-rose-50 light:text-rose-800 light:border-rose-300"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30 light:bg-blue-50 light:text-blue-800 light:border-blue-300"
                            }`}
                          >
                            {maint.maintenance_type}
                          </span>
                        </td>

                        {/* Problem & Action Taken */}
                        <td className="px-5 py-3.5 max-w-sm">
                          <div className="font-semibold text-white light:text-slate-900">
                            {maint.problem}
                          </div>
                          {maint.action_taken && (
                            <div className="text-[11px] text-slate-400 light:text-slate-700 mt-1 bg-slate-900/60 light:bg-slate-100 p-1.5 rounded border border-slate-800/60 light:border-slate-200">
                              <span className="text-cyan-400 light:text-cyan-700 font-mono">Action:</span>{" "}
                              {maint.action_taken}
                            </div>
                          )}
                        </td>

                        {/* Technician */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{maint.technician_name}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 font-mono text-slate-400 light:text-slate-600">
                          <div>Plan: {formatDateOnly(maint.scheduled_date)}</div>
                          {maint.completed_date && (
                            <div className="text-[10px] text-emerald-400 light:text-emerald-700">
                              Done: {formatDateOnly(maint.completed_date)}
                            </div>
                          )}
                        </td>

                        {/* Status (with Waiting Part Highlight) */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${statusBadge.bg}`}
                          >
                            {maint.status === "Waiting Part" && (
                              <Package className="w-3 h-3 mr-1 text-purple-400" />
                            )}
                            <span>{maint.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right space-x-1">
                          {canEditMaintenance && maint.status !== "Completed" && (
                            <button
                              onClick={() => handleQuickStatusChange(maint, "Completed")}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors light:bg-emerald-50 light:text-emerald-800 light:border-emerald-300"
                              title="เปลี่ยนเป็น Completed"
                            >
                              Complete
                            </button>
                          )}

                          {canEditMaintenance && (
                            <button
                              onClick={() => handleOpenEdit(maint)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors light:text-slate-500 light:hover:bg-slate-100 light:hover:text-amber-600"
                              title="แก้ไขใบสั่งซ่อม"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(maint.id)}
                              className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors light:text-slate-500 light:hover:bg-rose-50 light:hover:text-rose-600"
                              title="ลบใบสั่งซ่อม"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={
          editingRecord
            ? (data) => updateMaintenance(editingRecord.id, data)
            : addMaintenance
        }
        initialData={editingRecord}
        machines={machines}
      />
    </AppShell>
  );
}
