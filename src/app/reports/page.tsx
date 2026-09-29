"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useData } from "@/context/data-context";
import {
  FileSpreadsheet,
  Download,
  Cpu,
  AlertTriangle,
  Wrench,
  CheckCircle,
} from "lucide-react";

export default function ReportsPage() {
  const { machines, alarms, maintenance } = useData();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const downloadCSV = (filename: string, csvContent: string) => {
    // Add UTF-8 BOM so Excel displays Thai characters perfectly without encoding errors!
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`ส่งออกไฟล์ ${filename} สำเร็จเรียบร้อย`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const exportMachinesCSV = () => {
    const headers = ["Machine ID", "Name", "Type", "Location", "Status", "Installed Date", "Description"];
    const rows = machines.map((m) => [
      `"${m.machine_id}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      `"${m.location}"`,
      `"${m.status}"`,
      `"${m.installed_at || ""}"`,
      `"${(m.description || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`machine_master_${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const exportAlarmsCSV = () => {
    const headers = ["Alarm Code", "Machine ID", "Description", "Severity", "Status", "Cause", "Resolution", "Triggered At", "Resolved At"];
    const rows = alarms.map((a) => {
      const m = machines.find((mac) => mac.id === a.machine_id);
      return [
        `"${a.alarm_code}"`,
        `"${m?.machine_id || a.machine_id}"`,
        `"${a.description.replace(/"/g, '""')}"`,
        `"${a.severity}"`,
        `"${a.status}"`,
        `"${(a.cause || "").replace(/"/g, '""')}"`,
        `"${(a.resolution || "").replace(/"/g, '""')}"`,
        `"${a.triggered_at}"`,
        `"${a.resolved_at || ""}"`,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`alarms_history_${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const exportMaintenanceCSV = () => {
    const headers = ["Machine ID", "Type", "Problem", "Technician", "Status", "Scheduled Date", "Completed Date", "Action Taken"];
    const rows = maintenance.map((mr) => {
      const m = machines.find((mac) => mac.id === mr.machine_id);
      return [
        `"${m?.machine_id || mr.machine_id}"`,
        `"${mr.maintenance_type}"`,
        `"${mr.problem.replace(/"/g, '""')}"`,
        `"${mr.technician_name.replace(/"/g, '""')}"`,
        `"${mr.status}"`,
        `"${mr.scheduled_date}"`,
        `"${mr.completed_date || ""}"`,
        `"${(mr.action_taken || "").replace(/"/g, '""')}"`,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`maintenance_records_${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 light:text-slate-900">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 light:text-emerald-600" />
              <span>Data Export & Reports (ส่งออกข้อมูล CSV / Excel)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono light:bg-amber-100 light:text-amber-800 light:border-amber-300">
                Bonus Feature
              </span>
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
              ดาวน์โหลดรายงานฐานข้อมูลเป็นไฟล์ CSV พร้อมเปิดใช้งานใน Microsoft Excel และ Google Sheets
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {downloadSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 light:bg-emerald-50 light:text-emerald-800 light:border-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Machine Master Export */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between light:bg-white light:border-slate-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 light:text-cyan-700 light:bg-cyan-50 light:border-cyan-300 mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 light:text-slate-900">Machine Master Report</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
                รายชื่อเครื่องจักรทั้งหมด สเปก ตำแหน่งที่ตั้ง และสถานะการทำงานปัจจุบัน
              </p>
              <div className="text-xs font-mono text-cyan-400 bg-cyan-500/5 px-2.5 py-1.5 rounded border border-cyan-500/20 mb-4 light:bg-cyan-50 light:text-cyan-800 light:border-cyan-300">
                จำนวน: {machines.length} เครื่องจักร
              </div>
            </div>
            <button
              onClick={exportMachinesCSV}
              className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-cyan-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Machine Master (.csv)</span>
            </button>
          </div>

          {/* Card 2: Alarms Export */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between light:bg-white light:border-slate-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 light:text-rose-700 light:bg-rose-50 light:border-rose-300 mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 light:text-slate-900">Alarms History Report</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
                ประวัติสัญญาณเตือนทั้งหมด ระดับความรุนแรง สาเหตุ และแนวทางการแก้ไข
              </p>
              <div className="text-xs font-mono text-rose-400 bg-rose-500/5 px-2.5 py-1.5 rounded border border-rose-500/20 mb-4 light:bg-rose-50 light:text-rose-800 light:border-rose-300">
                จำนวน: {alarms.length} รายการสัญญาณเตือน
              </div>
            </div>
            <button
              onClick={exportAlarmsCSV}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Alarms History (.csv)</span>
            </button>
          </div>

          {/* Card 3: Maintenance Export */}
          <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between light:bg-white light:border-slate-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 light:text-amber-700 light:bg-amber-50 light:border-amber-300 mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 light:text-slate-900">Maintenance Work Orders</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
                บันทึกใบสั่งซ่อมบำรุงเชิงป้องกัน (PM) และแก้ปัญหา (BM) รวมถึงสถานะรออะไหล่
              </p>
              <div className="text-xs font-mono text-amber-400 bg-amber-500/5 px-2.5 py-1.5 rounded border border-amber-500/20 mb-4 light:bg-amber-50 light:text-amber-800 light:border-amber-300">
                จำนวน: {maintenance.length} ใบสั่งซ่อม
              </div>
            </div>
            <button
              onClick={exportMaintenanceCSV}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Maintenance (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
