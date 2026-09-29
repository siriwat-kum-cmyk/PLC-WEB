-- ====================================================================
-- ALARM & MAINTENANCE MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Course: Programming in Automation Systems
-- Author: Automation Engineering Team
-- Tech Stack: Next.js + Tailwind CSS + Supabase + GitHub Actions + Vercel
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS alarms CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- TABLE: PROFILES (User Authentication & RBAC)
-- Roles: admin, technician, viewer (bonus role)
-- ====================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'viewer')) DEFAULT 'technician',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TABLE: MACHINES (Machine Master)
-- Unique Machine ID constraint, Status: Running, Stop, Alarm, Maintenance
-- ====================================================================
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g. CNC, PLC Conveyor, Robotic Arm, Packaging
    location VARCHAR(100) NOT NULL, -- e.g. Line 1, Line 2, Cleanroom, Warehouse
    status VARCHAR(50) NOT NULL CHECK (status IN ('Running', 'Stop', 'Alarm', 'Maintenance')) DEFAULT 'Running',
    description TEXT,
    installed_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TABLE: ALARMS (Alarm Incident Log)
-- Status: Open, In Progress, Closed
-- Severity: Low, Medium, High, Critical
-- ====================================================================
CREATE TABLE alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    alarm_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
    status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Closed')) DEFAULT 'Open',
    cause TEXT,
    resolution TEXT,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    reported_by UUID REFERENCES profiles(id),
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TABLE: MAINTENANCE_RECORDS (Work Orders)
-- Type: Preventive (PM), Breakdown (BM), Corrective (CM)
-- Status: Pending, In Progress, Waiting Part (CR!), Completed
-- ====================================================================
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('Preventive (PM)', 'Breakdown (BM)', 'Corrective (CM)')),
    problem TEXT NOT NULL,
    action_taken TEXT,
    technician_id UUID REFERENCES profiles(id),
    technician_name VARCHAR(255),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Waiting Part', 'Completed')) DEFAULT 'Pending',
    scheduled_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TABLE: AUDIT_LOGS (Audit Trail - Bonus Feature)
-- ====================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    user_name VARCHAR(255),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE
    entity VARCHAR(50) NOT NULL, -- Machine, Alarm, Maintenance
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST FILTERING & SEARCH
-- ====================================================================
CREATE INDEX idx_machines_machine_id ON machines(machine_id);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_alarms_machine_id ON alarms(machine_id);
CREATE INDEX idx_alarms_status ON alarms(status);
CREATE INDEX idx_alarms_severity ON alarms(severity);
CREATE INDEX idx_alarms_triggered_at ON alarms(triggered_at);
CREATE INDEX idx_maintenance_machine_id ON maintenance_records(machine_id);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_type ON maintenance_records(maintenance_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all records
CREATE POLICY "Allow public/authenticated read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read machines" ON machines FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read alarms" ON alarms FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read maintenance" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Allow public/authenticated read audit_logs" ON audit_logs FOR SELECT USING (true);

-- Allow authenticated users to insert/update based on role
CREATE POLICY "Allow authenticated insert machines" ON machines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update machines" ON machines FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete machines" ON machines FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert alarms" ON alarms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update alarms" ON alarms FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete alarms" ON alarms FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert maintenance" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update maintenance" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete maintenance" ON maintenance_records FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- ====================================================================
-- TRIGGER: AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'technician')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
