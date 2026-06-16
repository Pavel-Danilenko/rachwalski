// parallax.js — узагальнений mousemove-паралакс для будь-якого блоку.
// Контейнер: [data-parallax]
// Елементи всередині: [data-parallax-item], кожен налаштовується окремо:
//   data-parallax-strength="-12"  — сила/напрямок зсуву в px
//   data-parallax-scale="1.02"    — опційний zoom (дефолт 1, без масштабування)
//   data-parallax-rotate="6"      — опційний 3D-tilt (rotateX/rotateY) у градусах
//   data-parallax-ease="400"      — плавність (transition-duration) у мс
// Опційно на контейнері:
//   data-parallax-min-width="768" — вимикає ефект, якщо ширина екрана менша
//   data-parallax-perspective="800" — perspective для 3D-tilt (дефолт 800px)
//   data-parallax-lerp="0.1"      — інерційний рух через rAF (0..1, менше = плавніше)

const activeLoops = new Set();

function buildTransform(item, x, y) {
   const strength = parseFloat(item.dataset.parallaxStrength) || 0;
   const scale = parseFloat(item.dataset.parallaxScale);
   const rotate = parseFloat(item.dataset.parallaxRotate);

   let transform = `translate(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px)`;

   if (Number.isFinite(scale) && scale !== 1) {
      transform += ` scale(${scale})`;
   }

   if (Number.isFinite(rotate) && rotate !== 0) {
      transform += ` rotateX(${(-y * rotate).toFixed(2)}deg) rotateY(${(x * rotate).toFixed(2)}deg)`;
   }

   return transform;
}

function initParallax() {
   // Тільки там, де є реальна миша, і без prefers-reduced-motion
   if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
   if (!window.matchMedia("(any-hover: hover)").matches) return;

   document.querySelectorAll("[data-parallax]").forEach((container) => {
      if (container.dataset.parallaxInit) return;

      const minWidth = parseFloat(container.dataset.parallaxMinWidth);
      if (Number.isFinite(minWidth) && window.innerWidth < minWidth) return;

      container.dataset.parallaxInit = "true";

      const items = container.querySelectorAll("[data-parallax-item]");
      if (!items.length) return;

      // 3D-tilt — потрібен perspective на контейнері
      const hasTilt = Array.from(items).some((item) => item.dataset.parallaxRotate);
      if (hasTilt) {
         const perspective = parseFloat(container.dataset.parallaxPerspective) || 800;
         container.style.perspective = `${perspective}px`;
      }

      items.forEach((item) => {
         const ease = parseFloat(item.dataset.parallaxEase);
         if (Number.isFinite(ease)) {
            item.style.transitionDuration = `${ease}ms`;
         }
      });

      // Інерційний рух через rAF — currentX/Y "доганяють" targetX/Y з кожним кадром
      const lerpFactor = parseFloat(container.dataset.parallaxLerp);
      const useLerp = Number.isFinite(lerpFactor) && lerpFactor > 0 && lerpFactor < 1;

      const EPSILON = 0.001;
      let targetX = 0;
      let targetY = 0;
      let rafId = null;

      const cancel = () => {
         if (rafId !== null) cancelAnimationFrame(rafId);
         rafId = null;
         activeLoops.delete(cancel);
      };
      activeLoops.add(cancel);

      if (useLerp) {
         let currentX = 0;
         let currentY = 0;

         const tick = () => {
            currentX += (targetX - currentX) * lerpFactor;
            currentY += (targetY - currentY) * lerpFactor;

            items.forEach((item) => {
               item.style.transform = buildTransform(item, currentX, currentY);
            });

            // На спокої (current ≈ target) зупиняємо rAF — відновлюється на mousemove
            if (Math.abs(targetX - currentX) < EPSILON && Math.abs(targetY - currentY) < EPSILON) {
               rafId = null;
               return;
            }
            rafId = requestAnimationFrame(tick);
         };

         container.addEventListener("mousemove", (e) => {
            const rect = container.getBoundingClientRect();
            targetX = (e.clientX - rect.left) / rect.width - 0.5;
            targetY = (e.clientY - rect.top) / rect.height - 0.5;

            if (rafId === null) rafId = requestAnimationFrame(tick);
         });

         container.addEventListener("mouseleave", () => {
            targetX = 0;
            targetY = 0;

            if (rafId === null) rafId = requestAnimationFrame(tick);
         });
      } else {
         // Без lerp — пишемо в DOM не частіше ніж раз на кадр (rAF-throttle mousemove)
         let pendingX = 0;
         let pendingY = 0;

         const apply = () => {
            rafId = null;
            items.forEach((item) => {
               item.style.transform = buildTransform(item, pendingX, pendingY);
            });
         };

         container.addEventListener("mousemove", (e) => {
            const rect = container.getBoundingClientRect();
            pendingX = (e.clientX - rect.left) / rect.width - 0.5;
            pendingY = (e.clientY - rect.top) / rect.height - 0.5;

            if (rafId === null) rafId = requestAnimationFrame(apply);
         });

         container.addEventListener("mouseleave", () => {
            if (rafId !== null) {
               cancelAnimationFrame(rafId);
               rafId = null;
            }
            items.forEach((item) => {
               item.style.transform = "";
            });
         });
      }
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initParallax);
} else {
   initParallax();
}

document.addEventListener("page:ready", initParallax);

// Зупиняємо rAF-цикли інерційного руху перед переходом на іншу сторінку
document.addEventListener("page:leave", () => {
   activeLoops.forEach((cancel) => cancel());
   activeLoops.clear();
});
