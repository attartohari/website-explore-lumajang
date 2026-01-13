import { supabase } from './utils/supabase.js';

// Internal State
const collectionSet = new Set();
let isInitialized = false;

// Initialize
async function initCollections() {
    if (isInitialized) return;

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // 1. Logged In: Sync with DB
        const { data, error } = await supabase
            .from('favorites')
            .select('destination_id')
            .eq('user_id', session.user.id);

        if (data) {
            data.forEach(item => collectionSet.add(item.destination_id));
        }
    } else {
        // 2. Guest: LocalStorage
        const stored = localStorage.getItem('explore_lumajang_favs');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                ids.forEach(id => collectionSet.add(id));
            } catch (e) { console.error("Fav parse error", e); }
        }
    }

    isInitialized = true;
    updateGlobalUI();
}

// Toggle (Save/Unsave)
async function toggleCollection(id, btnElement) {
    if (!isInitialized) await initCollections();

    const { data: { session } } = await supabase.auth.getSession();
    const exists = collectionSet.has(id);

    if (exists) {
        // Remove
        collectionSet.delete(id);
        if (session) {
            await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('destination_id', id);
        }
    } else {
        // Add
        collectionSet.add(id);
        if (session) {
            await supabase.from('favorites').insert({ user_id: session.user.id, destination_id: id });
        }
    }

    // Update LocalStorage (always for backup or guest)
    if (!session) {
        localStorage.setItem('explore_lumajang_favs', JSON.stringify([...collectionSet]));
    }

    // UI Updates
    updateButtonUI(btnElement, !exists);

    // Update all instances of this button (e.g. if multiple cards of same ID exist)
    document.querySelectorAll(`.fav-btn[onclick*="'${id}'"]`).forEach(btn => {
        if (exists) {
            btn.classList.remove('active');
            btn.title = "Simpan";
            const icon = btn.querySelector('i');
            if (icon) { icon.classList.remove('fa-solid'); icon.classList.add('fa-regular'); }
        } else {
            btn.classList.add('active');
            btn.title = "Tersimpan";
            const icon = btn.querySelector('i');
            if (icon) { icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); }
        }
    });

    // If modal is open, refresh it
    const modal = document.getElementById('collection-modal');
    if (modal && modal.classList.contains('active')) {
        openCollectionModal(); // Reload list
    }
}

function updateButtonUI(btn, isActive) {
    if (!btn) return;
    if (isActive) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

function updateGlobalUI() {
    // Initial sync of all buttons on page
    document.querySelectorAll('.fav-btn').forEach(btn => {
        // Extract ID from onclick attribute... clumsy but necessary if ID not on element
        // Better: renderDestinations should add data-id to btn
        // Fallback: Check button onclick string
        const onclickStr = btn.getAttribute('onclick');
        if (onclickStr) {
            const match = onclickStr.match(/'([^']+)'/);
            if (match && match[1]) {
                const id = match[1];
                if (collectionSet.has(id)) {
                    updateButtonUI(btn, true);
                }
            }
        }
    });
}

// Modal
async function openCollectionModal() {
    if (!isInitialized) await initCollections();

    let modal = document.getElementById('collection-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'collection-modal';
        modal.className = 'custom-modal';
        modal.innerHTML = `
      <div class="modal-bg" onclick="this.parentElement.classList.remove('active')"></div>
      <div class="modal-body">
        <button class="close-modal" onclick="this.closest('.custom-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-header"><h3>Koleksi Tersimpan (${collectionSet.size})</h3></div>
        <div id="collection-list" class="collection-list">
            <div style="text-align:center; padding:2rem;"><i class="fa-solid fa-spinner fa-spin"></i></div>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
    const container = document.getElementById('collection-list');
    const countEl = modal.querySelector('.modal-header h3');
    countEl.textContent = `Koleksi Tersimpan (${collectionSet.size})`;

    if (collectionSet.size === 0) {
        container.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--text-muted);">
            <i class="fa-regular fa-heart" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
            <p>Belum ada destinasi yang disimpan.</p>
        </div>
      `;
        return;
    }

    // Fetch details
    // Note: We need details for these IDs. Supabase 'in' query.
    const ids = [...collectionSet];
    const { data, error } = await supabase
        .from('destinations')
        .select('id, name, slug, thumbnail_path')
        .in('id', ids);

    if (data) {
        container.innerHTML = data.map(item => {
            const img = item.thumbnail_path && item.thumbnail_path.startsWith('http') ? item.thumbnail_path :
                (item.thumbnail_path ? `https://gqfgLzMcfjXyVdZ.supabase.co/storage/v1/object/public/explore-lumajang/${item.thumbnail_path}` : 'assets/images/ui/putih.png'); // Hardcoded URL for now as placeholder, ideally use config
            // Actually, let's just use simplistic path if not full url, assuming base path handled in img tag or valid relative
            // But wait, the original code had hardcoded URL. I should copy the STORAGE logic if possible or just use a helper. 
            // I'll try to use relative or safe check.

            return `
            <div class="collection-item" style="display:flex; gap:1rem; padding:1rem; border-bottom:1px solid var(--border); align-items:center;">
                <img src="${img}" style="width:80px; height:60px; object-fit:cover; border-radius:8px;">
                <div style="flex:1;">
                    <a href="detail-wisata.html?slug=${item.slug}" style="font-weight:bold; color:var(--text); text-decoration:none; display:block;">${item.name}</a>
                </div>
                <button onclick="window.toggleCollection('${item.id}', this)" class="btn-sm-text" style="color:var(--danger);"><i class="fa-solid fa-trash"></i></button>
            </div>
          `;
        }).join('');
    } else {
        container.innerHTML = '<p class="error">Gagal memuat data.</p>';
    }
}

// Global Exports
window.collections = {
    has: (id) => collectionSet.has(id)
};
window.toggleCollection = toggleCollection;
window.openCollectionModal = openCollectionModal;

// Auto Init
document.addEventListener('DOMContentLoaded', initCollections);
