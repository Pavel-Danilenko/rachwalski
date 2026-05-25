// app.js — головний файл ініціалізації
// Кожен модуль при завантаженні сам:
//   1. Викликає initXxx() одразу
//   2. Реєструє document.addEventListener("page:ready", initXxx)
// Тому тут достатньо просто import() — без виклику функцій

import "@scripts/global/page-lifecycle";
import "@scripts/animation/barba";
import "@scripts/custom";

// ── page-loaded клас ──────────────────────────────────────────────────────
document.addEventListener("page:leave", () =>
   document.documentElement.classList.remove("page-loaded"),
);
document.addEventListener("page:ready", () =>
   document.documentElement.classList.add("page-loaded"),
);

// ── Авто-реєстрація слайдерів ─────────────────────────────────────────────
// Щоб додати новий слайдер — створи src/scripts/sliders/назва.js
// і додай рядок: export const selector = "[data-назва]"
// Більше нічого не потрібно.
// WP build теж на Vite → import.meta.glob працює без змін.
const _autoLoaders   = import.meta.glob("./sliders/*.js");
const _autoSelectors = import.meta.glob("./sliders/*.js", { import: "selector", eager: true });

// ── Динамічне підвантаження модулів ──────────────────────────────────────
async function loadModules() {
   const tasks = [];

   // Авто-виявлення: усі init/*.js що експортують `selector`
   for (const [path, selector] of Object.entries(_autoSelectors)) {
      if (selector && document.querySelector(selector))
         tasks.push(_autoLoaders[path]());
   }

   // Решта: глобальні скрипти та init-файли без `selector`
   if (document.querySelector("[data-goto]"))
      tasks.push(import("@scripts/global/goto-block"));

   if (document.querySelector("[data-watch], [data-watch-once]"))
      tasks.push(import("@scripts/global/data-watch"));

   if (document.querySelector("[data-scroll-nav]"))
      tasks.push(import("@scripts/init/scroll-nav"));

   if (document.querySelector("[data-toc]"))
      tasks.push(import("@scripts/init/toc"));

   if (document.querySelector("[data-slide-nav]"))
      tasks.push(import("@scripts/init/slide-nav"));

   if (document.querySelector("[data-counter-target]"))
      tasks.push(import("@scripts/init/counter"));

   if (document.querySelector("[data-slider]"))
      tasks.push(import("@scripts/init/slider"));

   if (document.querySelector("[data-typing]"))
      tasks.push(import("@scripts/animation/typing"));

   if (document.querySelector("[data-split]"))
      tasks.push(import("@scripts/animation/split"));

   if (document.querySelector("form[data-backend]"))
      tasks.push(import("@scripts/init/contact-form"));

   if (document.querySelector("[data-phone-input]"))
      tasks.push(import("@scripts/init/phone-input"));

   if (document.querySelector(".custom-select-wrapper"))
      tasks.push(import("@scripts/init/select"));

   if (document.querySelector("[data-password-input]"))
      tasks.push(import("@scripts/init/password-input"));

   if (document.querySelector("[data-file-input]"))
      tasks.push(import("@scripts/init/custom-file-input"));

   if (document.querySelector("[data-datepicker]"))
      tasks.push(import("@scripts/init/custom-datepicker"));

   if (document.querySelector("[data-number-input]"))
      tasks.push(import("@scripts/init/number-input"));

   if (document.querySelector("[data-range-input]"))
      tasks.push(import("@scripts/init/range-input"));

   if (document.querySelector("[data-rating]"))
      tasks.push(import("@scripts/init/rating"));

   if (document.querySelector("[data-fancybox]"))
      tasks.push(import("@scripts/init/gallery"));

   if (document.querySelector("[data-accordion]"))
      tasks.push(import("@scripts/init/accordion"));

   if (document.querySelector("[data-tabs]"))
      tasks.push(import("@scripts/init/tabs"));

   if (document.querySelector("[data-cards-slider]"))
      tasks.push(import("@scripts/sliders/cards-slider"));

   if (document.querySelector("[data-lecture-slider]"))
      tasks.push(import("@scripts/sliders/lecture-slider"));

   if (document.querySelector("[data-topics-slider]"))
      tasks.push(import("@scripts/sliders/topics-slider"));

   if (document.querySelector("[data-reviews-slider]"))
      tasks.push(import("@scripts/sliders/reviews-slider"));

   if (document.querySelector("[data-google-map]"))
      tasks.push(import("@scripts/maps/google-map"));

   if (document.querySelector(".custom-search"))
      tasks.push(import("@scripts/init/custom-search"));

   if (document.querySelector("[data-blog-search]"))
      tasks.push(import("@scripts/init/blog-search"));

   if (document.querySelector("[data-blog-filter]"))
      tasks.push(import("@scripts/init/blog-filter"));

   if (document.querySelector("[data-marquee]"))
      tasks.push(import("@scripts/init/marquee"));

   if (document.querySelector("[data-wizard-step]")) {
      tasks.push(import("@scripts/init/form-wizard"));
      tasks.push(import("@scripts/init/wizard-effects"));
   }

   if (document.querySelector("[data-sitemap]"))
      tasks.push(import("@scripts/init/sitemap"));

   if (document.querySelector("[data-pagination-root]"))
      tasks.push(import("@scripts/init/pagination"));

   if (document.querySelector("[data-show-more-root]"))
      tasks.push(import("@scripts/init/show-more"));

   if (document.querySelector("[data-text-toggle]"))
      tasks.push(import("@scripts/init/text-toggle"));

   if (document.querySelector("[data-filter-tabs]"))
      tasks.push(import("@scripts/init/filter-tabs"));

   if (document.querySelector("[data-reviews-grid]"))
      tasks.push(import("@scripts/init/testimonials-filter"));

   if (document.querySelector("[data-menu-overlay]"))
      tasks.push(import("@scripts/init/nav-primary-width"));

   await Promise.all(tasks);
}

document.addEventListener("page:ready", loadModules);

// Запускаємо одразу при першому завантаженні сторінки
// (page:ready вже спрацював до реєстрації цього listener-а)
loadModules();
