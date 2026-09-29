'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  Wrench,
  FileSpreadsheet,
  History,
  Shield,
  Activity,
  ChevronRight,
  Server,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  adminOnly?: boolean;
}

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { role, isAdmin } = useAuth();
  const { stats, dataSource } = useData();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard KPI',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Machine Master',
      href: '/machines',
      icon: Cpu,
      badge: stats.totalMachines,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      title: 'Alarm Incidents',
      href: '/alarms',
      icon: AlertTriangle,
      badge: stats.openAlarms,
      badgeColor: stats.openAlarms > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : undefined,
    },
    {
      title: 'Maintenance Ops',
      href: '/maintenance',
      icon: Wrench,
      badge: stats.inProgressMaintenance,
      badgeColor: stats.inProgressMaintenance > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : undefined,
    },
    {
      title: 'Data Reports',
      href: '/reports',
      icon: FileSpreadsheet,
    },
    {
      title: 'Audit Logs',
      href: '/audit-logs',
      icon: History,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } light:bg-slate-50 light:border-slate-200`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 light:border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white light:text-slate-900">
                <span className="text-cyan-400 light:text-cyan-600">SCADA</span>
                <span>SYSTEM</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Factory Ops 4.0
              </p>
            </div>
          </Link>
        </div>

        {/* System Status Pill */}
        <div className="px-4 py-3 border-b border-slate-800/60 light:border-slate-200 bg-slate-950/40 light:bg-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-slate-300 light:text-slate-700">PLC Gateway</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                dataSource === 'supabase'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {dataSource === 'supabase' ? 'CLOUD' : 'LOCAL'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Navigation
          </div>

          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-500/10 light:bg-cyan-100 light:text-cyan-800 light:border-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400 light:text-cyan-700' : 'text-slate-400 group-hover:text-slate-200 light:group-hover:text-slate-800'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-700" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Role Card */}
        <div className="p-3 border-t border-slate-800 light:border-slate-200 bg-slate-950/60 light:bg-slate-100/80">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700">
              <Shield className="w-4 h-4 text-cyan-400 light:text-cyan-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate">
                Role: <span className="uppercase text-cyan-400 light:text-cyan-600">{role || 'GUEST'}</span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAdmin ? 'Full System Admin' : role === 'technician' ? 'Technician Level 2' : 'Read-Only Viewer'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 text-[10px] text-slate-500 light:text-slate-400 flex items-center justify-between border-t border-slate-800/40 light:border-slate-200">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-500" /> v2.4.0-scada
          </span>
          <span className="font-mono">Node v25</span>
        </div>
      </aside>
    </>
  );
}
