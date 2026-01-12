
import { supabase } from "./utils/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get Slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "tumpak-sewu";

  // 2. Fetch Data
  const { data: dbData, error } = await supabase
    .from("destinations")
    .select(`
            *,
            destination_images(*),
            photo_spots(*),
            nearby_places(*)
        `)
    // Logic for related might simpler: just fetch by category usually. 
    // My schema didn't fully implement M2M related table yet, 'related' was in JS.
    // I kept 'facilities' as text array. 
    // I will just fetch the main destination first.
    .eq("slug", slug)
    .single();

  // Workaround for 'related' since I didn't make a complex relation. 
  // I'll fetch 'related' manually or just random other destinations.

  if (error || !dbData) {
    console.error(error);
    document.getElementById("detail-main").innerHTML = `
            <div class="container text-center section">
                <h2>404 - Destinasi Tidak Ditemukan</h2>
                <p>${error ? error.message : "Data kosong"}</p>
                <a href="destinasi.html" class="btn btn-primary">Kembali ke Destinasi</a>
            </div>
        `;
    return;
  }

  // Map DB Structure to View Structure
  const data = {
    nama: dbData.name,
    slug: dbData.slug,
    hero_image: dbData.hero_path,
    thumbnail: dbData.thumbnail_path,
    short_desc: dbData.short_desc,
    deskripsi_lengkap: {
      // My schema combined them into 'description'. 
      // I'll split or just use same text. 
      // For now, I'll put the full description in 'sekilas' and empty others or duplicate.
      sekilas: dbData.description,
      daya_tarik: dbData.description ? dbData.description.substring(0, 100) + "..." : "", // Mock
      pengalaman: "Pengalaman tak terlupakan menanti anda." // Mock
    },
    kategori: dbData.category || ["Wisata"],
    jam_buka: dbData.open_hours,
    harga_tiket: dbData.ticket_price,
    akses: dbData.access_level,
    best_time: dbData.best_time,
    fasilitas: (dbData.facilities || []).map(f => ({ icon: "fa-check", nama: f })), // Map string to obj
    lokasi_cord: { lat: dbData.lat, lng: dbData.lng },
    spot_foto: dbData.photo_spots.map(s => ({
      nama: s.name,
      image: s.image_path,
      jam_terbaik: s.best_time,
      catatan: s.description
    })),
    rekomendasi_makan: dbData.nearby_places.map(n => ({
      nama: n.name,
      tipe: n.type,
      jarak: n.distance,
      note: n.note
    })),
    alur_kunjungan: [], // Schema didn't permit array of objects easily without jsonb. 
    // I can leave empty or migrate if I used jsonb. 
    // I will leave empty for now.
    tips: ["Bawa uang tunai", "Jaga kebersihan"], // Default tips since table is separate tips_articles
    peringatan: ["Hati-hati jalan licin"], // validasi fallback
    related: [] // Will fetch separately
  };

  // 3. Render
  renderHero(data);
  renderSummary(data);
  renderDescription(data);
  renderLogistics(data);
  renderSpots(data);
  renderTimeline(data);
  renderFood(data);
  renderMap(data);
  renderTips(data);

  // Fetch Related (Random 3 others)
  const { data: relatedData } = await supabase
    .from("destinations")
    .select("*")
    .neq("slug", slug)
    .limit(3);

  if (relatedData) {
    renderRelated(relatedData);
  }
});

function renderHero(data) {
  document.title = `${data.nama} - Explore Lumajang`;
  const heroBg = document.getElementById("detail-hero-bg");
  heroBg.style.backgroundImage = `url('${data.hero_image}')`;
  const content = document.getElementById("hero-data");
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
            "${data.short_desc} Sangat cocok untuk anda yang mencari <b>${data.kategori.join(
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
  // Left empty/mock for now as DB migration didn't include timeline structure yet
  const container = document.getElementById("timeline-container");
  if (!data.alur_kunjungan || data.alur_kunjungan.length === 0) {
    container.innerHTML = "<p>Informasi alur kunjungan belum tersedia.</p>";
    return;
  }
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

  // Cleanup map if exists
  if (window.detailMap) {
    window.detailMap.remove();
  }

  const map = L.map("map-detail").setView([lat, lng], 13);
  window.detailMap = map;

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(`<b>${data.nama}</b>`).openPopup();

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

function renderRelated(relatedItems) {
  const container = document.getElementById("related-container");
  if (!relatedItems) return;
  // DB items need mapping to view structure? 
  // View uses item.thumbnail
  container.innerHTML = relatedItems
    .map(
      (item) => `
        <a href="detail-wisata.html?slug=${item.slug}" class="cat-card-new" style="display: block; text-align: left; padding: 0; overflow: hidden;">
             <div style="height: 150px; overflow: hidden;">
                <img src="${item.thumbnail_path}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;">
             </div>
             <div style="padding: 1.5rem;">
                 <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                 <span style="font-size: 0.85rem; color: var(--accent);">${item.category ? item.category[0] : ""}</span>
             </div>
        </a>
    `
    )
    .join("");
}
