'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Activity } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-cyan-500/10 text-cyan-400">
        <Activity className="w-6 h-6 animate-pulse" />
      </div>
      <p className="font-mono text-xs text-slate-400">Routing to SCADA Gateway...</p>
    </div>
  );
}
