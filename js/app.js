// ===== Main Application =====

const App = {
  // แสดง error message
  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `<div class="alert alert-error">${message}</div>`;
      el.classList.remove('hidden');
    }
  },

  // แสดง success message
  showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `<div class="alert alert-success">${message}</div>`;
      el.classList.remove('hidden');
    }
  },

  // ซ่อน element
  hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
  },

  // แสดง/ซ่อน loading
  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = '<div class="loading"><div class="spinner"></div><p class="mt-1">กำลังโหลด...</p></div>';
      el.classList.remove('hidden');
    }
  },

  // สร้าง ID แบบสุ่ม
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // วันที่ format ไทย
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  // ตรวจสอบ authentication
  requireAuth(role) {
    const user = Auth.getCurrentUser();
    if (!user) {
      window.location.href = role === 'admin' ? 'admin.html' : 'teacher-login.html';
      return null;
    }
    if (role && user.role !== role) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  // แสดง navbar ตาม role
  renderNavbar() {
    const user = Auth.getCurrentUser();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    let links = '';
    if (user) {
      if (user.role === 'admin') {
        links = `
          <a href="admin.html" class="active">ตั้งค่า</a>
          <a href="dashboard.html">Dashboard</a>
        `;
      } else if (user.role === 'teacher') {
        links = `
          <a href="teacher.html" class="active">แดชบอร์ด</a>
          <a href="teacher-create.html">สร้างแบบสอบถาม</a>
          <a href="dashboard.html">รายงานผล</a>
        `;
      }
      links += `<a href="#" onclick="Auth.logout()">ออกจากระบบ (${user.name})</a>`;
    } else {
      links = `
        <a href="teacher-login.html">เข้าสู่ระบบผู้สอน</a>
        <a href="index.html">เข้าทำแบบสอบถาม</a>
      `;
    }

    nav.innerHTML = `
      <a href="index.html" class="navbar-brand">📋 ระบบประเมินการสอน</a>
      <nav class="navbar-nav">${links}</nav>
    `;
  },

  // แสดงผล rating เป็นดาว
  renderStars(rating, interactive = false) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const active = i <= rating ? 'active' : '';
      const clickable = interactive ? `onclick="survey.rate(${i})"` : '';
      stars.push(`<span class="star ${active}" ${clickable}>★</span>`);
    }
    return stars.join('');
  }
};

// โหลด Google Fonts
document.addEventListener('DOMContentLoaded', () => {
  App.renderNavbar();
});