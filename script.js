document.addEventListener("DOMContentLoaded", () => {
  feather.replace();

  // --- NAVBAR MOBILE & SEARCH TOGGLES ---
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const closeMenu = document.querySelector(".close-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => mobileMenuOverlay.classList.add("active"));
  }
  if (closeMenu) {
    closeMenu.addEventListener("click", () => mobileMenuOverlay.classList.remove("active"));
  }

  const searchBtn = document.getElementById("search-btn");
  const searchOverlay = document.querySelector(".search-overlay");
  const closeSearch = document.querySelector(".close-search");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchOverlay.classList.add("active");
      document.getElementById("global-search").focus();
    });
  }
  if (closeSearch) {
    closeSearch.addEventListener("click", () => searchOverlay.classList.remove("active"));
  }

  // --- THEME TOGGLE ---
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const navbarLogo = document.querySelector(".navbar-logo");

  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  updateIcon(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon(next);
  });

  function updateIcon(theme) {
    if (theme === "light") {
      themeToggle.innerHTML = '<i data-feather="sun"></i>';
      if (navbarLogo) navbarLogo.src = "image/ireng.png";
    } else {
      themeToggle.innerHTML = '<i data-feather="moon"></i>';
      if (navbarLogo) navbarLogo.src = "image/putih.png";
    }
    feather.replace();
  }


  // --- HERO SLIDER LOGIC ---
  const cards = Array.from(document.querySelectorAll(".hero-card"));
  const bgLayer = document.getElementById("hero-bg");
  const titleEl = document.getElementById("hero-title");
  const descEl = document.getElementById("hero-desc");
  const sliderTrack = document.querySelector(".hero-slider-track");
  let currentIndex = 0;

  function updateHero(index) {
    // Handle limits
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    currentIndex = index;

    // Add Active Class
    cards.forEach(c => c.classList.remove("active"));
    const activeCard = cards[index];
    activeCard.classList.add("active");

    // Update Content
    const newBg = activeCard.dataset.bg;
    const newTitle = activeCard.dataset.title;
    const newDesc = activeCard.dataset.desc;

    bgLayer.style.backgroundImage = `url('${newBg}')`;

    // Simple Fade Text
    titleEl.style.opacity = 0;
    descEl.style.opacity = 0;

    setTimeout(() => {
      titleEl.textContent = newTitle;
      descEl.textContent = newDesc;
      titleEl.style.opacity = 1;
      descEl.style.opacity = 1;
    }, 300);

    // Slide Track
    // We want the active card to be somewhat centered or towards the left.
    // Let's shift the track based on index.
    // Card width is 280px + 20px gap = 300px per step
    // But on mobile it's different.

    const cardWidth = activeCard.offsetWidth + 20; // 20 is gap
    const offset = -(index * cardWidth);

    // We want the active card to be the first visible one or shifted slightly?
    // Let's just shift simple index based.
    sliderTrack.style.transform = `translateX(${offset}px)`;
  }

  // Init Logic specific:
  // User requested "card yang terakhir memiliki efek hilang setengah tertelah layar monitor"
  // With 130% width wrapper and simple translation, it should effectively scroll off screen.
  if (cards.length > 0) {
    updateHero(0);

    cards.forEach((card, idx) => {
      card.addEventListener("click", () => updateHero(idx));
    });
  }

  const nextBtn = document.querySelector(".next-slide");
  const prevBtn = document.querySelector(".prev-slide");

  if (nextBtn) nextBtn.addEventListener("click", () => updateHero(currentIndex + 1));
  if (prevBtn) prevBtn.addEventListener("click", () => updateHero(currentIndex - 1));


  // --- SEARCH LOGIC (Simple) ---
  const searchInput = document.getElementById("global-search");
  const searchResultsContainer = document.getElementById("search-results-container");

  const database = [
    { name: "Tumpak Sewu", type: "Air Terjun", link: "detail-wisata.html" },
    { name: "B29 Argosari", type: "Pegunungan", link: "detail-wisata.html" },
    { name: "Ranu Pani", type: "Danau", link: "detail-wisata.html" },
    { name: "Ranu Kumbolo", type: "Danau", link: "detail-wisata.html" },
    { name: "Pantai Watu Pecak", type: "Pantai", link: "detail-wisata.html" },
    { name: "Gunung Semeru", type: "Pegunungan", link: "detail-wisata.html" },
    { name: "Air Terjun Kapas Biru", type: "Air Terjun", link: "detail-wisata.html" },
    { name: "Kebun Teh Kertowono", type: "Perkebunan", link: "detail-wisata.html" },
    { name: "Goa Tetes", type: "Goa", link: "detail-wisata.html" },
    { name: "Pantai Bambang", type: "Pantai", link: "detail-wisata.html" },
    // Add more dummy data to simulate "All types"
    { name: "Museum Daerah", type: "Museum", link: "detail-wisata.html" },
    { name: "Situs Biting", type: "Sejarah", link: "detail-wisata.html" },
    { name: "Pura Mandara Giri", type: "Religi", link: "detail-wisata.html" },
  ];

  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    searchResultsContainer.innerHTML = "";

    if (val.length < 2) return;

    const filtered = database.filter(item =>
      item.name.toLowerCase().includes(val) || item.type.toLowerCase().includes(val)
    );

    if (filtered.length === 0) {
      searchResultsContainer.innerHTML = "<p>Tidak ditemukan.</p>";
    } else {
      filtered.forEach(item => {
        const div = document.createElement("div");
        div.style.padding = "1rem";
        div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        div.innerHTML = `<h4 style="margin-bottom:0.2rem">${item.name}</h4><span style="color:var(--accent);font-size:0.8rem">${item.type}</span>`;
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {
          window.location.href = item.link;
        });
        searchResultsContainer.appendChild(div);
      });
    }
  });

});
