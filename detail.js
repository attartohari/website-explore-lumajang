import { destinations } from "./destinations-data.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Get Slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "tumpak-sewu"; // Default fallback for dev

  // 2. Fetch Data
  const data = destinations[slug];

  if (!data) {
    // Handle 404
    document.getElementById("detail-main").innerHTML = `
            <div class="container text-center section">
                <h2>404 - Destinasi Tidak Ditemukan</h2>
                <a href="destinasi.html" class="btn btn-primary">Kembali ke Destinasi</a>
            </div>
        `;
    return;
  }

  // 3. Render Hero
  renderHero(data);

  // 4. Render Summary
  renderSummary(data);

  // 5. Render Description
  renderDescription(data);

  // 6. Render Logistics
  renderLogistics(data);

  // 7. Render Spots
  renderSpots(data);

  // 8. Render Timeline
  renderTimeline(data);

  // 9. Render Food
  renderFood(data);

  // 10. Render Map
  renderMap(data);

  // 11. Render Tips
  renderTips(data);

  // 12. Render Related
  renderRelated(data.related);
});

function renderHero(data) {
  document.title = `${data.nama} - Explore Lumajang`;

  // Set Background
  const heroBg = document.getElementById("detail-hero-bg");
  heroBg.style.backgroundImage = `url('${data.hero_image}')`;

  // Content
  const content = document.getElementById("hero-data");

  // Generate Badges
  const badgesHtml = data.kategori
    .map(
      (cat) =>
        `<span class="badge-glass"><i class="fa-solid fa-tag"></i> ${cat}</span>`
    )
    .join("");

  content.innerHTML = `
        <div class="hero-badges">${badgesHtml}</div>
        <h1 class="hero-title" style="font-size: 3.5rem;">${data.nama}</h1>
        <p class="hero-desc" style="color: rgba(255,255,255,0.9);">${data.short_desc}</p>
        <div class="hero-buttons mt-2">
            <a href="#map-detail" class="btn btn-primary"><i class="fa-solid fa-map-location-dot"></i> Lihat Peta</a>
            <a href="#spots-container" class="btn btn-outline" style="color: white; border-color: white;"><i class="fa-solid fa-camera"></i> Lihat Spot Foto</a>
        </div>
    `;
}

function renderSummary(data) {
  const container = document.getElementById("summary-content");
  container.innerHTML = `
        <p class="section-desc-center" style="font-size: 1.1rem;">
            "${
              data.short_desc
            } Sangat cocok untuk anda yang mencari <b>${data.kategori.join(
    " & "
  )}</b> pada waktu <b>${data.best_time}</b>."
        </p>
    `;
}

function renderDescription(data) {
  const container = document.getElementById("detailed-desc");
  const { sekilas, daya_tarik, pengalaman } = data.deskripsi_lengkap;

  container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--accent); margin-bottom: 0.5rem;">Sekilas</h3>
            <p>${sekilas}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;" class="desc-grid-mobile">
            <div>
                 <h3 style="color: var(--accent); margin-bottom: 0.5rem;">Daya Tarik Utama</h3>
                 <p>${daya_tarik}</p>
            </div>
            <div>
                 <h3 style="color: var(--accent); margin-bottom: 0.5rem;">Pengalaman</h3>
                 <p>${pengalaman}</p>
            </div>
        </div>
    `;
}

function renderLogistics(data) {
  const container = document.getElementById("logistics-container");

  // Static Items
  const items = [
    { icon: "fa-clock", label: "Jam Buka", value: data.jam_buka },
    { icon: "fa-ticket", label: "Harga Tiket", value: data.harga_tiket },
    { icon: "fa-person-hiking", label: "Tingkat Akses", value: data.akses },
    { icon: "fa-sun", label: "Waktu Terbaik", value: data.best_time },
  ];

  let html = items
    .map(
      (item) => `
        <div class="log-card">
            <i class="fa-solid ${item.icon}"></i>
            <span class="log-label">${item.label}</span>
            <span class="log-value">${item.value}</span>
        </div>
    `
    )
    .join("");

  // Dynamic Facilities
  const facilitiesHtml = `
        <div class="log-card" style="grid-column: 1 / -1;">
            <i class="fa-solid fa-bell-concierge"></i>
            <span class="log-label">Fasilitas</span>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
                ${data.fasilitas
                  .map(
                    (f) => `
                    <span style="background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 5px; font-size: 0.9rem; border: 1px solid var(--border);">
                        <i class="fa-solid ${f.icon}" style="font-size: 0.8rem; margin:0; margin-right: 5px;"></i> ${f.nama}
                    </span>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  container.innerHTML = html + facilitiesHtml;
}

function renderSpots(data) {
  const container = document.getElementById("spots-container");
  if (!data.spot_foto || data.spot_foto.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted">Belum ada data spot foto.</p>';
    return;
  }

  container.innerHTML = data.spot_foto
    .map(
      (spot) => `
        <div class="spot-card">
            <img src="${spot.image}" alt="${spot.nama}" class="spot-img" loading="lazy">
            <div class="spot-info">
                <h4>${spot.nama}</h4>
                <div style="display: flex; gap: 0.5rem; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                     <i class="fa-regular fa-clock"></i> ${spot.jam_terbaik}
                </div>
                <p style="font-size: 0.9rem;">${spot.catatan}</p>
            </div>
        </div>
    `
    )
    .join("");
}

function renderTimeline(data) {
  const container = document.getElementById("timeline-container");
  if (!data.alur_kunjungan) return;

  container.innerHTML = data.alur_kunjungan
    .map(
      (al) => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <h4>${al.step}</h4>
                <p>${al.desc}</p>
            </div>
        </div>
    `
    )
    .join("");
}

function renderFood(data) {
  const container = document.getElementById("food-container");
  if (!data.rekomendasi_makan || data.rekomendasi_makan.length === 0) {
    container.innerHTML = "<p>Belum ada rekomendasi kuliner khusus.</p>";
    return;
  }

  container.innerHTML = data.rekomendasi_makan
    .map(
      (m) => `
        <div class="contact-item" style="border: 1px solid var(--border); padding: 1rem; border-radius: 10px;">
            <div class="icon-box"><i class="fa-solid fa-utensils"></i></div>
            <div>
                 <h4>${m.nama}</h4>
                 <span style="font-size: 0.8rem; color: var(--accent);">${m.tipe} • ${m.jarak} dari lokasi</span>
                 <p style="font-size: 0.9rem; margin-top: 0.5rem;">"${m.note}"</p>
            </div>
        </div>
    `
    )
    .join("");
}

function renderMap(data) {
  const mapEl = document.getElementById("map-detail");
  if (!mapEl || !L) return;

  const lat = data.lokasi_cord.lat;
  const lng = data.lokasi_cord.lng;

  const map = L.map("map-detail").setView([lat, lng], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(`<b>${data.nama}</b>`).openPopup();

  // Update Button Link
  const btn = document.getElementById("gmaps-btn");
  btn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function renderTips(data) {
  const container = document.getElementById("tips-container");

  let html = "";

  data.tips.forEach((t) => {
    html += `<li><i class="fa-solid fa-check-circle"></i> <span>${t}</span></li>`;
  });

  data.peringatan.forEach((p) => {
    html += `<li style="color: #f87171;"><i class="fa-solid fa-triangle-exclamation" style="color: #f87171;"></i> <span>${p}</span></li>`;
  });

  container.innerHTML = html;
}

function renderRelated(relatedIds) {
  const container = document.getElementById("related-container");
  if (!relatedIds) return;

  // Filter destinations object base on IDs
  // Since destinations is an object, we need to lookup
  const relatedItems = relatedIds.map((id) => destinations[id]).filter(Boolean);

  container.innerHTML = relatedItems
    .map(
      (item) => `
        <a href="detail-wisata.html?slug=${item.slug}" class="cat-card-new" style="display: block; text-align: left; padding: 0; overflow: hidden;">
             <div style="height: 150px; overflow: hidden;">
                <img src="${item.thumbnail}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;">
             </div>
             <div style="padding: 1.5rem;">
                 <h4 style="margin-bottom: 0.5rem;">${item.nama}</h4>
                 <span style="font-size: 0.85rem; color: var(--accent);">${item.kategori[0]}</span>
             </div>
        </a>
    `
    )
    .join("");
}
