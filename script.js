document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Feather Icons
  feather.replace();

  // ELEMENT SELECTORS
  const heroSection = document.querySelector(".hero");
  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.querySelector(".hero-description");
  const cardWrapper = document.querySelector(".hero-card-wrapper");
  const cards = Array.from(document.querySelectorAll(".hero-card")); // Ubah ke Array
  const heroContent = document.querySelector(".hero-content");
  const exploreBtn = document.getElementById("explore-btn");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const totalSlideText = document.querySelector(".total-slide");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileMenuClose = document.querySelector(".mobile-menu-close");
  const mapButtons = Array.from(document.querySelectorAll(".map-button"));
  const mapFrame = document.querySelector(".map-iframe");
  const mapSelected = document.querySelector(".map-selected");
  const searchTrigger = document.getElementById("search");
  const searchPanel = document.querySelector(".search-panel");
  const searchClose = document.querySelector(".search-close");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.querySelector(".search-results");
  const themeToggle = document.getElementById("theme-toggle");
  const logos = Array.from(document.querySelectorAll("[data-logo]"));
  const destinationGrid = document.getElementById("destination-grid");
  const destinationSearch = document.getElementById("destination-search");
  const destinationCount = document.querySelector(".destination-count");

  // STATE
  let isAnimating = false;
  let currentIndex = cards.findIndex((card) =>
    card.classList.contains("active")
  );

  // Inisialisasi Total Slide & Progress
  if (totalSlideText && cards.length) {
    totalSlideText.textContent = `/${cards.length}`;
    updateProgressBar(currentIndex + 1, cards.length);
  }

  const destinations = [
    {
      name: "Air Terjun Tumpak Sewu",
      category: "Air Terjun",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      description: "Air terjun megah dengan panorama lembah hijau.",
      map: "https://maps.app.goo.gl/8Yt7hR1mnw5WZetF6",
    },
    {
      name: "Air Terjun Kapas Biru",
      category: "Air Terjun",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      description: "Air terjun tinggi dengan gradasi biru yang menyejukkan.",
      map: "https://maps.app.goo.gl/JuSmtVj7AeQn2g4d6",
    },
    {
      name: "Goa Tetes",
      category: "Goa",
      image:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      description: "Goa eksotis dengan tetesan air dan lumut hijau.",
      map: "https://maps.app.goo.gl/9x6ju7s2CXVccvPp6",
    },
    {
      name: "Puncak B29",
      category: "Sunrise",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      description: "Spot sunrise terbaik dengan lautan awan.",
      map: "https://maps.app.goo.gl/dP7q9FJc8da4pR9t7",
    },
    {
      name: "Ranu Pani",
      category: "Danau",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      description: "Danau tenang di kaki Semeru.",
      map: "https://maps.app.goo.gl/4e5B1abpyRWt4M1a9",
    },
    {
      name: "Ranu Regulo",
      category: "Danau",
      image:
        "https://images.unsplash.com/photo-1465146633011-14f8e078109e?auto=format&fit=crop&w=1200&q=80",
      description: "Danau sunyi dengan panorama hutan pinus.",
      map: "https://maps.app.goo.gl/5jK9v7K8bH8v1sqt7",
    },
    {
      name: "Ranu Kumbolo",
      category: "Danau",
      image:
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
      description: "Danau ikonik untuk pendaki Semeru.",
      map: "https://maps.app.goo.gl/8WgQ3zV4CQrW5xXx6",
    },
    {
      name: "Pantai Watu Pecak",
      category: "Pantai",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      description: "Pantai dengan ombak selatan yang dramatis.",
      map: "https://maps.app.goo.gl/1i2gqEaqG7QjmiAA9",
    },
    {
      name: "Pantai Bambang",
      category: "Pantai",
      image:
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      description: "Pantai luas dengan pasir halus dan horizon terbuka.",
      map: "https://maps.app.goo.gl/LAh2o5Xo8WgCHnVZA",
    },
    {
      name: "Pantai Dampar",
      category: "Pantai",
      image:
        "https://images.unsplash.com/photo-1473116763249-2faaef81cc85?auto=format&fit=crop&w=1200&q=80",
      description: "Pantai sepi cocok untuk menikmati sunset.",
      map: "https://maps.app.goo.gl/F6otcDj7jQj49SwR6",
    },
    {
      name: "Bukit Cinta B29",
      category: "Sunrise",
      image:
        "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80",
      description: "Panorama sunrise romantis di ketinggian.",
      map: "https://maps.app.goo.gl/6oMFbE8Ew6R3W9XK7",
    },
    {
      name: "Gunung Semeru",
      category: "Gunung",
      image:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      description: "Puncak tertinggi di Jawa dengan jalur pendakian epik.",
      map: "https://maps.app.goo.gl/5a6xmd4qmfFKAZWw7",
    },
    {
      name: "Pemandian Alam Selokambang",
      category: "Relaksasi",
      image:
        "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=80",
      description: "Kolam alami jernih di tengah pepohonan rindang.",
      map: "https://maps.app.goo.gl/KyDYiQdJazVt5y1EA",
    },
    {
      name: "Hutan Pinus Sumberwuluh",
      category: "Alam",
      image:
        "https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=1200&q=80",
      description: "Hutan pinus sejuk untuk piknik dan foto.",
      map: "https://maps.app.goo.gl/S1w6qXDr7wRrC8TQ7",
    },
    {
      name: "Kebun Teh Kertowono",
      category: "Agrowisata",
      image:
        "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80",
      description: "Hamparan hijau kebun teh dengan udara segar.",
      map: "https://maps.app.goo.gl/2vQhM4V6T3G3w3r88",
    },
  ];

  const renderDestinations = (items) => {
    if (!destinationGrid) return;
    destinationGrid.innerHTML = items
      .map(
        (place) => `
        <article class="destination-card">
          <img src="${place.image}" alt="${place.name}" loading="lazy">
          <div class="destination-body">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <div class="destination-meta">
              <span>${place.category}</span>
              <a href="${place.map}" target="_blank" rel="noopener noreferrer" class="link-arrow">
                Lihat Maps <i data-feather="map-pin"></i>
              </a>
            </div>
          </div>
        </article>
      `
      )
      .join("");

    if (destinationCount) {
      destinationCount.textContent = `Menampilkan ${items.length} destinasi`;
    }

    feather.replace();
  };

  const filterDestinations = (query) => {
    const normalized = query.toLowerCase();
    const filtered = destinations.filter((place) =>
      `${place.name} ${place.category} ${place.description}`
        .toLowerCase()
        .includes(normalized)
    );
    renderDestinations(filtered);
    return filtered;
  };

  // --- FUNGSI UTAMA: GANTI KONTEN HERO ---
  function changeHeroContent(index) {
    if (!heroSection || !heroTitle || !heroDesc || !heroContent || !exploreBtn || !cardWrapper) {
      return;
    }
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = index; // Update index saat ini

    const targetCard = cards[index];

    // 1. ANIMASI GESER (NUDGE) PADA WRAPPER
    cardWrapper.classList.add("animating");
    setTimeout(() => {
      cardWrapper.classList.remove("animating");
    }, 600);

    // 2. UPDATE CARD VISUAL (Active State)
    const activeCard = document.querySelector(".hero-card.active");
    if (activeCard) {
      activeCard.classList.remove("active");
    }
    targetCard.classList.add("active");

    // 3. AMBIL DATA DARI KARTU
    const newBg = targetCard.getAttribute("data-bg");
    const newTitle = targetCard.getAttribute("data-title");
    const newDesc = targetCard.getAttribute("data-desc");

    // 4. EFEK LOADING PADA TOMBOL
    exploreBtn.classList.add("loading");

    // 5. ANIMASI FADE OUT TEXT LAMA
    heroContent.classList.add("fade-out");

    setTimeout(() => {
      // Ganti Background Hero
      heroSection.style.backgroundImage = `url('${newBg}')`;

      // Ganti Teks
      heroTitle.textContent = newTitle;
      heroDesc.textContent = newDesc;

      // Munculkan Teks Baru (Fade In)
      heroContent.classList.remove("fade-out");

      // Matikan Loading Button
      exploreBtn.classList.remove("loading");

      // Reset State Animasi
      isAnimating = false;

      // Update Progress Bar
      updateProgressBar(index + 1, cards.length);
    }, 500);
  }

  // --- EVENT LISTENERS ---

  // 1. KLIK PADA KARTU
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (index !== currentIndex) {
        // Hanya jika klik kartu berbeda
        changeHeroContent(index);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (index !== currentIndex) {
          changeHeroContent(index);
        }
      }
    });
  });

  // 2. TOMBOL NEXT
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        nextIndex = 0; // Loop ke awal
      }
      changeHeroContent(nextIndex);
    });
  }

  // 3. TOMBOL PREV
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = cards.length - 1; // Loop ke akhir
      }
      changeHeroContent(prevIndex);
    });
  }

  // Helper: Update Progress Bar angka & garis
  function updateProgressBar(current, total) {
    const currentEl = document.querySelector(".current-slide");
    const fillEl = document.querySelector(".progress-fill");

    if (currentEl && fillEl) {
      currentEl.textContent = current;
      const percentage = (current / total) * 100;
      fillEl.style.width = `${percentage}%`;
      // Update aria-valuenow untuk aksesibilitas
      document
        .querySelector(".slider-progress")
        .setAttribute("aria-valuenow", current);
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen.toString());
      mobileMenu.setAttribute("aria-hidden", (!isOpen).toString());
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        mobileMenu.setAttribute("aria-hidden", "true");
        if (menuToggle) {
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  if (searchTrigger && searchPanel && searchClose) {
    searchTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      searchPanel.classList.add("open");
      searchPanel.setAttribute("aria-hidden", "false");
      if (searchInput) searchInput.focus();
    });

    searchClose.addEventListener("click", () => {
      searchPanel.classList.remove("open");
      searchPanel.setAttribute("aria-hidden", "true");
    });
  }

  const renderSearchResults = (items) => {
    if (!searchResults) return;
    if (!items.length) {
      searchResults.innerHTML = "<p class=\"search-hint\">Tidak ada hasil.</p>";
      return;
    }
    searchResults.innerHTML = items
      .map(
        (place) => `
        <div class="search-result-item">
          <h4>${place.name}</h4>
          <p>${place.description}</p>
          <a href="${place.map}" target="_blank" rel="noopener noreferrer" class="link-arrow">
            Buka Maps <i data-feather="map-pin"></i>
          </a>
        </div>
      `
      )
      .join("");
    feather.replace();
  };

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const value = event.target.value.trim();
      if (!value) {
        searchResults.innerHTML = "<p class=\"search-hint\">Ketik kata kunci untuk melihat hasil.</p>";
        return;
      }
      const filtered = filterDestinations(value);
      renderSearchResults(filtered);
    });
  }

  if (destinationSearch) {
    destinationSearch.addEventListener("input", (event) => {
      filterDestinations(event.target.value.trim());
    });
  }

  if (themeToggle) {
    const applyTheme = (mode) => {
      document.documentElement.setAttribute("data-theme", mode);
      themeToggle.setAttribute("aria-pressed", mode === "light");
      const icon = mode === "light" ? "sun" : "moon";
      themeToggle.innerHTML = `<i data-feather="${icon}"></i>`;
      feather.replace();
      if (logos.length) {
        const logoSource = mode === "light" ? "image/ireng.png" : "image/putih.png";
        logos.forEach((item) => {
          item.src = logoSource;
        });
      }
    };

    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  if (destinationGrid) {
    renderDestinations(destinations);
  }

  if (mapButtons.length && mapFrame && mapSelected) {
    mapButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mapButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const label = button.dataset.label;
        const map = button.dataset.map;
        mapSelected.textContent = `Lokasi dipilih: ${label}`;
        if (map) {
          mapFrame.src = map;
        }
      });
    });
  }
});
