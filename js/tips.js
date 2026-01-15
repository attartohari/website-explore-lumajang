import { supabase } from '../utils/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();

    // Event Listeners for Filter/Search
    document.getElementById('tips-search').addEventListener('input', debounce(loadArticles, 500));
    document.getElementById('tips-category').addEventListener('change', loadArticles);
});

async function loadArticles() {
    const search = document.getElementById('tips-search').value;
    const category = document.getElementById('tips-category').value;

    // UI Loading State
    const grid = document.getElementById('articles-grid');
    const featuredGrid = document.getElementById('featured-grid');

    // We will render featured only on initial load or if no filter applied to keep it clean, 
    // or always? Let's keep it simple: Featured always shows pinned items, Main grid shows everything (or excludes featured? Standard is show everything sorted).
    // Let's make main grid filtered.

    // 1. Fetch Featured (Only if no search/filter usually, but let's just fetch once on init)
    // To make it efficient, we might fetch all and separate in JS, but for pagination sake let's do 2 queries.
    // For MVP, if not too many articles, fetching all is fine.

    let query = supabase.from('articles').select('*').eq('status', 'published').order('created_at', { ascending: false });

    // Apply filters
    if (search) query = query.ilike('title', `%${search}%`);
    if (category && category !== 'All') query = query.eq('category', category);

    const { data, error } = await query;

    if (error) {
        console.error("Error loading articles:", error);
        return;
    }

    renderFeatured(data); // We filter featured from this result or separate fetch?
    // Let's filter featured from the "All" set if no specific filter prevents it.
    // Actually, if user filters by "Safety", featured should also likely assume "Safety". 
    // So reusing 'data' is smart.

    renderGrid(data);
}

function renderFeatured(allArticles) {
    const container = document.getElementById('featured-grid');
    const section = document.getElementById('featured-section');

    // Filter items that are featured
    const featured = allArticles.filter(a => a.is_featured === true).slice(0, 2); // Show max 2-3 featured

    if (featured.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = featured.map(item => `
        <a href="detail-tips.html?slug=${item.slug}" class="featured-card" style="display:block;">
            <img src="${item.cover_image || 'assets/images/placeholder.jpg'}" style="width:100%; height:100%; object-fit:cover;">
            <div class="featured-overlay">
                <span style="background:var(--accent); color:#000; padding:2px 8px; border-radius:4px; font-weight:600; font-size:0.8rem; align-self:flex-start; margin-bottom:0.5rem;">
                    ${item.category}
                </span>
                <h3 style="color:#fff; font-family:var(--font-display); font-size:1.5rem; text-shadow:0 2px 4px rgba(0,0,0,0.5);">${item.title}</h3>
                <p style="color:rgba(255,255,255,0.9); font-size:0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.excerpt || ''}
                </p>
            </div>
        </a>
    `).join('');
}

function renderGrid(articles) {
    const container = document.getElementById('articles-grid');
    const emptyState = document.getElementById('empty-state');

    if (!articles || articles.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = articles.map(item => `
        <a href="detail-tips.html?slug=${item.slug}" class="cat-card-new" style="display:block; text-decoration:none; padding:0; overflow:hidden; min-height: 320px;">
             <div style="height: 180px; overflow: hidden; position: relative;">
                <img src="${item.cover_image || 'assets/images/placeholder.jpg'}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;">
                <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:#fff; padding:4px 8px; border-radius:4px; font-size:0.7rem;">
                    ${new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
             </div>
             <div style="padding: 1.5rem;">
                 <span style="font-size: 0.8rem; color: var(--accent); text-transform:uppercase; letter-spacing:1px; font-weight:600;">${item.category}</span>
                 <h3 style="margin: 0.5rem 0; color: var(--text); font-size: 1.25rem;">${item.title}</h3>
                 <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.excerpt || 'Baca selengkapnya untuk informasi lebih lanjut.'}
                 </p>
             </div>
        </a>
    `).join('');
}

// Utility Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
