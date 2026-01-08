document.addEventListener("DOMContentLoaded", () => {
  // --- DATA SOURCE ---
  const destinations = [
    {
      id: "tumpak-sewu",
      name: "Tumpak Sewu",
      category: "Air Terjun",
      moods: ["Waterfall lover", "Sunrise hunter", "Healing alone"],
      location: { lat: -8.2319, lng: 112.9175 },
      estTime: "1 jam 30 menit",
      distFromKull: "45 km",
      access: "physically demanding", // easy, moderate, physically demanding
      cost: "Rp 20.000",
      photoSpots: 5,
      trending: true,
      bestTime: "07:00 - 09:00",
      image:
        "https://images.unsplash.com/photo-1544634255-afbf7dcba97a?auto=format&fit=crop&w=800&q=80",
      description:
        "Air terjun terindah di Jawa Timur dengan formasi tirai air yang memukau.",
    },
    {
      id: "b29",
      name: "Puncak B29",
      category: "Pegunungan",
      moods: ["Sunrise hunter", "Family friendly", "Healing alone"],
      location: { lat: -7.9868, lng: 112.9876 },
      estTime: "1 jam 45 menit",
      distFromKull: "50 km",
      access: "moderate",
      cost: "Rp 15.000",
      photoSpots: 4,
      trending: true,
      bestTime: "Sunrise",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
      description:
        "Negeri di atas awan, spot terbaik melihat Gunung Bromo dari ketinggian.",
    },
    {
      id: "ranu-kumbolo",
      name: "Ranu Kumbolo",
      category: "Danau",
      moods: ["Healing alone", "Hanging out with friends", "Sunrise hunter"],
      location: { lat: -8.0673, lng: 112.9248 },
      estTime: "3 jam (Trekking)",
      distFromKull: "60 km",
      access: "physically demanding",
      cost: "Rp 19.000",
      photoSpots: 6,
      trending: false,
      bestTime: "Sunset / Sunrise",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      description: "Danau air tawar di kaki Gunung Semeru yang mempesona.",
    },
    {
      id: "pantai-bambang",
      name: "Pantai Bambang",
      category: "Pantai",
      moods: ["Family friendly", "Anti-tired (easy access)", "Tight budget"],
      location: { lat: -8.2833, lng: 113.0833 },
      estTime: "45 menit",
      distFromKull: "25 km",
      access: "easy",
      cost: "Rp 10.000",
      photoSpots: 2,
      trending: false,
      bestTime: "Sore",
      image:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
      description:
        "Pantai dengan pasir hitam eksotis dan ombak selatan yang kuat.",
    },
    {
      id: "kebun-teh",
      name: "Kebun Teh Kertowono",
      category: "Perkebunan",
      moods: [
        "Family friendly",
        "Hanging out with friends",
        "Anti-tired (easy access)",
      ],
      location: { lat: -8.0167, lng: 113.1167 },
      estTime: "50 menit",
      distFromKull: "30 km",
      access: "easy",
      cost: "Gratis",
      photoSpots: 3,
      trending: true,
      bestTime: "Pagi",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
      description:
        "Perkebunan teh hijau yang asri dengan latar belakang Gunung Semeru.",
    },
    {
      id: "air-terjun-kapas-biru",
      name: "Kapas Biru",
      category: "Air Terjun",
      moods: ["Waterfall lover", "Healing alone", "Sunrise hunter"],
      location: { lat: -8.225, lng: 112.93 },
      estTime: "1 jam 15 menit",
      distFromKull: "40 km",
      access: "moderate",
      cost: "Rp 10.000",
      photoSpots: 4,
      trending: true,
      bestTime: "Pagi",
      image:
        "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
      description: "Air terjun megah dengan aliran deras berwarna kebiruan.",
    },
    {
      id: "situs-biting",
      name: "Situs Biting",
      category: "Sejarah",
      moods: ["Family friendly", "Tight budget", "Educational"],
      location: { lat: -8.1123, lng: 113.2345 },
      estTime: "15 menit",
      distFromKull: "8 km",
      access: "easy",
      cost: "Rp 5.000",
      photoSpots: 2,
      trending: false,
      bestTime: "Pagi/Sore",
      image:
        "https://images.unsplash.com/photo-1599834246645-ec718507853d?auto=format&fit=crop&w=800&q=80",
      description: "Situs benteng kuno peninggalan kerajaan Lumajang.",
    },
    {
      id: "pura-mandara",
      name: "Pura Mandara Giri",
      category: "Religi",
      moods: ["Family friendly", "Cultural", "Tight budget"],
      location: { lat: -8.187, lng: 113.15 },
      estTime: "30 menit",
      distFromKull: "18 km",
      access: "easy",
      cost: "Donasi",
      photoSpots: 3,
      trending: false,
      bestTime: "Pagi",
      image:
        "https://images.unsplash.com/photo-1555523097-f55db4806443?auto=format&fit=crop&w=800&q=80",
      description: "Pura tertua di Jawa yang megah dan penuh nilai sejarah.",
    },
  ];

  // --- CONFIG ---
  const mapCenter = [-8.1331, 113.2258]; // Lumajang City Center
  let map,
    markers = [];
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

  // --- INIT ---
  initMap();
  renderDestinations(destinations);
  renderTrending();
  updateFavoritesUI();

  // --- FILTERS ---
  moodChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      // Toggle active state
      if (chip.classList.contains("active")) {
        chip.classList.remove("active");
        renderDestinations(destinations); // Reset to all
      } else {
        // Simple single filter or multiple? Let's do single active for now for simplicity, or multi?
        // User asked "Find what suits your mood", usually picking one.
        document.querySelector(".mood-chip.active")?.classList.remove("active");
        chip.classList.add("active");
        const mood = chip.dataset.mood;
        const filtered = destinations.filter((d) => d.moods.includes(mood));
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
      // Create Card
      const card = document.createElement("div");
      card.className = "dest-card";
      card.dataset.id = item.id;

      const isFav = favorites.includes(item.id);

      card.innerHTML = `
        <div class="dest-card-img-wrapper">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <button class="fav-btn ${
              isFav ? "active" : ""
            }" onclick="toggleFavorite('${item.id}', this)" aria-label="Simpan">
                <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
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
                <div class="dest-compare-check">
                    <input type="checkbox" id="cmp-${
                      item.id
                    }" onchange="toggleCompare('${item.id}')" ${
        compareList.includes(item.id) ? "checked" : ""
      }>
                    <label for="cmp-${item.id}">Bandingkan</label>
                </div>
            </div>
            
            <div class="dest-meta-grid">
                <div class="meta-item" title="Estimasi Waktu">
                    <i class="fa-regular fa-clock"></i> <span>${
                      item.estTime
                    }</span>
                </div>
                <div class="meta-item" title="Biaya">
                    <i class="fa-solid fa-money-bill-wave"></i> <span>${
                      item.cost
                    }</span>
                </div>
                <div class="meta-item" title="Akses">
                    <i class="fa-solid fa-person-hiking"></i> <span>${
                      item.access
                    }</span>
                </div>
            </div>

            <div class="dest-teaser">
                <i class="fa-solid fa-camera"></i>
                <span>${item.photoSpots} Spot Foto Terbaik</span>
            </div>
            
            <div class="dest-actions">
                <a href="detail-wisata.html?slug=${
                  item.id
                }" class="btn-detail">Lihat Detail</a>
                <button class="btn-map-link" onclick="focusMap(${
                  item.location.lat
                }, ${item.location.lng})">
                     <i class="fa-solid fa-map-location-dot"></i> Lihat di Peta
                </button>
            </div>
        </div>
      `;

      // Hover Effects interacting with map
      card.addEventListener("mouseenter", () => highlightMarker(item.id));
      card.addEventListener("mouseleave", () => unhighlightMarker(item.id));

      gridContainer.appendChild(card);

      // Add Marker
      const marker = L.marker([item.location.lat, item.location.lng])
        .addTo(map)
        .bindPopup(`<b>${item.name}</b><br>${item.estTime} dari kota.`);

      marker._id = item.id;

      // Click marker to scroll to card
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
    // Pick random 3 items for demo
    const trendItems = destinations.filter((d) => d.trending).slice(0, 3);
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
        // Filter grid to show this one or scroll to it?
        // Let's just scroll to it if present, or render all then scroll
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
  function initMap() {
    if (typeof L === "undefined") return;
    map = L.map("map-container", {
      center: mapCenter,
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: false, // We can add custom or leave default
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);
  }

  window.focusMap = (lat, lng) => {
    map.flyTo([lat, lng], 14);
    // Find marker and open popup
    const m = markers.find(
      (mark) => mark.getLatLng().lat === lat && mark.getLatLng().lng === lng
    );
    if (m) m.openPopup();
  };

  function highlightMarker(id) {
    const m = markers.find((mark) => mark._id === id);
    if (m) {
      m.setOpacity(1);
      m._icon.classList.add("marker-highlight");
    }
    // Dim other markers?
  }

  function unhighlightMarker(id) {
    const m = markers.find((mark) => mark._id === id);
    if (m) {
      m._icon.classList.remove("marker-highlight");
    }
  }

  // --- GLOBAL HELPERS (exposed to window for onclicks) ---
  window.toggleFavorite = (id, btn) => {
    const idx = favorites.indexOf(id);
    if (idx === -1) {
      favorites.push(id);
      btn.classList.add("active");
      btn.querySelector("i").classList.replace("fa-regular", "fa-solid");
      // Maybe show a toast
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

      // Render panel items
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

  // Show Comparison Modal
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

    // Simple Alert for now or custom modal
    // For this demo, I will inject a modal into body
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
    document.getElementById("cmp-inject").innerHTML = content;
    modal.classList.add("active");
  });

  function updateFavoritesUI() {
    // Logic for "Saved Favorites" panel if needed
  }
});
