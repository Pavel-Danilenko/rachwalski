/**
 * Pagination — фінальна версія
 *
 * Фічі:
 *   Анімація:     none | fade | slide (directional) | scale | blur
 *   Навігація:    default | pill | minimal | outline | ghost
 *   Іконки:       svg sprite через iconPrev/iconNext/iconFirst/iconLast
 *   i18n:         всі рядки через labelPrev/labelNext/labelPage/labelInfo...
 *   URL sync:     ?page=3 читається при init, оновлюється при зміні
 *   Keyboard:     ← → клавіші
 *   Swipe:        touch swipe на мобільному
 *   ScrollTo:     плавний скрол до контейнера
 *   Progress bar: тонка лінія прогресу
 *   Accessibility: aria-live announce при зміні сторінки
 */

// ─── Анімації ─────────────────────────────────────────────────────────────────

const ANIMATIONS = {
   none: {
      out: () => {},
      in: (el) => {
         el.style.opacity = "";
         el.style.transform = "";
         el.style.filter = "";
      },
   },

   fade: {
      out: (el, duration) => {
         el.style.transition = `opacity ${duration * 0.5}ms ease`;
         el.style.opacity = "0";
      },
      in: (el, i, stagger, duration) => {
         el.style.transition = "none";
         el.style.opacity = "0";
         el.style.transform = "";
         void el.offsetWidth;
         el.style.transition = `opacity ${duration}ms ease`;
         el.style.transitionDelay = `${i * stagger}ms`;
         el.style.opacity = "1";
      },
   },

   slide: {
      out: (el, duration, dir) => {
         const x = dir * -24;
         el.style.transition = `opacity ${duration * 0.45}ms ease, transform ${duration * 0.45}ms ease`;
         el.style.opacity = "0";
         el.style.transform = `translateX(${x}px)`;
      },
      in: (el, i, stagger, duration, dir) => {
         const x = dir * 28;
         el.style.transition = "none";
         el.style.opacity = "0";
         el.style.transform = `translateX(${x}px)`;
         void el.offsetWidth;
         el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
         el.style.transitionDelay = `${i * stagger}ms`;
         el.style.opacity = "1";
         el.style.transform = "translateX(0)";
      },
   },

   scale: {
      out: (el, duration) => {
         el.style.transition = `opacity ${duration * 0.45}ms ease, transform ${duration * 0.45}ms ease`;
         el.style.opacity = "0";
         el.style.transform = "scale(0.96)";
      },
      in: (el, i, stagger, duration) => {
         el.style.transition = "none";
         el.style.opacity = "0";
         el.style.transform = "scale(0.93)";
         void el.offsetWidth;
         el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
         el.style.transitionDelay = `${i * stagger}ms`;
         el.style.opacity = "1";
         el.style.transform = "scale(1)";
      },
   },

   blur: {
      out: (el, duration) => {
         el.style.transition = `opacity ${duration * 0.45}ms ease, filter ${duration * 0.45}ms ease`;
         el.style.opacity = "0";
         el.style.filter = "blur(6px)";
      },
      in: (el, i, stagger, duration) => {
         el.style.transition = "none";
         el.style.opacity = "0";
         el.style.filter = "blur(8px)";
         el.style.transform = "";
         void el.offsetWidth;
         el.style.transition = `opacity ${duration}ms ease, filter ${duration}ms ease`;
         el.style.transitionDelay = `${i * stagger}ms`;
         el.style.opacity = "1";
         el.style.filter = "blur(0px)";
      },
   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Рендерить іконку через svg sprite або fallback svg path
 * @param {string|undefined} iconName — назва іконки зі спрайту
 * @param {string} fallbackPath       — fallback SVG path якщо іконки нема
 */
function renderIcon(iconName, fallbackPath) {
   if (iconName) {
      return `<svg class="icon" aria-hidden="true"><use href="#icon-${iconName}"></use></svg>`;
   }
   return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="${fallbackPath}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/**
 * Підставляє змінні в рядок-шаблон
 * @param {string} template — рядок з {key}
 * @param {Record<string, string|number>} vars
 */
function formatLabel(template, vars) {
   return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

// ─── Class ────────────────────────────────────────────────────────────────────

class Pagination {
   /** @type {Map<Element, Pagination>} */
   static #instances = new Map();

   /** @param {HTMLElement} root */
   static getInstance(root) {
      return Pagination.#instances.get(root) ?? null;
   }

   /** @param {HTMLElement} root */
   constructor(root) {
      this.root = root;
      this.nav = root.querySelector(".pagination-nav");

      // ─── Параметри ──────────────────────────────────────────────────────────
      this.perPage = parseInt(root.dataset.perPage ?? "6", 10);
      this.selector = root.dataset.itemSelector;
      this.siblings = parseInt(root.dataset.siblings ?? "1", 10);

      // Анімація
      this.animation = root.dataset.animation ?? "fade";
      this.duration = parseInt(root.dataset.animationDuration ?? "300", 10);
      this.stagger = parseInt(root.dataset.animationStagger ?? "40", 10);
      this.animationDirectional = root.dataset.animationDirectional !== "false";

      // Навігація
      this.showInfo = root.dataset.showInfo !== "false";
      this.showArrows = root.dataset.showArrows !== "false";
      this.showFirstLast = root.dataset.showFirstLast === "true";
      this.showProgress = root.dataset.showProgress === "true";

      // Іконки
      this.icons = {
         prev: root.dataset.iconPrev ?? "",
         next: root.dataset.iconNext ?? "",
         first: root.dataset.iconFirst ?? "",
         last: root.dataset.iconLast ?? "",
      };

      // Рядки
      this.labels = {
         prev:  root.dataset.labelPrev  ?? "Попередня сторінка",
         next:  root.dataset.labelNext  ?? "Наступна сторінка",
         first: root.dataset.labelFirst ?? "Перша сторінка",
         last:  root.dataset.labelLast  ?? "Остання сторінка",
         page:  root.dataset.labelPage  ?? "Сторінка {page} з {pages}",
         info: root.dataset.labelInfo ?? "{current} / {pages}",
      };

      // Поведінка
      this.scrollToEnabled = root.dataset.scrollTo === "true";
      this.scrollOffset = parseInt(root.dataset.scrollOffset ?? "0", 10);
      this.keyboardEnabled = root.dataset.keyboard === "true";
      this.swipeEnabled = root.dataset.swipe === "true";
      this.urlSync = root.dataset.urlSync === "true";
      this.urlParam = root.dataset.urlParam ?? "page";

      // Кастомні класи
      this.cls = {
         btn: root.dataset.classBtn ?? "",
         btnActive: root.dataset.classBtnActive ?? "",
         btnArrow: root.dataset.classBtnArrow ?? "",
         ellipsis: root.dataset.classEllipsis ?? "",
         info: root.dataset.classInfo ?? "",
         progress: root.dataset.classProgress ?? "",
      };

      // Поточна сторінка — читаємо з URL якщо urlSync увімкнено
      this.current = this.urlSync ? this.#readPageFromUrl() : 1;

      this._changeTimer = null;

      this.#init();
      Pagination.#instances.set(root, this);

      // Зовнішній фільтр (пошук) сигналізує що треба перерахувати items
      this.root.addEventListener("pagination:filter", () => this.refresh());
   }

   // ─── Getters ──────────────────────────────────────────────────────────────

   get items() {
      return [...this.root.querySelectorAll(this.selector)]
         .filter((el) =>
            !el.hasAttribute("data-search-excluded") &&
            !el.hasAttribute("data-filter-excluded"),
         );
   }

   get total() {
      return this.items.length;
   }

   get pages() {
      return Math.max(1, Math.ceil(this.total / this.perPage));
   }

   get anim() {
      return ANIMATIONS[this.animation] ?? ANIMATIONS.fade;
   }

   // ─── Init ─────────────────────────────────────────────────────────────────

   #init() {
      // Clamp current на випадок якщо total змінився
      this.current = Math.max(1, Math.min(this.current, this.pages));

      this.items.forEach((item) => {
         item.style.display = "none";
         this.#clearStyles(item);
      });

      this.#showPage(this.current, false);
      this.#renderNav();
      this.#renderProgress();
      this.#renderAnnouncer();

      if (this.keyboardEnabled) this.#bindKeyboard();
      if (this.swipeEnabled) this.#bindSwipe();

      // Слухаємо popstate для urlSync (кнопки браузера ← →)
      if (this.urlSync) this.#bindPopState();
   }

   // ─── Public API ───────────────────────────────────────────────────────────

   /** Перераховує items (враховуючи фільтри) і рендерить з 1-ї сторінки */
   refresh() {
      // Ховаємо всі excluded елементи (search + filter)
      [...this.root.querySelectorAll(
         `${this.selector}[data-search-excluded], ${this.selector}[data-filter-excluded]`,
      )].forEach((el) => { el.style.display = "none"; });
      this.current = 1;
      this.#init();
   }

   /** @param {number} page */
   goTo(page) {
      page = Math.max(1, Math.min(page, this.pages));
      if (page === this.current) return;

      const prev = this.current;
      const dir = page > prev ? 1 : -1;
      this.current = page;

      this.#changePage(prev, page, dir);
      this.#renderNav();
      this.#renderProgress();
      this.#announce();
      this.#dispatch(page, prev);

      if (this.scrollToEnabled) this.#scrollTo();
      if (this.urlSync) this.#pushUrl(page);
   }

   destroy() {
      if (this.nav) this.nav.innerHTML = "";
      this.#removeProgress();
      this.#removeAnnouncer();
      this.items.forEach((item) => {
         item.style.display = "";
         this.#clearStyles(item);
      });
      if (this._keyboardHandler) {
         document.removeEventListener("keydown", this._keyboardHandler);
      }
      if (this._popStateHandler) {
         window.removeEventListener("popstate", this._popStateHandler);
      }
      Pagination.#instances.delete(this.root);
   }

   // ─── Core ─────────────────────────────────────────────────────────────────

   #changePage(fromPage, toPage, dir) {
      if (this._changeTimer) clearTimeout(this._changeTimer);

      const outItems = this.#getPageItems(fromPage);
      const inItems = this.#getPageItems(toPage);
      const animDir = this.animationDirectional ? dir : 1;

      if (this.animation === "none") {
         outItems.forEach((item) => {
            item.style.display = "none";
         });
         inItems.forEach((item, i) => {
            item.style.display = "";
            this.anim.in(item, i, this.stagger, this.duration, animDir);
         });
         return;
      }

      // Out
      outItems.forEach((item) => {
         this.anim.out(item, this.duration, animDir);
      });

      // Crossfade — in стартує на 40% out
      const overlap = Math.min(this.duration * 0.4, 120);
      this._changeTimer = setTimeout(() => {
         outItems.forEach((item) => {
            item.style.display = "none";
            this.#clearStyles(item);
         });
         inItems.forEach((item, i) => {
            item.style.display = "";
            this.anim.in(item, i, this.stagger, this.duration, animDir);
         });
      }, overlap);
   }

   #showPage(page, animate = true) {
      const items = this.#getPageItems(page);
      items.forEach((item, i) => {
         item.style.display = "";
         if (animate) {
            this.anim.in(item, i, this.stagger, this.duration, 1);
         } else {
            this.#clearStyles(item);
         }
      });
   }

   #getPageItems(page) {
      const start = (page - 1) * this.perPage;
      const end = start + this.perPage;
      return this.items.slice(start, end);
   }

   #clearStyles(el) {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
      el.style.transition = "";
      el.style.transitionDelay = "";
   }

   // ─── Nav render ───────────────────────────────────────────────────────────

   #renderNav() {
      if (!this.nav) return;

      if (this.pages <= 1) {
         this.nav.innerHTML = "";
         return;
      }

      const frag = document.createDocumentFragment();

      if (this.showFirstLast) frag.appendChild(this.#makeEdge("first"));
      if (this.showArrows) frag.appendChild(this.#makeArrow("prev"));

      const range = this.#buildRange();
      let prev = null;
      for (const pg of range) {
         if (prev !== null && pg - prev > 1)
            frag.appendChild(this.#makeEllipsis());
         frag.appendChild(this.#makePage(pg));
         prev = pg;
      }

      if (this.showArrows) frag.appendChild(this.#makeArrow("next"));
      if (this.showFirstLast) frag.appendChild(this.#makeEdge("last"));

      if (this.showInfo) {
         const info = document.createElement("span");
         info.className = this.#cx("pg__info", this.cls.info);
         info.textContent = formatLabel(this.labels.info, {
            current: this.current,
            pages: this.pages,
            total: this.total,
         });
         frag.appendChild(info);
      }

      this.nav.innerHTML = "";
      this.nav.appendChild(frag);

      requestAnimationFrame(() => {
         this.nav.querySelectorAll(".pg__btn").forEach((btn, i) => {
            btn.style.animationDelay = `${i * 20}ms`;
            btn.classList.add("pg__btn--in");
         });
      });
   }

   // ─── Range builder ────────────────────────────────────────────────────────

   #buildRange() {
      const { current: c, pages: p, siblings: s } = this;
      const set = new Set([1, p]);
      for (let i = Math.max(1, c - s); i <= Math.min(p, c + s); i++) set.add(i);
      return [...set].sort((a, b) => a - b);
   }

   // ─── Element builders ─────────────────────────────────────────────────────

   /** @param {'prev'|'next'} dir */
   #makeArrow(dir) {
      const isPrev = dir === "prev";
      const btn = document.createElement("button");
      const disabled = isPrev
         ? this.current === 1
         : this.current === this.pages;

      btn.type = "button";
      btn.className = this.#cx(
         "pg__btn",
         "pg__btn--arrow",
         this.cls.btn,
         this.cls.btnArrow,
      );
      btn.setAttribute(
         "aria-label",
         isPrev ? this.labels.prev : this.labels.next,
      );
      if (disabled) {
         btn.disabled = true;
         btn.setAttribute("aria-disabled", "true");
      }

      // Fallback SVG paths
      const prevPath = "M11 4.5L6.5 9L11 13.5";
      const nextPath = "M7 4.5L11.5 9L7 13.5";
      btn.innerHTML = renderIcon(
         isPrev ? this.icons.prev : this.icons.next,
         isPrev ? prevPath : nextPath,
      );

      btn.addEventListener("click", () =>
         this.goTo(isPrev ? this.current - 1 : this.current + 1),
      );
      return btn;
   }

   /** @param {'first'|'last'} edge */
   #makeEdge(edge) {
      const isFirst = edge === "first";
      const btn = document.createElement("button");
      const disabled = isFirst
         ? this.current === 1
         : this.current === this.pages;

      btn.type = "button";
      btn.className = this.#cx(
         "pg__btn",
         "pg__btn--edge",
         this.cls.btn,
         this.cls.btnArrow,
      );
      btn.setAttribute(
         "aria-label",
         isFirst ? this.labels.first : this.labels.last,
      );
      if (disabled) {
         btn.disabled = true;
         btn.setAttribute("aria-disabled", "true");
      }

      const firstPath = "M12 4.5L7.5 9L12 13.5 M6 4.5L6 13.5";
      const lastPath = "M6 4.5L10.5 9L6 13.5 M12 4.5L12 13.5";
      btn.innerHTML = renderIcon(
         isFirst ? this.icons.first : this.icons.last,
         isFirst ? firstPath : lastPath,
      );

      btn.addEventListener("click", () => this.goTo(isFirst ? 1 : this.pages));
      return btn;
   }

   /** @param {number} page */
   #makePage(page) {
      const isActive = page === this.current;
      const btn = document.createElement("button");

      btn.type = "button";
      btn.className = this.#cx(
         "pg__btn",
         "pg__btn--page",
         this.cls.btn,
         isActive && "pg__btn--active",
         isActive && this.cls.btnActive,
      );
      btn.textContent = String(page);
      btn.setAttribute(
         "aria-label",
         formatLabel(this.labels.page, {
            page,
            pages: this.pages,
         }),
      );

      if (isActive) {
         btn.setAttribute("aria-current", "page");
         btn.disabled = true;
      }

      btn.addEventListener("click", () => this.goTo(page));
      return btn;
   }

   #makeEllipsis() {
      const span = document.createElement("span");
      span.className = this.#cx("pg__ellipsis", this.cls.ellipsis);
      span.textContent = "…";
      span.setAttribute("aria-hidden", "true");
      return span;
   }

   // ─── Progress bar ─────────────────────────────────────────────────────────

   #renderProgress() {
      if (!this.showProgress) return;

      let bar = this.root.querySelector(".pg__progress");
      if (!bar) {
         bar = document.createElement("div");
         bar.className = this.#cx("pg__progress", this.cls.progress);
         const fill = document.createElement("div");
         fill.className = "pg__progress-fill";
         bar.appendChild(fill);
         this.nav?.after(bar);
      }

      const fill = bar.querySelector(".pg__progress-fill");
      if (fill) {
         fill.style.width = `${(this.current / this.pages) * 100}%`;
      }
   }

   #removeProgress() {
      this.root.querySelector(".pg__progress")?.remove();
   }

   // ─── Accessibility announcer ──────────────────────────────────────────────
   // Прихований live region — screen reader оголошує зміну сторінки

   #renderAnnouncer() {
      if (this.root.querySelector(".pg__announcer")) return;
      const el = document.createElement("span");
      el.className = "pg__announcer";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      this.root.appendChild(el);
   }

   #announce() {
      const el = this.root.querySelector(".pg__announcer");
      if (!el) return;
      // Очищаємо спочатку — щоб screen reader завжди читав нове повідомлення
      el.textContent = "";
      requestAnimationFrame(() => {
         el.textContent = formatLabel(this.labels.page, {
            page: this.current,
            pages: this.pages,
         });
      });
   }

   #removeAnnouncer() {
      this.root.querySelector(".pg__announcer")?.remove();
   }

   // ─── URL sync ─────────────────────────────────────────────────────────────

   #readPageFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get(this.urlParam) ?? "1", 10);
      return isNaN(page) || page < 1 ? 1 : page;
   }

   #pushUrl(page) {
      const url = new URL(window.location.href);
      if (page === 1) {
         url.searchParams.delete(this.urlParam);
      } else {
         url.searchParams.set(this.urlParam, String(page));
      }
      window.history.pushState({ paginationPage: page }, "", url.toString());
   }

   #bindPopState() {
      this._popStateHandler = (e) => {
         const page = e.state?.paginationPage ?? this.#readPageFromUrl();
         const prev = this.current;
         if (page === prev) return;
         const dir = page > prev ? 1 : -1;
         this.current = Math.max(1, Math.min(page, this.pages));
         this.#changePage(prev, this.current, dir);
         this.#renderNav();
         this.#renderProgress();
         this.#announce();
      };
      window.addEventListener("popstate", this._popStateHandler);
   }

   // ─── Keyboard ─────────────────────────────────────────────────────────────

   #bindKeyboard() {
      this._keyboardHandler = (e) => {
         const tag = document.activeElement?.tagName ?? "";
         if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
         if (e.key === "ArrowLeft") {
            e.preventDefault();
            this.goTo(this.current - 1);
         }
         if (e.key === "ArrowRight") {
            e.preventDefault();
            this.goTo(this.current + 1);
         }
      };
      document.addEventListener("keydown", this._keyboardHandler);
   }

   // ─── Swipe ────────────────────────────────────────────────────────────────

   #bindSwipe() {
      let startX = 0;
      let startY = 0;
      const content =
         this.root.querySelector(".pagination-content") ?? this.root;

      content.addEventListener(
         "touchstart",
         (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
         },
         { passive: true },
      );

      content.addEventListener(
         "touchend",
         (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dy) > Math.abs(dx)) return;
            if (Math.abs(dx) < 50) return;
            if (dx < 0) this.goTo(this.current + 1);
            if (dx > 0) this.goTo(this.current - 1);
         },
         { passive: true },
      );
   }

   // ─── ScrollTo ─────────────────────────────────────────────────────────────

   #scrollTo() {
      const top =
         this.root.getBoundingClientRect().top +
         window.scrollY -
         this.scrollOffset;
      window.scrollTo({ top, behavior: "smooth" });
   }

   // ─── Helpers ──────────────────────────────────────────────────────────────

   #cx(...classes) {
      return classes.filter(Boolean).join(" ");
   }

   #dispatch(page, prevPage) {
      this.root.dispatchEvent(
         new CustomEvent("pagination:change", {
            bubbles: true,
            detail: { page, prevPage, total: this.total, pages: this.pages },
         }),
      );
   }
}

// ─── Init / View Transitions ──────────────────────────────────────────────────

function initPagination() {
   document
      .querySelectorAll("[data-pagination-root]:not([data-pagination-ready])")
      .forEach((root) => {
         Pagination.getInstance(root)?.destroy();
         root.dataset.paginationReady = "";
         new Pagination(root);
      });
}

document.addEventListener("page:leave", () => {
   document
      .querySelectorAll("[data-pagination-ready]")
      .forEach((el) => delete el.dataset.paginationReady);
});

document.addEventListener("page:ready", initPagination);

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initPagination);
} else {
   initPagination();
}

export { Pagination, initPagination };
export default Pagination;
