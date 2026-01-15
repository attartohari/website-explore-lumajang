import { supabase, checkAuth } from '../../utils/supabase.js';
// ../../ because this is in admin/js/ and utils is in root/utils? 
// Wait, admin is in d:/root/admin/ so admin/js is d:/root/admin/js
// utils is d:/root/utils
// So path is ../../utils/supabase.js
// Let's verify directory structure again.
// d:/website-explore-lumajang/admin/js/form-article.js -> ../../utils/supabase.js (Correct)

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // await checkAuth(); // Ensure logged in

    // Load existing if ID present
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        await loadArticle(id);
    }

    // Bind Save
    document.getElementById('save-btn').addEventListener('click', () => saveArticle(id));

    // Bind Image Upload Preview
    document.getElementById('cover_file').addEventListener('change', handleFileSelect);

    // Bind Manual URL Preview
    document.getElementById('cover_url_manual').addEventListener('input', (e) => {
        const preview = document.getElementById('cover_preview');
        if (e.target.value) {
            preview.src = e.target.value;
            preview.style.display = 'block';
            document.getElementById('cover_path').value = e.target.value; // Use manual URL as path
        }
    });

    // Checklist Global Func
    window.addChecklistItem = (val = '') => {
        const container = document.getElementById('cl-items-container');
        const div = document.createElement('div');
        div.className = 'checklist-item-row';
        div.innerHTML = `
            <input type="text" class="cl-item-input" value="${val}" placeholder="Item checklist...">
            <button type="button" class="del-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
        `;
        container.appendChild(div);
    };
});

async function loadArticle(id) {
    document.getElementById('page-title').textContent = "Edit Artikel";

    const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error loading: ' + error.message);
        return;
    }

    // Populate Fields
    document.getElementById('title').value = article.title;
    document.getElementById('slug').value = article.slug;
    document.getElementById('category').value = article.category;
    document.getElementById('status').value = article.status;
    document.getElementById('content').value = article.content || '';
    document.getElementById('excerpt').value = article.excerpt || '';
    document.getElementById('mood_tags').value = article.mood_tags ? article.mood_tags.join(', ') : '';
    document.getElementById('is_featured').checked = article.is_featured || false;

    // Image
    if (article.cover_image) {
        document.getElementById('cover_preview').src = article.cover_image;
        document.getElementById('cover_preview').style.display = 'block';
        document.getElementById('cover_path').value = article.cover_image;
        document.getElementById('cover_url_manual').value = article.cover_image;
    }

    // Load Checklist
    const { data: cl } = await supabase.from('checklists').select('*').eq('article_id', id).single();
    if (cl) {
        document.getElementById('cl_title').value = cl.title;
        if (cl.items && Array.isArray(cl.items)) {
            cl.items.forEach(item => window.addChecklistItem(item));
        }
    }
}

async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Upload to Supabase Storage
    const fileName = `covers/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);

    if (error) {
        alert("Upload Failed: " + error.message);
        return;
    }

    // Get Public URL
    const { data: publicData } = supabase.storage.from('images').getPublicUrl(fileName);
    const publicUrl = publicData.publicUrl;

    document.getElementById('cover_path').value = publicUrl;
    document.getElementById('cover_preview').src = publicUrl;
    document.getElementById('cover_preview').style.display = 'block';
}

async function saveArticle(id) {
    const title = document.getElementById('title').value;
    const slug = document.getElementById('slug').value || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const category = document.getElementById('category').value;
    const status = document.getElementById('status').value;
    const content = document.getElementById('content').value;
    const excerpt = document.getElementById('excerpt').value;
    const cover_image = document.getElementById('cover_path').value;
    const is_featured = document.getElementById('is_featured').checked;

    const moodTagsInput = document.getElementById('mood_tags').value;
    const mood_tags = moodTagsInput ? moodTagsInput.split(',').map(s => s.trim()) : [];

    if (!title) return alert("Judul wajib diisi!");

    const payload = {
        title, slug, category, status, content, excerpt, cover_image, is_featured, mood_tags,
        updated_at: new Date()
    };

    let activeId = id;

    if (id) {
        // Update
        const { error } = await supabase.from('articles').update(payload).eq('id', id);
        if (error) return alert("Error update: " + error.message);
    } else {
        // Insert
        const { data, error } = await supabase.from('articles').insert([payload]).select();
        if (error) return alert("Error insert: " + error.message);
        activeId = data[0].id;
    }

    // Save Checklist
    await saveChecklist(activeId);

    alert("Berhasil disimpan!");
    window.location.href = 'tips.html'; // Back to list
}

async function saveChecklist(articleId) {
    const title = document.getElementById('cl_title').value;
    const itemInputs = document.querySelectorAll('.cl-item-input');
    const items = Array.from(itemInputs).map(i => i.value).filter(v => v);

    if (!title && items.length === 0) return; // Nothing to save

    // Check if exists
    const { data: existing } = await supabase.from('checklists').select('id').eq('article_id', articleId).single();

    const clPayload = {
        article_id: articleId,
        title: title || 'Checklist',
        items: items
    };

    if (existing) {
        await supabase.from('checklists').update(clPayload).eq('id', existing.id);
    } else {
        await supabase.from('checklists').insert([clPayload]);
    }
}
