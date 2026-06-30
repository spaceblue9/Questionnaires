// ===== Authentication Module =====
// ใช้ localStorage สำหรับเก็บ session

const Auth = {
  generateId() {
    return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Login สำหรับผู้สอน
  async loginTeacher(email, password) {
    // ดึงข้อมูลจาก Google Sheets ก่อน แล้ว sync ลง localStorage
    if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
      try {
        const users = await SheetsAPI.getUsers();
        if (users.length > 0) {
          localStorage.setItem('teachers', JSON.stringify(users));
        }
      } catch (e) {
        console.error('ดึงข้อมูลผู้ใช้จาก Sheets ไม่ได้:', e);
      }
    }

    const hashedPassword = await this.hashPassword(password);
    const teachers = this.getTeachers();
    const teacher = teachers.find(t => t.email === email && (t.password === hashedPassword || t.password === password));
    if (!teacher) {
      return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    if (teacher.approved === false) {
      return { success: false, message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ' };
    }

    // อัปเดต password ที่ยังไม่ hash ให้เป็น hash
    if (teacher.password === password && teacher.password !== hashedPassword) {
      teacher.password = hashedPassword;
      localStorage.setItem('teachers', JSON.stringify(teachers));
      if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
        SheetsAPI.updateRow('Users', teacher.id, 'Password', hashedPassword).catch(console.error);
      }
    }

    const session = { ...teacher, loginAt: new Date().toISOString() };
    localStorage.setItem('current_user', JSON.stringify(session));
    return { success: true, user: session };
  },

  // ลงทะเบียนผู้สอน
  async registerTeacher(name, email, password) {
    const teachers = this.getTeachers();
    if (teachers.find(t => t.email === email)) {
      return { success: false, message: 'อีเมลนี้ถูกใช้แล้ว' };
    }

    const hashedPassword = await this.hashPassword(password);

    const teacher = {
      id: this.generateId(),
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      approved: false,
      createdAt: new Date().toISOString()
    };

    teachers.push(teacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));

    if (SheetsAPI.isConfigured()) {
      SheetsAPI.addUser(teacher).catch(console.error);
    }

    return { success: true, user: teacher };
  },

  // Admin อนุมัติผู้สอน
  approveTeacher(teacherId, approved) {
    const teachers = this.getTeachers();
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      teacher.approved = approved;
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    return { success: true };
  },

  logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  isTeacher() {
    const user = this.getCurrentUser();
    return user && user.role === 'teacher';
  },

  getTeachers() {
    const teachers = localStorage.getItem('teachers');
    return teachers ? JSON.parse(teachers) : [];
  },

  // ===== CAPTCHA =====
  captcha: { a: 0, b: 0, op: '+' },

  generateCaptcha() {
    const ops = ['+', '-', '×'];
    this.captcha.a = Math.floor(Math.random() * 10) + 1;
    this.captcha.b = Math.floor(Math.random() * 10) + 1;
    this.captcha.op = ops[Math.floor(Math.random() * ops.length)];
    if (this.captcha.op === '-' && this.captcha.a < this.captcha.b) {
      var temp = this.captcha.a;
      this.captcha.a = this.captcha.b;
      this.captcha.b = temp;
    }
    return this.captcha.a + ' ' + this.captcha.op + ' ' + this.captcha.b + ' = ?';
  },

  verifyCaptcha(answer) {
    var expected;
    switch (this.captcha.op) {
      case '+': expected = this.captcha.a + this.captcha.b; break;
      case '-': expected = this.captcha.a - this.captcha.b; break;
      case '×': expected = this.captcha.a * this.captcha.b; break;
    }
    return parseInt(answer) === expected;
  },

  // ตรวจสอบการเข้าถึง survey ด้วย code
  async validateSurveyCode(code) {
    // เช็คจาก Google Sheets ก่อน (เป็น source of truth)
    if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
      try {
        var rows = await SheetsAPI.readSheet('Questionnaires');
        if (rows.length > 1) {
          var headers = rows[0];
          var qList = rows.slice(1).map(function(row) {
            var q = {};
            headers.forEach(function(h, i) { q[h.toLowerCase()] = (row[i] || '').toString().trim(); });
            return q;
          });
          var found = qList.find(function(q) { return q.code === code; });
          if (found) {
            if (found.status !== 'active') {
              return { valid: false, message: 'แบบสอบถามปิดรับแล้ว' };
            }
            if (typeof found.questions === 'string') {
              found.questions = JSON.parse(found.questions);
            }
            return { valid: true, questionnaire: found };
          }
          return { valid: false, message: 'ไม่พบแบบสอบถามนี้' };
        }
      } catch (e) {
        console.error('ดึงข้อมูลจาก Sheets ไม่ได้:', e);
      }
    }

    // fallback ไป localStorage ถ้าไม่ได้ต่อ Google Sheets
    var questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    var q = questionnaires.find(function(q) { return q.code === code; });
    
    if (!q) {
      return { valid: false, message: 'ไม่พบแบบสอบถามนี้' };
    }
    
    if (q.status !== 'active') {
      return { valid: false, message: 'แบบสอบถามปิดรับแล้ว' };
    }
    
    if (q.expiresAt && new Date(q.expiresAt) < new Date()) {
      return { valid: false, message: 'แบบสอบถามหมดอายุแล้ว' };
    }

    return { valid: true, questionnaire: q };
  }
};