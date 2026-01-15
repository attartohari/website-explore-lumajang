import { renderNavbar, initNavbar } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';

export function loadLayout(rootPath = '.') {
    // 1. Inject Navbar
    const navbarRoot = document.getElementById('navbar-root');
    if (navbarRoot) {
        navbarRoot.innerHTML = renderNavbar(rootPath);
        // Initialize Navbar Logic (Search, Theme, Auth, Mobile Menu)
        // Delay slightly ensuring DOM is ready if needed, but usually sync is fine here since innerHTML is sync
        initNavbar();
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

    // 5. Dispatch ready event for any other scripts
    window.isLayoutReady = true;
    document.dispatchEvent(new Event('layout:ready'));
}

function setActiveLink() {
    const path = window.location.pathname;
    let page = path.split("/").pop();
    if (page === "" || page === undefined) page = "index.html";

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        const cleanHref = href.replace(/^[./]+/, ''); // Remove ./ or ../

        // Match exact or related (e.g. detail-wisata matches destinasi if we wanted, but sticking to 1:1)
        if (cleanHref === page || (page.startsWith('detail-wisata') && cleanHref === 'detail-wisata.html')) {
            link.classList.add('active');
        }
    });

    // Mobile menu links
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.style.color = ""; // reset
        const href = link.getAttribute('href');
        const cleanHref = href.replace(/^[./]+/, '');

        if (cleanHref === page || (page.startsWith('detail-wisata') && cleanHref === 'detail-wisata.html')) {
            link.style.color = "var(--accent)";
        }
    });
}

// Auto-run
document.addEventListener("DOMContentLoaded", () => loadLayout());

