'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Machine,
  Alarm,
  MaintenanceRecord,
  AuditLog,
  UserProfile,
  DashboardStats,
  AlarmStatus,
} from '@/types';
import {
  INITIAL_MACHINES,
  INITIAL_ALARMS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDIT_LOGS,
  DEMO_PROFILES,
} from '@/lib/mock-data';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from './auth-context';

interface DataContextType {
  // State
  machines: Machine[];
  alarms: Alarm[];
  maintenanceRecords: MaintenanceRecord[];
  auditLogs: AuditLog[];
  profiles: UserProfile[];
  stats: DashboardStats;
  isLoading: boolean;
  dataSource: 'supabase' | 'local';

  // Machine Actions
  addMachine: (data: Omit<Machine, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string; data?: Machine }>;
  updateMachine: (id: string, data: Partial<Machine>) => Promise<{ success: boolean; error?: string }>;
  deleteMachine: (id: string) => Promise<{ success: boolean; error?: string }>;
  getMachineById: (id: string) => Machine | undefined;
  checkMachineIdExists: (machineCode: string, excludeId?: string) => boolean;

  // Alarm Actions
  addAlarm: (data: Omit<Alarm, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string; data?: Alarm }>;
  updateAlarm: (id: string, data: Partial<Alarm>) => Promise<{ success: boolean; error?: string }>;
  updateAlarmStatus: (id: string, status: AlarmStatus, note?: string) => Promise<{ success: boolean; error?: string }>;
  deleteAlarm: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Maintenance Actions
  addMaintenance: (data: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string; data?: MaintenanceRecord }>;
  updateMaintenance: (id: string, data: Partial<MaintenanceRecord>) => Promise<{ success: boolean; error?: string }>;
  deleteMaintenance: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Logging & Refresh
  logActivity: (action: string, entityType: string, entityId: string, details?: Record<string, unknown>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MACHINES: 'scada_machines_v2',
  ALARMS: 'scada_alarms_v2',
  MAINTENANCE: 'scada_maintenance_v2',
  AUDIT_LOGS: 'scada_audit_logs_v2',
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [profiles] = useState<UserProfile[]>(DEMO_PROFILES);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Load Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const [mRes, aRes, mnRes, logRes] = await Promise.all([
            supabase.from('machines').select('*').order('machine_id'),
            supabase.from('alarms').select('*, machines(*)').order('created_at', { ascending: false }),
            supabase.from('maintenance_records').select('*, machines(*), profiles(*)').order('maintenance_date', { ascending: false }),
            supabase.from('audit_logs').select('*, profiles(*)').order('created_at', { ascending: false }).limit(50),
          ]);

          if (!mRes.error && mRes.data && mRes.data.length > 0) {
            setMachines(mRes.data);
            setAlarms(aRes.data || []);
            setMaintenanceRecords(mnRes.data || []);
            setAuditLogs(logRes.data || []);
            setDataSource('supabase');
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // Fallback to LocalStorage or Mock data
    try {
      const storedM = localStorage.getItem(STORAGE_KEYS.MACHINES);
      const storedA = localStorage.getItem(STORAGE_KEYS.ALARMS);
      const storedMn = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);

      const mList = storedM ? JSON.parse(storedM) : INITIAL_MACHINES;
      const aList = storedA ? JSON.parse(storedA) : INITIAL_ALARMS;
      const mnList = storedMn ? JSON.parse(storedMn) : INITIAL_MAINTENANCE;
      const logList = storedLogs ? JSON.parse(storedLogs) : INITIAL_AUDIT_LOGS;

      setMachines(mList);
      setAlarms(aList);
      setMaintenanceRecords(mnList);
      setAuditLogs(logList);

      // Initialize local storage if empty
      if (!storedM) localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(mList));
      if (!storedA) localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(aList));
      if (!storedMn) localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(mnList));
      if (!storedLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logList));

      setDataSource('local');
    } catch (err) {
      console.error('Error loading local data:', err);
      setMachines(INITIAL_MACHINES);
      setAlarms(INITIAL_ALARMS);
      setMaintenanceRecords(INITIAL_MAINTENANCE);
      setAuditLogs(INITIAL_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Activity logger
  const logActivity = useCallback(
    async (action: string, entityType: string, entityId: string, details?: Record<string, unknown>) => {
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: user?.id || 'sys-demo-user',
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        created_at: new Date().toISOString(),
        profile: user || undefined,
      };

      setAuditLogs((prev) => {
        const updated = [newLog, ...prev.slice(0, 99)];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
        }
        return updated;
      });

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            await supabase.from('audit_logs').insert([
              {
                user_id: user?.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                details: details || {},
              },
            ]);
          }
        } catch (err) {
          console.warn('Failed to insert audit log to Supabase:', err);
        }
      }
    },
    [user, dataSource]
  );

  // Check duplicate Machine ID
  const checkMachineIdExists = useCallback(
    (machineCode: string, excludeId?: string): boolean => {
      const cleanCode = machineCode.trim().toUpperCase();
      return machines.some(
        (m) => m.machine_id.toUpperCase() === cleanCode && m.id !== excludeId
      );
    },
    [machines]
  );

  // Machine Actions
  const addMachine = useCallback(
    async (data: Omit<Machine, 'id' | 'created_at' | 'updated_at'>) => {
      if (checkMachineIdExists(data.machine_id)) {
        return { success: false, error: `รหัสเครื่องจักร '${data.machine_id}' ซ้ำกับในระบบ กรุณาระบุรหัสอื่น` };
      }

      const newId = `MCH-${Date.now()}`;
      const now = new Date().toISOString();
      const newMachine: Machine = {
        ...data,
        id: newId,
        machine_id: data.machine_id.trim().toUpperCase(),
        machine_name: data.machine_name.trim(),
        created_at: now,
        updated_at: now,
      };

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: inserted, error } = await supabase
              .from('machines')
              .insert([newMachine])
              .select()
              .single();
            if (error) throw error;
            if (inserted) {
              setMachines((prev) => [inserted, ...prev]);
              await logActivity('CREATE', 'machine', inserted.id, { machine_id: inserted.machine_id, name: inserted.machine_name });
              return { success: true, data: inserted };
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
          return { success: false, error: message };
        }
      }

      // Local storage
      setMachines((prev) => {
        const updated = [newMachine, ...prev];
        localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(updated));
        return updated;
      });

      await logActivity('CREATE', 'machine', newMachine.id, { machine_id: newMachine.machine_id, name: newMachine.machine_name });
      return { success: true, data: newMachine };
    },
    [checkMachineIdExists, dataSource, logActivity]
  );

  const updateMachine = useCallback(
    async (id: string, data: Partial<Machine>) => {
      if (data.machine_id && checkMachineIdExists(data.machine_id, id)) {
        return { success: false, error: `รหัสเครื่องจักร '${data.machine_id}' ซ้ำกับเครื่องจักรอื่น` };
      }

      const now = new Date().toISOString();

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase
              .from('machines')
              .update({ ...data, updated_at: now })
              .eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล';
          return { success: false, error: message };
        }
      }

      setMachines((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, ...data, updated_at: now } : m));
        localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(updated));
        return updated;
      });

      await logActivity('UPDATE', 'machine', id, data);
      return { success: true };
    },
    [checkMachineIdExists, dataSource, logActivity]
  );

  const deleteMachine = useCallback(
    async (id: string) => {
      // Data Integrity Check: Prevent deletion if alarms or maintenance records exist
      const machineObj = machines.find((m) => m.id === id);
      const machineCode = machineObj?.machine_id;

      const hasAlarms = alarms.some((a) => a.machine_id === id || a.machine_id === machineCode);
      const hasMaintenance = maintenanceRecords.some((m) => m.machine_id === id || m.machine_id === machineCode);

      if (hasAlarms || hasMaintenance) {
        return {
          success: false,
          error: `ไม่สามารถลบเครื่องจักร '${machineObj?.machine_name || id}' ได้ เนื่องจากมีประวัติ Alarm หรือ Maintenance ผูกอยู่ตามมาตรฐาน Data Integrity (ON DELETE RESTRICT)`,
        };
      }

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase.from('machines').delete().eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบข้อมูล';
          return { success: false, error: message };
        }
      }

      setMachines((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(updated));
        return updated;
      });

      await logActivity('DELETE', 'machine', id, { machine_code: machineCode });
      return { success: true };
    },
    [machines, alarms, maintenanceRecords, dataSource, logActivity]
  );

  const getMachineById = useCallback(
    (id: string) => {
      return machines.find((m) => m.id === id || m.machine_id === id);
    },
    [machines]
  );

  // Alarm Actions
  const addAlarm = useCallback(
    async (data: Omit<Alarm, 'id' | 'created_at' | 'updated_at'>) => {
      const newId = `ALM-${Date.now()}`;
      const now = new Date().toISOString();
      const machine = machines.find((m) => m.id === data.machine_id || m.machine_id === data.machine_id);

      const newAlarm: Alarm = {
        ...data,
        id: newId,
        created_at: now,
        updated_at: now,
        machine: machine || undefined,
      };

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: inserted, error } = await supabase
              .from('alarms')
              .insert([{
                machine_id: data.machine_id,
                alarm_code: data.alarm_code,
                alarm_description: data.alarm_description,
                severity: data.severity,
                status: data.status,
                occurred_at: data.occurred_at,
                cause: data.cause || null,
              }])
              .select('*, machines(*)')
              .single();
            if (error) throw error;
            if (inserted) {
              setAlarms((prev) => [inserted, ...prev]);
              await logActivity('CREATE', 'alarm', inserted.id, { code: inserted.alarm_code, machine: data.machine_id });
              return { success: true, data: inserted };
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก Alarm';
          return { success: false, error: message };
        }
      }

      setAlarms((prev) => {
        const updated = [newAlarm, ...prev];
        localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updated));
        return updated;
      });

      await logActivity('CREATE', 'alarm', newAlarm.id, { code: newAlarm.alarm_code, machine: data.machine_id });
      return { success: true, data: newAlarm };
    },
    [machines, dataSource, logActivity]
  );

  const updateAlarm = useCallback(
    async (id: string, data: Partial<Alarm>) => {
      const now = new Date().toISOString();

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase
              .from('alarms')
              .update({ ...data, updated_at: now })
              .eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแก้ไข Alarm';
          return { success: false, error: message };
        }
      }

      setAlarms((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, ...data, updated_at: now } : a));
        localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updated));
        return updated;
      });

      await logActivity('UPDATE', 'alarm', id, data);
      return { success: true };
    },
    [dataSource, logActivity]
  );

  const updateAlarmStatus = useCallback(
    async (id: string, status: AlarmStatus, note?: string) => {
      const now = new Date().toISOString();
      const updates: Partial<Alarm> = {
        status,
        updated_at: now,
      };

      if (status === 'Closed') {
        updates.resolved_at = now;
      }
      if (status === 'In Progress' && user) {
        updates.acknowledged_by = user.id;
        updates.acknowledged_at = now;
      }

      return updateAlarm(id, {
        ...updates,
        ...(note ? { cause: note } : {}),
      });
    },
    [updateAlarm, user]
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase.from('alarms').delete().eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ Alarm';
          return { success: false, error: message };
        }
      }

      setAlarms((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updated));
        return updated;
      });

      await logActivity('DELETE', 'alarm', id);
      return { success: true };
    },
    [dataSource, logActivity]
  );

  // Maintenance Actions
  const addMaintenance = useCallback(
    async (data: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const newId = `MNT-${Date.now()}`;
      const now = new Date().toISOString();
      const machine = machines.find((m) => m.id === data.machine_id || m.machine_id === data.machine_id);

      const newRecord: MaintenanceRecord = {
        ...data,
        id: newId,
        created_at: now,
        updated_at: now,
        machine: machine || undefined,
        technician: user || undefined,
      };

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: inserted, error } = await supabase
              .from('maintenance_records')
              .insert([{
                machine_id: data.machine_id,
                technician_id: data.technician_id || user?.id,
                maintenance_type: data.maintenance_type,
                problem: data.problem,
                action_taken: data.action_taken,
                maintenance_date: data.maintenance_date,
                status: data.status,
                cost: data.cost || 0,
                spare_part_used: data.spare_part_used || null,
                spare_part_change_request: data.spare_part_change_request || false,
                notes: data.notes || null,
              }])
              .select('*, machines(*), profiles(*)')
              .single();
            if (error) throw error;
            if (inserted) {
              setMaintenanceRecords((prev) => [inserted, ...prev]);
              await logActivity('CREATE', 'maintenance', inserted.id, { machine: data.machine_id, type: data.maintenance_type });
              return { success: true, data: inserted };
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก Maintenance';
          return { success: false, error: message };
        }
      }

      setMaintenanceRecords((prev) => {
        const updated = [newRecord, ...prev];
        localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(updated));
        return updated;
      });

      await logActivity('CREATE', 'maintenance', newRecord.id, { machine: data.machine_id, type: data.maintenance_type });
      return { success: true, data: newRecord };
    },
    [machines, user, dataSource, logActivity]
  );

  const updateMaintenance = useCallback(
    async (id: string, data: Partial<MaintenanceRecord>) => {
      const now = new Date().toISOString();

      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase
              .from('maintenance_records')
              .update({ ...data, updated_at: now })
              .eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแก้ไข Maintenance';
          return { success: false, error: message };
        }
      }

      setMaintenanceRecords((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, ...data, updated_at: now } : m));
        localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(updated));
        return updated;
      });

      await logActivity('UPDATE', 'maintenance', id, data);
      return { success: true };
    },
    [dataSource, logActivity]
  );

  const deleteMaintenance = useCallback(
    async (id: string) => {
      if (dataSource === 'supabase') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
            if (error) throw error;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ Maintenance';
          return { success: false, error: message };
        }
      }

      setMaintenanceRecords((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(updated));
        return updated;
      });

      await logActivity('DELETE', 'maintenance', id);
      return { success: true };
    },
    [dataSource, logActivity]
  );

  // Compute Dashboard Stats dynamically
  const stats: DashboardStats = useMemo(() => {
    const totalMachines = machines.length;
    const runningMachines = machines.filter((m) => m.status === 'Running').length;
    const stopMachines = machines.filter((m) => m.status === 'Stop').length;
    const alarmMachines = machines.filter((m) => m.status === 'Alarm').length;
    const maintenanceMachines = machines.filter((m) => m.status === 'Maintenance').length;

    const totalAlarms = alarms.length;
    const openAlarms = alarms.filter((a) => a.status === 'Open').length;
    const inProgressAlarms = alarms.filter((a) => a.status === 'In Progress').length;
    const closedAlarms = alarms.filter((a) => a.status === 'Closed').length;
    const criticalAlarms = alarms.filter((a) => a.severity === 'Critical' && a.status !== 'Closed').length;

    const totalMaintenance = maintenanceRecords.length;
    const completedMaintenance = maintenanceRecords.filter((m) => m.status === 'Completed').length;
    const inProgressMaintenance = maintenanceRecords.filter((m) => m.status === 'In Progress').length;
    const plannedMaintenance = maintenanceRecords.filter((m) => m.status === 'Planned').length;
    const waitingPartMaintenance = maintenanceRecords.filter((m) => m.status === 'Waiting Part').length;

    return {
      totalMachines,
      runningMachines,
      stopMachines,
      alarmMachines,
      maintenanceMachines,
      totalAlarms,
      openAlarms,
      inProgressAlarms,
      closedAlarms,
      criticalAlarms,
      totalMaintenance,
      completedMaintenance,
      inProgressMaintenance,
      plannedMaintenance,
      waitingPartMaintenance,
    };
  }, [machines, alarms, maintenanceRecords]);

  const value = {
    machines,
    alarms,
    maintenanceRecords,
    auditLogs,
    profiles,
    stats,
    isLoading,
    dataSource,
    addMachine,
    updateMachine,
    deleteMachine,
    getMachineById,
    checkMachineIdExists,
    addAlarm,
    updateAlarm,
    updateAlarmStatus,
    deleteAlarm,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    logActivity,
    refreshData: loadData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
