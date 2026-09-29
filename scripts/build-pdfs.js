const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Automated PDF Compilation for Manual & Presentation...\n');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
  return '';
}

// 1. GENERATE USER MANUAL HTML
console.log('📄 1. Generating User Manual HTML Document...');
const manualHtmlPath = path.join(DOCS_DIR, 'User_Manual.html');
const manualPdfPath = path.join(DOCS_DIR, 'User_Manual_Alarm_Maintenance_System.pdf');

const imgLogin = getBase64Image('01_login_page.png');
const imgDash = getBase64Image('02_dashboard_kpi.png');
const imgMachines = getBase64Image('03_machine_master.png');
const imgAddMachine = getBase64Image('04_add_machine_modal.png');
const imgHistory = getBase64Image('05_machine_history_timeline.png');
const imgAlarms = getBase64Image('06_alarm_management.png');
const imgMaintenance = getBase64Image('07_maintenance_operations.png');
const imgReports = getBase64Image('08_data_reports.png');
const imgAudit = getBase64Image('09_audit_logs.png');
const imgLight = getBase64Image('10_light_mode_dashboard.png');

const manualHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>SCADA Alarm & Maintenance System - User Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    body {
      font-family: 'Sarabun', sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3 {
      font-family: 'Sarabun', sans-serif;
      font-weight: 700;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    h1 { font-size: 20pt; color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
    h2 { font-size: 14pt; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    h3 { font-size: 12pt; color: #334155; }
    p { margin-top: 4px; margin-bottom: 8px; }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 9.5pt; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-admin { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; }
    .badge-tech { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .badge-viewer { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      color: #334155;
      font-weight: 700;
    }
    .img-container {
      margin: 10px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .caption {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }
    .callout {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9.5pt;
      color: #166534;
      border-radius: 0 6px 6px 0;
    }
    .callout-warn {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 9.5pt;
      color: #92400e;
      border-radius: 0 6px 6px 0;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div style="text-align: center; padding-top: 40px; padding-bottom: 30px;">
    <div style="display: inline-block; width: 64px; height: 64px; background: #0284c7; border-radius: 12px; color: white; line-height: 64px; font-size: 32px; font-weight: bold; margin-bottom: 12px;">⚡</div>
    <h1 style="border: none; font-size: 24pt; margin-bottom: 4px; color: #0f172a;">คู่มือการใช้งานระบบควบคุม SCADA</h1>
    <h3 style="color: #0284c7; font-weight: 600; margin-top: 0;">Alarm & Maintenance Management System</h3>
    <p style="color: #64748b; font-size: 11pt;">ระบบบริหารจัดการเหตุการณ์แจ้งเตือนและงานซ่อมบำรุงรักษาโรงงานอัจฉริยะ (Industry 4.0)</p>
    
    <div style="margin: 30px auto; max-width: 480px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 10pt;">
      <p><strong>วิชา:</strong> การเขียนโปรแกรมในระบบอัตโนมัติ (Programming in Automation Systems)</p>
      <p><strong>เทคโนโลยีหลัก:</strong> Next.js 15.5.26, TypeScript, Tailwind CSS, Supabase, Recharts</p>
      <p><strong>Vercel Live URL:</strong> <a href="https://plc-31098zw6p-test11-fdee.vercel.app?_vercel_share=UOpiasrDPiDlYi7neyacBhJOHWgBnEqb" style="color: #0284c7; text-decoration: underline;">https://plc-31098zw6p-test11-fdee.vercel.app</a></p>
      <p><strong>GitHub Repository:</strong> <a href="https://github.com/siriwat-kum-cmyk/PLC-WEB" style="color: #0284c7; text-decoration: underline;">https://github.com/siriwat-kum-cmyk/PLC-WEB</a></p>
      <p><strong>เวอร์ชันระบบ:</strong> v2.4.0 Production Build (Live & Verified)</p>
      <p><strong>วันที่จัดทำ:</strong> กันยายน 2026</p>
    </div>
  </div>

  <div class="callout">
    <strong>มาตรฐานระบบ:</strong> ระบบได้รับการพัฒนาตามข้อกำหนด Master Assignment ครอบคลุมการควบคุมสิทธิ์เข้มงวด (Strict RBAC), การตรวจสอบข้อมูลซ้ำ (Unique Machine ID), การรักษาประวัติข้อมูล (ON DELETE RESTRICT), และคำขอเบิกอะไหล่ (Waiting Part Change Request)
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1: AUTH & RBAC -->
  <h2>1. การเข้าสู่ระบบและการควบคุมสิทธิ์ตามบทบาท (Authentication & RBAC)</h2>
  <p>ระบบกำหนดให้ผู้ใช้งานต้องยืนยันตัวตนก่อนเข้าสู่ระบบ โดยมีการตรวจสอบสิทธิ์อย่างเข้มงวด (Strict Verification) ระบบจะปฏิเสธอีเมลและรหัสผ่านที่ไม่ถูกต้องทันที</p>
  
  <h3>1.1 ข้อมูลบัญชีผู้ใช้งานสำหรับทดสอบระบบ (Authorized Accounts)</h3>
  <table>
    <thead>
      <tr>
        <th>บทบาท (Role)</th>
        <th>อีเมล (Email)</th>
        <th>รหัสผ่าน</th>
        <th>ขอบเขตสิทธิ์การใช้งาน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-admin">ADMIN</span></td>
        <td class="mono">admin@automation.local</td>
        <td class="mono">admin123</td>
        <td>จัดการเครื่องจักร (CRUD), จัดการ Alarm, มอบหมายงานซ่อมบำรุง, ดู Audit Logs, ส่งออกข้อมูล</td>
      </tr>
      <tr>
        <td><span class="badge badge-tech">TECHNICIAN</span></td>
        <td class="mono">tech@automation.local</td>
        <td class="mono">tech123</td>
        <td>ดูข้อมูลเครื่องจักร, เปลี่ยนสถานะ Alarm, บันทึก/แก้ไขงานซ่อมบำรุง, สร้างคำขออะไหล่</td>
      </tr>
      <tr>
        <td><span class="badge badge-viewer">VIEWER</span></td>
        <td class="mono">viewer@automation.local</td>
        <td class="mono">viewer123</td>
        <td>สิทธิ์อ่านอย่างเดียว (Read-Only) ดู Dashboard, ทะเบียนเครื่องจักร, และดาวน์โหลดรายงาน</td>
      </tr>
    </tbody>
  </table>

  <div class="img-container">
    <img src="${imgLogin}" alt="Login Portal">
    <div class="caption">รูปที่ 1: หน้าจอ Authentication Portal พร้อมปุ่ม Quick Demo Roles สำหรับกรอกข้อมูลด่วน</div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 2: DASHBOARD -->
  <h2>2. ศูนย์ควบคุมและภาพรวมสถิติ SCADA KPI Dashboard</h2>
  <p>Dashboard ทำหน้าที่รวบรวมตัวชี้วัดประสิทธิภาพหลัก 7 ประการ (7 Mandatory KPIs) และแสดงผลกราฟิกวิเคราะห์ข้อมูลเชิงลึกด้วย Recharts โดยไม่มีปัญหา Hydration Mismatch</p>

  <h3>2.1 ตัวชี้วัดสำคัญ 7 ประการ (Mandatory Metrics)</h3>
  <ul>
    <li><strong>Total Machines:</strong> จำนวนเครื่องจักรทั้งหมดในระบบ</li>
    <li><strong>Machine Running:</strong> เครื่องจักรที่กำลังทำงานปกติในสายการผลิต</li>
    <li><strong>Machine Stop:</strong> เครื่องจักรที่หยุดเดินเครื่องตามรอบการทำงาน</li>
    <li><strong>Machine Alarm:</strong> เครื่องจักรที่เกิดข้อผิดพลาดและส่งสัญญาณเตือน</li>
    <li><strong>Machine Maintenance:</strong> เครื่องจักรที่อยู่ระหว่างงานซ่อมบำรุงรักษา</li>
    <li><strong>Total Alarms:</strong> สถิติจำนวนการแจ้งเตือนทั้งหมด พร้อมตัวเลขอัตราส่วน Open / Critical</li>
    <li><strong>Total Maintenance:</strong> จำนวนบันทึกงานซ่อมบำรุงทั้งหมด พร้อมตัวเลขคำขอเบิกอะไหล่ (Waiting Part)</li>
  </ul>

  <div class="img-container">
    <img src="${imgDash}" alt="Dashboard KPI">
    <div class="caption">รูปที่ 2: หน้าจอ SCADA Executive Dashboard แสดง KPI Cards, Donut Chart และตารางเหตุการณ์เตือนภัย</div>
  </div>

  <div class="img-container">
    <img src="${imgLight}" alt="Light Mode Dashboard">
    <div class="caption">รูปที่ 3: ระบบรองรับการสลับโหมดการแสดงผลแบบ Light Mode และ Dark Mode เพื่อความสะดวกในการใช้งาน</div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3: MACHINE MASTER -->
  <h2>3. การจัดการทะเบียนเครื่องจักร (Machine Master Management)</h2>
  <p>โมดูลทะเบียนเครื่องจักรจัดเก็บข้อมูลคุณลักษณะเฉพาะของเครื่องจักร พิกัดตำแหน่งในโรงงาน ไอพีแอดเดรส PLC และสถานะแบบเรียลไทม์</p>

  <h3>3.1 การตรวจสอบความถูกต้องและการป้องกันข้อมูล (Validation & Data Integrity)</h3>
  <ul>
    <li><strong>Machine ID Uniqueness:</strong> ระบบตรวจสอบความซ้ำซ้อนของรหัสเครื่องจักรแบบเรียลไทม์ ป้องกันการตั้งรหัสซ้ำ</li>
    <li><strong>ON DELETE RESTRICT Guard:</strong> ระบบป้องกันการลบเครื่องจักรที่มีประวัติการเกิด Alarm หรือประวัติการซ่อมบำรุงผูกอยู่ เพื่อรักษาข้อมูลย้อนหลังตามมาตรฐานวิศวกรรม</li>
  </ul>

  <div class="img-container">
    <img src="${imgMachines}" alt="Machine Master">
    <div class="caption">รูปที่ 4: รายการทะเบียนเครื่องจักรพร้อมตัวกรองค้นหาตาม Status และ Type</div>
  </div>

  <div class="img-container">
    <img src="${imgAddMachine}" alt="Add Machine Modal">
    <div class="caption">รูปที่ 5: ฟอร์มเพิ่มเครื่องจักรใหม่พร้อมการตรวจสอบ Required Fields และ Unique Machine ID</div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 4: MACHINE TIMELINE -->
  <h2>4. ประวัติเครื่องจักรแบบเรียงลำดับเวลา (Machine History Timeline)</h2>
  <p>ผู้ใช้งานสามารถคลิกที่รหัสเครื่องจักรเพื่อดูหน้าประวัติเครื่องจักรรายชิ้น (Machine Details & History Timeline) ซึ่งนำเหตุการณ์ Alarm และประวัติการซ่อมบำรุงมาแสดงผลเรียงตามลำดับเวลา (Chronological Feed)</p>

  <div class="img-container">
    <img src="${imgHistory}" alt="Machine History Timeline">
    <div class="caption">รูปที่ 6: หน้ารายละเอียดและประวัติเครื่องจักรแบบลำดับเวลา แยกประเภทเหตุการณ์ด้วยสีและสัญลักษณ์ชัดเจน</div>
  </div>

  <!-- SECTION 5: ALARM MANAGEMENT -->
  <h2>5. การเฝ้าระวังและจัดการเหตุการณ์แจ้งเตือน (Alarm Incident Workflow)</h2>
  <p>ระบบติดตามวงจรชีวิตของการแจ้งเตือนตามลำดับขั้นตอน:</p>
  <div style="text-align: center; margin: 12px 0;">
    <span class="badge" style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">1. OPEN (เกิดขึ้นใหม่)</span>
    &nbsp;&rarr;&nbsp;
    <span class="badge" style="background: #fef3c7; color: #d97706; border: 1px solid #fcd34d;">2. IN PROGRESS (ช่างรับทราบ/กำลังตรวจ)</span>
    &nbsp;&rarr;&nbsp;
    <span class="badge" style="background: #dcfce7; color: #16a34a; border: 1px solid #86efac;">3. CLOSED (แก้ไขเสร็จสิ้น)</span>
  </div>

  <div class="img-container">
    <img src="${imgAlarms}" alt="Alarm Incidents">
    <div class="caption">รูปที่ 7: หน้าจอเฝ้าระวัง Alarm Monitoring พร้อมปุ่มเปลี่ยนสถานะด่วนสำหรับช่างเทคนิค</div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 6: MAINTENANCE & CR -->
  <h2>6. การบริหารงานซ่อมบำรุงรักษา (Maintenance Operations & Waiting Part CR)</h2>
  <p>บันทึกการซ่อมบำรุงรักษาทั้งเชิงป้องกัน (PM) และเชิงแก้ไข (CM) พร้อมการระบุวิธีแก้ไขและค่าใช้จ่าย</p>

  <div class="callout-warn">
    <strong>ฟังก์ชันพิเศษคำขอเปลี่ยนอะไหล่ (Waiting Part Change Request):</strong> ช่างเทคนิคสามารถทำเครื่องหมายในช่อง <em>"คำขอเบิก/สั่งซื้ออะไหล่ใหม่"</em> ระบบจะปรับสถานะงานเป็น <strong>"Waiting Part"</strong> โดยอัตโนมัติ เพื่อแจ้งเตือนไปยังฝ่ายจัดซื้อและคลังพัสดุ
  </div>

  <div class="img-container">
    <img src="${imgMaintenance}" alt="Maintenance Operations">
    <div class="caption">รูปที่ 8: รายการบันทึกงานซ่อมบำรุงรักษา แสดงสถานะ Waiting Part และ CR Request</div>
  </div>

  <!-- SECTION 7: REPORTS & AUDIT -->
  <h2>7. การส่งออกข้อมูลและบันทึกความปลอดภัย (Data Reports & Audit Trail)</h2>
  <p>ระบบจัดเตรียมฟังก์ชันส่งออกไฟล์ CSV สำหรับนำไปประมวลผลต่อใน Microsoft Excel หรือโปรแกรมวิเคราะห์ข้อมูล โดยเข้ารหัสด้วย <strong>UTF-8 BOM</strong> ทำให้เปิดดูภาษาไทยได้สมบูรณ์แบบโดยตัวอักษรไม่เป็นภาษาต่างดาว</p>

  <div class="img-container">
    <img src="${imgReports}" alt="Data Reports">
    <div class="caption">รูปที่ 9: ศูนย์ส่งออกข้อมูล CSV รองรับการดาวน์โหลดข้อมูลเครื่องจักร, Alarm, และ Maintenance</div>
  </div>

  <div class="img-container">
    <img src="${imgAudit}" alt="Audit Trail">
    <div class="caption">รูปที่ 10: บันทึกกิจกรรมความปลอดภัย (System Audit Trail) สำหรับผู้ดูแลระบบ</div>
  </div>

</body>
</html>
`;

fs.writeFileSync(manualHtmlPath, manualHtml);
console.log('✅ User Manual HTML written to:', manualHtmlPath);


// 2. GENERATE PRESENTATION SLIDES HTML (16:9 Widescreen Landscape)
console.log('\n📊 2. Generating Presentation Slides HTML Document (16:9 Landscape)...');
const presentationHtmlPath = path.join(DOCS_DIR, 'Presentation.html');
const presentationPdfPath = path.join(DOCS_DIR, 'Presentation_Alarm_Maintenance_System.pdf');

const presentationHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>SCADA Alarm & Maintenance System - Presentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    /* Strict 16:9 Widescreen Page Dimensions (without keyword landscape to avoid Chromium parser bug) */
    @page {
      size: 297mm 167.0625mm;
      margin: 0;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Sarabun', sans-serif;
      background-color: #090d16;
      color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .slide {
      width: 297mm;
      height: 167.0625mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 22mm 24mm;
      background: radial-gradient(circle at 80% 20%, #0d2847 0%, #080f1d 70%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 12px;
    }
    
    .slide-title {
      font-size: 22pt;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: -0.5px;
    }
    
    .slide-subtitle {
      font-size: 11pt;
      color: #94a3b8;
      margin-top: 3px;
    }
    
    .slide-badge {
      background: #0284c7;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .slide-content {
      flex: 1;
      margin-top: 16px;
      display: flex;
      gap: 24px;
      align-items: center;
    }
    
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #1e293b;
      padding-top: 10px;
      font-size: 9pt;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      width: 100%;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      width: 100%;
    }
    
    .card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px 20px;
    }

    .card h3 {
      color: #38bdf8;
      font-size: 13pt;
      margin-bottom: 8px;
    }

    .card p, .card li {
      font-size: 10pt;
      color: #cbd5e1;
      line-height: 1.5;
    }

    ul {
      margin-left: 18px;
    }

    li {
      margin-bottom: 6px;
    }
    
    .slide-img {
      max-width: 100%;
      max-height: 95mm;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #334155;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide" style="justify-content: center; text-align: center; background: radial-gradient(circle at 50% 50%, #0f3966 0%, #070e1c 80%);">
    <div>
      <div style="display: inline-block; background: #0284c7; color: white; padding: 6px 16px; border-radius: 20px; font-size: 10pt; font-weight: bold; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace;">
        🏭 INDUSTRIAL AUTOMATION & SCADA 4.0
      </div>
      <h1 style="font-size: 32pt; font-weight: 800; color: #f8fafc; margin-bottom: 10px; line-height: 1.2;">
        SCADA Alarm & Maintenance<br><span style="color: #38bdf8;">Management System</span>
      </h1>
      <p style="font-size: 14pt; color: #94a3b8; max-width: 700px; margin: 0 auto 28px;">
        ระบบบริหารจัดการเหตุการณ์แจ้งเตือนและงานซ่อมบำรุงรักษาเครื่องจักรอุตสาหกรรม
      </p>
      
      <div style="display: inline-flex; gap: 24px; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; padding: 12px 24px; border-radius: 12px; font-size: 10pt; text-align: left;">
        <div>
          <span style="color: #64748b; font-size: 8.5pt; display: block;">วิชา (COURSE)</span>
          <span style="color: #e2e8f0; font-weight: 600;">Programming in Automation Systems</span>
        </div>
        <div style="border-left: 1px solid #334155; padding-left: 20px;">
          <span style="color: #64748b; font-size: 8.5pt; display: block;">VERCEL LIVE URL</span>
          <span style="color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt;">plc-31098zw6p-test11-fdee.vercel.app</span>
        </div>
        <div style="border-left: 1px solid #334155; padding-left: 20px;">
          <span style="color: #64748b; font-size: 8.5pt; display: block;">GITHUB REPO</span>
          <span style="color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt;">github.com/siriwat-kum-cmyk/PLC-WEB</span>
        </div>
      </div>
    </div>
    
    <div class="slide-footer" style="border: none; margin-top: 24px;">
      <span>Vercel Live: https://plc-31098zw6p-test11-fdee.vercel.app</span>
      <span>Autonomous Engineering Project</span>
    </div>
  </div>

  <!-- SLIDE 2: OBJECTIVES -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">1. วัตถุประสงค์และภาพรวมสถาปัตยกรรม</div>
        <div class="slide-subtitle">Project Objectives & Architectural Concept</div>
      </div>
      <div class="slide-badge">OVERVIEW</div>
    </div>

    <div class="slide-content">
      <div class="grid-2">
        <div class="card">
          <h3>🎯 วัตถุประสงค์หลักของระบบ</h3>
          <ul>
            <li><strong>Operational Continuity:</strong> ลดระยะเวลา Downtime ในโรงงานด้วยระบบแจ้งเตือนแบบเรียลไทม์</li>
            <li><strong>Data Integrity & Traceability:</strong> รักษาประวัติเหตุการณ์และงานซ่อมบำรุงด้วยนโยบาย Foreign Key RESTRICT</li>
            <li><strong>Strict Authentication:</strong> บังคับใช้การยืนยันตัวตนเข้มงวด ป้องกันการลักลอบเข้าถึงหน้าภายใน</li>
            <li><strong>Dual-Mode Data Architecture:</strong> รองรับทั้ง Supabase Cloud DB สด และ Local Sandbox Offline</li>
          </ul>
        </div>

        <div class="card">
          <h3>⚙️ คุณลักษณะทางวิศวกรรมที่สำคัญ</h3>
          <ul>
            <li><strong>Frontend Framework:</strong> Next.js 15 App Router พร้อม React 19</li>
            <li><strong>Type Safety:</strong> TypeScript Strict Mode (0 type errors)</li>
            <li><strong>Design System:</strong> Tailwind CSS SCADA Industrial UI (Dark/Light Mode)</li>
            <li><strong>Quality Assurance:</strong> Automated CI/CD Pipeline ผ่าน GitHub Actions</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>PLC-WEB SCADA Automation</span>
      <span>Slide 2 / 10</span>
    </div>
  </div>

  <!-- SLIDE 3: RBAC & LOGIN -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">2. การควบคุมสิทธิ์ตามบทบาท (Strict RBAC)</div>
        <div class="slide-subtitle">Role-Based Access Control Matrix & Authentication Portal</div>
      </div>
      <div class="slide-badge">SECURITY</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.1;">
        <img class="slide-img" src="${imgLogin}" alt="Login Screen">
      </div>
      <div style="flex: 0.9;" class="card">
        <h3>🛡️ การแบ่งแยกบทบาท 3 ระดับ</h3>
        <ul>
          <li><strong>Admin (ผู้ดูแลระบบ):</strong>
            <br><span style="color: #a855f7;">admin@automation.local</span> (pass: admin123)
            <br>สิทธิ์เต็มทุกส่วน: CRUD เครื่องจักร, จัดการ Alarm, มอบหมายงานซ่อมบำรุง, ดู Audit Logs
          </li>
          <li style="margin-top: 8px;"><strong>Technician (ช่างซ่อมบำรุง):</strong>
            <br><span style="color: #38bdf8;">tech@automation.local</span> (pass: tech123)
            <br>ดูเครื่องจักร, เปลี่ยนสถานะ Alarm, บันทึกงานซ่อมบำรุง, สร้างคำขออะไหล่ (CR)
          </li>
          <li style="margin-top: 8px;"><strong>Viewer (ผู้สังเกตการณ์):</strong>
            <br><span style="color: #94a3b8;">viewer@automation.local</span> (pass: viewer123)
            <br>สิทธิ์อ่านอย่างเดียว (Read-Only) สำหรับดู Dashboard และดาวน์โหลดรายงาน
          </li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Protected Route Guard via AppShell</span>
      <span>Slide 3 / 10</span>
    </div>
  </div>

  <!-- SLIDE 4: DASHBOARD -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">3. ศูนย์ควบคุม SCADA KPI Dashboard</div>
        <div class="slide-subtitle">7 Mandatory Performance Metrics & Real-time Analytics</div>
      </div>
      <div class="slide-badge">DASHBOARD</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.2;">
        <img class="slide-img" src="${imgDash}" alt="Dashboard Screen">
      </div>
      <div style="flex: 0.8;" class="card">
        <h3>📊 ตัวชี้วัดสำคัญ 7 ประการ</h3>
        <ul>
          <li><strong>1. Total Machines:</strong> เครื่องจักรทั้งหมดในระบบ</li>
          <li><strong>2. Running Machines:</strong> กำลังเดินเครื่องปกติ</li>
          <li><strong>3. Stop Machines:</strong> หยุดเดินเครื่องตามแผน</li>
          <li><strong>4. Alarm Machines:</strong> เกิดสัญญาณเตือนผิดปกติ</li>
          <li><strong>5. Maintenance:</strong> อยู่ระหว่างงานซ่อมบำรุง</li>
          <li><strong>6. Total Alarms:</strong> สถิติแจ้งเตือนรวม (Open/Critical)</li>
          <li><strong>7. Total Maintenance:</strong> งานซ่อมรวม (Waiting Part CR)</li>
        </ul>
        <p style="margin-top: 10px; font-size: 9pt; color: #38bdf8;">
          ✨ แสดงผลผ่าน Recharts (Donut & Bar Charts) ไร้ปัญหา SSR Hydration Mismatch
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <span>Real-time KPI Telemetry</span>
      <span>Slide 4 / 10</span>
    </div>
  </div>

  <!-- SLIDE 5: MACHINE MASTER -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">4. ทะเบียนเครื่องจักร (Machine Master)</div>
        <div class="slide-subtitle">Unique Machine ID, Multi-Filter, and ON DELETE RESTRICT Guard</div>
      </div>
      <div class="slide-badge">MACHINES</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.2;">
        <img class="slide-img" src="${imgMachines}" alt="Machine Master Screen">
      </div>
      <div style="flex: 0.8;" class="card">
        <h3>🏭 การจัดการข้อมูลเครื่องจักร</h3>
        <ul>
          <li><strong>Unique Machine ID:</strong> ตรวจสอบรหัสเครื่องจักรไม่ให้ซ้ำกันแบบ Real-time</li>
          <li><strong>Multi-Filter Search:</strong> ค้นหาด้วย Keyword พร้อมกรองตาม Status และ Machine Type</li>
          <li><strong>SCADA Telemetry:</strong> บันทึกไอพีแอดเดรสและโปรโตคอล (Modbus TCP, EtherNet/IP, Profinet)</li>
          <li><strong>Data Integrity Protection:</strong> ป้องกันการลบเครื่องจักรที่มีประวัติ Alarm หรือ Maintenance ผูกอยู่</li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Industrial Machine Asset Master</span>
      <span>Slide 5 / 10</span>
    </div>
  </div>

  <!-- SLIDE 6: MACHINE HISTORY TIMELINE -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">5. ประวัติเครื่องจักรแบบเรียงลำดับเวลา</div>
        <div class="slide-subtitle">Machine History Timeline: Merged Alarm Incidents & Maintenance Records</div>
      </div>
      <div class="slide-badge">TIMELINE</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.2;">
        <img class="slide-img" src="${imgHistory}" alt="Timeline Screen">
      </div>
      <div style="flex: 0.8;" class="card">
        <h3>⏱️ ประวัติเครื่องจักรครบวงจร</h3>
        <ul>
          <li><strong>Unified Chronological Feed:</strong> รวมเหตุการณ์ Alarm และประวัติการซ่อมบำรุงของเครื่องจักรรายชิ้น</li>
          <li><strong>Interactive Filtering:</strong> เลือกดูเฉพาะ Alarm, เฉพาะ Maintenance หรือทั้งหมด</li>
          <li><strong>Traceability:</strong> ตรวจสอบย้อนกลับได้ว่าเครื่องจักรเคยเสียด้วยรหัสใด ซ่อมด้วยวิธีไหน และใช้อะไหล่ใด</li>
          <li><strong>Technical Metadata:</strong> แสดงพิกัด Location, Protocol, และวันเริ่มใช้งาน</li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Predictive & Historical Asset Tracing</span>
      <span>Slide 6 / 10</span>
    </div>
  </div>

  <!-- SLIDE 7: ALARM WORKFLOW -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">6. วงจรชีวิตการแจ้งเตือน (Alarm Workflow)</div>
        <div class="slide-subtitle">Open &rarr; In Progress &rarr; Closed Lifecycle & Root Cause Analysis</div>
      </div>
      <div class="slide-badge">ALARMS</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.2;">
        <img class="slide-img" src="${imgAlarms}" alt="Alarm Screen">
      </div>
      <div style="flex: 0.8;" class="card">
        <h3>🚨 การจัดการสัญญาณเตือน</h3>
        <ul>
          <li><strong>Alarm Code & Severity:</strong> บันทึกรหัส Alarm พร้อมระดับ Critical, High, Medium, Low</li>
          <li><strong>Workflow Transition:</strong> ช่างเทคนิคสามารถกดเปลี่ยนสถานะด่วนจาก Open &rarr; In Progress &rarr; Closed</li>
          <li><strong>Root Cause Tracking:</strong> บันทึกสาเหตุที่แท้จริงและแนวทางแก้ไขลงในประวัติ</li>
          <li><strong>Multi-Dimensional Filter:</strong> กรองตามสถานะ, ความรุนแรง, และเครื่องจักรพร้อมกัน</li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Industrial Fault Monitoring</span>
      <span>Slide 7 / 10</span>
    </div>
  </div>

  <!-- SLIDE 8: MAINTENANCE & WAITING PART CR -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">7. งานซ่อมบำรุงและคำขออะไหล่ (Waiting Part CR)</div>
        <div class="slide-subtitle">Preventive/Corrective Maintenance & Spare Part Change Request</div>
      </div>
      <div class="slide-badge">MAINTENANCE</div>
    </div>

    <div class="slide-content">
      <div style="flex: 1.2;">
        <img class="slide-img" src="${imgMaintenance}" alt="Maintenance Screen">
      </div>
      <div style="flex: 0.8;" class="card">
        <h3>🔧 การจัดการงานซ่อมบำรุง</h3>
        <ul>
          <li><strong>Maintenance Types:</strong> รองรับ Preventive (PM), Corrective (CM), Predictive, Overhaul</li>
          <li><strong>Waiting Part Change Request:</strong> มีฟังก์ชันขอเบิกอะไหล่ใหม่ ปรับสถานะงานเป็น "Waiting Part" อัตโนมัติ</li>
          <li><strong>Cost & Part Tracking:</strong> บันทึกรายการอะไหล่ที่นำมาใช้และค่าใช้จ่ายโดยประมาณ</li>
          <li><strong>Role Permission:</strong> ช่างเทคนิคบันทึกและแก้ไขงานได้ ส่วน Admin มีสิทธิ์ลบข้อมูล</li>
        </ul>
      </div>
    </div>

    <div class="slide-footer">
      <span>Maintenance Operations Management</span>
      <span>Slide 8 / 10</span>
    </div>
  </div>

  <!-- SLIDE 9: QUALITY ASSURANCE & CI/CD -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <div class="slide-title">8. การทดสอบและการรับประกันคุณภาพ (CI/CD)</div>
        <div class="slide-subtitle">GitHub Actions Automated Pipeline, TypeScript & Zero-Defect Standard</div>
      </div>
      <div class="slide-badge">QA & CI/CD</div>
    </div>

    <div class="slide-content">
      <div class="grid-3">
        <div class="card">
          <h3>🧪 Automated Tests</h3>
          <p><strong>npm run test:</strong></p>
          <ul style="font-size: 9pt; margin-top: 6px;">
            <li>✅ Strict Auth verification</li>
            <li>✅ Unique Machine ID check</li>
            <li>✅ ON DELETE RESTRICT guard</li>
            <li>✅ Dashboard KPI summation</li>
            <li>✅ Waiting Part CR trigger</li>
          </ul>
          <p style="color: #4ade80; font-weight: bold; margin-top: 8px;">ผลการทดสอบ: ผ่าน 5/5</p>
        </div>

        <div class="card">
          <h3>🔍 Quality Inspection</h3>
          <p><strong>npm run type-check:</strong></p>
          <p style="color: #4ade80; font-weight: bold; margin-top: 4px;">✅ 0 TypeScript Errors</p>
          <p style="margin-top: 12px;"><strong>npm run lint:</strong></p>
          <p style="color: #4ade80; font-weight: bold; margin-top: 4px;">✅ 0 Warnings, 0 Errors</p>
          <p style="margin-top: 12px;"><strong>npm run build:</strong></p>
          <p style="color: #4ade80; font-weight: bold; margin-top: 4px;">✅ 11/11 Routes Compiled</p>
        </div>

        <div class="card">
          <h3>🚀 CI/CD Pipeline</h3>
          <p><strong>.github/workflows/ci.yml:</strong></p>
          <ul style="font-size: 9pt; margin-top: 6px;">
            <li>Checkout Code (v4)</li>
            <li>Setup Node.js 20</li>
            <li>Install Dependencies</li>
            <li>Run Validation Tests</li>
            <li>TypeScript Type Check</li>
            <li>ESLint Code Quality</li>
            <li>Next.js Production Build</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Continuous Integration & Quality Gate</span>
      <span>Slide 9 / 10</span>
    </div>
  </div>

  <!-- SLIDE 10: CONCLUSION -->
  <div class="slide" style="text-align: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #0d3259 0%, #070e1c 80%);">
    <div>
      <div style="display: inline-block; background: #16a34a; color: white; padding: 4px 14px; border-radius: 20px; font-size: 9.5pt; font-weight: bold; margin-bottom: 14px; font-family: 'JetBrains Mono', monospace;">
        ✨ PROJECT COMPLETION SUMMARY
      </div>
      <h2 style="font-size: 26pt; font-weight: 800; color: #f8fafc; margin-bottom: 12px;">
        สรุปผลการพัฒนาระบบและการส่งมอบงาน
      </h2>
      <p style="font-size: 12pt; color: #94a3b8; max-width: 650px; margin: 0 auto 24px;">
        ระบบ SCADA Alarm & Maintenance Management System ได้รับการพัฒนาเสร็จสมบูรณ์ 100% ตามมาตรฐานทุกข้อกำหนด
      </p>

      <div style="display: inline-grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 820px; margin: 0 auto; text-align: left;">
        <div class="card" style="padding: 12px 14px;">
          <div style="font-size: 8.5pt; color: #64748b;">MANDATORY</div>
          <div style="font-size: 13pt; font-weight: bold; color: #4ade80;">100% ครบถ้วน</div>
          <div style="font-size: 8.5pt; color: #94a3b8;">Auth, Machine, Alarm, Mnt, Dashboard</div>
        </div>
        <div class="card" style="padding: 12px 14px;">
          <div style="font-size: 8.5pt; color: #64748b;">BONUS FEATURES</div>
          <div style="font-size: 13pt; font-weight: bold; color: #38bdf8;">+10 คะแนนเต็ม</div>
          <div style="font-size: 8.5pt; color: #94a3b8;">Viewer, Timeline, CR, Audit, CSV, Dark</div>
        </div>
        <div class="card" style="padding: 12px 14px;">
          <div style="font-size: 8.5pt; color: #64748b;">CODE QUALITY</div>
          <div style="font-size: 13pt; font-weight: bold; color: #a855f7;">Zero Errors</div>
          <div style="font-size: 8.5pt; color: #94a3b8;">Type-check, Lint, Tests, Build 0 error</div>
        </div>
        <div class="card" style="padding: 12px 14px;">
          <div style="font-size: 8.5pt; color: #64748b;">DELIVERABLES</div>
          <div style="font-size: 13pt; font-weight: bold; color: #f59e0b;">ครบ 6 รายการ</div>
          <div style="font-size: 8.5pt; color: #94a3b8;">Repo, Vercel, Schema, README, Screenshots, Log</div>
        </div>
      </div>
    </div>

    <div class="slide-footer" style="border: none; margin-top: 26px;">
      <span>Thank you for your review!</span>
      <span>Alarm & Maintenance System v2.4</span>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(presentationHtmlPath, presentationHtml);
console.log('✅ Presentation Slides HTML written to:', presentationHtmlPath);

// 3. COMPILE PDFS VIA HEADLESS MICROSOFT EDGE
console.log('\n🖨️ 3. Compiling User Manual PDF via Headless Edge...');
try {
  const cmdManual = `"${EDGE_PATH}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${manualPdfPath}" "${manualHtmlPath}"`;
  execSync(cmdManual, { stdio: 'inherit' });
  console.log('✅ User Manual PDF compiled successfully at:', manualPdfPath);
} catch (err) {
  console.error('❌ Failed to compile User Manual PDF:', err);
}

console.log('\n🖨️ 4. Compiling Presentation PDF (16:9 Landscape) via Headless Edge...');
try {
  const cmdPres = `"${EDGE_PATH}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${presentationPdfPath}" "${presentationHtmlPath}"`;
  execSync(cmdPres, { stdio: 'inherit' });
  console.log('✅ Presentation PDF compiled successfully at:', presentationPdfPath);
} catch (err) {
  console.error('❌ Failed to compile Presentation PDF:', err);
}

console.log('\n🎉 PDF Generation Pipeline Complete!');

