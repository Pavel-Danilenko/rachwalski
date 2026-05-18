import barba   from "@barba/core";
import gsap    from "gsap";
import { transitions as config } from "./barba.config.js";
import { dispatchPageReady, dispatchPageLeave } from "@scripts/global/page-lifecycle";
import { resetBodyLock }                        from "@scripts/global/block-scroll";

// ── Анімації (leave + enter) ──────────────────────────────────────────────

const ANIMATIONS = {

   // ── Базові ────────────────────────────────────────────────────────────────
   none: {
      leave: () => Promise.resolve(),
      enter: () => Promise.resolve(),
   },

   fade: {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0,                        duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0,                        duration: d, ease: e }),
   },

   // ── Slide ─────────────────────────────────────────────────────────────────
   "slide-up": {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, y: "-8%",             duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, y: "8%",              duration: d, ease: e }),
   },
   "slide-down": {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, y: "8%",              duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, y: "-8%",             duration: d, ease: e }),
   },
   "slide-left": {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, x: "-8%",             duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, x: "8%",              duration: d, ease: e }),
   },
   "slide-right": {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, x: "8%",              duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, x: "-8%",             duration: d, ease: e }),
   },

   // ── Scale ─────────────────────────────────────────────────────────────────
   scale: {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, scale: 0.95,          duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, scale: 0.95,          duration: d, ease: e }),
   },
   "zoom-in": {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, scale: 1.08,          duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, scale: 0.92,          duration: d, ease: e }),
   },

   // ── Blur ──────────────────────────────────────────────────────────────────
   blur: {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, filter: "blur(12px)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, filter: "blur(12px)", duration: d, ease: e }),
   },

   // ── Clip / Wipe ───────────────────────────────────────────────────────────

   // Шторка зверху вниз
   clip: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(0 0 100% 0)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(100% 0 0 0)", duration: d, ease: e }),
   },

   // Шторка знизу вгору
   "clip-up": {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(100% 0 0 0)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(0 0 100% 0)", duration: d, ease: e }),
   },

   // Кругове розкриття (iris) — cinematic ефект
   iris: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "circle(0% at 50% 50%)",   duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "circle(0% at 50% 50%)",   duration: d, ease: e }),
   },

   // Горизонтальна шторка (curtain) зліва
   curtain: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(0 100% 0 0)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(0 0 0 100%)", duration: d, ease: e }),
   },

   // ── 3D ───────────────────────────────────────────────────────────────────

   // Горизонтальний flip
   flip: {
      leave: (el, d, e) => gsap.to(el,   { rotationY: 90,  opacity: 0, transformPerspective: 1000, duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { rotationY: -90, opacity: 0, transformPerspective: 1000, duration: d, ease: e }),
   },

   // Вертикальний flip
   "flip-x": {
      leave: (el, d, e) => gsap.to(el,   { rotationX: 90,  opacity: 0, transformPerspective: 1000, duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { rotationX: -90, opacity: 0, transformPerspective: 1000, duration: d, ease: e }),
   },

   // ── Комбо ─────────────────────────────────────────────────────────────────

   // Blur + scale + slide — плавний преміум-перехід
   morph: {
      leave: (el, d, e) => gsap.to(el,   { opacity: 0, scale: 1.04, filter: "blur(6px)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { opacity: 0, scale: 0.96, filter: "blur(6px)", duration: d, ease: e }),
   },

   // Відкидання вниз + нова сторінка з'являється зверху — кінематографічний
   push: {
      leave: (el, d, e) => gsap.to(el,   { y: "40%", opacity: 0, scale: 0.9, duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { y: "-15%", opacity: 0,            duration: d, ease: e }),
   },

   // Glitch — цифровий збій
   glitch: {
      leave: (el, d, e) => {
         const tl = gsap.timeline();
         tl.to(el, { x: 6,  skewX: 3,  duration: d * 0.15, ease: "none" })
           .to(el, { x: -6, skewX: -3, opacity: 0.6, duration: d * 0.15, ease: "none" })
           .to(el, { x: 0,  skewX: 0,  opacity: 0,   duration: d * 0.7,  ease: e });
         return tl;
      },
      enter: (el, d, e) => {
         const tl = gsap.timeline();
         tl.from(el, { opacity: 0, duration: d * 0.3, ease: "none" })
           .from(el, { x: -8, skewX: -2, duration: d * 0.15, ease: "none" }, 0)
           .to(el,   { x: 0,  skewX: 0,  duration: d * 0.55, ease: e }, d * 0.3);
         return tl;
      },
   },

   // ── ВАУ-ЕФЕКТИ ────────────────────────────────────────────────────────────

   // Кінотеатральне розкриття — blur + zoom + reveal знизу
   cinematic: {
      leave: (el, d, e) => {
         const tl = gsap.timeline();
         tl.to(el, { scale: 1.06, filter: "blur(16px)", opacity: 0, duration: d, ease: e });
         return tl;
      },
      enter: (el, d, e) => {
         const tl = gsap.timeline();
         tl.from(el, { scale: 0.94, filter: "blur(16px)", opacity: 0, duration: d, ease: e });
         return tl;
      },
   },

   // Діагональна шторка — зліва-знизу направо-вгору
   diagonal: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(0 100% 100% 0)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(100% 0 0 100%)", duration: d, ease: e }),
   },

   // Reveal знизу — сторінка виростає вгору як із землі
   rise: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(100% 0 0 0)", opacity: 0, duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(0 0 100% 0)", opacity: 0, duration: d, ease: e }),
   },

   // Розліт — стара сторінка розлітається в сторони
   shatter: {
      leave: (el, d, e) => {
         const tl = gsap.timeline();
         tl.to(el, { scale: 0.85, opacity: 0.6, duration: d * 0.3, ease: "power2.in" })
           .to(el, { scale: 1.2,  opacity: 0,   filter: "blur(20px)", duration: d * 0.7, ease: e });
         return tl;
      },
      enter: (el, d, e) => {
         const tl = gsap.timeline();
         tl.from(el, { scale: 0.8, opacity: 0, filter: "blur(20px)", duration: d, ease: e });
         return tl;
      },
   },

   // Занурення — стара тоне в глибину, нова спливає
   dive: {
      leave: (el, d, e) => gsap.to(el,   {
         scale: 0.7, opacity: 0, rotationX: 15,
         transformPerspective: 800, duration: d, ease: e,
      }),
      enter: (el, d, e) => gsap.from(el, {
         scale: 1.1, opacity: 0, rotationX: -10,
         transformPerspective: 800, duration: d, ease: e,
      }),
   },

   // Горизонтальне кругове розкриття — iris з лівого краю
   "iris-left": {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "circle(0% at 0% 50%)",   duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "circle(0% at 100% 50%)", duration: d, ease: e }),
   },

   // Spotlight — звужується в центральну точку і розширюється знову
   spotlight: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "circle(0% at 50% 30%)", duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "circle(0% at 50% 30%)", duration: d, ease: e }),
   },

   // Accordion-шторка — стискається по вертикалі в центр
   accordion: {
      leave: (el, d, e) => gsap.to(el,   { clipPath: "inset(50% 0 50% 0)", opacity: 0, duration: d, ease: e }),
      enter: (el, d, e) => gsap.from(el, { clipPath: "inset(50% 0 50% 0)", opacity: 0, duration: d, ease: e }),
   },
};

// ── Overlay — кольоровий фон між сторінками ───────────────────────────────
// Показується під clip/iris/curtain анімаціями замість білого фону
function getOverlay() {
   let el = document.querySelector(".barba-overlay");
   if (!el) {
      el = document.createElement("div");
      el.className = "barba-overlay";
      Object.assign(el.style, {
         position:      "fixed",
         inset:         "0",
         zIndex:        "calc(var(--z-modal, 400) - 1)",
         pointerEvents: "none",
         opacity:       "0",
         transition:    "none",
      });
      document.body.appendChild(el);
   }
   return el;
}

// Плавно показує overlay разом з leave анімацією
function showOverlay(color, duration, ease) {
   if (!color) return Promise.resolve();
   const el = getOverlay();
   el.style.background = color;
   return gsap.fromTo(el,
      { opacity: 0 },
      { opacity: 1, duration: duration * 0.6, ease },
   );
}

// Плавно ховає overlay разом з enter анімацією
function hideOverlay(duration, ease) {
   const el = document.querySelector(".barba-overlay");
   if (!el) return Promise.resolve();
   return gsap.to(el, { opacity: 0, duration: duration * 0.5, ease, delay: duration * 0.3 });
}

// ── Отримати конфіг для поточного переходу ────────────────────────────────
function getConfig(namespace) {
   return { ...config.default, ...(config[namespace] ?? {}) };
}

// ── Cleanup ───────────────────────────────────────────────────────────────
function cleanupPage() {
   [
      ["[data-accordion-initialized]",  "accordionInitialized"],
      ["[data-tabs-initialized]",       "tabsInitialized"],
      ["[data-pagination-ready]",       "paginationReady"],
      ["[data-show-more-ready]",        "showMoreReady"],
      ["[data-slider-initialized]",     "sliderInitialized"],
      ["[data-swiper-init]",            "swiperInit"],
      ["[data-file-input-initialized]",    "fileInputInitialized"],
      ["[data-select-initialized]",        "selectInitialized"],
      ["[data-datepicker-initialized]",    "datepickerInitialized"],
      ["[data-number-input][data-initialized]", "initialized"],
      ["[data-google-map-initialized]",    "googleMapInitialized"],
      ["[data-slide-nav-init]",            "slideNavInit"],
      ["[data-custom-search-init]",         "customSearchInit"],
      ["[data-blog-search-init]",          "blogSearchInit"],
      ["[data-blog-filter-init]",          "blogFilterInit"],
      ["[data-text-toggle-init]",          "textToggleInit"],
      ["[data-filter-tabs][data-filter-tabs-init]",  "filterTabsInit"],
      ["[data-reviews-grid][data-testimonials-filter-init]", "testimonialsFilterInit"],
   ].forEach(([sel, key]) =>
      document.querySelectorAll(sel).forEach((el) => delete el.dataset[key]),
   );

   resetBodyLock();
   dispatchPageLeave();
}

// ── Оновлення <title>, meta та page-specific CSS ──────────────────────────
async function syncMeta(nextHtml) {
   const doc = new DOMParser().parseFromString(nextHtml, "text/html");
   if (doc.title) document.title = doc.title;

   const nextDesc = doc.querySelector('meta[name="description"]');
   const currDesc = document.querySelector('meta[name="description"]');
   if (nextDesc && currDesc)
      currDesc.setAttribute("content", nextDesc.getAttribute("content") ?? "");

   // Dev mode (Vite): CSS is inlined as <style data-vite-dev-id="...">
   const currViteIds = new Set(
      [...document.querySelectorAll("style[data-vite-dev-id]")].map(s => s.getAttribute("data-vite-dev-id")),
   );
   doc.querySelectorAll("style[data-vite-dev-id]").forEach(style => {
      if (!currViteIds.has(style.getAttribute("data-vite-dev-id")))
         document.head.appendChild(style.cloneNode(true));
   });

   // Prod mode: CSS is served as <link rel="stylesheet">
   const currHrefs = new Set(
      [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.getAttribute("href")),
   );
   const newLinks = [...doc.querySelectorAll('link[rel="stylesheet"]')]
      .filter(l => !currHrefs.has(l.getAttribute("href")));

   if (newLinks.length === 0) return;

   await Promise.all(newLinks.map(link => new Promise(resolve => {
      const el = document.createElement("link");
      el.rel  = "stylesheet";
      el.href = link.getAttribute("href");
      el.onload  = resolve;
      el.onerror = resolve;
      document.head.appendChild(el);
   })));
}

// ── Barba ─────────────────────────────────────────────────────────────────
barba.init({
   prefetchIgnore: true,

   prevent: ({ el }) =>
      el.classList.contains("no-transition") ||
      el.getAttribute("target") === "_blank",

   transitions: [
      {
         name: "page-transition",

         async leave({ current, next }) {
            const cfg    = getConfig(next.namespace);
            const anim   = ANIMATIONS[cfg.animation] ?? ANIMATIONS.fade;
            const footer = document.querySelector(".footer");

            cleanupPage();

            const animations = [
               anim.leave(current.container, cfg.duration.leave, cfg.ease.leave),
            ];

            // Overlay анімується паралельно з leave
            if (cfg.color) {
               animations.push(showOverlay(cfg.color, cfg.duration.leave, cfg.ease.leave));
            }

            if (cfg.animateFooter && footer) {
               animations.push(
                  gsap.to(footer, { opacity: 0, y: 10, duration: cfg.duration.leave, ease: cfg.ease.leave }),
               );
            }

            await Promise.all(animations);
         },

         async beforeEnter({ next }) {
            await syncMeta(next.html);

            const footer = document.querySelector(".footer");
            if (footer) gsap.set(footer, { clearProps: "opacity,y" });
         },

         async enter({ next }) {
            const cfg    = getConfig(next.namespace);
            const anim   = ANIMATIONS[cfg.animation] ?? ANIMATIONS.fade;
            const footer = document.querySelector(".footer");

            anim.enter(next.container, cfg.duration.enter, cfg.ease.enter);

            if (cfg.animateFooter && footer) {
               gsap.from(footer, { opacity: 0, y: 10, duration: cfg.duration.enter, ease: cfg.ease.enter });
            }
         },

         afterEnter({ next }) {
            const cfg = getConfig(next.namespace);
            // Overlay зникає після появи нової сторінки
            if (cfg.color) hideOverlay(cfg.duration.enter, cfg.ease.enter);
            dispatchPageReady();
         },
      },
   ],
});

// ── Scroll to top ─────────────────────────────────────────────────────────
barba.hooks.enter(() => {
   window.scrollTo({ top: 0, behavior: "instant" });
});

// ── Dev logger ────────────────────────────────────────────────────────────
if (import.meta.env.DEV) {
   barba.hooks.beforeLeave(({ current, next }) =>
      console.log(`[barba] ${current.namespace} → ${next.namespace}`),
   );
}
