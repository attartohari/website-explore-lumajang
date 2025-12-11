// ===============================
// 1. NAVIGASI MOBILE
// ===============================
const navbarNav = document.querySelector(".navbar-nav");
const menuButton = document.querySelector("#menu");

// Toggle menu saat klik hamburger
if (menuButton) {
  menuButton.onclick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    navbarNav.classList.toggle("active");
  };
}

// Tutup menu saat klik di luar
document.addEventListener("click", (e) => {
  if (navbarNav.classList.contains("active")) {
    if (!navbarNav.contains(e.target) && !menuButton.contains(e.target)) {
      navbarNav.classList.remove("active");
    }
  }
});

// ===============================
// 2. HERO SLIDER SYSTEM
// ===============================
class HeroSlider {
  constructor() {
    // Select elements
    this.heroSection = document.querySelector(".hero");
    this.cards = document.querySelectorAll(".hero-card");
    this.prevBtn = document.querySelector(".hero-prev");
    this.nextBtn = document.querySelector(".hero-next");
    this.progressFill = document.querySelector(".hero-progress-fill");
    this.slideIndexEl = document.querySelector(".hero-slide-index");
    this.slideCountEl = document.querySelector(".hero-slide-count");

    // State variables
    this.activeIndex = 0;
    this.totalSlides = this.cards.length;
    this.autoSlideInterval = null;
    this.autoSlideDelay = 6000; // 6 detik

    // Initialize if cards exist
    if (this.cards.length > 0) {
      this.init();
    }
  }

  init() {
    // Set slide count display
    if (this.slideCountEl) {
      this.slideCountEl.textContent = "/" + this.totalSlides;
    }

    // Set initial active card
    this.setActiveCard(0);

    // Setup event listeners
    this.setupEventListeners();

    // Start auto slide
    this.startAutoSlide();
  }

  setupEventListeners() {
    // Card click events
    this.cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        this.setActiveCard(index);
        this.restartAutoSlide(); // Reset timer saat manual click
      });
    });

    // Previous button
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        this.prevSlide();
        this.restartAutoSlide();
      });
    }

    // Next button
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        this.nextSlide();
        this.restartAutoSlide();
      });
    }

    // Pause auto-slide on hover (optional, uncomment jika mau)
    /*
    this.cards.forEach(card => {
      card.addEventListener('mouseenter', () => this.pauseAutoSlide())
      card.addEventListener('mouseleave', () => this.resumeAutoSlide())
    })
    */
  }

  // Method untuk ganti card aktif
  setActiveCard(index) {
    // Validasi index
    if (index < 0) index = this.totalSlides - 1;
    if (index >= this.totalSlides) index = 0;

    // Hapus class active dari semua cards
    this.cards.forEach((card) => {
      card.classList.remove("active");
    });

    // Update active index
    this.activeIndex = index;

    // Tambah class active ke card yang baru
    this.cards[this.activeIndex].classList.add("active");

    // Update UI
    this.updateBackground();
    this.updateProgress();
    this.updateSlideIndex();
  }

  // Method untuk ganti background hero
  updateBackground() {
    if (!this.heroSection) return;

    const activeCard = this.cards[this.activeIndex];
    const img = activeCard.querySelector("img");

    if (img && img.src) {
      // Smooth transition untuk background
      this.heroSection.style.opacity = "0.7";
      setTimeout(() => {
        this.heroSection.style.backgroundImage = `url('${img.src}')`;
        this.heroSection.style.opacity = "1";
      }, 300);
    }
  }

  // Method untuk update progress bar
  updateProgress() {
    if (!this.progressFill) return;

    // Hitung persentase progress
    const percent = ((this.activeIndex + 1) / this.totalSlides) * 100;

    // Animasikan progress bar
    this.progressFill.style.transition = "width 0.5s ease";
    this.progressFill.style.width = percent + "%";
  }

  // Method untuk update angka slide (1/3)
  updateSlideIndex() {
    if (this.slideIndexEl) {
      this.slideIndexEl.textContent = this.activeIndex + 1;
    }
  }

  // Method untuk slide berikutnya
  nextSlide() {
    const nextIndex = (this.activeIndex + 1) % this.totalSlides;
    this.setActiveCard(nextIndex);
  }

  // Method untuk slide sebelumnya
  prevSlide() {
    const prevIndex =
      this.activeIndex === 0 ? this.totalSlides - 1 : this.activeIndex - 1;
    this.setActiveCard(prevIndex);
  }

  // Method untuk auto-slide
  startAutoSlide() {
    // Hentikan interval sebelumnya jika ada
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }

    // Mulai interval baru
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  // Method untuk restart auto-slide (setelah interaksi manual)
  restartAutoSlide() {
    this.startAutoSlide();
  }

  // Method untuk pause auto-slide (optional)
  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Method untuk resume auto-slide (optional)
  resumeAutoSlide() {
    if (!this.autoSlideInterval) {
      this.startAutoSlide();
    }
  }
}

// ===============================
// 3. INITIALIZE SLIDER
// ===============================
// Tunggu DOM siap
document.addEventListener("DOMContentLoaded", () => {
  // Initialize feather icons
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Initialize hero slider
  const heroSlider = new HeroSlider();

  // Debug info (bisa dihapus saat production)
  console.log("Hero Slider initialized:", heroSlider);
});

// ===============================
// 4. SMOOTH SCROLL UNTUK NAV LINK
// ===============================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Smooth scroll
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Adjust for navbar height
        behavior: "smooth",
      });

      // Tutup menu mobile jika terbuka
      if (navbarNav.classList.contains("active")) {
        navbarNav.classList.remove("active");
      }
    }
  });
});
