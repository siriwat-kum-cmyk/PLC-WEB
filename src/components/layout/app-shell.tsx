'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ShieldAlert, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  requiredRole?: UserRole | UserRole[];
}

export function AppShell({ children, title, requiredRole }: AppShellProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state with high-tech SCADA visual
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-12 h-12 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" />
          <Activity className="absolute w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <div className="font-mono text-sm tracking-wider text-slate-400">
          SCADA SECURITY GATEWAY
        </div>
        <div className="text-xs text-slate-500 mt-1">Verifying Credentials & Session...</div>
      </div>
    );
  }

  // Not authenticated: do not flash children before redirect
  if (!isAuthenticated) {
    return null;
  }

  // Check Role authorization if requiredRole specified
  const isAuthorized = (): boolean => {
    if (!requiredRole) return true;
    if (Array.isArray(requiredRole)) {
      return role ? requiredRole.includes(role) : false;
    }
    return role === requiredRole;
  };

  if (!isAuthorized()) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 light:bg-slate-100 light:text-slate-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 lg:pl-64">
          <Header onMenuToggle={() => setSidebarOpen(true)} title="Access Restricted" />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl shadow-2xl light:bg-white light:border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white light:text-slate-900 mb-2">
                403 - Permission Denied
              </h2>
              <p className="text-sm text-slate-400 light:text-slate-600 mb-6">
                บทบาทของคุณคือ <span className="font-mono font-bold text-cyan-400 light:text-cyan-600 uppercase">{role}</span> ซึ่งไม่มีสิทธิ์เข้าถึงหน้านี้ ต้องการสิทธิ์ระดับ{' '}
                <span className="font-mono font-bold text-purple-400 light:text-purple-600 uppercase">
                  {Array.isArray(requiredRole) ? requiredRole.join(' หรือ ') : requiredRole}
                </span>
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
              >
                <ArrowLeft className="w-4 h-4" /> กลับสู่ Dashboard
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 light:bg-slate-100 light:text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
