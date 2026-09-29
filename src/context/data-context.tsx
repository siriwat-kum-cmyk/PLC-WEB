"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Machine, Alarm, MaintenanceRecord, AuditLog, DashboardStats } from "@/types";
import {
  INITIAL_MACHINES,
  INITIAL_ALARMS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDIT_LOGS,
} from "@/lib/mock-data";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";

interface DataContextType {
  machines: Machine[];
  alarms: Alarm[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLog[];
  stats: DashboardStats;
  loading: boolean;
  addMachine: (machine: Omit<Machine, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
  updateMachine: (id: string, updates: Partial<Machine>) => Promise<{ success: boolean; error?: string }>;
  deleteMachine: (id: string) => Promise<{ success: boolean; error?: string }>;
  addAlarm: (alarm: Omit<Alarm, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<{ success: boolean; error?: string }>;
  deleteAlarm: (id: string) => Promise<{ success: boolean; error?: string }>;
  addMaintenance: (record: Omit<MaintenanceRecord, "id" | "created_at" | "updated_at">) => Promise<{ success: boolean; error?: string }>;
  updateMaintenance: (id: string, updates: Partial<MaintenanceRecord>) => Promise<{ success: boolean; error?: string }>;
  deleteMaintenance: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetToDemoData: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to persist in LocalStorage
  const persistLocal = useCallback((m: Machine[], a: Alarm[], mr: MaintenanceRecord[], al: AuditLog[]) => {
    try {
      localStorage.setItem("plc_machines", JSON.stringify(m));
      localStorage.setItem("plc_alarms", JSON.stringify(a));
      localStorage.setItem("plc_maintenance", JSON.stringify(mr));
      localStorage.setItem("plc_audit_logs", JSON.stringify(al));
    } catch {
      // LocalStorage full or private mode
    }
  }, []);

  const logAction = useCallback(
    (action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE", entity: "Machine" | "Alarm" | "Maintenance", entity_id: string, details?: Record<string, any>) => {
      const logEntry: AuditLog = {
        id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        user_name: user?.full_name || "System User",
        user_id: user?.id,
        action,
        entity,
        entity_id,
        details,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => {
        const next = [logEntry, ...prev];
        try {
          localStorage.setItem("plc_audit_logs", JSON.stringify(next));
        } catch {}
        return next;
      });

      if (isSupabaseConfigured) {
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.from("audit_logs").insert([logEntry]).then();
        }
      }
    },
    [user]
  );

  const refreshData = useCallback(async () => {
    setLoading(true);

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const [mRes, aRes, mrRes, alRes] = await Promise.all([
            supabase.from("machines").select("*").order("created_at", { ascending: false }),
            supabase.from("alarms").select("*, machine:machines(*)").order("triggered_at", { ascending: false }),
            supabase.from("maintenance_records").select("*, machine:machines(*)").order("scheduled_date", { ascending: false }),
            supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
          ]);

          if (mRes.data && mRes.data.length > 0) {
            setMachines(mRes.data);
            setAlarms(aRes.data || []);
            setMaintenance(mrRes.data || []);
            setAuditLogs(alRes.data || []);
            setLoading(false);
            return;
          }
        } catch {
          // Fall back to local
        }
      }
    }

    // Load LocalStorage or Default Mock
    try {
      const savedM = localStorage.getItem("plc_machines");
      const savedA = localStorage.getItem("plc_alarms");
      const savedMR = localStorage.getItem("plc_maintenance");
      const savedAL = localStorage.getItem("plc_audit_logs");

      const m = savedM ? JSON.parse(savedM) : INITIAL_MACHINES;
      const a = savedA ? JSON.parse(savedA) : INITIAL_ALARMS;
      const mr = savedMR ? JSON.parse(savedMR) : INITIAL_MAINTENANCE;
      const al = savedAL ? JSON.parse(savedAL) : INITIAL_AUDIT_LOGS;

      setMachines(m);
      setAlarms(a);
      setMaintenance(mr);
      setAuditLogs(al);
    } catch {
      setMachines(INITIAL_MACHINES);
      setAlarms(INITIAL_ALARMS);
      setMaintenance(INITIAL_MAINTENANCE);
      setAuditLogs(INITIAL_AUDIT_LOGS);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Reset to sample initial data
  const resetToDemoData = () => {
    setMachines(INITIAL_MACHINES);
    setAlarms(INITIAL_ALARMS);
    setMaintenance(INITIAL_MAINTENANCE);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    persistLocal(INITIAL_MACHINES, INITIAL_ALARMS, INITIAL_MAINTENANCE, INITIAL_AUDIT_LOGS);
  };

  // ----------------------------------------------------
  // MACHINE CRUD
  // ----------------------------------------------------
  const addMachine = async (machineData: Omit<Machine, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; error?: string }> => {
    // 3.7 Validation: Check duplicate machine_id
    const duplicate = machines.some(
      (m) => m.machine_id.trim().toLowerCase() === machineData.machine_id.trim().toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `รหัสเครื่องจักร (Machine ID) '${machineData.machine_id}' มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น` };
    }

    const newMachine: Machine = {
      ...machineData,
      id: "m-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("machines").insert([newMachine]);
        if (error) return { success: false, error: error.message };
      }
    }

    const updated = [newMachine, ...machines];
    setMachines(updated);
    persistLocal(updated, alarms, maintenance, auditLogs);
    logAction("CREATE", "Machine", newMachine.machine_id, { name: newMachine.name, type: newMachine.type });
    return { success: true };
  };

  const updateMachine = async (id: string, updates: Partial<Machine>): Promise<{ success: boolean; error?: string }> => {
    // Check duplicate machine_id if changed
    if (updates.machine_id) {
      const duplicate = machines.some(
        (m) => m.id !== id && m.machine_id.trim().toLowerCase() === updates.machine_id!.trim().toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: `รหัสเครื่องจักร (Machine ID) '${updates.machine_id}' ซ้ำกับเครื่องอื่นในระบบ` };
      }
    }

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase
          .from("machines")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const updated = machines.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));
    setMachines(updated);
    persistLocal(updated, alarms, maintenance, auditLogs);
    logAction("UPDATE", "Machine", updates.machine_id || id, updates);
    return { success: true };
  };

  const deleteMachine = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = machines.find((m) => m.id === id);
    if (!target) return { success: false, error: "ไม่พบเครื่องจักรที่ต้องการลบ" };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("machines").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const updatedM = machines.filter((m) => m.id !== id);
    const updatedA = alarms.filter((a) => a.machine_id !== id);
    const updatedMR = maintenance.filter((mr) => mr.machine_id !== id);
    setMachines(updatedM);
    setAlarms(updatedA);
    setMaintenance(updatedMR);
    persistLocal(updatedM, updatedA, updatedMR, auditLogs);
    logAction("DELETE", "Machine", target.machine_id, { name: target.name });
    return { success: true };
  };

  // ----------------------------------------------------
  // ALARM CRUD & Machine State Synchronizer
  // ----------------------------------------------------
  const addAlarm = async (alarmData: Omit<Alarm, "id" | "created_at">): Promise<{ success: boolean; error?: string }> => {
    const newAlarm: Alarm = {
      ...alarmData,
      id: "alarm-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("alarms").insert([newAlarm]);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextAlarms = [newAlarm, ...alarms];
    setAlarms(nextAlarms);

    // If new alarm is active (Open or In Progress), auto-set machine status to "Alarm"
    let nextMachines = machines;
    if (newAlarm.status !== "Closed") {
      nextMachines = machines.map((m) => (m.id === newAlarm.machine_id ? { ...m, status: "Alarm" } : m));
      setMachines(nextMachines);
      if (isSupabaseConfigured) {
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.from("machines").update({ status: "Alarm" }).eq("id", newAlarm.machine_id).then();
        }
      }
    }

    persistLocal(nextMachines, nextAlarms, maintenance, auditLogs);
    logAction("CREATE", "Alarm", newAlarm.alarm_code, {
      description: newAlarm.description,
      severity: newAlarm.severity,
      machine_id: newAlarm.machine_id,
    });
    return { success: true };
  };

  const updateAlarm = async (id: string, updates: Partial<Alarm>): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("alarms").update(updates).eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextAlarms = alarms.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAlarms(nextAlarms);

    // If alarm is closed, check if machine has other open alarms. If none, restore machine to Running
    const targetAlarm = alarms.find((a) => a.id === id);
    let nextMachines = machines;
    if (updates.status === "Closed" && targetAlarm) {
      const remainingAlarms = nextAlarms.filter(
        (a) => a.machine_id === targetAlarm.machine_id && a.id !== id && a.status !== "Closed"
      );
      if (remainingAlarms.length === 0) {
        nextMachines = machines.map((m) =>
          m.id === targetAlarm.machine_id && m.status === "Alarm" ? { ...m, status: "Running" } : m
        );
        setMachines(nextMachines);
        if (isSupabaseConfigured) {
          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.from("machines").update({ status: "Running" }).eq("id", targetAlarm.machine_id).then();
          }
        }
      }
    }

    persistLocal(nextMachines, nextAlarms, maintenance, auditLogs);
    logAction("STATUS_CHANGE", "Alarm", targetAlarm?.alarm_code || id, updates);
    return { success: true };
  };

  const deleteAlarm = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = alarms.find((a) => a.id === id);
    if (!target) return { success: false, error: "ไม่พบข้อมูล Alarm" };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("alarms").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextAlarms = alarms.filter((a) => a.id !== id);
    setAlarms(nextAlarms);
    persistLocal(machines, nextAlarms, maintenance, auditLogs);
    logAction("DELETE", "Alarm", target.alarm_code);
    return { success: true };
  };

  // ----------------------------------------------------
  // MAINTENANCE CRUD & Machine State Synchronizer
  // ----------------------------------------------------
  const addMaintenance = async (recordData: Omit<MaintenanceRecord, "id" | "created_at" | "updated_at">): Promise<{ success: boolean; error?: string }> => {
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: "maint-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("maintenance_records").insert([newRecord]);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextMR = [newRecord, ...maintenance];
    setMaintenance(nextMR);

    // If maintenance is ongoing (In Progress or Waiting Part), update machine status to Maintenance
    let nextMachines = machines;
    if (newRecord.status === "In Progress" || newRecord.status === "Waiting Part") {
      nextMachines = machines.map((m) =>
        m.id === newRecord.machine_id && m.status !== "Alarm" ? { ...m, status: "Maintenance" } : m
      );
      setMachines(nextMachines);
      if (isSupabaseConfigured) {
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.from("machines").update({ status: "Maintenance" }).eq("id", newRecord.machine_id).then();
        }
      }
    }

    persistLocal(nextMachines, alarms, nextMR, auditLogs);
    logAction("CREATE", "Maintenance", newRecord.id, {
      type: newRecord.maintenance_type,
      technician: newRecord.technician_name,
      status: newRecord.status,
    });
    return { success: true };
  };

  const updateMaintenance = async (id: string, updates: Partial<MaintenanceRecord>): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase
          .from("maintenance_records")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextMR = maintenance.map((mr) => (mr.id === id ? { ...mr, ...updates, updated_at: new Date().toISOString() } : mr));
    setMaintenance(nextMR);

    // If completed, and machine was in Maintenance, check if other active maintenance exists. If none, restore to Running
    const targetMR = maintenance.find((m) => m.id === id);
    let nextMachines = machines;
    if (updates.status === "Completed" && targetMR) {
      const activeMR = nextMR.filter(
        (m) =>
          m.machine_id === targetMR.machine_id &&
          m.id !== id &&
          (m.status === "In Progress" || m.status === "Waiting Part")
      );
      if (activeMR.length === 0) {
        nextMachines = machines.map((m) =>
          m.id === targetMR.machine_id && m.status === "Maintenance" ? { ...m, status: "Running" } : m
        );
        setMachines(nextMachines);
        if (isSupabaseConfigured) {
          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.from("machines").update({ status: "Running" }).eq("id", targetMR.machine_id).then();
          }
        }
      }
    }

    persistLocal(nextMachines, alarms, nextMR, auditLogs);
    logAction("UPDATE", "Maintenance", id, updates);
    return { success: true };
  };

  const deleteMaintenance = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      }
    }

    const nextMR = maintenance.filter((m) => m.id !== id);
    setMaintenance(nextMR);
    persistLocal(machines, alarms, nextMR, auditLogs);
    logAction("DELETE", "Maintenance", id);
    return { success: true };
  };

  // ----------------------------------------------------
  // DASHBOARD KPI STATS CALCULATION
  // ----------------------------------------------------
  const stats: DashboardStats = {
    totalMachines: machines.length,
    runningMachines: machines.filter((m) => m.status === "Running").length,
    stoppedMachines: machines.filter((m) => m.status === "Stop").length,
    alarmMachines: machines.filter((m) => m.status === "Alarm").length,
    maintenanceMachines: machines.filter((m) => m.status === "Maintenance").length,
    totalAlarms: alarms.length,
    openAlarms: alarms.filter((a) => a.status === "Open" || a.status === "In Progress").length,
    totalMaintenance: maintenance.length,
    pendingMaintenance: maintenance.filter((m) => m.status === "Pending" || m.status === "In Progress").length,
    waitingPartMaintenance: maintenance.filter((m) => m.status === "Waiting Part").length,
  };

  return (
    <DataContext.Provider
      value={{
        machines,
        alarms,
        maintenance,
        auditLogs,
        stats,
        loading,
        addMachine,
        updateMachine,
        deleteMachine,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        addMaintenance,
        updateMaintenance,
        deleteMaintenance,
        resetToDemoData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
