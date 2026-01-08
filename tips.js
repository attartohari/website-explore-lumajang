import { tipsData } from "./tips-data.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Render Tip of The Day (Random)
  renderTipOfDay();

  // 2. Initialize Checklist (Default: Day Trip)
  renderChecklist("day_trip");

  // 3. Render Q&A Accordion
  renderQA();

  // 4. Render Common Mistakes
  renderMistakes();

  // 5. Checklist Tab Logic
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Render content
      const key = btn.dataset.tab;
      renderChecklist(key);
    });
  });

  // 6. Copy Checklist Logic
  const copyBtn = document.getElementById("copy-checklist");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const title = document.getElementById("checklist-title").innerText;
      const items = Array.from(document.querySelectorAll(".check-text"))
        .map((span) => `- ${span.innerText}`)
        .join("\n");
      const content = `${title} Checklist (Explore Lumajang):\n${items}`;

      navigator.clipboard.writeText(content).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  // 7. Search Logic (Simple Filter)
  const searchInput = document.getElementById("tip-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      // Just filtering Q&A for now as an example
      // or highlight specific chips
    });
  }
});

function renderTipOfDay() {
  const container = document.getElementById("tod-container");
  const randomIdx = Math.floor(Math.random() * tipsData.tips_feed.length);
  const tip = tipsData.tips_feed[randomIdx];

  container.innerHTML = `
        <h3 style="font-family: var(--font-display); margin-bottom: 0.5rem;">Tip of the Day</h3>
        <p style="font-size: 1.2rem; font-style: italic;">"${tip.text}"</p>
        <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; align-items: center;">
             <span class="badge-cat" style="background: var(--accent); color: black;">${
               tip.category
             }</span>
             ${
               tip.link
                 ? `<a href="detail-wisata.html?slug=${tip.link}" class="btn-map-link">Lihat Detail <i class="fa-solid fa-arrow-right"></i></a>`
                 : ""
             }
        </div>
    `;
}

function renderChecklist(key) {
  const data = tipsData.checklists[key];
  if (!data) return;

  document.getElementById("checklist-title").textContent = data.title;

  const container = document.getElementById("checklist-items");
  container.innerHTML = data.items
    .map(
      (item, idx) => `
        <div class="check-item" onclick="toggleCheck(this)">
            <div class="custom-check"><i class="fa-solid fa-check" style="font-size: 0.7rem;"></i></div>
            <span class="check-text">${item}</span>
        </div>
    `
    )
    .join("");
}

// Global scope for onclick interaction
window.toggleCheck = (el) => {
  const box = el.querySelector(".custom-check");
  box.classList.toggle("checked");
  el.querySelector(".check-text").style.textDecoration = box.classList.contains(
    "checked"
  )
    ? "line-through"
    : "none";
  el.querySelector(".check-text").style.opacity = box.classList.contains(
    "checked"
  )
    ? "0.5"
    : "1";
};

function renderQA() {
  const container = document.getElementById("qa-container");
  container.innerHTML = tipsData.situations
    .map(
      (item, idx) => `
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>${item.q}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="accordion-body">
                <p style="color: var(--text-muted);">${item.a}</p>
            </div>
        </div>
    `
    )
    .join("");
}

window.toggleAccordion = (header) => {
  const item = header.parentElement;
  const body = header.nextElementSibling;
  const isActive = item.classList.contains("active");

  // Close others
  document.querySelectorAll(".accordion-item").forEach((i) => {
    i.classList.remove("active");
    i.querySelector(".accordion-body").style.maxHeight = null;
  });

  if (!isActive) {
    item.classList.add("active");
    body.style.maxHeight = body.scrollHeight + "px";
  }
};

function renderMistakes() {
  const container = document.getElementById("mistakes-container");
  container.innerHTML = tipsData.mistakes
    .map(
      (m) => `
        <div class="mistake-card">
            <h4 style="color: #f87171; margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-xmark"></i> ${m.issue}</h4>
            <div class="solution-box">
                <strong style="color: #10b981;">Solusi:</strong> ${m.solution}
            </div>
        </div>
    `
    )
    .join("");
}
