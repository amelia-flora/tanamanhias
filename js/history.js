/* ========================================
   PlantCare – Riwayat Perawatan (history.js)
   Member 3
   Memakai data bersama dari dummy-data.js: careHistories, plants, getPlantById.
   Data diubah IN-PLACE (push/splice) agar tidak bentrok dengan deklarasi di dummy-data.js.
   Perubahan hanya tersimpan di memori (hilang saat refresh) – cukup untuk presentasi.
   ======================================== */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Nilai di data tetap "Watering"/"Fertilizing"; hanya tampilannya diterjemahkan.
  const TYPE_LABEL = { Watering: "Penyiraman", Fertilizing: "Pemupukan" };
  const TYPE_ICON = { Watering: "bi-droplet-fill", Fertilizing: "bi-moisture" };
  // dummy-data.js bisa memakai "Watering"/"Fertilizing" (README) atau "Penyiraman"/"Pemupukan".
  // Semua dinormalisasi ke "Watering"/"Fertilizing" untuk filter, ikon, dan label.
  const normType = (t) => { const l = String(t || "").toLowerCase(); return /siram|water/.test(l) ? "Watering" : /pupuk|fertil/.test(l) ? "Fertilizing" : "Other"; };
  // Saat menyimpan, ikuti gaya penulisan yang dipakai data yang sudah ada.
  const dataIsIndonesian = () => careHistories.some((h) => /siram|pupuk/i.test(h.type));
  const storeType = (t) => (dataIsIndonesian() ? TYPE_LABEL[t] : t);
  const sameId = (a, b) => String(a) === String(b);
  const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  // Simpan ke localStorage bila fungsi bersama tersedia di dummy-data.js
  const persist = () => { if (typeof saveCareHistoriesToStorage === "function") saveCareHistoriesToStorage(); };

  let editId = null;
  let deleteId = null;

  function plantName(id) {
    const p = getPlantById(id);
    return p ? p.name : "Tanaman tidak diketahui";
  }

  function fillPlantSelects() {
    $("ch-plant").innerHTML = '<option value="">Semua tanaman</option>' +
      plants.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
    $("ch-f-plant").innerHTML = plants.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
  }

  function renderStats() {
    const now = new Date();
    const ym = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const count = (fn) => careHistories.filter(fn).length;
    const items = [
      ["bi-clock-history", "Total Riwayat", careHistories.length],
      ["bi-droplet-fill", "Penyiraman", count((h) => normType(h.type) === "Watering")],
      ["bi-moisture", "Pemupukan", count((h) => normType(h.type) === "Fertilizing")],
      ["bi-calendar-check", "Bulan Ini", count((h) => String(h.date).startsWith(ym))],
    ];
    $("ch-stats").innerHTML = items.map((i) =>
      `<div class="ch-stat"><div class="ch-stat-icon"><i class="bi ${i[0]}"></i></div><div><span>${i[1]}</span><strong>${i[2]}</strong></div></div>`).join("");
  }

  function render() {
    const q = $("ch-search").value.trim().toLowerCase();
    const type = $("ch-type").value;
    const plant = $("ch-plant").value;
    const sort = $("ch-sort").value;

    const rows = careHistories
      .filter((h) => (!type || normType(h.type) === type) && (!plant || sameId(h.plantId, plant)) &&
        (!q || (plantName(h.plantId) + " " + (h.notes || "")).toLowerCase().includes(q)))
      .sort((a, b) => (sort === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

    $("ch-body").innerHTML = rows.length ? rows.map((h) => {
      const p = getPlantById(h.plantId);
      const img = p && p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : "";
      return `<tr>
        <td>${esc(fmtDate(h.date))}</td>
        <td><div class="ch-plant">${img}<span>${esc(plantName(h.plantId))}</span></div></td>
        <td><span class="ch-type"><i class="bi ${TYPE_ICON[normType(h.type)] || "bi-clipboard-check"}"></i>${esc(TYPE_LABEL[normType(h.type)] || h.type)}</span></td>
        <td class="ch-notes">${esc(h.notes) || "–"}</td>
        <td><span class="badge-status completed">Selesai</span></td>
        <td class="ch-act">
          <button class="ch-btn ch-btn-sm" data-edit="${h.id}"><i class="bi bi-pencil"></i> Ubah</button>
          <button class="ch-btn ch-btn-sm ch-btn-icon-del" data-del="${h.id}" aria-label="Hapus"><i class="bi bi-trash"></i></button>
        </td></tr>`;
    }).join("") : `<tr><td colspan="6" class="ch-empty"><i class="bi bi-clipboard-x" style="font-size:36px;display:block;margin-bottom:8px;opacity:.5"></i>Tidak ada riwayat yang cocok.</td></tr>`;

    $("ch-count").textContent = "Menampilkan " + rows.length + " dari " + careHistories.length + " riwayat";
    renderStats();
  }

  function openForm(id) {
    editId = id;
    const h = careHistories.find((x) => sameId(x.id, id));
    $("ch-modal-title").textContent = h ? "Ubah Riwayat" : "Tambah Riwayat";
    $("ch-f-plant").value = String(h ? h.plantId : plants[0].id);
    $("ch-f-type").value = h ? normType(h.type) : "Watering";
    $("ch-f-date").value = h ? h.date : new Date().toISOString().slice(0, 10);
    $("ch-f-notes").value = h ? h.notes || "" : "";
    $("ch-error").textContent = "";
    $("ch-modal").hidden = false;
  }

  function save() {
    const chosen = plants.find((p) => sameId(p.id, $("ch-f-plant").value));
    const rec = {
      plantId: chosen ? chosen.id : null,
      type: storeType($("ch-f-type").value),
      date: $("ch-f-date").value,
      notes: $("ch-f-notes").value.trim(),
      status: "completed",
    };
    if (rec.plantId == null || !rec.date) { $("ch-error").textContent = "Tanaman dan tanggal wajib diisi."; return; }
    if (editId) {
      Object.assign(careHistories.find((x) => sameId(x.id, editId)), rec);
    } else {
      const nextId = careHistories.reduce((m, h) => Math.max(m, Number(h.id) || 0), 0) + 1;
      careHistories.push(Object.assign({ id: nextId }, rec));
    }
    $("ch-modal").hidden = true;
    persist();
    render();
  }

  function init() {
    fillPlantSelects();
    render();
    ["ch-search", "ch-type", "ch-plant", "ch-sort"].forEach((id) => $(id).addEventListener("input", render));
    $("ch-add").addEventListener("click", () => openForm(null));
    $("ch-cancel").addEventListener("click", () => { $("ch-modal").hidden = true; });
    $("ch-save").addEventListener("click", save);

    $("ch-body").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.edit) openForm(b.dataset.edit);
      if (b.dataset.del) {
        deleteId = b.dataset.del;
        const h = careHistories.find((x) => sameId(x.id, deleteId));
        $("ch-del-text").textContent = "Riwayat " + (TYPE_LABEL[normType(h.type)] || h.type).toLowerCase() + " untuk " + plantName(h.plantId) + " (" + fmtDate(h.date) + ") akan dihapus.";
        $("ch-del-modal").hidden = false;
      }
    });
    $("ch-del-no").addEventListener("click", () => { $("ch-del-modal").hidden = true; });
    $("ch-del-yes").addEventListener("click", () => {
      const i = careHistories.findIndex((x) => sameId(x.id, deleteId));
      if (i > -1) careHistories.splice(i, 1);
      $("ch-del-modal").hidden = true;
      persist();
      render();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { $("ch-modal").hidden = true; $("ch-del-modal").hidden = true; }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();