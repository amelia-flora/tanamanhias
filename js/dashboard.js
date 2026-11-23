/**
 * PlantCare – Dashboard JS (dashboard.js)
 * Merender statistik, jadwal hari ini, ringkasan tanaman, dan aktivitas mendatang.
 */

(function () {
  'use strict';

  // ── Helpers ───────────────────────────────────────────────────────────────
  function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  }

  function statusBadge(status) {
    const map = {
      'due-today':  ['due-today',  'bi-clock',              'Jatuh Hari Ini'],
      'overdue':    ['overdue',    'bi-exclamation-circle',  'Terlambat'],
      'completed':  ['completed',  'bi-check-circle',        'Selesai'],
      'upcoming':   ['upcoming',   'bi-calendar',            'Mendatang'],
    };
    const [cls, icon, label] = map[status] || ['upcoming', 'bi-calendar', 'Mendatang'];
    return `<span class="badge-status ${cls}"><i class="bi ${icon}"></i> ${label}</span>`;
  }

  // ── Render Statistik ──────────────────────────────────────────────────────
  function renderStats() {
    const els = {
      total:       document.getElementById('stat-total'),
      watering:    document.getElementById('stat-watering'),
      fertilizing: document.getElementById('stat-fertilizing'),
      completed:   document.getElementById('stat-completed'),
    };
    if (els.total)       els.total.textContent       = dashboardStats.totalPlants;
    if (els.watering)    els.watering.textContent    = dashboardStats.needWatering;
    if (els.fertilizing) els.fertilizing.textContent = dashboardStats.needFertilizing;
    if (els.completed)   els.completed.textContent   = dashboardStats.completedToday;
  }

  // ── Render Jadwal Hari Ini ────────────────────────────────────────────────
  function renderTodaySchedule() {
    const container = document.getElementById('today-schedule-list');
    if (!container) return;
    if (!todaySchedule.length) {
      container.innerHTML = `<div class="empty-state" style="padding:40px 24px">
        <div class="empty-icon"><i class="bi bi-calendar-check"></i></div>
        <h3>Semua beres hari ini!</h3>
        <p>Tidak ada aktivitas perawatan terjadwal.</p>
      </div>`;
      return;
    }
    container.innerHTML = todaySchedule.map(item => `
      <div class="schedule-item">
        <img class="schedule-plant-img"
             src="${item.plantImage}"
             alt="${item.plantName}"
             onerror="this.src='https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200&auto=format&fit=crop&q=80'">
        <div class="schedule-info">
          <div class="schedule-plant-name">${item.plantName}</div>
          <div class="schedule-care-type">
            <i class="bi ${item.type === 'Penyiraman' ? 'bi-droplet' : 'bi-flower1'}"></i>
            ${item.type}
          </div>
        </div>
        <span class="schedule-time">${item.time}</span>
        ${statusBadge(item.status)}
      </div>
    `).join('');
  }

  // ── Render Ringkasan Tanaman (maks 4) ─────────────────────────────────────
  const CARD_GRADIENTS = [
    'linear-gradient(140deg, #CCEAAA 0%, #8CC870 100%)',
    'linear-gradient(140deg, #AADA88 0%, #5A8A38 100%)',
    'linear-gradient(140deg, #DCEFC0 0%, #AADA88 100%)',
    'linear-gradient(140deg, #EAF7CE 0%, #CCEAAA 100%)',
  ];

  function renderPlantOverview() {
    const grid = document.getElementById('plants-overview-grid');
    if (!grid) return;
    const preview = plants.slice(0, 4);
    grid.innerHTML = preview.map((p, i) => `
      <a href="plant-detail.html?id=${p.id}" class="plant-card">
        <div class="plant-card-img-wrap" style="background:${CARD_GRADIENTS[i % 4]}">
          <div class="plant-card-bg-fallback"><i class="bi bi-flower2"></i></div>
          <img class="plant-card-img"
               src="${p.image}"
               alt="${p.name}"
               onerror="this.style.opacity=0">
          <span class="plant-card-category">${p.category}</span>
        </div>
        <div class="plant-card-body">
          <div class="plant-card-name">${p.name}</div>
          <div class="plant-card-meta"><i class="bi bi-geo-alt-fill"></i> ${p.location}</div>
          <div class="plant-card-meta"><i class="bi bi-arrow-repeat"></i> Setiap ${p.wateringFrequency} hari</div>
        </div>
        <div class="plant-card-footer">
          <div class="plant-card-water">
            <i class="bi bi-droplet-fill"></i>
            <span>${formatDate(p.nextWateringDate)}</span>
          </div>
          <span class="plant-card-btn">Lihat Detail <i class="bi bi-arrow-right"></i></span>
        </div>
      </a>
    `).join('');
  }

  // ── Render Aktivitas Mendatang ────────────────────────────────────────────
  function renderUpcoming() {
    const container = document.getElementById('upcoming-list');
    if (!container) return;
    if (!upcomingActivities.length) {
      container.innerHTML = '<p style="padding:20px;color:var(--secondary-text);font-size:13px">Tidak ada aktivitas mendatang.</p>';
      return;
    }
    container.innerHTML = upcomingActivities.map(act => `
      <div class="upcoming-item">
        <span class="upcoming-dot ${act.type.toLowerCase()}"></span>
        <div class="upcoming-info">
          <div class="upcoming-plant">${act.plantName}</div>
          <div class="upcoming-care">${act.type}</div>
        </div>
        <span class="upcoming-date">${formatDate(act.date)}</span>
      </div>
    `).join('');
  }

  // ── Salam berdasarkan waktu ────────────────────────────────────────────────
  function setGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
    const el = document.getElementById('welcome-heading');
    if (el) el.textContent = `${greet}, Plant Lover! 🌿`;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderTodaySchedule();
    renderPlantOverview();
    renderUpcoming();
    setGreeting();
  });
})();
