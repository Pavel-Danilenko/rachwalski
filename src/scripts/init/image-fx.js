// image-fx.js
/*
 * ============================================================
 * IMAGE-FX.JS — ТУТОРІАЛ
 * ============================================================
 *
 * Переносний attribute-driven модуль двох незалежних ефектів:
 *   1) [data-reveal]    — плавна поява елемента при скролі (IntersectionObserver);
 *   2) [data-image-fx]  — 3D-нахил картинки до курсора + лупа-магніфікатор +
 *                          розмиття поза лупою («фокус»). Лише на hover/pointer:fine.
 *
 * Підключення:
 *   • Скрипт вже зареєстрований в app.js умовно — якщо на сторінці немає
 *     [data-reveal] чи [data-image-fx], модуль НЕ вантажиться.
 *   • Стилі імпортуй у компоненті/сторінці, що використовує ефект:
 *       import "@styles/components/_image-fx.scss";
 *     (В Astro це і робить CSS умовним — він потрапляє лише на ті сторінки.)
 *
 * Працює з SPA-переходами (page:ready) і поважає prefers-reduced-motion
 * (нахил/лупа/розмиття вимикаються, поява лишається простим fade).
 *
 *
 * ============================================================
 * 1) ПОЯВА ПРИ СКРОЛІ — [data-reveal]
 * ============================================================
 *
 *   <div data-reveal> ... </div>
 *
 * Опційні налаштування (атрибути):
 *   data-reveal-y="28"      — наскільки піднімається при появі, px (дефолт 28)
 *   data-reveal-dur="0.7"   — тривалість, с (дефолт 0.7)
 *   data-reveal-delay="0"   — затримка, с (дефолт 0)
 *
 * Без JS / при reduced-motion елемент лишається видимим (нічого не ховаємо
 * наосліп — прихований стан додається лише коли JS «озброїв» елемент).
 *
 *
 * ============================================================
 * 2) 3D-НАХИЛ + ЛУПА — [data-image-fx]
 * ============================================================
 *
 * Вішається на КОНТЕЙНЕР, що містить <img> (модуль сам знайде картинку та її
 * обгортку). Нахил застосовується до ОБГОРТКИ картинки, а не до контейнера —
 * це важливо, якщо контейнер має backdrop-filter (його трансформ щокадру = фриз
 * на Safari).
 *
 *   <div data-image-fx>
 *      <div class="img-wrapper"><img src="..."></div>
 *   </div>
 *
 * Опційні налаштування (атрибути):
 *   data-fx-tilt="11"       — макс. кут 3D-нахилу, deg (0 = вимкнути нахил)
 *   data-fx-smooth="0.22"   — згладжування руху лупи 0..1 (менше = плавніше/інертніше)
 *   data-fx-lens            — УВІМКНУТИ лупу (за замовчуванням ВИМКНЕНА; присутність
 *                             атрибута вмикає, data-fx-lens="false" — явно вимикає)
 *   data-fx-zoom="1.5"      — кратність збільшення лупи
 *   data-fx-lens-size="0.2" — радіус лупи як частка меншого боку картинки
 *   data-fx-lens-edge="72"  — м'якість краю лупи: % де маска ще суцільна (далі згасає)
 *   data-fx-lens-bg          — заливка лупи: КОЛІР (дефолт var(--color-bg)) АБО
 *                               будь-який CSS-ГРАДІЄНТ. Має бути НЕпрозорою, щоб під
 *                               лупою не просвічувала прозора картинка. Градієнт —
 *                               коли фон картки не однотонний (щоб лупа не давала
 *                               темного прямокутника на світлішій частині):
 *                               data-fx-lens-bg="linear-gradient(to top right, #0b111a, #2a3a52)"
 *   data-fx-blur="2.5"      — розмиття картинки ПОЗА лупою, px (0 = вимкнути)
 *
 * Приклади:
 *   <div data-image-fx>…</div>                              (тільки нахил, лупа off)
 *   <div data-image-fx data-fx-lens data-fx-zoom="1.8">…</div>  (нахил + лупа)
 *   <div data-image-fx data-fx-lens data-fx-tilt="0" data-fx-blur="0">…</div> (чиста лупа)
 *
 * Детальніше — _instruction/README-image-fx.md
 * ============================================================
 */

const reduceMotion = window.matchMedia(
   "(prefers-reduced-motion: reduce)",
).matches;
const canHover = window.matchMedia("(any-hover: hover) and (pointer: fine)");

const num = (v, d) => {
   const n = parseFloat(v);
   return Number.isFinite(n) ? n : d;
};
const bool = (v, d) => (v == null ? d : !/^(false|0|no|off)$/i.test(v));

// ── 1. Поява при скролі ───────────────────────────────────────────────────────
const revealIO =
   typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
           (entries) => {
              entries.forEach((e) => {
                 if (!e.isIntersecting) return;
                 e.target.classList.add("is-revealed");
                 revealIO.unobserve(e.target);
              });
           },
           { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        )
      : null;

function setupReveal(el) {
   if (el.dataset.revealInit) return;
   el.dataset.revealInit = "1";

   el.style.setProperty("--reveal-y", `${num(el.dataset.revealY, 28)}px`);
   el.style.setProperty("--reveal-dur", `${num(el.dataset.revealDur, 0.7)}s`);
   el.style.setProperty("--reveal-delay", `${num(el.dataset.revealDelay, 0)}s`);
   el.classList.add("is-armed"); // вмикає прихований стартовий стан у CSS

   if (reduceMotion || !revealIO) {
      el.classList.add("is-revealed");
      return;
   }
   revealIO.observe(el);
}

// ── 2. 3D-нахил + лупа ────────────────────────────────────────────────────────
function findStage(card, img) {
   // Обгортка картинки = елемент, що тилтиться й тримає лупу.
   // <picture> пропускаємо — беремо його батька (справжню обгортку).
   return img.closest("picture")?.parentElement || img.parentElement || card;
}

function positionLens(stage, img, lens) {
   // Виставляємо бокс лупи рівно над <img> (працює при padding/<picture>/object-fit).
   const sr = stage.getBoundingClientRect();
   const ir = img.getBoundingClientRect();
   lens.style.left = `${(ir.left - sr.left).toFixed(1)}px`;
   lens.style.top = `${(ir.top - sr.top).toFixed(1)}px`;
   lens.style.width = `${ir.width.toFixed(1)}px`;
   lens.style.height = `${ir.height.toFixed(1)}px`;
}

function buildLens(stage, img) {
   let lens = stage.querySelector(".fx-lens");
   if (lens) return lens;
   lens = document.createElement("div");
   lens.className = "fx-lens";
   const inner = document.createElement("div");
   inner.className = "fx-lens__inner";
   lens.appendChild(inner);
   stage.appendChild(lens);

   const apply = () => {
      const src = img.currentSrc || img.src;
      // Літеру кладемо в CSS-змінну — щоб під нею CSS міг скомпонувати ще шар
      // заливки (колір АБО градієнт) для бездоганного злиття з фоном картки.
      if (src) inner.style.setProperty("--fx-lens-img", `url("${src}")`);
      positionLens(stage, img, lens);
   };
   apply();
   if (!img.complete) img.addEventListener("load", apply, { once: true });
   return lens;
}

function setupImageFx(card) {
   if (card.dataset.imageFxInit) return;
   card.dataset.imageFxInit = "1";

   const img = card.querySelector("img");
   if (!img) return;
   const stage = findStage(card, img);
   stage.classList.add("fx-stage");

   const cfg = {
      tilt: num(card.dataset.fxTilt, 11),
      smooth: num(card.dataset.fxSmooth, 0.22),
      lens: bool(card.dataset.fxLens, false),
      zoom: num(card.dataset.fxZoom, 1.5),
      lensSize: num(card.dataset.fxLensSize, 0.2),
   };

   // Конфіг, який читає CSS (через кастомні властивості)
   card.style.setProperty("--fx-zoom", cfg.zoom);
   card.style.setProperty("--fx-blur", `${num(card.dataset.fxBlur, 2.5)}px`);
   if (card.dataset.fxLensEdge != null)
      card.style.setProperty("--fx-lens-edge", `${num(card.dataset.fxLensEdge, 72)}%`);
   // Заливка лупи: градієнт → окремий шар під літерою; колір → background-color.
   // (Градієнт потрібен, коли фон картки не однотонний — щоб лупа не давала
   // темного прямокутника на світлішій частині градієнта.)
   if (card.dataset.fxLensBg) {
      const bg = card.dataset.fxLensBg;
      if (/gradient/i.test(bg)) card.style.setProperty("--fx-lens-fill", bg);
      else card.style.setProperty("--fx-lens-bg", bg);
   }

   card.classList.add("fx-on");
   if (cfg.lens) card.classList.add("fx-has-lens");

   // Інтерактив лише там, де є справжній hover і не reduced-motion
   if (reduceMotion || !canHover.matches) return;

   const lens = cfg.lens ? buildLens(stage, img) : null;

   let hovering = false;
   let rafId = null;
   let lastX = 0;
   let lastY = 0;
   let cx = null;
   let cy = null;

   const loop = () => {
      if (!hovering) return;
      const crect = card.getBoundingClientRect();

      if (cfg.tilt) {
         const px = (lastX - crect.left) / crect.width - 0.5;
         const py = (lastY - crect.top) / crect.height - 0.5;
         stage.style.setProperty("--rx", `${(-py * cfg.tilt).toFixed(2)}deg`);
         stage.style.setProperty("--ry", `${(px * cfg.tilt).toFixed(2)}deg`);
      }

      if (lens) {
         const lrect = lens.getBoundingClientRect();
         const tx = lastX - lrect.left;
         const ty = lastY - lrect.top;
         if (cx === null) {
            cx = tx;
            cy = ty;
         } else {
            cx += (tx - cx) * cfg.smooth;
            cy += (ty - cy) * cfg.smooth;
         }
         const r = Math.max(
            40,
            Math.min(lrect.width, lrect.height) * cfg.lensSize,
         );
         stage.style.setProperty("--lx", `${cx.toFixed(1)}px`);
         stage.style.setProperty("--ly", `${cy.toFixed(1)}px`);
         stage.style.setProperty("--lens-r", `${r.toFixed(1)}px`);
      }

      rafId = requestAnimationFrame(loop);
   };

   const onEnter = (e) => {
      hovering = true;
      lastX = e.clientX;
      lastY = e.clientY;
      cx = null;
      cy = null;
      if (lens) positionLens(stage, img, lens); // layout міг змінитись
      if (!rafId) rafId = requestAnimationFrame(loop);
   };
   const onMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
   };
   const onLeave = () => {
      hovering = false;
      if (rafId) {
         cancelAnimationFrame(rafId);
         rafId = null;
      }
      if (cfg.tilt) {
         stage.style.setProperty("--rx", "0deg");
         stage.style.setProperty("--ry", "0deg");
      }
   };

   card.addEventListener("mouseenter", onEnter);
   card.addEventListener("mousemove", onMove);
   card.addEventListener("mouseleave", onLeave);
}

// ── Ініціалізація ─────────────────────────────────────────────────────────────
function init() {
   document.querySelectorAll("[data-reveal]").forEach(setupReveal);
   document.querySelectorAll("[data-image-fx]").forEach(setupImageFx);
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", init);
} else {
   init();
}

// SPA-перехід (Astro/Barba) — у новому DOM ініціалізуємо знову (ідемпотентно).
document.addEventListener("page:ready", init);

export {};
