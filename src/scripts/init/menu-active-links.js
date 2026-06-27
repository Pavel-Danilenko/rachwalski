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

// ── Nav panel controller (desktop mega-menu) ──────────────────────────────────
// Рівно ОДНА панель відкрита за раз — клас .is-open на потрібному .nav-sub.
// Раніше показ керувався CSS :hover + :has() + лічильником mouseenter/mouseleave.
// На Safari це давало накладання панелей, мерехтіння та фриз фону (backdrop-filter
// перемальовувався на кожному :has()-перерахунку). Тепер — детермінований стан у JS
// + hover-intent затримка, щоб швидке проведення мишею не мерехтіло.
// Дефолт hover-intent (мс). Реальне значення береться з data-hover-delay на
// [data-menu-overlay] у Header.astro — щоб коригувати без правок JS.
const DEFAULT_OPEN_DELAY = 150;
const REVERT_DELAY = 160; // мс — повернення до дефолтної панелі після відведення

// Час останнього натискання Tab — щоб відрізнити клавіатурний фокус від
// програмного. menu.js при відкритті авто-фокусує перший тригер (focus-trap);
// без цієї перевірки focusin хибно відкривав би першу вкладку «через секунду».
let lastTabKeyAt = 0;
document.addEventListener("keydown", (e) => {
   if (e.key === "Tab") lastTabKeyAt = Date.now();
});

class NavPanelController {
   constructor() {
      this.openTimer = null;
      this.revertTimer = null;
      this.defaultSub = null;
      this.openDelay = DEFAULT_OPEN_DELAY;
      this.mount();
   }

   mount() {
      const list = document.querySelector(".nav-overlay__list");
      if (!list) return;
      this.list = list;
      this.subs = [...list.querySelectorAll(".nav-sub")];
      if (!this.subs.length) return;

      // Затримка hover-intent із атрибута data-hover-delay (фолбек — дефолт).
      const overlay = document.querySelector("[data-menu-overlay]");
      const delay = parseInt(overlay?.dataset.hoverDelay ?? "", 10);
      this.openDelay = Number.isFinite(delay) ? delay : DEFAULT_OPEN_DELAY;

      // Дефолтна панель = категорія поточної сторінки, інакше перша вкладка.
      this.resetToDefault();

      // Слухачі вішаємо один раз — далі змінюється лише this.defaultSub.
      if (!list.dataset.navPanelsInit) {
         list.dataset.navPanelsInit = "true";
         this.bind();
         this.observeOpen();
      }
   }

   getDefaultSub() {
      const activeSub = this.subs.find((s) => s.querySelector("a.is-active"));
      if (activeSub) return activeSub;
      // Активне standalone-посилання (напр. Fees) → жодна панель не відкрита.
      if (this.list.querySelector(".nav-overlay__link.is-active")) return null;
      return this.subs[0] || null;
   }

   // Перераховуємо дефолт із актуального стану is-active й застосовуємо.
   resetToDefault() {
      clearTimeout(this.openTimer);
      clearTimeout(this.revertTimer);
      this.defaultSub = this.getDefaultSub();
      this.applyOpen(this.defaultSub);
   }

   // Щоразу при ВІДКРИТТІ меню перераховуємо активну категорію наново — щоб
   // дефолт не «застрягав» на першій вкладці через таймінг ініціалізації.
   observeOpen() {
      const overlay = document.querySelector("[data-menu-overlay]");
      if (!overlay) return;
      const obs = new MutationObserver(() => {
         if (overlay.getAttribute("data-menu-open") === "true") {
            this.resetToDefault();
         }
      });
      obs.observe(overlay, {
         attributes: true,
         attributeFilter: ["data-menu-open"],
      });
   }

   applyOpen(sub) {
      this.subs.forEach((s) => s.classList.toggle("is-open", s === sub));
   }

   bind() {
      this.subs.forEach((sub) => {
         sub.addEventListener("mouseenter", () => {
            clearTimeout(this.revertTimer);
            clearTimeout(this.openTimer);
            this.openTimer = setTimeout(() => this.applyOpen(sub), this.openDelay);
         });
         sub.addEventListener("mouseleave", () => {
            clearTimeout(this.openTimer);
            clearTimeout(this.revertTimer);
            this.revertTimer = setTimeout(
               () => this.applyOpen(this.defaultSub),
               REVERT_DELAY,
            );
         });
         // Клавіатура: фокус на тригері відкриває його панель — але ЛИШЕ якщо
         // фокус прийшов від Tab. Програмний авто-фокус (focus-trap у menu.js)
         // ігноруємо, інакше перша вкладка хибно відкривалась би після відкриття.
         sub.addEventListener("focusin", () => {
            if (Date.now() - lastTabKeyAt > 200) return;
            clearTimeout(this.openTimer);
            clearTimeout(this.revertTimer);
            this.applyOpen(sub);
         });
      });
   }
}

// Ініціалізація
function initMenuActiveLinks() {
   new MenuActiveLinks();
}

function initNavPanels() {
   if (window.navPanels) {
      window.navPanels.mount();
   } else {
      window.navPanels = new NavPanelController();
   }
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => {
      initMenuActiveLinks();
      initNavPanels();
   });
} else {
   initMenuActiveLinks();
   initNavPanels();
}

// Оновлюємо після переходів (active-links та дефолтна панель залежать від URL)
document.addEventListener("page:ready", () => {
   initMenuActiveLinks();
   initNavPanels();
});

export default MenuActiveLinks;
