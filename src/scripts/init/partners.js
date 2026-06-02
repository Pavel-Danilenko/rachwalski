import gsap from "gsap";

// ─── Global cancel registry — всі активні цикли ───────────────────────────────
const activeCancels = new Set();

// Скасовуємо все при Barba-переході
document.addEventListener("page:leave", () => {
   activeCancels.forEach((fn) => fn());
   activeCancels.clear();
});

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawDot(ctx, cx, cy, radius, alpha) {
   const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
   g.addColorStop(0,   `rgba(255,255,255,${alpha.toFixed(3)})`);
   g.addColorStop(0.5, `rgba(210,225,255,${(alpha * 0.5).toFixed(3)})`);
   g.addColorStop(1,   "rgba(255,255,255,0)");
   ctx.beginPath();
   ctx.arc(cx, cy, radius, 0, Math.PI * 2);
   ctx.fillStyle = g;
   ctx.fill();
}

function drawRays(ctx, cx, cy, rayLen, alpha) {
   if (rayLen <= 0 || alpha <= 0) return;
   const rw = 1.6;

   // Horizontal
   const hg = ctx.createLinearGradient(cx - rayLen, cy, cx + rayLen, cy);
   hg.addColorStop(0,   "rgba(255,255,255,0)");
   hg.addColorStop(0.42,`rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
   hg.addColorStop(0.5, `rgba(255,255,255,${alpha.toFixed(3)})`);
   hg.addColorStop(0.58,`rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
   hg.addColorStop(1,   "rgba(255,255,255,0)");
   ctx.beginPath();
   ctx.ellipse(cx, cy, rayLen, rw, 0, 0, Math.PI * 2);
   ctx.fillStyle = hg;
   ctx.fill();

   // Vertical
   const vg = ctx.createLinearGradient(cx, cy - rayLen, cx, cy + rayLen);
   vg.addColorStop(0,   "rgba(255,255,255,0)");
   vg.addColorStop(0.42,`rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
   vg.addColorStop(0.5, `rgba(255,255,255,${alpha.toFixed(3)})`);
   vg.addColorStop(0.58,`rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`);
   vg.addColorStop(1,   "rgba(255,255,255,0)");
   ctx.beginPath();
   ctx.ellipse(cx, cy, rw, rayLen, 0, 0, Math.PI * 2);
   ctx.fillStyle = vg;
   ctx.fill();

   // Diagonals (shorter)
   const dl = rayLen * 0.45;
   [Math.PI / 4, -Math.PI / 4].forEach((angle) => {
      const dg = ctx.createLinearGradient(
         cx - Math.cos(angle) * dl, cy - Math.sin(angle) * dl,
         cx + Math.cos(angle) * dl, cy + Math.sin(angle) * dl,
      );
      dg.addColorStop(0,   "rgba(255,255,255,0)");
      dg.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.45).toFixed(3)})`);
      dg.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.ellipse(cx, cy, dl, 0.9, angle, 0, Math.PI * 2);
      ctx.fillStyle = dg;
      ctx.fill();
   });
}

function buildPuffs() {
   const puffs = [];

   // Великі фонові хмари — canvas 420px, center 210px → safe zone ~190px
   const bgN = 4 + Math.floor(Math.random() * 4);
   for (let i = 0; i < bgN; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 10 + Math.random() * 38; // max dist ~48px
      puffs.push({
         dx: Math.cos(a) * d, dy: Math.sin(a) * d * (0.4 + Math.random() * 0.6),
         rx: 45 + Math.random() * 50, ry: 28 + Math.random() * 42, // max rx 95px → 48+95+16blur=159px ✓
         rot: Math.random() * Math.PI, delay: Math.random() * 0.15,
         alpha: 0.09 + Math.random() * 0.17, blurLayer: 0,
         tint: [255, 255, 255],
      });
   }

   // Середні пуфи — max spread ~135px від центру
   const midN = 20 + Math.floor(Math.random() * 12);
   for (let i = 0; i < midN; i++) {
      const a    = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 62; // max dist ~66px
      const rx   = 10 + Math.random() * 32;
      const ry   = Math.random() > 0.5 ? rx * (0.15 + Math.random() * 0.4) : rx * (0.6 + Math.random() * 0.55);
      puffs.push({
         dx: Math.cos(a) * dist + (Math.random() - 0.5) * 22, // scatter ±22
         dy: Math.sin(a) * dist * (0.48 + Math.random() * 0.7) + (Math.random() - 0.5) * 16,
         rx, ry, rot: Math.random() * Math.PI * 2,
         delay: Math.random() * 0.45,
         alpha: 0.18 + Math.random() * 0.46, blurLayer: 1,
         tint: Math.random() > 0.6 ? [205, 220, 255] : [255, 255, 255],
      });
   }

   // Яскраві вихри — центр вибуху
   const wspN = 5 + Math.floor(Math.random() * 6);
   for (let i = 0; i < wspN; i++) {
      const rx = 6 + Math.random() * 18;
      puffs.push({
         dx: (Math.random() - 0.5) * 32, dy: (Math.random() - 0.5) * 26,
         rx, ry: rx * (0.5 + Math.random() * 0.8),
         rot: Math.random() * Math.PI, delay: 0,
         alpha: 0.4 + Math.random() * 0.45, blurLayer: 2,
         tint: [255, 255, 255],
      });
   }

   return puffs;
}

function drawNebulaLayer(ctx, cx, cy, progress, puffs, blurPx, layerIdx) {
   ctx.save();
   ctx.filter = `blur(${blurPx}px)`;
   puffs.forEach((p) => {
      if (p.blurLayer !== layerIdx) return;
      const raw   = (progress - p.delay) / (1 - p.delay);
      const t     = Math.max(0, Math.min(raw, 1));
      if (t <= 0) return;
      const eased = 1 - Math.pow(1 - t, 2);
      const px    = cx + p.dx * eased;
      const py    = cy + p.dy * eased;
      const rx    = p.rx * (0.18 + eased * 1.0);
      const ry    = p.ry * (0.18 + eased * 1.0);
      const fi    = Math.min(t / 0.13, 1);
      const fo    = 1 - Math.pow(Math.max((t - 0.18) / 0.82, 0), 1.1);
      const a     = p.alpha * fi * fo;
      if (a < 0.003) return;
      const [r, g, b] = p.tint;
      const maxR  = Math.max(rx, ry);
      const grad  = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
      grad.addColorStop(0,    `rgba(${r},${g},${b},${(a * 0.9).toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(${r},${g},${b},${(a * 0.4).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);
      ctx.scale(rx / maxR, ry / maxR);
      ctx.beginPath();
      ctx.arc(0, 0, maxR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
   });
   ctx.filter = "none";
   ctx.restore();
}

function drawNebula(ctx, cx, cy, progress, puffs) {
   drawNebulaLayer(ctx, cx, cy, progress, puffs, 16, 0); // великі фонові
   drawNebulaLayer(ctx, cx, cy, progress, puffs, 9,  1); // середні пуфи
   drawNebulaLayer(ctx, cx, cy, progress, puffs, 4,  2); // яскраві вихри
}

// ─── Phase timings (ms) ───────────────────────────────────────────────────────
const T = {
   DOT_GROW:    800,   // 0 → 800    : dot з'являється
   STAR_BURST:  2000,  // 800 → 2000 : зірка росте і одразу вибухає (merged, no pause)
   NEBULA_END:  3200,  // 2000 → 3200: туманність розвіюється
   HOLD_END:    8200,  // 3200 → 8200: лого видно (5 s)
   HIDE_END:    8700,  // 8200 → 8700: лого зникає
   WAIT_END:    10700, // 8700 → 10700: 2 s пауза перед наступною крапкою
};
const LOGO_FADE_IN_START = 1800;

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
   const dpr = window.devicePixelRatio || 1;
   let W = canvas.offsetWidth;
   let H = canvas.offsetHeight;
   if (!W || !H) {
      requestAnimationFrame(() => runCycle(slot, logoData, onCycleEnd, startAt));
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

   function ease(t) { return 1 - Math.pow(1 - t, 3); } // cubic ease-out

   function frame(now) {
      if (done || cancelled) return;
      const ms = now - start;
      ctx.clearRect(0, 0, W, H);

      // ── Phase 1: dot grows (0 → T.DOT_GROW)
      if (ms < T.DOT_GROW) {
         const t = ease(ms / T.DOT_GROW);
         drawDot(ctx, cx, cy, 5 * t, t);
      }

      // ── Phase 2+3 merged: зірка росте лінійно → одразу вибухає без паузи
      else if (ms < T.STAR_BURST) {
         const t = (ms - T.DOT_GROW) / (T.STAR_BURST - T.DOT_GROW); // лінійний 0→1

         // Зростання: лінійне до 60% фази (без ease-out = без уповільнення)
         const growT  = Math.min(t / 0.6, 1);
         const rayLen = 30 * growT;           // max 30 (менше ніж раніше)
         const dotR   = 5 + 3 * growT;

         // Вибух починається з 40% — overlap з ростом
         const burstT  = Math.max((t - 0.4) / 0.6, 0);
         const starAlpha = 1 - ease(burstT);

         if (starAlpha > 0.01) {
            drawDot(ctx, cx, cy, dotR + 14 * burstT, starAlpha);
            drawRays(ctx, cx, cy, rayLen + 16 * burstT, starAlpha);
         }
         if (burstT > 0) {
            drawNebula(ctx, cx, cy, burstT * 0.5, puffs);
         }
      }

      // ── Phase 4: туманність розвіюється (T.STAR_BURST → T.NEBULA_END)
      else if (ms < T.NEBULA_END) {
         const nT = (ms - T.STAR_BURST) / (T.NEBULA_END - T.STAR_BURST);
         drawNebula(ctx, cx, cy, 0.5 + nT * 0.5, puffs);
      }

      // ── Phase 6+: canvas clear, logo holds
      else {
         ctx.clearRect(0, 0, W, H);
      }

      // Logo fade IN during explosion/nebula
      if (!logoFadeStarted && ms >= LOGO_FADE_IN_START) {
         logoFadeStarted = true;
         gsap.to(img, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });
      }

      // Logo fade OUT at end of hold
      if (!logoHideStarted && ms >= T.HOLD_END) {
         logoHideStarted = true;
         gsap.to(img, {
            opacity: 0, scale: 0.88, duration: 0.5, ease: "power2.in",
         });
      }

      // Cycle end
      if (ms >= T.WAIT_END) {
         cleanup();
         return;
      }

      requestAnimationFrame(frame);
   }

   requestAnimationFrame(frame);
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

      function start() {
         const isIntro = !sessionStorage.getItem("partners_shown");
         if (isIntro) {
            sessionStorage.setItem("partners_shown", "1");
            const step = Math.floor(T.WAIT_END / slots.length);
            slots.forEach((slot, i) => {
               const logo = nextLogo();
               runCycle(slot, logo, () => setTimeout(() => runIndependent(slot, logo.src), i * step), 0);
            });
         } else {
            startStaggered();
         }
      }

      // Якщо секція вже у viewport — стартуємо одразу, інакше чекаємо скрол
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
         requestAnimationFrame(() => requestAnimationFrame(start));
      } else {
         const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            requestAnimationFrame(() => requestAnimationFrame(start));
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
