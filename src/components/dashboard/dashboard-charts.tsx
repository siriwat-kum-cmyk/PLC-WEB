'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Machine, Alarm, MaintenanceRecord } from '@/types';
import { useTheme } from '@/context/theme-context';

interface DashboardChartsProps {
  machines: Machine[];
  alarms: Alarm[];
  maintenanceRecords: MaintenanceRecord[];
}

const MACHINE_STATUS_COLORS: Record<string, string> = {
  Running: '#10b981', // Emerald 500
  Stop: '#64748b', // Slate 500
  Alarm: '#f43f5e', // Rose 500
  Maintenance: '#f59e0b', // Amber 500
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#e11d48',
  High: '#ea580c',
  Medium: '#f59e0b',
  Low: '#0284c7',
};

export function DashboardCharts({
  machines,
  alarms,
  maintenanceRecords,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-xl bg-slate-900/50 animate-pulse" />
        <div className="h-72 rounded-xl bg-slate-900/50 animate-pulse" />
      </div>
    );
  }

  // 1. Machine Distribution by Status (Donut Chart)
  const machineStatusCounts = machines.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const machineStatusData = Object.entries(machineStatusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Alarms by Severity & Status (Bar Chart)
  const severityCounts = alarms.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alarmSeverityData = ['Critical', 'High', 'Medium', 'Low'].map((sev) => ({
    severity: sev,
    count: severityCounts[sev] || 0,
  }));

  // 3. Maintenance Records by Type (Bar Chart)
  const mntTypeCounts = maintenanceRecords.reduce((acc, m) => {
    acc[m.maintenance_type] = (acc[m.maintenance_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maintenanceTypeData = Object.entries(mntTypeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Machine Status Donut Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Machine Status Distribution
          </h3>
          <p className="text-[11px] text-slate-400 light:text-slate-500">
            สัดส่วนสถานะการเดินเครื่องจักรในระบบ
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={machineStatusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {machineStatusData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={MACHINE_STATUS_COLORS[entry.name] || '#64748b'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Alarms by Severity Bar Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Alarms by Severity
          </h3>
          <p className="text-[11px] text-slate-400 light:text-slate-500">
            จำนวนเหตุการณ์แจ้งเตือนแยกตามระดับความวิกฤต
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alarmSeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="severity" tick={{ fill: textColor, fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: textColor, fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {alarmSeverityData.map((entry) => (
                  <Cell
                    key={`bar-${entry.severity}`}
                    fill={SEVERITY_COLORS[entry.severity] || '#0891b2'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Maintenance by Type Bar Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl light:bg-white light:border-slate-200">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Maintenance by Type
          </h3>
          <p className="text-[11px] text-slate-400 light:text-slate-500">
            จำนวนงานบำรุงรักษาแยกตามประเภท (PM / CM / Overhaul)
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="type"
                tick={{ fill: textColor, fontSize: 10 }}
                tickFormatter={(val) => val.split(' ')[0]}
              />
              <YAxis allowDecimals={false} tick={{ fill: textColor, fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
