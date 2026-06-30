# Tasks
## Backlog
### T-001 Kick Off The Project Context
- Status: `Done`
- Detail: Confirm ทั้ง 6 ข้อแล้ว

### T-002a Confirm Stack & Tech Decisions
- Status: `Done`
- Detail: confirm ทั้ง 6 ข้อแล้ว

### T-002 Implement The Core Feature Set
- Status: `Done`
- Detail:
  - สร้างไฟล์ทั้งหมดแล้ว (HTML, CSS, JS, netlify.toml)
  - Google Sheets ผ่าน Google Apps Script
  - Admin login ด้วยรหัสผ่าน (เปลี่ยนได้)
  - ผู้สอนสมัคร + CAPTCHA + ต้องรอ Admin Approve
  - ผู้เรียนเข้าด้วย Code (ไม่ต้อง login)
  - Dashboard ดึงข้อมูลจาก Google Sheets

### T-004 Security Improvements
- Status: `Done`
- Detail:
  - Admin page ล็อคด้วยรหัสผ่าน (เปลี่ยนได้)
  - ผู้สอนต้องรอ Admin Approve ก่อนเข้าใช้งาน
  - CAPTCHA คำถามคณิตศาสตร์ที่หน้าสมัครสมาชิก

### T-003 Validate Success Criteria
- Status: `Done`
- Detail:
  - ผู้สอนสร้างแบบสอบถามได้ ✓
  - ผู้เรียนเข้าทำแบบสอบถามด้วย Code จาก browser ใดก็ได้ ✓
  - Dashboard แสดงผลการประเมิน ✓
  - เก็บข้อมูลใน Google Sheets ✓

### T-005 Bug Fixes & Improvements
- Status: `Done`
- Detail:
  - แก้ admin.html table header ไม่ตรงกับ body (4 vs 5 columns)
  - แก้ teacher-create.html navbar hardcoded ไม่ได้ใช้ App.renderNavbar()
  - เพิ่ม question type "choice" (เลือกจากตัวเลือก) ในหน้าสร้างแบบสอบถาม
  - เพิ่ม checkbox "คำถามบังคับตอบ" ในหน้าสร้างคำถาม
  - เพิ่ม confirmation dialog ก่อนส่งแบบสอบถาม

### T-006 QR Code & Dashboard Improvements
- Status: `Done`
- Detail:
  - เพิ่ม QR Code ใน modal "คัดลอก Link" สำหรับสแกนเข้าทำแบบสอบถาม
  - แก้ปุ่ม "ดูผล" ให้แสดงผลของแบบสอบถามนี้เลย (ไม่ต้องเลือกอีกครั้ง)
  - เพิ่มปุ่ม "กลับไปหน้าผู้สอน" เมื่อดูผลแบบสอบถามเดียว
  - แสดงชื่อแบบสอบถามเป็นหัวข้อหน้า Dashboard

### T-007 Fix Dashboard Graph & Data Parsing
- Status: `Done`
- Detail:
  - แก้ไข graph bar ไม่แสดงผลถูกต้อง (ทุก bar สูงเท่ากัน)
  - แก้ไขการ parse answers จาก Google Sheets (รองรับทั้ง JSON string และ object)
  - แก้ไข renderOverview, renderRatingChart, renderTextResponses, renderResponses
  - เพิ่ม handling สำหรับ nested JSON string ใน answers
  - แสดงข้อความ "ยังไม่มีผลประเมิน" เมื่อไม่มีข้อมูล

### T-008 Delete Data from Google Sheets
- Status: `Done`
- Detail:
  - เพิ่มฟังก์ชัน deleteRows, deleteQuestionnaire, deleteResponsesByQuestionnaire, deleteUser ใน SheetsAPI
  - อัปเดต Teacher.deleteQuestionnaire ให้ลบแบบสอบถามและ responses ใน Google Sheets
  - อัปเดต Admin.removeTeacher ให้ลบผู้สอน, questionnaires, และ responses ใน Google Sheets
  - แปลงฟังก์ชันลบเป็น async/await เพื่อรอ Google Sheets API ทำงานเสร็จ

### T-009 Fix Dashboard Teacher Filter
- Status: `Done`
- Detail:
  - แก้ไข loadData ให้ teacher เห็นเฉพาะแบบสอบถามของตัวเอง
  - เพิ่ม filter responses ตามแบบสอบถามของ teacher คนนั้น
  - ใช้ toString().trim() เปรียบเทียบ ID ให้รัดกุม (รองรับ whitespace และ type ต่างกัน)
  - Admin ยังคงเห็นข้อมูลทั้งหมด

### T-010 Fix Toggle Questionnaire Status
- Status: `Done`
- Detail:
  - เพิ่มฟังก์ชัน updateRow ใน SheetsAPI
  - อัปเดต Teacher.toggleQuestionnaire ให้ update status ใน Google Sheets
  - เพิ่ม action 'update' ใน Google Apps Script

### T-011 Fix Cross-Browser Login
- Status: `Done`
- Detail:
  - แก้ไข loginTeacher เป็น async แล้วดึงข้อมูลจาก Google Sheets ก่อน login
  - Sync ข้อมูลผู้ใช้จาก Google Sheets ลง localStorage ก่อนตรวจสอบ
  - อัปเดต teacher-login.html ให้รองรับ async doLogin

### T-012 Add Loading Indicators
- Status: `Done`
- Detail:
  - เพิ่ม loading spinner ใน dashboard.html ขณะดึงข้อมูลจาก Google Sheets
  - เพิ่ม loading spinner ใน teacher.html ขณะโหลดแบบสอบถาม
  - ซ่อน content แล้วแสดง loading ก่อน แล้วค่อยแสดง content หลังโหลดเสร็จ

### T-013 Fix Teacher Data Field Matching
- Status: `Done`
- Detail:
  - แก้ไข getMyQuestionnaires() ให้รองรับทั้ง teacherId และ teacherid
  - แก้ไข getResponses() ให้รองรับทั้ง questionnaireId และ questionnaireid
  - แก้ไข toggleQuestionnaire() ให้ใช้ toString().trim() เปรียบเทียบ ID
  - แก้ไข deleteQuestionnaire() ให้ใช้ toString().trim() เปรียบเทียบ ID

### T-014 Sync Data from Google Sheets
- Status: `Done`
- Detail:
  - เพิ่ม syncFromSheets() ดึงข้อมูล questionnaires และ responses จาก Google Sheets
  - sync ครั้งเดียวตอนโหลดหน้า (ใช้ flag _synced)
  - เรียก syncFromSheets() ใน loadTeacherData() ก่อนแสดงข้อมูล

### T-015 Simplify Toggle Button
- Status: `Done`
- Detail:
  - ทำให้ handleToggle() ทำงาน同步ทันที ไม่ต้องรอ async
  - อัปเดต localStorage → re-render → sync Google Sheets (fire and forget)
  - เพิ่ม try-catch เพื่อแสดง error ถ้ามีปัญหา

### T-016 Fix Survey Access After Close
- Status: `Done`
- Detail:
  - แก้ไข validateSurveyCode ให้เช็ค localStorage ก่อน (อัปเดตทันที)
  - ถ้าไม่พบใน localStorage ค่อยดึงจาก Google Sheets
  - ปิดแบบสอบถามแล้ว link ประเมินใช้ไม่ได้ทันที