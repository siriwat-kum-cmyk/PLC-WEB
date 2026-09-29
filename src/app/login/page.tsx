"use client";

import React, { useState } from "react";
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
  Cpu,
} from "lucide-react";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAsDemoUser, isLiveSupabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    loginAsDemoUser(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient industrial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            SCADA Automation Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Alarm & Maintenance Management System
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <Database className="w-3 h-3" />
            <span>{isLiveSupabase ? "Supabase Auth Active" : "Dual-Mode (Supabase / Demo)"}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@factory.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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

          {/* Quick Demo Logins for Evaluator */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Quick Login for Evaluation (ทดสอบทันที)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 transition-all text-xs group"
              >
                <Shield className="w-4 h-4 mb-1 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Admin</span>
                <span className="text-[9px] text-slate-400">สิทธิ์สูงสุด</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("technician")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 transition-all text-xs group"
              >
                <Wrench className="w-4 h-4 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Technician</span>
                <span className="text-[9px] text-slate-400">ช่างซ่อมบำรุง</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("viewer")}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 transition-all text-xs group"
              >
                <Eye className="w-4 h-4 mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Viewer</span>
                <span className="text-[9px] text-slate-400">ดูอย่างเดียว (Bonus)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Course Info Footer */}
        <div className="text-center mt-6 text-xs text-slate-400 font-mono">
          Programming in Automation Systems • Automation Web App
        </div>
      </div>
    </div>
  );
}
