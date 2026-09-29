'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserProfile } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_PROFILES } from '@/lib/mock-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  // RBAC Permission Helpers
  canCreateMachine: boolean;
  canEditMachine: boolean;
  canDeleteMachine: boolean;
  canCreateAlarm: boolean;
  canEditAlarm: boolean;
  canUpdateAlarmStatus: boolean;
  canDeleteAlarm: boolean;
  canCreateMaintenance: boolean;
  canEditMaintenance: boolean;
  canDeleteMaintenance: boolean;
  canExportData: boolean;
  isAdmin: boolean;
  isTechnician: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authorized mock credentials for offline / demonstration mode
// STRICT VALIDATION: Rejects any unauthorized email or wrong password
const AUTHORIZED_ACCOUNTS: Record<string, { pass: string; profile: UserProfile }> = {
  'admin@automation.local': {
    pass: 'admin123',
    profile: DEMO_PROFILES[0], // Somchai Admin
  },
  'tech@automation.local': {
    pass: 'tech123',
    profile: DEMO_PROFILES[1], // Wichai Technician
  },
  'viewer@automation.local': {
    pass: 'viewer123',
    profile: DEMO_PROFILES[2], // Anong Viewer
  },
};

const STORAGE_KEY = 'scada_auth_session_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = pass.trim();

      // Check live Supabase Auth first if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data, error: sbError } = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password: trimmedPass,
            });

            if (!sbError && data?.user) {
              // Fetch user profile from Supabase profiles table
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              const userProfile: UserProfile = {
                id: data.user.id,
                email: data.user.email || trimmedEmail,
                full_name: profileData?.full_name || data.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
                role: (profileData?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || 'technician',
                department: profileData?.department || 'Operations',
                phone: profileData?.phone,
                avatar_url: profileData?.avatar_url,
                created_at: profileData?.created_at || new Date().toISOString(),
                updated_at: profileData?.updated_at || new Date().toISOString(),
              };

              setUser(userProfile);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
              setIsLoading(false);
              return { success: true };
            }
          }
        } catch {
          // If Supabase connection fails, fall through to authorized credential check
        }
      }

      // Strict Authorized Account Validation
      const account = AUTHORIZED_ACCOUNTS[trimmedEmail];
      if (!account) {
        const errMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (กรุณาใช้อีเมลที่ลงทะเบียนในระบบ เช่น admin@automation.local)';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      if (account.pass !== trimmedPass) {
        const errMsg = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      // Valid demo account login
      setUser(account.profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.profile));
      setIsLoading(false);
      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
      } catch {
        // Ignore network errors on logout
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  // Role permissions
  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isTechnician = role === 'technician';
  const isViewer = role === 'viewer';

  // Permission Matrix per specification
  // Admin: full access
  // Technician: view machine/dashboard, create/edit maintenance, update alarm status
  // Viewer: read-only everywhere
  const canCreateMachine = isAdmin;
  const canEditMachine = isAdmin;
  const canDeleteMachine = isAdmin;

  const canCreateAlarm = isAdmin || isTechnician;
  const canEditAlarm = isAdmin;
  const canUpdateAlarmStatus = isAdmin || isTechnician;
  const canDeleteAlarm = isAdmin;

  const canCreateMaintenance = isAdmin || isTechnician;
  const canEditMaintenance = isAdmin || isTechnician;
  const canDeleteMaintenance = isAdmin;

  const canExportData = isAdmin || isTechnician || isViewer;

  const value: AuthContextType = {
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    canCreateMachine,
    canEditMachine,
    canDeleteMachine,
    canCreateAlarm,
    canEditAlarm,
    canUpdateAlarmStatus,
    canDeleteAlarm,
    canCreateMaintenance,
    canEditMaintenance,
    canDeleteMaintenance,
    canExportData,
    isAdmin,
    isTechnician,
    isViewer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
