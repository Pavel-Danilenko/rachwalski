// treatments-hotspot.js

// Встановлює позицію крапки відносно реального розміру зображення
function positionHotspot(hotspot) {
   const media = hotspot.closest(".treatments__media");
   if (!media) return;
   const img = media.querySelector("img");
   if (!img) return;

   const isMobile = window.innerWidth <= 767;
   const x = parseFloat(hotspot.dataset.x) || 50;
   const y = isMobile && hotspot.dataset.ySm
      ? parseFloat(hotspot.dataset.ySm)
      : parseFloat(hotspot.dataset.y) || 50;

   const rect      = img.getBoundingClientRect();
   const mediaRect = media.getBoundingClientRect();

   const offsetX = rect.left - mediaRect.left + rect.width  * (x / 100);
   const offsetY = rect.top  - mediaRect.top  + rect.height * (y / 100);

   // Розмір крапки (48px) — компенсуємо відсутній translate(-50%,-50%)
   const dotSize = 48;
   const dotHalf = dotSize / 2;

   hotspot.style.left = `${offsetX - dotHalf}px`;
   hotspot.style.top  = `${offsetY - dotHalf}px`;

   if (!isMobile) {
      const isCard2 = !!hotspot.closest(".treatments__card--2");
      const line  = hotspot.querySelector(".treatments__line");
      const box   = hotspot.querySelector(".treatments__popup-box");
      const popup = hotspot.querySelector(".treatments__popup");

      // Popup ставимо точно на центр крапки (dotHalf, dotHalf від hotspot origin)
      if (popup) {
         popup.style.left = `${dotHalf}px`;
         popup.style.top  = `${dotHalf}px`;
      }

      const scale = rect.width / 450;

      if (line) {
         line.style.width  = `${Math.round((isCard2 ? 260 : 280) * scale)}px`;
         line.style.height = `${Math.round(88 * scale)}px`;
         line.style.bottom = `${Math.round(-2 * scale)}px`;
         line.style.top    = "auto";
         if (isCard2) { line.style.right = `${Math.round(-4 * scale)}px`; line.style.left = "auto"; }
         else         { line.style.left  = `${Math.round(-4 * scale)}px`; line.style.right = "auto"; }
      }

      if (box) {
         box.style.bottom    = `${Math.round(80 * scale)}px`;
         box.style.top       = "auto";
         box.style.transform = "";
         if (isCard2) { box.style.right = `${Math.round(54 * scale)}px`; box.style.left = "auto"; }
         else         { box.style.left  = `${Math.round(54 * scale)}px`; box.style.right = "auto"; }
      }
   }
}

function positionAllHotspots() {
   document.querySelectorAll("[data-hotspot]").forEach(positionHotspot);
}

function initTreatmentsHotspot() {
   const hotspots = document.querySelectorAll("[data-hotspot]");
   if (!hotspots.length) return;

   hotspots.forEach((hotspot) => {
      if (hotspot.dataset.hotspotInit) return;
      hotspot.dataset.hotspotInit = "true";

      // Позиціонуємо одразу і після завантаження зображення
      positionHotspot(hotspot);
      const img = hotspot.closest(".treatments__media")?.querySelector("img");
      if (img && !img.complete) {
         img.addEventListener("load", () => positionHotspot(hotspot), { once: true });
      }

      // Клік — однаково для всіх пристроїв (desktop + tablet + mobile)
      hotspot.addEventListener("click", (e) => {
         const isOpen    = hotspot.classList.contains("is-open");
         const isMobileW = window.innerWidth <= 480;

         // Закрити інші
         document.querySelectorAll("[data-hotspot].is-open").forEach((h) => {
            if (h !== hotspot) h.classList.remove("is-open");
         });

         if (!isOpen && isMobileW) {
            // На телефоні — центруємо popup по картинці (glass ефект)
            const media = hotspot.closest(".treatments__media");
            const img   = media?.querySelector("img");
            const popup = hotspot.querySelector(".treatments__popup");
            if (img && popup) {
               const imgRect = img.getBoundingClientRect();
               const dotRect = hotspot.getBoundingClientRect();
               const cx = (imgRect.left + imgRect.width  / 2) - (dotRect.left + dotRect.width  / 2);
               const cy = (imgRect.top  + imgRect.height / 2) - (dotRect.top  + dotRect.height / 2);

               popup.style.transition = "none";
               popup.style.left      = `${cx}px`;
               popup.style.top       = `${cy}px`;
               popup.style.transform = "translate(-50%, -50%) scale(0.96)";
               // Форсуємо reflow → transition вмикається вже з правильної позиції
               popup.offsetHeight; // eslint-disable-line no-unused-expressions
               popup.style.transition = "";
            }
         }

         hotspot.classList.toggle("is-open", !isOpen);
         e.stopPropagation();
      });
   });

   document.addEventListener("click", () => {
      document.querySelectorAll("[data-hotspot].is-open").forEach((h) => {
         h.classList.remove("is-open");
      });
   });

   // При resize — перераховуємо позиції і закриваємо відкриті popup
   window.addEventListener("resize", () => {
      document.querySelectorAll("[data-hotspot].is-open").forEach((h) => {
         h.classList.remove("is-open");
      });
      positionAllHotspots();
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTreatmentsHotspot);
} else {
   initTreatmentsHotspot();
}

document.addEventListener("page:ready", initTreatmentsHotspot);

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTreatmentsHotspot);
} else {
   initTreatmentsHotspot();
}

document.addEventListener("page:ready", initTreatmentsHotspot);
