# Architecture
## Project Type
internal-tool
## Preferred Stack
- HTML, CSS, JavaScript (Vanilla)
- รันบน Netlify (static hosting)
## Authentication
- ผู้สอน: simple localStorage (ไม่ต้องมี backend)
- ผู้เรียน: ไม่ต้อง login ใช้ code สำหรับเข้าทำแบบสอบถาม
## Roles
- admin
- ผู้สอน
- ผู้เรียน
## Database
- Google Sheets API only (Service Account)
- ไม่มี local database
## External Integrations
- Google Sheets API (Service Account) — เก็บข้อมูลแบบสอบถามและผลประเมิน
- Google Drive — แชร์ material (แสดง link ธรรมดา)

## Google Sheets Operations
- Read: GET request ไปที่ Apps Script URL
- Append: POST request พร้อม action 'append'
- Delete: POST request พร้อม action 'delete' (ลบข้อมูลตาม ID)

## Question Types
- rating (คะแนน 1-5 ดาว)
- text (ข้อความอิสระ)
- yes-no (ใช่/ไม่ใช่)
- choice (เลือกจากตัวเลือกที่กำหนด)