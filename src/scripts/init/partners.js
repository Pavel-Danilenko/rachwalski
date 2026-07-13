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

// ─── Phase timings (ms) ───────────────────────────────────────────────────────
const T = {
   DOT_GROW:    1200,  // 0 → 1200   : dot повільно з'являється
   STAR_BURST:  3000,  // 1200 → 3000: зірка росте і вибухає
   NEBULA_END:  5000,  // 3000 → 5000: туманність розвіюється
   HOLD_END:    10000, // 5000 → 10000: лого видно (5 s)
   HIDE_END:    10600, // 10000 → 10600: лого зникає
   WAIT_END:    12600, // 10600 → 12600: 2 s пауза
};
const LOGO_FADE_IN_START = 2600;

// ─── Run one full cycle for a slot ───────────────────────────────────────────
// startAt — скільки ms вже "пройшло" в циклі (для першого запуску)
function runCycle(slot, logoData, onCycleEnd, startAt = 0) {
   const canvas = slot.querySelector(".partners__canvas");
   const img    = slot.querySelector(".partners__logo");

   // Set image but keep invisible
   img.src = logoData.src;
   img.alt = logoData.alt;
   gsap.set(img, { opacity: 0, scale: 0.88 });

   // Setup canvas — якщо розміри ще 0 (не відрендерено), чекаємо наступний кадр
   // Cap DPR 1.5 — для розмитих ефектів різниця між 1.5 і 2 невидима
   const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
   let W = canvas.offsetWidth;
   let H = canvas.offsetHeight;
   if (!W || !H) {
      let retryCancelled = false;
      const cancelRetry = () => {
         retryCancelled = true;
         activeCancels.delete(cancelRetry);
      };
      activeCancels.add(cancelRetry);
      requestAnimationFrame(() => {
         if (retryCancelled) return;
         activeCancels.delete(cancelRetry);
         runCycle(slot, logoData, onCycleEnd, startAt);
      });
      return;
   }
   canvas.width  = W * dpr;
   canvas.height = H * dpr;
   const ctx = canvas.getContext("2d");
   ctx.scale(dpr, dpr);
   const cx = W / 2;
   const cy = H / 2;

   const puffs = buildPuffs();
   let done = false;
   // startAt зміщує початок — слот "вже в середині" циклу
   let start = performance.now() - startAt;

   // Якщо стартуємо вже в фазі "лого видно" — показуємо одразу
   let logoFadeStarted = startAt >= LOGO_FADE_IN_START;
   let logoHideStarted = startAt >= T.HOLD_END;

   if (logoFadeStarted && !logoHideStarted) {
      gsap.set(img, { opacity: 1, scale: 1 });
   }

   // ── Page Visibility: компенсуємо час поки вкладка прихована ─────────────────
   // GSAP 3 сам паузує tweens при hidden — нам потрібно тільки canvas rAF
   let hiddenAt = null;
   const onVisibility = () => {
      if (document.hidden) {
         hiddenAt = performance.now();
      } else if (hiddenAt !== null) {
         start += performance.now() - hiddenAt;
         hiddenAt = null;
      }
   };
   document.addEventListener("visibilitychange", onVisibility);

   // ── Cancel — зупиняє цикл і прибирає всі listeners ───────────────────────────
   let cancelled = false;
   function cancel() {
      if (cancelled) return;
      cancelled = true;
      removeFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf(img);
      ctx.clearRect(0, 0, W, H);
      activeCancels.delete(cancel);
   }
   activeCancels.add(cancel);

   function cleanup() {
      cancel();
      done = true;
      gsap.set(img, { opacity: 0, scale: 0.88 });
      onCycleEnd();
   }

   function ease(t) { return 1 - Math.pow(1 - t, 3); }

   // Pre-baked nebula — створюється один раз при першому вибуху
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

      // Три шари — створюють відчуття глибини та підйому диму
      const s = 0.55 + progress * 0.6;
      stamp(s,        a * 0.55, 0);               // фоновий шар — великий
      stamp(s * 0.72, a * 0.75, -10 * progress);  // середній — трохи вгору
      stamp(s * 0.42, a * 0.5,  -22 * progress);  // передній — ще вище (дим піднімається)
      ctx.globalAlpha = 1;
   }

   function frame(now) {
      if (done || cancelled) return;
      const ms = now - start;

      // ── Тригери GSAP (перевіряємо незалежно від фази)
      if (!logoFadeStarted && ms >= LOGO_FADE_IN_START) {
         logoFadeStarted = true;
         gsap.to(img, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });
      }
      if (!logoHideStarted && ms >= T.HOLD_END) {
         logoHideStarted = true;
         gsap.to(img, { opacity: 0, scale: 0.88, duration: 0.5, ease: "power2.in" });
      }

      // ── Кінець циклу
      if (ms >= T.WAIT_END) { cleanup(); return; }

      // ── Idle фази (HOLD + WAIT): canvas не малюємо, знижуємо до ~2fps
      // setTimeout коректно відновлюється після прихованої вкладки завдяки
      // onVisibility який зміщує `start` — наступний frame(now) побачить правильний ms
      if (ms >= T.NEBULA_END) {
         setTimeout(() => { if (!done && !cancelled) addFrame(frame); }, 500);
         return;
      }

      // ── Canvas малювання (лише перші ~3.2s)
      ctx.clearRect(0, 0, W, H);

      if (ms < T.DOT_GROW) {
         const t = ease(ms / T.DOT_GROW);
         drawDot(ctx, cx, cy, 5 * t, t);
      } else if (ms < T.STAR_BURST) {
         const t      = (ms - T.DOT_GROW) / (T.STAR_BURST - T.DOT_GROW);
         const growT  = Math.min(t / 0.6, 1);
         const burstT = Math.max((t - 0.4) / 0.6, 0);
         const alpha  = 1 - ease(burstT);
         if (alpha > 0.01) {
            drawDot(ctx, cx, cy, 5 + 3 * growT + 14 * burstT, alpha);
            drawRays(ctx, cx, cy, 30 * growT + 16 * burstT, alpha);
         }
         if (burstT > 0) drawNebulaFast(burstT * 0.5);
      } else if (ms < T.NEBULA_END) {
         const nT = (ms - T.STAR_BURST) / (T.NEBULA_END - T.STAR_BURST);
         drawNebulaFast(0.5 + nT * 0.5);
      }
   }

   addFrame(frame);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function initPartners() {
   const sections = document.querySelectorAll("[data-partners]");
   if (!sections.length) return;

   sections.forEach((section) => {
      if (section.dataset.partnersInit) return;
      section.dataset.partnersInit = "true";

      const logos = JSON.parse(section.dataset.logos || "[]");
      const slots = [...section.querySelectorAll("[data-slot]")];
      if (!logos.length || !slots.length) return;

      const pool = [...logos].sort(() => Math.random() - 0.5);
      let queue  = [...pool];
      // Відстежуємо які src зараз показуються — щоб не дублювати
      const active = new Set();

      function nextLogo() {
         if (!queue.length) queue = [...pool].sort(() => Math.random() - 0.5);
         // Якщо лого менше ніж слотів — дублювання неминуче, просто берем наступний
         if (logos.length <= slots.length) return queue.shift();
         // Шукаємо перше лого яке зараз не показується
         const idx = queue.findIndex((l) => !active.has(l.src));
         const logo = idx === -1 ? queue.shift() : queue.splice(idx, 1)[0];
         active.add(logo.src);
         return logo;
      }

      function releaseLogo(src) {
         active.delete(src);
      }

      function runIndependent(slot, prevSrc) {
         releaseLogo(prevSrc);
         const logo = nextLogo();
         runCycle(slot, logo, () => runIndependent(slot, logo.src), 0);
      }

      function startStaggered() {
         const step = Math.floor(T.WAIT_END / slots.length);
         slots.forEach((slot, i) => {
            const logo = nextLogo();
            runCycle(slot, logo, () => runIndependent(slot, logo.src), i * step);
         });
      }

      // Якщо секція вже у viewport — стартуємо одразу, інакше чекаємо скрол
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
         requestAnimationFrame(() => requestAnimationFrame(startStaggered));
      } else {
         const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            requestAnimationFrame(() => requestAnimationFrame(startStaggered));
         }, { threshold: 0 });
         observer.observe(section);
      }
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initPartners);
} else {
   initPartners();
}

document.addEventListener("page:ready", initPartners);
