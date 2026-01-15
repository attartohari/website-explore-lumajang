
import { supabase } from '../../utils/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dest-table-body')) {
        init();
    }
});

async function init() {
    console.log("Admin Destinations Init");
    await fetchDestinations();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            filterTable(term);
        });
    }

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

let allData = [];

async function fetchDestinations() {
    const tbody = document.getElementById('dest-table-body');
    if (!tbody) return;

    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="error">Error: ${error.message}</td></tr>`;
        return;
    }

    allData = data || [];
    renderTable(allData);
}

function renderTable(data) {
    const tbody = document.getElementById('dest-table-body');
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada data destinasi.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => {
        const img = item.thumbnail_path
            ? (item.thumbnail_path.startsWith('http') ? item.thumbnail_path : `../${item.thumbnail_path.replace(/^\//, '')}`)
            : '../assets/images/ui/placeholder.png'; // Adjusted for admin folder depth

        // Fix path if it already has assets
        // admin is at /admin/. assets are at /assets/.
        // So ../assets/ is correct.
        // But if DB has 'assets/images/destinasi/foo.png', then `../` + path is good.

        // Status Badge Color
        let statusClass = 'status-inactive';
        if (item.status === 'published') statusClass = 'status-active';
        if (item.status === 'archived') statusClass = 'status-archived';

        return `
            <tr>
                <td>
                    <img src="${img}" alt="thumb" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>
                    <div style="font-weight:600;">${item.name}</div>
                    <div style="font-size:0.8rem; color:#888;">/${item.slug}</div>
                </td>
                <td>
                     ${Array.isArray(item.category) ? item.category.join(', ') : item.category}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${item.status || 'draft'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <a href="form-destination.html?id=${item.id}" class="btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></a>
                        <button onclick="deleteDest('${item.id}')" class="btn-icon delete" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterTable(term) {
    const filtered = allData.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.slug.toLowerCase().includes(term)
    );
    renderTable(filtered);
}

window.deleteDest = async (id) => {
    if (!confirm("Yakin ingin menghapus destinasi ini? Data yang dihapus tidak bisa dikembalikan.")) return;

    const { error } = await supabase.from('destinations').delete().eq('id', id);

    if (error) {
        alert("Gagal menghapus: " + error.message);
    } else {
        // Optimistic update
        allData = allData.filter(d => d.id !== id);
        renderTable(allData);
        // alert("Destinasi berhasil dihapus.");
    }
};
