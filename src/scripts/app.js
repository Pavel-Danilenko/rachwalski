//

// //розкоментувати цей рядок якщо використовуємо спостерігач /
// // також це потрібно для таких віджетів якщо
// // progress-bar, counter
// import "@scripts/global/data-watch";

// // друк слів на сторінці
// import "@scripts/animation/typing";

// // розліт слів
// import "@scripts/animation/split";

//

// app.js

function addPageLoaded() {
   document.documentElement.classList.add("page-loaded");
}

function removePageLoaded() {
   document.documentElement.classList.remove("page-loaded");
}

function getTransitionDuration() {
   const wrapper = document.querySelector("[data-transition-wrapper]");
   return parseInt(wrapper?.dataset.transitionDuration) || 0;
}

document.addEventListener("astro:before-preparation", removePageLoaded);

document.addEventListener("astro:after-swap", () => {
   const duration = getTransitionDuration();
   setTimeout(addPageLoaded, duration);
});

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", addPageLoaded);
} else {
   addPageLoaded();
}

// ============================================================
// ДИНАМІЧНЕ ПІДВАНТАЖЕННЯ СКРИПТІВ
// ============================================================
async function loadModules() {
   const imports = [];

   if (document.querySelector("[data-watch], [data-watch-once]")) {
      imports.push(import("@scripts/global/data-watch"));
   }

   if (document.querySelector("[data-goto]")) {
      imports.push(import("@scripts/global/goto-block"));
   }

   if (document.querySelector("[data-scroll-nav]")) {
      imports.push(import("@scripts/init/scroll-nav"));
   }

   if (document.querySelector("[data-qty-minus], [data-qty-plus]")) {
      imports.push(import("@scripts/init/product-qty"));
   }

   if (document.querySelector("[data-option-name]")) {
      imports.push(import("@scripts/init/product-variants"));
   }

   if (document.querySelector("[data-collection-page]")) {
      imports.push(import("@scripts/init/collection-filter"));
   }

   if (document.querySelector("[data-typing]")) {
      imports.push(import("@scripts/animation/typing"));
   }

   if (document.querySelector("[data-split]")) {
      imports.push(import("@scripts/animation/split"));
   }

   await Promise.all(imports);
}

loadModules();
document.addEventListener("astro:page-load", loadModules);
