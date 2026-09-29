-- ==========================================================
-- SCADA ALARM & MAINTENANCE MANAGEMENT SYSTEM - SUPABASE DDL
-- Course: Programming in Automation Systems
-- Author: Engineering Student Team
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'technician', 'viewer')),
    department VARCHAR(100) DEFAULT 'Automation & Maintenance',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Machines Table (Machine Master)
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Running', 'Stop', 'Alarm', 'Maintenance')),
    description TEXT,
    installed_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_machines_machine_id ON public.machines(machine_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);

-- 4. Create Alarms Table (Alarm Records)
CREATE TABLE IF NOT EXISTS public.alarms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    alarm_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Critical', 'Major', 'Minor', 'Warning')),
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    cause TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Closed')),
    resolution TEXT,
    acknowledged_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alarms_machine_id ON public.alarms(machine_id);
CREATE INDEX IF NOT EXISTS idx_alarms_status ON public.alarms(status);
CREATE INDEX IF NOT EXISTS idx_alarms_severity ON public.alarms(severity);

-- 5. Create Maintenance Records Table (With Waiting Part Change Request)
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('Preventive', 'Corrective', 'Breakdown')),
    problem TEXT NOT NULL,
    action_taken TEXT,
    technician_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Waiting Part', 'Completed', 'Cancelled')),
    cost NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_machine_id ON public.maintenance_records(machine_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_records(status);

-- 6. Create Audit Logs Table (Bonus Security Requirement)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 7. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_machines_updated_at BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_alarms_updated_at BEFORE UPDATE ON public.alarms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_maintenance_updated_at BEFORE UPDATE ON public.maintenance_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get role of current authenticated user
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Machines Policies
CREATE POLICY "Machines viewable by all authenticated users" ON public.machines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full control over machines" ON public.machines FOR ALL USING (get_current_user_role() = 'admin');

-- Alarms Policies
CREATE POLICY "Alarms viewable by all authenticated users" ON public.alarms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and Technicians can manage alarms" ON public.alarms FOR ALL USING (get_current_user_role() IN ('admin', 'technician'));

-- Maintenance Records Policies
CREATE POLICY "Maintenance viewable by all authenticated users" ON public.maintenance_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and Technicians can manage maintenance" ON public.maintenance_records FOR ALL USING (get_current_user_role() IN ('admin', 'technician'));

-- Audit Logs Policies
CREATE POLICY "Audit logs viewable only by Admins" ON public.audit_logs FOR SELECT USING (get_current_user_role() = 'admin');
CREATE POLICY "Audit logs insertable by system" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
