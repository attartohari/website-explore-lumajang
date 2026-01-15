
import { supabase } from '../../utils/supabase.js';

const LOCAL_ASSETS = [
    "tumpak sewu.png", "b29.png", "goatetes.png", "kapasbiru.png", "kebunteh.png",
    "pantaibambang.png", "ranukumbolo.png", "ranupani.png", "viewsemeru.png", "watupecak.png"
];

const ASSET_BASE_PATH = "assets/images/destinasi/";

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dest-form')) {
        init();
    }
});

async function init() {
    setupImagePickers();
    setupSlugGenerator();

    // Check Mode (Edit vs New)
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        document.getElementById('page-title').textContent = "Edit Destinasi";
        await loadData(id);
    }

    document.getElementById('dest-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveData(id);
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        window.location.href = 'destinations.html';
    });
}

function setupImagePickers() {
    const prefixes = ['thumbnail', 'hero'];

    prefixes.forEach(prefix => {
        const select = document.getElementById(`${prefix}_select`);
        const fileInput = document.getElementById(`${prefix}_file`);
        const urlInput = document.getElementById(`${prefix}_url`);
        const preview = document.getElementById(`${prefix}_preview`);

        // Populate Select
        LOCAL_ASSETS.forEach(file => {
            const opt = document.createElement('option');
            opt.value = ASSET_BASE_PATH + file;
            opt.textContent = file;
            select.appendChild(opt);
        });

        // 1. Select Change Listener
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                preview.src = '../' + e.target.value;
                urlInput.value = ''; // Clear URL if select used
                fileInput.value = ''; // Clear file if select used
            } else {
                preview.src = '../assets/images/ui/placeholder.png';
            }
        });

        // 2. URL Input Listener
        urlInput.addEventListener('input', (e) => {
            if (e.target.value) {
                preview.src = e.target.value;
                select.value = ''; // Clear select
                fileInput.value = ''; // Clear file
            }
        });

        // 3. File Input Listener (Preview only)
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    preview.src = ev.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
                select.value = '';
                urlInput.value = '';
            }
        });
    });
}

function setupSlugGenerator() {
    const nameInput = document.getElementById('name');
    const slugInput = document.getElementById('slug');

    nameInput.addEventListener('input', () => {
        if (!slugInput.value) {
            slugInput.value = generateSlug(nameInput.value);
        }
    });

    nameInput.addEventListener('blur', () => {
        if (!slugInput.value) slugInput.value = generateSlug(nameInput.value);
    });
}

function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function loadData(id) {
    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert("Error loading data: " + error.message);
        return;
    }

    // Populate Fields
    document.getElementById('name').value = data.name || '';
    document.getElementById('slug').value = data.slug || '';
    document.getElementById('category').value = Array.isArray(data.category) ? data.category[0] : (data.category || 'Wisata Alam');
    document.getElementById('status').value = data.status || 'draft';

    document.getElementById('ticket_price').value = data.ticket_price || '';
    document.getElementById('est_time').value = data.est_time || '';
    document.getElementById('trek_level').value = data.trek_level || 'Mudah';

    document.getElementById('lat').value = data.lat || '';
    document.getElementById('lng').value = data.lng || '';

    document.getElementById('short_desc').value = data.short_desc || '';
    document.getElementById('description').value = data.description || '';

    // Images Logic
    setImageField('thumbnail', data.thumbnail_path);
    setImageField('hero', data.hero_path);

    // Moods
    const moods = data.moods || [];
    document.querySelectorAll('input[name="moods"]').forEach(cb => {
        if (moods.includes(cb.value)) cb.checked = true;
    });
}

function setImageField(prefix, path) {
    if (!path) return;
    const select = document.getElementById(`${prefix}_select`);
    const urlInput = document.getElementById(`${prefix}_url`);
    const preview = document.getElementById(`${prefix}_preview`);

    if (path.startsWith('assets/')) {
        select.value = path;
        preview.src = '../' + path;
    } else {
        urlInput.value = path;
        preview.src = path; // External or Storage URL
        select.value = "";
    }
}

async function saveData(id) {
    const btn = document.getElementById('btn-save');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        // 1. Upload Images if files selected
        const thumbPath = await handleImageUpload('thumbnail');
        const heroPath = await handleImageUpload('hero');

        // 2. Gather Data
        const moodCheckboxes = document.querySelectorAll('input[name="moods"]:checked');
        const moods = Array.from(moodCheckboxes).map(cb => cb.value);

        const formData = {
            name: document.getElementById('name').value,
            slug: document.getElementById('slug').value,
            category: [document.getElementById('category').value],
            status: document.getElementById('status').value,

            ticket_price: document.getElementById('ticket_price').value,
            est_time: document.getElementById('est_time').value,
            trek_level: document.getElementById('trek_level').value,

            lat: parseFloat(document.getElementById('lat').value) || null,
            lng: parseFloat(document.getElementById('lng').value) || null,

            short_desc: document.getElementById('short_desc').value,
            description: document.getElementById('description').value,

            // If new upload -> use it. If not, use existing input values (Select or URL)
            thumbnail_path: thumbPath || document.getElementById('thumbnail_select').value || document.getElementById('thumbnail_url').value,
            hero_path: heroPath || document.getElementById('hero_select').value || document.getElementById('hero_url').value,

            moods: moods
        };

        let error;
        if (id) {
            const { error: err } = await supabase.from('destinations').update(formData).eq('id', id);
            error = err;
        } else {
            const { error: err } = await supabase.from('destinations').insert([formData]);
            error = err;
        }

        if (error) throw error;

        alert("Berhasil disimpan!");
        window.location.href = 'destinations.html';

    } catch (err) {
        alert("Gagal menyimpan: " + err.message);
        console.error(err);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleImageUpload(prefix) {
    const fileInput = document.getElementById(`${prefix}_file`);
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        // Ensure bucket exists or handle error (Assuming 'destinations' bucket from setup_admin_reqs.sql)
        const { data, error } = await supabase.storage
            .from('destinations')
            .upload(fileName, file);

        if (error) {
            console.error("Upload Error:", error);
            throw new Error(`Gagal upload ${prefix}: ${error.message}`);
        }

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('destinations')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }
    return null; // No file to upload
}
