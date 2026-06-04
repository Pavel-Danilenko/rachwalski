import gsap from "gsap";

// ─── Оптимізація 1: один глобальний rAF замість 9 окремих ────────────────────
const activeFrames = new Set();
let globalRafId = null;

function scheduleTick() {
   globalRafId = requestAnimationFrame((now) => {
      globalRafId = null;
      activeFrames.forEach((fn) => fn(now));
      if (activeFrames.size) scheduleTick();
   });
}
function addFrame(fn)    { activeFrames.add(fn);    if (!globalRafId) scheduleTick(); }
function removeFrame(fn) { activeFrames.delete(fn); }

// ─── Global cancel registry — всі активні цикли ───────────────────────────────
const activeCancels = new Set();

// Скасовуємо все при Barba-переході
document.addEventListener("page:leave", () => {
   activeCancels.forEach((fn) => fn());
   activeCancels.clear();
});

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawDot(ctx, cx, cy, radius, alpha) {
   if (radius <= 0 || alpha <= 0) return;
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

   // Великі м'які фонові кулі — основа туманності
   const bgN = 5 + Math.floor(Math.random() * 3);
   for (let i = 0; i < bgN; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 8 + Math.random() * 32;
      puffs.push({
         dx: Math.cos(a) * d,
         dy: Math.sin(a) * d * 0.65,
         r:  42 + Math.random() * 45,
         delay: Math.random() * 0.12,
         alpha: 0.18 + Math.random() * 0.16,
         blur:  16 + Math.random() * 6,
      });
   }

   // Середні щільні кулі — видима структура хмари
   const midN = 20 + Math.floor(Math.random() * 10);
   for (let i = 0; i < midN; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 2 + Math.random() * 55;
      puffs.push({
         dx: Math.cos(a) * d + (Math.random() - 0.5) * 20,
         dy: Math.sin(a) * d * 0.68 + (Math.random() - 0.5) * 15,
         r:  10 + Math.random() * 26,
         delay: Math.random() * 0.4,
         alpha: 0.28 + Math.random() * 0.38,
         blur:  7 + Math.random() * 7,
      });
   }

   // Яскраві дрібні кулі — яскрава серцевина
   const coreN = 6 + Math.floor(Math.random() * 4);
   for (let i = 0; i < coreN; i++) {
      puffs.push({
         dx: (Math.random() - 0.5) * 22,
         dy: (Math.random() - 0.5) * 18,
         r:  6 + Math.random() * 14,
         delay: Math.random() * 0.08,
         alpha: 0.5 + Math.random() * 0.4,
         blur:  3 + Math.random() * 4,
      });
   }

   return puffs;
}

function drawNebula(ctx, cx, cy, progress, puffs) {
   puffs.forEach((p) => {
      const raw   = (progress - p.delay) / (1 - p.delay);
      const t     = Math.max(0, Math.min(raw, 1));
      if (t <= 0) return;
      const eased = 1 - Math.pow(1 - t, 2);
      const fi    = Math.min(t / 0.12, 1);
      const fo    = 1 - Math.pow(Math.max((t - 0.15) / 0.85, 0), 1.1);
      const a     = p.alpha * fi * fo;
      if (a < 0.003) return;

      const px = cx + p.dx * eased;
      const py = cy + p.dy * eased;
      const r  = p.r * (0.2 + eased);
      if (r <= 0) return;

      ctx.save();
      ctx.filter = `blur(${p.blur}px)`;

      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0,   `rgba(255,255,255,${Math.min(a * 1.1, 1).toFixed(3)})`);
      g.addColorStop(0.3, `rgba(240,245,255,${(a * 0.65).toFixed(3)})`);
      g.addColorStop(0.7, `rgba(220,232,255,${(a * 0.2).toFixed(3)})`);
      g.addColorStop(1,   `rgba(255,255,255,0)`);

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
   });
}

// ─── Оптимізація 2: pre-bake туману — blur один раз, далі drawImage ───────────
// Бейкаємо при progress=0.35 — пік видимості пуфів (при 1.0 всі вже зникли)
function prebakeNebula(W, H, dpr, cx, cy, puffs) {
   const oc = document.createElement("canvas");
   // Offscreen canvas для blur не потребує повного DPR — blur маскує різницю
   const bakeDpr = Math.min(dpr, 1);
   oc.width  = W * bakeDpr;
   oc.height = H * bakeDpr;
   const octx = oc.getContext("2d");
   octx.scale(bakeDpr, bakeDpr);
   drawNebula(octx, cx, cy, 0.35, puffs);
   return oc;
}

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
