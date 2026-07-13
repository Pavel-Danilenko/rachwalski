// hotspot-burst.js — той самий "вибух" ефект, що й у partners.js (дот → зірка
// → пилова хмара), але замість підміни лого <img> тут виринає/ховається
// РЕАЛЬНИЙ dot-елемент крапки (.video-hotspot__dot / .treatments__dot).
// Використовується video-hotspots.js та treatments-hotspot.js.
//
// Архітектура — прямий аналог partners.js: кожна крапка йде по колу повністю
// НЕЗАЛЕЖНО від інших (з'явилась → потрималась → зникла → пауза → знову),
// стартово розкидані по часу (як startStaggered у Partners), без жодної
// координації "скільки видно одночасно".
//
// ⚠️ Один суцільний requestAnimationFrame-цикл на крапку (не setTimeout для
// фаз) — саме так зроблено в partners.js, і не випадково: setTimeout-таймери
// браузер притримує на згорнутій вкладці й може "вистрелити" кількома одразу
// при поверненні (звідси був баг "усі крапки одночасно зникають/з'являються"
// після перемикання вкладки). rAF + явна компенсація прихованого часу
// (visibilitychange, той самий прийом що в partners.js) — цього позбавлені.

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
const WAIT_END    = 12600; // 10000 → 12600: зникає + 2s пауза, потім цикл повторюється
const DOT_FADE_AT = 2600;  // сам dotEl починає з'являтись під час STAR_BURST

function ease(t) { return 1 - Math.pow(1 - t, 3); }

// Повний незалежний цикл ОДНІЄЇ крапки — вибух → dotEl фейдиться in →
// тримається → фейдиться out → пауза → onCycleEnd() (виклик перезапускає
// цикл заново, як runIndependent у Partners).
export function runIndependentDotCycle(canvas, dotEl, growDot, onCycleEnd) {
   const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
   const W = canvas.offsetWidth;
   const H = canvas.offsetHeight;

   if (!W || !H) {
      // Canvas ще без розмірів (напр. прихований предок) — пробуємо наступний кадр.
      let retryCancelled = false;
      let inner = null;
      requestAnimationFrame(() => {
         if (retryCancelled) return;
         inner = runIndependentDotCycle(canvas, dotEl, growDot, onCycleEnd);
      });
      return {
         cancel: () => { retryCancelled = true; if (inner) inner.cancel(); },
         forceVisible: () => { if (inner) inner.forceVisible(); },
         releaseForce: () => { if (inner) inner.releaseForce(); },
      };
   }

   canvas.width  = W * dpr;
   canvas.height = H * dpr;
   const ctx = canvas.getContext("2d");
   ctx.scale(dpr, dpr);
   const cx = W / 2;
   const cy = H / 2;

   const puffs = buildPuffs();
   let start = performance.now();

   let done = false;
   let cancelled = false;
   let forcedOpen = false;
   let fadeStarted = false;
   let hideStarted = false;

   gsap.set(dotEl, growDot ? { opacity: 0, scale: 0.7 } : { opacity: 0 });

   // ── Page Visibility: компенсуємо час поки вкладка прихована — той самий
   // прийом, що в partners.js. Без цього при поверненні на вкладку "ms"
   // стрибає на весь час простою одразу, і всі фази (фейд-ін/аут/рестарт)
   // тригеряться миттєво одна за одною замість природного плину.
   let hiddenAt = null;
   const onVisibility = () => {
      if (document.hidden) {
         hiddenAt = performance.now();
      } else if (hiddenAt !== null) {
         const elapsed = performance.now() - hiddenAt;
         // Реальне (не миттєве alt-tab) згортання — компенсація зсуває ВСІ
         // крапки на ОДНАКОВУ дельту, тож на мить вони синхронно потрапляють
         // в однакову відносну фазу циклу (видно як "всі разом вилізли, всі
         // разом зникли", доки природний розкид знову не розійдеться). Для
         // довгих простоїв додаємо ще й випадковий джиттер поверх реального
         // часу — гарантує різну фазу одразу, а не лише після кількох циклів.
         const jitter = elapsed > 1000 ? Math.random() * WAIT_END : 0;
         start += elapsed + jitter;
         hiddenAt = null;
      }
   };
   document.addEventListener("visibilitychange", onVisibility);

   function cancel() {
      if (cancelled) return;
      cancelled = true;
      removeFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf(dotEl);
      ctx.clearRect(0, 0, W, H);
      activeCancels.delete(cancel);
   }
   activeCancels.add(cancel);

   function cleanup() {
      cancel();
      done = true;
      gsap.set(dotEl, growDot ? { opacity: 0, scale: 0.7 } : { opacity: 0 });
      onCycleEnd();
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
      if (done || cancelled) return;
      if (hiddenAt !== null) { // вкладка прихована — не малюємо, чекаємо повернення
         addFrame(frame);
         return;
      }
      const ms = now - start;

      if (!forcedOpen && !fadeStarted && ms >= DOT_FADE_AT) {
         fadeStarted = true;
         gsap.to(dotEl, growDot
            ? { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
            : { opacity: 1, duration: 0.5, ease: "power2.out" });
      }
      if (!forcedOpen && !hideStarted && ms >= HOLD_END) {
         hideStarted = true;
         gsap.to(dotEl, growDot
            ? { opacity: 0, scale: 0.7, duration: 0.3, ease: "power2.in" }
            : { opacity: 0, duration: 0.3, ease: "power2.in" });
      }

      if (ms >= WAIT_END) { cleanup(); return; }

      // Idle-фаза (HOLD + WAIT) — canvas вже порожній, знижуємо частоту до ~2fps
      if (ms >= NEBULA_END) {
         setTimeout(() => { if (!done && !cancelled) addFrame(frame); }, 500);
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

   function forceVisible() {
      forcedOpen = true;
      gsap.killTweensOf(dotEl);
      gsap.set(dotEl, growDot ? { opacity: 1, scale: 1 } : { opacity: 1 });
   }
   function releaseForce() {
      forcedOpen = false;
      const ms = performance.now() - start;
      const shouldBeHidden = ms >= HOLD_END || ms < DOT_FADE_AT;
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
