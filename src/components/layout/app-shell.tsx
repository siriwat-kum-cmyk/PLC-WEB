"use client";

import React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/context/auth-context";
import { Lock } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "technician" | "viewer";
}

export function AppShell({ children, requiredRole }: AppShellProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] light:bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-400">LOADING SCADA SYSTEM...</span>
        </div>
      </div>
    );
  }

  // Role Access check if specified
  const isUnauthorized = requiredRole === "admin" && role !== "admin";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] light:bg-[#f1f5f9] text-slate-100 light:text-slate-900 transition-colors">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {isUnauthorized ? (
            <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center max-w-md mx-auto mt-12 light:bg-rose-50 light:border-rose-300">
              <Lock className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-rose-300 light:text-rose-700">Access Restricted (จำกัดสิทธิ์)</h2>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-2">
                หน้านี้ต้องการสิทธิ์ระดับ <strong className="text-rose-400">Admin</strong> คุณกำลังเข้าใช้งานในฐานะ{" "}
                <span className="font-mono uppercase text-slate-200 light:text-slate-800">{role}</span>
              </p>
              <p className="text-[11px] text-slate-400 light:text-slate-500 mt-3">
                💡 สลับ Role เป็น Admin ได้ที่แถบด้านบนขวาของหน้าจอ
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
