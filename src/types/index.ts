export type UserRole = "admin" | "technician" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type MachineStatus = "Running" | "Stop" | "Alarm" | "Maintenance";
export type MachineType =
  | "PLC System"
  | "CNC Machine"
  | "Conveyor Belt"
  | "Robotic Arm"
  | "Packaging Machine"
  | "Pumping Station"
  | "Hydraulic Press"
  | "Injection Molding"
  | string;

export interface Machine {
  id: string;
  machine_id: string; // Unique human-readable code e.g. "PLC-LINE-01"
  name?: string;
  machine_name: string;
  type?: string;
  machine_type: MachineType;
  location: string;
  status: MachineStatus;
  description?: string;
  ip_address?: string;
  protocol?: string;
  installed_at?: string;
  installation_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type AlarmSeverity = "Critical" | "High" | "Major" | "Medium" | "Minor" | "Low" | "Warning";
export type AlarmStatus = "Open" | "In Progress" | "Closed";

export interface Alarm {
  id: string;
  machine_id: string;
  alarm_code: string;
  description?: string;
  alarm_description: string;
  severity: AlarmSeverity;
  triggered_at?: string;
  occurred_at: string;
  cause?: string;
  status: AlarmStatus;
  resolution?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
  machine?: Machine;
}

export type MaintenanceType =
  | "Preventive"
  | "Corrective"
  | "Predictive"
  | "Breakdown"
  | "Overhaul"
  | "Emergency Repair";

export type MaintenanceStatus =
  | "Planned"
  | "Scheduled"
  | "In Progress"
  | "Waiting Part"
  | "Completed"
  | "Cancelled";

export interface MaintenanceRecord {
  id: string;
  machine_id: string;
  maintenance_type: MaintenanceType;
  problem: string;
  action_taken: string;
  technician_name?: string;
  technician_id?: string;
  technician?: UserProfile;
  scheduled_date?: string;
  maintenance_date: string;
  status: MaintenanceStatus;
  cost?: number;
  spare_part_used?: string;
  spare_part_change_request?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  machine?: Machine;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown> | string;
  created_at: string;
  profile?: UserProfile;
}

export interface DashboardStats {
  totalMachines: number;
  runningMachines: number;
  stopMachines: number;
  alarmMachines: number;
  maintenanceMachines: number;
  totalAlarms: number;
  openAlarms: number;
  inProgressAlarms: number;
  closedAlarms: number;
  criticalAlarms: number;
  totalMaintenance: number;
  completedMaintenance: number;
  inProgressMaintenance: number;
  plannedMaintenance: number;
  waitingPartMaintenance: number;
}

export type SystemStats = DashboardStats;
