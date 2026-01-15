import { supabase } from "./utils/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Page Guard
  if (!document.getElementById("hero-bg") && !document.querySelector(".detail-content")) return;

  // Scroll Effect
  // Scroll Effect for Navbar
  handleNavbarScroll();

  // Get Slug
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "tumpak-sewu"; // Default for testing

  try {
    await loadDestination(slug);
  } catch (err) {
    console.error("Error loading destination:", err);
    // show404();
  }
});

function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar'); // Will be injected by layout.js
  // We need to wait for layout.js to inject navbar, maybe a small delay or mutation observer?
  // Or just attach listener to window and check if navbar exists

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

  // Initial check
  if (window.scrollY > 50) document.body.classList.add('scrolled');
}

async function loadDestination(slug) {
  // 1. Fetch main data
  const { data: dest, error } = await supabase
    .from("destinations")
    .select(`
            *,
            photo_spots(*),
            nearby_places(*)
        `)
    .eq("slug", slug)
    .single();

  if (error) throw error;
  if (!dest) throw new Error("Destination not found");

  // 2. Render Components
  // 2. Render Components
  renderHero(dest);
  renderLogistics(dest);
  renderDescription(dest);
  renderTimeline(dest);
  renderSpots(dest);
  renderRecommendations(dest);
  renderMap(dest);
  renderRelated(dest.slug);

  // 3. Update Page Title
  document.title = `${dest.name} - Explore Lumajang`;
}

function renderTimeline(dest) {
  const container = document.getElementById("timeline-container");
  const section = document.getElementById("timeline-section");

  // Check if timeline exists and has items
  if (!dest.timeline || !Array.isArray(dest.timeline) || dest.timeline.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  container.innerHTML = dest.timeline.map((step, index) => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <h4 class="timeline-title">${step.title}</h4>
                <p class="timeline-desc">${step.description}</p>
                ${step.duration ? `<span class="timeline-meta"><i class="fa-regular fa-clock"></i> ${step.duration}</span>` : ''}
            </div>
        </div>
    `).join("");
}

function renderHero(dest) {
  const bg = document.getElementById("hero-bg");
  const title = document.getElementById("hero-title");
  const desc = document.getElementById("hero-desc");
  const badgeContainer = document.getElementById("hero-badge-container");

  // Background
  // Use fallback if hero_path is missing or invalid URL
  const heroImg = dest.hero_path || 'assets/images/placeholder_hero.jpg';
  bg.style.backgroundImage = `url('${heroImg}')`;

  // Content
  title.textContent = dest.name;
  desc.textContent = dest.short_desc || "Keindahan alam Lumajang yang menakjubkan.";

  // Badges
  let badgesHtml = '';

  // Category Badge
  if (dest.category && Array.isArray(dest.category)) {
    dest.category.forEach(cat => {
      badgesHtml += `<span class="hero-meta-badge"><i class="fa-solid fa-tag"></i> ${cat}</span>`;
    });
  }

  // Dynamic Badges based on data
  if (dest.ticket_price === "Gratis" || dest.ticket_price === 0) {
    badgesHtml += `<span class="hero-meta-badge"><i class="fa-solid fa-ticket"></i> Gratis</span>`;
  }

  if (dest.access_level === "Mudah" || dest.access_level === "Easy") {
    badgesHtml += `<span class="hero-meta-badge"><i class="fa-solid fa-person-walking"></i> Akses Mudah</span>`;
  }

  badgeContainer.innerHTML = badgesHtml;
}

function renderLogistics(dest) {
  const container = document.getElementById("logistics-container");

  // Helper to create card
  const createCard = (icon, label, value) => `
        <div class="info-card">
            <i class="${icon} info-icon"></i>
            <span class="info-label">${label}</span>
            <span class="info-value">${value || '-'}</span>
        </div>
    `;

  // Process Hours
  let hoursDisplay = dest.open_hours;
  if (!hoursDisplay || hoursDisplay.toLowerCase().includes('24')) hoursDisplay = "24 Jam";

  // Process Price
  let priceDisplay = dest.ticket_price;
  if (typeof priceDisplay === 'number') {
    priceDisplay = `Rp ${priceDisplay.toLocaleString('id-ID')}`;
  }

  container.innerHTML = `
        ${createCard('fa-regular fa-clock', 'Jam Buka', hoursDisplay)}
        ${createCard('fa-solid fa-ticket', 'Tiket Masuk', priceDisplay)}
        ${createCard('fa-solid fa-mountain', 'Level Trek', dest.access_level)}
        ${createCard('fa-solid fa-stopwatch', 'Estimasi', dest.duration || '2-3 Jam')} 
    `;
  // Note: 'duration' column might not exist in all rows, using fallback or custom field if needed
}

function renderDescription(dest) {
  const descContainer = document.getElementById("rich-text-content");
  const highlightText = document.getElementById("highlight-text");
  const highlightBox = document.getElementById("highlight-box");

  // Main Description (Handle paragraphs)
  // If description stores HTML, nice. If plain text, wrap in <p>
  let descContent = dest.description || "";
  if (!descContent.includes("<p>")) {
    descContent = descContent.split('\n').map(p => p.trim()).filter(p => p).map(p => `<p class="mb-3">${p}</p>`).join("");
  }
  descContainer.innerHTML = descContent;

  // Highlight Box
  // If we have a specific 'highlight' column, use it. Else, generate from first sentence or short_desc.
  // Assuming 'highlight' might not exist, let's use a "Why Go" logic or just short_desc.
  const highlight = dest.highlight || dest.short_desc || "Pengalaman wisata alam terbaik di Lumajang.";
  highlightText.textContent = highlight;

  // Hide if absolutely no text to show (rare)
  if (!highlight) highlightBox.style.display = 'none';
}

function renderSpots(dest) {
  const container = document.getElementById("spots-container");

  if (!dest.photo_spots || dest.photo_spots.length === 0) {
    container.closest('#spots-section').style.display = 'none';
    return;
  }

  container.innerHTML = dest.photo_spots.map((spot, index) => `
        <div class="spot-card-premium" onclick="openLightbox(${index})">
            <img src="${spot.image_path}" alt="${spot.name}" loading="lazy">
            <div class="spot-overlay">
                <span class="spot-time"><i class="fa-regular fa-sun"></i> ${spot.best_time || 'Pagi/Sore'}</span>
                <span class="spot-name">${spot.name}</span>
            </div>
        </div>
    `).join("");

  // Make global for onclick access (or attach listeners securely)
  window.currentSpots = dest.photo_spots;
}

// Lightbox Logic Global Functions
window.openLightbox = (index) => {
  const spots = window.currentSpots;
  if (!spots || !spots[index]) return;

  const spot = spots[index];
  const modal = document.getElementById('lightbox-modal');

  document.getElementById('lb-img').src = spot.image_path;
  document.getElementById('lb-title').textContent = spot.name;
  document.getElementById('lb-time').innerHTML = `<i class="fa-regular fa-clock"></i> ${spot.best_time || 'Anytime'}`;
  document.getElementById('lb-desc').textContent = spot.description || "Pot angle terbaik untuk spot ini.";

  const tipBox = document.querySelector('.lb-tip-box p'); // #lb-protip
  if (tipBox) tipBox.textContent = `Tips: ${spot.tips || "Gunakan pencahayaan alami untuk hasil maksimal."}`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scroll
};

document.getElementById('lb-close').addEventListener('click', () => {
  document.getElementById('lightbox-modal').classList.remove('active');
  document.body.style.overflow = '';
});

// Close on outside click
document.getElementById('lightbox-modal').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox-modal') {
    document.getElementById('lightbox-modal').classList.remove('active');
    document.body.style.overflow = '';
  }
});


function renderRecommendations(dest) {
  const recContainer = document.getElementById("rec-container");
  const facilityContainer = document.getElementById("facilities-container");

  const places = dest.nearby_places || [];

  // Filter Foods
  const foods = places.filter(p => p.type === 'food' || p.type === 'restaurant' || p.type === 'warung');
  // Filter Basecamp/Rest
  const rests = places.filter(p => p.type === 'lodging' || p.type === 'basecamp');

  // Render Foods & Rests combined in the "Kuliner & Istirahat" section
  const foodAndRest = [...foods, ...rests];

  if (foodAndRest.length === 0) {
    recContainer.innerHTML = `<p class="text-muted" style="font-size:0.9rem;">Belum ada rekomendasi tersimpan.</p>`;
  } else {
    recContainer.innerHTML = foodAndRest.map(place => `
            <a href="${place.gmaps_link || '#'}" target="_blank" class="rec-item">
                <div class="rec-icon">
                    <i class="fa-solid ${place.type === 'lodging' ? 'fa-bed' : 'fa-utensils'}"></i>
                </div>
                <div class="rec-info">
                    <span class="rec-name">${place.name}</span>
                    <span class="rec-meta">${place.distance || 'Dekat'} • ${place.note || 'Recommended'}</span>
                </div>
                <div class="rec-action">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            </a>
        `).join("");
  }

  // Render Facilities (from array in dest)
  // dest.facilities is likely an array of strings like ["Toilet", "Parkir", "Musholla"]
  if (dest.facilities && dest.facilities.length > 0) {
    facilityContainer.innerHTML = dest.facilities.map(fac => `
            <div class="rec-item" style="pointer-events: none;"> <!-- Facilities usually not clickable unless map link -->
                <div class="rec-icon" style="background: rgba(255,255,255,0.05); color: var(--text);">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div class="rec-info">
                    <span class="rec-name" style="font-weight: 500;">${fac}</span>
                </div>
            </div>
        `).join("");
  } else {
    facilityContainer.innerHTML = `<p class="text-muted" style="font-size:0.9rem;">Data fasilitas belum tersedia.</p>`;
  }
}

function renderMap(dest) {
  const lat = dest.lat;
  const lng = dest.lng;

  if (!lat || !lng) {
    document.getElementById("map-section").style.display = 'none';
    return;
  }

  // Leaflet Map
  const map = L.map('map-detail', {
    center: [lat, lng],
    zoom: 13,
    zoomControl: false,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup(`<b>${dest.name}</b>`)
    .openPopup();

  // Map Button Logic
  const btn = document.getElementById("gmaps-btn");
  btn.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

async function renderRelated(currentSlug) {
  const container = document.getElementById("related-container");

  const { data: related, error } = await supabase
    .from("destinations")
    .select("name, slug, thumbnail_path, category, mood_tags")
    .neq("slug", currentSlug)
    .limit(4);
  // Ideally use .or(`category.cs.{${cat}}, ...`) if needed, but random neq is good for discovery for now.
  // If we had 'category' as text[], we could filter. 
  // For MVFP (Min Viable Feature Polish), simple random-ish suggestion is fine.

  if (error || !related) return;

  container.innerHTML = related.map(item => `
        <a href="detail-wisata.html?slug=${item.slug}" class="spot-card-premium" style="aspect-ratio: 3/2; display: block;">
            <img src="${item.thumbnail_path}" alt="${item.name}">
            <div class="spot-overlay">
               <span class="spot-time" style="color:var(--accent);">${item.category ? item.category[0] : 'Wisata'}</span>
               <span class="spot-name" style="font-size:1rem;">${item.name}</span>
            </div>
        </a>
    `).join("");
}
