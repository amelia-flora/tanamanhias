/**
 * PlantCare – Komponen Kartu Jadwal & Utilitas Penjadwalan (schedule-card.js)
 * Member 2 – Komponen bersama untuk watering.html dan fertilizing.html.
 *
 * Fitur:
 *  - Komponen Kartu Jadwal (`ScheduleCard.buildCard`, `ScheduleCard.renderList`)
 *  - Perhitungan status jadwal akurat (`overdue`, `due-today`, `upcoming`, `completed`)
 *  - Penyaringan status & pencarian tanaman pada jadwal (`ScheduleCard.filterAndSort`)
 *  - Sinkronisasi & persistensi jadwal ke localStorage + data `plants`
 */

(function (global) {
  'use strict';

  const FALLBACK_PLANT_IMG =
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80';

  const STORAGE_KEYS = {
    watering: 'plantcare_schedules_watering_v1',
    fertilizing: 'plantcare_schedules_fertilizing_v1',
  };

  const STATUS_META = {
    overdue: {
      label: 'Terlambat',
      icon: 'bi-exclamation-circle-fill',
      priority: 1,
    },
    'due-today': {
      label: 'Jatuh Hari Ini',
      icon: 'bi-clock-fill',
      priority: 2,
    },
    upcoming: {
      label: 'Mendatang',
      icon: 'bi-calendar-event',
      priority: 3,
    },
    completed: {
      label: 'Selesai',
      icon: 'bi-check-circle-fill',
      priority: 4,
    },
  };

  // ── Utilitas String & Tanggal ───────────────────────────────────────────────

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toIsoLocal(dateObj) {
    return (
      dateObj.getFullYear() +
      '-' +
      pad2(dateObj.getMonth() + 1) +
      '-' +
      pad2(dateObj.getDate())
    );
  }

  function getTodayIso() {
    if (typeof relDate === 'function') {
      return relDate(0);
    }
    return toIsoLocal(new Date());
  }

  function parseIso(isoStr) {
    if (!isoStr) return null;
    const parts = String(isoStr).split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDaysIso(isoStr, days) {
    const base = parseIso(isoStr) || parseIso(getTodayIso());
    base.setDate(base.getDate() + Number(days || 0));
    return toIsoLocal(base);
  }

  function diffFromToday(isoStr) {
    const target = parseIso(isoStr);
    const today = parseIso(getTodayIso());
    if (!target || !today) return 0;
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  function formatDateId(isoStr) {
    const d = parseIso(isoStr);
    if (!d) return '—';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatRelativeDate(isoStr, status) {
    if (status === 'completed') return 'Selesai Hari Ini';
    const diff = diffFromToday(isoStr);
    if (diff === 0) return 'Hari Ini';
    if (diff === 1) return 'Besok';
    if (diff < 0) return `${Math.abs(diff)} hari terlambat`;
    return `${diff} hari lagi`;
  }

  function computeStatus(nextDateIso, completedDate) {
    const todayIso = getTodayIso();
    if (completedDate && completedDate === todayIso) {
      return 'completed';
    }
    const diff = diffFromToday(nextDateIso);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'due-today';
    return 'upcoming';
  }

  function renderStatusBadge(status) {
    const meta = STATUS_META[status] || STATUS_META.upcoming;
    return `<span class="badge-status ${status}"><i class="bi ${meta.icon}"></i> ${meta.label}</span>`;
  }

  // ── Sinkronisasi Data & Persistensi ─────────────────────────────────────────

  function readOverrides(mode) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[mode]);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeOverrides(mode, items) {
    try {
      const map = {};
      items.forEach(item => {
        map[item.plantId] = {
          nextDate: item.nextDate,
          lastDate: item.lastDate,
          frequency: item.frequency,
          timeSlot: item.timeSlot,
          notes: item.notes,
          fertilizerType: item.fertilizerType || '',
          completedDate: item.completedDate || null,
          prevNextDate: item.prevNextDate || null,
          prevLastDate: item.prevLastDate || null,
        };
      });
      localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(map));
    } catch (e) {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function getGlobalPlants() {
    if (typeof plants !== 'undefined' && Array.isArray(plants)) {
      return plants;
    }
    return Array.isArray(global.plants) ? global.plants : [];
  }

  function syncPlantDates(mode, item) {
    const plantList = getGlobalPlants();
    if (!plantList.length) return;
    const plant = plantList.find(p => p.id === item.plantId);
    if (!plant) return;

    if (mode === 'watering') {
      plant.wateringFrequency = item.frequency;
      plant.nextWateringDate = item.nextDate;
      plant.lastWateringDate = item.lastDate;
    } else {
      plant.fertilizingFrequency = item.frequency;
      plant.nextFertilizingDate = item.nextDate;
      plant.lastFertilizingDate = item.lastDate;
      if (item.fertilizerType) {
        plant.fertilizerType = item.fertilizerType;
      }
    }

    if (typeof savePlantsToStorage === 'function') {
      savePlantsToStorage();
    }
  }

  /**
   * Muat daftar jadwal berdasarkan mode ('watering' | 'fertilizing').
   * Menggabungkan data `plants` dari dummy-data.js, default metadata per halaman,
   * dan perubahan tersimpan pengguna di localStorage.
   */
  function loadSchedules(mode, defaultSeeds) {
    const isWatering = mode === 'watering';
    const basePlants = getGlobalPlants();
    const savedMap = readOverrides(mode);
    const seeds = defaultSeeds || {};

    return basePlants.map(p => {
      const seed = seeds[p.id] || {};
      const saved = savedMap && savedMap[p.id] ? savedMap[p.id] : null;

      const baseFreq = isWatering ? p.wateringFrequency : p.fertilizingFrequency;
      const baseNext = isWatering ? p.nextWateringDate : p.nextFertilizingDate;
      const baseLast = isWatering ? p.lastWateringDate : p.lastFertilizingDate;

      const frequency = saved && saved.frequency ? Number(saved.frequency) : Number(baseFreq || 7);
      const nextDate = saved ? saved.nextDate : (seed.nextDate || baseNext || getTodayIso());
      const lastDate = saved ? saved.lastDate : (seed.lastDate || baseLast || addDaysIso(getTodayIso(), -frequency));
      const completedDate = saved ? saved.completedDate : (seed.completedDate || null);
      const timeSlot = saved && saved.timeSlot ? saved.timeSlot : (seed.timeSlot || (isWatering ? 'Pagi Hari' : 'Sore Hari'));
      const notes = saved && typeof saved.notes === 'string' ? saved.notes : (seed.notes || '');
      const fertilizerType = isWatering
        ? ''
        : (saved && saved.fertilizerType ? saved.fertilizerType : (p.fertilizerType || 'Pupuk Cair Organik'));

      const item = {
        id: p.id,
        plantId: p.id,
        plantName: p.name,
        plantImage: p.image || FALLBACK_PLANT_IMG,
        category: p.category || 'Tanaman Hias',
        location: p.location || 'Dalam Ruangan',
        frequency,
        nextDate,
        lastDate,
        timeSlot,
        notes,
        fertilizerType,
        completedDate,
        prevNextDate: saved ? saved.prevNextDate : (seed.prevNextDate || null),
        prevLastDate: saved ? saved.prevLastDate : (seed.prevLastDate || null),
        status: computeStatus(nextDate, completedDate),
      };
      return item;
    });
  }

  /**
   * Tandai jadwal selesai atau batalkan status selesai hari ini.
   */
  function toggleComplete(mode, items, plantId) {
    const item = items.find(x => x.plantId === plantId);
    if (!item) return null;

    const todayIso = getTodayIso();
    if (item.status === 'completed') {
      // Batalkan selesai -> kembalikan ke tanggal sebelumnya
      item.nextDate = item.prevNextDate || todayIso;
      item.lastDate = item.prevLastDate || addDaysIso(todayIso, -item.frequency);
      item.completedDate = null;
      item.prevNextDate = null;
      item.prevLastDate = null;
      item.status = computeStatus(item.nextDate, null);
    } else {
      // Tandai selesai hari ini -> hitung siklus berikutnya
      item.prevNextDate = item.nextDate;
      item.prevLastDate = item.lastDate;
      item.lastDate = todayIso;
      item.nextDate = addDaysIso(todayIso, item.frequency);
      item.completedDate = todayIso;
      item.status = 'completed';
    }

    writeOverrides(mode, items);
    syncPlantDates(mode, item);
    return item;
  }

  /**
   * Perbarui detail jadwal dari modal edit.
   */
  function updateScheduleItem(mode, items, plantId, updates) {
    const item = items.find(x => x.plantId === plantId);
    if (!item) return null;

    if (updates.nextDate) item.nextDate = updates.nextDate;
    if (updates.frequency) item.frequency = Math.max(1, parseInt(updates.frequency, 10) || item.frequency);
    if (updates.timeSlot) item.timeSlot = updates.timeSlot;
    if (typeof updates.notes === 'string') item.notes = updates.notes.trim();
    if (mode === 'fertilizing' && typeof updates.fertilizerType === 'string' && updates.fertilizerType.trim()) {
      item.fertilizerType = updates.fertilizerType.trim();
    }

    // Jika pengguna mengubah tanggal jadwal secara manual, reset status selesai hari ini
    if (updates.nextDate && item.status === 'completed') {
      item.completedDate = null;
      item.prevNextDate = null;
      item.prevLastDate = null;
    }

    item.status = computeStatus(item.nextDate, item.completedDate);
    writeOverrides(mode, items);
    syncPlantDates(mode, item);
    return item;
  }

  // ── Penyaringan & Pengurutan ────────────────────────────────────────────────

  function countByStatus(items) {
    const counts = {
      all: items.length,
      overdue: 0,
      'due-today': 0,
      upcoming: 0,
      completed: 0,
    };
    items.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });
    return counts;
  }

  function filterAndSort(items, opts) {
    const search = (opts.search || '').toLowerCase().trim();
    const status = opts.status || 'all';
    const fertilizerType = opts.fertilizerType || 'all';
    const sortBy = opts.sortBy || 'priority';

    const filtered = items.filter(item => {
      const matchStatus = status === 'all' || item.status === status;
      const matchFert =
        fertilizerType === 'all' ||
        (item.fertilizerType || '').toLowerCase() === fertilizerType.toLowerCase();

      if (!matchStatus || !matchFert) return false;
      if (!search) return true;

      const haystack = [
        item.plantName,
        item.location,
        item.category,
        item.notes,
        item.fertilizerType,
        item.timeSlot,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });

    const sorted = filtered.slice();
    sorted.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.plantName.localeCompare(b.plantName, 'id');
      }
      if (sortBy === 'freq-asc') {
        return a.frequency - b.frequency || a.plantName.localeCompare(b.plantName, 'id');
      }
      if (sortBy === 'date-asc') {
        return diffFromToday(a.nextDate) - diffFromToday(b.nextDate);
      }
      // Default: prioritas status (Terlambat -> Jatuh Hari Ini -> Mendatang -> Selesai) lalu tanggal terdekat
      const pa = (STATUS_META[a.status] || STATUS_META.upcoming).priority;
      const pb = (STATUS_META[b.status] || STATUS_META.upcoming).priority;
      if (pa !== pb) return pa - pb;
      return diffFromToday(a.nextDate) - diffFromToday(b.nextDate);
    });

    return sorted;
  }

  // ── Komponen Kartu Jadwal ───────────────────────────────────────────────────

  /**
   * Membangun markup HTML untuk 1 Komponen Kartu Jadwal.
   * @param {Object} item - Objek jadwal tanaman
   * @param {Object} options - { mode: 'watering' | 'fertilizing' }
   * @returns {string} HTML string
   */
  function buildCard(item, options) {
    const mode = (options && options.mode) || 'watering';
    const isWatering = mode === 'watering';
    const isCompleted = item.status === 'completed';

    const primaryIcon = isWatering ? 'bi-droplet-fill' : 'bi-moisture';
    const nextLabel = isCompleted
      ? (isWatering ? 'Penyiraman Berikutnya' : 'Pemupukan Berikutnya')
      : (isWatering ? 'Jadwal Penyiraman' : 'Jadwal Pemupukan');
    const lastLabel = isWatering ? 'Terakhir Disiram' : 'Terakhir Dipupuk';
    const completeBtnText = isCompleted
      ? '<i class="bi bi-arrow-counterclockwise"></i> Selesai · Batalkan'
      : (isWatering
          ? '<i class="bi bi-check2-circle"></i> Tandai Sudah Disiram'
          : '<i class="bi bi-check2-circle"></i> Tandai Sudah Dipupuk');

    const fertilizerBlock = !isWatering && item.fertilizerType
      ? `<div class="sc-fert-pill" title="Jenis Pupuk">
           <i class="bi bi-bag-heart-fill"></i>
           <span>${escapeHtml(item.fertilizerType)}</span>
         </div>`
      : '';

    const notesBlock = item.notes
      ? `<div class="sc-notes" title="${escapeHtml(item.notes)}">${escapeHtml(item.notes)}</div>`
      : '';

    return `
      <article class="sc-card" data-plant-id="${item.plantId}" data-status="${item.status}" data-mode="${mode}">
        <div class="sc-card-accent"></div>

        <div class="sc-card-header">
          <a href="plant-detail.html?id=${item.plantId}" class="sc-card-thumb-link" aria-label="Lihat detail ${escapeHtml(item.plantName)}">
            <img class="sc-card-thumb"
                 src="${escapeHtml(item.plantImage)}"
                 alt="${escapeHtml(item.plantName)}"
                 loading="lazy"
                 onerror="this.src='${FALLBACK_PLANT_IMG}'" />
          </a>

          <div class="sc-card-heading">
            <div class="sc-card-top-row">
              <a href="plant-detail.html?id=${item.plantId}" class="sc-card-title">${escapeHtml(item.plantName)}</a>
              ${renderStatusBadge(item.status)}
            </div>
            <div class="sc-card-sub">
              <span><i class="bi bi-geo-alt-fill"></i> ${escapeHtml(item.location)}</span>
              <span><i class="bi bi-tag-fill"></i> ${escapeHtml(item.category)}</span>
            </div>
          </div>
        </div>

        <div class="sc-card-body">
          <div class="sc-date-highlight">
            <div class="sc-date-main">
              <div class="sc-date-icon"><i class="bi ${primaryIcon}"></i></div>
              <div>
                <div class="sc-date-label">${nextLabel}</div>
                <div class="sc-date-value">${formatDateId(item.nextDate)}</div>
              </div>
            </div>
            <span class="sc-date-relative">${formatRelativeDate(item.nextDate, item.status)}</span>
          </div>

          ${fertilizerBlock}

          <div class="sc-meta-grid">
            <div class="sc-meta-item">
              <span class="sc-meta-label"><i class="bi bi-arrow-repeat"></i> Frekuensi</span>
              <span class="sc-meta-val">Setiap ${item.frequency} hari</span>
            </div>
            <div class="sc-meta-item">
              <span class="sc-meta-label"><i class="bi bi-clock"></i> Waktu Anjuran</span>
              <span class="sc-meta-val">${escapeHtml(item.timeSlot)}</span>
            </div>
            <div class="sc-meta-item" style="grid-column: span 2;">
              <span class="sc-meta-label"><i class="bi bi-calendar-check"></i> ${lastLabel}</span>
              <span class="sc-meta-val">${formatDateId(item.lastDate)}</span>
            </div>
          </div>

          ${notesBlock}
        </div>

        <div class="sc-card-footer">
          <button type="button"
                  class="sc-btn-complete ${isCompleted ? 'is-done' : ''}"
                  data-action="toggle-complete"
                  data-plant-id="${item.plantId}">
            ${completeBtnText}
          </button>
          <div class="sc-footer-icons">
            <button type="button"
                    class="sc-icon-btn"
                    title="Ubah Jadwal"
                    aria-label="Ubah jadwal ${escapeHtml(item.plantName)}"
                    data-action="edit-schedule"
                    data-plant-id="${item.plantId}">
              <i class="bi bi-calendar2-week"></i>
            </button>
            <a href="plant-detail.html?id=${item.plantId}"
               class="sc-icon-btn"
               title="Lihat Detail Tanaman"
               aria-label="Detail ${escapeHtml(item.plantName)}">
              <i class="bi bi-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Merender daftar Kartu Jadwal ke kontainer grid dan memasang delegasi aksi.
   */
  function renderList(containerEl, items, options) {
    if (!containerEl) return;
    containerEl.innerHTML = items.map(item => buildCard(item, options)).join('');

    if (!containerEl.dataset.scBound) {
      containerEl.dataset.scBound = '1';
      containerEl.addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const plantId = parseInt(btn.dataset.plantId, 10);
        if (isNaN(plantId)) return;

        if (action === 'toggle-complete' && typeof containerEl._onToggleComplete === 'function') {
          containerEl._onToggleComplete(plantId);
        } else if (action === 'edit-schedule' && typeof containerEl._onEdit === 'function') {
          containerEl._onEdit(plantId);
        }
      });
    }

    containerEl._onToggleComplete = options && options.onToggleComplete;
    containerEl._onEdit = options && options.onEdit;
  }

  // ── Toast Notifikasi ────────────────────────────────────────────────────────

  let toastTimer = null;

  function showToast(message) {
    let toast = document.getElementById('sc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sc-toast';
      toast.className = 'sc-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="bi bi-check-circle-fill"></i><span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ── Ekspor Modul Global ─────────────────────────────────────────────────────

  global.ScheduleCard = {
    STATUS_META,
    FALLBACK_PLANT_IMG,
    escapeHtml,
    getTodayIso,
    addDaysIso,
    diffFromToday,
    formatDateId,
    formatRelativeDate,
    computeStatus,
    renderStatusBadge,
    loadSchedules,
    toggleComplete,
    updateScheduleItem,
    countByStatus,
    filterAndSort,
    buildCard,
    renderList,
    showToast,
  };
})(window);
