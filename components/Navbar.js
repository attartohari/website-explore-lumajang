import { supabase } from '../utils/supabase.js';

export function renderNavbar(rootPath = '.') {
    // Ensure rootPath ends with / if it's not empty and not just '.'
    const pathPrefix = rootPath === '.' ? '' : (rootPath.endsWith('/') ? rootPath : rootPath + '/');

    return `
    <nav class="navbar">
        <div class="logo-container">
            <a href="${pathPrefix}index.html">
                <img src="${pathPrefix}assets/images/ui/putih.png" alt="Explore Lumajang" class="navbar-logo">
            </a>
        </div>

        <!-- CENTER: Navigation Links -->
        <div class="nav-center desktop-only">
            <a href="${pathPrefix}index.html" class="nav-link">Beranda</a>
            <a href="${pathPrefix}destinasi.html" class="nav-link">Destinasi</a>
            <a href="${pathPrefix}detail-wisata.html" class="nav-link">Detail Wisata</a>
            <a href="${pathPrefix}tips.html" class="nav-link">Tips</a>
            <a href="${pathPrefix}kontak.html" class="nav-link">Kontak</a>
        </div>

        <!-- RIGHT: Icons & Auth (Visible on Mobile too) -->
        <div class="nav-right">
            <button class="nav-icon" id="search-btn" title="Cari Destinasi">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>

            <!-- Collection: Desktop Only as per implicit mobile list -->
            <button class="nav-icon desktop-only" onclick="window.openCollectionModal()" title="Koleksi Saya"
                style="position:relative;">
                <i class="fa-regular fa-heart"></i>
            </button>

            <button class="nav-icon" id="theme-toggle" title="Mode Gelap/Terang">
                <i class="fa-solid fa-moon"></i>
            </button>

            <div id="auth-container">
                 <a href="${pathPrefix}login.html" class="nav-icon" title="Masuk">
                    <i class="fa-regular fa-user"></i>
                </a>
            </div>

            <!-- Mobile Toggle (Inside nav-right for alignment) -->
            <button class="nav-icon mobile-only" id="menu-toggle">
                <i class="fa-solid fa-bars-staggered"></i>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay">
        <div class="mobile-menu-content">
            <button class="close-menu"><i class="fa-solid fa-xmark"></i></button>
            <div class="mobile-nav-links">
                <a href="${pathPrefix}index.html">Beranda</a>
                <a href="${pathPrefix}destinasi.html">Destinasi</a>
                <a href="${pathPrefix}detail-wisata.html">Detail Wisata</a>
                <a href="${pathPrefix}tips.html">Tips</a>
                <a href="${pathPrefix}kontak.html">Kontak</a>
                <hr style="border-color:rgba(255,255,255,0.1)">
                <a href="#" onclick="window.openCollectionModal(); return false;">Koleksi Saya</a>
            </div>
        </div>
    </div>

    <!-- Search Overlay -->
    <div class="search-overlay">
        <button class="close-search"><i class="fa-solid fa-xmark"></i></button>
        <div class="search-container">
            <div class="search-box-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon-input"></i>
                <input type="text" id="global-search" placeholder="Cari destinasi, kuliner, event...">
                <div id="clear-search" class="hidden"><i class="fa-solid fa-xmark"></i> Hapus</div>
            </div>

            <div class="search-body">
                <!-- Initial State -->
                <div id="search-initial-state">
                    <div class="search-section-title">Pencarian Terakhir</div>
                    <div id="recent-searches" class="recent-tags">
                        <!-- Chips inserted by JS -->
                    </div>
                </div>

                <!-- Results State -->
                <div id="search-results-wrapper" class="hidden">
                    <div class="search-section-title">Hasil Pencarian</div>
                    <div id="search-results-container" class="search-results-grid"></div>
                    <div id="search-no-results" class="empty-placeholder hidden">
                        <i class="fa-solid fa-magnifying-glass-minus"></i>
                        <p>Tidak ditemukan hasil yang cocok.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function initNavbar() {
    initListeners();
    checkSession();
}

function initListeners() {
    // Mobile Menu
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
    const closeMenu = document.querySelector(".close-menu");

    if (menuToggle && mobileMenuOverlay) {
        // Remove old listeners to avoid duplicates (though difficult without reference)
        // Just adding new one is fine for page load
        menuToggle.onclick = () => {
            mobileMenuOverlay.classList.add("active");
            document.body.classList.add("menu-open");
        };
    }
    if (closeMenu && mobileMenuOverlay) {
        const close = () => {
            mobileMenuOverlay.classList.remove("active");
            document.body.classList.remove("menu-open");
        };
        closeMenu.onclick = close;
        mobileMenuOverlay.onclick = (e) => {
            if (e.target === mobileMenuOverlay) close();
        };
    }

    // Search
    const searchBtn = document.getElementById("search-btn");
    const searchOverlay = document.querySelector(".search-overlay");
    const closeSearch = document.querySelector(".close-search");
    const globalSearchInput = document.getElementById("global-search");

    if (searchBtn && searchOverlay) {
        searchBtn.onclick = () => {
            searchOverlay.classList.add("active");
            if (globalSearchInput) setTimeout(() => globalSearchInput.focus(), 100);
        };
    }
    if (closeSearch && searchOverlay) {
        closeSearch.onclick = () => searchOverlay.classList.remove("active");
    }

    // Escape Key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (searchOverlay && searchOverlay.classList.contains("active")) searchOverlay.classList.remove("active");
            if (mobileMenuOverlay && mobileMenuOverlay.classList.contains("active")) mobileMenuOverlay.classList.remove("active");
        }
    });

    // Scroll Listener for Glass Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Check initial
        if (window.scrollY > 50) navbar.classList.add('scrolled');
    }

    // Setup Logic
    setupSearchLogic();
    setupThemeToggle();
}

// ... COPY OF LOGIC FROM script.js (Simplified/Cleaned) ...

function setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const html = document.documentElement;
    const navbarLogo = document.querySelector(".navbar-logo");

    const savedTheme = localStorage.getItem("theme") || "dark";
    html.setAttribute("data-theme", savedTheme);
    updateIcon(savedTheme, themeToggle, navbarLogo);

    if (themeToggle) {
        // Clone to remove old listeners
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);

        newToggle.addEventListener("click", () => {
            const current = html.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            html.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            updateIcon(next, newToggle, document.querySelector(".navbar-logo"));
        });
    }
}

function updateIcon(theme, toggleBtn, logoImg) {
    if (!toggleBtn) return;
    if (theme === "light") {
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        if (logoImg) logoImg.src = logoImg.src.replace("putih.png", "ireng.png"); // Safe replace
    } else {
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        if (logoImg) logoImg.src = logoImg.src.replace("ireng.png", "putih.png");
    }
}

async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    updateAuthUI(session);
}

async function updateAuthUI(session) {
    const container = document.getElementById("auth-container");
    if (!container) return;

    if (session) {
        const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();

        const isAdmin = roleData && roleData.role === "admin";

        container.innerHTML = `
            ${isAdmin ? `<a href="admin/dashboard.html" class="nav-icon" title="Admin Dashboard"><i class="fa-solid fa-gauge-high"></i></a>` : ""}
            <div class="auth-dropdown">
                <button class="nav-icon" id="auth-btn" title="Akun">
                    <i class="fa-solid fa-user-check" style="color: var(--accent);"></i>
                </button>
                <div class="auth-dropdown-menu">
                    <div style="padding: 10px 15px; font-size: 0.85rem; color: var(--text-muted);">${session.user.email}</div>
                    <hr style="border: 0; border-top: 1px solid var(--border);">
                    <button id="logout-btn" style="width:100%; text-align:left; padding: 10px 15px; background:none; border:none; color:var(--text); cursor:pointer;">Keluar</button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const logoutBtn = document.getElementById("logout-btn");
            const authBtn = document.getElementById("auth-btn");
            const menu = document.querySelector(".auth-dropdown-menu");

            if (authBtn && menu) {
                authBtn.onclick = (e) => {
                    e.stopPropagation();
                    menu.classList.toggle("active");
                };
                document.addEventListener("click", () => menu.classList.remove("active"));
            }

            if (logoutBtn) {
                logoutBtn.onclick = async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                };
            }
        }, 100);
    } else {
        // Logic for non-logged in users (already in template but just in case)
        container.innerHTML = `
            <a href="login.html" class="nav-icon" title="Masuk">
                <i class="fa-regular fa-user"></i>
            </a>
        `;
    }
}

function setupSearchLogic() {
    const searchInput = document.getElementById("global-search");
    const searchResultsContainer = document.getElementById("search-results-container");
    const searchResultsWrapper = document.getElementById("search-results-wrapper");
    const searchInitialState = document.getElementById("search-initial-state");
    const searchNoResults = document.getElementById("search-no-results");
    const recentSearchesContainer = document.getElementById("recent-searches");
    const clearSearchBtn = document.getElementById("clear-search");

    let recentSearches = JSON.parse(localStorage.getItem("recent_searches")) || [];

    function renderRecentSearches() {
        if (!recentSearchesContainer) return;
        recentSearchesContainer.innerHTML = "";
        if (recentSearches.length === 0) {
            recentSearchesContainer.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem">Belum ada riwayat.</span>';
            return;
        }
        recentSearches.forEach((term) => {
            const chip = document.createElement("div");
            chip.className = "recent-chip";
            chip.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${term}`;
            chip.addEventListener("click", () => {
                if (searchInput) {
                    searchInput.value = term;
                    performSearch(term);
                }
            });
            recentSearchesContainer.appendChild(chip);
        });
    }

    function addToRecent(term) {
        if (!term) return;
        recentSearches = recentSearches.filter((t) => t !== term);
        recentSearches.unshift(term);
        if (recentSearches.length > 5) recentSearches.pop();
        localStorage.setItem("recent_searches", JSON.stringify(recentSearches));
        renderRecentSearches();
    }

    async function performSearch(query) {
        if (!query) {
            if (searchInitialState) searchInitialState.classList.remove("hidden");
            if (searchResultsWrapper) searchResultsWrapper.classList.add("hidden");
            if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
            return;
        }

        if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");
        if (searchInitialState) searchInitialState.classList.add("hidden");
        if (searchResultsWrapper) searchResultsWrapper.classList.remove("hidden");
        if (searchResultsContainer) searchResultsContainer.innerHTML = '<div class="text-center p-3">Searching...</div>';
        if (searchNoResults) searchNoResults.classList.add("hidden");

        // Fetch from Supabase (or use local cache if implemented in script.js, but here we can just do simple query)
        const { data: results, error } = await supabase
            .from('destinations')
            .select('name, slug, thumbnail_path, category')
            .ilike('name', `%${query}%`)
            .limit(5);

        if (searchResultsContainer) searchResultsContainer.innerHTML = "";

        if (!results || results.length === 0) {
            if (searchNoResults) searchNoResults.classList.remove("hidden");
        } else {
            results.forEach((dest) => {
                const card = document.createElement("a");
                card.className = "search-card";
                card.href = `detail-wisata.html?slug=${dest.slug}`;
                card.innerHTML = `
              <img src="${dest.thumbnail_path || 'assets/images/placeholder.jpg'}" class="search-card-img" />
              <div class="search-card-content">
                  <div class="search-card-title">${dest.name}</div>
                  <div class="search-card-badge">${dest.category ? dest.category[0] : "Wisata"}</div>
              </div>
        `;
                card.addEventListener("click", () => addToRecent(query));
                searchResultsContainer.appendChild(card);
            });
        }
    }

    if (searchInput) {
        renderRecentSearches();
        searchInput.addEventListener("input", (e) => performSearch(e.target.value));

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener("click", () => {
                searchInput.value = "";
                performSearch("");
                searchInput.focus();
            });
        }
    }
}
