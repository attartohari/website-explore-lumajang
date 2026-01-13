import { renderNavbar } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';

export function loadLayout(rootPath = '.') {
    // 1. Inject Navbar
    const navbarRoot = document.getElementById('navbar-root');
    if (navbarRoot) {
        navbarRoot.innerHTML = renderNavbar(rootPath);
    }

    // 2. Inject Footer
    const footerRoot = document.getElementById('footer-root');
    if (footerRoot) {
        footerRoot.innerHTML = renderFooter(rootPath);
    }

    // 3. Set Active State
    setActiveLink();

    // 4. Initialize Lucide Icons if available
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 5. Dispatch ready event for script.js to attach listeners (search, theme, etc.)
    document.dispatchEvent(new Event('layout:ready'));
}

function setActiveLink() {
    const path = window.location.pathname;
    // Get the filename, default to index.html if empty path (root)
    let page = path.split("/").pop();
    if (page === "" || page === undefined) page = "index.html";

    // Handle query params or anchors if present in pathname? No, pathname is just path.
    // Ensure we match "detail-wisata.html" even if url is "detail-wisata.html?slug=..."
    // (window.location.pathname usually doesn't include query, but let's be safe)

    // Normalize page for matching
    // If we are in a subfolder locally, page might be just the file name.

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        // Simple matching: if href ends with the page name
        // e.g. href="./index.html" matches page="index.html"
        // href="destinasi.html" matches page="destinasi.html"

        // Clean href of ./ or ../
        const cleanHref = href.replace(/^[./]+/, '');

        if (cleanHref === page) {
            link.classList.add('active');
        }
    });

    // Mobile menu links
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.style.color = ""; // reset
        const href = link.getAttribute('href');
        const cleanHref = href.replace(/^[./]+/, '');

        if (cleanHref === page) {
            link.style.color = "var(--accent)";
        }
    });
}

// Auto-execution for convenience if imported as side-effect,
// but usually script.js calls this or waits for it.
// To be safe with the new modular approach, we rely on script.js importing and calling it,
// OR we can auto-run if we suspect script.js expects it.
// The previous layout.js had `document.addEventListener("DOMContentLoaded", loadLayout);`
// We should keep that behavior but allow passing rootPath if needed.
// By default, for root pages, it works without args.

document.addEventListener("DOMContentLoaded", () => loadLayout());
