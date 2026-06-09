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

// Ініціалізація
function initMenuActiveLinks() {
   new MenuActiveLinks();
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initMenuActiveLinks);
} else {
   initMenuActiveLinks();
}

// Оновлюємо після переходів
document.addEventListener("page:ready", initMenuActiveLinks);

export default MenuActiveLinks;
