// particle-burst.js — спільні canvas-примітиви для "вибух-ефекту" (дот → зірка
// → пилова хмара), винесені з partners.js. Використовується і партнерами, і
// hotspot-burst.js (крапки над відео/картками), щоб не дублювати ~150 рядків
// canvas-математики та мати ОДИН спільний rAF-цикл на всі анімації разом.

// ─── Один глобальний rAF замість окремого на кожен слот/крапку ───────────────
const activeFrames = new Set();
let globalRafId = null;

function scheduleTick() {
   globalRafId = requestAnimationFrame((now) => {
      globalRafId = null;
      activeFrames.forEach((fn) => fn(now));
      if (activeFrames.size) scheduleTick();
   });
}
export function addFrame(fn)    { activeFrames.add(fn);    if (!globalRafId) scheduleTick(); }
export function removeFrame(fn) { activeFrames.delete(fn); }

// ─── Global cancel registry — всі активні цикли (партнери + крапки) ──────────
export const activeCancels = new Set();

// Скасовуємо все при Barba-переході. Єдине місце, де підписано цей listener —
// не дублювати в partners.js/hotspot-burst.js.
document.addEventListener("page:leave", () => {
   activeCancels.forEach((fn) => fn());
   activeCancels.clear();
});

// ─── Draw helpers ─────────────────────────────────────────────────────────────

export function drawDot(ctx, cx, cy, radius, alpha) {
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

export function drawRays(ctx, cx, cy, rayLen, alpha) {
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

export function buildPuffs() {
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

export function drawNebula(ctx, cx, cy, progress, puffs) {
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

// Pre-bake туману — blur один раз, далі drawImage (замість blur щокадру)
export function prebakeNebula(W, H, dpr, cx, cy, puffs) {
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
