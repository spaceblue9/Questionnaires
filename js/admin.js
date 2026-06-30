// ===== Admin Module =====

const Admin = {
  loadUsers() {
    const teachers = Auth.getTeachers();
    return teachers;
  },

  async addTeacher(name, email, password) {
    return await Auth.registerTeacher(name, email, password);
  },

  async removeTeacher(teacherId) {
    // ลบผู้สอน
    var teachers = Auth.getTeachers().filter(t => t.id !== teacherId);
    localStorage.setItem('teachers', JSON.stringify(teachers));

    // ลบ questionnaires ของผู้สอนคนนี้
    var questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    var qIds = questionnaires.filter(q => (q.teacherId || q.teacherid || '').toString().trim() === teacherId.toString().trim()).map(q => q.id);
    questionnaires = questionnaires.filter(q => (q.teacherId || q.teacherid || '').toString().trim() !== teacherId.toString().trim());
    localStorage.setItem('questionnaires', JSON.stringify(questionnaires));

    // ลบ responses ของแบบสอบถามทั้งหมดของผู้สอนคนนี้
    var responses = JSON.parse(localStorage.getItem('responses') || '[]');
    responses = responses.filter(r => {
      var rqid = (r.questionnaireId || r.questionnaireid || '').toString().trim();
      return qIds.map(id => id.toString().trim()).indexOf(rqid) === -1;
    });
    localStorage.setItem('responses', JSON.stringify(responses));

    // ลบใน Google Sheets
    if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
      try {
        await SheetsAPI.deleteUser(teacherId);
        for (var i = 0; i < qIds.length; i++) {
          await SheetsAPI.deleteQuestionnaire(qIds[i]);
          await SheetsAPI.deleteResponsesByQuestionnaire(qIds[i]);
        }
      } catch (e) {
        console.error('ลบข้อมูลใน Google Sheets ไม่ได้:', e);
      }
    }

    this.renderUsersTable();
    return { success: true };
  },

  async confirmRemoveTeacher(teacherId) {
    if (confirm('ลบผู้สอนนี้?')) {
      var overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.classList.remove('hidden');
      try {
        await this.removeTeacher(teacherId);
      } finally {
        if (overlay) overlay.classList.add('hidden');
      }
    }
  },

  approveTeacher(teacherId) {
    Auth.approveTeacher(teacherId, true);
    this.renderUsersTable();
  },

  rejectTeacher(teacherId) {
    Auth.approveTeacher(teacherId, false);
    this.renderUsersTable();
  },

  renderUsersTable() {
    var teachers = this.loadUsers();
    var tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    if (teachers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">ยังไม่มีผู้สอนที่สมัคร</td></tr>';
      return;
    }

    var html = '';
    teachers.forEach(function(t) {
      var approved = t.approved !== false;
      html += '<tr>';
      html += '<td>' + t.name + '</td>';
      html += '<td>' + t.email + '</td>';
      html += '<td><span class="badge ' + (approved ? 'badge-active' : 'badge-inactive') + '">';
      html += approved ? 'อนุมัติแล้ว' : 'รออนุมัติ';
      html += '</span></td>';
      html += '<td>' + App.formatDate(t.createdAt) + '</td>';
      html += '<td class="flex gap-1">';
      if (!approved) {
        html += '<button class="btn btn-secondary btn-sm" onclick="Admin.approveTeacher(\'' + t.id + '\')">อนุมัติ</button>';
      } else {
        html += '<button class="btn btn-outline btn-sm" onclick="Admin.rejectTeacher(\'' + t.id + '\')">ระงับ</button>';
      }
      html += '<button class="btn btn-danger btn-sm" onclick="Admin.confirmRemoveTeacher(\'' + t.id + '\')">ลบ</button>';
      html += '</td></tr>';
    });
    tbody.innerHTML = html;
  },

  async renderStats() {
    var statsContainer = document.getElementById('admin-stats');
    if (!statsContainer) return;

    try {
      var stats = await SheetsAPI.getStats();
      var teachers = this.loadUsers();
      var pending = teachers.filter(function(t) { return t.approved === false; }).length;

      statsContainer.innerHTML = '<div class="grid grid-3">' +
        '<div class="card stat-card"><div class="stat-value">' + stats.totalQuestionnaires + '</div><div class="stat-label">แบบสอบถาม</div></div>' +
        '<div class="card stat-card"><div class="stat-value">' + stats.totalResponses + '</div><div class="stat-label">ผลประเมิน</div></div>' +
        '<div class="card stat-card"><div class="stat-value">' + pending + '</div><div class="stat-label">รออนุมัติ</div></div>' +
        '</div>';
    } catch (e) {
      statsContainer.innerHTML = '';
    }
  }
};