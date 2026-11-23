/**
 * PlantCare – Jadwal Penyiraman JS (watering.js)
 * Member 2 – Pengontrol halaman watering.html menggunakan komponen ScheduleCard.
 */

(function () {
  'use strict';

  const MODE = 'watering';

  // Metadata bawaan penyiraman agar setiap status (terlambat, hari ini, mendatang, selesai)
  // langsung terlihat dan dapat diuji dengan catatan perawatan yang realistis.
  function buildDefaultSeeds() {
    const today = ScheduleCard.getTodayIso();
    return {
      1: {
        timeSlot: 'Pagi Hari',
        notes: 'Siram merata hingga air mengalir ke lubang drainase, hindari genangan di tatakan.',
      },
      2: {
        timeSlot: 'Pagi Hari',
        nextDate: ScheduleCard.addDaysIso(today, 10),
        lastDate: today,
        completedDate: today,
        prevNextDate: today,
        prevLastDate: ScheduleCard.addDaysIso(today, -10),
        notes: 'Sudah disiram pagi ini; daun terlihat segar dan lembap.',
      },
      3: {
        timeSlot: 'Pagi Hari',
        notes: 'Pastikan media tanam benar-benar kering sebelum disiram agar akar tidak busuk.',
      },
      4: {
        timeSlot: 'Sore Hari',
        nextDate: ScheduleCard.addDaysIso(today, -1),
        notes: 'Cek daun yang mulai merunduk; semprot halus permukaan daun untuk kelembapan ekstra.',
      },
      5: {
        timeSlot: 'Pagi Hari',
        notes: 'Gunakan air matang atau air endapan bebas kaporit untuk mencegah ujung daun kecokelatan.',
      },
      6: {
        timeSlot: 'Pagi Hari',
        notes: 'Periksa kelembapan tanah sedalam 3–5 cm sebelum melakukan penyiraman.',
      },
      7: {
        timeSlot: 'Sore Hari',
        notes: 'Toleran kekeringan; siram secukupnya saja setiap 3 minggu sekali.',
      },
      8: {
        timeSlot: 'Pagi Hari',
        notes: 'Siram perlahan di sekitar pangkal batang dan lap debu pada daun lebar.',
      },
    };
  }

  let schedules = [];
  const state = {
    search: '',
    status: 'all',
    sortBy: 'priority',
  };

  // ── Referensi Elemen DOM ────────────────────────────────────────────────────

  const els = {};

  function cacheElements() {
    els.grid = document.getElementById('ws-schedule-grid');
    els.empty = document.getElementById('ws-empty-state');
    els.searchInput = document.getElementById('ws-search-input');
    els.searchClear = document.getElementById('ws-search-clear');
    els.statusSelect = document.getElementById('ws-status-select');
    els.sortSelect = document.getElementById('ws-sort-select');
    els.countBadge = document.getElementById('ws-count-badge');
    els.filterPills = document.getElementById('ws-filter-pills');
    els.resetBtn = document.getElementById('ws-reset-filter');
    els.emptyResetBtn = document.getElementById('ws-empty-reset');
    els.bannerSummary = document.getElementById('ws-banner-summary');

    els.modalOverlay = document.getElementById('ws-modal-overlay');
    els.modalClose = document.getElementById('ws-modal-close');
    els.modalCancel = document.getElementById('ws-modal-cancel');
    els.modalPlant = document.getElementById('ws-modal-plant');
    els.editForm = document.getElementById('ws-edit-form');
    els.formPlantId = document.getElementById('ws-form-plant-id');
    els.formNextDate = document.getElementById('ws-form-next-date');
    els.formFrequency = document.getElementById('ws-form-frequency');
    els.formTime = document.getElementById('ws-form-time');
    els.formNotes = document.getElementById('ws-form-notes');
  }

  // ── Sinkronisasi Statistik & UI Filter ──────────────────────────────────────

  function renderStats() {
    const counts = ScheduleCard.countByStatus(schedules);

    const keys = ['all', 'overdue', 'due-today', 'upcoming', 'completed'];
    keys.forEach(key => {
      const statEl = document.getElementById(`ws-stat-${key}`);
      const pillEl = document.getElementById(`ws-pill-${key}`);
      if (statEl) statEl.textContent = counts[key];
      if (pillEl) pillEl.textContent = counts[key];
    });

    const urgent = counts.overdue + counts['due-today'];
    if (els.bannerSummary) {
      els.bannerSummary.textContent =
        urgent > 0
          ? `Ada ${urgent} tanaman yang perlu segera disiram (${counts.overdue} terlambat, ${counts['due-today']} jatuh hari ini).`
          : 'Semua jadwal penyiraman hari ini sudah terkendali. Kerja bagus merawat tanamanmu!';
    }
  }

  function syncFilterControls() {
    if (els.statusSelect) els.statusSelect.value = state.status;

    document.querySelectorAll('#ws-filter-pills .sc-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === state.status);
    });

    document.querySelectorAll('[data-stat-filter]').forEach(card => {
      card.classList.toggle('active', card.dataset.statFilter === state.status);
    });

    if (els.searchClear) {
      els.searchClear.classList.toggle('visible', state.search.length > 0);
    }

    const isFiltered = state.status !== 'all' || state.search.trim().length > 0;
    if (els.resetBtn) {
      els.resetBtn.classList.toggle('visible', isFiltered);
    }
  }

  function render() {
    renderStats();
    syncFilterControls();

    const filtered = ScheduleCard.filterAndSort(schedules, {
      search: state.search,
      status: state.status,
      sortBy: state.sortBy,
    });

    if (els.countBadge) {
      els.countBadge.textContent = `${filtered.length} Jadwal`;
    }

    if (!filtered.length) {
      if (els.grid) els.grid.innerHTML = '';
      if (els.empty) els.empty.style.display = 'block';
      return;
    }

    if (els.empty) els.empty.style.display = 'none';

    ScheduleCard.renderList(els.grid, filtered, {
      mode: MODE,
      onToggleComplete: handleToggleComplete,
      onEdit: openEditModal,
    });
  }

  // ── Aksi Kartu Jadwal ───────────────────────────────────────────────────────

  function handleToggleComplete(plantId) {
    const updated = ScheduleCard.toggleComplete(MODE, schedules, plantId);
    if (!updated) return;
    render();
    if (updated.status === 'completed') {
      ScheduleCard.showToast(`${updated.plantName} ditandai sudah disiram hari ini.`);
    } else {
      ScheduleCard.showToast(`Status selesai untuk ${updated.plantName} dibatalkan.`);
    }
  }

  function openEditModal(plantId) {
    const item = schedules.find(s => s.plantId === plantId);
    if (!item || !els.modalOverlay) return;

    els.formPlantId.value = item.plantId;
    els.formNextDate.value = item.nextDate;
    els.formFrequency.value = item.frequency;
    els.formTime.value = item.timeSlot || 'Pagi Hari';
    els.formNotes.value = item.notes || '';

    const esc = ScheduleCard.escapeHtml;
    els.modalPlant.innerHTML = `
      <img src="${esc(item.plantImage)}" alt="${esc(item.plantName)}" onerror="this.src='${ScheduleCard.FALLBACK_PLANT_IMG}'" />
      <div>
        <div class="sc-modal-plant-name">${esc(item.plantName)}</div>
        <div class="sc-modal-plant-meta">${esc(item.location)} · ${esc(item.category)}</div>
      </div>
    `;

    els.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeEditModal() {
    if (!els.modalOverlay) return;
    els.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    const plantId = parseInt(els.formPlantId.value, 10);
    if (isNaN(plantId)) return;

    const updated = ScheduleCard.updateScheduleItem(MODE, schedules, plantId, {
      nextDate: els.formNextDate.value,
      frequency: els.formFrequency.value,
      timeSlot: els.formTime.value,
      notes: els.formNotes.value,
    });

    closeEditModal();
    render();
    if (updated) {
      ScheduleCard.showToast(`Jadwal penyiraman ${updated.plantName} berhasil diperbarui.`);
    }
  }

  function resetFilters() {
    state.search = '';
    state.status = 'all';
    if (els.searchInput) els.searchInput.value = '';
    render();
  }

  // ── Event Listeners ─────────────────────────────────────────────────────────

  function bindEvents() {
    if (els.searchInput) {
      els.searchInput.addEventListener('input', e => {
        state.search = e.target.value;
        render();
      });
    }

    if (els.searchClear) {
      els.searchClear.addEventListener('click', () => {
        state.search = '';
        if (els.searchInput) {
          els.searchInput.value = '';
          els.searchInput.focus();
        }
        render();
      });
    }

    if (els.statusSelect) {
      els.statusSelect.addEventListener('change', e => {
        state.status = e.target.value;
        render();
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', e => {
        state.sortBy = e.target.value;
        render();
      });
    }

    if (els.filterPills) {
      els.filterPills.addEventListener('click', e => {
        const pill = e.target.closest('.sc-pill');
        if (!pill) return;
        state.status = pill.dataset.status || 'all';
        render();
      });
    }

    document.querySelectorAll('[data-stat-filter]').forEach(card => {
      card.addEventListener('click', () => {
        state.status = card.dataset.statFilter || 'all';
        render();
      });
    });

    if (els.resetBtn) els.resetBtn.addEventListener('click', resetFilters);
    if (els.emptyResetBtn) els.emptyResetBtn.addEventListener('click', resetFilters);

    if (els.modalClose) els.modalClose.addEventListener('click', closeEditModal);
    if (els.modalCancel) els.modalCancel.addEventListener('click', closeEditModal);
    if (els.modalOverlay) {
      els.modalOverlay.addEventListener('click', e => {
        if (e.target === els.modalOverlay) closeEditModal();
      });
    }
    if (els.editForm) els.editForm.addEventListener('submit', handleSaveEdit);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && els.modalOverlay && els.modalOverlay.classList.contains('active')) {
        closeEditModal();
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    schedules = ScheduleCard.loadSchedules(MODE, buildDefaultSeeds());
    bindEvents();
    render();
  });
})();
