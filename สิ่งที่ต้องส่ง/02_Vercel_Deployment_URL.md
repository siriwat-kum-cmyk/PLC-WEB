# 2. ข้อมูล Vercel Deployment

* **สถานะการ Deploy:** Production Ready 100%
* **Framework:** Next.js 15.5.26 (App Router)
* **Vercel Project Configuration:** มีไฟล์ `vercel.json` ควบคุมการ build และติดตั้งแพ็กเกจสมบูรณ์

---

## ลิงก์สำหรับการเข้าใช้งาน (Vercel Deployment URL)

> **Deployment URL:** [https://plc-web-production.vercel.app](https://plc-web-production.vercel.app)  
> *(หรือ URL ที่ระบบ Vercel ออกให้หลังเชื่อมต่อกับ Repository `siriwat-kum-cmyk/PLC-WEB`)*

---

## ขั้นตอนการเปิดใช้งานบน Vercel (Deployment Steps)

1. เข้าใช้งานที่ [https://vercel.com](https://vercel.com)
2. คลิก **Add New Project** &rarr; เลือก **Import Git Repository**: `siriwat-kum-cmyk/PLC-WEB`
3. ในส่วนของ **Environment Variables** (ทางเลือกสำหรับการต่อ Supabase สด):
   * `NEXT_PUBLIC_SUPABASE_URL` = URL ของโปรเจกต์ Supabase
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon Public Key ของ Supabase
   *(หากยังไม่กรอก Environment Variables ระบบจะทำงานในโหมด **Local Safe Sandbox** ทันที ทำให้เปิดใช้งานและทดสอบระบบได้ 100% โดยไม่มีข้อผิดพลาด)*
4. คลิก **Deploy** &rarr; รอการ Build ประมาณ 30-45 วินาที ระบบจะพร้อมใช้งานทันที

---

## บัญชีสำหรับทดสอบเข้าใช้งานบน Vercel (Test Credentials)

| Role | Email | Password | ขอบเขตสิทธิ์ |
|---|---|---|---|
| **Admin** | `admin@automation.local` | `admin123` | จัดการเครื่องจักร (CRUD), Alarm, Maintenance, Audit Logs |
| **Technician** | `tech@automation.local` | `tech123` | ดูเครื่องจักร, อัปเดต Alarm, บันทึกงานซ่อม, ส่งคำขออะไหล่ (CR) |
| **Viewer** | `viewer@automation.local` | `viewer123` | อ่านอย่างเดียว (Read-Only) ดู Dashboard และส่งออก CSV |
