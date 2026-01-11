import { destinations } from "./destinations-data.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- NAVBAR MOBILE & SEARCH TOGGLES ---
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const closeMenu = document.querySelector(".close-menu");

  if (menuToggle && mobileMenuOverlay) {
    menuToggle.addEventListener("click", () =>
      mobileMenuOverlay.classList.add("active")
    );
  }
  if (closeMenu && mobileMenuOverlay) {
    closeMenu.addEventListener("click", () =>
      mobileMenuOverlay.classList.remove("active")
    );
  }

  const searchBtn = document.getElementById("search-btn");
  const searchOverlay = document.querySelector(".search-overlay");
  const closeSearch = document.querySelector(".close-search");
  const globalSearchInput = document.getElementById("global-search");

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener("click", () => {
      searchOverlay.classList.add("active");
      if (globalSearchInput) globalSearchInput.focus();
    });
  }
  if (closeSearch && searchOverlay) {
    closeSearch.addEventListener("click", () =>
      searchOverlay.classList.remove("active")
    );
  }

  // --- THEME TOGGLE ---
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const navbarLogo = document.querySelector(".navbar-logo");

  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  updateIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateIcon(next);
    });
  }

  function updateIcon(theme) {
    if (!themeToggle) return;
    if (theme === "light") {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      if (navbarLogo) navbarLogo.src = "image/ireng.png";
    } else {
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      if (navbarLogo) navbarLogo.src = "image/putih.png";
    }
  }

  // --- REVOLUTIONARY HERO SLIDER (Infinite Loop + DOM Manipulation) ---
  const sliderTrack = document.querySelector(".hero-slider-track");
  const bgLayer = document.getElementById("hero-bg");
  const titleEl = document.getElementById("hero-title");
  const descEl = document.getElementById("hero-desc");
  const nextBtn = document.querySelector(".next-slide");
  const prevBtn = document.querySelector(".prev-slide");
  const progressBar = document.getElementById("slide-progress");

  if (sliderTrack && bgLayer) {
    let isAnimating = false;
    const cards = Array.from(document.querySelectorAll(".hero-card"));
    // Initial State Setup
    updateHeroContent(cards[0]);

    function updateHeroContent(card) {
      if (!card) return;
      // Fade out text
      titleEl.style.opacity = 0;
      descEl.style.opacity = 0;

      const newBg = card.dataset.bg;
      const newTitle = card.dataset.title;
      const newDesc = card.dataset.desc;
      const newSlug = card.dataset.slug;

      setTimeout(() => {
        bgLayer.style.backgroundImage = `url('${newBg}')`;
        titleEl.textContent = newTitle;
        descEl.textContent = newDesc;
        titleEl.style.opacity = 1;
        descEl.style.opacity = 1;

        // Button Link Update
        const heroBtn = document.querySelector(
          ".hero-text-content .btn-primary"
        );
        if (heroBtn) heroBtn.href = `detail-wisata.html?slug=${newSlug}`;
      }, 300);

      // Highlight Active Card
      document
        .querySelectorAll(".hero-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    }

    function moveSlider(direction) {
      if (isAnimating) return;
      isAnimating = true;

      const cardWidth = 200; // Card 180 + Gap 20
      const currentCards = document.querySelectorAll(".hero-card");

      if (direction === "next") {
        // Prepare next card as active for Content update
        const nextCard = currentCards[1]; // The one becoming first

        // 1. Animate Track Left
        sliderTrack.style.transition =
          "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
        sliderTrack.style.transform = `translateX(-${cardWidth}px)`;

        // 2. Animate Exiting Card
        currentCards[0].style.transform = "scale(0.8)";
        currentCards[0].style.opacity = "0";

        setTimeout(() => {
          // 3. BOM Shuffle
          sliderTrack.style.transition = "none";
          sliderTrack.appendChild(currentCards[0]); // Move first to last
          sliderTrack.style.transform = "translateX(0)";

          // Reset styles of moved card
          currentCards[0].style.transform = "";
          currentCards[0].style.opacity = "";

          // Update Content
          updateHeroContent(nextCard);

          isAnimating = false;
          resetAutoSlide();
        }, 500);
      } else {
        // PREV Direction
        const lastCard = currentCards[currentCards.length - 1];

        // 1. Instant Move Last to First (Hidden)
        sliderTrack.style.transition = "none";
        sliderTrack.prepend(lastCard);
        sliderTrack.style.transform = `translateX(-${cardWidth}px)`;

        // Force Reflow
        void sliderTrack.offsetWidth;

        // 2. Animate into view
        sliderTrack.style.transition =
          "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
        sliderTrack.style.transform = "translateX(0)";

        updateHeroContent(lastCard);

        setTimeout(() => {
          isAnimating = false;
          resetAutoSlide();
        }, 500);
      }
    }

    // Auto Slide
    let autoSlideInterval;
    const slideDuration = 6000;

    function startAutoSlide() {
      // Progress Bar Animation
      if (progressBar) {
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        setTimeout(() => {
          progressBar.style.transition = `width ${slideDuration}ms linear`;
          progressBar.style.width = "100%";
        }, 50);
      }
      autoSlideInterval = setInterval(() => {
        moveSlider("next");
      }, slideDuration);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    // Controls
    if (nextBtn) nextBtn.addEventListener("click", () => moveSlider("next"));
    if (prevBtn) prevBtn.addEventListener("click", () => moveSlider("prev"));

    // Item Click to Activate (Basic Implementation: if click not first, cycle until first)
    // Note: This can be complex with DOM shuffling. Limiting to just next/prev for stability or smart loop.
    // For now, let's keep it simple: Click on non-active card triggers next.
    sliderTrack.addEventListener("click", (e) => {
      const card = e.target.closest(".hero-card");
      if (card && !card.classList.contains("active")) {
        moveSlider("next");
      }
    });

    // Start
    startAutoSlide();
  }

  // --- STORY DRAG (Manual Horizontal Scroll per Row) ---
  const marqueeContainer = document.querySelector(".marquee-wrapper");
  if (marqueeContainer) {
    // Prevent text selection globally in this area
    marqueeContainer.style.userSelect = "none";

    // Function to handle drag for a track
    const enableDrag = (track) => {
      let isDown = false;
      let startX;
      let diff = 0;

      track.addEventListener("mousedown", (e) => {
        isDown = true;
        track.style.cursor = "grabbing";
        track.style.animationPlayState = "paused";
        startX = e.pageX;
      });

      const stopDrag = () => {
        if (!isDown) return;
        isDown = false;
        track.style.cursor = "grab";
        track.style.animationPlayState = "running";
        // Reset visual transform to avoid fighting CSS
        track.style.transform = "";
      };

      track.addEventListener("mouseleave", stopDrag);
      track.addEventListener("mouseup", stopDrag);

      track.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX;
        const walk = x - startX;
        // Simple visual feedback only, not permanent position change to avoid logic break
        track.style.transform = `translateX(${walk}px)`;
      });
    };

    document.querySelectorAll(".marquee-track").forEach(enableDrag);
  }

  // --- MAP INTEGRATION ---
  const mapContainer = document.getElementById("map");
  if (mapContainer && typeof L !== "undefined") {
    const map = L.map("map", {
      scrollWheelZoom: true, // Enabled as requested
      dragging: true,
      zoomControl: true,
    }).setView([-8.133, 113.225], 10);

    // Disable scroll zoom until focused (Standard UX to prevent scroll trap)
    // Applying User Requirement: "scroll zoom aktif hanya saat pointer di atas map"
    map.scrollWheelZoom.disable();
    map.on("focus", () => {
      map.scrollWheelZoom.enable();
    });
    map.on("blur", () => {
      map.scrollWheelZoom.disable();
    });

    // Additional listeners for hover if focus isn't enough
    mapContainer.addEventListener("mouseenter", () => {
      map.scrollWheelZoom.enable();
    });
    mapContainer.addEventListener("mouseleave", () => {
      map.scrollWheelZoom.disable();
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        maxZoom: 17,
      }
    ).addTo(map);

    const districts = document.querySelectorAll(".district-item");
    districts.forEach((item) => {
      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${item.textContent}</b>`);

      item.addEventListener("click", () => {
        districts.forEach((d) => {
          d.style.background = "";
          d.style.color = "";
        });
        item.style.background = "var(--accent)";
        item.style.color = "#000";
        map.flyTo([lat, lng], 14, { animate: true, duration: 2 });
        marker.openPopup();
      });
    });
  }

  // Search Logic (Preserved)
  // ... (Keeping global search logic if needed, or assume it continues to work if not replaced.
  // Since I am replacing the whole file content mostly, I should include the search part too to be safe)

  /* --- ADVANCED SEARCH LOGIC --- */
  const searchInput = document.getElementById("global-search");
  const searchResultsContainer = document.getElementById(
    "search-results-container"
  );
  const searchResultsWrapper = document.getElementById(
    "search-results-wrapper"
  );
  const searchInitialState = document.getElementById("search-initial-state");
  const searchNoResults = document.getElementById("search-no-results");
  const recentSearchesContainer = document.getElementById("recent-searches");
  const clearSearchBtn = document.getElementById("clear-search");

  // Load Recent Searches
  let recentSearches =
    JSON.parse(localStorage.getItem("recent_searches")) || [];

  function renderRecentSearches() {
    if (!recentSearchesContainer) return;
    recentSearchesContainer.innerHTML = "";
    if (recentSearches.length === 0) {
      recentSearchesContainer.innerHTML =
        '<span style="color:var(--text-muted);font-size:0.8rem">Belum ada riwayat.</span>';
      return;
    }
    recentSearches.forEach((term) => {
      const chip = document.createElement("div");
      chip.className = "recent-chip";
      chip.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${term}`;
      chip.addEventListener("click", () => {
        searchInput.value = term;
        performSearch(term);
        // Also trigger input event visually if needed, but performSearch handles logic
      });
      recentSearchesContainer.appendChild(chip);
    });
  }

  function addToRecent(term) {
    if (!term) return;
    // Remove if exists to push to top
    recentSearches = recentSearches.filter((t) => t !== term);
    recentSearches.unshift(term);
    if (recentSearches.length > 5) recentSearches.pop();
    localStorage.setItem("recent_searches", JSON.stringify(recentSearches));
    renderRecentSearches();
  }

  function performSearch(query) {
    if (!query) {
      // Empty state
      searchInitialState.classList.remove("hidden");
      searchResultsWrapper.classList.add("hidden");
      clearSearchBtn.classList.add("hidden");
      return;
    }

    clearSearchBtn.classList.remove("hidden");
    searchInitialState.classList.add("hidden");
    searchResultsWrapper.classList.remove("hidden");
    searchResultsContainer.innerHTML = "";
    searchNoResults.classList.add("hidden");

    const lowerQuery = query.toLowerCase();
    const results = Object.values(destinations).filter((dest) => {
      return (
        dest.nama.toLowerCase().includes(lowerQuery) ||
        dest.kategori.some((k) => k.toLowerCase().includes(lowerQuery)) ||
        (dest.tags &&
          dest.tags.some((t) => t.toLowerCase().includes(lowerQuery))) // Assuming tags might exist or just ignore
      );
    });

    if (results.length === 0) {
      searchNoResults.classList.remove("hidden");
    } else {
      results.forEach((dest) => {
        const card = document.createElement("a");
        card.className = "search-card";
        card.href = `detail-wisata.html?slug=${dest.slug}`;

        // Stagger Animation
        card.style.animation = "fadeIn 0.3s ease forwards";

        card.innerHTML = `
          <img src="${dest.thumbnail}" alt="${dest.nama}" class="search-card-img" />
          <div class="search-card-content">
            <div class="search-card-title">${dest.nama}</div>
            <div class="search-card-badge">${dest.kategori[0]}</div>
          </div>
        `;
        card.addEventListener("click", () => {
          addToRecent(query);
        });
        searchResultsContainer.appendChild(card);
      });
    }
  }

  if (searchInput) {
    renderRecentSearches();

    searchInput.addEventListener("input", (e) => {
      performSearch(e.target.value);
    });

    // Clear Button
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      performSearch("");
      searchInput.focus();
    });

    // Open/Close Animation & Logic Enhancements
    // Note: The click listeners for open/close are already at the top of file.
    // We just need to add ESC close and Auto Focus here.

    // Focus when overlay opens
    const searchOverlay = document.querySelector(".search-overlay");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList.contains("active")) {
          setTimeout(() => searchInput.focus(), 100);
        }
      });
    });
    if (searchOverlay)
      observer.observe(searchOverlay, {
        attributes: true,
        attributeFilter: ["class"],
      });

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
        searchOverlay.classList.remove("active");
      }
    });
  }

  /* --- LEGAL MODALS LOGIC --- */
  const legalLinks = document.querySelectorAll("[data-legal]");
  const legalModals = document.querySelectorAll(".legal-modal");
  const closeLegalBtns = document.querySelectorAll(".close-legal");

  function openModal(id) {
    const modal = document.getElementById(`legal-modal-${id}`);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  legalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const legalId = link.getAttribute("data-legal");
      openModal(legalId);
    });
  });

  closeLegalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".legal-modal");
      closeModal(modal);
    });
  });

  // Close on outside click
  legalModals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  /* --- NEWSLETTER LOGIC (Anti-Spam & Validation) --- */
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterSubmit = document.getElementById("newsletter-submit");
  const newsletterMsg = document.getElementById("newsletter-msg");
  const honeypot = document.getElementById("website-url");

  if (newsletterForm) {
    // Interest Chip Selection Logic
    const interestChips = document.querySelectorAll(".interest-chip");
    interestChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("selected");
      });
    });

    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Reset Message
      newsletterMsg.className = "newsletter-msg";
      newsletterMsg.textContent = "";

      // 2. HONEYPOT CHECK (Anti-Spam)
      if (honeypot && honeypot.value !== "") {
        console.log("Bot detected.");
        return; // Silent fail for bots
      }

      // 3. RATE LIMIT CHECK (Client-side)
      const lastSubmit = localStorage.getItem("newsletter_last_submit");
      const listEmail = localStorage.getItem("newsletter_email");
      const now = Date.now();

      // Basic check: 30 seconds cooldown
      if (lastSubmit && now - parseInt(lastSubmit) < 30000) {
        showMessage("Tunggu sebentar sebelum mencoba lagi.", "error");
        return;
      }

      // Check if email already registered (MVP simulation)
      if (newsletterEmail.value === listEmail) {
        showMessage("Email ini sudah terdaftar!", "success"); // Treat as success
        // Show CTA even if already registered, good for retention
        document.getElementById("trip-planner-cta").style.display = "block";
        return;
      }

      // 4. VALIDATION
      const email = newsletterEmail.value.trim();
      if (!email) {
        showMessage("Email tidak boleh kosong.", "error");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage("Format email tidak valid.", "error");
        return;
      }

      // 5. LOADING STATE
      const originalBtnContent = newsletterSubmit.innerHTML;
      newsletterSubmit.innerHTML = '<span class="loader-spin"></span>';
      newsletterSubmit.disabled = true;

      // 6. SIMULATE SUBMISSION (Delay)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // COLLECT INTERESTS
        const selectedInterests = Array.from(
          document.querySelectorAll(".interest-chip.selected")
        ).map((c) => c.dataset.value);

        // SUCCESS
        localStorage.setItem("newsletter_email", email);
        localStorage.setItem(
          "newsletter_interests",
          JSON.stringify(selectedInterests)
        );
        localStorage.setItem("newsletter_last_submit", now.toString());

        showMessage("Berhasil! Terima kasih sudah mendaftar.", "success");
        newsletterEmail.value = "";

        // Reset chips
        interestChips.forEach((c) => c.classList.remove("selected"));

        newsletterSubmit.innerHTML = '<i class="fa-solid fa-check"></i>';

        // SHOW TRIP PLANNER CTA
        document.getElementById("trip-planner-cta").style.display = "block";

        // Restore button after delay
        setTimeout(() => {
          newsletterSubmit.innerHTML = originalBtnContent;
          newsletterSubmit.disabled = false;
        }, 3000);
      } catch (err) {
        showMessage("Terjadi kesalahan. Coba lagi.", "error");
        newsletterSubmit.innerHTML = originalBtnContent;
        newsletterSubmit.disabled = false;
      }
    });
  }

  function showMessage(text, type) {
    newsletterMsg.textContent = text;
    newsletterMsg.classList.add(type);
    newsletterMsg.classList.add("show");

    // Auto hide after 5s
    setTimeout(() => {
      newsletterMsg.classList.remove("show");
    }, 5000);
  }
});
