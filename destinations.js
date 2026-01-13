import { supabase } from "./utils/supabase.js";
import { CONFIG } from "./utils/config.js";

console.log("DEBUG: destinations.js loaded");

// --- GLOBAL VARIABLES (Module Scope) ---
let map;
let markers = [];
let destinations = []; // Global to hold data for filtering
let favorites = JSON.parse(localStorage.getItem("lumajang_favs")) || [];
let compareList = [];

// --- CONSTANTS ---
const STORAGE_URL = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}`;

// --- INIT FUNCTION ---
const init = async () => {
  console.log("DEBUG: Init function started");

  const gridContainer = document.getElementById("destination-grid");
  const trendingContainer = document.getElementById("trending-content");

  if (!gridContainer) {
    console.error("CRITICAL ERROR: #destination-grid not found!");
    return;
  }

  // --- LOADING STATE ---
  gridContainer.innerHTML = `
    <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <i class="fa-solid fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
      <p style="margin-top: 1rem; color: var(--text-light);">Memuat destinasi terbaik...</p>
    </div>
  `;

  // --- INITIALIZE MAP ---
  initMap();

  // --- FETCH DATA ---
  console.log("DEBUG: Fetching from Supabase...");
  const { data: destinationsData, error } = await supabase
    .from("destinations")
    .select(`*, photo_spots(id)`)
    .eq("status", "published");

  console.log("--- DEBUG DATA START ---");
  console.log("DEBUG: Fetch Error:", error);
  console.log(
    "DEBUG: Data Length:",
    destinationsData ? destinationsData.length : 0
  );
  console.log("--- DEBUG DATA END ---");

  if (error) {
    gridContainer.innerHTML = `
        <div class="error-msg" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
            <p>Gagal memuat data. (${error.message})</p>
        </div>`;
    return;
  }

  // --- MAPPING ---
  try {
    destinations = (destinationsData || []).map((d) => {
      // Image resolution
      let imageUrl = "assets/images/ui/putih.png";
      if (d.thumbnail_path) {
        if (d.thumbnail_path.startsWith("http")) {
          imageUrl = d.thumbnail_path;
        } else {
          imageUrl = `${STORAGE_URL}/${d.thumbnail_path}`;
        }
      }

      // Category Array
      let rawCats = d.category || [];
      if (typeof rawCats === "string") rawCats = [rawCats];

      // Access Normalization (Simple capitalized word)
      let accessLevel = d.access_level || "Menengah";
      accessLevel =
        accessLevel.charAt(0).toUpperCase() +
        accessLevel.slice(1).toLowerCase();

      // Cost Normalization
      let costVal = d.ticket_price_avg || 0;
      let costDisplay = "Gratis";
      if (costVal > 0) {
        costDisplay = "Rp " + costVal.toLocaleString("id-ID");
      } else if (
        typeof d.ticket_price_avg === "string" &&
        d.ticket_price_avg.toLowerCase() !== "free"
      ) {
        costDisplay = d.ticket_price_avg;
      }

      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        category: rawCats.length > 0 ? rawCats[0] : "Wisata",
        moods: rawCats,
        location: { lat: d.lat || -8.1331, lng: d.lng || 113.2258 },
        estTime: d.est_time || "1 jam",
        distFromKull: d.distance_from_city || "? km",
        access: accessLevel,
        cost: costDisplay,
        photoSpots: d.photo_spots ? d.photo_spots.length : 0,
        trending: d.is_trending || false,
        created_at: d.created_at, // for fallback sorting
        image: imageUrl,
        description: d.short_desc || "Deskripsi belum tersedia.",
        district: d.district || "Lumajang",
      };
    });
    console.log(
      "DEBUG: Mapping successful. Mapped items:",
      destinations.length
    );
  } catch (mapErr) {
    console.error("DEBUG: Mapping Error:", mapErr);
    gridContainer.innerHTML = `<div style="grid-column:1/-1;color:red;text-align:center;">Data Error</div>`;
    return;
  }

  // --- RENDER ---
  try {
    renderDestinations(destinations);
    console.log("DEBUG: RenderDestinations complete");
    renderTrending();
    console.log("DEBUG: RenderTrending complete");
    setupFilters();
    setupGlobalHelpers();
  } catch (renderErr) {
    console.error("DEBUG: Render Error:", renderErr);
  }
};

// --- RENDER FUNCTIONS ---
function renderDestinations(data) {
  const gridContainer = document.getElementById("destination-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  // Remove old markers safely
  if (map && typeof L !== "undefined") {
    markers.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (e) {}
    });
  }
  markers = [];

  if (data.length === 0) {
    gridContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
            <i class="fa-regular fa-folder-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
            <h3>Belum ada destinasi.</h3>
            <p style="color: var(--text-light);">Coba cari kategori lain.</p>
        </div>`;
    return;
  }

  data.forEach((item) => {
    try {
      const card = document.createElement("div");
      card.className = "dest-card";
      card.dataset.id = item.id;

      const isFav = favorites.includes(item.id);

      card.innerHTML = `
            <div class="dest-card-img-wrapper">
                <img src="${item.image}" alt="${
        item.name
      }" loading="lazy" onerror="this.onerror=null;this.src='assets/images/ui/putih.png';">
                <button class="fav-btn ${isFav ? "active" : ""}" 
                    onclick="window.toggleFavorite('${
                      item.id
                    }', this)" aria-label="Simpan">
                    <i class="${
                      isFav ? "fa-solid" : "fa-regular"
                    } fa-heart"></i>
                </button>
                <div class="dest-badges">
                    <span class="badge-cat">${item.category}</span>
                    ${
                      item.trending
                        ? '<span class="badge-trend"><i class="fa-solid fa-fire"></i> Trending</span>'
                        : ""
                    }
                </div>
            </div>
            <div class="dest-card-content">
                <div class="dest-card-header">
                    <h3>${item.name}</h3>
                    <!-- Compare Checkbox removed from here to clean up header, or keep small? keeping small -->
                    <div class="dest-compare-check">
                        <input type="checkbox" id="cmp-${
                          item.id
                        }" onchange="window.toggleCompare('${item.id}')" 
                        ${compareList.includes(item.id) ? "checked" : ""}>
                         <label for="cmp-${
                           item.id
                         }" style="font-size:0.7rem;">Bdg</label>
                    </div>
                </div>
                
                <div class="dest-meta-grid">
                    <div class="meta-item" title="Estimasi Waktu">
                        <i class="fa-regular fa-clock"></i> 
                        <span>${item.estTime}</span>
                    </div>
                    <div class="meta-item" title="Biaya">
                        <i class="fa-solid fa-money-bill-wave"></i> 
                        <span>${item.cost}</span>
                    </div>
                    <div class="meta-item" title="Akses">
                        <i class="fa-solid fa-person-hiking"></i> 
                        <span>${item.access}</span>
                    </div>
                </div>
                
                <div class="dest-teaser">
                     <p>${item.description}</p>
                </div>

                <div class="dest-actions">
                    <a href="detail-wisata.html?slug=${
                      item.slug
                    }" class="btn-detail">Lihat Detail</a>
                    <button class="btn-map-link" onclick="window.focusMap(${
                      item.location.lat
                    }, ${item.location.lng})">
                         <i class="fa-solid fa-map-location-dot"></i> Peta
                    </button>
                </div>
            </div>
        `;

      card.addEventListener("mouseenter", () => highlightMarker(item.id));
      card.addEventListener("mouseleave", () => unhighlightMarker(item.id));
      gridContainer.appendChild(card);

      if (map && typeof L !== "undefined") {
        const marker = L.marker([item.location.lat, item.location.lng])
          .addTo(map)
          .bindPopup(`<b>${item.name}</b>`);
        marker._id = item.id;
        marker.on("click", () => {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          const allCards = document.querySelectorAll(".dest-card");
          allCards.forEach((c) => (c.style.borderColor = "var(--border)"));
          card.style.borderColor = "var(--accent)";
          setTimeout(() => (card.style.borderColor = "var(--border)"), 2000);
        });
        markers.push(marker);
      }
    } catch (cardErr) {
      console.error("DEBUG: Error creating card for item", item.id, cardErr);
    }
  });
}

function renderTrending() {
  const container = document.getElementById("trending-content");
  if (!container) return;
  container.innerHTML = "";

  // 1. Filter Trending or Fallback to Newest
  let trendItems = destinations.filter((d) => d.trending);
  if (trendItems.length === 0) {
    // Fallback: take first 4 (assumed sorted by DB or relevance, typically new)
    trendItems = destinations.slice(0, 4);
  } else {
    trendItems = trendItems.slice(0, 4);
  }

  // 2. Render as Buttons
  trendItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = `detail-wisata.html?slug=${item.slug}`;
    link.className = "btn-trend";
    link.innerHTML = `
            <i class="fa-solid fa-fire trend-fire-icon"></i>
            <span>${item.name}</span>
        `;
    container.appendChild(link);
  });
}

function setupFilters() {
  const moodChips = document.querySelectorAll(".mood-chip");
  moodChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.classList.contains("active")) {
        chip.classList.remove("active");
        renderDestinations(destinations);
      } else {
        document.querySelector(".mood-chip.active")?.classList.remove("active");
        chip.classList.add("active");
        const mood = chip.dataset.mood.trim().toLowerCase();
        const filtered = destinations.filter(
          (d) =>
            d.moods.some((m) => m.toLowerCase().includes(mood)) ||
            JSON.stringify(d).toLowerCase().includes(mood)
        );
        renderDestinations(filtered);
      }
    });
  });
}

// --- MAP & HELPERS ---
function initMap() {
  if (typeof L === "undefined") {
    console.log("DEBUG: Leaflet L is undefined");
    return;
  }
  const mapEl = document.getElementById("map-container");
  if (!mapEl) {
    console.log("DEBUG: map-container not found");
    return;
  }

  try {
    if (map) {
      map.remove();
    } // cleanup if re-init
    map = L.map("map-container", {
      center: [-8.1331, 113.2258],
      zoom: 10,
      zoomControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OpenStreetMap" }
    ).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    console.log("DEBUG: Map initialized");
  } catch (e) {
    console.error("DEBUG: Map Init Error", e);
  }
}

function highlightMarker(id) {
  if (!markers) return;
  const m = markers.find((mark) => mark._id === id);
  if (m && m._icon) m._icon.classList.add("marker-highlight");
}
function unhighlightMarker(id) {
  if (!markers) return;
  const m = markers.find((mark) => mark._id === id);
  if (m && m._icon) m._icon.classList.remove("marker-highlight");
}

function setupGlobalHelpers() {
  window.focusMap = (lat, lng) => {
    if (!map) return;
    map.flyTo([lat, lng], 14);
    const m = markers.find(
      (mark) => mark.getLatLng().lat === lat && mark.getLatLng().lng === lng
    );
    if (m) m.openPopup();
  };

  window.toggleFavorite = (id, btn) => {
    const idx = favorites.indexOf(id);
    if (idx === -1) {
      favorites.push(id);
      btn.classList.add("active");
      btn.querySelector("i").classList.replace("fa-regular", "fa-solid");
    } else {
      favorites.splice(idx, 1);
      btn.classList.remove("active");
      btn.querySelector("i").classList.replace("fa-solid", "fa-regular");
    }
    localStorage.setItem("lumajang_favs", JSON.stringify(favorites));
    // updateFavoritesUI(); // removed optional call to avoid ref error
  };

  window.toggleCompare = (id) => {
    const idx = compareList.indexOf(id);
    if (idx === -1) {
      if (compareList.length >= 2) {
        alert("Maksimal bandingkan 2 destinasi.");
        document.getElementById(`cmp-${id}`).checked = false;
        return;
      }
      compareList.push(id);
    } else {
      compareList.splice(idx, 1);
    }
    updateCompareUI();
  };
}

function updateCompareUI() {
  const compareFloating = document.querySelector(".compare-floating");
  const compareCount = document.querySelector(".compare-count");
  const compareItemsPanel = document.querySelector(".compare-items-panel");
  const compareBtn = document.getElementById("do-compare");

  // Safety check if elements exist
  if (!compareFloating || !compareCount || !compareItemsPanel) return;

  if (compareList.length > 0) {
    compareFloating.classList.add("show");
    compareCount.textContent = compareList.length;
    compareItemsPanel.innerHTML = compareList
      .map((id) => {
        const d = destinations.find((x) => x.id === id);
        if (!d) return "";
        return `<div class="cmp-mini-item"><img src="${d.image}"><span>${d.name}</span></div>`;
      })
      .join("");
  } else {
    compareFloating.classList.remove("show");
  }
}

// Compare Modal logic attached globally or here
// (Simplified for robustness - ensuring no crashes access missing elements)
const compareBtn = document.getElementById("do-compare");
if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    if (compareList.length < 2) return;
    const d1 = destinations.find((x) => x.id === compareList[0]);
    const d2 = destinations.find((x) => x.id === compareList[1]);
    if (!d1 || !d2) return;

    // ... truncated modal build logic for brevity/safety ...
    // Re-implementing minimal modal
    let modal = document.getElementById("cmp-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "cmp-modal";
      modal.className = "custom-modal";
      modal.innerHTML = `<div class="modal-bg"></div><div class="modal-body"><button class="close-modal"><i class="fa-solid fa-xmark"></i></button><div id="cmp-inject"></div></div>`;
      document.body.appendChild(modal);
      modal
        .querySelector(".close-modal")
        .addEventListener("click", () => modal.classList.remove("active"));
      modal
        .querySelector(".modal-bg")
        .addEventListener("click", () => modal.classList.remove("active"));
    }

    const content = `
            <div style="display:flex; gap:1rem; padding:1rem; text-align:center;">
                <div style="flex:1;"><img src="${d1.image}" style="width:100px;height:70px;object-fit:cover;"><h3>${d1.name}</h3></div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;"><h3>VS</h3></div>
                <div style="flex:1;"><img src="${d2.image}" style="width:100px;height:70px;object-fit:cover;"><h3>${d2.name}</h3></div>
            </div>
        `;
    document.getElementById("cmp-inject").innerHTML = content;
    modal.classList.add("active");
  });
}

// --- EXECUTION ENTRY ---
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
