/**
 * PlantCare – Data Dummy (dummy-data.js)
 *
 * BERKAS DATA BERSAMA – Digunakan oleh seluruh anggota tim (Anggota 1, 2, dan 3).
 *
 * CARA ANGGOTA LAIN MENGGUNAKAN DATA INI:
 * ──────────────────────────────────────────
 * 1. Sertakan skrip ini SEBELUM skrip halaman masing-masing:
 *    <script src="js/dummy-data.js"></script>
 *    <script src="js/skrip-kamu.js"></script>
 *
 * 2. Akses data melalui variabel global:
 *    - `plants`                 → Larik data objek tanaman
 *    - `wateringSchedules`      → Larik jadwal penyiraman
 *    - `fertilizingSchedules`   → Larik jadwal pemupukan
 *    - `careHistories`          → Larik riwayat perawatan
 *    - `dashboardStats`         → Total statistik yang sudah dihitung
 *    - `todaySchedule`          → Jadwal perawatan hari ini
 *    - `upcomingActivities`     → Jadwal perawatan beberapa hari ke depan
 *
 * 3. Seluruh tanggal dihitung relatif terhadap HARI INI secara dinamis,
 *    sehingga jadwal selalu realistis kapan pun website dibuka.
 *    Fungsi bantuan: `relDate(offset)` mengembalikan format tanggal ISO YYYY-MM-DD.
 */

// ── Fungsi Bantuan Tanggal ───────────────────────────────────────────────────
function relDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDateDisplay(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Foto Tanaman Asli (Aset Lokal Berkualitas Tinggi) ─────────────────────────
const PLANT_IMAGES = {
  monstera:     'assets/images/monstera.jpg',
  pothos:       'assets/images/pothos.jpg',
  snake:        'assets/images/snake.jpg',
  peacelily:    'assets/images/peacelily.jpg',
  calathea:     'assets/images/calathea.jpg',
  philodendron: 'assets/images/philodendron.jpg',
  zz:           'assets/images/zz.jpg',
  fiddle:       'assets/images/fiddle.jpg',
  welcome:      'assets/images/rosepink.jpg',
};

// ── Koleksi Data Tanaman ─────────────────────────────────────────────────────
const plants = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Tanaman Tropis",
    image: PLANT_IMAGES.monstera,
    location: "Ruang Tamu",
    acquiredDate: relDate(-320),
    description: "Monstera Deliciosa, atau sering dikenal sebagai Janda Bolong / Swiss Cheese Plant, adalah tanaman tropis populer dengan daun mengilap berlubang dan belah alami yang memukau. Tumbuh subur di area terang dengan cahaya tidak langsung.",
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    fertilizerType: "Pupuk Cair Organik",
    nextWateringDate: relDate(0),
    nextFertilizingDate: relDate(5),
    lastWateringDate: relDate(-7),
    lastFertilizingDate: relDate(-25),
  },
  {
    id: 2,
    name: "Golden Pothos",
    category: "Tanaman Indoor",
    image: PLANT_IMAGES.pothos,
    location: "Kamar Tidur",
    acquiredDate: relDate(-210),
    description: "Sirih Gading (Golden Pothos) adalah tanaman hias yang sangat mudah dirawat, berdaun bentuk hati dengan semburat kuning keemasan. Sangat pemaaf, cocok untuk pemula, dan mampu tumbuh subur dalam berbagai tingkat pencahayaan ruangan.",
    wateringFrequency: 10,
    fertilizingFrequency: 45,
    fertilizerType: "Pupuk NPK Seimbang",
    nextWateringDate: relDate(0),
    nextFertilizingDate: relDate(18),
    lastWateringDate: relDate(-10),
    lastFertilizingDate: relDate(-27),
  },
  {
    id: 3,
    name: "Snake Plant",
    category: "Tanaman Indoor",
    image: PLANT_IMAGES.snake,
    location: "Ruang Kerja",
    acquiredDate: relDate(-180),
    description: "Lidah Mertua (Sansevieria) adalah tanaman sukulen tangguh dengan daun tegak kaku menyerupai pedang. Efektif menyaring racun dan memurnikan udara ruangan, serta sangat toleran terhadap kelalaian penyiraman dan cahaya redup.",
    wateringFrequency: 14,
    fertilizingFrequency: 60,
    fertilizerType: "Pupuk Butir Slow-release",
    nextWateringDate: relDate(4),
    nextFertilizingDate: relDate(22),
    lastWateringDate: relDate(-10),
    lastFertilizingDate: relDate(-38),
  },
  {
    id: 4,
    name: "Peace Lily",
    category: "Tanaman Hias Daun",
    image: PLANT_IMAGES.peacelily,
    location: "Kamar Mandi",
    acquiredDate: relDate(-140),
    description: "Lili Perdamaian (Peace Lily) adalah tanaman anggun dengan daun hijau gelap mengilap dan kelopak bunga putih yang menawan. Menyukai kelembapan tinggi dan tempat teduh, sangat ideal mempercantik sudut kamar mandi atau meja kerja.",
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    fertilizerType: "Pupuk Cair Organik",
    nextWateringDate: relDate(0),
    nextFertilizingDate: relDate(10),
    lastWateringDate: relDate(-7),
    lastFertilizingDate: relDate(-20),
  },
  {
    id: 5,
    name: "Calathea Orbifolia",
    category: "Tanaman Tropis",
    image: PLANT_IMAGES.calathea,
    location: "Ruang Makan",
    acquiredDate: relDate(-95),
    description: "Calathea Orbifolia dikagumi karena daun bundarnya yang lebar dengan pola garis perak kehijauan yang simetris. Tanaman ini menyukai kelembapan udara yang stabil dan tanah yang tetap lembap tanpa tergenang.",
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    fertilizerType: "Pupuk Cair Konsentrasi Rendah",
    nextWateringDate: relDate(2),
    nextFertilizingDate: relDate(14),
    lastWateringDate: relDate(-5),
    lastFertilizingDate: relDate(-16),
  },
  {
    id: 6,
    name: "Philodendron Brasil",
    category: "Tanaman Tropis",
    image: PLANT_IMAGES.philodendron,
    location: "Dapur",
    acquiredDate: relDate(-75),
    description: "Philodendron Brasil adalah tanaman merambat yang cantik dengan daun berbentuk hati berpadu warna hijau zamrud dan semburat kuning cerah di bagian tengahnya. Sangat cocok ditempatkan pada pot gantung atau dirambatkan.",
    wateringFrequency: 10,
    fertilizingFrequency: 30,
    fertilizerType: "Pupuk Cair Organik",
    nextWateringDate: relDate(3),
    nextFertilizingDate: relDate(8),
    lastWateringDate: relDate(-7),
    lastFertilizingDate: relDate(-22),
  },
  {
    id: 7,
    name: "ZZ Plant",
    category: "Tanaman Hias Daun",
    image: PLANT_IMAGES.zz,
    location: "Ruang Kerja",
    acquiredDate: relDate(-250),
    description: "Tanaman Dolar (ZZ Plant) memiliki daya tahan luar biasa dengan daun tebal mengilap seperti lilin. Rimpang bawah tanahnya menyimpan cadangan air yang banyak, membuatnya tahan tidak disiram selama berminggu-minggu.",
    wateringFrequency: 21,
    fertilizingFrequency: 60,
    fertilizerType: "Pupuk NPK Seimbang",
    nextWateringDate: relDate(7),
    nextFertilizingDate: relDate(30),
    lastWateringDate: relDate(-14),
    lastFertilizingDate: relDate(-30),
  },
  {
    id: 8,
    name: "Fiddle Leaf Fig",
    category: "Tanaman Hias Daun",
    image: PLANT_IMAGES.fiddle,
    location: "Ruang Tamu",
    acquiredDate: relDate(-400),
    description: "Ketapang Biola (Fiddle Leaf Fig) adalah tanaman aksen dramatis berdaun lebar menyerupai biola dengan struktur pohon yang kokoh. Memberikan kesan estetis, mewah, dan natural pada interior bergaya modern minimalis.",
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    fertilizerType: "Pupuk Cair Organik",
    nextWateringDate: relDate(1),
    nextFertilizingDate: relDate(12),
    lastWateringDate: relDate(-6),
    lastFertilizingDate: relDate(-18),
  },
];

// ── Jadwal Penyiraman (Watering Schedules) ───────────────────────────────────
const wateringSchedules = plants.map(p => ({
  id: p.id,
  plantId: p.id,
  plantName: p.name,
  plantImage: p.image,
  frequency: p.wateringFrequency,
  nextDate: p.nextWateringDate,
  lastDate: p.lastWateringDate,
  status: (() => {
    const diff = (new Date(p.nextWateringDate) - new Date()) / 86400000;
    if (diff < 0)  return 'overdue';
    if (diff <= 0.9) return 'due-today';
    return 'upcoming';
  })(),
  notes: "",
}));

// ── Jadwal Pemupukan (Fertilizing Schedules) ──────────────────────────────────
const fertilizingSchedules = plants.map(p => ({
  id: p.id,
  plantId: p.id,
  plantName: p.name,
  plantImage: p.image,
  fertilizerType: p.fertilizerType,
  frequency: p.fertilizingFrequency,
  nextDate: p.nextFertilizingDate,
  lastDate: p.lastFertilizingDate,
  status: (() => {
    const diff = (new Date(p.nextFertilizingDate) - new Date()) / 86400000;
    if (diff < 0)  return 'overdue';
    if (diff <= 0.9) return 'due-today';
    return 'upcoming';
  })(),
  notes: "",
}));

// ── Riwayat Perawatan (Care Histories) ───────────────────────────────────────
const careHistories = [
  // Monstera
  { id: 101, plantId: 1, type: "Penyiraman", date: relDate(-7),  notes: "Permukaan tanah kering, disiram sampai air mengalir ke tatakan pot.", status: "completed" },
  { id: 102, plantId: 1, type: "Pemupukan",  date: relDate(-25), notes: "Diberi pupuk cair organik terlarut dosis ringan.", status: "completed" },
  { id: 103, plantId: 1, type: "Penyiraman", date: relDate(-14), notes: "Jadwal penyiraman mingguan rutin.", status: "completed" },
  // Pothos
  { id: 201, plantId: 2, type: "Penyiraman", date: relDate(-10), notes: "Daun agak merunduk, disiram secukupnya langsung segar kembali.", status: "completed" },
  { id: 202, plantId: 2, type: "Pemupukan",  date: relDate(-27), notes: "Diberi pupuk NPK seimbang untuk pertumbuhan daun.", status: "completed" },
  { id: 203, plantId: 2, type: "Penyiraman", date: relDate(-20), notes: "Penyiraman rutin kamar tidur.", status: "completed" },
  // Snake Plant
  { id: 301, plantId: 3, type: "Penyiraman", date: relDate(-10), notes: "Media tanam dipastikan benar-benar kering sebelum disiram.", status: "completed" },
  { id: 302, plantId: 3, type: "Pemupukan",  date: relDate(-38), notes: "Aplikasi pupuk butir pelepasan lambat di permukaan pot.", status: "completed" },
  { id: 303, plantId: 3, type: "Penyiraman", date: relDate(-24), notes: "Penyiraman menyeluruh dan pembuangan sisa air di tatakan.", status: "completed" },
  // Peace Lily
  { id: 401, plantId: 4, type: "Penyiraman", date: relDate(-7),  notes: "Disiram dan daun disemprot halus untuk menjaga kelembapan.", status: "completed" },
  { id: 402, plantId: 4, type: "Pemupukan",  date: relDate(-20), notes: "Diberi nutrisi cair organik dosis setengah.", status: "completed" },
  { id: 403, plantId: 4, type: "Penyiraman", date: relDate(-14), notes: "Penyiraman berkala.", status: "completed" },
  // Calathea
  { id: 501, plantId: 5, type: "Penyiraman", date: relDate(-5),  notes: "Menggunakan air endapan bebas kaporit agar ujung daun tidak kecokelatan.", status: "completed" },
  { id: 502, plantId: 5, type: "Pemupukan",  date: relDate(-16), notes: "Pemupukan daun konsentrasi sangat ringan.", status: "completed" },
  { id: 503, plantId: 5, type: "Penyiraman", date: relDate(-12), notes: "Menjaga tanah tetap gembur dan lembap.", status: "completed" },
  // Philodendron
  { id: 601, plantId: 6, type: "Penyiraman", date: relDate(-7),  notes: "Cek tanah 5 cm ke dalam, sudah kering lalu disiram.", status: "completed" },
  { id: 602, plantId: 6, type: "Pemupukan",  date: relDate(-22), notes: "Pemupukan bulanan untuk tunas daun baru.", status: "completed" },
  { id: 603, plantId: 6, type: "Penyiraman", date: relDate(-17), notes: "Pertumbuhan sulur baru terlihat sangat aktif.", status: "completed" },
  // ZZ Plant
  { id: 701, plantId: 7, type: "Penyiraman", date: relDate(-14), notes: "Tanah sangat kering, disiram perlahan secara merata.", status: "completed" },
  { id: 702, plantId: 7, type: "Pemupukan",  date: relDate(-30), notes: "Diberi pupuk NPK seimbang dosis ringan.", status: "completed" },
  { id: 703, plantId: 7, type: "Penyiraman", date: relDate(-35), notes: "Siklus penyiraman berkala.", status: "completed" },
  // Fiddle Leaf Fig
  { id: 801, plantId: 8, type: "Penyiraman", date: relDate(-6),  notes: "Disiram hingga merata dan daun dilap bersih dari debu.", status: "completed" },
  { id: 802, plantId: 8, type: "Pemupukan",  date: relDate(-18), notes: "Aplikasi nutrisi cair organik bulanan.", status: "completed" },
  { id: 803, plantId: 8, type: "Penyiraman", date: relDate(-13), notes: "Kuncup daun baru mulai merekah dengan sehat!", status: "completed" },
];

// ── Statistik Dashboard ───────────────────────────────────────────────────────
const dashboardStats = {
  totalPlants: plants.length,
  needWatering: wateringSchedules.filter(s => s.status === 'due-today' || s.status === 'overdue').length,
  needFertilizing: fertilizingSchedules.filter(s => s.status === 'due-today' || s.status === 'overdue').length,
  completedToday: careHistories.filter(h => h.date === relDate(0)).length || 8,
};

// ── Jadwal Hari Ini untuk Dashboard ──────────────────────────────────────────
const todaySchedule = [
  ...wateringSchedules.filter(s => s.status === 'due-today' || s.status === 'overdue')
    .slice(0,3)
    .map(s => ({ plantId: s.plantId, plantName: s.plantName, plantImage: s.plantImage, type: 'Penyiraman', time: 'Pagi Hari', status: s.status })),
  ...fertilizingSchedules.filter(s => s.status === 'due-today' || s.status === 'overdue')
    .slice(0,2)
    .map(s => ({ plantId: s.plantId, plantName: s.plantName, plantImage: s.plantImage, type: 'Pemupukan', time: 'Sore Hari', status: s.status })),
  { plantId: 2, plantName: 'Golden Pothos', plantImage: plants[1].image, type: 'Penyiraman', time: 'Pagi Hari', status: 'completed' },
];

// ── Aktivitas Mendatang untuk Dashboard ──────────────────────────────────────
const upcomingActivities = [
  ...wateringSchedules.filter(s => s.status === 'upcoming').slice(0, 4)
    .map(s => ({ plantName: s.plantName, type: 'Penyiraman', date: s.nextDate })),
  ...fertilizingSchedules.filter(s => s.status === 'upcoming').slice(0, 3)
    .map(s => ({ plantName: s.plantName, type: 'Pemupukan', date: s.nextDate })),
].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 7);

// ── Fungsi Bantuan untuk Halaman Lain ─────────────────────────────────────────
function getPlantById(id) {
  return plants.find(p => p.id === parseInt(id));
}

function getCareHistoryByPlant(plantId) {
  return careHistories.filter(h => h.plantId === parseInt(plantId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getWateringByPlant(plantId) {
  return wateringSchedules.find(s => s.plantId === parseInt(plantId));
}

function getFertilizingByPlant(plantId) {
  return fertilizingSchedules.find(s => s.plantId === parseInt(plantId));
}


// ── Persistensi localStorage ──────────────────────────────────────────────────
// Muat tanaman yang tersimpan dari sesi sebelumnya (dari CRUD)
(function () {
  try {
    const defaultImageMap = {
      1: PLANT_IMAGES.monstera,
      2: PLANT_IMAGES.pothos,
      3: PLANT_IMAGES.snake,
      4: PLANT_IMAGES.peacelily,
      5: PLANT_IMAGES.calathea,
      6: PLANT_IMAGES.philodendron,
      7: PLANT_IMAGES.zz,
      8: PLANT_IMAGES.fiddle,
    };

    const saved = localStorage.getItem('plantcare_plants');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ganti isi array global dengan data tersimpan
        plants.length = 0;
        parsed.forEach(function (p) {
          // Perbarui foto tanaman bawaan ke foto lokal asli jika masih URL lama
          if (defaultImageMap[p.id] && (!p.image || p.image.includes('unsplash.com') || p.image.includes('photo-') || !p.image.startsWith('assets/images/'))) {
            p.image = defaultImageMap[p.id];
          }
          plants.push(p);
        });
        localStorage.setItem('plantcare_plants', JSON.stringify(plants));
      }
    }
  } catch (e) {
    // Abaikan error – gunakan data dummy bawaan
  }
})();

function savePlantsToStorage() {
  try {
    localStorage.setItem('plantcare_plants', JSON.stringify(plants));
  } catch (e) {}
}

function resetPlantsStorage() {
  localStorage.removeItem('plantcare_plants');
  location.reload();
}
