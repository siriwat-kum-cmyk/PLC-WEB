'use client';

import React from 'react';
import { Menu, Sun, Moon, LogOut, User, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useData } from '@/context/data-context';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { dataSource, refreshData, isLoading } = useData();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md light:bg-white/90 light:border-slate-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-white light:text-slate-900 sm:text-lg tracking-tight">
            {title || 'SCADA Control Center'}
          </h1>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700/60 light:bg-slate-100 light:text-slate-600 light:border-slate-200">
            PLC-WEB v2
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync / Refresh Button */}
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          title="Refresh SCADA Data"
          className="p-2 text-slate-400 rounded-lg hover:text-cyan-400 hover:bg-slate-800/80 transition-colors light:text-slate-600 light:hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* DB Source Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800/80 border border-slate-700/60 light:bg-slate-100 light:border-slate-200">
          <Database className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600" />
          <span className="text-slate-300 light:text-slate-700">
            {dataSource === 'supabase' ? 'Supabase DB' : 'Local Sandbox'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* User Card & Logout */}
        <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-800 light:border-slate-200 gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-sm">
              {user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white light:text-slate-900 truncate max-w-[130px]">
                {user?.full_name || 'Anonymous User'}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                    role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : role === 'technician'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {role}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {user?.department}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors light:bg-rose-50 light:text-rose-600 light:hover:bg-rose-100"
            title="Sign out of system"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
