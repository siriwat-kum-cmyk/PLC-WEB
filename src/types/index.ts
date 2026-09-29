export type UserRole = "admin" | "technician" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export type MachineStatus = "Running" | "Stop" | "Alarm" | "Maintenance";

export interface Machine {
  id: string;
  machine_id: string; // e.g. CNC-01
  name: string;
  type: string; // e.g. CNC, PLC Conveyor, Robotic Arm
  location: string; // e.g. Line 1, Line 2, Cleanroom
  status: MachineStatus;
  description?: string;
  installed_at?: string;
  created_at: string;
  updated_at: string;
}

export type AlarmSeverity = "Low" | "Medium" | "High" | "Critical";
export type AlarmStatus = "Open" | "In Progress" | "Closed";

export interface Alarm {
  id: string;
  machine_id: string;
  machine?: Machine;
  alarm_code: string; // e.g. ERR-204
  description: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  cause?: string;
  resolution?: string;
  triggered_at: string;
  resolved_at?: string;
  reported_by?: string;
  resolved_by?: string;
  created_at: string;
}

export type MaintenanceType =
  | "Preventive (PM)"
  | "Breakdown (BM)"
  | "Corrective (CM)";

export type MaintenanceStatus =
  | "Pending"
  | "In Progress"
  | "Waiting Part" // Change Request requirement!
  | "Completed";

export interface MaintenanceRecord {
  id: string;
  machine_id: string;
  machine?: Machine;
  maintenance_type: MaintenanceType;
  problem: string;
  action_taken?: string;
  technician_id?: string;
  technician_name: string;
  status: MaintenanceStatus;
  scheduled_date: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  entity: "Machine" | "Alarm" | "Maintenance";
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalMachines: number;
  runningMachines: number;
  stoppedMachines: number;
  alarmMachines: number;
  maintenanceMachines: number;
  totalAlarms: number;
  openAlarms: number;
  totalMaintenance: number;
  pendingMaintenance: number;
  waitingPartMaintenance: number;
}
