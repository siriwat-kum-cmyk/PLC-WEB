"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useData } from "@/context/data-context";
import { useTheme } from "@/context/theme-context";
import {
  Sun,
  Moon,
  LogOut,
  RotateCcw,
  Clock,
  Database,
} from "lucide-react";
import { UserRole } from "@/types";

export function Header() {
  const { user, role, loginAsDemoUser, logout, isLiveSupabase } = useAuth();
  const { stats, resetToDemoData } = useData();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasAlarm = stats.alarmMachines > 0 || stats.openAlarms > 0;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c121e]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors light:bg-white light:border-slate-200 shadow-sm">
      {/* Left: System Status & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              hasAlarm
                ? "bg-rose-500 animate-ping"
                : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            }`}
          />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400 light:text-slate-600">
            {hasAlarm ? "PLANT ALERT ACTIVE" : "SYSTEM NORMAL"}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded border border-slate-700/50 light:bg-slate-100 light:border-slate-300 light:text-slate-700">
          <Clock className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600" />
          <span>{time || "--:--:--"}</span>
        </div>

        {/* Database Mode indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-mono ${
            isLiveSupabase
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-300"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-300"
          }`}
          title={isLiveSupabase ? "Supabase PostgreSQL Connected" : "Local Storage Demo Mode"}
        >
          <Database className="w-3 h-3" />
          <span>{isLiveSupabase ? "Supabase: Live" : "Demo Storage Mode"}</span>
        </div>
      </div>

      {/* Right: Role Switcher & Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for Evaluator */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs light:bg-slate-100 light:border-slate-300">
          <span className="text-slate-400 light:text-slate-600 px-2 font-mono text-[11px] hidden sm:inline">Role:</span>
          {(["admin", "technician", "viewer"] as UserRole[]).map((r) => {
            const isActive = role === r;
            const labels: Record<UserRole, string> = {
              admin: "Admin",
              technician: "Technician",
              viewer: "Viewer",
            };
            const activeColors: Record<UserRole, string> = {
              admin: "bg-red-500/20 text-red-300 border-red-500/40 font-semibold shadow-sm light:bg-red-100 light:text-red-700 light:border-red-300",
              technician: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold shadow-sm light:bg-amber-100 light:text-amber-800 light:border-amber-300",
              viewer: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold shadow-sm light:bg-cyan-100 light:text-cyan-800 light:border-cyan-300",
            };

            return (
              <button
                key={r}
                type="button"
                onClick={() => loginAsDemoUser(r)}
                className={`px-2.5 py-1 rounded transition-all text-xs border ${
                  isActive
                    ? activeColors[r]
                    : "text-slate-400 border-transparent hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900"
                }`}
                title={`Switch active role to ${labels[r]}`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm("ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?")) {
              resetToDemoData();
            }
          }}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg border border-transparent hover:border-slate-700 transition-colors light:text-slate-600 light:hover:bg-slate-100 light:hover:text-cyan-600"
          title="Reset Demo Data to Initial State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg border border-transparent hover:border-slate-700 transition-colors light:text-slate-600 light:hover:bg-slate-100 light:hover:text-amber-600"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 light:border-slate-300">
          <div className="text-right hidden md:block">
            <div className="text-xs font-medium text-slate-200 light:text-slate-900">{user?.full_name}</div>
            <div className="text-[10px] font-mono uppercase text-slate-400 light:text-slate-500">{user?.email}</div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-colors light:text-slate-600 light:hover:bg-rose-50 light:hover:text-rose-600"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
