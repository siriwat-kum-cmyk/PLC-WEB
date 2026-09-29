'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Cpu,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { useData } from '@/context/data-context';

export default function ReportsPage() {
  const { machines, alarms, maintenanceRecords } = useData();

  const downloadCSV = (filename: string, csvContent: string) => {
    // Add UTF-8 BOM so Excel opens Thai characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMachines = () => {
    const headers = ['Machine ID', 'Machine Name', 'Type', 'Location', 'Status', 'IP Address', 'Protocol', 'Installed Date'];
    const rows = machines.map((m) => [
      `"${m.machine_id}"`,
      `"${m.machine_name.replace(/"/g, '""')}"`,
      `"${m.machine_type}"`,
      `"${m.location.replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.ip_address || ''}"`,
      `"${m.protocol || ''}"`,
      `"${m.installation_date || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`SCADA_Machines_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportAlarms = () => {
    const headers = ['Alarm Code', 'Severity', 'Machine ID', 'Description', 'Cause', 'Status', 'Occurred At', 'Resolved At'];
    const rows = alarms.map((a) => [
      `"${a.alarm_code}"`,
      `"${a.severity}"`,
      `"${a.machine_id}"`,
      `"${a.alarm_description.replace(/"/g, '""')}"`,
      `"${(a.cause || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.occurred_at}"`,
      `"${a.resolved_at || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`SCADA_Alarms_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportMaintenance = () => {
    const headers = ['Machine ID', 'Type', 'Problem', 'Action Taken', 'Technician ID', 'Date', 'Status', 'Cost (THB)', 'Part Used', 'Waiting Part CR'];
    const rows = maintenanceRecords.map((m) => [
      `"${m.machine_id}"`,
      `"${m.maintenance_type}"`,
      `"${m.problem.replace(/"/g, '""')}"`,
      `"${m.action_taken.replace(/"/g, '""')}"`,
      `"${m.technician_id}"`,
      `"${m.maintenance_date}"`,
      `"${m.status}"`,
      `"${m.cost || 0}"`,
      `"${(m.spare_part_used || '').replace(/"/g, '""')}"`,
      `"${m.spare_part_change_request ? 'YES' : 'NO'}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`SCADA_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <AppShell title="Data Reports & CSV Export (การส่งออกข้อมูล)">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
              ศูนย์ส่งออกข้อมูลและรายงาน (Data Export Center)
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              UTF-8 CSV Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            ดาวน์โหลดไฟล์ CSV สำหรับวิเคราะห์ใน Microsoft Excel หรือระบบภายนอก รองรับภาษาไทยสมบูรณ์แบบ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Machine Master Export */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-4 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white light:text-slate-900 mb-1">
              Machine Master Data
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600 mb-4 leading-relaxed">
              ส่งออกรายการเครื่องจักรทั้งหมด พร้อมสถานะ, พิกัดตำแหน่งในโรงงาน, และไอพีแอดเดรส
            </p>
            <div className="text-xs font-mono text-slate-500 mb-6">
              จำนวนข้อมูล: <strong className="text-cyan-400">{machines.length}</strong> แถว
            </div>
          </div>

          <button
            onClick={exportMachines}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-600/20 active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV เครื่องจักร</span>
          </button>
        </div>

        {/* Alarms Export */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mb-4 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white light:text-slate-900 mb-1">
              Alarm Incidents Data
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600 mb-4 leading-relaxed">
              ส่งออกประวัติการแจ้งเตือน Alarm Code, ระดับความรุนแรง, สาเหตุ และเวลาที่เกิดขึ้น
            </p>
            <div className="text-xs font-mono text-slate-500 mb-6">
              จำนวนข้อมูล: <strong className="text-rose-400">{alarms.length}</strong> แถว
            </div>
          </div>

          <button
            onClick={exportAlarms}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-600/20 active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV Alarms</span>
          </button>
        </div>

        {/* Maintenance Export */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mb-4 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white light:text-slate-900 mb-1">
              Maintenance Ops Data
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600 mb-4 leading-relaxed">
              ส่งออกบันทึกงานบำรุงรักษา PM/CM, อะไหล่ที่ใช้, คำขอเบิกอะไหล่, และค่าใช้จ่าย
            </p>
            <div className="text-xs font-mono text-slate-500 mb-6">
              จำนวนข้อมูล: <strong className="text-amber-400">{maintenanceRecords.length}</strong> แถว
            </div>
          </div>

          <button
            onClick={exportMaintenance}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-lg shadow-amber-600/20 active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV Maintenance</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
