// ===== Dashboard Module =====

const Dashboard = {
  async loadData(questionnaireId) {
    let questionnaires = [];
    let responses = [];

    // ลองดึงจาก Google Sheets ก่อน
    if (SheetsAPI.isConfigured()) {
      try {
        const qRows = await SheetsAPI.readSheet('Questionnaires');
        if (qRows.length > 1) {
          const headers = qRows[0];
          questionnaires = qRows.slice(1).map(function(row) {
            var q = {};
            headers.forEach(function(h, i) { q[h.toLowerCase()] = (row[i] || '').toString().trim(); });
            return q;
          });
        }
      } catch (e) { console.error('โหลด questionnaires จาก Sheets ไม่ได้:', e); }

      try {
        const rRows = await SheetsAPI.readSheet('Responses');
        if (rRows.length > 1) {
          const headers = rRows[0];
          responses = rRows.slice(1).map(function(row) {
            var r = {};
            headers.forEach(function(h, i) { r[h.toLowerCase()] = (row[i] || '').toString().trim(); });
            return r;
          });
        }
      } catch (e) { console.error('โหลด responses จาก Sheets ไม่ได้:', e); }
    }

    // fallback ไป localStorage
    if (questionnaires.length === 0) {
      questionnaires = JSON.parse(localStorage.getItem('questionnaires') || '[]');
    }
    if (responses.length === 0) {
      responses = JSON.parse(localStorage.getItem('responses') || '[]');
    }

    // filter by teacher — เฉพาะ teacher เท่านั้น admin เห็นทุกอย่าง
    var user = Auth.getCurrentUser();
    if (user && user.role === 'teacher') {
      var uid = (user.id || '').toString().trim();
      questionnaires = questionnaires.filter(function(q) {
        var qtid = (q.teacherid || q.teacherId || '').toString().trim();
        return qtid === uid;
      });
      // filter responses เฉพาะแบบสอบถามของ teacher คนนี้
      var qIds = questionnaires.map(function(q) { return q.id; });
      responses = responses.filter(function(r) {
        var rqid = (r.questionnaireid || r.questionnaireId || '').toString().trim();
        return qIds.indexOf(rqid) !== -1;
      });
    }

    // filter by questionnaire id
    if (questionnaireId) {
      questionnaires = questionnaires.filter(function(q) { return q.id === questionnaireId; });
      responses = responses.filter(function(r) {
        var rqid = (r.questionnaireid || r.questionnaireId || '').toString().trim();
        return rqid === questionnaireId;
      });
    }

    return { questionnaires: questionnaires, responses: responses };
  },

  renderOverview(responses) {
    var container = document.getElementById('overview-stats');
    if (!container) return;

    var totalResponses = responses.length;
    var avgRating = 0;
    var ratings = [];

    responses.forEach(function(r) {
      try {
        var answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
        if (!answers) return;
        Object.keys(answers).forEach(function(key) {
          var a = answers[key];
          if (typeof a === 'string') {
            try { a = JSON.parse(a); } catch (e) { return; }
          }
          if (a && a.type === 'rating' && a.value) {
            ratings.push(parseFloat(a.value));
          }
        });
      } catch (e) {}
    });

    if (ratings.length > 0) {
      avgRating = (ratings.reduce(function(a, b) { return a + b; }, 0) / ratings.length).toFixed(1);
    }

    container.innerHTML = '<div class="grid grid-3">' +
      '<div class="card stat-card"><div class="stat-value">' + totalResponses + '</div><div class="stat-label">ผลประเมินทั้งหมด</div></div>' +
      '<div class="card stat-card"><div class="stat-value">' + (avgRating || '-') + '</div><div class="stat-label">คะแนนเฉลี่ย</div></div>' +
      '<div class="card stat-card"><div class="stat-value">' + (ratings.length > 0 ? Dashboard.getRatingDistribution(ratings) : '-') + '</div><div class="stat-label">คะแนนนิยม</div></div>' +
      '</div>';
  },

  getRatingDistribution(ratings) {
    var freq = {};
    ratings.forEach(function(r) { freq[r] = (freq[r] || 0) + 1; });
    var sorted = Object.entries(freq).sort(function(a, b) { return b[1] - a[1]; });
    return sorted[0] ? sorted[0][0] : '-';
  },

  renderQuestionnairesList(questionnaires) {
    var container = document.getElementById('questionnaires-list');
    if (!container) return;

    if (questionnaires.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">ยังไม่มีแบบสอบถาม</div>';
      return;
    }

    var html = '<div class="table-wrapper"><table><thead><tr><th>ชื่อแบบสอบถาม</th><th>รหัส</th><th>สถานะ</th></tr></thead><tbody>';
    questionnaires.forEach(function(q) {
      html += '<tr><td>' + (q.title || '-') + '</td>';
      html += '<td><code style="background:#F3F4F6;padding:2px 8px;border-radius:4px;">' + (q.code || '-') + '</code></td>';
      html += '<td><span class="badge ' + (q.status === 'active' ? 'badge-active' : 'badge-inactive') + '">' + (q.status === 'active' ? 'เปิดรับ' : 'ปิดรับ') + '</span></td></tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  },

  renderRatingChart(responses) {
    var container = document.getElementById('rating-chart');
    if (!container) return;

    var ratings = [0, 0, 0, 0, 0];
    responses.forEach(function(r) {
      try {
        var answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
        if (!answers) return;
        Object.keys(answers).forEach(function(key) {
          var a = answers[key];
          // รองรับทั้ง object และ string
          if (typeof a === 'string') {
            try { a = JSON.parse(a); } catch (e) { return; }
          }
          if (a && a.type === 'rating' && a.value) {
            var val = parseInt(a.value);
            if (val >= 1 && val <= 5) ratings[val - 1]++;
          }
        });
      } catch (e) {}
    });

    var max = Math.max.apply(null, ratings.concat([1]));
    var totalRatings = ratings.reduce(function(a, b) { return a + b; }, 0);
    var html = '<div class="card"><h3 style="font-size:1rem;font-weight:600;margin-bottom:16px;">ผลประเมินตามคะแนน</h3>';
    
    if (totalRatings === 0) {
      html += '<p class="text-center text-muted" style="padding:24px;">ยังไม่มีผลประเมิน</p>';
      container.innerHTML = html;
      return;
    }

    html += '<div style="display:flex;align-items:flex-end;gap:8px;height:180px;padding:16px 0;">';

    for (var i = 4; i >= 0; i--) {
      var barHeight = max > 0 ? Math.max((ratings[i] / max) * 120, ratings[i] > 0 ? 8 : 0) : 0;
      html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">';
      if (ratings[i] > 0) {
        html += '<div style="font-size:0.75rem;color:var(--primary);font-weight:600;margin-bottom:4px;">' + ratings[i] + '</div>';
      }
      html += '<div style="width:100%;max-width:60px;background:var(--primary);height:' + barHeight + 'px;border-radius:4px 4px 0 0;transition:height 0.3s;"></div>';
      html += '<div style="font-size:0.8rem;margin-top:8px;white-space:nowrap;">' + (i + 1) + ' ★</div>';
      html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
  },

  renderTextResponses(responses, questionnaires) {
    var container = document.getElementById('text-responses');
    if (!container) return;

    var textAnswers = [];
    responses.forEach(function(r) {
      try {
        var answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
        if (!answers) return;
        var q = questionnaires.find(function(q) { return q.id === r.questionnaireid || q.id === r.questionnaireId; });
        if (!q) return;

        var questions = typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions;

        Object.keys(answers).forEach(function(qi) {
          var answer = answers[qi];
          if (typeof answer === 'string') {
            try { answer = JSON.parse(answer); } catch (e) { return; }
          }
          if (answer && answer.type === 'text' && answer.value) {
            var question = questions[parseInt(qi)];
            textAnswers.push({
              question: question ? question.text : 'ข้อที่ ' + (parseInt(qi) + 1),
              answer: answer.value,
              questionnaire: q.title || '-',
              date: r.submittedat || r.submittedAt
            });
          }
        });
      } catch (e) {}
    });

    if (textAnswers.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">ยังไม่มีคำตอบแบบข้อความ</div>';
      return;
    }

    var html = '<div class="card"><h3 style="font-size:1rem;font-weight:600;margin-bottom:16px;">คำตอบแบบข้อความ</h3>';
    textAnswers.forEach(function(a) {
      html += '<div style="padding:12px;border-bottom:1px solid var(--border);">';
      html += '<div style="font-size:0.85rem;color:#6B7280;">' + a.questionnaire + ' - ' + App.formatDate(a.date) + '</div>';
      html += '<div style="font-weight:500;margin:4px 0;">' + a.question + '</div>';
      html += '<div>' + a.answer + '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  },

  renderResponses(responses, questionnaires) {
    var container = document.getElementById('responses-detail');
    if (!container) return;

    if (responses.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">ยังไม่มีผลการประเมิน</div>';
      return;
    }

    var grouped = {};
    responses.forEach(function(r) {
      var qId = r.questionnaireid || r.questionnaireId;
      if (!grouped[qId]) grouped[qId] = [];
      grouped[qId].push(r);
    });

    var html = '';
    Object.keys(grouped).forEach(function(qId) {
      var resps = grouped[qId];
      var q = questionnaires.find(function(q) { return q.id === qId; });
      if (!q) return;

      html += '<div class="card mb-3">';
      html += '<h3 style="font-size:1.1rem;font-weight:600;">' + (q.title || '-') + '</h3>';
      html += '<p class="text-muted mb-2">ผลประเมิน ' + resps.length + ' รายการ</p>';

      resps.forEach(function(r, i) {
        try {
          var answers = typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers;
          if (!answers) return;
          
          html += '<div class="card" style="background:#F9FAFB;">';
          html += '<div style="font-size:0.9rem;color:#6B7280;margin-bottom:8px;">#'+(i+1)+' - '+App.formatDate(r.submittedat || r.submittedAt)+'</div>';

          var questions = typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions;
          questions.forEach(function(question, qi) {
            var answer = answers[qi];
            if (typeof answer === 'string') {
              try { answer = JSON.parse(answer); } catch (e) { return; }
            }
            if (!answer) return;
            var displayValue = '';
            if (answer.type === 'rating') {
              displayValue = '★'.repeat(answer.value) + '☆'.repeat(5 - answer.value) + ' (' + answer.value + '/5)';
            } else if (answer.type === 'yes-no') {
              displayValue = answer.value === 'yes' ? '✓ ใช่' : '✗ ไม่ใช่';
            } else {
              displayValue = answer.value;
            }
            html += '<div style="margin-bottom:4px;"><strong>' + question.text + ':</strong> ' + displayValue + '</div>';
          });

          html += '</div>';
        } catch (e) {}
      });

      html += '</div>';
    });

    container.innerHTML = html;
  }
};