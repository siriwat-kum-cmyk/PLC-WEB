'use client';

import React from 'react';
import { MachineStatus, AlarmSeverity, AlarmStatus, MaintenanceStatus, UserRole } from '@/types';
import {
  getMachineStatusColor,
  getAlarmSeverityColor,
  getAlarmStatusColor,
  getMaintenanceStatusColor,
} from '@/lib/utils';

export function StatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getMachineStatusColor(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Running'
            ? 'bg-emerald-400 animate-pulse'
            : status === 'Alarm'
            ? 'bg-rose-400 animate-ping'
            : status === 'Maintenance'
            ? 'bg-amber-400'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: AlarmSeverity }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border uppercase tracking-wider ${getAlarmSeverityColor(
        severity
      )}`}
    >
      {severity}
    </span>
  );
}

export function AlarmStatusBadge({ status }: { status: AlarmStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAlarmStatusColor(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Open'
            ? 'bg-rose-400 animate-pulse'
            : status === 'In Progress'
            ? 'bg-amber-400'
            : 'bg-emerald-400'
        }`}
      />
      {status}
    </span>
  );
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMainMaintenanceColor(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function getMainMaintenanceColor(status: MaintenanceStatus): string {
  switch (status) {
    case 'Planned':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'In Progress':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Waiting Part':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
    case 'Completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Cancelled':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    technician: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    viewer: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border ${
        styles[role] || styles.viewer
      }`}
    >
      {role}
    </span>
  );
}
