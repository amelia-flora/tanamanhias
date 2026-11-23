/**
 * PlantCare – Jadwal Pemupukan JS (fertilizing.js)
 * Member 2 – Pengontrol halaman fertilizing.html menggunakan komponen ScheduleCard.
 */

(function () {
  'use strict';

  const MODE = 'fertilizing';

  // Metadata bawaan pemupukan agar semua kategori status jadwal dapat langsung
  // ditampilkan dan disaring dengan catatan dosis pupuk yang realistis.
  function buildDefaultSeeds() {
    const today = ScheduleCard.getTodayIso();
    return {
      1: {
        timeSlot: 'Sore Hari',
        nextDate: today,
        notes: 'Larutkan 5 ml pupuk cair organik dalam 1 liter air, aplikasikan saat tanah sedikit lembap.',
      },
      2: {
        timeSlot: 'Pagi Hari',
        nextDate: ScheduleCard.addDaysIso(today, 45),
        lastDate: today,
        completedDate: today,
        prevNextDate: today,
        prevLastDate: ScheduleCard.addDaysIso(today, -45),
        notes: 'Pemupukan NPK seimbang dosis ringan selesai diberikan pagi ini.',
      },
      3: {
        timeSlot: 'Pagi Hari',
        notes: 'Taburkan pupuk butir slow-release tipis di permukaan media tanam, jauh dari pangkal daun.',
      },
      4: {
        timeSlot: 'Sore Hari',
        notes: 'Gunakan setengah dosis anjuran agar ujung daun tidak terbakar garam mineral.',
      },
      5: {
        timeSlot: 'Pagi Hari',
        notes: 'Gunakan pupuk cair konsentrasi rendah (seperempat dosis) agar akar sensitif tetap aman.',
      },
      6: {
        timeSlot: 'Sore Hari',
        nextDate: ScheduleCard.addDaysIso(today, -2),
        notes: 'Beri nutrisi cair organik untuk merangsang tunas sulur dan corak daun baru.',
      },
      7: {
        timeSlot: 'Pagi Hari',
        notes: 'Cukup dipupuk setiap 2 bulan sekali dengan larutan NPK seimbang dosis encer.',
      },
      8: {
        timeSlot: 'Sore Hari',
        notes: 'Aplikasikan pupuk cair organik setelah penyiraman ringan agar penyerapan akar optimal.',
      },
    };
  }

  let schedules = [];
  const state = {
    search: '',
    status: 'all',
    fertilizerType: 'all',
    sortBy: 'priority',
  };

  // ── Referensi Elemen DOM ────────────────────────────────────────────────────

  const els = {};

  function cacheElements() {
    els.grid = document.getElementById('fs-schedule-grid');
    els.empty = document.getElementById('fs-empty-state');
    els.searchInput = document.getElementById('fs-search-input');
    els.searchClear = document.getElementById('fs-search-clear');
    els.statusSelect = document.getElementById('fs-status-select');
    els.typeSelect = document.getElementById('fs-type-select');
    els.sortSelect = document.getElementById('fs-sort-select');
    els.countBadge = document.getElementById('fs-count-badge');
    els.filterPills = document.getElementById('fs-filter-pills');
    els.resetBtn = document.getElementById('fs-reset-filter');
    els.emptyResetBtn = document.getElementById('fs-empty-reset');
    els.bannerSummary = document.getElementById('fs-banner-summary');

    els.modalOverlay = document.getElementById('fs-modal-overlay');
    els.modalClose = document.getElementById('fs-modal-close');
    els.modalCancel = document.getElementById('fs-modal-cancel');
    els.modalPlant = document.getElementById('fs-modal-plant');
    els.editForm = document.getElementById('fs-edit-form');
    els.formPlantId = document.getElementById('fs-form-plant-id');
    els.formNextDate = document.getElementById('fs-form-next-date');
    els.formFrequency = document.getElementById('fs-form-frequency');
    els.formType = document.getElementById('fs-form-type');
    els.formTime = document.getElementById('fs-form-time');
    els.formNotes = document.getElementById('fs-form-notes');
  }

  // ── Dropdown Jenis Pupuk ────────────────────────────────────────────────────

  function populateFertilizerTypes() {
    if (!els.typeSelect) return;
    const prev = state.fertilizerType;
    while (els.typeSelect.options.length > 1) {
      els.typeSelect.remove(1);
    }
    const types = [...new Set(schedules.map(s => s.fertilizerType).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'id')
    );
    types.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      els.typeSelect.appendChild(opt);
    });
    els.typeSelect.value = types.includes(prev) ? prev : 'all';
    state.fertilizerType = els.typeSelect.value;
  }

  // ── Sinkronisasi Statistik & UI Filter ──────────────────────────────────────

  function renderStats() {
    const counts = ScheduleCard.countByStatus(schedules);

    const keys = ['all', 'overdue', 'due-today', 'upcoming', 'completed'];
    keys.forEach(key => {
      const statEl = document.getElementById(`fs-stat-${key}`);
      const pillEl = document.getElementById(`fs-pill-${key}`);
      if (statEl) statEl.textContent = counts[key];
      if (pillEl) pillEl.textContent = counts[key];
    });

    const urgent = counts.overdue + counts['due-today'];
    if (els.bannerSummary) {
      els.bannerSummary.textContent =
        urgent > 0
          ? `Ada ${urgent} tanaman yang perlu dipupuk segera (${counts.overdue} terlambat, ${counts['due-today']} jatuh hari ini).`
          : 'Semua jadwal pemupukan hari ini sudah beres. Nutrisi tanamanmu terjaga dengan baik!';
    }
  }

  function syncFilterControls() {
    if (els.statusSelect) els.statusSelect.value = state.status;
    if (els.typeSelect) els.typeSelect.value = state.fertilizerType;

    document.querySelectorAll('#fs-filter-pills .sc-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === state.status);
    });

    document.querySelectorAll('[data-stat-filter]').forEach(card => {
      card.classList.toggle('active', card.dataset.statFilter === state.status);
    });

    if (els.searchClear) {
      els.searchClear.classList.toggle('visible', state.search.length > 0);
    }

    const isFiltered =
      state.status !== 'all' ||
      state.fertilizerType !== 'all' ||
      state.search.trim().length > 0;

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
      fertilizerType: state.fertilizerType,
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
      ScheduleCard.showToast(`${updated.plantName} ditandai sudah dipupuk hari ini.`);
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
    els.formType.value = item.fertilizerType || 'Pupuk Cair Organik';
    els.formTime.value = item.timeSlot || 'Sore Hari';
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
      fertilizerType: els.formType.value,
      timeSlot: els.formTime.value,
      notes: els.formNotes.value,
    });

    closeEditModal();
    populateFertilizerTypes();
    render();
    if (updated) {
      ScheduleCard.showToast(`Jadwal pemupukan ${updated.plantName} berhasil diperbarui.`);
    }
  }

  function resetFilters() {
    state.search = '';
    state.status = 'all';
    state.fertilizerType = 'all';
    if (els.searchInput) els.searchInput.value = '';
    if (els.typeSelect) els.typeSelect.value = 'all';
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

    if (els.typeSelect) {
      els.typeSelect.addEventListener('change', e => {
        state.fertilizerType = e.target.value;
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
    populateFertilizerTypes();
    bindEvents();
    render();
  });
})();
