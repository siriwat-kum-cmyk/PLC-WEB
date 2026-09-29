'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
  trend?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'cyan',
  trend,
}: StatCardProps) {
  const schemeStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      valueColor: 'text-cyan-400 light:text-cyan-600',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      valueColor: 'text-emerald-400 light:text-emerald-600',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      valueColor: 'text-amber-400 light:text-amber-600',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      valueColor: 'text-rose-400 light:text-rose-600',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      valueColor: 'text-purple-400 light:text-purple-600',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400',
      valueColor: 'text-blue-400 light:text-blue-600',
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl bg-slate-900/90 border transition-all duration-200 shadow-lg light:bg-white light:border-slate-200 ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 light:text-slate-500 truncate">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${style.valueColor}`}>
          {value}
        </span>
        {trend && (
          <span className="text-[10px] font-mono font-medium text-slate-400">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 light:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
