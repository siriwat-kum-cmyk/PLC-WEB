import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MachineStatus, AlarmSeverity, AlarmStatus, MaintenanceStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getMachineStatusColor(status: MachineStatus): string {
  switch (status) {
    case "Running":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300";
    case "Stop":
      return "bg-slate-500/10 text-slate-400 border-slate-500/30 light:bg-slate-100 light:text-slate-700 light:border-slate-300";
    case "Alarm":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30 light:bg-rose-100 light:text-rose-800 light:border-rose-300";
    case "Maintenance":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30 light:bg-amber-100 light:text-amber-800 light:border-amber-300";
    default:
      return "bg-slate-800 text-slate-400 border-slate-700";
  }
}

export function getAlarmSeverityColor(severity: AlarmSeverity): string {
  switch (severity) {
    case "Critical":
      return "bg-rose-600/20 text-rose-400 border-rose-600/40 light:bg-rose-100 light:text-rose-800 light:border-rose-300";
    case "High":
    case "Major":
      return "bg-orange-500/20 text-orange-400 border-orange-500/40 light:bg-orange-100 light:text-orange-800 light:border-orange-300";
    case "Medium":
    case "Minor":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40 light:bg-amber-100 light:text-amber-800 light:border-amber-300";
    case "Low":
    case "Warning":
    default:
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 light:bg-cyan-100 light:text-cyan-800 light:border-cyan-300";
  }
}

export function getAlarmStatusColor(status: AlarmStatus): string {
  switch (status) {
    case "Open":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30 light:bg-rose-100 light:text-rose-800 light:border-rose-300";
    case "In Progress":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30 light:bg-amber-100 light:text-amber-800 light:border-amber-300";
    case "Closed":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300";
    default:
      return "bg-slate-800 text-slate-400 border-slate-700";
  }
}

export function getMaintenanceStatusColor(status: MaintenanceStatus): string {
  switch (status) {
    case "Planned":
    case "Scheduled":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30 light:bg-blue-100 light:text-blue-800 light:border-blue-300";
    case "In Progress":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30 light:bg-amber-100 light:text-amber-800 light:border-amber-300";
    case "Waiting Part":
      return "bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold light:bg-orange-100 light:text-orange-800 light:border-orange-300";
    case "Completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300";
    case "Cancelled":
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/30 light:bg-slate-100 light:text-slate-700 light:border-slate-300";
  }
}

export const getMachineStatusBadge = (status: MachineStatus) => ({
  bg: getMachineStatusColor(status),
  dot: status === "Running" ? "bg-emerald-400" : status === "Alarm" ? "bg-rose-400" : "bg-amber-400",
});

export const getAlarmSeverityBadge = (severity: AlarmSeverity) => ({
  bg: getAlarmSeverityColor(severity),
});

export const getAlarmStatusBadge = (status: AlarmStatus) => ({
  bg: getAlarmStatusColor(status),
});

export const getMaintenanceStatusBadge = (status: MaintenanceStatus) => ({
  bg: getMaintenanceStatusColor(status),
});
