// ===== Survey Module (สำหรับผู้เรียน) =====

const Survey = {
  currentQuestionnaire: null,
  answers: {},

  // โหลดแบบสอบถามจาก code
  async loadByCode(code) {
    const result = await Auth.validateSurveyCode(code);
    if (!result.valid) {
      return { success: false, message: result.message };
    }
    this.currentQuestionnaire = result.questionnaire;
    return { success: true, questionnaire: result.questionnaire };
  },

  // แสดงแบบสอบถาม
  renderSurvey() {
    const container = document.getElementById('survey-container');
    const form = document.getElementById('survey-form');
    if (!container || !this.currentQuestionnaire) return;

    const q = this.currentQuestionnaire;
    
    // แสดงข้อมูลพื้นฐาน
    document.getElementById('survey-title').textContent = q.title;
    document.getElementById('survey-description').textContent = q.description || '';

    // แสดงคำแนะนำ / ลิงก์สื่อการสอน
    const instructionsEl = document.getElementById('survey-instructions');
    if (q.instructions && q.instructions.trim()) {
      var text = q.instructions.replace(/\n/g, '<br>');
      text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      instructionsEl.style.display = 'block';
      instructionsEl.innerHTML = '<strong>คำแนะนำ:</strong><br>' + text;
    } else {
      instructionsEl.style.display = 'none';
    }

    // แสดงคำถาม
    let html = '';
    const questions = typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions;

    questions.forEach((question, index) => {
      html += `<div class="card mb-2" id="q-${index}">`;
      html += `<h3 style="font-size: 1rem; font-weight: 500; margin-bottom: 12px;">`;
      html += `${index + 1}. ${question.text}`;
      if (question.required) html += ' <span class="text-muted">*</span>';
      html += `</h3>`;

      switch (question.type) {
        case 'rating':
          html += `<div class="rating-stars" id="rating-${index}">`;
          for (let i = 1; i <= 5; i++) {
            html += `<span class="star" onclick="Survey.setRating(${index}, ${i})" data-value="${i}">★</span>`;
          }
          html += `</div>`;
          break;

        case 'text':
          html += `<textarea id="answer-${index}" rows="3" placeholder="พิมพ์คำตอบที่นี่..." 
                    onchange="Survey.setTextAnswer(${index}, this.value)"></textarea>`;
          break;

        case 'yes-no':
          html += `<div class="flex gap-2">`;
          html += `<label class="survey-option" onclick="Survey.setYesNo(${index}, 'yes')">
                     <input type="radio" name="q-${index}" value="yes"> ใช่
                   </label>`;
          html += `<label class="survey-option" onclick="Survey.setYesNo(${index}, 'no')">
                     <input type="radio" name="q-${index}" value="no"> ไม่ใช่
                   </label>`;
          html += `</div>`;
          break;

        case 'choice':
          html += `<div class="flex flex-col gap-1">`;
          question.choices.forEach((choice, ci) => {
            html += `<label class="survey-option" onclick="Survey.setChoice(${index}, '${choice}')">
                       <input type="radio" name="q-${index}" value="${choice}"> ${choice}
                     </label>`;
          });
          html += `</div>`;
          break;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  },

  setRating(questionIndex, value) {
    this.answers[questionIndex] = { type: 'rating', value };
    
    // อัพเดท UI
    const stars = document.querySelectorAll(`#rating-${questionIndex} .star`);
    stars.forEach((star, i) => {
      star.classList.toggle('active', i < value);
    });
  },

  setTextAnswer(questionIndex, value) {
    this.answers[questionIndex] = { type: 'text', value };
  },

  setYesNo(questionIndex, value) {
    this.answers[questionIndex] = { type: 'yes-no', value };
  },

  setChoice(questionIndex, value) {
    this.answers[questionIndex] = { type: 'choice', value };
  },

  confirmSubmit() {
    if (confirm('คุณต้องการส่งคำตอบใช่หรือไม่?')) {
      this.submit();
    }
  },

  // ส่งคำตอบ
  async submit() {
    if (!this.currentQuestionnaire) {
      alert('ไม่พบแบบสอบถาม');
      return;
    }

    // ตรวจสอบ required questions
    const questions = typeof this.currentQuestionnaire.questions === 'string' 
      ? JSON.parse(this.currentQuestionnaire.questions) 
      : this.currentQuestionnaire.questions;

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].required && !this.answers[i]) {
        alert(`กรุณาตอบคำถามข้อที่ ${i + 1}`);
        return;
      }
    }

    const response = {
      id: App.generateId(),
      questionnaireId: this.currentQuestionnaire.id,
      questionnaireTitle: this.currentQuestionnaire.title,
      answers: this.answers,
      submittedAt: new Date().toISOString()
    };

    // บันทึกลง localStorage
    const responses = JSON.parse(localStorage.getItem('responses') || '[]');
    responses.push(response);
    localStorage.setItem('responses', JSON.stringify(responses));

    // บันทึกลง Google Sheets
    if (SheetsAPI.isConfigured()) {
      try {
        await SheetsAPI.addResponse(response);
      } catch (e) {
        console.error('ไม่สามารถบันทึกลง Google Sheets:', e);
      }
    }

    // แสดงผลสำเร็จ
    document.getElementById('survey-form').classList.add('hidden');
    document.getElementById('survey-success').classList.remove('hidden');
  }
};