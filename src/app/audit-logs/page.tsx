"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const { auditLogs } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEntity = entityFilter === "ALL" || log.entity === entityFilter;
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 light:text-slate-900">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Plant Audit Logs (บันทึกประวัติการเปลี่ยนแปลงของระบบ)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                Bonus Feature
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ตรวจสอบประวัติการเพิ่ม แก้ไข ลบ และเปลี่ยนสถานะเครื่องจักร สัญญาณเตือน และงานซ่อมบำรุง
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-md light:bg-white light:border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาผู้ปฏิบัติงาน หรือ ID รายการ..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:text-slate-900"
              />
            </div>

            <div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-mono"
              >
                <option value="ALL">หมวดข้อมูลทั้งหมด (All Entities)</option>
                <option value="Machine">Machine (เครื่องจักร)</option>
                <option value="Alarm">Alarm (สัญญาณเตือน)</option>
                <option value="Maintenance">Maintenance (งานซ่อมบำรุง)</option>
              </select>
            </div>

            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 light:bg-slate-50 light:text-slate-900 font-mono"
              >
                <option value="ALL">การกระทำทั้งหมด (All Actions)</option>
                <option value="CREATE">CREATE (สร้างใหม่)</option>
                <option value="UPDATE">UPDATE (แก้ไขข้อมูล)</option>
                <option value="DELETE">DELETE (ลบข้อมูล)</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE (เปลี่ยนสถานะ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#121824] border border-slate-800 rounded-xl shadow-lg overflow-hidden light:bg-white light:border-slate-200">
          <div className="p-4 border-b border-slate-800 text-xs text-slate-400 font-mono flex justify-between light:border-slate-200">
            <span>บันทึกทั้งหมด: {filteredLogs.length} รายการ</span>
            <span>ความปลอดภัยและมาตรฐาน ISO/Audit</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              ไม่พบประวัติการทำรายการตามเงื่อนไข
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800 light:bg-slate-50 light:border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Timestamp</th>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                    <th className="px-5 py-3 font-semibold">Entity & ID</th>
                    <th className="px-5 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {filteredLogs.map((log) => {
                    const actionStyles: Record<string, string> = {
                      CREATE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                      UPDATE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                      DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                      STATUS_CHANGE: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    };

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-800/30 transition-colors light:hover:bg-slate-50"
                      >
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200 light:text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.user_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              actionStyles[log.action] || "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className="text-slate-400">{log.entity}: </span>
                          <span className="text-cyan-400 font-semibold">{log.entity_id}</span>
                        </td>
                        <td className="px-5 py-3.5 max-w-md">
                          <pre className="text-[11px] font-mono bg-slate-900/60 p-1.5 rounded border border-slate-800/60 overflow-x-auto text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-800">
                            {JSON.stringify(log.details || {}, null, 1)}
                          </pre>
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
    </AppShell>
  );
}
