
import { supabase } from './utils/supabase.js';

document.addEventListener("DOMContentLoaded", async () => {
  // --- INIT ---
  initMap();

  // --- LOAD DATA ---
  const { data: destinationsData, error } = await supabase
    .from("destinations")
    .select(`
            *,
            photo_spots(id)
        `)
    .eq("status", "published");

  if (error) {
    console.error("Error fetching destinations:", error);
    document.getElementById("destination-grid").innerHTML = `<p class="error-msg">Gagal memuat data. Silakan coba lagi. (${error.message})</p>`;
    return;
  }

  // Map DB data to UI format
  const destinations = destinationsData.map(d => ({
    id: d.id, // Use ID for unique identification, Slug for links
    slug: d.slug,
    name: d.name,
    category: d.category && d.category.length > 0 ? d.category[0] : "Wisata",
    moods: d.category || [],
    location: { lat: d.lat, lng: d.lng },
    estTime: "1 jam", // Placeholder
    distFromKull: "10 km", // Placeholder
    access: d.access_level || "Menengah",
    cost: d.ticket_price || "Free",
    photoSpots: d.photo_spots ? d.photo_spots.length : 0, // Count array length
    trending: true, // You can add logic for this based on views or flag
    bestTime: d.best_time,
    image: d.thumbnail_path, // Ensure this path is valid relative path or full URL
    description: d.short_desc
  }));

  // --- CONFIG ---
  let markers = [];
  let favorites = JSON.parse(localStorage.getItem("lumajang_favs")) || [];
  let compareList = [];

  // --- ELEMENTS ---
  const gridContainer = document.getElementById("destination-grid");
  const moodChips = document.querySelectorAll(".mood-chip");
  const trendingContainer = document.getElementById("trending-content");
  const compareFloating = document.querySelector(".compare-floating");
  const compareCount = document.querySelector(".compare-count");
  const compareItemsPanel = document.querySelector(".compare-items-panel");
  const compareBtn = document.getElementById("do-compare");

  // --- START RENDER ---
  renderDestinations(destinations);
  renderTrending();
  updateFavoritesUI();

  // --- FILTERS ---
  moodChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.classList.contains("active")) {
        chip.classList.remove("active");
        renderDestinations(destinations);
      } else {
        document.querySelector(".mood-chip.active")?.classList.remove("active");
        chip.classList.add("active");
        const mood = chip.dataset.mood;
        // Simple partial match case insensitive? Or exact match?
        // DB 'category' is array. 'moods' mapped to it.
        // The mood chips in HTML have e.g. "Sunrise hunter". 
        // DB categories are ["Alam", "Air Terjun", "Petualangan"]. 
        // Wait, the mood filtering logic in existing code relied on `moods` array in data.
        // The existing data had `moods: ["Sunrise hunter", ...]`. 
        // My DB `category` is `["Alam", ...]`.
        // HACK: For now, I will treat 'category' as searchable tags. 
        // Revisit: Should I change mood chips to match DB Categories? YES, user experience better.
        // OR map specific DB categories to these moods?
        // Let's filter slightly loosely for now.

        const filtered = destinations.filter((d) =>
          d.moods.some(m => m.toLowerCase().includes(mood.toLowerCase())) ||
          JSON.stringify(d).toLowerCase().includes(mood.toLowerCase()) // Quick dirty search
        );
        renderDestinations(filtered);
      }
    });
  });

  // --- RENDERING ---
  function renderDestinations(data) {
    gridContainer.innerHTML = "";

    // Remove old markers
    markers.forEach((m) => map.removeLayer(m));
    markers = [];

    if (data.length === 0) {
      gridContainer.innerHTML =
        '<div class="no-results"><p>Belum ada destinasi yang cocok dengan mood ini.</p></div>';
      return;
    }

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "dest-card";
      card.dataset.id = item.id;

      const isFav = favorites.includes(item.id);

      card.innerHTML = `
        <div class="dest-card-img-wrapper">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <button class="fav-btn ${isFav ? "active" : ""
        }" onclick="window.toggleFavorite('${item.id}', this)" aria-label="Simpan">
                <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
            </button>
            <div class="dest-badges">
                <span class="badge-cat">${item.category}</span>
                ${item.trending
          ? '<span class="badge-trend"><i class="fa-solid fa-fire"></i> Trending</span>'
          : ""
        }
            </div>
        </div>
        <div class="dest-card-content">
            <div class="dest-card-header">
                <h3>${item.name}</h3>
                <div class="dest-compare-check">
                    <input type="checkbox" id="cmp-${item.id
        }" onchange="window.toggleCompare('${item.id}')" ${compareList.includes(item.id) ? "checked" : ""
        }>
                    <label for="cmp-${item.id}">Bandingkan</label>
                </div>
            </div>
            
            <div class="dest-meta-grid">
                <div class="meta-item" title="Estimasi Waktu">
                    <i class="fa-regular fa-clock"></i> <span>${item.estTime
        }</span>
                </div>
                <div class="meta-item" title="Biaya">
                    <i class="fa-solid fa-money-bill-wave"></i> <span>${item.cost
        }</span>
                </div>
                <div class="meta-item" title="Akses">
                    <i class="fa-solid fa-person-hiking"></i> <span>${item.access
        }</span>
                </div>
            </div>

            <div class="dest-teaser">
                <i class="fa-solid fa-camera"></i>
                <span>${item.photoSpots} Spot Foto Terbaik</span>
            </div>
            
            <div class="dest-actions">
                <a href="detail-wisata.html?slug=${item.slug
        }" class="btn-detail">Lihat Detail</a>
                <button class="btn-map-link" onclick="window.focusMap(${item.location.lat
        }, ${item.location.lng})">
                     <i class="fa-solid fa-map-location-dot"></i> Lihat di Peta
                </button>
            </div>
        </div>
      `;

      // Hover Effects
      card.addEventListener("mouseenter", () => highlightMarker(item.id));
      card.addEventListener("mouseleave", () => unhighlightMarker(item.id));

      gridContainer.appendChild(card);

      // Add Marker
      const marker = L.marker([item.location.lat, item.location.lng])
        .addTo(map)
        .bindPopup(`<b>${item.name}</b><br>${item.estTime} dari kota.`);

      marker._id = item.id;

      marker.on("click", () => {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        document
          .querySelectorAll(".dest-card")
          .forEach((c) => c.classList.remove("highlighted"));
        card.classList.add("highlighted");
        setTimeout(() => card.classList.remove("highlighted"), 2000);
      });

      markers.push(marker);
    });
  }

  function renderTrending() {
    const trendItems = destinations.slice(0, 3); // Just pick first 3
    trendingContainer.innerHTML = "";
    trendItems.forEach((item) => {
      const div = document.createElement("div");
      div.className = "trend-item";
      div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="trend-info">
                <h4>${item.name}</h4>
                <span>${item.category}</span>
            </div>
        `;
      div.addEventListener("click", () => {
        renderDestinations(destinations);
        setTimeout(() => {
          const card = document.querySelector(
            `.dest-card[data-id="${item.id}"]`
          );
          if (card)
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      });
      trendingContainer.appendChild(div);
    });
  }

  // --- MAP FUNCTIONS ---
  // Must make map globally accessible for window.focusMap in module scope? 
  // No, map is variable in this scope. 
  // But window.focusMap is global, it needs access to `map`. 
  // `map` is defined in initMap but assigned to module-level lets.

  // NOTE: In module, top level variables are NOT global.
  // BUT initMap assigns to `let map`. 
  // window.focusMap calls `map.flyTo`. 
  // This works because window.focusMap is closure over `map`? 
  // NO, `window.focusMap = ...` creates a function. If that function is defined INSIDE this module's scope, it captures `map`. SUCCESS.

  let map;

  function initMap() {
    if (typeof L === "undefined") return;
    map = L.map("map-container", {
      center: [-8.1331, 113.2258],
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
  }

  window.focusMap = (lat, lng) => {
    if (!map) return;
    map.flyTo([lat, lng], 14);
    const m = markers.find(
      (mark) => mark.getLatLng().lat === lat && mark.getLatLng().lng === lng
    );
    if (m) m.openPopup();
  };

  function highlightMarker(id) {
    if (!markers) return;
    const m = markers.find((mark) => mark._id === id);
    if (m) {
      m.setOpacity(1);
      if (m._icon) m._icon.classList.add("marker-highlight");
    }
  }

  function unhighlightMarker(id) {
    if (!markers) return;
    const m = markers.find((mark) => mark._id === id);
    if (m) {
      if (m._icon) m._icon.classList.remove("marker-highlight");
    }
  }

  // --- GLOBAL HELPERS ---
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
    updateFavoritesUI();
  };

  window.toggleCompare = (id) => {
    const idx = compareList.indexOf(id);
    if (idx === -1) {
      if (compareList.length >= 2) {
        alert("Maksimal bandingkan 2 destinasi sekaligus.");
        document.getElementById(`cmp-${id}`).checked = false;
        return;
      }
      compareList.push(id);
    } else {
      compareList.splice(idx, 1);
    }
    updateCompareUI();
  };

  function updateCompareUI() {
    if (compareList.length > 0) {
      compareFloating.classList.add("show");
      compareCount.textContent = compareList.length;
      compareItemsPanel.innerHTML = compareList
        .map((id) => {
          const d = destinations.find((x) => x.id === id);
          return `<div class="cmp-mini-item"><img src="${d.image}"><span>${d.name}</span></div>`;
        })
        .join("");
    } else {
      compareFloating.classList.remove("show");
    }
  }

  compareBtn.addEventListener("click", () => {
    if (compareList.length < 2) return;
    const d1 = destinations.find((x) => x.id === compareList[0]);
    const d2 = destinations.find((x) => x.id === compareList[1]);

    const content = `
        <div class="compare-modal-content">
            <div class="cmp-col">
                <img src="${d1.image}">
                <h3>${d1.name}</h3>
                <p>${d1.category}</p>
            </div>
            <div class="cmp-col-center">
                <div class="cmp-row"><span>Jarak</span></div>
                <div class="cmp-row"><span>Biaya</span></div>
                <div class="cmp-row"><span>Akses</span></div>
                <div class="cmp-row"><span>Spot Foto</span></div>
            </div>
             <div class="cmp-col">
                <img src="${d2.image}">
                <h3>${d2.name}</h3>
                <p>${d2.category}</p>
            </div>
        </div>
        <div class="compare-data-rows">
             <div class="cmp-data-row"><div>${d1.distFromKull}</div><div>VS</div><div>${d2.distFromKull}</div></div>
             <div class="cmp-data-row"><div>${d1.cost}</div><div>VS</div><div>${d2.cost}</div></div>
             <div class="cmp-data-row"><div>${d1.access}</div><div>VS</div><div>${d2.access}</div></div>
             <div class="cmp-data-row"><div>${d1.photoSpots} Spots</div><div>VS</div><div>${d2.photoSpots} Spots</div></div>
        </div>
      `;

    let modal = document.getElementById("cmp-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "cmp-modal";
      modal.className = "custom-modal";
      modal.innerHTML = `<div class="modal-bg"></div><div class="modal-body"><button class="close-modal"><i class="fa-solid fa-xmark"></i></button><div id="cmp-inject"></div></div>`;
      document.body.appendChild(modal);
      modal.querySelector(".close-modal").addEventListener("click", () => modal.classList.remove("active"));
      modal.querySelector(".modal-bg").addEventListener("click", () => modal.classList.remove("active"));
    }
    document.getElementById("cmp-inject").innerHTML = content;
    modal.classList.add("active");
  });

  function updateFavoritesUI() {
    // Optional
  }
});
