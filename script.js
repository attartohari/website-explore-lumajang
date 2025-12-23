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

  // STATE
  let isAnimating = false;
  let currentIndex = cards.findIndex((card) =>
    card.classList.contains("active")
  );

  // Inisialisasi Total Slide & Progress
  if (totalSlideText) totalSlideText.textContent = `/${cards.length}`;
  updateProgressBar(currentIndex + 1, cards.length);

  // --- FUNGSI UTAMA: GANTI KONTEN HERO ---
  function changeHeroContent(index) {
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
    document.querySelector(".hero-card.active").classList.remove("active");
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
  });

  // 2. TOMBOL NEXT
  nextBtn.addEventListener("click", () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      nextIndex = 0; // Loop ke awal
    }
    changeHeroContent(nextIndex);
  });

  // 3. TOMBOL PREV
  prevBtn.addEventListener("click", () => {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = cards.length - 1; // Loop ke akhir
    }
    changeHeroContent(prevIndex);
  });

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
});
