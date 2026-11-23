/**
 * PlantCare – Plants JS (plants.js)
 * Merender grid tanaman, pencarian, filter, dan CRUD di plants.html.
 */

(function () {
  'use strict';

  let currentSearch   = '';
  let currentCategory = 'all';
  let plantIdToDelete = null;
  let nextId = plants.length > 0 ? Math.max(...plants.map(x => x.id)) + 1 : 1;

  // Gradien warna matcha per kartu
  const CARD_GRADIENTS = [
    'linear-gradient(140deg, #CCEAAA 0%, #8CC870 100%)',
    'linear-gradient(140deg, #AADA88 0%, #5A8A38 100%)',
    'linear-gradient(140deg, #DCEFC0 0%, #AADA88 100%)',
    'linear-gradient(140deg, #EAF7CE 0%, #CCEAAA 100%)',
    'linear-gradient(140deg, #B8E088 0%, #8CC870 100%)',
    'linear-gradient(140deg, #CCEAAA 0%, #4A7A30 100%)',
    'linear-gradient(140deg, #DCEFC0 0%, #8CC870 100%)',
    'linear-gradient(140deg, #EAF7CE 0%, #AADA88 100%)',
  ];

  // ── Format label penyiraman berikutnya ──────────────────────────────────
  function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(d); target.setHours(0,0,0,0);
    const diff = Math.round((target - today) / 86400000);
    if (diff === 0) return 'Hari Ini';
    if (diff === 1) return 'Besok';
    if (diff < 0)  return `${Math.abs(diff)} hari terlambat`;
    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  }

  // ── Bangun HTML kartu tanaman ─────────────────────────────────────────────
  function buildCard(plant) {
    const gradient = CARD_GRADIENTS[(plant.id - 1) % CARD_GRADIENTS.length];
    return `
      <div class="plant-card-wrapper">
        <a href="plant-detail.html?id=${plant.id}" class="plant-card">
          <div class="plant-card-img-wrap" style="background:${gradient}">
            <div class="plant-card-bg-fallback"><i class="bi bi-flower2"></i></div>
            <img class="plant-card-img"
                 src="${plant.image}"
                 alt="${plant.name}"
                 loading="lazy"
                 onerror="this.style.opacity=0">
            <span class="plant-card-category">${plant.category}</span>
          </div>
          <div class="plant-card-body">
            <div class="plant-card-name">${plant.name}</div>
            <div class="plant-card-meta"><i class="bi bi-geo-alt-fill"></i> ${plant.location}</div>
            <div class="plant-card-meta"><i class="bi bi-arrow-repeat"></i> Setiap ${plant.wateringFrequency} hari</div>
          </div>
          <div class="plant-card-footer">
            <div class="plant-card-water">
              <i class="bi bi-droplet-fill"></i>
              <span>${formatDate(plant.nextWateringDate)}</span>
            </div>
            <span class="plant-card-btn">Lihat Detail <i class="bi bi-arrow-right"></i></span>
          </div>
        </a>
        <!-- Tombol CRUD -->
        <div class="plant-card-actions">
          <button class="card-action-btn edit-btn" title="Edit" onclick="openPlantModal(${plant.id})">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="card-action-btn delete-btn" title="Hapus" onclick="openDeleteModal(${plant.id})">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ── Filter & render grid ───────────────────────────────────────────────────
  function renderGrid() {
    const grid     = document.getElementById('plants-grid');
    const emptyEl  = document.getElementById('plants-empty');
    const countEl  = document.getElementById('plants-count');
    if (!grid) return;

    const filtered = plants.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(currentSearch) ||
                          p.category.toLowerCase().includes(currentSearch) ||
                          p.location.toLowerCase().includes(currentSearch);
      const matchCat    = currentCategory === 'all' ||
                          p.category.toLowerCase().replace(/\s+/g,'-') === currentCategory;
      return matchSearch && matchCat;
    });

    if (countEl) countEl.textContent = `${filtered.length} Tanaman`;

    if (!filtered.length) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    grid.innerHTML = filtered.map(buildCard).join('');
  }

  // ── Isi dropdown kategori ─────────────────────────────────────────────────
  function populateCategories() {
    const sel = document.getElementById('category-filter');
    if (!sel) return;
    // Hapus opsi kecuali "Semua Kategori"
    while (sel.options.length > 1) sel.remove(1);
    const cats = [...new Set(plants.map(p => p.category))].sort();
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.toLowerCase().replace(/\s+/g, '-');
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  }

  // ── Event listeners pencarian & filter ───────────────────────────────────
  function bindEvents() {
    const searchInput = document.getElementById('search-input');
    const catFilter   = document.getElementById('category-filter');

    searchInput && searchInput.addEventListener('input', e => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderGrid();
    });

    catFilter && catFilter.addEventListener('change', e => {
      currentCategory = e.target.value;
      renderGrid();
    });
  }

  // ══════════════════════════════════════════════════
  //  CRUD – TAMBAH / EDIT TANAMAN
  // ══════════════════════════════════════════════════

  window.openPlantModal = function (plantId) {
    const overlay    = document.getElementById('crud-modal-overlay');
    const title      = document.getElementById('modal-title');
    const form       = document.getElementById('plant-form');
    const btnSimpan  = document.getElementById('btn-simpan');

    form.reset();
    document.getElementById('form-plant-id').value = '';

    if (plantId) {
      // Mode Edit
      const p = plants.find(x => x.id === plantId);
      if (!p) return;
      title.textContent = 'Edit Tanaman';
      btnSimpan.innerHTML = '<i class="bi bi-check-lg"></i> Perbarui';
      document.getElementById('form-plant-id').value      = p.id;
      document.getElementById('form-name').value           = p.name;
      document.getElementById('form-category').value       = p.category;
      document.getElementById('form-location').value       = p.location;
      document.getElementById('form-acquired').value       = p.acquiredDate || '';
      document.getElementById('form-description').value    = p.description || '';
      document.getElementById('form-watering-freq').value  = p.wateringFrequency;
      document.getElementById('form-fertilizing-freq').value = p.fertilizingFrequency;
      document.getElementById('form-fertilizer-type').value = p.fertilizerType || '';
      document.getElementById('form-image').value          = p.image || '';
    } else {
      // Mode Tambah
      title.textContent = 'Tambah Tanaman';
      btnSimpan.innerHTML = '<i class="bi bi-check-lg"></i> Simpan';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closePlantModal = function (event, force) {
    if (!force && event && event.target !== document.getElementById('crud-modal-overlay')) return;
    document.getElementById('crud-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
  };

  window.savePlant = function (event) {
    event.preventDefault();
    const id              = document.getElementById('form-plant-id').value;
    const name            = document.getElementById('form-name').value.trim();
    const category        = document.getElementById('form-category').value;
    const location        = document.getElementById('form-location').value.trim();
    const acquiredDate    = document.getElementById('form-acquired').value || relDate(0);
    const description     = document.getElementById('form-description').value.trim();
    const wateringFreq    = parseInt(document.getElementById('form-watering-freq').value);
    const fertilizingFreq = parseInt(document.getElementById('form-fertilizing-freq').value);
    const fertilizerType  = document.getElementById('form-fertilizer-type').value.trim() || 'Pupuk Cair Organik';
    const image           = document.getElementById('form-image').value.trim() ||
                            'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80';

    if (id) {
      // Update tanaman yang ada
      const idx = plants.findIndex(x => x.id === parseInt(id));
      if (idx !== -1) {
        plants[idx] = {
          ...plants[idx],
          name, category, location, acquiredDate, description,
          wateringFrequency: wateringFreq,
          fertilizingFrequency: fertilizingFreq,
          fertilizerType, image,
          nextWateringDate:   relDate(wateringFreq),
          nextFertilizingDate: relDate(fertilizingFreq),
        };
      }
    } else {
      // Tambah tanaman baru
      const newPlant = {
        id: nextId++,
        name, category, image, location, acquiredDate, description,
        wateringFrequency: wateringFreq,
        fertilizingFrequency: fertilizingFreq,
        fertilizerType,
        nextWateringDate:    relDate(wateringFreq),
        nextFertilizingDate: relDate(fertilizingFreq),
        lastWateringDate:    relDate(-wateringFreq),
        lastFertilizingDate: relDate(-fertilizingFreq),
      };
      plants.push(newPlant);
    }

    closePlantModal(null, true);
    populateCategories();
    renderGrid();
    savePlantsToStorage();
  };

  // ══════════════════════════════════════════════════
  //  CRUD – HAPUS TANAMAN
  // ══════════════════════════════════════════════════

  window.openDeleteModal = function (plantId) {
    plantIdToDelete = plantId;
    const p = plants.find(x => x.id === plantId);
    const msg = document.getElementById('delete-modal-msg');
    if (msg && p) {
      msg.textContent = `Apakah kamu yakin ingin menghapus "${p.name}"? Tindakan ini tidak dapat dibatalkan.`;
    }
    document.getElementById('delete-modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeDeleteModal = function (event, force) {
    if (!force && event && event.target !== document.getElementById('delete-modal-overlay')) return;
    document.getElementById('delete-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
    plantIdToDelete = null;
  };

  window.confirmDelete = function () {
    if (plantIdToDelete === null) return;
    const idx = plants.findIndex(x => x.id === plantIdToDelete);
    if (idx !== -1) plants.splice(idx, 1);
    closeDeleteModal(null, true);
    populateCategories();
    renderGrid();
    savePlantsToStorage();
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderGrid();
    bindEvents();
  });
})();
