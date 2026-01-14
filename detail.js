import { supabase } from "./utils/supabase.js";
import { destinations as localData } from "./destinations-data.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get Slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "tumpak-sewu";
  let data;

  try {
    // 2. Fetch Data from Supabase
    const { data: dbData, error } = await supabase
      .from("destinations")
      .select(
        `
            *,
            destination_images(*),
            photo_spots(*),
            nearby_places(*)
        `
      )
      .eq("slug", slug)
      .single();

    if (error || !dbData) throw error;

    // Map DB Structure to View Structure
    data = {
      nama: dbData.name,
      slug: dbData.slug,
      hero_image: dbData.hero_path,
      thumbnail: dbData.thumbnail_path,
      short_desc: dbData.short_desc,
      deskripsi_lengkap: {
        sekilas: dbData.description,
        daya_tarik: dbData.description
          ? dbData.description.substring(0, 100) + "..."
          : "",
        pengalaman: "Pengalaman tak terlupakan menanti anda.",
      },
      kategori: dbData.category || ["Wisata"],
      jam_buka: dbData.open_hours,
      harga_tiket: dbData.ticket_price,
      akses: dbData.access_level,
      best_time: dbData.best_time,
      fasilitas: (dbData.facilities || []).map((f) => ({
        icon: "fa-check",
        nama: f,
      })),
      lokasi_cord: { lat: dbData.lat, lng: dbData.lng },
      spot_foto: dbData.photo_spots.map((s) => ({
        nama: s.name,
        image: s.image_path,
        jam_terbaik: s.best_time,
        catatan: s.description,
      })),
      rekomendasi_makan: dbData.nearby_places.map((n) => ({
        nama: n.name,
        tipe: n.type,
        jarak: n.distance,
        note: n.note,
      })),
      alur_kunjungan: [],
      tips: ["Bawa uang tunai", "Jaga kebersihan"],
      peringatan: ["Hati-hati jalan licin"],
      related: [],
    };

    // Fetch Related (Random 3 others) form DB
    const { data: relatedData } = await supabase
      .from("destinations")
      .select("*")
      .neq("slug", slug)
      .limit(3);

    if (relatedData) {
      renderRelated(relatedData);
    }
  } catch (err) {
    console.warn("Falling back to local data:", err);
    // Fallback to local keys
    const localItem = localData[slug];

    if (!localItem) {
      document.getElementById("detail-main").innerHTML = `
            <div class="container text-center section">
                <h2>404 - Destinasi Tidak Ditemukan</h2>
                <p>Data tidak ditemukan di database maupun lokal.</p>
                <a href="destinasi.html" class="btn btn-primary">Kembali ke Destinasi</a>
            </div>
        `;
      return;
    }

    // Use local item directly (structure matches or is richer)
    data = localItem;
    // Local Item already has everything structured correctly.

    // For related, just pick 3 random other keys
    const otherKeys = Object.keys(localData)
      .filter((k) => k !== slug)
      .slice(0, 3);
    const relatedLocal = otherKeys.map((k) => ({
      name: localData[k].nama,
      slug: localData[k].slug,
      thumbnail_path: localData[k].thumbnail,
      category: localData[k].kategori,
    }));
    renderRelated(relatedLocal);
  }

  // 3. Render based on Config
  if (data.detail_config && data.detail_config.sections) {
    // Sort and Render Active Only
    data.detail_config.sections
      .filter(sec => sec.active)
      .forEach(sec => {
        if (sec.type === 'hero') renderHero(data, sec);
        else if (sec.type === 'summary') renderSummary(data, sec);
        else if (sec.type === 'rich_text') renderDescription(data, sec);
        else if (sec.type === 'logistics') renderLogistics(data, sec);
        else if (sec.type === 'spots') renderSpots(data, sec);
        else if (sec.type === 'timeline') renderTimeline(data, sec);
        else if (sec.type === 'nearby') renderFood(data, sec);
        else if (sec.type === 'map') renderMap(data, sec);
        else if (sec.type === 'tips') renderTips(data, sec);
      });
  } else {
    // Default Fallback Layout
    renderHero(data);
    renderSummary(data);
    renderDescription(data);
    renderLogistics(data);
    renderSpots(data);
    renderTimeline(data);
    renderFood(data);
    renderMap(data);
    renderTips(data);
  }
});

function renderHero(data, config = {}) {
  document.title = `${config.custom_title || data.nama} - Explore Lumajang`;
  const heroBg = document.getElementById("detail-hero-bg");
  // Override Priority: Config Image -> Data Hero -> Fallback
  const img = config.custom_image || data.hero_image;
  heroBg.style.backgroundImage = `url('${img}')`;

  const content = document.getElementById("hero-data");
  const badgesHtml = data.kategori
    .map(
      (cat) =>
        `<span class="badge-glass"><i class="fa-solid fa-tag"></i> ${cat}</span>`
    )
    .join("");

  content.innerHTML = `
        <div class="hero-badges">${badgesHtml}</div>
        <h1 class="hero-title" style="font-size: 3.5rem;">${config.custom_title || data.nama}</h1>
        <p class="hero-desc" style="color: rgba(255,255,255,0.9);">${data.short_desc}</p>
        <div class="hero-buttons mt-2">
            <a href="#map-detail" class="btn btn-primary"><i class="fa-solid fa-map-location-dot"></i> Lihat Peta</a>
            <a href="#spots-container" class="btn btn-outline" style="color: white; border-color: white;"><i class="fa-solid fa-camera"></i> Lihat Spot Foto</a>
        </div>
    `;
}

// ... renderSummary and others need small tweaks to accept 'config' if overrides exist 
// ignoring for brevity unless user edit requested specific attributes there.
// But renderDescription is key for overrides.

function renderDescription(data, config = {}) {
  const container = document.getElementById("detailed-desc");
  // Config overrides
  const sekilas = config.content_sekilas || data.deskripsi_lengkap.sekilas;
  const daya_tarik = config.content_daya_tarik || data.deskripsi_lengkap.daya_tarik;
  const pengalaman = config.content_pengalaman || data.deskripsi_lengkap.pengalaman;

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

function renderTips(data, config = {}) {
  const container = document.getElementById("tips-container");
  let html = "";
  // Config tips override or append? Let's say override if present.
  const tipsList = (config.tips && config.tips.length > 0) ? config.tips : data.tips;

  tipsList.forEach((t) => {
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
        <a href="detail-wisata.html?slug=${item.slug
        }" class="cat-card-new" style="display: block; text-align: left; padding: 0; overflow: hidden;">
             <div style="height: 150px; overflow: hidden;">
                <img src="${item.thumbnail_path
        }" style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;">
             </div>
             <div style="padding: 1.5rem;">
                 <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                 <span style="font-size: 0.85rem; color: var(--accent);">${item.category ? item.category[0] : ""
        }</span>
             </div>
        </a>
    `
    )
    .join("");
}
