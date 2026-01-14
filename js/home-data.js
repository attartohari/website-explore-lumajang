
import { supabase } from '../utils/supabase.js';

// --- CONFIG ---
const DEFAULT_MAP_CENTER = [-8.133, 113.225];

// --- MAIN ---
document.addEventListener('DOMContentLoaded', async () => {
    // Only fetch if we are on the home page (simple check)
    if (!document.getElementById('home')) return;

    try {
        const [heroConfig, cardsConfig, welcomeConfig, testimonialsConfig] = await Promise.all([
            fetchSection('home_hero'),
            fetchSection('home_cards'),
            fetchSection('home_welcome'),
            fetchSection('home_testimonials')
        ]);

        if (heroConfig) renderHero(heroConfig);
        if (cardsConfig) renderCards(cardsConfig);
        if (welcomeConfig) renderWelcome(welcomeConfig);
        if (testimonialsConfig) renderTestimonials(testimonialsConfig);

    } catch (error) {
        console.warn("Home Data Fetch Error:", error);
        // Fallback to static content is automatic since we just won't touch DOM
    }
});

async function fetchSection(key) {
    const { data } = await supabase.from('page_sections').select('content').eq('section_key', key).single();
    return data ? data.content : null;
}

// --- RENDERERS ---

function renderHero(config) {
    if (config.title) document.getElementById('hero-title').textContent = config.title;
    if (config.desc) document.getElementById('hero-desc').textContent = config.desc;

    // Background
    if (config.bg_path) {
        const bgEl = document.getElementById('hero-bg');
        // Check if bgEl uses img or css background-image. 
        // In existing code: <div class="hero-bg-layer" id="hero-bg"></div>
        // So we update style.
        bgEl.style.backgroundImage = `url('${config.bg_path}')`;
    }

    // CTA
    if (config.cta_link) {
        const btn = document.querySelector('#home .hero-buttons .btn-primary');
        if (btn) btn.href = config.cta_link;
    }
}

async function renderCards(cardIds) {
    if (!cardIds || cardIds.length === 0) return;

    // We need to fetch the actual destination data for these IDs
    const { data: destinations } = await supabase
        .from('destinations')
        .select('*')
        .in('id', cardIds);

    if (!destinations) return;

    // Order them based on the array order?
    // Map destinations by ID for easy lookup
    const destMap = {};
    destinations.forEach(d => destMap[d.id] = d);

    const orderedDestinations = cardIds
        .map(id => destMap[id])
        .filter(d => d !== undefined);

    const track = document.querySelector('.hero-slider-track');
    if (!track) return;

    // Clear existing (This is the destructive part, but necessary for replacement)
    track.innerHTML = '';

    orderedDestinations.forEach((item, index) => {
        const isActive = index === 0 ? 'active' : '';
        const thumb = item.thumbnail_path ? (item.thumbnail_path.startsWith('http') ? item.thumbnail_path : item.thumbnail_path) : 'assets/images/placeholder.jpg';

        // Note: The existing logic uses 'data-bg' on the CARD to change the MAIN BG.
        // If we want to keep that logic, we need to ensure data-bg is set correctly.
        // Assuming item.hero_path is the big background.

        const heroBg = item.hero_path ? (item.hero_path.startsWith('http') ? item.hero_path : item.hero_path) : thumb;

        const html = `
            <div class="hero-card ${isActive}" 
                data-index="${index}" 
                data-slug="${item.slug}"
                data-bg="${heroBg}" 
                data-title="${item.name}"
                data-desc="${item.short_desc || ''}">
              <img src="${thumb}" alt="${item.name}" onerror="this.src='https://placehold.co/200x300'" />
              <div class="card-info">
                <h3>${item.name}</h3>
                <span>${item.category && item.category[0] ? item.category[0] : 'Wisata'}</span>
              </div>
            </div>
        `;
        track.insertAdjacentHTML('beforeend', html);
    });

    // We might need to re-initialize the slider logic if it depends on static elements
    // or if it ran on load.
    // Ideally, we trigger a custom event or re-call the init script.
    // For now, let's dispatch an event that script.js might listen to, 
    // OR we might need to "reload" the slider logic. 
    // Checking script.js content would be wise.

    // Dispatch event just in case
    window.dispatchEvent(new Event('hero-slider-updated'));
}

function renderWelcome(config) {
    if (config.tag) document.querySelector('.welcome-section .section-tag').textContent = config.tag;
    // Assuming h2 structure
    if (config.title) document.querySelector('.welcome-section .section-title-large').innerHTML = config.title;
    if (config.desc) document.querySelector('.welcome-section .section-desc-center').textContent = config.desc;

    if (config.map_center) {
        // Update map view if map object is accessible
        // Usually map is in global scope or we need to access it. 
        // If map is not global, we might need to just restart it or wait for it.
        // The existing code likely initializes map on load.
        // We can try to access window.map if it was attached.
    }
}

function renderTestimonials(testimonials) {
    if (!testimonials || testimonials.length === 0) return;

    // Both tracks
    const tracks = document.querySelectorAll('.marquee-track');

    // We can replace content in tracks. 
    // Logic: Split testimonials into 2 chunks or duplicate them?
    // Existing: track 1 (right), track 2 (left).

    // Simple logic: Fill both with same random mix or split.

    const mkCard = (t) => `
        <div class="review-card">
          <p>"${t.text}"</p>
          <div class="reviewer">
            <img src="${t.avatar || 'https://ui-avatars.com/api/?name=' + t.name}" alt="${t.name}" />
            <span>${t.name}, ${t.origin}</span>
          </div>
        </div>
    `;

    tracks.forEach(track => {
        // Inside track we have .marquee-content (original) and .marquee-content (clone)
        const contents = track.querySelectorAll('.marquee-content');
        contents.forEach(content => {
            content.innerHTML = testimonials.map(mkCard).join('');
        });
    });
}
