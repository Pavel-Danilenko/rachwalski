// slide-nav.js — рухомий індикатор навігації
// Патерн: як tabs.js — тільки page:ready, cleanup через barba cleanupPage.

function buildSlideNav(container) {
   const indicator = container.querySelector("[data-slide-indicator]");
   if (!indicator) return;

   const items = [...container.children].filter(
      (el) => !el.hasAttribute("data-slide-indicator"),
   );
   if (!items.length) return;

   const isHorizontal = container.dataset.slideNav === "horizontal";

   function move(activeItem) {
      if (isHorizontal) {
         indicator.style.left  = activeItem.offsetLeft + "px";
         indicator.style.width = activeItem.offsetWidth + "px";
      } else {
         indicator.style.top    = activeItem.offsetTop + "px";
         indicator.style.height = activeItem.offsetHeight + "px";
      }
   }

   function checkActive() {
      const active = items.find((el) => el.classList.contains("is-active"));
      if (active) move(active);
   }

   const mo = new MutationObserver(checkActive);
   items.forEach((item) =>
      mo.observe(item, { attributes: true, attributeFilter: ["class"] }),
   );

   // Початкова позиція якщо вже є is-active
   checkActive();
}

function initSlideNavs() {
   document.querySelectorAll("[data-slide-nav]").forEach((container) => {
      console.log("[slide-nav] found container:", container.className, "init?", !!container.dataset.slideNavInit);
      if (container.dataset.slideNavInit) return;
      container.dataset.slideNavInit = "true";
      buildSlideNav(container);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initSlideNavs);
} else {
   initSlideNavs();
}

document.addEventListener("page:ready", initSlideNavs);
