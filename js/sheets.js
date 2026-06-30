const SheetsAPI = {
  config: {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbyRwRjbFRz92idHrsROcU7YEX_rODNetqPNWgB4UiodsEIfOVOd5Of8Eeofd3kVvR9-Ow/exec',
    spreadsheetId: '',
    apiKey: ''
  },

  loadConfig() {
    var saved = localStorage.getItem('sheets_config');
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed.scriptUrl) this.config.scriptUrl = parsed.scriptUrl;
    }
    return this.config;
  },

  saveConfig(config) {
    Object.assign(this.config, config);
    localStorage.setItem('sheets_config', JSON.stringify(this.config));
  },

  isConfigured() {
    return this.config.scriptUrl && this.config.scriptUrl.length > 10;
  },

  async readSheet(sheetName) {
    if (!this.isConfigured()) {
      throw new Error('กรุณาตั้งค่า Google Apps Script URL ก่อน');
    }

    const url = this.config.scriptUrl + '?sheet=' + encodeURIComponent(sheetName);
    const response = await fetch(url);
    if (!response.ok) throw new Error('ไม่สามารถอ่านข้อมูลได้');
    const data = await response.json();
    return data.values || [];
  },

  async appendRow(sheetName, values) {
    if (!this.isConfigured()) {
      throw new Error('กรุณาตั้งค่า Google Apps Script URL ก่อน');
    }

    const headers = this.getHeaders(sheetName);
    const response = await fetch(this.config.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'append',
        sheet: sheetName,
        headers: headers,
        values: values
      })
    });

    if (!response.ok) throw new Error('ไม่สามารถเขียนข้อมูลได้');
    return await response.json();
  },

  getHeaders(sheetName) {
    var headers = {
      Users: ['ID', 'Name', 'Email', 'Role', 'Password', 'CreatedAt'],
      Questionnaires: ['ID', 'TeacherId', 'Title', 'Description', 'Instructions', 'Questions', 'Code', 'Status', 'CreatedAt'],
      Responses: ['ID', 'QuestionnaireId', 'Answers', 'SubmittedAt']
    };
    return headers[sheetName] || [];
  },

  async getUsers() {
    const rows = await this.readSheet('Users');
    if (rows.length <= 1) return [];
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const user = {};
      headers.forEach((h, i) => user[h.toLowerCase()] = row[i] || '');
      return user;
    });
  },

  async addUser(user) {
    return await this.appendRow('Users', [
      user.id, user.name, user.email, user.role, user.password, user.createdAt || new Date().toISOString()
    ]);
  },

  async addQuestionnaire(q) {
    return await this.appendRow('Questionnaires', [
      q.id, q.teacherId, q.title, q.description || '',
      q.instructions || '', JSON.stringify(q.questions), q.code, q.status || 'active', q.createdAt || new Date().toISOString()
    ]);
  },

  async addResponse(response) {
    return await this.appendRow('Responses', [
      response.id, response.questionnaireId,
      JSON.stringify(response.answers), response.submittedAt || new Date().toISOString()
    ]);
  },

  async getStats() {
    try {
      const questionnaires = await this.readSheet('Questionnaires');
      const responses = await this.readSheet('Responses');

      const qCount = Math.max(0, questionnaires.length - 1);
      const rCount = Math.max(0, responses.length - 1);

      return {
        totalQuestionnaires: qCount,
        activeQuestionnaires: qCount,
        totalResponses: rCount,
        avgRating: '-'
      };
    } catch (e) {
      return { totalQuestionnaires: 0, activeQuestionnaires: 0, totalResponses: 0, avgRating: '-' };
    }
  },

  async deleteRows(sheetName, ids) {
    if (!this.isConfigured()) {
      throw new Error('กรุณาตั้งค่า Google Apps Script URL ก่อน');
    }
    if (!ids || ids.length === 0) return { success: true };

    const response = await fetch(this.config.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'delete',
        sheet: sheetName,
        ids: ids
      })
    });

    if (!response.ok) throw new Error('ไม่สามารถลบข้อมูลได้');
    return await response.json();
  },

  async deleteQuestionnaire(qId) {
    return await this.deleteRows('Questionnaires', [qId]);
  },

  async deleteResponsesByQuestionnaire(qId) {
    try {
      const rows = await this.readSheet('Responses');
      if (rows.length <= 1) return { success: true };
      
      const headers = rows[0];
      const idIndex = headers.findIndex(h => h.toLowerCase() === 'id');
      const qIdIndex = headers.findIndex(h => h.toLowerCase() === 'questionnaireid');
      
      if (qIdIndex === -1) return { success: true };
      
      const idsToDelete = [];
      rows.slice(1).forEach((row, i) => {
        if (row[qIdIndex] === qId) {
          idsToDelete.push(row[idIndex]);
        }
      });
      
      if (idsToDelete.length > 0) {
        return await this.deleteRows('Responses', idsToDelete);
      }
      return { success: true };
    } catch (e) {
      console.error('ลบ responses ไม่ได้:', e);
      return { success: false, message: e.message };
    }
  },

  async deleteUser(userId) {
    return await this.deleteRows('Users', [userId]);
  },

  async updateRow(sheetName, id, field, value) {
    if (!this.isConfigured()) {
      throw new Error('กรุณาตั้งค่า Google Apps Script URL ก่อน');
    }

    const response = await fetch(this.config.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'update',
        sheet: sheetName,
        id: id,
        field: field,
        value: value
      })
    });

    if (!response.ok) throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
    return await response.json();
  }
};

SheetsAPI.loadConfig();