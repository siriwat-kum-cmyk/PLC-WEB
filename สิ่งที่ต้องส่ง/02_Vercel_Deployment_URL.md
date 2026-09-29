# 2. ข้อมูล Vercel Deployment

* **สถานะการ Deploy:** Production Live & Verified (ออนไลน์ใช้งานได้จริง)
* **Framework:** Next.js 15.5.26 (App Router)
* **Vercel Security & Share Token:** รวม Bypass Token สำหรับเข้าชมได้ทันที

---

## 🔗 ลิงก์สำหรับการเข้าใช้งานจริง (Vercel Live URL)

> **Live Deployment URL (พร้อม Share Token สำหรับอาจารย์เข้าตรวจได้ทันที):**  
> 🌐 [https://plc-31098zw6p-test11-fdee.vercel.app?_vercel_share=UOpiasrDPiDlYi7neyacBhJOHWgBnEqb](https://plc-31098zw6p-test11-fdee.vercel.app?_vercel_share=UOpiasrDPiDlYi7neyacBhJOHWgBnEqb)

*(ลิงก์นี้แนบ `_vercel_share` Token มาให้เรียบร้อยแล้ว อาจารย์สามารถคลิกเพื่อเข้าสู่ระบบ SCADA ได้ทันทีโดยไม่ต้องเข้าสู่ระบบบัญชี Vercel)*

---

## 🔑 บัญชีสำหรับทดสอบเข้าใช้งานบน Vercel (Test Credentials)

| บทบาท (Role) | อีเมลผู้ใช้งาน (Username) | รหัสผ่าน (Password) | ขอบเขตสิทธิ์การใช้งาน |
|---|---|---|---|
| **Admin** | `admin@automation.local` | `admin123` | **สิทธิ์สูงสุด:** จัดการทะเบียนเครื่องจักร (CRUD), Alarm, มอบหมายงานซ่อมบำรุง, ตรวจสอบ Audit Logs |
| **Technician** | `tech@automation.local` | `tech123` | **สิทธิ์ช่างเทคนิค:** ดูเครื่องจักร, อัปเดตสถานะ Alarm (Open &rarr; In Progress &rarr; Closed), บันทึกงานซ่อม, ส่งคำขอเบิกอะไหล่ (CR) |
| **Viewer** | `viewer@automation.local` | `viewer123` | **สิทธิ์ผู้สังเกตการณ์:** อ่านอย่างเดียว (Read-Only) ดู Dashboard, ทะเบียนเครื่องจักร, และดาวน์โหลดรายงาน CSV |

---

## ⚙️ คุณลักษณะทางเทคนิคบน Production
* **Routing Architecture:** Next.js 15.5.26 App Router (11 Static & Dynamic Routes)
* **Data Layer:** Dual-Mode Active (Local Sandbox Persistent Store & Supabase Connection Ready)
* **Design & Theme:** SCADA Industrial Theme รองรับการสลับ Dark / Light Mode แบบเรียลไทม์
* **Automated CI/CD:** เชื่อมต่อ GitHub Actions กับ Vercel Deployment Pipeline
