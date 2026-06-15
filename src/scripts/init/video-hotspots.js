// video-hotspots.js — доти+попапи над відео-банером на головній (нові, незалежні
// від TreatmentsHotspot елементи з тим самим функціоналом). Позиція кожного дота —
// чистий CSS через --x/--y (відео покриває контейнер через object-fit: cover).

// Чи ще триває відео-інтро (клас "intro-video" на <html>, ще не завершилось)
function isIntroPending() {
   return (
      document.documentElement.classList.contains("intro-video") &&
      document.documentElement.dataset.introVideoDone !== "true"
   );
}

function revealHotspots(container, animated) {
   if (!animated) container.classList.add("is-instant");
   container.classList.add("is-visible");
}

// Ховає доти назад (відео-інтро перезапустилось через зміну mobile ⇄ desktop джерел)
function hideHotspots(container) {
   container.classList.remove("is-visible", "is-instant");
   container.querySelectorAll(".video-hotspot.is-open").forEach((h) => {
      h.classList.remove("is-open", "is-flipped");
   });
}

function initVideoHotspots() {
   const container = document.querySelector("[data-video-hotspots]");
   if (!container) return;
   if (container.dataset.hotspotsInit) return;
   container.dataset.hotspotsInit = "true";

   if (isIntroPending()) {
      document.addEventListener("video-intro:done", () => revealHotspots(container, true), { once: true });
   } else {
      revealHotspots(container, false);
   }

   // Відео-інтро перезапустилось (resize crossing mobile ⇄ desktop breakpoint) —
   // ховаємо доти знову і чекаємо нового "video-intro:done"
   document.addEventListener("video-intro:restart", () => {
      hideHotspots(container);
      document.addEventListener("video-intro:done", () => revealHotspots(container, true), { once: true });
   });

   const hotspots = container.querySelectorAll(".video-hotspot");

   hotspots.forEach((hotspot) => {
      hotspot.addEventListener("click", (e) => {
         const isOpen = hotspot.classList.contains("is-open");
         const isMobileW = window.innerWidth <= 480;

         container.querySelectorAll(".video-hotspot.is-open").forEach((h) => {
            if (h !== hotspot) h.classList.remove("is-open");
         });

         if (!isOpen && !isMobileW) {
            // Якщо попап (над крапкою) вилазить за верхній край екрана АБО
            // заходить під хедер — показуємо його дзеркально, під крапкою.
            // Спочатку прибираємо is-flipped, щоб виміряти "звичайну"
            // позицію — інакше з другого разу перевірка читає вже
            // перевернуту позицію і клас тригериться навпаки.
            const popupBox = hotspot.querySelector(".video-hotspot__popup-box");
            if (popupBox) {
               hotspot.classList.remove("is-flipped");
               const header = document.querySelector(".header");
               const minTop = header ? header.getBoundingClientRect().bottom : 0;
               const overflowsTop = popupBox.getBoundingClientRect().top < minTop;
               hotspot.classList.toggle("is-flipped", overflowsTop);
            }
         }

         if (!isOpen && isMobileW) {
            const popup = hotspot.querySelector(".video-hotspot__popup");
            if (popup) {
               const containerRect = container.getBoundingClientRect();
               const dotRect = hotspot.getBoundingClientRect();
               const cx = containerRect.left + containerRect.width / 2 - (dotRect.left + dotRect.width / 2);
               const cy = containerRect.top + containerRect.height / 2 - (dotRect.top + dotRect.height / 2);

               popup.style.transition = "none";
               popup.style.left = `${cx}px`;
               popup.style.top = `${cy}px`;
               popup.style.transform = "translate(-50%, -50%) scale(0.96)";
               popup.offsetHeight; // eslint-disable-line no-unused-expressions
               popup.style.transition = "";
            }
         }

         hotspot.classList.toggle("is-open", !isOpen);
         e.stopPropagation();
      });
   });

   document.addEventListener("click", () => {
      container.querySelectorAll(".video-hotspot.is-open").forEach((h) => h.classList.remove("is-open"));
   });

   window.addEventListener("resize", () => {
      container.querySelectorAll(".video-hotspot.is-open").forEach((h) => h.classList.remove("is-open"));
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initVideoHotspots);
} else {
   initVideoHotspots();
}

document.addEventListener("page:ready", initVideoHotspots);
