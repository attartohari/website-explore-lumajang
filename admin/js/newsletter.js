import { supabase } from '../../utils/supabase.js';

// Elements
const listContainer = document.getElementById('newsletter-list');
const searchInput = document.getElementById('search-input');

// --- STATE ---
let allSubscribers = [];

// --- FUNCTIONS ---

const fetchSubscribers = async () => {
    // Show loading
    listContainer.innerHTML = '<div id="loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</div>';

    // Fetch data (Selecting specific columns is good practice)
    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, interests, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        listContainer.innerHTML = `
            <div style="padding:1rem; color:red; text-align:center;">
                <p>Gagal memuat data subscriber.</p>
                <small>Error: ${error.message}</small>
            </div>`;
        return;
    }

    allSubscribers = data || [];
    renderList(allSubscribers);
};

const renderList = (data) => {
    if (data.length === 0) {
        listContainer.innerHTML = '<div style="padding:1rem; text-align:center;">Belum ada subscriber.</div>';
        return;
    }

    listContainer.innerHTML = data.map(item => {
        // Handle Interests (Array or null)
        let interestsHTML = '-';
        if (item.interests && Array.isArray(item.interests) && item.interests.length > 0) {
            interestsHTML = item.interests.map(tag =>
                `<span class="interest-tag">${escapeHtml(tag)}</span>`
            ).join('');
        } else if (item.interests && typeof item.interests === 'string') {
            // Fallback if somehow stored as string
            interestsHTML = `<span class="interest-tag">${escapeHtml(item.interests)}</span>`;
        }

        // Format Date
        const date = new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
        <div class="data-row">
            <div>
                <strong>${escapeHtml(item.email)}</strong>
            </div>
            <div>
                ${interestsHTML}
            </div>
            <div style="font-size:0.9rem; color:var(--text-muted);">
                ${date}
            </div>
            <div>
                <button class="action-btn" onclick="window.deleteSubscriber('${item.id}')" title="Hapus" style="color:#ef4444;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
};

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Search Handler
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allSubscribers.filter(sub =>
            sub.email.toLowerCase().includes(term) ||
            (sub.interests && sub.interests.join(' ').toLowerCase().includes(term))
        );
        renderList(filtered);
    });
}

// Delete Handler (Global window object for onclick)
window.deleteSubscriber = async (id) => {
    if (!confirm("Hapus subscriber ini? Tindakan tidak dapat dibatalkan.")) return;

    const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Gagal menghapus: " + error.message);
    } else {
        // Optimistic update or refetch
        fetchSubscribers();
    }
}

// INIT
fetchSubscribers();
