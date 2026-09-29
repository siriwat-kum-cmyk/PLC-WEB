"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { AlarmModal } from "@/components/alarms/alarm-modal";
import { Alarm } from "@/types";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  getAlarmSeverityBadge,
  getAlarmStatusBadge,
  formatDate,
} from "@/lib/utils";

export default function AlarmsPage() {
  const { machines, alarms, addAlarm, updateAlarm, deleteAlarm } = useData();
  const { canUpdateAlarm, isAdmin } = useAuth();

  // Multi-Condition Search & Filters (Requirement 3.5)
  const [searchTerm, setSearchTerm] = useState("");
  const [machineFilter, setMachineFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter Alarms with multiple conditions simultaneously
  const filteredAlarms = alarms.filter((a) => {
    const matchesSearch =
      a.alarm_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.cause && a.cause.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMachine = machineFilter === "ALL" || a.machine_id === machineFilter;
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || a.severity === severityFilter;

    return matchesSearch && matchesMachine && matchesStatus && matchesSeverity;
  });

  const handleOpenAdd = () => {
    setEditingAlarm(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setModalOpen(true);
  };

  const handleQuickClose = async (alarm: Alarm) => {
    const resPrompt = prompt(
      `ปิดสัญญาณเตือน ${alarm.alarm_code}\nกรุณาระบุแนวทางการแก้ไข (Resolution):`,
      "ตรวจสอบระบบและแก้ไขการทำงานเรียบร้อยแล้ว"
    );
    if (resPrompt) {
      const res = await updateAlarm(alarm.id, {
        status: "Closed",
        resolution: resPrompt,
        resolved_at: new Date().toISOString(),
      });
      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: `ปิดงาน Alarm ${alarm.alarm_code} สำเร็จ เครื่องจักรกลับสู่สถานะปกติ`,
        });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Alarm '${code}'?`)) {
      const res = await deleteAlarm(id);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: `ลบ Alarm ${code} เรียบร้อยแล้ว` });
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
              <AlertTriangle className="w-5 h-5 text-rose-400 light:text-rose-600" />
              <span>Alarm Record & Incident Management (บันทึกสัญญาณเตือน)</span>
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              ติดตามสัญญาณเตือน วิเคราะห์สาเหตุ (Root Cause) และบันทึกแนวทางแก้ไขตามวงจร Open ➔ In Progress ➔ Closed
            </p>
          </div>

          {canUpdateAlarm && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>แจ้งเตือน Alarm ใหม่ (Trigger Alarm)</span>
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

        {/* 3.5 Multi-Condition Search & Filter Bar */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-md light:bg-white light:border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300 light:text-slate-700">
            <Filter className="w-3.5 h-3.5 text-rose-400 light:text-rose-600" />
            <span>Alarm Search & Multi-Filter (กรองตามเครื่องจักร, สถานะ, ความรุนแรง)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Condition 1: Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารหัส Alarm, รายละเอียด, สาเหตุ..."
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

            {/* Condition 3: Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900 font-mono"
              >
                <option value="ALL">สถานะทั้งหมด (All Status)</option>
                <option value="Open">🔴 Open (รอตรวจสอบ)</option>
                <option value="In Progress">🟡 In Progress (กำลังแก้ไข)</option>
                <option value="Closed">🟢 Closed (ปิดงานแล้ว)</option>
              </select>
            </div>

            {/* Condition 4: Severity Filter */}
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900 font-mono"
              >
                <option value="ALL">ความรุนแรงทั้งหมด (All Severity)</option>
                <option value="Critical">Critical (วิกฤต)</option>
                <option value="High">High (สูง)</option>
                <option value="Medium">Medium (ปานกลาง)</option>
                <option value="Low">Low (ต่ำ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alarms Table */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl shadow-lg overflow-hidden light:bg-white light:border-slate-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 light:text-slate-600 light:border-slate-200 font-mono">
            <span>แสดง: {filteredAlarms.length} รายการสัญญาณเตือน</span>
            <span>บันทึกประวัติการเกิดข้อผิดพลาด</span>
          </div>

          {filteredAlarms.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              ไม่พบรายการสัญญาณเตือนที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800 light:bg-slate-100 light:text-slate-700 light:border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Alarm Code</th>
                    <th className="px-5 py-3 font-semibold">Machine</th>
                    <th className="px-5 py-3 font-semibold">Severity</th>
                    <th className="px-5 py-3 font-semibold">Description & Cause</th>
                    <th className="px-5 py-3 font-semibold">Triggered</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {filteredAlarms.map((a) => {
                    const m = machines.find((mac) => mac.id === a.machine_id);
                    const sevBadge = getAlarmSeverityBadge(a.severity);
                    const statusBadge = getAlarmStatusBadge(a.status);

                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-800/30 transition-colors light:hover:bg-slate-50"
                      >
                        {/* Code */}
                        <td className="px-5 py-3.5 font-mono font-bold text-rose-400 light:text-rose-600">
                          {a.alarm_code}
                        </td>

                        {/* Machine */}
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/machines/${m?.id}`}
                            className="font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold light:text-cyan-700"
                            title="ดูประวัติเครื่องจักร"
                          >
                            <span>{m?.machine_id}</span>
                          </Link>
                          <div className="text-[11px] text-slate-400 light:text-slate-600 truncate max-w-[140px]">
                            {m?.name}
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${sevBadge.bg}`}
                          >
                            {a.severity}
                          </span>
                        </td>

                        {/* Description & Cause */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-semibold text-white light:text-slate-900">
                            {a.description}
                          </div>
                          {a.cause && (
                            <div className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                              <span className="text-slate-500">สาเหตุ:</span> {a.cause}
                            </div>
                          )}
                          {a.resolution && (
                            <div className="text-[11px] text-emerald-400 light:text-emerald-700 mt-0.5">
                              <span className="text-emerald-500/70 light:text-emerald-600">วิธีแก้:</span> {a.resolution}
                            </div>
                          )}
                        </td>

                        {/* Triggered Date */}
                        <td className="px-5 py-3.5 font-mono text-slate-400 light:text-slate-600">
                          {formatDate(a.triggered_at)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusBadge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                            <span>{a.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right space-x-1">
                          {canUpdateAlarm && a.status !== "Closed" && (
                            <button
                              onClick={() => handleQuickClose(a)}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors light:bg-emerald-50 light:text-emerald-800 light:border-emerald-300"
                              title="ปิด Alarm พร้อมบันทึกวิธีแก้"
                            >
                              Close
                            </button>
                          )}

                          {canUpdateAlarm && (
                            <button
                              onClick={() => handleOpenEdit(a)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors light:text-slate-500 light:hover:bg-slate-100 light:hover:text-amber-600"
                              title="แก้ไขรายละเอียด"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(a.id, a.alarm_code)}
                              className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors light:text-slate-500 light:hover:bg-rose-50 light:hover:text-rose-600"
                              title="ลบ Alarm"
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

      {/* Alarm Modal */}
      <AlarmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingAlarm ? (data) => updateAlarm(editingAlarm.id, data) : addAlarm}
        initialData={editingAlarm}
        machines={machines}
      />
    </AppShell>
  );
}
