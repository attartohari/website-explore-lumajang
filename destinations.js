import { supabase } from "./utils/supabase.js";

// --- GLOBAL VARIABLES ---
let map;
let markers = [];
let allDestinations = [];
let currentDestinations = [];

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("destination-grid")) {
    initDestinationsPage();
  }
});

async function initDestinationsPage() {
  console.log("Initializing Destinations Page...");

  // 1. Initialize Map
  initMap();

  // 2. Fetch Data
  await fetchDestinations();

  // 3. Setup Filters
  setupFilters();
}

async function fetchDestinations() {
  const grid = document.getElementById("destination-grid");
  if (grid) grid.innerHTML = '<div class="text-center p-5"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Memuat destinasi...</p></div>';

  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });

    if (error) throw error;

    // DEDUPLICATION LOGIC (BY SLUG)
    // User reported duplicates like "Air Terjun Kapas Biru".
    // If DB has multiple records for same place (diff IDs), ID-dedupe fails.
    // Slug-dedupe works because slug should be unique for same place.
    const uniqueMap = new Map();
    if (data) {
      data.forEach(item => {
        // Use slug as cleaner uniqueness key
        const key = item.slug || item.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        } else {
          // Optional: Log duplicate found
          console.warn("Duplicate destination found and filtered:", item.name);
        }
      });
    }
    allDestinations = Array.from(uniqueMap.values());

    // Populate global for search/modal usages if needed
    window.destinations = allDestinations;

    // Initial Render
    renderDestinations(allDestinations);
    renderTrending(allDestinations);

  } catch (err) {
    console.error("Error fetching destinations:", err);
    if (grid) grid.innerHTML = '<div class="text-center p-5 text-danger"><p>Gagal memuat data. Silakan refresh.</p></div>';
  }
}

function renderDestinations(data) {
  currentDestinations = data;
  const grid = document.getElementById("destination-grid");
  if (!grid) return;

  // Clear Container (Crucial for preventing duplicates)
  grid.innerHTML = "";
  updateMapMarkers(data);

  if (data.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-face-sad-tear"></i>
                <p>Tidak ada destinasi yang cocok dengan filter.</p>
                <button onclick="resetFilters()" class="btn-reset">Reset Filter</button>
            </div>
        `;
    return;
  }

  data.forEach(item => {
    // Safe Accessors
    const name = item.name || "Tanpa Nama";
    const image = getLocalImagePath(item.thumbnail_path);
    const category = Array.isArray(item.category) ? item.category[0] : (item.category || "Wisata");

    // Formatting Meta
    const price = formatPrice(item.ticket_price);
    const time = item.est_time || "-";
    const trek = mapTrekLevel(item.trek_level);

    const desc = item.short_desc || "Tidak ada deskripsi.";
    const rating = item.rating || 4.5;
    const lat = item.lat;
    const lng = item.lng;

    // Badges
    let badgeHTML = "";
    if (item.season === 'Kemarau') badgeHTML = `<div class="card-badge badge-sun"><i class="fa-solid fa-sun"></i> Kemarau</div>`;
    else if (item.season === 'Hujan') badgeHTML = `<div class="card-badge badge-rain"><i class="fa-solid fa-cloud-showers-heavy"></i> Hujan</div>`;

    const card = document.createElement("div");
    card.className = "dest-card";
    card.id = `card-${item.id}`;

    // Standardized Markup
    card.innerHTML = `
            <div class="dest-card-img" onclick="focusMap('${item.id}', ${lat}, ${lng})">
                <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='assets/images/ui/placeholder.png'">
                ${badgeHTML}
                <button class="btn-like" onclick="toggleLike('${item.id}', this, event)">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
            <div class="dest-card-body">
                <div class="card-header">
                    <h3 class="card-title">${name}</h3>
                    <div class="card-rating"><i class="fa-solid fa-star"></i> ${rating}</div>
                </div>
                <div class="card-tags">
                   <span class="tag">${category}</span>
                </div>
                <div class="card-meta">
                    <div class="meta-item" title="Estimasi Waktu"><i class="fa-regular fa-clock"></i> ${time}</div>
                    <div class="meta-item" title="Harga Tiket"><i class="fa-solid fa-ticket"></i> ${price}</div>
                    <div class="meta-item" title="Tingkat Kesulitan"><i class="fa-solid fa-person-hiking"></i> ${trek}</div>
                </div>
                <p class="card-desc">${desc}</p>
                <div class="card-actions">
                    <a href="detail-wisata.html?slug=${item.slug}" class="btn btn-outline btn-sm">Lihat Detail</a>
                    ${lat && lng ?
        `<button class="btn btn-primary btn-sm" onclick="focusMap('${item.id}', ${lat}, ${lng})">
                          <i class="fa-solid fa-location-dot"></i> Lokasi
                      </button>` :
        `<button class="btn btn-disabled btn-sm" disabled title="Lokasi belum tersedia"><i class="fa-solid fa-location-dot"></i> Lokasi</button>`
      }
                </div>
            </div>
        `;
    grid.appendChild(card);
  });
}

function renderTrending(data) {
  const container = document.getElementById("trending-content");
  if (!container) return;

  // Filter Trending (if column exists) or top 5
  // Assuming 'is_trending' might be in DB, or just take first 5
  let trending = data.filter(d => d.is_trending);
  if (trending.length === 0) trending = data.slice(0, 5);
  else trending = trending.slice(0, 5);

  container.innerHTML = "";

  if (trending.length === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size: 0.9rem;">Belum ada destinasi trending.</p>`;
    return;
  }

  trending.forEach(item => {
    const div = document.createElement("a");
    div.href = `detail-wisata.html?slug=${item.slug}`;
    div.className = "trending-item";

    const category = Array.isArray(item.category) ? item.category[0] : (item.category || "Wisata");

    // Clean Layout: Name Bold + Category formatted
    div.innerHTML = `
            <div class="trending-info">
                <h4 class="trend-name">${item.name}</h4>
                <span class="trend-cat">${category}</span>
            </div>
            <div class="trend-icon">
                <i class="fa-solid fa-arrow-right"></i>
            </div>
        `;
    container.appendChild(div);
  });
}

// --- FILTERING ---
function setupFilters() {
  const chips = document.querySelectorAll(".mood-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const mood = chip.dataset.mood;
      filterDestinations(mood);
    });
  });
}

function filterDestinations(mood) {
  if (mood === 'all') {
    renderDestinations(allDestinations);
    return;
  }

  const filtered = allDestinations.filter(item => {
    const itemMoods = (item.moods || []).map(m => m.toLowerCase());
    const itemCats = (item.category || []).map(c => c.toLowerCase());
    const combined = [...itemMoods, ...itemCats, item.trek_level ? item.trek_level.toLowerCase() : '', item.ticket_price ? item.ticket_price.toString().toLowerCase() : ''];

    return combined.some(val => val.includes(mood));
  });

  renderDestinations(filtered);
}

window.resetFilters = () => {
  document.querySelector('.mood-chip[data-mood="all"]').click();
};

// --- MAP LOGIC ---
function initMap() {
  if (typeof L === 'undefined') return;
  const container = document.getElementById('map-container');
  if (!container) return;

  map = L.map('map-container', {
    zoomControl: false,
    scrollWheelZoom: false
  }).setView([-8.133, 113.225], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
}

function updateMapMarkers(data) {
  if (!map) return;

  // Clear old
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  data.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(`<b>${item.name}</b>`);
      marker.on('click', () => {
        focusMap(item.id, item.lat, item.lng);
      });
      markers.push(marker);
    }
  });
}

window.focusMap = (id, lat, lng) => {
  if (!map) return;
  map.flyTo([lat, lng], 13, { duration: 1.5 });

  // Open Popup
  const marker = markers.find(m => m.getLatLng().lat === lat && m.getLatLng().lng === lng);
  if (marker) marker.openPopup();

  // Scroll map into view on mobile
  if (window.innerWidth < 992) {
    document.getElementById('map-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// --- HELPERS ---
function getLocalImagePath(path) {
  if (!path) return 'assets/images/ui/placeholder.png';
  if (path.startsWith('assets/')) return path;
  return `assets/images/destinasi/${path}`;
}

function formatPrice(val) {
  if (val === 0 || val === "0") return "Gratis";
  if (!val) return "Gratis";
  if (typeof val === 'string') return val;
  return 'Rp ' + val.toLocaleString('id-ID');
}

function mapTrekLevel(level) {
  if (!level) return "Mudah";
  // Normalize if needed, e.g. "easy" -> "Mudah"
  const l = level.toLowerCase();
  if (l === 'easy') return 'Mudah';
  if (l === 'medium') return 'Sedang';
  if (l === 'hard') return 'Sulit';
  return level;
}

window.toggleLike = (id, btn, e) => {
  if (e) e.stopPropagation();
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('active')) {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid');
  } else {
    icon.classList.remove('fa-solid');
    icon.classList.add('fa-regular');
  }
  if (window.toggleCollection) window.toggleCollection(id);
};
