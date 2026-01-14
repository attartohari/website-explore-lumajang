
import { supabase } from '../../utils/supabase.js';

// Elements
const listContainer = document.getElementById('dest-list');

// --- FUNCTIONS ---

const fetchDestinations = async () => {
    // Admin can see ALL statuses
    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        listContainer.innerHTML = `<div style="padding:1rem; color:red;">Error: ${error.message}</div>`;
        return;
    }

    renderList(data);
};

const renderList = (data) => {
    if (data.length === 0) {
        listContainer.innerHTML = '<div style="padding:1rem; text-align:center;">Belum ada data destinasi.</div>';
        return;
    }

    listContainer.innerHTML = data.map(item => `
        <div class="data-row">
            <img src="${item.thumbnail_path ? '../' + item.thumbnail_path : 'https://placehold.co/60x40'}" class="thumb-img" onerror="this.src='https://placehold.co/60x40'">
            <div>
                <strong style="display:block; font-size:1.1rem;">${item.name}</strong>
                <span style="font-size:0.85rem; color:var(--text-muted);">${item.slug}</span>
            </div>
            <div>
                 ${item.category && item.category[0] ? `<span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px; font-size:0.8rem;">${item.category[0]}</span>` : '-'}
            </div>
            <div>
                <span class="status-badge status-${item.status}">${item.status}</span>
            </div>
            <div>
                <a href="form-trip.html?id=${item.id}" class="action-btn" title="Edit"><i class="fa-solid fa-pen"></i></a>
                <a href="detail-builder.html?id=${item.id}" class="action-btn" style="color:var(--primary);" title="Page Builder"><i class="fa-solid fa-layer-group"></i></a>
                <!-- Soft Delete / Archive Toggle -->
                ${item.status !== 'archived'
            ? `<button class="action-btn" onclick="window.archiveItem('${item.id}')" title="Arsipkan"><i class="fa-solid fa-box-archive"></i></button>`
            : `<button class="action-btn" onclick="window.restoreItem('${item.id}')" title="Kembalikan"><i class="fa-solid fa-box-open"></i></button>`
        }
            </div>
        </div>
    `).join('');
};

window.archiveItem = async (id) => {
    if (!confirm("Anda yakin ingin mengarsipkan destinasi ini? Data tidak akan tampil di publik.")) return;

    const { error } = await supabase
        .from('destinations')
        .update({ status: 'archived' })
        .eq('id', id);

    if (error) alert(error.message);
    else fetchDestinations();
};

window.restoreItem = async (id) => {
    const { error } = await supabase
        .from('destinations')
        .update({ status: 'draft' }) // Restore to draft for safety
        .eq('id', id);

    if (error) alert(error.message);
    else fetchDestinations();
};

// INIT
if (document.getElementById('dest-list')) {
    fetchDestinations();
}

// FORM HANDLING
const form = document.getElementById('trip-form');
if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const pageTitle = document.getElementById('page-title');
    const btnSave = document.getElementById('btn-save');

    if (id) {
        pageTitle.textContent = "Edit Destinasi";
        // Enable Tabs
        document.getElementById('tab-btn-gallery').disabled = false;
        document.getElementById('tab-btn-spots').disabled = false;
        document.getElementById('tab-btn-gallery').title = "";
        document.getElementById('tab-btn-spots').title = "";

        loadDetail(id);
        loadGallery(id);
        loadSpots(id);
        loadNearby(id);

        setupGalleryUpload(id);
        setupSpotsForm(id);
        setupNearbyForm(id);
    }

    // Auto Slug
    document.getElementById('name').addEventListener('input', (e) => {
        if (!id) { // Only auto slug on create
            document.getElementById('slug').value = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    });

    // Image Previews
    setupImageUpload('thumb_file', 'thumb_preview', 'thumbnail_path');
    setupImageUpload('hero_file', 'hero_preview', 'hero_path');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

        const payload = {
            name: document.getElementById('name').value,
            slug: document.getElementById('slug').value,
            category: document.getElementById('category').value.split(',').map(s => s.trim()),
            status: document.getElementById('status').value,
            short_desc: document.getElementById('short_desc').value,
            description: document.getElementById('description').value,
            open_hours: document.getElementById('open_hours').value,
            ticket_price: document.getElementById('ticket_price').value,
            lat: parseFloat(document.getElementById('lat').value) || 0,
            lng: parseFloat(document.getElementById('lng').value) || 0,
            best_time: document.getElementById('best_time').value,
            trek_level: document.getElementById('trek_level').value,
            season: document.getElementById('season').value,
            visitor_percent: parseInt(document.getElementById('visitor_percent').value) || 0,
            is_trending: document.getElementById('is_trending').checked,
            is_recommended: document.getElementById('is_recommended').checked,
            thumbnail_path: document.getElementById('thumbnail_path').value,
            hero_path: document.getElementById('hero_path').value,
            updated_at: new Date()
        };

        let result;
        if (id) {
            const { error } = await supabase.from('destinations').update(payload).eq('id', id);
            result = { error };
        } else {
            const { error } = await supabase.from('destinations').insert([payload]);
            result = { error };
        }

        if (result.error) {
            alert("Error: " + result.error.message);
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fa-solid fa-save"></i> Simpan Destinasi';
        } else {
            alert("Berhasil disimpan!");
            window.location.href = 'dashboard.html';
        }
    });
}

async function loadDetail(id) {
    const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();
    if (error) {
        alert("Gagal ambil data");
        return;
    }

    document.getElementById('id').value = data.id;
    document.getElementById('name').value = data.name;
    document.getElementById('slug').value = data.slug;
    document.getElementById('category').value = data.category ? data.category.join(', ') : '';
    document.getElementById('status').value = data.status;
    document.getElementById('short_desc').value = data.short_desc || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('open_hours').value = data.open_hours || '';
    document.getElementById('ticket_price').value = data.ticket_price || '';
    document.getElementById('lat').value = data.lat || '';
    document.getElementById('lng').value = data.lng || '';
    document.getElementById('best_time').value = data.best_time || '';
    document.getElementById('trek_level').value = data.trek_level || '-';
    document.getElementById('season').value = data.season || 'All Season';
    document.getElementById('visitor_percent').value = data.visitor_percent || 0;
    document.getElementById('is_trending').checked = data.is_trending || false;
    document.getElementById('is_recommended').checked = data.is_recommended || false;
    document.getElementById('thumbnail_path').value = data.thumbnail_path || '';
    document.getElementById('hero_path').value = data.hero_path || '';

    if (data.thumbnail_path) {
        document.getElementById('thumb_preview').src = data.thumbnail_path.startsWith('http') ? data.thumbnail_path : '../' + data.thumbnail_path; // Handle absolute/relative? 
        // NOTE: If using storage, path is likely not having http unless public URL. 
        // For local assets, it's relative. For Supabase storage, we usually store the public URL or just path.
        // My migration script used 'assets/images...'.
        // My storage logic below uses publicUrl.
        // Let's make sure preview handles it.
        const src = data.thumbnail_path.startsWith('http') ? data.thumbnail_path : '../' + data.thumbnail_path;
        document.getElementById('thumb_preview').src = src;
        document.getElementById('thumb_preview').classList.add('show');
    }
    if (data.hero_path) {
        const src = data.hero_path.startsWith('http') ? data.hero_path : '../' + data.hero_path;
        document.getElementById('hero_preview').src = src;
        document.getElementById('hero_preview').classList.add('show');
    }
}

function setupImageUpload(inputId, previewId, pathInputId) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual Preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            const el = document.getElementById(previewId);
            el.src = ev.target.result;
            el.classList.add('show');
        }
        reader.readAsDataURL(file);

        // Upload to Supabase
        const slug = document.getElementById('slug').value || 'temp';
        const fileName = `${slug}/${Date.now()}-${file.name}`;

        // Disable save button while uploading?
        // Let's just hope it's fast or show status

        const { data, error } = await supabase.storage
            .from('explore-lumajang')
            .upload(`destinations/${fileName}`, file);

        if (error) {
            alert("Upload Gagal: " + error.message);
            // Revert?
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('explore-lumajang')
                .getPublicUrl(`destinations/${fileName}`);

            document.getElementById(pathInputId).value = publicUrl;
            console.log("Uploaded to: ", publicUrl);
        }
    });
}
// --- GALLERY LOGIC ---
async function loadGallery(id) {
    const { data } = await supabase.from('destination_images')
        .select('*').eq('destination_id', id).order('created_at');

    const container = document.getElementById('gallery-container');
    container.innerHTML = data.map(img => `
        <div class="gallery-item">
            <img src="${img.image_path.startsWith('http') ? img.image_path : '../' + img.image_path}">
            <button class="btn-delete-img" onclick="window.deleteGalleryImage('${img.id}', '${img.image_path}')"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function setupGalleryUpload(destId) {
    const input = document.getElementById('gallery_files');
    input.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        for (let file of files) {
            const fileName = `gallery/${destId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('explore-lumajang')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload failed", uploadError);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('explore-lumajang')
                .getPublicUrl(fileName);

            // Insert to DB
            await supabase.from('destination_images').insert({
                destination_id: destId,
                image_path: publicUrl,
                caption: file.name
            });
        }
        loadGallery(destId);
        input.value = ''; // Reset
    });
}

window.deleteGalleryImage = async (id, path) => {
    if (!confirm("Hapus foto ini?")) return;

    // Delete from DB
    await supabase.from('destination_images').delete().eq('id', id);
    // Ideally delete from Storage too, but simpler to just del from DB for now

    // Reload
    const urlParams = new URLSearchParams(window.location.search);
    loadGallery(urlParams.get('id'));
};

// --- SPOTS & NEARBY LOGIC ---
async function loadSpots(id) {
    const { data } = await supabase.from('photo_spots').select('*').eq('destination_id', id);
    const container = document.getElementById('spots-list');
    container.innerHTML = data.map(s => `
        <div class="spot-item">
            <div><strong>${s.name}</strong><br><small>${s.description || ''}</small></div>
            <button onclick="window.deleteSpot('${s.id}')" style="color:red;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

async function loadNearby(id) {
    const { data } = await supabase.from('nearby_places').select('*').eq('destination_id', id);
    const container = document.getElementById('nearby-list');
    container.innerHTML = data.map(n => `
        <div class="spot-item">
            <div><strong>${n.name}</strong> (${n.type})<br><small>${n.maps_url ? '<a href="' + n.maps_url + '" target="_blank">Maps</a>' : ''}</small></div>
            <button onclick="window.deleteNearby('${n.id}')" style="color:red;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function setupSpotsForm(destId) {
    document.getElementById('spot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('spot_name').value;
        const desc = document.getElementById('spot_desc').value;

        await supabase.from('photo_spots').insert({ destination_id: destId, name, description: desc });
        document.getElementById('spot_name').value = '';
        document.getElementById('spot_desc').value = '';
        loadSpots(destId);
    });
}

function setupNearbyForm(destId) {
    document.getElementById('nearby-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nearby_name').value;
        const type = document.getElementById('nearby_type').value;
        const map = document.getElementById('nearby_map').value;

        await supabase.from('nearby_places').insert({ destination_id: destId, name, type, maps_url: map });
        document.getElementById('nearby_name').value = '';
        document.getElementById('nearby_map').value = '';
        loadNearby(destId);
    });
}

window.deleteSpot = async (id) => {
    if (!confirm("Hapus spot?")) return;
    await supabase.from('photo_spots').delete().eq('id', id);
    const urlParams = new URLSearchParams(window.location.search);
    loadSpots(urlParams.get('id'));
};

window.deleteNearby = async (id) => {
    if (!confirm("Hapus tempat?")) return;
    await supabase.from('nearby_places').delete().eq('id', id);
    const urlParams = new URLSearchParams(window.location.search);
    loadNearby(urlParams.get('id'));
};
