'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Activity,
  Shield,
  Clock,
  Layers,
  FileCode,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { useData } from '@/context/data-context';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const { auditLogs, isLoading } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.entity_id && log.entity_id.toLowerCase().includes(q)) ||
        (log.profile?.full_name && log.profile.full_name.toLowerCase().includes(q));

      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
      const matchesEntity = selectedEntity === 'ALL' || log.entity_type === selectedEntity;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [auditLogs, searchQuery, selectedAction, selectedEntity]);

  return (
    <AppShell title="Audit Trail (บันทึกกิจกรรมความปลอดภัย)" requiredRole="admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">
              ประวัติการแก้ไขและบันทึกข้อมูล (System Audit Trail)
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Admin Only Access
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
            เก็บบันทึกประวัติการสร้าง, ปรับปรุง, และลบข้อมูลเพื่อความโปร่งใสและการตรวจสอบย้อนหลัง
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 mb-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-md light:bg-white light:border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Action, ผู้ปฏิบัติงาน, หรือ Entity..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Action ทั้งหมด (All Actions)</option>
              <option value="CREATE">CREATE (สร้าง)</option>
              <option value="UPDATE">UPDATE (แก้ไข)</option>
              <option value="DELETE">DELETE (ลบ)</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white light:bg-slate-50 light:text-slate-900 light:border-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Entity ทั้งหมด (All Entities)</option>
              <option value="machine">machine (เครื่องจักร)</option>
              <option value="alarm">alarm (การแจ้งเตือน)</option>
              <option value="maintenance">maintenance (งานบำรุงรักษา)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl light:bg-white light:border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 light:bg-slate-50 light:border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    กำลังโหลดข้อมูล Audit Logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-300 light:text-slate-700">ไม่พบประวัติการทำรายการ</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white light:text-slate-900">
                      {log.profile?.full_name || 'System Operator'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.action === 'UPDATE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 light:text-slate-700 font-mono text-[11px]">
                      {log.entity_type}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-400 light:text-cyan-600 text-[11px]">
                      {log.entity_id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
