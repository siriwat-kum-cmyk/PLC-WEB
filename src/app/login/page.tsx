"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Activity,
  Shield,
  Wrench,
  Eye,
  KeyRound,
  Mail,
  AlertCircle,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithEmail, loginAsDemoUser, isLiveSupabase, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("กรุณากรอกอีเมล (Email is required)");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบยืนยันตัวตน");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    loginAsDemoUser(role);
    router.push("/dashboard");
  };

  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] light:bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-400">CONNECTING SCADA AUTH GATEWAY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] light:bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Background ambient industrial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo & System Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-xl shadow-cyan-500/20 mb-3 border border-cyan-400/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white light:text-slate-900 uppercase">
            SCADA Automation Portal
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1 font-mono">
            Alarm & Maintenance Management System
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-400 light:bg-white light:border-slate-300 light:text-cyan-700 shadow-sm">
            <Database className="w-3.5 h-3.5" />
            <span>{isLiveSupabase ? "Supabase Authentication Active" : "Dual-Mode (Supabase / Demo Engine)"}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 light:text-slate-700">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>เข้าสู่ระบบเพื่อเข้าใช้งาน (Authentication Gate)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 light:bg-slate-100 light:border-slate-200">
              SECURE
            </span>
          </div>

          {/* Quick Credential Fill Helper */}
          <div className="mb-4 bg-slate-900/80 light:bg-slate-50 border border-slate-800 light:border-slate-200 p-2.5 rounded-xl">
            <div className="text-[11px] text-slate-400 light:text-slate-600 mb-1.5 font-medium flex items-center justify-between">
              <span>เลือกบัญชีเพื่อกรอกข้อมูลอัตโนมัติ:</span>
              <span className="text-[10px] text-cyan-400 light:text-cyan-600 font-mono">คลิกเพื่อเลือก</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillCredentials("admin@automation.local", "admin123")}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 light:text-rose-700 text-left hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Admin Role</div>
                  <div className="text-[9px] text-slate-400 font-mono">admin@automation.local</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("tech@automation.local", "tech123")}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 light:text-amber-800 text-left hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Technician Role</div>
                  <div className="text-[9px] text-slate-400 font-mono">tech@automation.local</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 light:bg-rose-50 light:text-rose-700 light:border-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@automation.local"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:border-slate-300 light:text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors light:bg-slate-50 light:border-slate-300 light:text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ (Sign In)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo 1-Click Login for Evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-800 light:border-slate-200">
            <div className="text-[11px] font-mono text-slate-400 light:text-slate-600 uppercase tracking-wider text-center mb-3">
              ⚡ หรือเข้าสู่ระบบด่วน 1-Click (Evaluator Quick Access)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 light:text-rose-700 light:border-rose-300 transition-all text-xs group"
                title="เข้าสู่ระบบทันทีในฐานะ Admin"
              >
                <Shield className="w-4 h-4 mb-1 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Admin</span>
                <span className="text-[9px] text-slate-400 light:text-slate-500">จัดการทุกอย่าง</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("technician")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 light:text-amber-800 light:border-amber-300 transition-all text-xs group"
                title="เข้าสู่ระบบทันทีในฐานะ Technician"
              >
                <Wrench className="w-4 h-4 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Technician</span>
                <span className="text-[9px] text-slate-400 light:text-slate-500">งานซ่อม & Alarm</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("viewer")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 light:text-cyan-800 light:border-cyan-300 transition-all text-xs group"
                title="เข้าสู่ระบบทันทีในฐานะ Viewer"
              >
                <Eye className="w-4 h-4 mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Viewer</span>
                <span className="text-[9px] text-slate-400 light:text-slate-500">ดูอย่างเดียว (Bonus)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Course Info Footer */}
        <div className="text-center mt-6 text-xs text-slate-400 light:text-slate-500 font-mono">
          Programming in Automation Systems • Automation Web App
        </div>
      </div>
    </div>
  );
}
