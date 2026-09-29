# 🏗️ System Design Document: Alarm & Maintenance Management System

> **Project:** Alarm & Maintenance Management System  
> **Course:** Programming in Automation Systems  
> **Version:** 2.0 (Autonomous Architecture)

---

## 1. Project Scope & Architecture

ระบบเว็บแอปพลิเคชันสำหรับติดตามและบริหารจัดการเครื่องจักรในสายการผลิตอัตโนมัติ (Automation / Industrial Plant) รองรับ:
1. การตรวจสอบสถานะการทำงานแบบ Real-time บน SCADA KPI Dashboard
2. ทะเบียนเครื่องจักรหลัก (Machine Master) พร้อมระบบตรวจสอบรหัสซ้ำ (Unique ID Check)
3. ระบบจัดการสัญญาณเตือนขัดข้อง (Alarm Incident Lifecycle: Open ➔ In Progress ➔ Closed)
4. ระบบบริหารงานซ่อมบำรุง (Maintenance Tracking) รองรับ PM/BM/CM และสถานะพิเศษ "Waiting Part"
5. ประวัติเหตุการณ์ย้อนหลังของเครื่องจักรแต่ละเครื่อง (Machine History Timeline)
6. ระบบรักษาความปลอดภัยและการจำกัดสิทธิ์ผู้ใช้งาน (RBAC: Admin, Technician, Viewer)
7. ระบบบันทึกประวัติการใช้งาน (Audit Logs Trail)
8. การส่งออกรายงานสรุปเป็นไฟล์ CSV / Excel
9. สถาปัตยกรรม Dual-Mode Data Provider (เชื่อมต่อ Live Supabase PostgreSQL และมี Local Storage Fallback อัตโนมัติ)

---

## 2. Role-Based Access Control (RBAC) Matrix

| ฟังก์ชัน / สิทธิ์การเข้าถึง | Admin (ผู้ดูแลระบบ) | Technician (ช่างเทคนิค) | Viewer (ผู้สังเกตการณ์) |
|---|:---:|:---:|:---:|
| เข้าสู่ระบบ (Login / Logout) | ✔ | ✔ | ✔ |
| เข้าดู SCADA Dashboard & กราฟสถิติ | ✔ | ✔ | ✔ |
| ดูรายการเครื่องจักร & History Timeline | ✔ | ✔ | ✔ |
| เพิ่ม / แก้ไข ข้อมูลเครื่องจักร | ✔ | ✖ | ✖ |
| ลบเครื่องจักร (Delete Machine) | ✔ | ✖ | ✖ |
| เปิดแจ้งเตือน / เปลี่ยนสถานะ Alarm | ✔ | ✔ | ✖ |
| เปิดใบสั่งซ่อม / บันทึก Action Taken | ✔ | ✔ | ✖ |
| สลับสถานะซ่อมเป็น "Waiting Part" | ✔ | ✔ | ✖ |
| เข้าดูระบบ Audit Logs | ✔ | ✖ | ✖ |
| ส่งออกรายงานเป็นไฟล์ CSV | ✔ | ✔ | ✖ |

---

## 3. Database Schema (Supabase PostgreSQL)

### 3.1 ตาราง `profiles`
* `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
* `email` VARCHAR(255) NOT NULL UNIQUE
* `full_name` VARCHAR(255) NOT NULL
* `role` VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'technician', 'viewer'))
* `department` VARCHAR(100) DEFAULT 'Automation & Maintenance'
* `created_at` TIMESTAMPTZ DEFAULT NOW()
* `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 3.2 ตาราง `machines`
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `machine_id` VARCHAR(50) NOT NULL UNIQUE
* `name` VARCHAR(255) NOT NULL
* `type` VARCHAR(100) NOT NULL
* `location` VARCHAR(150) NOT NULL
* `status` VARCHAR(50) NOT NULL CHECK (status IN ('Running', 'Stop', 'Alarm', 'Maintenance'))
* `description` TEXT
* `installed_at` DATE DEFAULT CURRENT_DATE
* `created_at` TIMESTAMPTZ DEFAULT NOW()
* `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 3.3 ตาราง `alarms`
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `machine_id` UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE
* `alarm_code` VARCHAR(50) NOT NULL
* `description` TEXT NOT NULL
* `severity` VARCHAR(50) NOT NULL CHECK (severity IN ('Critical', 'Major', 'Minor', 'Warning'))
* `triggered_at` TIMESTAMPTZ DEFAULT NOW()
* `cause` TEXT
* `status` VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Closed'))
* `resolution` TEXT
* `acknowledged_by` VARCHAR(255)
* `created_at` TIMESTAMPTZ DEFAULT NOW()
* `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 3.4 ตาราง `maintenance_records`
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `machine_id` UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE
* `maintenance_type` VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('Preventive', 'Corrective', 'Breakdown'))
* `problem` TEXT NOT NULL
* `action_taken` TEXT
* `technician_name` VARCHAR(255) NOT NULL
* `scheduled_date` DATE NOT NULL
* `status` VARCHAR(50) NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Waiting Part', 'Completed', 'Cancelled'))
* `cost` NUMERIC(10, 2) DEFAULT 0
* `created_at` TIMESTAMPTZ DEFAULT NOW()
* `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 3.5 ตาราง `audit_logs`
* `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
* `user_id` UUID REFERENCES profiles(id) ON DELETE SET NULL
* `user_email` VARCHAR(255) NOT NULL
* `action` VARCHAR(100) NOT NULL
* `entity_type` VARCHAR(50) NOT NULL
* `entity_id` VARCHAR(100)
* `details` TEXT
* `created_at` TIMESTAMPTZ DEFAULT NOW()

---

## 4. Navigation & Page Structure

```
/                     ➔ Redirect to /login
/login                ➔ Authentication Portal (Email/Password & Quick Credentials)
/dashboard            ➔ SCADA KPI Dashboard (Donut & Bar Charts, Status Feed)
/machines             ➔ Machine Master (List, CRUD, Multi-Filter)
/machines/[id]        ➔ Machine History Lifecycle Timeline
/alarms               ➔ Alarm Management (Open ➔ In Progress ➔ Closed)
/maintenance          ➔ Maintenance Orders (PM/BM/CM + Waiting Part CR)
/audit-logs           ➔ Security & Operational Audit Trail (Admin only)
/reports              ➔ CSV Data Export (Machines, Alarms, Maintenance)
```

---

## 5. Security & Row Level Security (RLS) Strategy

1. **Client & Server Isolation:** Secret/Service Keys จะไม่ถูกฝังใน Client Bundle
2. **Route Guard:** `AppShell` ตรวจสอบสถานะ User Session หากยังไม่ Login จะ redirect ไป `/login` เสมอ
3. **Database RLS Policies:**
   - `Admin`: Full CRUD บนทุกตาราง
   - `Technician`: SELECT ทุกตาราง, INSERT/UPDATE ตาราง `alarms` และ `maintenance_records`
   - `Viewer`: SELECT อย่างเดียวทุกตาราง
