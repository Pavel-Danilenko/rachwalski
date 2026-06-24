// src/scripts/init/menu-active-links.js

class MenuActiveLinks {
   constructor() {
      this.containers = document.querySelectorAll("[data-menu], [data-active-links]");
      if (!this.containers.length) return;

      this.setActiveLinks();
   }

   setActiveLinks() {
      const currentPath = window.location.pathname;

      const links = [];
      this.containers.forEach((container) => {
         container.querySelectorAll("a[href]").forEach((link) => links.push(link));
      });

      links.forEach((link) => {
         const href = link.getAttribute("href");

         if (
            href.startsWith("#") ||
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            link.hasAttribute("data-nav-placeholder")
         ) {
            return;
         }

         if (this.isLinkActive(href, currentPath)) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
         } else {
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
         }
      });

      this.updateFirstChildState();
   }

   updateFirstChildState() {
      const list = document.querySelector(".nav-overlay__list");
      if (!list) return;

      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

      const matchesPath = (link) => {
         if (link.hasAttribute("data-nav-placeholder")) return false;
         return (link.getAttribute("href") || "").replace(/\/$/, "") === currentPath;
      };

      // Активне посилання в першому nav-sub (Dr. Rachwalski)
      const activeInFirstSub = [...list.querySelectorAll(".nav-sub:first-child a[href]")].some(matchesPath);

      // Активне посилання в будь-якому іншому nav-sub (Resources, etc.)
      const activeInOtherSub = [...list.querySelectorAll(".nav-sub:not(:first-child) a[href]")].some(matchesPath);

      // Standalone посилання (Fees)
      const activeStandalone = [...list.querySelectorAll(".nav-overlay__link")].some(matchesPath);

      // Прибираємо перший активний якщо активне щось не в першій вкладці
      list.classList.toggle("suppress-first-active", activeInOtherSub || (activeStandalone && !activeInFirstSub));
   }

   isLinkActive(href, currentPath) {
      // Нормалізуємо шляхи (прибираємо trailing slash)
      const normalizeHref = href.replace(/\/$/, "") || "/";
      const normalizePath = currentPath.replace(/\/$/, "") || "/";

      // Точна відповідність
      if (normalizeHref === normalizePath) {
         return true;
      }

      // Часткова відповідність (для вкладених сторінок)
      // Наприклад: /services активний на /services/web
      if (
         normalizePath.startsWith(normalizeHref + "/") &&
         normalizeHref !== "/"
      ) {
         return true;
      }

      return false;
   }
}

// ── Nav hover tracking ────────────────────────────────────────────────────────
// CSS :has(.nav-sub:hover) is unreliable after Barba.js DOM mutations.
// We track hover via JS classes instead:
//   .has-any-sub-hover   — any .nav-sub is currently hovered
//   .has-non-first-hover — any non-first .nav-overlay__item is hovered
function initNavHoverTracking() {
   const list = document.querySelector(".nav-overlay__list");
   if (!list || list.dataset.hoverTrackingInit) return;
   list.dataset.hoverTrackingInit = "true";

   const allSubs = list.querySelectorAll(".nav-sub");
   const nonFirstItems = list.querySelectorAll(".nav-overlay__item:not(:first-child)");

   let anySubHovered = 0;
   let nonFirstHovered = 0;

   allSubs.forEach((el) => {
      el.addEventListener("mouseenter", () => {
         anySubHovered++;
         list.classList.add("has-any-sub-hover");
      });
      el.addEventListener("mouseleave", () => {
         anySubHovered = Math.max(0, anySubHovered - 1);
         if (!anySubHovered) list.classList.remove("has-any-sub-hover");
      });
   });

   nonFirstItems.forEach((el) => {
      el.addEventListener("mouseenter", () => {
         nonFirstHovered++;
         list.classList.add("has-non-first-hover");
      });
      el.addEventListener("mouseleave", () => {
         nonFirstHovered = Math.max(0, nonFirstHovered - 1);
         if (!nonFirstHovered) list.classList.remove("has-non-first-hover");
      });
   });
}

// Ініціалізація
function initMenuActiveLinks() {
   new MenuActiveLinks();
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => {
      initMenuActiveLinks();
      initNavHoverTracking();
   });
} else {
   initMenuActiveLinks();
   initNavHoverTracking();
}

// Оновлюємо після переходів
document.addEventListener("page:ready", initMenuActiveLinks);

export default MenuActiveLinks;
