# 🌿 PlantCare – Plant Care Tracker Website

A modern, minimalist plant care tracker built with **HTML5, CSS3, and Vanilla JavaScript**.

---

## 📁 Project Structure

```
plantcare/
│
├── index.html          ← Dashboard (Member 1)
├── plants.html         ← My Plants collection (Member 1)
├── plant-detail.html   ← Plant detail view (Member 1)
├── watering.html       ← Watering Schedule (Member 2 – not yet created)
├── fertilizing.html    ← Fertilizing Schedule (Member 2 – not yet created)
├── history.html        ← Care History (Member 3 – not yet created)
│
├── assets/
│   ├── images/         ← Local image assets (optional; pages use Unsplash CDN)
│   └── icons/          ← Local icon assets (optional; pages use Bootstrap Icons CDN)
│
├── css/
│   ├── style.css       ← Global styles, layout, sidebar, header (shared)
│   ├── dashboard.css   ← Dashboard-specific styles (Member 1)
│   └── plants.css      ← Plants & detail page styles (Member 1)
│
├── js/
│   ├── dummy-data.js   ← 🔑 SHARED data file – used by all three members
│   ├── main.js         ← Shared JS: sidebar toggle, active nav, topbar date
│   ├── dashboard.js    ← Dashboard rendering (Member 1)
│   └── plants.js       ← Plants page rendering & filtering (Member 1)
│
└── README.md
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Green | `#78977A` |
| Dark Green | `#344E41` |
| Light Green | `#E8F0E7` |
| Cream | `#F8F7F1` |
| Main Text | `#303B32` |
| Secondary Text | `#8A938A` |

Font: **Plus Jakarta Sans** (Google Fonts)

---

## 🚀 How to Run

> No build step required. Simply open any HTML file in a browser.

### Option A – Open directly
Double-click `index.html` in your file explorer.

### Option B – Local dev server (recommended to avoid CORS issues)
```bash
# Using VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# OR using Python
python -m http.server 8080
# then visit http://localhost:8080
```

---

## 🔗 Pages & Navigation

| Page | File | Member |
|---|---|---|
| Dashboard | `index.html` | 1 |
| My Plants | `plants.html` | 1 |
| Plant Detail | `plant-detail.html?id={1-8}` | 1 |
| Watering Schedule | `watering.html` | 2 |
| Fertilizing Schedule | `fertilizing.html` | 2 |
| Care History | `history.html` | 3 |

---

## 📦 Shared Data (`js/dummy-data.js`)

**All three members must include this script** before their own JS files.

```html
<!-- In your HTML, before your own script -->
<script src="js/dummy-data.js"></script>
<script src="js/your-script.js"></script>
```

### Available Global Variables

| Variable | Type | Description |
|---|---|---|
| `plants` | `Array<Plant>` | 8 plant objects |
| `wateringSchedules` | `Array` | One per plant, with computed status |
| `fertilizingSchedules` | `Array` | One per plant, with computed status |
| `careHistories` | `Array` | 24 historical care records |
| `dashboardStats` | `Object` | Pre-computed totals for stats cards |
| `todaySchedule` | `Array` | Activities for today |
| `upcomingActivities` | `Array` | Next scheduled activities |

### Helper Functions

```js
getPlantById(id)            // Returns a single plant object by ID
getCareHistoryByPlant(id)   // Returns care history for a plant (sorted newest first)
getWateringByPlant(id)      // Returns watering schedule for a plant
getFertilizingByPlant(id)   // Returns fertilizing schedule for a plant
relDate(offset)             // Returns ISO date string ±N days from today
formatDateDisplay(isoStr)   // Returns "Nov 23, 2026" formatted string
```

### Plant Object Shape

```js
{
  id: 1,
  name: "Monstera Deliciosa",
  category: "Tropical Plant",
  image: "https://...",
  location: "Living Room",
  acquiredDate: "2026-01-07",        // relative to today at runtime
  description: "...",
  wateringFrequency: 7,              // days
  fertilizingFrequency: 30,          // days
  fertilizerType: "Liquid Fertilizer",
  nextWateringDate: "2026-11-23",    // relative to today at runtime
  nextFertilizingDate: "2026-11-28",
  lastWateringDate: "2026-11-16",
  lastFertilizingDate: "2026-10-29",
}
```

### Watering / Fertilizing Schedule Object Shape

```js
{
  id, plantId, plantName, plantImage,
  frequency,        // days
  nextDate,         // ISO string
  lastDate,         // ISO string
  status,           // "due-today" | "overdue" | "upcoming"
  notes,
}
```

### Care History Object Shape

```js
{
  id, plantId,
  type,     // "Watering" | "Fertilizing"
  date,     // ISO string
  notes,
  status,   // "completed"
}
```

---

## 🔧 Integration Guide for Members 2 & 3

### Using the Shared Sidebar & Header

Copy the sidebar and topbar HTML blocks from `index.html` into your page. Keep the same structure:

```html
<div class="app-shell">
  <aside class="sidebar" id="sidebar"> … </aside>
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <main class="main-content">
    <header class="topbar"> … </header>
    <div class="page-content"> … </div>
  </main>
</div>
```

Include these scripts at the bottom of `<body>`:

```html
<script src="js/dummy-data.js"></script>
<script src="js/main.js"></script>
<script src="js/your-script.js"></script>
```

The active nav item is automatically highlighted by `main.js` based on the current filename.

### CSS Class Namespace Convention

- Member 1 classes: `.plant-card`, `.stat-card`, `.schedule-*`, `.detail-*`, `.plants-*`
- Member 2: use prefix `.schedule-*` or `.ws-*` / `.fs-*` for watering/fertilizing
- Member 3: use prefix `.history-*` or `.ch-*` for care history

---

## ✅ Member 1 Completed Pages

- [x] `index.html` – Dashboard with stats, today's schedule, plant overview, upcoming activities
- [x] `plants.html` – Plant grid with search & category filter
- [x] `plant-detail.html` – Full plant detail with watering/fertilizing info and care history
- [x] `css/style.css` – Global shared styles
- [x] `css/dashboard.css` – Dashboard styles
- [x] `css/plants.css` – Plants & detail styles
- [x] `js/dummy-data.js` – Shared data source (8 plants + schedules + 24 history records)
- [x] `js/main.js` – Shared utilities
- [x] `js/dashboard.js` – Dashboard rendering
- [x] `js/plants.js` – Plants page rendering & filtering
