import { supabase } from "./utils/supabase.js";
// import { destinations as localData } from "./destinations-data.js"; // REMOVED: Deleted file
import "./collections.js";

// --- DATA FETCHING FOR SEARCH & HERO ---
let destinations = [];

async function initData() {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("id, name, slug, category, thumbnail_path, district, short_desc, ticket_price_avg, est_time, lat, lng")
      .eq("status", "published");

    if (!error && data && data.length > 0) {
      destinations = data.map((d) => ({
        id: d.id,
        nama: d.name,
        name: d.name, // Compat
        slug: d.slug,
        kategori: d.category || [],
        thumbnail: d.thumbnail_path,
        image: d.thumbnail_path && d.thumbnail_path.startsWith("http") ? d.thumbnail_path : (d.thumbnail_path ? `https://your-project-url.supabase.co/storage/v1/object/public/explore-lumajang/${d.thumbnail_path}` : "assets/images/ui/putih.png"),
        imageVal: d.thumbnail_path,
        district: d.district || "",
        teaser: d.short_desc || "",
        description: d.short_desc || "", // Compat
        cost: d.ticket_price_avg ? "Rp " + d.ticket_price_avg.toLocaleString('id-ID') : "Gratis",
        estTime: d.est_time || "-",
        location: { lat: d.lat, lng: d.lng },
        distFromKull: "? km"
      }));
    } else {
      console.warn("Supabase data empty or error, using static fallback.");
      destinations = []; // Keep empty, UI handles static
    }
  } catch (err) {
    console.warn("Init Data Error:", err.message);
    destinations = [];
  }
}
// initData(); // Disabled to prevent unnecessary global fetching. Home page uses static/HTML data or specific fetchers.

// --- AUTH LOGIC ---
// --- AUTH LOGIC handled by Navbar.js ---

// --- GLOBAL LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  // Navbar Init handled by layout.js -> Navbar.js

  initHomePage();
});

function onLayoutReady() {
  initNewsletter();
  setupLegalModals();
}

if (window.isLayoutReady) {
  onLayoutReady();
} else {
  document.addEventListener('layout:ready', onLayoutReady);
}

// --- HOME PAGE LOGIC ---
function initHomePage() {
  console.log("Initializing Home Page...");
  const sliderTrack = document.querySelector(".hero-slider-track");

  if (sliderTrack) {
    // 1. HERO SLIDER LOGIC
    const bgLayer = document.getElementById("hero-bg");
    const titleEl = document.getElementById("hero-title");
    const descEl = document.getElementById("hero-desc");
    const nextBtn = document.querySelector(".next-slide");
    const prevBtn = document.querySelector(".prev-slide");
    const progressBar = document.getElementById("slide-progress");

    if (bgLayer) {
      let isAnimating = false;
      let autoSlideInterval;
      const slideDuration = 6000;

      const cards = Array.from(document.querySelectorAll(".hero-card"));
      if (cards.length > 0) updateHeroContent(cards[0]);

      function updateHeroContent(card) {
        if (!card) return;
        if (titleEl) titleEl.style.opacity = 0;
        if (descEl) descEl.style.opacity = 0;

        const newBg = card.dataset.bg;
        const newTitle = card.dataset.title;
        const newDesc = card.dataset.desc;
        const newSlug = card.dataset.slug;

        setTimeout(() => {
          if (newBg) bgLayer.style.backgroundImage = `url('${newBg}')`;
          if (titleEl) {
            titleEl.textContent = newTitle;
            titleEl.style.opacity = 1;
          }
          if (descEl) {
            descEl.textContent = newDesc;
            descEl.style.opacity = 1;
          }

          const heroBtn = document.querySelector(".hero-text-content .btn-primary");
          if (heroBtn && newSlug) heroBtn.href = `detail-wisata.html?slug=${newSlug}`;
        }, 300);

        document.querySelectorAll(".hero-card").forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
      }

      function moveSlider(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const currentCards = document.querySelectorAll(".hero-card");
        if (currentCards.length < 2) { isAnimating = false; return; }

        const cardWidth = 200;

        if (direction === "next") {
          const nextCard = currentCards[1];
          sliderTrack.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
          sliderTrack.style.transform = `translateX(-${cardWidth}px)`;
          currentCards[0].style.transform = "scale(0.8)";
          currentCards[0].style.opacity = "0";

          setTimeout(() => {
            sliderTrack.style.transition = "none";
            sliderTrack.appendChild(currentCards[0]);
            sliderTrack.style.transform = "translateX(0)";
            currentCards[0].style.transform = "";
            currentCards[0].style.opacity = "";
            updateHeroContent(nextCard);
            isAnimating = false;
            resetAutoSlide();
          }, 500);
        } else {
          const lastCard = currentCards[currentCards.length - 1];
          sliderTrack.style.transition = "none";
          sliderTrack.prepend(lastCard);
          sliderTrack.style.transform = `translateX(-${cardWidth}px)`;
          void sliderTrack.offsetWidth;
          sliderTrack.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
          sliderTrack.style.transform = "translateX(0)";
          updateHeroContent(lastCard);
          setTimeout(() => {
            isAnimating = false;
            resetAutoSlide();
          }, 500);
        }
      }

      function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        if (progressBar) {
          progressBar.style.transition = "none";
          progressBar.style.width = "0%";
          void progressBar.offsetWidth;
          setTimeout(() => {
            progressBar.style.transition = `width ${slideDuration}ms linear`;
            progressBar.style.width = "100%";
          }, 50);
        }
        autoSlideInterval = setInterval(() => moveSlider("next"), slideDuration);
      }

      function resetAutoSlide() {
        startAutoSlide();
      }

      if (nextBtn) nextBtn.onclick = () => moveSlider("next");
      if (prevBtn) prevBtn.onclick = () => moveSlider("prev");

      sliderTrack.onclick = (e) => {
        const card = e.target.closest(".hero-card");
        if (card && !card.classList.contains("active")) moveSlider("next");
      };

      console.log("Starting Hero Slider Autoplay");
      startAutoSlide();
    }

    // 2. STORY DRAG
    const marqueeContainer = document.querySelector(".marquee-wrapper");
    if (marqueeContainer) {
      marqueeContainer.style.userSelect = "none";
      const enableDrag = (track) => {
        let isDown = false;
        let startX;
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
          track.style.transform = "";
        };
        track.addEventListener("mouseleave", stopDrag);
        track.addEventListener("mouseup", stopDrag);
        track.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX;
          const walk = x - startX;
          track.style.transform = `translateX(${walk}px)`;
        });
      };
      document.querySelectorAll(".marquee-track").forEach(enableDrag);
    }
  }

  // 3. MAP INTEGRATION
  initHomeMap();

  // 4. CONTACT FORM
  initContactForm();
}

// --- HELPER FUNCTIONS ---

function initHomeMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  console.log("Initializing Home Map...");

  if (typeof L === "undefined") {
    console.error("Leaflet (L) is not defined.");
    return;
  }

  if (mapContainer._leaflet_id) {
    console.warn("Map already initialized.");
    return;
  }

  try {
    const map = L.map("map", {
      scrollWheelZoom: false,
      dragging: true,
      zoomControl: true,
    }).setView([-8.133, 113.225], 11);

    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());
    mapContainer.addEventListener("mouseenter", () => {
      if (window.innerWidth > 992) map.scrollWheelZoom.enable();
    });
    mapContainer.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const districts = document.querySelectorAll(".district-item");
    if (districts.length > 0) {
      districts.forEach((item) => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>${item.textContent.trim()}</b>`);

        item.addEventListener("click", () => {
          districts.forEach((d) => { d.style.background = ""; d.style.color = ""; });
          item.style.background = "var(--accent)";
          item.style.color = "#000";
          map.flyTo([lat, lng], 13, { animate: true, duration: 1.5 });
          marker.openPopup();
        });
      });
    } else {
      L.marker([-8.133, 113.225]).addTo(map);
    }

    setTimeout(() => { map.invalidateSize(); }, 500);

  } catch (err) {
    console.error("Error initializing map:", err);
  }
}

function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  const contactSubmit = document.getElementById("contact-submit");

  if (contactForm && contactSubmit) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const subject = document.getElementById("contact-subject").value;
      const message = document.getElementById("contact-msg").value.trim();

      if (!name || !email || !message) {
        alert("Mohon lengkapi semua bidang.");
        return;
      }

      const originalText = contactSubmit.innerText;
      contactSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
      contactSubmit.disabled = true;

      try {
        const { error } = await supabase
          .from("contact_messages")
          .insert([{ name, email, subject, message }]);
        if (error) throw error;
        alert("Pesan berhasil dikirim! Kami akan menghubungi Anda segera.");
        contactForm.reset();
      } catch (err) {
        console.error("Error submitting contact form:", err);
        alert("Gagal mengirim pesan: " + err.message);
      } finally {
        contactSubmit.innerText = originalText;
        contactSubmit.disabled = false;
      }
    });
  }
}

function setupLegalModals() {
  // ... logic needed or provided below ...
  // Since I'm replacing chunk, I need to make sure I don't delete setupLegalModals logic if I only replace UP TO it.
  // The previous range included `initNavbarListeners` and `setupThemeToggle`.
  // My replacement logic REPLACES those functions with `setupLegalModals` call in listener, 
  // and `setupLegalModals` FUNCTION DEFINITION needs to be preserved or re-added.
  // In the original file, `setupLegalModals` was defined AFTER initNavbarListeners. 
  // I will include its definition here to be safe or rely on the fact that I am replacing a chunk.
  // Wait, the chunk replacement ends at 640.
  // `initNavbarListeners` started at 393.
  // `setupLegalModals` started at 589.
  // So my replacement overwrites `setupLegalModals`. I MUST include it.

  console.log("Setting up Legal Modals (Delegated)...");

  if (window._legalModalsInitialized) return;
  window._legalModalsInitialized = true;

  document.addEventListener("click", (e) => {
    // 1. Open Handler
    const link = e.target.closest("[data-legal]");
    if (link) {
      e.preventDefault();
      const legalId = link.getAttribute("data-legal");
      const modal = document.getElementById(`legal-modal-${legalId}`);
      if (modal) {
        openModal(modal);
      } else {
        console.warn(`Modal #legal-modal-${legalId} not found`);
      }
    }

    // 2. Close Handler (Buttons)
    const closeBtn = e.target.closest(".close-legal");
    if (closeBtn) {
      const modal = closeBtn.closest(".legal-modal");
      if (modal) closeModal(modal);
    }

    // 3. Close Handler (Background Click)
    if (e.target.classList.contains("legal-modal")) {
      closeModal(e.target);
    }
  });

  // 4. ESC Key Handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".legal-modal.active");
      if (activeModal) closeModal(activeModal);
    }
  });

  function openModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function initNewsletter() {
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterSubmit = document.getElementById("newsletter-submit");
  const newsletterMsg = document.getElementById("newsletter-msg");
  const honeypot = document.getElementById("website-url");

  if (newsletterForm) {
    const interestChips = document.querySelectorAll(".interest-chip");
    interestChips.forEach((chip) => {
      chip.addEventListener("click", () => chip.classList.toggle("selected"));
    });

    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      newsletterMsg.className = "newsletter-msg";
      newsletterMsg.textContent = "";

      if (honeypot && honeypot.value !== "") return;

      const email = newsletterEmail.value.trim();
      if (!email) {
        showMessage("Email tidak boleh kosong.", "error");
        return;
      }

      const originalBtnContent = newsletterSubmit.innerHTML;
      newsletterSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      newsletterSubmit.disabled = true;

      const selectedInterests = Array.from(document.querySelectorAll(".interest-chip.selected")).map((c) => c.dataset.value);

      try {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .insert([{ email, interests: selectedInterests }]);

        if (error) {
          if (error.code === "23505") {
            showMessage("Email ini sudah terdaftar!", "success");
            document.getElementById("trip-planner-cta").style.display = "block";
          } else {
            throw error;
          }
        } else {
          showMessage("Berhasil! Terima kasih sudah mendaftar.", "success");
          newsletterEmail.value = "";
          interestChips.forEach((c) => c.classList.remove("selected"));
          document.getElementById("trip-planner-cta").style.display = "block";
        }
      } catch (err) {
        showMessage("Gagal menyimpan: " + err.message, "error");
      } finally {
        newsletterSubmit.innerHTML = originalBtnContent;
        newsletterSubmit.disabled = false;
      }
    });

    function showMessage(text, type) {
      newsletterMsg.textContent = text;
      newsletterMsg.classList.add(type);
      newsletterMsg.classList.add("show");
      setTimeout(() => newsletterMsg.classList.remove("show"), 5000);
    }
  }
}

// --- GLOBAL UTILS ---

if (!window.toggleCollection) {
  window.toggleCollection = (id, btn) => {
    let favorites = JSON.parse(localStorage.getItem("lumajang_favs")) || [];
    const idx = favorites.indexOf(id);
    const isAdding = idx === -1;

    if (isAdding) {
      favorites.push(id);
      if (btn) {
        btn.classList.add("active");
        const icon = btn.querySelector("i");
        if (icon) icon.classList.replace("fa-regular", "fa-solid");
      }
    } else {
      favorites.splice(idx, 1);
      if (btn) {
        btn.classList.remove("active");
        const icon = btn.querySelector("i");
        if (icon) icon.classList.replace("fa-solid", "fa-regular");
      }
    }
    localStorage.setItem("lumajang_favs", JSON.stringify(favorites));

    const modal = document.getElementById('collection-modal');
    if (modal && modal.classList.contains('active')) window.renderCollectionList();
  };
}

if (!window.openCollectionModal) {
  window.openCollectionModal = () => {
    const modal = document.getElementById('collection-modal');
    if (modal) {
      modal.classList.add('active');
      window.renderCollectionList();
    }
  };
}

if (!window.closeCollectionModal) {
  window.closeCollectionModal = () => {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.classList.remove('active');
  };
}

if (!window.renderCollectionList) {
  window.renderCollectionList = () => {
    const listContainer = document.getElementById('collection-list');
    if (!listContainer) return;

    let favorites = JSON.parse(localStorage.getItem("lumajang_favs")) || [];

    if (favorites.length === 0) {
      listContainer.innerHTML = `
              <div style="text-align:center; padding:3rem; color:var(--text-muted);">
                  <i class="fa-regular fa-bookmark" style="font-size:2rem; margin-bottom:1rem; opacity:0.5;"></i>
                  <p>Belum ada destinasi tersimpan.</p>
                  <button onclick="window.closeCollectionModal()" style="margin-top:1rem; color:var(--accent); border:1px solid var(--accent); padding:0.5rem 1rem; border-radius:50px;">Mulai Jelajah</button>
              </div>`;
      return;
    }

    listContainer.innerHTML = favorites.map(id => {
      const item = destinations.find(d => d.id === id);
      if (!item) return '';

      let imgSrc = item.imageVal || item.thumbnail || "assets/images/ui/putih.png";
      if (!imgSrc.startsWith("http") && !imgSrc.includes("/")) {
        imgSrc = `assets/images/destinasi/${imgSrc}`;
      }

      return `
              <div class="collection-item">
                  <img src="${imgSrc}" class="collection-thumb" alt="${item.name}" style="width:80px;height:60px;object-fit:cover;border-radius:8px;">
                  <div class="collection-info" style="flex:1; padding-left:10px;">
                      <h4 style="margin:0;font-size:1rem;">${item.name}</h4>
                      <div style="font-size:0.8rem; color:var(--text-muted); display:flex; gap:10px; margin-top:5px;">
                          <span><i class="fa-solid fa-money-bill"></i> ${item.cost}</span>
                      </div>
                      <div style="margin-top:0.5rem;">
                           <a href="detail-wisata.html?slug=${item.slug}" style="font-size:0.8rem; background:var(--accent); color:black; padding:0.2rem 0.6rem; border-radius:4px; text-decoration:none;">Detail</a>
                      </div>
                  </div>
                  <button class="btn-remove-collection" onclick="window.toggleCollection('${item.id}')" title="Hapus" style="color:red;">
                      <i class="fa-solid fa-trash"></i>
                  </button>
              </div>
              <hr style="border:0; border-top:1px solid var(--border); margin:10px 0;">
          `;
    }).join('');
  };
}
