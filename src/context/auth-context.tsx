"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";
import { INITIAL_PROFILES } from "@/lib/mock-data";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isTechnician: boolean;
  isViewer: boolean;
  canManageMachines: boolean;
  canEditMaintenance: boolean;
  canUpdateAlarm: boolean;
  canViewAuditLogs: boolean;
  loginAsDemoUser: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLiveSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(INITIAL_PROFILES[0]); // Default to Admin for easy testing
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted demo session
    const saved = localStorage.getItem("plc_auth_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(INITIAL_PROFILES[0]);
      }
    } else {
      setUser(INITIAL_PROFILES[0]);
    }

    // Check Supabase session if configured
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile) {
                  const u: UserProfile = {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    role: profile.role as UserRole,
                    avatar_url: profile.avatar_url,
                  };
                  setUser(u);
                  localStorage.setItem("plc_auth_user", JSON.stringify(u));
                }
              });
          }
        });
      }
    }

    setIsLoading(false);
  }, []);

  const loginAsDemoUser = (targetRole: UserRole) => {
    const profile = INITIAL_PROFILES.find((p) => p.role === targetRole) || INITIAL_PROFILES[0];
    setUser(profile);
    localStorage.setItem("plc_auth_user", JSON.stringify(profile));
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          const u: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || email.split("@")[0],
            role: (profile?.role as UserRole) || "technician",
          };
          setUser(u);
          localStorage.setItem("plc_auth_user", JSON.stringify(u));
          return { success: true };
        }
      }
    }

    // Demo Mode Fallback
    const matched = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      localStorage.setItem("plc_auth_user", JSON.stringify(matched));
      return { success: true };
    }

    // If custom email entered in demo mode, create dynamic technician profile
    const customUser: UserProfile = {
      id: "u-custom-" + Date.now(),
      email,
      full_name: email.split("@")[0].toUpperCase(),
      role: email.toLowerCase().includes("admin") ? "admin" : "technician",
    };
    setUser(customUser);
    localStorage.setItem("plc_auth_user", JSON.stringify(customUser));
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    localStorage.removeItem("plc_auth_user");
  };

  const role = user?.role || "viewer";
  const isAdmin = role === "admin";
  const isTechnician = role === "technician";
  const isViewer = role === "viewer";

  // Permission matrices
  const canManageMachines = isAdmin;
  const canEditMaintenance = isAdmin || isTechnician;
  const canUpdateAlarm = isAdmin || isTechnician;
  const canViewAuditLogs = isAdmin || isTechnician;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isTechnician,
        isViewer,
        canManageMachines,
        canEditMaintenance,
        canUpdateAlarm,
        canViewAuditLogs,
        loginAsDemoUser,
        loginWithEmail,
        logout,
        isLoading,
        isLiveSupabase: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
