# Memory
## Project Snapshot
ระบบประเมินความพึงพอใจในการสอน - เว็บแอปสำหรับ weekly training sessions

## Decisions
- Stack: HTML, CSS, JavaScript (Vanilla) — static hosting on Netlify
- Database: Google Sheets API ผ่าน Google Apps Script (POST/GET)
- Auth: localStorage + sessionStorage
- Material sharing: แสดง link ธรรมดา
- Admin password: เก็บใน localStorage (เปลี่ยนได้จากหน้า admin)

## Security
- Admin page ล็อคด้วยรหัสผ่าน (default: admin123)
- ผู้สอนต้องรอ Admin Approve ก่อน login ได้
- CAPTCHA คำถามคณิตศาสตร์ป้องกัน Bot ที่หน้าสมัคร

## Architecture
- Google Apps Script URL: hardcode ใน sheets.js (ไม่ต้องตั้งค่าทุก browser)
- ข้อมูลเก็บใน Google Sheets: Users, Questionnaires, Responses
- Session: sessionStorage (หายเมื่อปิด browser)
- ข้อมูล login: localStorage (persist ตลอด)

## Key Files
- js/sheets.js — Google Sheets API ผ่าน Apps Script
- js/auth.js — login, register, CAPTCHA, approve
- js/admin.js — จัดการผู้ใช้, approve/reject
- js/teacher.js — สร้างแบบสอบถาม
- js/survey.js — ทำแบบสอบถาม (ผู้เรียน)
- js/dashboard.js — รายงานผล
- admin.html — ตั้งค่าระบบ (ต้องใส่รหัสผ่าน)