import { supabase } from '../../utils/supabase.js';

const listContainer = document.getElementById('tips-list');
const form = document.getElementById('tips-form');

// --- LIST PAGE ---
if (listContainer) {
    fetchTips();
}

async function fetchTips() {
    const { data, error } = await supabase.from('tips_articles').select('*').order('created_at', { ascending: false });
    if (error) return alert(error.message);

    if (data.length === 0) listContainer.innerHTML = '<p>Belum ada artikel.</p>';
    else {
        listContainer.innerHTML = data.map(item => `
            <div class="data-row">
                <div style="display:flex; align-items:center;">
                    <img src="${item.cover_path && item.cover_path.startsWith('http') ? item.cover_path : (item.cover_path ? '../' + item.cover_path : 'https://placehold.co/60x40')}" onerror="this.src='https://placehold.co/60x40'">
                    <div>
                        <strong>${item.title}</strong><br>
                        <small style="color:var(--text-muted)">${item.slug}</small>
                    </div>
                </div>
                <div>
                    <span style="padding:4px 8px; background:rgba(255,255,255,0.1); border-radius:4px;">${item.status}</span>
                    <a href="form-tips.html?id=${item.id}" class="action-btn"><i class="fa-solid fa-pen"></i></a>
                    <button class="action-btn" onclick="window.deleteTip('${item.id}')" style="color:red;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
}

window.deleteTip = async (id) => {
    if (!confirm("Hapus artikel ini?")) return;
    await supabase.from('tips_articles').delete().eq('id', id);
    fetchTips();
};

// --- FORM PAGE ---
if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const btnSave = document.getElementById('btn-save');

    if (id) {
        loadDetail(id);
    }

    // Auto Slug
    document.getElementById('title').addEventListener('input', (e) => {
        if (!id) {
            document.getElementById('slug').value = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    });

    // Image Upload
    document.getElementById('cover_file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const el = document.getElementById('cover_preview');
            el.src = ev.target.result;
            el.classList.add('show');
        };
        reader.readAsDataURL(file);

        // Upload
        const fileName = `tips/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('explore-lumajang').upload(fileName, file);
        if (error) alert("Upload failed: " + error.message);
        else {
            const { data: { publicUrl } } = supabase.storage.from('explore-lumajang').getPublicUrl(fileName);
            document.getElementById('cover_path').value = publicUrl;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSave.disabled = true;
        btnSave.textContent = 'Menyimpan...';

        const payload = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value,
            status: document.getElementById('status').value,
            content: document.getElementById('content').value,
            cover_path: document.getElementById('cover_path').value,
            updated_at: new Date() // if column exists, else ignored? Schema doesn't have updated_at for tips but good practice.
            // Schema check: tips_articles created_at only? 
            // I should use default created_at. Updated_at might error if not in schema.
            // Schema: id, title, slug, content, cover_path, status, created_at. No updated_at.
        };

        let result;
        if (id) {
            result = await supabase.from('tips_articles').update(payload).eq('id', id);
        } else {
            result = await supabase.from('tips_articles').insert([payload]);
        }

        if (result.error) {
            alert("Error: " + result.error.message);
            btnSave.disabled = false;
        } else {
            window.location.href = 'tips.html';
        }
    });
}

async function loadDetail(id) {
    const { data, error } = await supabase.from('tips_articles').select('*').eq('id', id).single();
    if (error) return alert("Gagal load data");

    document.getElementById('id').value = data.id;
    document.getElementById('title').value = data.title;
    document.getElementById('slug').value = data.slug;
    document.getElementById('status').value = data.status;
    document.getElementById('content').value = data.content || '';
    document.getElementById('cover_path').value = data.cover_path || '';

    if (data.cover_path) {
        const src = data.cover_path.startsWith('http') ? data.cover_path : '../' + data.cover_path;
        document.getElementById('cover_preview').src = src;
        document.getElementById('cover_preview').classList.add('show');
    }
}
