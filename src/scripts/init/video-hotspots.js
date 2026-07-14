// video-hotspots.js — доти+попапи над відео-банером на головній (нові, незалежні
// від TreatmentsHotspot елементи з тим самим функціоналом). Позиція кожного дота —
// чистий CSS через --x/--y (відео покриває контейнер через object-fit: cover).
//
// Responsive координати: data-x-lg/data-y-lg — планшет (768-1199px включно),
// data-x-md/data-y-md — телефон (<768px), data-x-sm/data-y-sm (<480px).
// Якщо атрибут не заданий — береться ширший breakpoint.
// Приклад: <div class="video-hotspot" style="--x:51%;--y:23%" data-x-lg="55%" data-y-lg="28%">
//
// Кожна крапка циклічно виринає/ховається через "вибух"-ефект (playBurstIn,
// той самий canvas-ефект що в Partners) — зона кліку (контейнер .video-hotspot)
// лишається активною завжди, незалежно від фази циклу самої крапки.

import { runHotspotGroup } from "@scripts/init/hotspot-burst";

const BP_LG = 1199;
const BP_MD = 768;
const BP_SM = 480;

function applyResponsiveCoords(hotspots) {
   const w = window.innerWidth;
   hotspots.forEach((h) => {
      const d = h.dataset;

      // Дефолтна (desktop) позиція задана інлайново в HTML (style="--x:...;--y:...").
      // setProperty() нижче перезаписує той самий style-об'єкт, тож зберігаємо
      // оригінал один раз — інакше при поверненні на desktop (жоден брейкпоінт
      // не підходить) позиція лишиться "застряглою" на останній mobile/tablet.
      if (d.defaultX === undefined) {
         d.defaultX = h.style.getPropertyValue("--x");
         d.defaultY = h.style.getPropertyValue("--y");
      }

      let x, y;
      if (w < BP_SM && (d.xSm || d.ySm)) {
         x = d.xSm; y = d.ySm;
      } else if (w < BP_MD && (d.xMd || d.yMd)) {
         x = d.xMd; y = d.yMd;
      } else if (w <= BP_LG && (d.xLg || d.yLg)) {
         x = d.xLg; y = d.yLg;
      } else {
         x = d.defaultX; y = d.defaultY;
      }
      if (x) h.style.setProperty("--x", x);
      if (y) h.style.setProperty("--y", y);
   });
}

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

// Закриває один hotspot (прибирає is-open і повертає крапку в звичайний burst-цикл)
// ⚠️ is-flipped навмисно НЕ чіпаємо тут — CSS читає цей клас для top/bottom
// позиції попапу, і миттєве прибирання під час close() смикало б попап у
// звичайну позицію ще поки триває fade-out (0.7s), даючи видимий "стрибок
// вгору". Клас і так свіжо перераховується на кожному відкритті (рядок нижче
// в обробнику кліку), тож прибирати його при закритті зайве.
function closeHotspot(hotspot) {
   hotspot.classList.remove("is-open");
   hotspot._burstCycle?.releaseForce();
}

// Ховає доти назад (відео-інтро перезапустилось через зміну mobile ⇄ desktop джерел)
function hideHotspots(container, group) {
   container.classList.remove("is-visible", "is-instant");
   container.querySelectorAll(".video-hotspot.is-open").forEach(closeHotspot);
   group?.stopAll();
}

// Усі 10 крапок — одна група: завжди видно ceil(10/2)=5 одночасно, решта в черзі.
function startBurstGroup(hotspots) {
   return runHotspotGroup(
      [...hotspots],
      (h) => h.querySelector(".video-hotspot__burst canvas"),
      (h) => h.querySelector(".video-hotspot__dot"),
      true, // growDot — на video-hotspot немає data-parallax-item, скейл безпечний
   );
}

function initVideoHotspots() {
   const container = document.querySelector("[data-video-hotspots]");
   if (!container) return;
   if (container.dataset.hotspotsInit) return;
   container.dataset.hotspotsInit = "true";

   const hotspots = container.querySelectorAll(".video-hotspot");
   let burstGroup = null;

   if (isIntroPending()) {
      document.addEventListener("video-intro:done", () => {
         revealHotspots(container, true);
         burstGroup = startBurstGroup(hotspots);
      }, { once: true });
   } else {
      revealHotspots(container, false);
      burstGroup = startBurstGroup(hotspots);
   }

   // Відео-інтро перезапустилось (resize crossing mobile ⇄ desktop breakpoint) —
   // ховаємо доти назад (і скасовуємо їхні burst-цикли) і чекаємо нового "video-intro:done"
   document.addEventListener("video-intro:restart", () => {
      hideHotspots(container, burstGroup);
      document.addEventListener("video-intro:done", () => {
         revealHotspots(container, true);
         burstGroup = startBurstGroup(hotspots);
      }, { once: true });
   });

   applyResponsiveCoords(hotspots);

   hotspots.forEach((hotspot) => {
      // Авторська сторона (right/left) — попап за замовчуванням відкривається
      // НАЗОВНІ від обличчя. Зберігаємо один раз, щоб щоразу рахувати overflow
      // від справжнього дефолту, а не від уже перевернутого стану.
      if (hotspot.dataset.sideDefault === undefined) {
         hotspot.dataset.sideDefault = hotspot.dataset.side;
      }

      hotspot.addEventListener("click", (e) => {
         const isOpen = hotspot.classList.contains("is-open");
         const isMobileW = window.innerWidth <= 480;

         container.querySelectorAll(".video-hotspot.is-open").forEach((h) => {
            if (h !== hotspot) closeHotspot(h);
         });

         if (!isOpen && !isMobileW) {
            // Якщо попап (над крапкою) вилазить за верхній край екрана АБО
            // заходить під хедер — показуємо його дзеркально, під крапкою.
            // Спочатку прибираємо is-flipped, щоб виміряти "звичайну"
            // позицію — інакше з другого разу перевірка читає вже
            // перевернуту позицію і клас тригериться навпаки.
            const popupBox = hotspot.querySelector(".video-hotspot__popup-box");
            if (popupBox) {
               // data-vertical="down" — для дотів, де попап краще виглядає
               // знизу за замовчуванням (замість звичного "зверху"), з тим
               // самим фолбеком у протилежний бік, якщо там нема місця.
               const preferDown = hotspot.dataset.vertical === "down";
               const header = document.querySelector(".header");
               const minTop = header ? header.getBoundingClientRect().bottom : 0;

               hotspot.classList.toggle("is-flipped", preferDown);
               if (preferDown) {
                  const overflowsBottom = popupBox.getBoundingClientRect().bottom > window.innerHeight;
                  if (overflowsBottom) hotspot.classList.remove("is-flipped");
               } else {
                  const overflowsTop = popupBox.getBoundingClientRect().top < minTop;
                  hotspot.classList.toggle("is-flipped", overflowsTop);
               }

               // Те саме по горизонталі: спочатку повертаємо на авторську
               // (назовні) сторону, міряємо, і якщо попап вилазить за межі
               // viewport — розвертаємо всередину (протилежна сторона).
               const defaultSide = hotspot.dataset.sideDefault;
               hotspot.dataset.side = defaultSide;
               const rect = popupBox.getBoundingClientRect();
               const overflowsHorizontally = rect.left < 0 || rect.right > window.innerWidth;
               const finalSide = overflowsHorizontally
                  ? (defaultSide === "left" ? "right" : "left")
                  : defaultSide;
               hotspot.dataset.side = finalSide;

               // viewBox і координати <line> прив'язані до напрямку — без
               // цього при розвороті (overflow-fallback) лінія лишається
               // геометрією старого боку і "ламається" візуально.
               const isLeft = finalSide === "left";
               const w = isLeft ? 260 : 280;
               hotspot.querySelectorAll(".video-hotspot__line").forEach((svg) => {
                  svg.setAttribute("viewBox", `0 0 ${w} 88`);
                  const innerLine = svg.querySelector("line");
                  if (innerLine) {
                     innerLine.setAttribute("x1", isLeft ? "234" : "26");
                     innerLine.setAttribute("x2", isLeft ? "202" : "58");
                  }
               });
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

         if (isOpen) {
            closeHotspot(hotspot);
         } else {
            hotspot.classList.add("is-open");
            hotspot._burstCycle?.forceVisible();
         }
         e.stopPropagation();
      });
   });

   document.addEventListener("click", () => {
      container.querySelectorAll(".video-hotspot.is-open").forEach(closeHotspot);
   });

   window.addEventListener("resize", () => {
      container.querySelectorAll(".video-hotspot.is-open").forEach(closeHotspot);
      applyResponsiveCoords(hotspots);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initVideoHotspots);
} else {
   initVideoHotspots();
}

document.addEventListener("page:ready", initVideoHotspots);
