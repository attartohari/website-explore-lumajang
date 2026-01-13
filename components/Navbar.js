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
                <!-- Injected by script.js auth logic if needed, or we can put a placeholder link -->
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
