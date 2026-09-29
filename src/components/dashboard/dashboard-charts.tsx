"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Machine, Alarm, MaintenanceRecord } from "@/types";

interface ChartsProps {
  machines: Machine[];
  alarms: Alarm[];
  maintenance: MaintenanceRecord[];
}

export function DashboardCharts({ machines, alarms, maintenance }: ChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading charts...
      </div>
    );
  }

  // 1. Machine Status Distribution
  const statusData = [
    { name: "Running", value: machines.filter((m) => m.status === "Running").length, color: "#10B981" },
    { name: "Stop", value: machines.filter((m) => m.status === "Stop").length, color: "#64748B" },
    { name: "Alarm", value: machines.filter((m) => m.status === "Alarm").length, color: "#EF4444" },
    { name: "Maintenance", value: machines.filter((m) => m.status === "Maintenance").length, color: "#F59E0B" },
  ].filter((d) => d.value > 0);

  // 2. Alarm Severity Distribution
  const severityData = [
    { name: "Critical", count: alarms.filter((a) => a.severity === "Critical").length, fill: "#EF4444" },
    { name: "High", count: alarms.filter((a) => a.severity === "High").length, fill: "#F43F5E" },
    { name: "Medium", count: alarms.filter((a) => a.severity === "Medium").length, fill: "#F59E0B" },
    { name: "Low", count: alarms.filter((a) => a.severity === "Low").length, fill: "#3B82F6" },
  ];

  // 3. Maintenance Type Distribution
  const maintTypeData = [
    {
      name: "Preventive (PM)",
      count: maintenance.filter((m) => m.maintenance_type === "Preventive (PM)").length,
      fill: "#10B981",
    },
    {
      name: "Breakdown (BM)",
      count: maintenance.filter((m) => m.maintenance_type === "Breakdown (BM)").length,
      fill: "#EF4444",
    },
    {
      name: "Corrective (CM)",
      count: maintenance.filter((m) => m.maintenance_type === "Corrective (CM)").length,
      fill: "#3B82F6",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Machine Status Breakdown */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between light:text-slate-800">
          <span>Machine Status Distribution</span>
          <span className="text-[11px] font-mono text-cyan-400">Total: {machines.length}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">สัดส่วนสถานะการทำงานของเครื่องจักรทั้งหมด</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData.length > 0 ? statusData : [{ name: "None", value: 1, color: "#334155" }]}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Alarms by Severity */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between light:text-slate-800">
          <span>Alarms by Severity (กราฟวิเคราะห์ Alarm)</span>
          <span className="text-[11px] font-mono text-rose-400">Total: {alarms.length}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">วิเคราะห์ความรุนแรงของสัญญาณเตือน (Bonus Feature)</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Maintenance by Type */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl p-5 shadow-lg light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between light:text-slate-800">
          <span>Maintenance Work Orders</span>
          <span className="text-[11px] font-mono text-amber-400">Total: {maintenance.length}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">จำแนกตามประเภทงาน PM, BM และ CM</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {maintTypeData.map((entry, index) => (
                  <Cell key={`maint-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
