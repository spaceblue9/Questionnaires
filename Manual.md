# คู่มือการตั้งค่าและใช้งานระบบประเมินการสอน

---

## 1. ภาพรวมระบบ

ระบบประเมินการสอน (Teacher Evaluation System) เป็นเว็บแอปพลิเคชันสำหรับเก็บผลการประเมินการสอนรายสัปดาห์

**Stack:**
- Frontend: Vanilla HTML/CSS/JavaScript
- Database: Google Sheets (ผ่าน Google Apps Script)
- Hosting: Netlify (Static hosting)
- Password: SHA-256 hashing

**ผู้ใช้ 3 กลุ่ม:**
| กลุ่ม | หน้าที่ |
|---|---|
| Admin | จัดการผู้ใช้, ตั้งค่าระบบ |
| ผู้สอน (Teacher) | สร้างแบบสอบถาม, ดูผลประเมิน |
| ผู้เรียน (Student) | ทำแบบสอบถามผ่าน Link/QR Code |

---

## 2. เริ่มต้นใช้งาน - สร้าง Google Sheet

### 2.1 สร้าง Google Sheet ใหม่

1. เปิด [Google Sheets](https://sheets.google.com)
2. กด **Blank** เพื่อสร้าง spreadsheet ใหม่
3. ตั้งชื่อ เช่น `ระบบประเมินการสอน`

### 2.2 สร้าง 3 ชีท (Sheets)

สร้างชีทโดยกดที่ปุ่ม `+` มุมล่างซ้าย แล้วตั้งชื่อตามนี้:

---

#### ชีทที่ 1: **Users**

บันทึกข้อมูลผู้ใช้ทั้งหมด

| Column | Header Name | ตัวอย่าง |
|---|---|---|
| A | ID | usr_m1abc123 |
| B | Name | สมชาย ใจดี |
| C | Email | somchai@email.com |
| D | Role | teacher |
| E | Password | (SHA-256 hash) |
| F | CreatedAt | 2025-01-15T08:30:00.000Z |

**วิธีตั้ง Header:**
- เปิดชีท Users
- ที่แถวที่ 1 พิมพ์หัวข้อตามตารางด้านบน (พิมพ์ตรงๆ ห้ามเว้นวรรคหน้า-หลัง)

---

#### ชีทที่ 2: **Questionnaires**

บันทึกข้อมูลแบบสอบถาม

| Column | Header Name | ตัวอย่าง |
|---|---|---|
| A | ID | mr03dmh7q6z0c |
| B | TeacherId | usr_m1abc123 |
| C | Title | แบบสอบถามความพึงพอใจ |
| D | Description | แบบสอบถามรายสัปดาห์ |
| E | Instructions | ดาวน์โหลดเอกสารที่ https://example.com/doc.pdf |
| F | Questions | [{"text":"คะแนนการสอน","type":"rating","required":true}] |
| G | Code | A1B2C3 |
| H | Status | active |
| I | CreatedAt | 2025-01-15T08:30:00.000Z |

**หมายเหตุ:**
- คอลัมน์ Questions เก็บข้อมูลเป็น JSON string
- คอลัมน์ Instructions สำหรับคำแนะนำ/ลิงก์สื่อการสอน (ผู้เรียนเห็นก่อนทำแบบสอบถาม)
- Status มี 2 ค่า: `active` (เปิดรับ) และ `closed` (ปิดรับ)

---

#### ชีทที่ 3: **Responses**

บันทึกผลการตอบแบบสอบถาม

| Column | Header Name | ตัวอย่าง |
|---|---|---|
| A | ID | rsp_m2xyz789 |
| B | QuestionnaireId | mr03dmh7q6z0c |
| C | Answers | {"0":{"type":"rating","value":5},"1":{"type":"text","value":"ดีมาก"}} |
| D | SubmittedAt | 2025-01-15T09:00:00.000Z |

---

### 2.3 ตรวจสอบว่า Headers ถูกต้อง

ตรวจสอบว่า headers ในแต่ละชีทตรงกับที่กำหนด:
- **Users:** `ID, Name, Email, Role, Password, CreatedAt`
- **Questionnaires:** `ID, TeacherId, Title, Description, Instructions, Questions, Code, Status, CreatedAt`
- **Responses:** `ID, QuestionnaireId, Answers, SubmittedAt`

> **สำคัญ:** ห้ามมีช่องว่างหน้า-หลังชื่อ header ห้ามมี header ซ้ำกัน

---

## 3. Google Apps Script

### 3.1 เปิด Apps Script

1. เปิด Google Sheet ที่สร้างไว้
2. คลิกเมนู **Extensions > Apps Script**
3. ลบโค้ดเดิมทั้งหมดในหน้า editor

### 3.2 วางโค้ดนี้แทน

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(data.sheet);

  if (!sh) {
    sh = ss.insertSheet(data.sheet);
    if (data.headers) sh.appendRow(data.headers);
  }

  // ACTION: DELETE - ลบข้อมูลตาม ID
  if (data.action === 'delete' && data.ids) {
    var allData = sh.getDataRange().getValues();
    var headers = allData[0];
    var idCol = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toString().toLowerCase() === 'id') { idCol = i; break; }
    }
    var idsToDelete = data.ids.map(function(id) { return id.toString(); });
    var rowsToDelete = [];
    for (var row = allData.length - 1; row >= 1; row--) {
      if (idsToDelete.indexOf(allData[row][idCol].toString().trim()) !== -1) rowsToDelete.push(row + 1);
    }
    for (var j = 0; j < rowsToDelete.length; j++) sh.deleteRow(rowsToDelete[j]);
    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  }

  // ACTION: UPDATE - อัปเดตข้อมูลตาม ID
  if (data.action === 'update' && data.id && data.field) {
    var allData = sh.getDataRange().getValues();
    var headers = allData[0];
    var idCol = -1, fieldCol = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toString().toLowerCase() === 'id') idCol = i;
      if (headers[i].toString().toLowerCase() === data.field.toLowerCase()) fieldCol = i;
    }
    if (idCol === -1 || fieldCol === -1) {
      return ContentService.createTextOutput(JSON.stringify({success:false, message:'column not found'})).setMimeType(ContentService.MimeType.JSON);
    }
    for (var row = 1; row < allData.length; row++) {
      if (allData[row][idCol].toString().trim() === data.id.toString().trim()) {
        sh.getRange(row + 1, fieldCol + 1).setValue(data.value);
        return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success:false, message:'id not found'})).setMimeType(ContentService.MimeType.JSON);
  }

  // ACTION: APPEND (default) - เพิ่มข้อมูลใหม่
  sh.appendRow(data.values);
  return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(e.parameter.sheet);
  if (!sh) return ContentService.createTextOutput(JSON.stringify({values:[]})).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(JSON.stringify({values: sh.getDataRange().getValues()})).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 4. Deploy Google Apps Script

### 4.1 Deploy ครั้งแรก

1. หลังจากวางโค้ดแล้ว กด **Ctrl + S** เพื่อบันทึก
2. คลิกปุ่ม **Deploy** (มุมขวาบน) เลือก **New deployment**
3. คลิกที่ไอคอน齒輪 (⚙️) เลือก **Web app**
4. ตั้งค่า:
   - **Description:** ใส่อะไรก็ได้ เช่น `評価 System API`
   - **Execute as:** เลือก **Me**
   - **Who has access:** เลือก **Anyone**
5. คลิก **Deploy**
6. คัดลอก **Web App URL** ที่ได้ (จะเป็นรูปแบบ `https://script.google.com/macros/s/xxxxx/exec`)

### 4.2 Update Apps Script (เมื่อมีการแก้ไขโค้ด)

1. แก้โค้ดเสร็จ กด **Ctrl + S**
2. คลิก **Deploy > Manage deployments**
3. คลิกไอคอนดินสอ (✏️) แก้ไข deployment เดิม
4. เลือก **New version**
5. คลิก **Deploy**
6. URL จะเหมือนเดิม ไม่ต้องคัดลอกใหม่

---

## 5. ตั้งค่า Admin

### 5.1 เข้าหน้า Admin

1. เปิดไฟล์ `admin.html` ในเบราว์เซอร์
   - หรือเข้า URL: `https://your-domain.netlify.app/admin.html`
2. กรอกรหัสผ่าน Admin

**Default Password:** `admin123`

> **สำคัญ:** เปลี่ยนรหัสผ่าน Admin ทันทีหลังจากตั้งค่าครั้งแรก!

### 5.2 ตั้งค่า Google Apps Script URL

1. วาง URL ที่ได้จากขั้นตอนที่ 4.1 ลงในช่อง **Apps Script Web App URL**
2. คลิก **บันทึก**
3. คลิก **ทดสอบการเชื่อมต่อ** เพื่อตรวจสอบว่าเชื่อมต่อได้สำเร็จ

### 5.3 จัดการผู้ใช้

- **เพิ่มผู้สอน:** คลิก "+ เพิ่มผู้สอน" กรอกข้อมูลแล้วคลิก "เพิ่ม"
- **อนุมัติผู้สอน:** กดปุ่ม "อนุมัติ" ที่แถวของผู้สอนที่ต้องการ
- **ระงับผู้สอน:** กดปุ่ม "ระงับ" เพื่อปิดการใช้งานชั่วคราว
- **ลบผู้สอน:** กดปุ่ม "ลบ" (จะลบแบบสอบถามและผลประเมินของผู้สอนคนนี้ด้วย)

---

## 6. คู่มือใช้งานแต่ละหน้า

### 6.1 หน้าแรก (index.html)

หน้าแรกแสดงข้อมูลสรุปของระบบ

---

### 6.2 ผู้สอน (Teacher)

#### ขั้นตอนที่ 1: ลงทะเบียน

1. เปิดหน้า `teacher-login.html`
2. เลือกแท็บ **ลงทะเบียน**
3. กรอกข้อมูล:
   - ชื่อ-นามสกุล
   - อีเมล
   - รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
   - คำตอบ CAPTCHA
4. กด **สมัครสมาชิก**
5. รอผู้ดูแลระบบอนุมัติ

#### ขั้นตอนที่ 2: เข้าสู่ระบบ

1. เปิดหน้า `teacher-login.html`
2. กรอกอีเมลและรหัสผ่าน
3. กด **เข้าสู่ระบบ**

#### ขั้นตอนที่ 3: สร้างแบบสอบถาม

1. กดปุ่ม **+ สร้างแบบสอบถามใหม่**
2. กรอกข้อมูลแบบสอบถาม:
   - **ชื่อแบบสอบถาม** (บังคับ)
   - **คำอธิบาย** (ไม่บังคับ)
   - **คำแนะนำ / ลิงก์สื่อการสอน** (ไม่บังคับ) - ผู้เรียนจะเห็นก่อนทำแบบสอบถาม
3. เพิ่มคำถามโดยกด **+ เพิ่มคำถาม**
4. สำหรับแต่ละคำถาม:
   - พิมพ์ข้อความคำถาม
   - เลือกประเภท (คะแนน 1-5 ดาว, ข้อความ, ใช่/ไม่ใช่, เลือกจากตัวเลือก)
   - เลือกว่าบังคับตอบหรือไม่
   - ถ้าเป็นแบบเลือก ให้เพิ่มตัวเลือก
5. กด **สร้างแบบสอบถาม**
6. จะได้รหัสแบบสอบถาม 6 ตัวอักษร (เช่น A1B2C3)

#### ขั้นตอนที่ 4: ส่ง Link ให้ผู้เรียน

1. ที่หน้าแดชบอร์ด หาแบบสอบถามที่ต้องการ
2. กดปุ่ม **คัดลอก Link** จะแสดง Modal พร้อม Link และ QR Code
3. ส่ง Link หรือ QR Code ให้ผู้เรียน

#### ขั้นตอนที่ 5: ดูผลประเมิน

1. กดปุ่ม **ดูผล** ที่แบบสอบถามที่ต้องการ
2. ระบบจะแสดง:
   - กราฟคะแนนเฉลี่ย
   - จำนวนผลประเมิน
   - คำตอบแต่ละข้อ

#### ขั้นตอนที่ 6: ปิด/เปิดรับ

- กดปุ่ม **ปิดรับ** เพื่อหยุดรับคำตอบ (ผู้เรียนจะเข้าลิงก์ไม่ได้)
- กดปุ่ม **เปิดรับ** เพื่อเปิดรับคำตอบอีกครั้ง

---

### 6.3 ผู้เรียน (Student)

#### การทำแบบสอบถาม

1. เปิด Link หรือสแกน QR Code ที่ได้รับ
2. ถ้ามีคำแนะนำ/ลิงก์สื่อการสอน จะแสดงก่อนคำถาม
3. ตอบคำถามตามที่กำหนด
4. กดปุ่ม **ส่งคำตอบ**
5. กด **ยืนยัน** ใน popup
6. แสดงหน้า **ส่งคำตอบสำเร็จ**

**หมายเหตุ:**
- คำถามที่มีเครื่องหมาย * บังคับต้องตอบ
- ถ้าแบบสอบถามปิดรับแล้ว จะขึ้นข้อความ "แบบสอบถามปิดรับแล้ว"

---

### 6.4 Admin

#### เข้าสู่ระบบ

1. เปิดหน้า `admin.html`
2. กรอกรหัสผ่าน Admin (default: `admin123`)
3. กด **เข้าสู่ระบบ**

#### ตั้งค่า Google Apps Script

1. วาง Apps Script URL ลงในช่อง
2. กด **บันทึก**
3. กด **ทดสอบการเชื่อมต่อ**

#### จัดการผู้ใช้

- **อนุมัติผู้สอน:** กดปุ่ม "อนุมัติ" ที่แถวของผู้สอนที่รออนุมัติ
- **ระงับผู้สอน:** กดปุ่ม "ระงับ" เพื่อปิดการใช้งาน
- **ลบผู้สอน:** กดปุ่ม "ลบ" เพื่อลูกผู้สอนและข้อมูลทั้งหมด

#### ดูสถิติ

- หน้า Dashboard แสดงสถิติ: แบบสอบถามทั้งหมด, ผลประเมินทั้งหมด, ผู้สอนที่รออนุมัติ

---

## 7. Troubleshooting

### ปัญหา: เชื่อมต่อ Google Sheets ไม่ได้

**สาเหตุ:**
- Apps Script URL ไม่ถูกต้อง
- Apps Script ไม่ได้ Deploy
- Apps Script ไม่ได้ตั้งค่า Who has access: Anyone

**วิธีแก้:**
1. ตรวจสอบ URL ในหน้า admin
2. ตรวจสอบว่า Apps Script Deploy แล้ว
3. ทดสอบ connection จากหน้า admin

---

### ปัญหา: Login ไม่ได้

**สาเหตุ:**
- รหัสผ่านไม่ถูกต้อง
- ยังไม่ได้รับการอนุมัติ

**วิธีแก้:**
1. ตรวจสอบอีเมลและรหัสผ่าน
2. ติดต่อ Admin เพื่ออนุมัติบัญชี
3. ถ้าลืมรหัสผ่าน ต้องติดต่อ Admin ให้ลบแล้วสมัครใหม่

---

### ปัญหา: ปิดแบบสอบถามแล้ว ผู้เรียนยังเข้าได้

**สาเหตุ:**
- Google Apps Script ไม่ได้อัปเดต action update

**วิธีแก้:**
1. ตรวจสอบว่า Apps Script มี action 'update' แล้ว
2. Deploy Apps Script ใหม่
3. Clear cache ที่หน้า teacher.html (Ctrl+Shift+R)

---

### ปัญหา: ข้อมูลใน Google Sheet ไม่ตรงกับแอป

**สาเหตุ:**
- Column Headers ไม่ตรง
- มีช่องว่างในชื่อ header

**วิธีแก้:**
1. ตรวจสอบ Headers ตามตารางในข้อ 2.2
2. แก้ไข header ให้ตรง
3. Refresh หน้าเว็บ

---

### ปัญหา: สร้างแบบสอบถามแล้วไม่แสดงในแดชบอร์ด

**สาเหตุ:**
- Google Sheets ยังไม่ sync

**วิธีแก้:**
1. Refresh หน้า teacher.html
2. รอสักครู่แล้วลองใหม่
3. ตรวจสอบ Console (F12) ว่ามี error หรือไม่

---

### ปัญหา: Password ที่ตั้งใหม่ login ไม่ได้

**สาเหตุ:**
- Password ถูก hash ด้วย SHA-256 ก่อนเก็บ

**วิธีแก้:**
- ระบบจะ auto-migrate password เดิม (plain text) เป็น hash อัตโนมัติครั้งแรกที่ login
- ถ้ายัง login ไม่ได้ ให้ติดต่อ Admin ให้ลบแล้วสมัครใหม่

---

## 8. ข้อมูลเพิ่มเติม

### Password Security

- Password ถูก hash ด้วย SHA-256 ก่อนเก็บใน Google Sheets
- ระบบจะ auto-migrate password เดิม (plain text) เป็น hash อัตโนมัติครั้งแรกที่ login

### Default Admin Password

```
admin123
```

**ควรเปลี่ยนทันทีหลังตั้งค่าครั้งแรก!**

### ขนาดไฟล์ที่แนะนำ

- ไม่ควรเก็บข้อมูลเกิน 10,000 รายการต่อชีท
- ถ้าข้อมูลเยอะ ให้ลบข้อมูลเก่าเป็นประจำ

---

*คู่มือนี้อัปเดตล่าสุด: 2025-06-30*
