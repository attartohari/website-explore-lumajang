import { supabase } from '../../utils/supabase.js';

const listContainer = document.getElementById('newsletter-list');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');

let allSubscribers = [];

// INIT
async function loadSubscribers() {
    listContainer.innerHTML = '<div id="loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>';

    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        listContainer.innerHTML = `<div style="padding:2rem; text-align:center;">Gagal memuat data. Pastikan Anda sudah menjalankan SQL script untuk izin Admin.<br><small>${error.message}</small></div>`;
        return;
    }

    allSubscribers = data || [];
    renderList(allSubscribers);
}

function renderList(data) {
    if (data.length === 0) {
        listContainer.innerHTML = '<div style="padding:2rem; text-align:center;">Tidak ada data subscriber.</div>';
        return;
    }

    listContainer.innerHTML = data.map(sub => `
        <div class="data-row">
            <div>
                <i class="fa-regular fa-envelope" style="color:var(--primary); margin-right:8px;"></i>
                ${sub.email}
            </div>
            <div>
                ${(sub.interests || []).map(i => `<span class="interest-tag">${i}</span>`).join('') || '-'}
            </div>
            <div style="font-size:0.9rem; color:#aaa;">
                ${new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div>
                <button class="action-btn" onclick="window.deleteSub('${sub.id}')" title="Hapus"><i class="fa-solid fa-trash" style="color:#ef4444;"></i></button>
            </div>
        </div>
    `).join('');
}

// SEARCH
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allSubscribers.filter(sub =>
        sub.email.toLowerCase().includes(term) ||
        (sub.interests && sub.interests.some(i => i.toLowerCase().includes(term)))
    );
    renderList(filtered);
});

// DELETE
window.deleteSub = async (id) => {
    if (!confirm("Hapus subscriber ini dari list?")) return;

    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) alert("Gagal menghapus.");
    else loadSubscribers(); // Reload
};

// EXPORT CSV
exportBtn.addEventListener('click', () => {
    if (allSubscribers.length === 0) {
        alert("Tidak ada data untuk diexport.");
        return;
    }

    const headers = ["ID", "Email", "Interests", "Joined At"];
    const rows = allSubscribers.map(sub => [
        sub.id,
        sub.email,
        `"${(sub.interests || []).join(', ')}"`, // Quote logic for CSV
        sub.created_at
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

loadSubscribers();
