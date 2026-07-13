// treatments-hotspot.js
//
// Кожна крапка циклічно виринає/ховається через "вибух"-ефект (playBurstIn,
// той самий canvas-ефект що в Partners) — зона кліку (весь [data-hotspot]) лишається
// активною завжди, незалежно від фази циклу самої крапки.
// ⚠️ growDot=false тут навмисно: .treatments__dot має data-parallax-item, і
// parallax.js пише transform на цей же елемент щокадру — GSAP-твін transform/scale
// зверху бився б з тим напряму. Тут анімуємо лише opacity, "ріст" дає сам canvas.

import { runHotspotGroup } from "@scripts/init/hotspot-burst";

// Встановлює позицію крапки відносно реального розміру зображення
function positionHotspot(hotspot) {
   const media = hotspot.closest(".treatments__media");
   if (!media) return;
   const img = media.querySelector("img");
   if (!img) return;

   const isMobile = window.innerWidth <= 767;
   const x = isMobile && hotspot.dataset.xSm
      ? parseFloat(hotspot.dataset.xSm)
      : parseFloat(hotspot.dataset.x) || 50;
   const y = isMobile && hotspot.dataset.ySm
      ? parseFloat(hotspot.dataset.ySm)
      : parseFloat(hotspot.dataset.y) || 50;

   const rect      = img.getBoundingClientRect();
   const mediaRect = media.getBoundingClientRect();

   const offsetX = rect.left - mediaRect.left + rect.width  * (x / 100);
   const offsetY = rect.top  - mediaRect.top  + rect.height * (y / 100);

   // Розмір крапки за замовчуванням (28px) — компенсуємо відсутній translate
   const dotSize = 28;
   const dotHalf = dotSize / 2;

   hotspot.style.left = `${offsetX - dotHalf}px`;
   hotspot.style.top  = `${offsetY - dotHalf}px`;

   if (!isMobile) {
      // Авторська сторона (right/left) — зберігаємо один раз, щоб перевірка
      // overflow нижче завжди рахувала від справжнього дефолту, а не від
      // уже перевернутого на попередньому виклику стану.
      if (hotspot.dataset.sideDefault === undefined) {
         hotspot.dataset.sideDefault = hotspot.dataset.side;
      }

      const line  = hotspot.querySelector(".treatments__line");
      const box   = hotspot.querySelector(".treatments__popup-box");
      const popup = hotspot.querySelector(".treatments__popup");

      // Popup ставимо точно на центр крапки (dotHalf, dotHalf від hotspot origin)
      if (popup) {
         popup.style.left = `${dotHalf}px`;
         popup.style.top  = `${dotHalf}px`;
      }

      const scale = rect.width / 450;

      // data-side="left" → попап ліворуч, "right" → праворуч
      const applySide = (isLeft) => {
         if (line) {
            const w = isLeft ? 260 : 280;
            // viewBox і координати самої <line> прив'язані до напрямку —
            // без цього при розвороті (overflow-fallback) "паличка" ламається:
            // якір/ширина міняються, а внутрішня геометрія лінії лишається стара.
            line.setAttribute("viewBox", `0 0 ${w} 88`);
            const innerLine = line.querySelector("line");
            if (innerLine) {
               innerLine.setAttribute("x1", isLeft ? "234" : "26");
               innerLine.setAttribute("x2", isLeft ? "202" : "58");
            }
            line.style.width  = `${Math.round(w * scale)}px`;
            line.style.height = `${Math.round(88 * scale)}px`;
            line.style.bottom = `${Math.round(-2 * scale)}px`;
            line.style.top    = "auto";
            if (isLeft) { line.style.right = `${Math.round(-4 * scale)}px`; line.style.left = "auto"; }
            else         { line.style.left  = `${Math.round(-4 * scale)}px`; line.style.right = "auto"; }
         }
         if (box) {
            box.style.bottom    = `${Math.round(80 * scale)}px`;
            box.style.top       = "auto";
            box.style.transform = "";
            if (isLeft) { box.style.right = `${Math.round(54 * scale)}px`; box.style.left = "auto"; }
            else         { box.style.left  = `${Math.round(54 * scale)}px`; box.style.right = "auto"; }
         }
      };

      const defaultIsLeft = hotspot.dataset.sideDefault === "left";
      applySide(defaultIsLeft);

      // Якщо попап вилазить за межі viewport (планшет/вузькі картки) —
      // розвертаємо в протилежну сторону.
      if (box) {
         const boxRect = box.getBoundingClientRect();
         const overflowsHorizontally = boxRect.left < 0 || boxRect.right > window.innerWidth;
         if (overflowsHorizontally) applySide(!defaultIsLeft);
      }
   }
}

function positionAllHotspots() {
   document.querySelectorAll("[data-hotspot]").forEach(positionHotspot);
}

// Закриває один hotspot (прибирає is-open і повертає крапку в звичайний burst-цикл)
function closeHotspot(hotspot) {
   hotspot.classList.remove("is-open");
   hotspot._burstCycle?.releaseForce();
}

// Кожна картка (.treatments__card--1 з 5 крапками, --2 з 2) — ОКРЕМА група:
// в кожній завжди видно ceil(N/2) одночасно, решта в черзі. Групуємо по
// найближчій .treatments__card, а не по всіх крапках разом — інакше "половина"
// рахувалась би від сумарних 7, а не окремо 5 і 2.
function startAllBursts(hotspots) {
   const cardGroups = new Map();
   hotspots.forEach((hotspot) => {
      const card = hotspot.closest(".treatments__card") || hotspot;
      if (!cardGroups.has(card)) cardGroups.set(card, []);
      cardGroups.get(card).push(hotspot);
   });

   const groups = [];
   cardGroups.forEach((groupHotspots) => {
      groups.push(runHotspotGroup(
         groupHotspots,
         (h) => h.querySelector(".treatments__burst canvas"),
         (h) => h.querySelector(".treatments__dot"),
         false, // growDot=false — конфлікт з parallax.js, лише opacity
      ));
   });
   return groups;
}

function initTreatmentsHotspot() {
   const hotspots = document.querySelectorAll("[data-hotspot]");
   if (!hotspots.length) return;

   // Тільки щойно ініціалізовані крапки отримують burst-цикл — інакше повторний
   // виклик initTreatmentsHotspot() (напр. page:ready без реальної заміни DOM)
   // запустив би ще один цикл поверх уже активного для тих самих крапок.
   const freshlyInitialized = [];

   hotspots.forEach((hotspot) => {
      if (hotspot.dataset.hotspotInit) return;
      hotspot.dataset.hotspotInit = "true";
      freshlyInitialized.push(hotspot);

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
            if (h !== hotspot) closeHotspot(h);
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

         if (isOpen) {
            closeHotspot(hotspot);
         } else {
            hotspot.classList.add("is-open");
            hotspot._burstCycle?.forceVisible();
         }
         e.stopPropagation();
      });
   });

   startAllBursts(freshlyInitialized);

   document.addEventListener("click", () => {
      document.querySelectorAll("[data-hotspot].is-open").forEach(closeHotspot);
   });

   // При resize — перераховуємо позиції і закриваємо відкриті popup
   window.addEventListener("resize", () => {
      document.querySelectorAll("[data-hotspot].is-open").forEach(closeHotspot);
      positionAllHotspots();
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTreatmentsHotspot);
} else {
   initTreatmentsHotspot();
}

document.addEventListener("page:ready", initTreatmentsHotspot);
