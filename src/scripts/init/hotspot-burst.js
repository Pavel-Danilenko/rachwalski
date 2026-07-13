// hotspot-burst.js — той самий "вибух" ефект, що й у partners.js (дот → зірка
// → пилова хмара), але замість підміни лого <img> тут виринає/ховається
// РЕАЛЬНИЙ dot-елемент крапки (.video-hotspot__dot / .treatments__dot).
// Використовується video-hotspots.js та treatments-hotspot.js.
//
// Архітектура — прямий аналог partners.js: кожна крапка йде по колу повністю
// НЕЗАЛЕЖНО від інших (з'явилась → потрималась → зникла → пауза → знову),
// стартово розкидані по часу (як startStaggered у Partners), без жодної
// координації "скільки видно одночасно" — саме так просив: просто безперервне
// по колу, темп як у Partners, без обмежень в кількості.

import gsap from "gsap";
import {
   addFrame,
   removeFrame,
   activeCancels,
   drawDot,
   drawRays,
   buildPuffs,
   prebakeNebula,
} from "@scripts/global/particle-burst";

// Тайминги — точно як у Partners (partners.js: T.DOT_GROW/STAR_BURST/NEBULA_END/
// HOLD_END/HIDE_END/WAIT_END, LOGO_FADE_IN_START), просто dotEl замість <img>.
const DOT_GROW    = 1200;  // 0    → 1200 : малий світний дот росте
const STAR_BURST  = 3000;  // 1200 → 3000 : зірка росте і вибухає
const NEBULA_END  = 5000;  // 3000 → 5000 : туманність розвіюється
const HOLD_END    = 10000; // 5000 → 10000: крапка видно (5s)
const HIDE_END    = 10600; // 10000 → 10600: крапка зникає
const WAIT_END    = 12600; // 10600 → 12600: 2s пауза, потім цикл повторюється
const DOT_FADE_AT = 2600;  // сам dotEl починає з'являтись під час STAR_BURST

function ease(t) { return 1 - Math.pow(1 - t, 3); }

// Один прогін вибуху (грав/зірка/туманність) — до NEBULA_END, дот сам фейдиться
// in на DOT_FADE_AT. Повертає { fadeOut, forceVisible } для контролю зовні.
function drawBurst(canvas, dotEl, growDot) {
   const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
   const W = canvas.offsetWidth;
   const H = canvas.offsetHeight;
   if (!W || !H) return null;

   canvas.width  = W * dpr;
   canvas.height = H * dpr;
   const ctx = canvas.getContext("2d");
   ctx.scale(dpr, dpr);
   const cx = W / 2;
   const cy = H / 2;

   const puffs = buildPuffs();
   const start = performance.now();
   let cancelled = false;
   let canvasDone = false;

   gsap.set(dotEl, growDot ? { opacity: 0, scale: 0.7 } : { opacity: 0 });

   function cancelDraw() {
      if (cancelled) return;
      cancelled = true;
      removeFrame(frame);
      ctx.clearRect(0, 0, W, H);
   }

   let nebulaBaked = null;
   function drawNebulaFast(progress) {
      if (!nebulaBaked) nebulaBaked = prebakeNebula(W, H, dpr, cx, cy, puffs);
      const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      if (alpha < 0.005) return;
      const a = Math.min(alpha * 1.6, 1);

      function stamp(scale, layerAlpha, yOffset) {
         ctx.save();
         ctx.translate(cx, cy + yOffset);
         ctx.scale(scale, scale);
         ctx.translate(-cx, -cy);
         ctx.globalAlpha = layerAlpha;
         ctx.drawImage(nebulaBaked, 0, 0, W, H);
         ctx.restore();
      }

      const s = 0.5 + progress * 0.5;
      stamp(s,        a * 0.55, 0);
      stamp(s * 0.7,  a * 0.75, -6 * progress);
      stamp(s * 0.4,  a * 0.5,  -12 * progress);
      ctx.globalAlpha = 1;
   }

   function frame(now) {
      if (cancelled || canvasDone) return;
      if (document.hidden) { addFrame(frame); return; }

      const ms = now - start;

      if (ms >= NEBULA_END) {
         canvasDone = true;
         removeFrame(frame);
         ctx.clearRect(0, 0, W, H);
         return;
      }

      ctx.clearRect(0, 0, W, H);

      if (ms < DOT_GROW) {
         const t = ease(ms / DOT_GROW);
         drawDot(ctx, cx, cy, 5 * t, t);
      } else if (ms < STAR_BURST) {
         const t      = (ms - DOT_GROW) / (STAR_BURST - DOT_GROW);
         const growT  = Math.min(t / 0.6, 1);
         const burstT = Math.max((t - 0.4) / 0.6, 0);
         const alpha  = 1 - ease(burstT);
         if (alpha > 0.01) {
            drawDot(ctx, cx, cy, 5 + 3 * growT + 14 * burstT, alpha);
            drawRays(ctx, cx, cy, 30 * growT + 16 * burstT, alpha);
         }
         if (burstT > 0) drawNebulaFast(burstT * 0.5);
      } else {
         const nT = (ms - STAR_BURST) / (NEBULA_END - STAR_BURST);
         drawNebulaFast(0.5 + nT * 0.5);
      }
   }

   addFrame(frame);
   return { cancelDraw };
}

// Повний незалежний цикл ОДНІЄЇ крапки — точний аналог partners.js runCycle:
// вибух → dotEl фейдиться in на DOT_FADE_AT → тримається до HOLD_END →
// фейдиться out до HIDE_END → пауза до WAIT_END → onCycleEnd() (виклик
// перезапускає цикл заново, як runIndependent у Partners).
export function runIndependentDotCycle(canvas, dotEl, growDot, onCycleEnd) {
   const draw = drawBurst(canvas, dotEl, growDot);
   if (!draw) {
      // Canvas ще без розмірів — пробуємо наступний кадр.
      let retryCancelled = false;
      const raf = requestAnimationFrame(() => {
         if (retryCancelled) return;
         inner = runIndependentDotCycle(canvas, dotEl, growDot, onCycleEnd);
      });
      let inner = null;
      return {
         cancel: () => { retryCancelled = true; cancelAnimationFrame(raf); if (inner) inner.cancel(); },
         forceVisible: () => { if (inner) inner.forceVisible(); },
         releaseForce: () => { if (inner) inner.releaseForce(); },
      };
   }

   let forcedOpen = false;
   let cancelled = false;
   const cycleStart = performance.now();
   const timers = [];

   function cancel() {
      if (cancelled) return;
      cancelled = true;
      timers.forEach(clearTimeout);
      draw.cancelDraw();
      gsap.killTweensOf(dotEl);
      activeCancels.delete(cancel);
   }
   activeCancels.add(cancel);

   timers.push(setTimeout(() => {
      if (cancelled || forcedOpen) return;
      gsap.to(dotEl, growDot
         ? { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
         : { opacity: 1, duration: 0.5, ease: "power2.out" });
   }, DOT_FADE_AT));

   timers.push(setTimeout(() => {
      if (cancelled || forcedOpen) return;
      gsap.to(dotEl, growDot
         ? { opacity: 0, scale: 0.7, duration: 0.3, ease: "power2.in" }
         : { opacity: 0, duration: 0.3, ease: "power2.in" });
   }, HOLD_END));

   timers.push(setTimeout(() => {
      if (cancelled) return;
      activeCancels.delete(cancel);
      onCycleEnd();
   }, WAIT_END));

   function forceVisible() {
      forcedOpen = true;
      gsap.killTweensOf(dotEl);
      gsap.set(dotEl, growDot ? { opacity: 1, scale: 1 } : { opacity: 1 });
   }
   function releaseForce() {
      forcedOpen = false;
      const elapsed = performance.now() - cycleStart;
      const shouldBeHidden = elapsed >= HOLD_END || elapsed < DOT_FADE_AT;
      if (shouldBeHidden) {
         gsap.to(dotEl, growDot
            ? { opacity: 0, scale: 0.7, duration: 0.3, ease: "power2.in" }
            : { opacity: 0, duration: 0.3, ease: "power2.in" });
      }
   }

   return { cancel, forceVisible, releaseForce };
}

// ── Група крапок (секція/картка) — кожна крапка стартує незалежний цикл, ───
// зі стартовим розкидом (як startStaggered у Partners: крок = WAIT_END/N).
export function runHotspotGroup(hotspots, getCanvas, getDot, growDot = true) {
   const n = hotspots.length;
   if (!n) return { stopAll() {} };

   const step = WAIT_END / n;
   const pendingTimeouts = [];

   function startOne(idx, delay) {
      const hotspot = hotspots[idx];
      const canvas  = getCanvas(hotspot);
      const dot     = getDot(hotspot);
      if (!canvas || !dot) return;

      const begin = () => {
         hotspot._burstCycle = runIndependentDotCycle(
            canvas,
            dot,
            growDot,
            () => startOne(idx, 0),
         );
      };
      if (delay > 0) pendingTimeouts.push(setTimeout(begin, delay));
      else begin();
   }

   hotspots.forEach((_, i) => startOne(i, i * step));

   return {
      stopAll() {
         pendingTimeouts.forEach(clearTimeout);
         hotspots.forEach((h) => {
            h._burstCycle?.cancel();
            h._burstCycle = null;
         });
      },
   };
}
