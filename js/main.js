/**
 * PlantCare – Main JS (main.js)
 * Shared utilities: sidebar toggle, active nav, topbar date.
 * Loaded on every page.
 */

(function () {
  'use strict';

  // ── Auto-set current date in topbar ──────────────────────────────────────
  function setTopbarDate() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Set active nav item based on current page ─────────────────────────────
  function setActiveNav() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href') || '';
      const hrefFile = href.split('/').pop();
      if (
        hrefFile === filename ||
        (filename === '' && hrefFile === 'index.html') ||
        (filename === 'index.html' && hrefFile === 'index.html')
      ) {
        item.classList.add('active');
      }
    });
  }

  // ── Mobile sidebar toggle ─────────────────────────────────────────────────
  function initSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    if (!sidebar) return;

    function open()  { sidebar.classList.add('open');  overlay && overlay.classList.add('open'); }
    function close() { sidebar.classList.remove('open'); overlay && overlay.classList.remove('open'); }

    hamburger && hamburger.addEventListener('click', () => {
      sidebar.classList.contains('open') ? close() : open();
    });

    overlay && overlay.addEventListener('click', close);

    // Close on nav item click on mobile
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) close();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });
  }

// ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setTopbarDate();
    setActiveNav();
    initSidebar();
    // Authentication guard: redirect unauthenticated users to login page
    const currentUser = localStorage.getItem('plantcare_user');
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (!currentUser && !isLoginPage) {
      window.location.replace('login.html');
    }
    if (currentUser && isLoginPage) {
      window.location.replace('index.html');
    }
  });
})();
