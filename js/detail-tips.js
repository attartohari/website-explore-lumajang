import { supabase } from '../utils/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
});

async function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'tips.html'; // Redirect if no slug
        return;
    }

    const { data: article, error } = await supabase.from('articles').select('*').eq('slug', slug).single();

    if (error || !article) {
        document.querySelector('main').innerHTML = `
            <div class="container section text-center" style="padding:5rem 0;">
                <h1 style="font-size:3rem; margin-bottom:1rem;">404</h1>
                <p class="text-muted">Artikel yang kamu cari tidak ditemukan atau sudah dihapus.</p>
                <a href="tips.html" class="btn btn-primary mt-2">Kembali ke Tips</a>
            </div>
         `;
        return;
    }

    // Render Data
    document.title = `${article.title} - Explore Lumajang`;

    // Hero
    const heroBg = document.getElementById('hero-bg');
    if (article.cover_image) {
        heroBg.style.backgroundImage = `url('${article.cover_image}')`;
    }

    document.getElementById('title').textContent = article.title;
    document.getElementById('cat-badge').textContent = article.category;
    document.getElementById('content').innerHTML = article.content;

    // Fetch Checklist
    const { data: checklist } = await supabase.from('checklists').select('*').eq('article_id', article.id).single();

    if (checklist && checklist.items && checklist.items.length > 0) {
        renderPlanner(checklist);
    }
}

function renderPlanner(checklist) {
    const container = document.getElementById('planner-container');
    container.innerHTML = `
      <div class="planner-widget">
          <div class="planner-header">
              <div class="planner-title">📋 ${checklist.title}</div>
              <small>Checklist Persiapan</small>
          </div>
          <div id="planner-list">
              ${checklist.items.map((item) => `
                  <div class="planner-item" onclick="this.classList.toggle('checked')">
                      <div class="planner-check"><i class="fa-solid fa-check"></i></div>
                      <span>${item}</span>
                  </div>
              `).join('')}
          </div>
          <div style="margin-top:1.5rem; text-align:center; font-size:0.8rem; color:#888;">
             <i class="fa-regular fa-lightbulb"></i> Klik item untuk menandai selesai
          </div>
      </div>
  `;
}
