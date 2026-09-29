# Automation Alarm and Maintenance Management System

## AI Agent Project Instructions

เอกสารนี้เป็นข้อกำหนดหลักสำหรับ AI Coding Agent ที่ทำงานภายใน Repository นี้

Agent ต้องอ่านเอกสารทั้งหมดก่อนดำเนินการ และทำงานในโหมด **Autonomous Execution** ตั้งแต่การวิเคราะห์ ออกแบบ พัฒนา ทดสอบ จัดทำ CI/CD จนถึงเอกสารส่งงาน โดยไม่ต้องรอการอนุมัติระหว่าง Phase ยกเว้นกรณีที่ระบุว่าเป็น External Blocker หรือ High-Risk Operation

---

# 1. Project Objective

พัฒนา Web Application สำหรับสนับสนุนงาน Automation และการบำรุงรักษาเครื่องจักรในรูปแบบ:

> Alarm and Maintenance Management System

ระบบต้องรองรับ:

- การยืนยันตัวตน
- การกำหนดสิทธิ์ตามบทบาท
- การจัดการข้อมูลเครื่องจักร
- การบันทึก Alarm
- การบันทึก Maintenance
- การค้นหาและกรองข้อมูล
- Dashboard สรุปผล
- Supabase Database
- GitHub และประวัติ Commit
- GitHub Actions
- Vercel Deployment
- เอกสารและหลักฐานการใช้ AI ในการพัฒนา

เป้าหมายสุดท้ายคือให้ระบบสามารถติดตั้ง รัน ทดสอบ Build และ Deploy ได้จริง พร้อมเอกสารประกอบการส่งงานครบถ้วน

---

# 2. Sources of Truth

ให้ใช้ลำดับความสำคัญของข้อกำหนดดังนี้:

1. เอกสาร Assignment ต้นฉบับ หากมีอยู่ใน Repository
2. Mandatory Requirements ในเอกสารนี้
3. Source Code และ Configuration ปัจจุบันของ Repository
4. Engineering Best Practices
5. ข้อเสนอแนะเพิ่มเติมในเอกสารนี้

หากเอกสาร Assignment ต้นฉบับขัดแย้งกับเอกสารนี้ ให้ยึด Assignment ต้นฉบับ และบันทึกข้อขัดแย้งใน Final Report

ห้ามสร้างข้อกำหนดใหม่แล้วอ้างว่าเป็นข้อกำหนดจาก Assignment

ต้องแยกข้อมูลเป็น:

- **Mandatory:** ข้อกำหนดบังคับ
- **Bonus:** คุณสมบัติเพิ่มเติมเพื่อคะแนนพิเศษ
- **Engineering Recommendation:** แนวทางทางวิศวกรรมที่เสนอเพิ่มเติม

---

# 3. Mandatory Technology Stack

| Layer | Required Technology |
|---|---|
| Web Framework | Next.js |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Authentication |
| Version Control | GitHub |
| Continuous Integration | GitHub Actions |
| Deployment | Vercel |
| AI Assistance | ใช้ AI ช่วยพัฒนาและจัดทำหลักฐาน |

## 3.1 Default Technical Decisions

หาก Repository ยังไม่ได้กำหนดแนวทาง ให้ใช้ค่าเริ่มต้นดังนี้:

| Area | Default |
|---|---|
| Next.js Architecture | App Router |
| Language | TypeScript |
| Package Manager | ใช้ตาม Lock File ที่พบ |
| Validation | Zod |
| Rendering | Server Components เป็นค่าเริ่มต้น |
| Interactive UI | Client Components เฉพาะส่วนที่จำเป็น |
| Database Primary Key | UUID |
| Date Storage | UTC |
| Authorization | Supabase Row Level Security |
| CI | GitHub Actions |
| Deployment | Vercel |
| Code Quality | ESLint และ TypeScript |
| Responsive Design | Mobile-first |

รายการในหัวข้อนี้เป็น Engineering Recommendation เว้นแต่ส่วนใดจำเป็นต่อข้อกำหนดบังคับ

หาก Repository มีเทคโนโลยีที่เหมาะสมและทำงานอยู่แล้ว ให้รักษาแนวทางเดิม และหลีกเลี่ยงการเปลี่ยนโครงสร้างโดยไม่มีเหตุผล

---

# 4. Mandatory Functional Requirements

## 4.1 Authentication

ระบบต้องมี:

- Login
- Logout
- Supabase Authentication
- Session Management
- Protected Routes
- ป้องกันผู้ใช้ที่ยังไม่ Login เข้าถึงหน้าภายในระบบ
- แสดงข้อความแจ้งเตือนเมื่อ Login ไม่สำเร็จ
- Redirect ผู้ใช้ไปยังหน้าที่เหมาะสมหลัง Login และ Logout

## 4.2 User Roles

ระบบต้องมีอย่างน้อย 2 Roles:

| Role | Permissions |
|---|---|
| Admin | จัดการ Machine, Alarm, Maintenance และข้อมูลหลักทั้งหมด |
| Technician | ดูข้อมูล Machine, ดู Dashboard, บันทึกหรือแก้ไข Maintenance และเปลี่ยนสถานะ Alarm |

การตรวจสอบสิทธิ์ต้องทำมากกว่าการซ่อนปุ่มใน UI โดยต้องพิจารณา:

- UI permission
- Route permission
- Server Action หรือ API permission
- Database Row Level Security

Technician ต้องไม่สามารถเรียกใช้การดำเนินการของ Admin โดยตรงผ่าน URL, API, Server Action หรือ Database

## 4.3 Machine Master

ข้อมูล Machine ต้องมีอย่างน้อย:

| Field | Description |
|---|---|
| Machine ID | รหัสเครื่องจักร |
| Machine Name | ชื่อเครื่องจักร |
| Machine Type | ประเภทเครื่องจักร |
| Location | ตำแหน่งติดตั้ง |
| Status | สถานะเครื่องจักร |

สถานะขั้นต่ำ:

- Running
- Stop
- Alarm
- Maintenance

ฟังก์ชันบังคับ:

- เพิ่ม Machine
- แสดงรายการ Machine
- ดูรายละเอียด Machine
- แก้ไข Machine
- ลบ Machine
- Machine ID ต้องไม่ซ้ำ
- ตรวจสอบ Required Fields
- แจ้งผลเมื่อบันทึกสำเร็จหรือไม่สำเร็จ
- Confirmation ก่อนลบ
- ป้องกันการลบที่ทำให้ประวัติ Alarm หรือ Maintenance เสียหาย

## 4.4 Alarm Record

ข้อมูล Alarm ต้องมีอย่างน้อย:

| Field | Description |
|---|---|
| Machine | เครื่องจักรที่เกิด Alarm |
| Alarm Code | รหัส Alarm |
| Alarm Description | รายละเอียด Alarm |
| Date/Time | วันและเวลาที่เกิด |
| Cause | สาเหตุ |
| Status | สถานะ Alarm |

สถานะขั้นต่ำ:

- Open
- In Progress
- Closed

ฟังก์ชันบังคับ:

- เพิ่ม Alarm
- แสดงรายการ Alarm
- ดูรายละเอียด Alarm
- แก้ไข Alarm
- เปลี่ยนสถานะ Alarm
- เชื่อมโยง Alarm กับ Machine
- ตรวจสอบ Required Fields
- ควบคุมสิทธิ์ตาม Role
- แสดงข้อความ Success และ Error

## 4.5 Maintenance Record

ข้อมูล Maintenance ต้องมีอย่างน้อย:

| Field | Description |
|---|---|
| Machine | เครื่องจักร |
| Maintenance Type | ประเภทการบำรุงรักษา |
| Problem | ปัญหาที่พบ |
| Action Taken | วิธีดำเนินการ |
| Technician | ผู้ปฏิบัติงาน |
| Date | วันที่ดำเนินการ |
| Status | สถานะงาน |

ฟังก์ชันบังคับ:

- เพิ่ม Maintenance Record
- แสดงรายการ Maintenance
- ดูรายละเอียด Maintenance
- แก้ไข Maintenance
- จัดการสถานะ Maintenance
- เชื่อมโยงกับ Machine
- เชื่อมโยงกับ Technician
- ตรวจสอบ Required Fields
- ควบคุมสิทธิ์ตาม Role
- แสดงข้อความ Success และ Error

หาก Assignment ไม่ได้ระบุค่า Maintenance Status ให้ Agent กำหนดค่าที่เหมาะสม เช่น:

- Planned
- In Progress
- Completed
- Cancelled

การกำหนดดังกล่าวต้องบันทึกเป็น Engineering Decision

## 4.6 Search and Filter

ระบบต้องค้นหาหรือกรองข้อมูลได้อย่างน้อย 2 เงื่อนไข

ตัวอย่าง:

- Keyword
- Machine
- Machine Status
- Alarm Code
- Alarm Status
- Maintenance Type
- Technician
- Date Range

หน้าที่มีตัวกรองต้องพิจารณา:

- ปุ่มค้นหาหรือการค้นหาอัตโนมัติ
- ปุ่มล้างตัวกรอง
- Loading State
- Empty State
- แสดงตัวกรองที่กำลังใช้งาน
- รองรับ URL Search Parameters หากเหมาะสม

## 4.7 Dashboard

Dashboard ต้องแสดงอย่างน้อย:

- จำนวนเครื่องจักรทั้งหมด
- จำนวน Machine สถานะ Running
- จำนวน Machine สถานะ Stop
- จำนวน Machine สถานะ Alarm
- จำนวน Machine สถานะ Maintenance
- จำนวน Alarm
- จำนวนงาน Maintenance

สามารถเพิ่มกราฟ เช่น:

- Donut Chart แสดง Machine ตามสถานะ
- Bar Chart แสดง Alarm ตามสถานะ
- Line Chart แสดง Alarm ตามช่วงเวลา
- Bar Chart แสดง Maintenance ตามประเภท

กราฟเป็นส่วนเสริม เว้นแต่ Assignment ต้นฉบับกำหนดไว้เป็นข้อบังคับ

Chart Library ต้องรองรับ Next.js และไม่ก่อให้เกิด Server-Side Rendering Error

---

# 5. Validation and User Experience

ระบบต้องมี Validation อย่างน้อย:

- Required Fields ห้ามว่าง
- Machine ID ห้ามซ้ำ
- สถานะต้องเป็นค่าที่ระบบอนุญาต
- Foreign Key ต้องอ้างอิงข้อมูลที่มีอยู่จริง
- วันที่และเวลาต้องอยู่ในรูปแบบที่ถูกต้อง
- ป้องกันค่าที่ไม่เหมาะสม
- ข้อความ Error ต้องเข้าใจได้

ควรตรวจสอบข้อมูลในหลายระดับ:

1. Client-side validation
2. Server-side validation
3. Database constraints

หน้าและฟอร์มต้องมี:

- Loading State
- Empty State
- Success Message
- Error Message
- Disabled State ระหว่างส่งข้อมูล
- Confirmation ก่อนลบ
- Responsive Layout
- Accessible Label
- Keyboard Navigation ที่เหมาะสม
- Contrast ที่อ่านได้

ห้ามพึ่ง Client-side Validation เพียงอย่างเดียว

---

# 6. Database Requirements

## 6.1 Minimum Tables

Database ต้องมีอย่างน้อย:

- `profiles`
- `machines`
- `alarms`
- `maintenance_records`

`profiles` ต้องเชื่อมโยงกับ `auth.users`

## 6.2 Minimum Relationships

```text
auth.users
  1 ─── 1 profiles

machines
  1 ─── N alarms

machines
  1 ─── N maintenance_records

profiles
  1 ─── N maintenance_records
```

## 6.3 Database Standards

ให้จัดทำ:

- Primary Keys
- Foreign Keys
- Unique Constraint สำหรับ Machine ID
- Check Constraints หรือ Database Enum ตามความเหมาะสม
- Index สำหรับคอลัมน์ที่ใช้ค้นหาหรือ Join บ่อย
- `created_at`
- `updated_at`
- Trigger สำหรับอัปเดต `updated_at`
- Row Level Security
- RLS Policies ตาม Role
- Seed Data ที่ไม่ใช้ข้อมูลส่วนบุคคลจริง
- SQL Migration หรือ Schema Script
- Data Dictionary
- Database Documentation

## 6.4 Data Deletion

ก่อนกำหนด Foreign Key Deletion Behavior ต้องวิเคราะห์:

- `ON DELETE RESTRICT`
- `ON DELETE CASCADE`
- `ON DELETE SET NULL`

ห้ามลบ Machine แล้วทำให้ Alarm หรือ Maintenance History สูญหายโดยไม่ได้ตั้งใจ

ให้ใช้แนวทางที่รักษาประวัติข้อมูล เช่น:

- ป้องกันการลบ Machine ที่มีประวัติ
- ใช้ Soft Delete หากเหมาะสม
- หรือกำหนด Foreign Key Behavior ที่ปลอดภัย

ต้องอธิบายการตัดสินใจในเอกสาร Database

## 6.5 Row Level Security

ต้องเปิดใช้งาน RLS สำหรับตารางข้อมูลที่ผู้ใช้เข้าถึงผ่าน Supabase Client

นโยบายขั้นต่ำ:

- Authenticated users อ่านข้อมูลตามสิทธิ์
- Admin จัดการข้อมูลทั้งหมด
- Technician ดู Machine
- Technician บันทึกหรือแก้ไข Maintenance ตามขอบเขตที่กำหนด
- Technician เปลี่ยนสถานะ Alarm ตามขอบเขตที่กำหนด
- ผู้ใช้ที่ไม่ได้ Login เข้าถึงข้อมูลภายในไม่ได้

ห้ามปิด RLS เพื่อหลบปัญหา Permission

---

# 7. Security Requirements

Agent ต้องปฏิบัติตามหลักการต่อไปนี้:

- ห้าม Hardcode Secret
- ห้าม Commit `.env` หรือ `.env.local`
- ห้ามเปิดเผย Supabase Service Role Key
- ห้ามใช้ Service Role Key ใน Client-side Code
- ใช้เฉพาะ Public หรือ Publishable Key ฝั่ง Client
- ตรวจสอบ Permission ฝั่ง Server หรือ Database
- Validate Input ก่อนบันทึก
- ป้องกัน Unauthorized Access
- ใช้ข้อมูลจำลองแทนข้อมูลส่วนบุคคลจริง
- ตรวจสอบว่า Client Bundle ไม่มี Secret
- ตรวจสอบ `.gitignore`
- สร้าง `.env.example` โดยไม่มีค่าจริง

หากพบ Secret ถูก Track ใน Git:

1. หยุดการ Commit หรือ Push
2. ห้ามแสดงค่า Secret
3. แจ้งว่าพบไฟล์หรือ Variable ที่มีความเสี่ยง
4. นำไฟล์ออกจาก Git Tracking อย่างปลอดภัย
5. แนะนำให้ Rotate Secret
6. บันทึกเหตุการณ์โดยไม่บันทึกค่าจริง

---

# 8. Git and GitHub Requirements

Repository ต้องมี:

- Source Code
- `.gitignore`
- `.env.example`
- `README.md`
- ประวัติ Commit ต่อเนื่อง
- Commit แยกตาม Phase หรือ Feature

ห้าม:

- Commit Environment Files ที่มีค่าจริง
- Commit Password หรือ Secret
- Push ทุก Feature รวมใน Commit เดียว
- Force Push โดยไม่ได้รับอนุญาต
- Rewrite Git History โดยไม่ได้รับอนุญาต

## 8.1 Recommended Commit Sequence

```text
docs: add requirements and architecture documentation
chore: initialize application configuration
chore: configure Supabase clients
feat: add authentication and protected routes
feat: implement role-based authorization
feat: implement machine management
feat: implement alarm management
feat: implement maintenance management
feat: add search and filtering
feat: add dashboard statistics
test: add application test coverage
ci: add GitHub Actions workflow
docs: complete project documentation
fix: resolve production build issues
```

ก่อน Commit ต้อง:

1. ตรวจสอบ `git status`
2. ตรวจสอบ `git diff`
3. ตรวจสอบว่าไม่มี Secret
4. รัน Validation ที่เกี่ยวข้อง
5. ใช้ Commit Message ที่สื่อความหมาย

Agent สามารถสร้าง Local Commit ได้เมื่อ Repository พร้อม แต่ห้าม Push หากไม่ทราบ Remote, Branch หรือไม่ได้รับ Authentication ที่เหมาะสม

---

# 9. GitHub Actions Requirements

ต้องมีอย่างน้อย 1 Workflow ที่ทำงานเมื่อ Push Source Code

Workflow ต้องตรวจสอบอย่างน้อยหนึ่งรายการตาม Assignment:

- Install Dependencies
- Build Project
- Run Tests

เพื่อคุณภาพที่ดี ควรตรวจสอบ:

- Install dependencies
- Lint
- Type check
- Tests
- Production build

ก่อนสร้าง Workflow ต้องตรวจสอบ Scripts ที่มีอยู่จริงใน `package.json`

ห้ามเรียก Script ที่ไม่มีอยู่

ตัวอย่างเป้าหมาย:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

ให้ปรับคำสั่งตาม Package Manager และ Scripts จริงของโครงการ

ห้ามรายงานว่า GitHub Actions ผ่าน หากยังไม่มีผลการรันจาก GitHub

---

# 10. Vercel Deployment Requirements

ระบบต้อง Deploy ด้วย Vercel และมี URL ที่เปิดใช้งานได้จริง

ต้องเตรียมและตรวจสอบ:

- Production Build
- Environment Variables
- Supabase Project URL
- Supabase Publishable Key หรือ Anon Key
- Supabase Site URL
- Authentication Redirect URLs
- Protected Routes
- Login และ Logout
- Role Permission
- CRUD
- Dashboard
- Row Level Security
- Production Error Handling
- Client Bundle Security

หาก CLI Login กับ Vercel และได้รับ Permission แล้ว สามารถ Deploy ได้

หากยังไม่มี Permission ให้เตรียมระบบจนถึงสถานะ **Ready for User Action** และระบุขั้นตอนที่ผู้ใช้ต้องทำ

ห้ามรายงานว่า Deployment สำเร็จจนกว่าจะได้รับ URL และตรวจสอบผลจริง

---

# 11. README Requirements

`README.md` ต้องประกอบด้วย:

- Project Name
- Project Overview
- Objectives
- Main Features
- User Roles
- Permission Matrix
- Technology Stack
- System Architecture
- Database Structure
- Project Structure
- Prerequisites
- Installation
- Environment Variables
- Supabase Setup
- Development Commands
- Build and Test
- วิธีใช้งานระบบ
- GitHub Actions
- Deployment Instructions
- Vercel URL
- Screenshots
- รายละเอียดการใช้ AI
- Known Limitations
- Future Improvements

Demo Accounts ให้ใช้เฉพาะข้อมูลทดสอบที่ปลอดภัย และห้ามใส่ Password จริงใน Public Repository

---

# 12. Required Deliverables

สิ่งที่ต้องส่ง:

1. GitHub Repository URL
2. Vercel Deployment URL
3. Supabase Database Schema
4. README
5. Screenshots หน้าจอระบบ
6. รายงานสั้นเกี่ยวกับการใช้ AI ในการพัฒนา

## 12.1 Screenshot Checklist

เตรียมรายการภาพอย่างน้อย:

- Login
- Dashboard
- Machine List
- Add Machine
- Edit Machine
- Machine Detail
- Alarm List
- Add Alarm
- Alarm Status Update
- Maintenance List
- Add Maintenance
- Edit Maintenance
- Search and Filter
- Validation Error
- Empty State
- Role Permission หรือ Access Denied
- GitHub Commit History
- GitHub Actions Successful Run
- Vercel Deployment
- Production Application

ห้ามสร้าง Screenshot ปลอมหรืออ้างผลที่ยังไม่เกิดขึ้นจริง

---

# 13. Assessment Criteria

คะแนนรวม 100 คะแนน:

| Category | Score |
|---|---:|
| Main Functions | 20 |
| Machine, Alarm and Maintenance Management | 15 |
| Supabase Database | 15 |
| Authentication and Role | 15 |
| Search, Filter and Validation | 10 |
| Dashboard | 10 |
| GitHub and Commit History | 5 |
| GitHub Actions | 5 |
| Vercel Deployment | 3 |
| README | 2 |
| Total | 100 |

Agent ต้องให้ความสำคัญกับ Mandatory Requirements ก่อน Bonus Features

---

# 14. Bonus Features

โบนัสสูงสุด 10 คะแนน ตัวอย่าง:

- Viewer Role
- Dashboard Charts
- Machine History
- Advanced Filters
- Export CSV หรือ Excel
- Notification
- Audit Log
- Responsive UI Improvements
- Dark Mode

ห้ามเริ่ม Bonus Feature ก่อน:

- Mandatory Features ครบ
- Lint ผ่าน
- Type Check ผ่าน
- Tests ที่เกี่ยวข้องผ่าน
- Production Build ผ่าน

หากเวลาหรือทรัพยากรจำกัด ให้เรียง Bonus ตามความคุ้มค่าต่อเวลาและความเสี่ยง

---

# 15. Source Code Standards

Source Code ต้อง:

- ใช้ TypeScript
- หลีกเลี่ยง `any`
- ใช้ชื่อภาษาอังกฤษสำหรับไฟล์ ตัวแปร Function Table และ Column
- แยก UI, Validation, Data Access และ Business Logic
- ลด Code ซ้ำ
- ใช้ Server Components และ Client Components อย่างเหมาะสม
- ไม่ Hardcode Permission กระจายหลายไฟล์
- ไม่ Hardcode Status โดยไม่มี Type หรือ Constant กลาง
- มี Loading, Empty, Error และ Success State
- รองรับ Responsive Design
- คำนึงถึง Accessibility
- ไม่มี Placeholder Code
- ไม่มีข้อความ “ใส่โค้ดส่วนที่เหลือ”
- ไม่มี API ที่ Deprecated โดยไม่จำเป็น
- ไม่มี Secret หรือ Credential
- ใช้ Comment เฉพาะ Logic ที่ซับซ้อน
- จัดการวันและเวลาอย่างสม่ำเสมอ

ห้ามแก้ Build Error ด้วยการ:

- ปิด TypeScript
- ปิด ESLint ทั้งระบบ
- ใช้ `@ts-ignore` โดยไม่มีคำอธิบาย
- เปลี่ยนทุกอย่างเป็น `any`
- ลบ Validation
- ปิด RLS
- ลบ Tests ที่ล้มเหลวโดยไม่วิเคราะห์
- ลด Mandatory Requirement

---

# 16. Autonomous Execution Mode

## 16.1 General Operation

ให้ดำเนินโครงการตั้งแต่ Phase 0 ถึง Phase 7 ต่อเนื่องโดยอัตโนมัติ

ไม่ต้องหยุดรอผู้ใช้อนุมัติหลังจบแต่ละ Phase

Agent มีอำนาจตัดสินใจเรื่อง:

- Project Structure
- Folder Structure
- Component Structure
- Database Schema
- Table Relationships
- Naming Convention
- Validation Strategy
- Authentication Architecture
- Authorization Architecture
- RLS Policies
- UI Layout
- Responsive Design
- Library Selection
- Testing Strategy
- GitHub Actions
- Documentation Structure

หลักการตัดสินใจตามลำดับ:

1. ตรงตาม Assignment
2. ปลอดภัย
3. ใช้งานและ Build ได้จริง
4. ดูแลรักษาได้
5. ไม่ซับซ้อนเกินความจำเป็น
6. Dependencies น้อย
7. Deploy บน Vercel ได้ง่าย

หากมีหลายแนวทางที่ถูกต้อง ให้เลือกแนวทางที่เรียบง่าย ปลอดภัย และมีความเสี่ยงต่ำกว่า

## 16.2 Repository-First Policy

ก่อนสร้างหรือแก้ไขไฟล์ต้อง:

1. ตรวจสอบโครงสร้าง Repository
2. ตรวจสอบ `package.json`
3. ตรวจสอบ Lock File
4. ตรวจสอบ Dependencies
5. ตรวจสอบ Existing Source Code
6. ตรวจสอบ Git Status
7. ตรวจสอบ Configuration
8. ตรวจสอบ Environment Variable Names โดยไม่แสดงค่าจริง
9. ตรวจสอบ Migration หรือ Database Scripts ที่มีอยู่
10. วางแผนการเปลี่ยนแปลงก่อนลงมือ

ห้ามเขียนทับ Source Code ที่ทำงานอยู่โดยไม่วิเคราะห์ผลกระทบ

---

# 17. Project Execution Phases

## Phase 0: Analysis

ดำเนินการ:

- อ่านเอกสารนี้ทั้งหมด
- ค้นหา Assignment ต้นฉบับใน Repository
- ตรวจสอบ Repository แบบ Read-only ก่อน
- ตรวจสอบ Git Status
- ตรวจสอบ Package Manager
- ตรวจสอบ Dependencies และ Scripts
- ตรวจสอบ Environment Variable Template
- สรุป Mandatory Requirements
- สรุป Bonus Requirements
- แยก Engineering Recommendations
- สร้าง Requirement Traceability Matrix
- วิเคราะห์ความเสี่ยง
- สร้าง Implementation Plan

เมื่อเสร็จแล้ว ให้ดำเนินการ Phase 1 ทันทีโดยไม่ต้องรออนุมัติ

## Phase 1: System Design

จัดทำ:

- Project Scope
- User Stories
- Acceptance Criteria
- Role-Permission Matrix
- Page List
- Navigation Structure
- System Architecture
- Database Schema
- Data Dictionary
- Entity Relationships
- RLS Strategy
- Validation Rules
- UI Guidelines
- Project Folder Structure
- Implementation Roadmap
- Architecture Decisions

เมื่อเสร็จแล้ว ให้ดำเนินการ Phase 2 ทันที

## Phase 2: Project Setup

ดำเนินการ:

- สร้างหรือปรับปรุง Next.js Project
- ตั้งค่า TypeScript
- ตั้งค่า Tailwind CSS
- ตั้งค่า ESLint
- ติดตั้ง Dependencies ที่จำเป็น
- ตั้งค่า Supabase Browser Client
- ตั้งค่า Supabase Server Client
- สร้าง `.env.example`
- ตรวจสอบ `.gitignore`
- สร้าง Base Layout
- สร้าง Navigation
- สร้าง Shared Components
- ตั้งค่า Scripts สำหรับ Lint, Type Check, Test และ Build

รันการตรวจสอบที่เกี่ยวข้อง และแก้ไข Error ก่อน Phase 3

## Phase 3: Database and Authentication

ดำเนินการ:

- สร้าง SQL Migration
- สร้าง Tables
- สร้าง Primary Keys
- สร้าง Foreign Keys
- สร้าง Constraints
- สร้าง Indexes
- สร้าง Timestamp Trigger
- เปิดใช้งาน RLS
- สร้าง RLS Policies
- สร้าง Seed Data
- พัฒนา Login
- พัฒนา Logout
- จัดการ Session
- ป้องกัน Protected Routes
- ตรวจสอบ Role
- ทดสอบ Admin
- ทดสอบ Technician
- ทดสอบ Unauthorized Access

หากยังไม่มี Supabase Project ให้สร้าง SQL และ Application Integration จนพร้อม แล้วระบุส่วนที่ต้องใช้ Environment Variables เป็น Blocker โดยทำงานส่วนอื่นต่อ

## Phase 4: Core Features

พัฒนาตามลำดับ:

1. Machine Management
2. Alarm Management
3. Maintenance Management
4. Search and Filter
5. Dashboard
6. Validation and Error Handling
7. Responsive UI
8. Accessibility Improvements

หลังจบแต่ละ Module ต้อง:

- ตรวจสอบ Source Code
- รัน Lint หรือ Type Check ที่เกี่ยวข้อง
- เพิ่มหรือปรับ Tests
- ตรวจสอบ Build ตามความเหมาะสม
- อัปเดต Requirement Traceability Matrix
- อัปเดต AI Development Log
- สร้าง Commit ที่เหมาะสมหาก Git พร้อม
- ดำเนินการ Module ถัดไปทันที

## Phase 5: Testing and Quality Assurance

จัดทำและดำเนินการ:

- Test Plan
- Functional Tests
- Authentication Tests
- Authorization Tests
- Validation Tests
- Database Constraint Tests
- Search and Filter Tests
- Dashboard Tests
- Responsive UI Tests
- Error Handling Tests
- Production Build Test

รัน:

- Lint
- Type Check
- Automated Tests
- Production Build

ห้ามกรอก Actual Result หรือ Pass/Fail หากยังไม่ได้รันจริง

## Phase 6: CI and Deployment

ดำเนินการ:

- ตรวจสอบ Git Repository
- ตรวจสอบ Commit History
- สร้าง GitHub Actions Workflow
- ตรวจสอบ Workflow Scripts
- รัน Local Checks ที่ตรงกับ Workflow
- จัดเตรียม Vercel Configuration
- จัดทำ Environment Variable Checklist
- ตรวจสอบ Production Build
- Push เมื่อ Remote, Branch และ Permission พร้อม
- Deploy เมื่อ Vercel Authentication และ Permission พร้อม
- ตรวจสอบ Production
- ตรวจสอบ Supabase Authentication URLs
- ตรวจสอบ RLS ใน Production

หาก Push หรือ Deploy ไม่ได้เพราะต้อง Login ให้จัดเตรียมทุกอย่างจนพร้อม และระบุ Manual Actions ที่ผู้ใช้ต้องทำ

## Phase 7: Documentation and Submission

จัดทำ:

- `README.md`
- Database Documentation
- SQL Scripts
- Requirement Traceability Matrix
- Implementation Plan
- Test Plan
- Test Results
- AI Development Log
- Deployment Checklist
- Screenshot Checklist
- Submission Checklist
- Final Report

ตรวจสอบ Mandatory Requirements ทุกข้อก่อนสรุปสถานะ

---

# 18. Progress Tracking Files

สร้างและอัปเดตไฟล์ต่อไปนี้:

```text
docs/REQUIREMENTS_TRACEABILITY.md
docs/IMPLEMENTATION_PLAN.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/TEST_PLAN.md
docs/TEST_RESULTS.md
docs/AI_DEVELOPMENT_LOG.md
docs/DEPLOYMENT_CHECKLIST.md
docs/SCREENSHOT_CHECKLIST.md
docs/SUBMISSION_CHECKLIST.md
docs/FINAL_REPORT.md
```

## 18.1 Requirement Traceability Matrix

ใช้รูปแบบ:

| Requirement ID | Requirement | Type | Module/Page | Database Table | Test Method | Evidence | Status |
|---|---|---|---|---|---|---|---|

สถานะที่อนุญาต:

- Not Started
- In Progress
- Blocked
- Ready for Test
- Passed
- Failed
- Optional

## 18.2 Test Case Format

ใช้รูปแบบ:

| Test ID | Feature | Preconditions | Steps | Test Data | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|---|

ห้ามสร้าง Actual Result ปลอม

## 18.3 AI Development Log

ใช้รูปแบบ:

| Date/Phase | Task | Prompt Summary | AI Output | Human Review | Issues | Verification |
|---|---|---|---|---|---|---|

ต้องบันทึก:

- งานที่ AI ช่วย
- ผลลัพธ์ที่ AI สร้าง
- Error ที่พบ
- วิธีแก้ไข
- คำสั่งที่ใช้ตรวจสอบ
- สิ่งที่ต้องให้มนุษย์ตรวจสอบ
- ห้ามอ้างว่ามนุษย์ตรวจสอบแล้วหากยังไม่ได้ยืนยัน

---

# 19. Safe Command Policy

Agent สามารถดำเนินการต่อไปนี้ได้โดยไม่ต้องขออนุญาต:

- อ่านและค้นหาไฟล์
- ตรวจสอบ Source Code
- ตรวจสอบ Git Status และ Git Diff
- สร้างและแก้ไขไฟล์ภายใน Repository
- สร้าง Documentation
- ติดตั้ง Dependencies ที่จำเป็น
- รัน Lint
- รัน Type Check
- รัน Tests
- รัน Build
- สร้าง SQL Migration
- สร้าง GitHub Actions Workflow
- สร้าง Local Commit เมื่อปลอดภัย
- ใช้ Supabase หรือ Vercel CLI ที่ Login และตั้งค่าไว้แล้วสำหรับการดำเนินการที่ย้อนกลับได้

ต้องขออนุญาตก่อน:

- ลบไฟล์จำนวนมาก
- ใช้ `git reset --hard`
- ใช้ `git clean -fd`
- Force Push
- Rewrite Git History
- ลบ Branch
- Drop Table ที่มีข้อมูล
- Reset Database
- ลบ Supabase Project
- ลบ Vercel Project
- ลบ Production Data
- เปลี่ยนหรือเปิดเผย Secret
- ดำเนินการที่มีค่าใช้จ่าย
- ดำเนินการที่ไม่สามารถย้อนกลับได้

ห้ามใช้ Destructive Command เพื่อแก้ปัญหาโดยอัตโนมัติ

---

# 20. Error Recovery Protocol

เมื่อเกิด Error:

1. บันทึกคำสั่งที่ทำให้เกิด Error
2. อ่าน Error Message ฉบับเต็ม
3. แยก Error ออกจาก Warning
4. วิเคราะห์ Root Cause
5. ตรวจสอบ Versions และ Dependencies
6. เลือกวิธีแก้ที่มีผลกระทบน้อยที่สุด
7. แก้ไขทีละสาเหตุ
8. รันคำสั่งเดิมอีกครั้ง
9. ตรวจสอบ Regression
10. บันทึกผลใน AI Development Log
11. ดำเนินการต่อเมื่อ Error ได้รับการแก้ไข

ลองแก้ไขได้สูงสุด 5 รอบต่อ Root Cause

หากยังไม่สำเร็จ:

- กำหนดงานย่อยนั้นเป็น Blocked
- บันทึก Error และสิ่งที่ทดลองแล้ว
- ห้ามวนซ้ำโดยไม่มีข้อมูลใหม่
- ดำเนินงานส่วนอื่นที่ไม่ขึ้นต่อกันต่อ
- รวม Blocker ไว้ใน Final Report

---

# 21. External Blockers

ให้ถามผู้ใช้เฉพาะกรณีที่ไม่สามารถดำเนินการเองได้ เช่น:

- ต้องสร้าง Supabase Project
- ต้องใช้ Supabase Project URL
- ต้องตั้ง Supabase Publishable Key หรือ Anon Key
- ต้อง Login ผ่าน Browser
- ต้องอนุมัติ GitHub Permission
- ต้องเลือก GitHub Organization หรือ Remote
- ต้องอนุมัติ Vercel Permission
- ต้องเลือก Production Project
- ต้องตั้งค่า Domain
- ต้องดำเนินการที่มีค่าใช้จ่าย
- ต้องลบหรือแก้ Production Data
- Requirement ขัดแย้งจนไม่สามารถตัดสินใจอย่างปลอดภัย

เมื่อพบ External Blocker:

1. อธิบายสิ่งที่ขาด
2. อธิบายเหตุผล
3. ระบุขั้นตอนที่ผู้ใช้ต้องทำ
4. ห้ามขอให้ผู้ใช้ส่ง Secret ใน Chat
5. ให้ผู้ใช้ตั้ง Secret ผ่าน Environment Variables หรือ Dashboard
6. ดำเนินงานส่วนอื่นที่ไม่ติด Blocker ต่อ
7. บันทึก Blocker ใน Final Report

---

# 22. Definition of Done

Feature ถือว่าเสร็จเมื่อ:

- ตรงตาม Requirement
- ไม่มี TypeScript Error ที่เกี่ยวข้อง
- ไม่มี Build Error ที่เกี่ยวข้อง
- ผ่าน Tests ที่กำหนด
- ตรวจสอบ Role และ Permission
- มี Validation
- มี Loading State
- มี Empty State
- มี Error State
- รองรับ Responsive UI
- มี Test Evidence
- อัปเดต Documentation
- อัปเดต Traceability Matrix

Project ถือว่าเสร็จเมื่อ:

- Mandatory Features ครบ
- Authentication ทำงาน
- Authorization ทำงาน
- Database Relationships ถูกต้อง
- RLS พร้อมใช้งาน
- Machine CRUD ทำงาน
- Alarm Management ทำงาน
- Maintenance Management ทำงาน
- Search และ Filter ทำงาน
- Dashboard ทำงาน
- Validation ทำงาน
- Lint ผ่าน
- Type Check ผ่าน
- Tests ผ่าน
- Production Build ผ่าน
- GitHub Actions พร้อม
- README ครบ
- Database Documentation ครบ
- AI Development Report ครบ
- Screenshot Checklist ครบ
- Requirement Traceability Matrix ไม่มี Mandatory Requirement ที่เป็น Not Started หรือ Failed

---

# 23. Completion Status

ให้ใช้สถานะต่อไปนี้:

## Completed

ใช้เมื่อ:

- Mandatory Requirements ได้รับการพัฒนา
- Lint ผ่าน
- Type Check ผ่าน
- Tests ผ่าน
- Production Build ผ่าน
- Documentation ครบ
- CI พร้อม
- ไม่มี Mandatory Requirement ถูกละเว้น

## Ready for User Action

ใช้เมื่อ Source Code พร้อม แต่ผู้ใช้ยังต้อง:

- สร้าง Supabase Project
- ตั้ง Environment Variables
- Login GitHub
- Push Repository
- Login Vercel
- Deploy Production
- ทดสอบ External Service
- ถ่าย Screenshots

## Blocked

ใช้เมื่อ:

- ขาดข้อมูลสำคัญ
- ขาด Credential หรือ Permission
- External Service ใช้งานไม่ได้
- Requirement ขัดแย้ง
- ต้องดำเนินการที่อาจทำลายข้อมูลจริง

ห้ามใช้สถานะ Completed หากยังไม่ผ่านการ Build จริง

---

# 24. Final Report Format

เมื่อทำงานเสร็จ ให้สร้าง `docs/FINAL_REPORT.md` โดยมี:

1. Executive Summary
2. Completion Status
3. Requirements Implemented
4. Features Implemented
5. Architecture Summary
6. Database Summary
7. Authentication and Authorization
8. Security Controls
9. Files Created and Modified
10. Commands Executed
11. Lint Result
12. Type Check Result
13. Test Result
14. Build Result
15. Git and Commit Status
16. GitHub Actions Status
17. Deployment Status
18. External Blockers
19. Manual Actions Required
20. Screenshot Checklist
21. Remaining Risks
22. Submission Readiness

แยกสถานะให้ชัดเจน:

- Verified
- Implemented but Not Verified
- Blocked
- Not Started
- Optional

ห้ามรายงานว่า GitHub Actions, Deployment หรือ Production Test สำเร็จ หากไม่มีผลจริง

---

# 25. Agent Communication Rules

ระหว่างทำงาน:

- ไม่ต้องหยุดรายงานหลังทุก Phase
- ไม่ต้องขออนุมัติสำหรับการแก้ไขทั่วไป
- ไม่ต้องถามเรื่องรูปแบบเล็กน้อยที่ตัดสินใจตาม Best Practices ได้
- หยุดถามเฉพาะ External Blocker หรือ High-Risk Operation
- หากมี Blocker ให้ถามเฉพาะข้อมูลที่จำเป็น
- ทำงานส่วนอื่นต่อหากไม่ขึ้นต่อ Blocker
- อย่ารายงานความสำเร็จที่ยังไม่ได้ตรวจสอบ
- สรุปผลครั้งใหญ่เมื่อเสร็จหรือเมื่อไม่สามารถดำเนินการต่อได้

---

# 26. Override of Previous Instructions

หัวข้อนี้แทนที่คำสั่งเดิมทั้งหมดที่กำหนดให้:

- หยุดรอหลัง Phase 0
- หยุดรอหลัง Phase 1
- ขออนุมัติก่อน Phase ถัดไป
- ขออนุมัติก่อนแก้ไข Source Code
- ขออนุมัติก่อนติดตั้ง Dependencies

ให้ดำเนินงาน Phase 0 ถึง Phase 7 ต่อเนื่องอัตโนมัติ

ข้อยกเว้นมีเฉพาะ:

- External Blocker
- High-Risk Operation
- Destructive Operation
- การดำเนินการที่มีค่าใช้จ่าย
- การดำเนินการกับ Production Data
- Requirement Conflict ที่ไม่สามารถตัดสินใจอย่างปลอดภัย

---

# 27. Initial Command

หลังอ่านเอกสารนี้ครบ ให้ดำเนินการดังนี้ทันที:

1. ตรวจสอบ Repository
2. ตรวจสอบ Assignment ต้นฉบับหากมี
3. ตรวจสอบ Git Status
4. วิเคราะห์ Requirements
5. สร้างเอกสารติดตามงาน
6. ออกแบบระบบ
7. พัฒนา Application
8. สร้าง Database Scripts
9. พัฒนา Authentication และ Authorization
10. พัฒนา Machine, Alarm และ Maintenance
11. เพิ่ม Search, Filter และ Dashboard
12. เพิ่ม Validation และ Error Handling
13. รัน Lint, Type Check, Tests และ Build
14. แก้ไข Error อย่างเป็นระบบ
15. สร้าง GitHub Actions
16. เตรียม Vercel Deployment
17. จัดทำ README และเอกสารส่งงาน
18. สรุป Final Report

เริ่มทำงานใน Autonomous Execution Mode ได้ทันที

ห้ามหยุดรอการอนุมัติระหว่าง Phase เว้นแต่พบ External Blocker หรือ High-Risk Operation ตามเอกสารนี้