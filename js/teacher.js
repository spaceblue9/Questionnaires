// ===== Teacher Module =====

const Teacher = {
  _synced: false,

  // sync ข้อมูลจาก Google Sheets ลง localStorage (เรียกครั้งเดียวตอนโหลดหน้า)
  async syncFromSheets() {
    if (this._synced) return;
    if (typeof SheetsAPI === 'undefined' || !SheetsAPI.isConfigured()) return;

    try {
      const qRows = await SheetsAPI.readSheet('Questionnaires');
      if (qRows.length > 1) {
        const headers = qRows[0];
        var questionnaires = qRows.slice(1).map(function(row) {
          var q = {};
          headers.forEach(function(h, i) { q[h.toLowerCase()] = (row[i] || '').toString().trim(); });
          if (q.questions) {
            try { q.questions = JSON.parse(q.questions); } catch (e) {}
          }
          return q;
        });
        localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
      }
    } catch (e) {
      console.error('sync questionnaires ไม่ได้:', e);
    }

    try {
      const rRows = await SheetsAPI.readSheet('Responses');
      if (rRows.length > 1) {
        const headers = rRows[0];
        var responses = rRows.slice(1).map(function(row) {
          var r = {};
          headers.forEach(function(h, i) { r[h.toLowerCase()] = (row[i] || '').toString().trim(); });
          if (r.answers) {
            try { r.answers = JSON.parse(r.answers); } catch (e) {}
          }
          return r;
        });
        localStorage.setItem('responses', JSON.stringify(responses));
      }
    } catch (e) {
      console.error('sync responses ไม่ได้:', e);
    }

    this._synced = true;
  },

  // ดึงแบบสอบถามของผู้สอนคนนี้ (sync แล้ว)
  getMyQuestionnaires() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    
    const questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    const uid = (user.id || '').toString().trim();
    return questionnaires.filter(q => {
      var qtid = (q.teacherId || q.teacherid || '').toString().trim();
      return qtid === uid;
    });
  },

  // สร้างแบบสอบถามใหม่
  createQuestionnaire(data) {
    const user = Auth.getCurrentUser();
    if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' };

    const questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    
    const questionnaire = {
      id: App.generateId(),
      teacherId: user.id,
      teacherName: user.name,
      title: data.title,
      description: data.description,
      instructions: data.instructions || '',
      questions: data.questions,
      code: Auth.generateCode(),
      status: 'active',
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString()
    };

    questionnaires.push(questionnaire);
    localStorage.setItem('questionnaires', JSON.stringify(questionnaires));

    // บันทึกลง Google Sheets ด้วย
    if (SheetsAPI.isConfigured()) {
      SheetsAPI.addQuestionnaire(questionnaire).catch(console.error);
    }

    return { success: true, questionnaire };
  },

  handleToggle(qId, newStatus) {
    // อัปเดต localStorage ทันที
    var questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    for (var i = 0; i < questionnaires.length; i++) {
      var qid = String(questionnaires[i].id || '').trim();
      if (qid === String(qId).trim()) {
        questionnaires[i].status = newStatus;
        break;
      }
    }
    localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
    this.renderMyQuestionnaires();

    // อัปเดต Google Sheets
    if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
      SheetsAPI.updateRow('Questionnaires', qId, 'Status', newStatus).then(function(res) {
        console.log('อัปเดต Status ใน Google Sheets สำเร็จ:', res);
      }).catch(function(err) {
        console.error('อัปเดต Status ใน Google Sheets ไม่ได้:', err);
      });
    }
  },

  // ลบแบบสอบถาม
  async deleteQuestionnaire(qId) {
    var questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    questionnaires = questionnaires.filter(q => q.id.toString().trim() !== qId.toString().trim());
    localStorage.setItem('questionnaires', JSON.stringify(questionnaires));

    // ลบ responses ของแบบสอบถามนี้ด้วย
    var responses = JSON.parse(localStorage.getItem('responses') || '[]');
    responses = responses.filter(r => {
      var rqid = (r.questionnaireId || r.questionnaireid || '').toString().trim();
      return rqid !== qId.toString().trim();
    });
    localStorage.setItem('responses', JSON.stringify(responses));

    // ลบใน Google Sheets
    if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
      try {
        await SheetsAPI.deleteQuestionnaire(qId);
        await SheetsAPI.deleteResponsesByQuestionnaire(qId);
      } catch (e) {
        console.error('ลบข้อมูลใน Google Sheets ไม่ได้:', e);
      }
    }

    return { success: true };
  },

  // ดึงผลประเมิน
  getResponses(qId) {
    const responses = JSON.parse(localStorage.getItem('responses') || '[]');
    return qId ? responses.filter(r => {
      var rqid = (r.questionnaireId || r.questionnaireid || '').toString().trim();
      return rqid === qId.toString().trim();
    }) : responses;
  },

  // sync ข้อมูลเดียว (ไม่ต้อง sync ทั้งหมด ใช้ข้อมูลที่มีอยู่แล้ว)
  syncLocal() {
    // ใช้ข้อมูลที่ sync แล้วจาก syncFromSheets
  },

  // สร้าง link สำหรับทำแบบสอบถาม
  getSurveyLink(code) {
    const base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
    return `${base}survey.html?code=${code}`;
  },

  // แสดงรายการแบบสอบถาม
  renderMyQuestionnaires() {
    const container = document.getElementById('my-questionnaires');
    if (!container) return;

    const questionnaires = this.getMyQuestionnaires();
    
    if (questionnaires.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted" style="padding: 40px;">
          <p>ยังไม่มีแบบสอบถาม</p>
          <a href="teacher-create.html" class="btn btn-primary mt-2">สร้างแบบสอบถามใหม่</a>
        </div>
      `;
      return;
    }

    container.innerHTML = questionnaires.map(q => {
      const responses = this.getResponses(q.id);
      return `
        <div class="card mb-2">
          <div class="flex justify-between items-center flex-wrap gap-1">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 600;">${q.title}</h3>
              <p class="text-muted" style="font-size: 0.9rem;">${q.description || 'ไม่มีคำอธิบาย'}</p>
            </div>
            <div class="flex gap-1">
              <span class="badge ${q.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                ${q.status === 'active' ? 'เปิดรับ' : 'ปิดรับ'}
              </span>
            </div>
          </div>
          <div class="mt-2" style="font-size: 0.9rem;">
            <div><strong>รหัส:</strong> <code style="background: #F3F4F6; padding: 2px 8px; border-radius: 4px;">${q.code}</code></div>
            <div><strong>ผลประเมิน:</strong> ${responses.length} รายการ</div>
            <div><strong>สร้างเมื่อ:</strong> ${App.formatDate(q.createdat || q.createdAt)}</div>
          </div>
          <div class="mt-2 flex gap-1 flex-wrap">
            <button class="btn btn-outline btn-sm" onclick="Teacher.showLink('${q.code}')">คัดลอก Link</button>
            <button class="btn btn-outline btn-sm" onclick="Teacher.handleToggle('${q.id}', '${q.status === 'active' ? 'closed' : 'active'}')">
              ${q.status === 'active' ? 'ปิดรับ' : 'เปิดรับ'}
            </button>
            <a href="dashboard.html?q=${q.id}" class="btn btn-outline btn-sm">ดูผล</a>
            <button class="btn btn-danger btn-sm" onclick="Teacher.confirmDelete('${q.id}')">ลบ</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // แสดง Link สำหรับทำแบบสอบถาม
  showLink(code) {
    const link = this.getSurveyLink(code);
    const modal = document.getElementById('link-modal');
    const linkEl = document.getElementById('survey-link');
    const qrEl = document.getElementById('qr-code');
    if (modal && linkEl) {
      linkEl.value = link;
      // สร้าง QR Code
      if (qrEl && typeof QRCode !== 'undefined') {
        qrEl.innerHTML = '';
        new QRCode(qrEl, {
          text: link,
          width: 150,
          height: 150,
          colorDark: '#111827',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
      modal.classList.add('active');
    }
  },

  closeLinkModal() {
    const modal = document.getElementById('link-modal');
    if (modal) modal.classList.remove('active');
  },

  copyLink() {
    const linkEl = document.getElementById('survey-link');
    if (linkEl) {
      linkEl.select();
      document.execCommand('copy');
      alert('คัดลอก Link แล้ว!');
    }
  },

  async confirmDelete(qId) {
    if (confirm('ต้องการลบแบบสอบถามนี้จริงหรือไม่?')) {
      var overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.classList.remove('hidden');
      try {
        await this.deleteQuestionnaire(qId);
        this.renderMyQuestionnaires();
        this.renderStats();
      } finally {
        if (overlay) overlay.classList.add('hidden');
      }
    }
  },

  // แสดงสถิติของผู้สอน
  renderStats() {
    const user = Auth.getCurrentUser();
    const statsContainer = document.getElementById('teacher-stats');
    if (!statsContainer || !user) return;

    const questionnaires = this.getMyQuestionnaires();
    let totalResponses = 0;
    let avgRating = 0;
    const allRatings = [];

    questionnaires.forEach(q => {
      const responses = this.getResponses(q.id);
      totalResponses += responses.length;
      
      responses.forEach(r => {
        try {
          const answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
          if (answers.rating) allRatings.push(parseFloat(answers.rating));
        } catch (e) {}
      });
    });

    if (allRatings.length > 0) {
      avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
    }

    statsContainer.innerHTML = `
      <div class="grid grid-3">
        <div class="card stat-card">
          <div class="stat-value">${questionnaires.length}</div>
          <div class="stat-label">แบบสอบถามทั้งหมด</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${totalResponses}</div>
          <div class="stat-label">ผลประเมินทั้งหมด</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${avgRating || '-'}</div>
          <div class="stat-label">คะแนนเฉลี่ย</div>
        </div>
      </div>
    `;
  }
};