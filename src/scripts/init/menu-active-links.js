// src/scripts/init/menu-active-links.js

class MenuActiveLinks {
   constructor() {
      this.menu = document.querySelector("[data-menu]");
      if (!this.menu) return;

      console.log("MenuActiveLinks initialized");
      this.setActiveLinks();
   }

   setActiveLinks() {
      const currentPath = window.location.pathname;

      // Знаходимо всі посилання в меню
      const links = this.menu.querySelectorAll("a[href]");

      links.forEach((link) => {
         const href = link.getAttribute("href");

         // Пропускаємо якщо це anchor (#) або зовнішнє посилання
         if (
            href.startsWith("#") ||
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
         ) {
            return;
         }

         // Порівнюємо шлях
         if (this.isLinkActive(href, currentPath)) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");

            console.log("Active link:", href);
         } else {
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
         }
      });
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
document.addEventListener("astro:page-load", initMenuActiveLinks);

export default MenuActiveLinks;
