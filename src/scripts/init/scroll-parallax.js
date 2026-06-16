// scroll-parallax.js — "фонова" картинка рухається повільніше/швидше за скрол.
// Контейнер: [data-scroll-parallax] (потрібна фіксована висота — задається CSS)
// Елемент всередині: [data-scroll-parallax-item] data-scroll-parallax-shift="100"
//
//   data-scroll-parallax-shift — максимальний зсув картинки в px (вгору/вниз),
//   поки контейнер проходить через в'юпорт. Скрипт САМ збільшує картинку та
//   зсуває її початкову позицію (на основі shift), щоб під час руху ніколи
//   не з'являлась "дірка" по краях — додаткові стилі не потрібні.
//
//   Від'ємний shift — інвертує напрямок руху (картинка "обганяє" скрол).
//
// Опційні фічі (за замовчуванням вимкнені, додаються тільки атрибутом):
//   data-scroll-parallax-shift-x="60" — те саме, але по горизонталі (translateX),
//                                        запас по ширині рахується аналогічно shift.
//   data-scroll-parallax-scale="0.1"  — Ken Burns zoom-in: scale росте з 1
//                                        до 1+scale, поки контейнер проходить в'юпорт.
//   data-scroll-parallax-rotate="4"   — легкий поворот картинки (deg) синхронно зі
//                                        скролом (від +rotate до -rotate). Скрипт сам
//                                        додає запас, щоб після повороту не з'явилась "дірка".
//   data-scroll-parallax-fade="0.6"   — opacity згасає на краях в'юпорта (0..1 —
//                                        наскільки сильно, 1 = до повної прозорості).
//   data-scroll-parallax-blur="8"     — на краях в'юпорта картинка розфокусована
//                                        (px), у центрі — чітка (blur 0).

const activeCleanups = new Set();

// Розмір елемента: базові 100% + опційний відсотковий запас (rotate) + опційний px-запас (shift)
function sizeExpr(extraPercent, extraPx) {
   const parts = [`${100 + extraPercent}%`];
   if (extraPx) parts.push(`${extraPx}px`);
   return parts.length === 1 ? parts[0] : `calc(${parts.join(" + ")})`;
}

// Зсув елемента (left/top): від'ємний відсотковий запас (rotate) + px-запас (shift)
function offsetExpr(extraPercent, extraPx) {
   const parts = [];
   if (extraPercent) parts.push(`${extraPercent}%`);
   if (extraPx) parts.push(`${extraPx}px`);
   if (!parts.length) return "0";
   return parts.length === 1 ? `-${parts[0]}` : `calc(-${parts.join(" - ")})`;
}

// На скільки % треба збільшити елемент по кожній стороні, щоб після повороту на
// `deg` градусів навколо центру він все ще повністю перекривав свій оригінальний розмір
function rotatePadPercent(deg) {
   if (!deg) return 0;
   const rad = Math.abs(deg) * (Math.PI / 180);
   const denom = Math.cos(rad) - Math.sin(rad);
   return denom > 0 ? (1 / denom - 1) * 100 : 100;
}

function initScrollParallax() {
   const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

   document.querySelectorAll("[data-scroll-parallax]").forEach((container) => {
      if (container.dataset.scrollParallaxInit) return;
      container.dataset.scrollParallaxInit = "true";

      const items = Array.from(container.querySelectorAll("[data-scroll-parallax-item]"));
      if (!items.length) return;

      // Контейнер повинен ховати "виліт" картинки за межі
      if (!container.style.overflow) container.style.overflow = "hidden";
      if (!container.style.position) container.style.position = "relative";
      if (!container.style.contain) container.style.contain = "paint";

      items.forEach((item) => {
         const shift = parseFloat(item.dataset.scrollParallaxShift) || 0;
         const shiftX = parseFloat(item.dataset.scrollParallaxShiftX) || 0;
         const rotateAmount = parseFloat(item.dataset.scrollParallaxRotate) || 0;
         const abs = Math.abs(shift);
         const absX = Math.abs(shiftX);

         // Картинка більша за контейнер на 2*shift і відцентрована —
         // тоді translateY у межах ±shift завжди перекриває контейнер.
         // `data-scroll-parallax-rotate` додає ще й відсотковий запас з кожного
         // боку, щоб після повороту кути не "відкрили" фон контейнера.
         // `data-scroll-parallax-scale` лише збільшує (scale >= 1), тож
         // додаткового запасу під нього не потрібно.
         const rotatePad = rotatePadPercent(rotateAmount);

         item.style.position = "absolute";
         item.style.left = offsetExpr(rotatePad / 2, absX);
         item.style.top = offsetExpr(rotatePad / 2, abs);
         item.style.width = sizeExpr(rotatePad, absX * 2);
         item.style.height = sizeExpr(rotatePad, abs * 2);
         item.style.willChange = "transform";

         if (item.tagName === "IMG" || item.tagName === "VIDEO") {
            item.style.objectFit = "cover";
         }
      });

      if (reducedMotion) return;

      let rafId = null;
      let active = false;

      const update = () => {
         rafId = null;

         const rect = container.getBoundingClientRect();
         const vh = window.innerHeight;

         // -1 (контейнер ще нижче в'юпорта) … 0 (по центру) … 1 (вже вище в'юпорта)
         const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
         const clamped = Math.min(1, Math.max(-1, progress));

         items.forEach((item) => {
            const shift = parseFloat(item.dataset.scrollParallaxShift) || 0;
            const shiftX = parseFloat(item.dataset.scrollParallaxShiftX) || 0;
            const scaleAmount = parseFloat(item.dataset.scrollParallaxScale) || 0;
            const rotateAmount = parseFloat(item.dataset.scrollParallaxRotate) || 0;
            const fadeAmount = parseFloat(item.dataset.scrollParallaxFade) || 0;
            const blurAmount = parseFloat(item.dataset.scrollParallaxBlur) || 0;

            let transform = `translate(${(-clamped * shiftX).toFixed(2)}px, ${(-clamped * shift).toFixed(2)}px)`;

            if (rotateAmount) {
               transform += ` rotate(${(clamped * rotateAmount).toFixed(2)}deg)`;
            }

            if (scaleAmount > 0) {
               // clamped: 1 (контейнер ще нижче в'юпорта) … 0 (центр) … -1 (вже вище в'юпорта)
               // t росте з 0 до 1 по ходу скролу — zoom-in, поки контейнер проходить в'юпорт
               const t = (1 - clamped) / 2;
               transform += ` scale(${(1 + t * scaleAmount).toFixed(4)})`;
            }

            item.style.transform = transform;

            if (fadeAmount > 0) {
               item.style.opacity = Math.max(0, 1 - Math.abs(clamped) * fadeAmount).toFixed(3);
            }

            if (blurAmount > 0) {
               const blur = Math.abs(clamped) * blurAmount;
               item.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
            }
         });
      };

      const onScrollOrResize = () => {
         if (rafId === null) rafId = requestAnimationFrame(update);
      };

      // Обробляємо скрол лише поки контейнер у в'юпорті (+ запас)
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting && !active) {
                  active = true;
                  window.addEventListener("scroll", onScrollOrResize, { passive: true });
                  window.addEventListener("resize", onScrollOrResize);
                  update();
               } else if (!entry.isIntersecting && active) {
                  active = false;
                  window.removeEventListener("scroll", onScrollOrResize);
                  window.removeEventListener("resize", onScrollOrResize);
               }
            });
         },
         { rootMargin: "25% 0px" },
      );

      observer.observe(container);

      const cleanup = () => {
         observer.disconnect();
         window.removeEventListener("scroll", onScrollOrResize);
         window.removeEventListener("resize", onScrollOrResize);
         if (rafId !== null) cancelAnimationFrame(rafId);
         active = false;
         rafId = null;
         activeCleanups.delete(cleanup);
      };

      activeCleanups.add(cleanup);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initScrollParallax);
} else {
   initScrollParallax();
}

document.addEventListener("page:ready", initScrollParallax);

document.addEventListener("page:leave", () => {
   activeCleanups.forEach((cleanup) => cleanup());
   activeCleanups.clear();
});
