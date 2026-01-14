import { supabase } from '../../utils/supabase.js';

const listContainer = document.getElementById('article-list');

// --- LIST PAGE LOGIC ---
if (listContainer) {
    (async () => {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) {
            listContainer.innerHTML = 'Error loading articles.';
            return;
        }
        if (data.length === 0) {
            listContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Belum ada artikel.</div>';
            return;
        }

        listContainer.innerHTML = data.map(article => `
            <div class="article-card">
                 <img src="${article.cover_image || 'https://placehold.co/300x200'}" class="article-img">
                 <div class="article-body">
                    <div class="article-meta">
                        <span>${article.category}</span>
                        <span style="text-transform:capitalize;">${article.status}</span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <div class="article-actions">
                        <a href="form-article.html?id=${article.id}" class="btn-sm-outline">Edit</a>
                        <button onclick="window.deleteArticle('${article.id}')" class="btn-sm-outline" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.3);">Hapus</button>
                    </div>
                 </div>
            </div>
        `).join('');
    })();

    window.deleteArticle = async (id) => {
        if (!confirm("Hapus artikel ini?")) return;
        await supabase.from('articles').delete().eq('id', id);
        window.location.reload();
    };
}

// --- FORM PAGE LOGIC ---
const titleInput = document.getElementById('title');
if (titleInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let checklistId = null;

    // Auto Slug
    titleInput.addEventListener('input', (e) => {
        if (!id) {
            document.getElementById('slug').value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
    });

    // Image Upload
    document.getElementById('cover_file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `articles/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('explore-lumajang').upload(fileName, file);
        if (!error) {
            const { data } = supabase.storage.from('explore-lumajang').getPublicUrl(fileName);
            document.getElementById('cover_path').value = data.publicUrl;
            document.getElementById('cover_preview').src = data.publicUrl;
            document.getElementById('cover_preview').style.display = 'block';
        }
    });

    // Checklist UI Helpers
    window.addChecklistItem = (val = '') => {
        const div = document.createElement('div');
        div.className = 'checklist-item-row';
        div.innerHTML = `
            <input type="text" class="cl-item-text" placeholder="Item..." value="${val}">
            <button type="button" class="del-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
        `;
        document.getElementById('cl-items-container').appendChild(div);
    };

    // Load Data if Edit
    if (id) {
        document.getElementById('page-title').textContent = "Edit Artikel";
        const { data } = await supabase.from('articles').select('*').eq('id', id).single();
        if (data) {
            document.getElementById('title').value = data.title;
            document.getElementById('slug').value = data.slug;
            document.getElementById('content').value = data.content;
            document.getElementById('category').value = data.category;
            document.getElementById('status').value = data.status;
            document.getElementById('cover_path').value = data.cover_image;
            if (data.cover_image) {
                document.getElementById('cover_preview').src = data.cover_image;
                document.getElementById('cover_preview').style.display = 'block';
            }
        }

        // Load Checklist
        const { data: clData } = await supabase.from('checklists').select('*').eq('article_id', id).single();
        if (clData) {
            checklistId = clData.id;
            document.getElementById('cl_title').value = clData.title;
            if (clData.items && Array.isArray(clData.items)) {
                clData.items.forEach(itemStr => window.addChecklistItem(itemStr));
            }
        }
    } else {
        // Init one checklist item
        window.addChecklistItem();
    }

    // SAVE
    document.getElementById('save-btn').addEventListener('click', async () => {
        const payload = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value,
            content: document.getElementById('content').value,
            category: document.getElementById('category').value,
            status: document.getElementById('status').value,
            cover_image: document.getElementById('cover_path').value,
            updated_at: new Date()
        };

        let articleId = id;

        if (id) {
            await supabase.from('articles').update(payload).eq('id', id);
        } else {
            const { data, error } = await supabase.from('articles').insert([payload]).select();
            if (error) { alert("Error: " + error.message); return; }
            articleId = data[0].id;
        }

        // Save Checklist
        const clTitle = document.getElementById('cl_title').value;
        const clItems = Array.from(document.querySelectorAll('.cl-item-text')).map(i => i.value).filter(v => v.trim() !== '');

        if (clTitle && clItems.length > 0) {
            const clPayload = {
                article_id: articleId,
                title: clTitle,
                items: clItems
            };

            if (checklistId) {
                await supabase.from('checklists').update(clPayload).eq('id', checklistId);
            } else {
                await supabase.from('checklists').insert([clPayload]);
            }
        }

        alert("Artikel berhasil disimpan!");
        window.location.href = 'tips.html';
    });
}
