import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MachineStatus, AlarmSeverity, AlarmStatus, MaintenanceStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getMachineStatusBadge(status: MachineStatus) {
  switch (status) {
    case "Running":
      return {
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
        label: "Running (กำลังทำงาน)",
      };
    case "Stop":
      return {
        bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        dot: "bg-slate-400",
        label: "Stop (หยุดการทำงาน)",
      };
    case "Alarm":
      return {
        bg: "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse",
        dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]",
        label: "Alarm (สัญญาณเตือน)",
      };
    case "Maintenance":
      return {
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
        label: "Maintenance (ซ่อมบำรุง)",
      };
    default:
      return {
        bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        dot: "bg-slate-400",
        label: status,
      };
  }
}

export function getAlarmSeverityBadge(severity: AlarmSeverity) {
  switch (severity) {
    case "Critical":
      return {
        bg: "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold",
        label: "Critical (วิกฤต)",
      };
    case "High":
      return {
        bg: "bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold",
        label: "High (สูง)",
      };
    case "Medium":
      return {
        bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        label: "Medium (ปานกลาง)",
      };
    case "Low":
      return {
        bg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        label: "Low (ต่ำ)",
      };
  }
}

export function getAlarmStatusBadge(status: AlarmStatus) {
  switch (status) {
    case "Open":
      return {
        bg: "bg-red-500/10 text-red-400 border-red-500/30",
        dot: "bg-red-500",
        label: "Open (รอตรวจสอบ)",
      };
    case "In Progress":
      return {
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400",
        label: "In Progress (กำลังแก้ไข)",
      };
    case "Closed":
      return {
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-400",
        label: "Closed (ปิดงานแล้ว)",
      };
  }
}

export function getMaintenanceStatusBadge(status: MaintenanceStatus) {
  switch (status) {
    case "Pending":
      return {
        bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
        label: "Pending (รอดำเนินการ)",
      };
    case "In Progress":
      return {
        bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        label: "In Progress (กำลังซ่อม)",
      };
    case "Waiting Part":
      return {
        bg: "bg-purple-500/15 text-purple-400 border-purple-500/30 animate-pulse font-medium",
        label: "Waiting Part (รออะไหล่)",
      };
    case "Completed":
      return {
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        label: "Completed (เสร็จสิ้น)",
      };
  }
}
