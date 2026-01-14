
import { supabase } from '../../utils/supabase.js';

// Elements
const saveBtn = document.getElementById('save-all-btn');

// --- STATE ---
let homeConfig = {
    hero: {
        title: "",
        desc: "",
        bg_path: "",
        cta_link: ""
    },
    hero_cards: [], // Array of destination IDs to show
    welcome: {
        tag: "",
        title: "",
        desc: "",
        map_center: { lat: -8.133, lng: 113.225 }
    },
    testimonials: [] // Array of Objects { name, origin, text, avatar }
};

let allDestinations = [];

// --- INITIALIZATION ---

const init = async () => {
    await Promise.all([
        fetchDestinations(),
        fetchConfig()
    ]);

    renderHeroForm();
    renderCardsManager();
    renderWelcomeForm();
    renderTestimonialsManager();
};

const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('id, name, thumbnail_path').order('name');
    allDestinations = data || [];
};

const fetchConfig = async () => {
    // We try to fetch each section. Ideally all in one 'config' object or separate rows?
    // Plan says separate rows: home_hero, home_welcome, etc.

    const { data: heroData } = await supabase.from('page_sections').select('*').eq('section_key', 'home_hero').single();
    if (heroData) homeConfig.hero = heroData.content;

    const { data: cardsData } = await supabase.from('page_sections').select('*').eq('section_key', 'home_cards').single();
    if (cardsData) homeConfig.hero_cards = cardsData.content; // Expecting array of IDs

    const { data: welcomeData } = await supabase.from('page_sections').select('*').eq('section_key', 'home_welcome').single();
    if (welcomeData) homeConfig.welcome = welcomeData.content;

    const { data: testData } = await supabase.from('page_sections').select('*').eq('section_key', 'home_testimonials').single();
    if (testData) homeConfig.testimonials = testData.content;
};


// --- RENDERERS ---

const renderHeroForm = () => {
    document.getElementById('hero_title').value = homeConfig.hero.title || '';
    document.getElementById('hero_desc').value = homeConfig.hero.desc || '';
    document.getElementById('hero_cta_link').value = homeConfig.hero.cta_link || '';
    document.getElementById('hero_bg_path').value = homeConfig.hero.bg_path || '';

    if (homeConfig.hero.bg_path) {
        const preview = document.getElementById('hero_bg_preview');
        preview.src = homeConfig.hero.bg_path;
        preview.classList.add('show');
    }
};

const renderCardsManager = () => {
    const container = document.getElementById('hero-cards-list');

    // Sort logic? Currently just listing all destinations with a toggle
    // Ideally we want to REORDER them too, but for MVP let's just toggle visibility

    container.innerHTML = allDestinations.map(dest => {
        const isChecked = (homeConfig.hero_cards || []).includes(dest.id);
        const thumb = dest.thumbnail_path ? (dest.thumbnail_path.startsWith('http') ? dest.thumbnail_path : '../' + dest.thumbnail_path) : 'https://placehold.co/60x40';

        return `
        <div class="card-item">
            <input type="checkbox" class="card-toggle" data-id="${dest.id}" ${isChecked ? 'checked' : ''} style="width:20px; height:20px;">
            <img src="${thumb}" class="card-thumb" onerror="this.src='https://placehold.co/60x40'">
            <div class="card-info">
                <strong>${dest.name}</strong>
            </div>
        </div>
        `;
    }).join('');
};

const renderWelcomeForm = () => {
    document.getElementById('welcome_tag').value = homeConfig.welcome.tag || 'Jelajahi Wilayah';
    document.getElementById('welcome_title').value = homeConfig.welcome.title || 'Selamat Datang di Lumajang';
    document.getElementById('welcome_desc').value = homeConfig.welcome.desc || '';
    document.getElementById('map_lat').value = homeConfig.welcome.map_center?.lat || -8.133;
    document.getElementById('map_lng').value = homeConfig.welcome.map_center?.lng || 113.225;
};

const renderTestimonialsManager = () => {
    const list = document.getElementById('testimonials-list');
    list.innerHTML = "";

    (homeConfig.testimonials || []).forEach((testi, index) => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <div style="flex:1;">
                <input type="text" placeholder="Nama" class="form-control" style="margin-bottom:0.5rem;" value="${testi.name}" onchange="updateTestimonial(${index}, 'name', this.value)">
                <input type="text" placeholder="Asal Kota" class="form-control" style="margin-bottom:0.5rem;" value="${testi.origin}" onchange="updateTestimonial(${index}, 'origin', this.value)">
                <textarea placeholder="Pesan..." class="form-control" onchange="updateTestimonial(${index}, 'text', this.value)">${testi.text}</textarea>
            </div>
            <button class="action-btn" onclick="removeTestimonial(${index})" style="color:var(--danger);"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
};

// --- LOGIC HELPER ---

// Testimonial Helpers (Global scope needed for onclick)
window.addTestimonial = () => {
    if (!homeConfig.testimonials) homeConfig.testimonials = [];
    homeConfig.testimonials.push({ name: '', origin: '', text: '', avatar: '' });
    renderTestimonialsManager();
};

window.removeTestimonial = (index) => {
    homeConfig.testimonials.splice(index, 1);
    renderTestimonialsManager();
};

window.updateTestimonial = (index, key, value) => {
    homeConfig.testimonials[index][key] = value;
};


// Image Upload Logic
document.getElementById('hero_bg_file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `home/hero-bg-${Date.now()}`;
    const { data, error } = await supabase.storage.from('explore-lumajang').upload(fileName, file);

    if (error) {
        alert("Upload failed: " + error.message);
    } else {
        const { data: { publicUrl } } = supabase.storage.from('explore-lumajang').getPublicUrl(fileName);
        document.getElementById('hero_bg_path').value = publicUrl;
        document.getElementById('hero_bg_preview').src = publicUrl;
        document.getElementById('hero_bg_preview').classList.add('show');
    }
});


// --- SAVE ALL ---
saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    // 1. Gather Data from DOM where necessary (or rely on bound config)
    homeConfig.hero.title = document.getElementById('hero_title').value;
    homeConfig.hero.desc = document.getElementById('hero_desc').value;
    homeConfig.hero.cta_link = document.getElementById('hero_cta_link').value;
    homeConfig.hero.bg_path = document.getElementById('hero_bg_path').value;

    homeConfig.welcome.tag = document.getElementById('welcome_tag').value;
    homeConfig.welcome.title = document.getElementById('welcome_title').value;
    homeConfig.welcome.desc = document.getElementById('welcome_desc').value;
    homeConfig.welcome.map_center = {
        lat: parseFloat(document.getElementById('map_lat').value),
        lng: parseFloat(document.getElementById('map_lng').value)
    };

    // Card Selection
    const selectedCards = [];
    document.querySelectorAll('.card-toggle:checked').forEach(el => selectedCards.push(el.dataset.id));
    homeConfig.hero_cards = selectedCards;


    // 2. Upsert to Supabase
    try {
        await upsertSection('home_hero', homeConfig.hero);
        await upsertSection('home_cards', homeConfig.hero_cards);
        await upsertSection('home_welcome', homeConfig.welcome);
        await upsertSection('home_testimonials', homeConfig.testimonials);

        alert("Berhasil disimpan!");
    } catch (err) {
        alert("Gagal menyimpan: " + err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Perubahan';
    }
});

const upsertSection = async (key, content) => {
    const { error } = await supabase.from('page_sections').upsert({ section_key: key, content: content });
    if (error) throw error;
};


// Execute
init();
