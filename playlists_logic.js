
// --- PLAYLIST LOGIC (Curated Collections) ---
const PLAYLISTS = [
    { id: 'waterfall_day', name: 'Air Terjun Seharian', desc: 'Jelajahi keindahan curug terbaik Lumajang.', keywords: ['air terjun', 'tumpak', 'kapas'] },
    { id: 'sunrise_hunter', name: 'Sunrise Hunter', desc: 'Spot terbaik mengejar matahari terbit.', keywords: ['b29', 'semeru', 'ranau', 'pos'] },
    { id: 'family_trip', name: 'Family Trip', desc: 'Wisata ramah anak dan lansia.', keywords: ['keluarga', 'kolam', 'taman', 'selokambang'] },
    { id: 'budget_friendly', name: 'Budget Friendly', desc: 'Liburan seru tanpa bikin kantong bolong.', keywords: ['gratis', 'alun'] }
];

function renderPlaylists() {
    const container = document.getElementById('playlist-quick-list');
    if (!container) return;
    container.innerHTML = '';

    PLAYLISTS.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist-card-mini';
        card.setAttribute('data-pl', pl.id);
        card.innerHTML = `
      <strong>${pl.name}</strong>
      <span>${pl.desc}</span>
    `;
        card.onclick = () => applyPlaylist(pl);
        container.appendChild(card);
    });
}

function applyPlaylist(playlist) {
    // 1. Highlight UI
    document.querySelectorAll('.playlist-card-mini').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`.playlist-card-mini[data-pl="${playlist.id}"]`);
    if (activeCard) activeCard.classList.add('active');

    // Also clear mood chips to avoid confusion? Or combine?
    // Let's clear mood chips visually
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.remove("active"));

    // 2. Filter Logic (Reuse keyword logic mostly)
    console.log(`DEBUG: Applying Playlist '${playlist.name}'`);
    const keywords = playlist.keywords;

    const filtered = destinations.filter((d) => {
        const dName = (d.name || "").toLowerCase();
        const dCat = (d.category || "").toLowerCase();
        const dDesc = (d.description || "").toLowerCase();
        const dCost = (d.cost || "").toLowerCase();

        return keywords.some(k => {
            if (playlist.id === 'budget_friendly') {
                return dCost.includes('gratis') || removeRp(d.cost) < 15000;
            }
            return dName.includes(k) || dCat.includes(k) || dDesc.includes(k);
        });
    });

    renderDestinations(filtered);
}

window.openPlaylistModal = () => {
    // Show simple alert or modal with all playlists (Reuse/Create modal)
    // For now, let's just create a dynamic modal as per request "modal popup lebih disarankan"
    let modal = document.getElementById('playlist-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'playlist-modal';
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-bg" onclick="this.parentElement.classList.remove('active')"></div>
            <div class="modal-body" style="max-width:500px">
                <button class="close-modal" onclick="this.closest('.custom-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-header"><h3>Semua Playlist Wisata</h3></div>
                <div id="modal-playlist-list" style="display:grid; gap:1rem; margin-top:1rem;"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const list = document.getElementById('modal-playlist-list');
    list.innerHTML = PLAYLISTS.map(pl => `
        <div class="playlist-card-mini" style="width:100%" onclick="applyPlaylistById('${pl.id}')">
            <strong>${pl.name}</strong>
            <span>${pl.desc}</span>
        </div>
    `).join('');

    modal.classList.add('active');
};

window.applyPlaylistById = (id) => {
    const pl = PLAYLISTS.find(p => p.id === id);
    if (pl) {
        applyPlaylist(pl);
        document.getElementById('playlist-modal').classList.remove('active');
    }
};
