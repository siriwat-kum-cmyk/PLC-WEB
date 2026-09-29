'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Lock,
  Mail,
  Shield,
  Wrench,
  Eye,
  AlertCircle,
  CheckCircle2,
  Server,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('กรุณากรอกอีเมลผู้ใช้งาน');
      return;
    }
    if (!password.trim()) {
      setLocalError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.replace('/dashboard');
      } else {
        setLocalError(res.error || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล');
      }
    } catch {
      setLocalError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    clearError();
    setLocalError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8 z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo & Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25">
              <Activity className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span className="text-cyan-400">SCADA</span> CONTROL CENTER
              </div>
              <p className="text-xs font-mono text-slate-400">
                PLC Alarm & Maintenance System
              </p>
            </div>
          </div>

          <h2 className="text-center text-sm font-medium text-slate-300">
            ระบบเข้าสู่ระบบความปลอดภัยสำหรับบุคลากรโรงงานอัจฉริยะ
          </h2>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-6 py-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl sm:px-8">
            {/* System Status Pill */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80 text-xs">
              <span className="flex items-center gap-2 font-mono text-slate-400">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> Security Gateway
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isSupabaseConfigured() ? 'Supabase Auth Online' : 'Local Auth Guard'}
              </span>
            </div>

            {/* Error Notification Alert */}
            {(localError || error) && (
              <div className="p-3 mb-5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">ข้อผิดพลาดในการตรวจสอบสิทธิ์</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{localError || error}</div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  อีเมลผู้ใช้งาน (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@automation.local"
                    autoComplete="username"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบสิทธิ์...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Section */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>เลือกบัญชีทดสอบด่วน (Quick Demo Roles)</span>
                <span className="text-[10px] text-cyan-400 lowercase font-mono">คลิกเพื่อกรอก</span>
              </div>

              <div className="space-y-2">
                {/* Admin Quick Select */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@automation.local', 'admin123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-purple-500/20 text-purple-400">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                        Admin (วิศวกรผู้ดูแลระบบ)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        admin@automation.local • pass: admin123
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300">
                    Full CRUD
                  </span>
                </button>

                {/* Technician Quick Select */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tech@automation.local', 'tech123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-blue-950/20 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                        Technician (ช่างซ่อมบำรุง)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        tech@automation.local • pass: tech123
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">
                    Mnt + Alarm
                  </span>
                </button>

                {/* Viewer Quick Select */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('viewer@automation.local', 'viewer123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        Viewer (ผู้สังเกตการณ์)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        viewer@automation.local • pass: viewer123
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                    Read Only
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500">
              SCADA PLC Smart Manufacturing System • Department of Computer & Automation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
