/**
 * ShowMore — клієнтська логіка
 *
 * Важливо: базові класи кнопки (classBtn) завжди зберігаються.
 * JS додає/прибирає тільки модифікатори (classBtnDone, classBtnClose).
 * innerHTML оновлює тільки контент кнопки, класи не чіпаємо.
 */

// ─── Анімації ─────────────────────────────────────────────────────────────────

const ANIMATIONS = {
   none: {
      in: (el) => {
         el.style.opacity = "";
         el.style.transform = "";
         el.style.filter = "";
      },
   },

   fade: {
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

   "slide-up": {
      in: (el, i, stagger, duration) => {
         el.style.transition = "none";
         el.style.opacity = "0";
         el.style.transform = "translateY(16px)";
         void el.offsetWidth;
         el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
         el.style.transitionDelay = `${i * stagger}ms`;
         el.style.opacity = "1";
         el.style.transform = "translateY(0)";
      },
   },

   scale: {
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

function renderIcon(iconName) {
   if (!iconName) return "";
   const symbol = document.getElementById(`icon-${iconName}`);
   const viewBox = symbol?.getAttribute("viewBox") ?? "";
   const vbAttr = viewBox ? ` viewBox="${viewBox}"` : "";
   return `<svg class="icon" aria-hidden="true" focusable="false" data-icon="${iconName}"${vbAttr}><use href="#icon-${iconName}"></use></svg>`;
}

// ─── Class ────────────────────────────────────────────────────────────────────

class ShowMore {
   /** @type {Map<Element, ShowMore>} */
   static #instances = new Map();

   /** @param {HTMLElement} root */
   static getInstance(root) {
      return ShowMore.#instances.get(root) ?? null;
   }

   /** @param {HTMLElement} root */
   constructor(root) {
      this.root = root;
      this.btn = root.querySelector(".show-more-btn");
      this.info = root.querySelector(".show-more-info");
      this.content = root.querySelector(".show-more-content");

      // Параметри
      this.perPage = parseInt(root.dataset.perPage ?? "6", 10);
      this.perPageSm = root.dataset.perPageSm ? parseInt(root.dataset.perPageSm, 10) : null;
      this.perPageMd = root.dataset.perPageMd ? parseInt(root.dataset.perPageMd, 10) : null;
      this.perPageLg = root.dataset.perPageLg ? parseInt(root.dataset.perPageLg, 10) : null;
      this.selector = root.dataset.itemSelector;
      this.mode = root.dataset.mode ?? "batch";

      this.doneVariant = root.dataset.doneVariant ?? "hide";
      this.toggleHide = root.dataset.toggleHide !== "false";

      this.animation = root.dataset.animation ?? "fade";
      this.duration = parseInt(root.dataset.animationDuration ?? "300", 10);
      this.stagger = parseInt(root.dataset.animationStagger ?? "40", 10);

      this.icon = root.dataset.icon ?? "";
      this.iconClose = root.dataset.iconClose ?? "";

      this.label = root.dataset.label ?? "Show more";
      this.labelDone = root.dataset.labelDone ?? "That's all";
      this.labelToggleOpen = root.dataset.labelToggleOpen ?? "Show all";
      this.labelToggleClose = root.dataset.labelToggleClose ?? "Hide";
      this.showCount = root.dataset.showCount === "true";

      this.scrollToNew = root.dataset.scrollToNew === "true";
      this.scrollOffset = parseInt(root.dataset.scrollOffset ?? "0", 10);

      // Класи
      // baseClasses — ті що були при рендері Astro, завжди зберігаємо
      // модифікатори додаємо/знімаємо окремо
      this.cls = {
         // Зчитуємо з data — вони є source of truth
         base: root.dataset.classBtn ?? "",
         done: root.dataset.classBtnDone ?? "",
         close: root.dataset.classBtnClose ?? "",
         info: root.dataset.classInfo ?? "",
      };

      // Стан
      this.shown = 0;
      this.isOpen = false;
      this._mqCleanup = null;

      // Set overflow:hidden once at init so it is never toggled during animations.
      // Toggling overflow triggers a style-recalc that makes -webkit-line-clamp
      // on kept items flash unclamped for one paint frame.
      if (this.content && this.animation !== "none") {
         this.content.style.overflow = "hidden";
      }

      this.#init();
      this.#initResponsive();
      ShowMore.#instances.set(root, this);
   }

   // ─── Getters ──────────────────────────────────────────────────────────────

   get items() {
      return [...this.root.querySelectorAll(this.selector)];
   }

   get total() {
      return this.items.length;
   }

   get isDone() {
      return this.shown >= this.total;
   }

   get anim() {
      return ANIMATIONS[this.animation] ?? ANIMATIONS.fade;
   }

   // ─── Responsive perPage ───────────────────────────────────────────────────

   #getActivePerPage() {
      if (this.perPageSm != null && window.matchMedia("(max-width: 480px)").matches) {
         return this.perPageSm;
      }
      if (this.perPageMd != null && window.matchMedia("(max-width: 767.98px)").matches) {
         return this.perPageMd;
      }
      if (this.perPageLg != null && window.matchMedia("(max-width: 991.98px)").matches) {
         return this.perPageLg;
      }
      return this.perPage;
   }

   #initResponsive() {
      if (this.perPageSm == null && this.perPageMd == null && this.perPageLg == null) return;

      const breakpoints = [
         this.perPageSm != null ? "(max-width: 480px)" : null,
         this.perPageMd != null ? "(max-width: 767.98px)" : null,
         this.perPageLg != null ? "(max-width: 991.98px)" : null,
      ].filter(Boolean);

      const mqs = breakpoints.map((bp) => window.matchMedia(bp));
      const handler = () => this.#reinit();
      mqs.forEach((mq) => mq.addEventListener("change", handler));
      this._mqCleanup = () => mqs.forEach((mq) => mq.removeEventListener("change", handler));
   }

   #reinit() {
      this.items.forEach((item) => {
         item.style.display = "none";
         this.#clearStyles(item);
      });
      this.shown = 0;
      this.isOpen = false;
      this.#reveal(this.#getActivePerPage(), false);
      this.#updateBtn();
      this.#updateInfo();
   }

   // ─── Init ─────────────────────────────────────────────────────────────────

   #init() {
      this.items.forEach((item) => {
         item.style.display = "none";
         this.#clearStyles(item);
      });

      this.shown = 0;
      this.isOpen = false;

      this.#reveal(this.#getActivePerPage(), false);
      this.#updateBtn();
      this.#updateInfo();

      this.btn?.addEventListener("click", () => this.#handleClick());
   }

   // ─── Handle click ─────────────────────────────────────────────────────────

   #handleClick() {
      if (this.mode === "batch") {
         this.#nextBatch();
      } else {
         this.#handleToggle();
      }
   }

   // ─── Batch ────────────────────────────────────────────────────────────────

   #nextBatch() {
      if (this.isDone) return;
      const from = this.shown;
      this.#reveal(this.#getActivePerPage(), true);
      this.#updateBtn();
      this.#updateInfo();
      this.#dispatch();
      if (this.scrollToNew) this.#scrollToItem(from);
   }

   // ─── Toggle ───────────────────────────────────────────────────────────────

   #handleToggle() {
      if (!this.isOpen) {
         const from = this.shown;
         this.#reveal(this.total - this.shown, true);
         this.isOpen = true;
         this.#updateBtn();
         this.#updateInfo();
         this.#dispatch();
         if (this.scrollToNew) this.#scrollToItem(from);
      } else {
         this.#hideAfter(this.#getActivePerPage());
         this.isOpen = false;
         this.#updateBtn();
         this.#updateInfo();
         this.#dispatch();
      }
   }

   // ─── Height animation helpers ─────────────────────────────────────────────

   #lockHeight() {
      if (!this.content) return;
      this.content.style.transition = "";
      this.content.style.height = this.content.offsetHeight + "px";
   }

   #animateHeightTo(targetH) {
      if (!this.content) return;
      requestAnimationFrame(() => {
         if (!this.content) return;
         this.content.style.transition = `height ${this.duration}ms ease`;
         this.content.style.height = targetH + "px";
         const cleanup = () => {
            if (!this.content) return;
            this.content.style.height = "";
            this.content.style.transition = "";
            // overflow stays hidden — set permanently at init, cleared only in destroy()
         };
         const t = setTimeout(cleanup, this.duration + 60);
         this.content.addEventListener(
            "transitionend",
            (e) => {
               if (e.target !== this.content) return;
               clearTimeout(t);
               cleanup();
            },
            { once: true },
         );
      });
   }

   // ─── Reveal / Hide ────────────────────────────────────────────────────────

   #reveal(count, animate) {
      const items = this.items;
      const from = this.shown;
      const to = Math.min(from + count, this.total);

      const useHeightAnim = animate && this.animation !== "none" && this.content;

      // Capture start height before items enter the DOM
      const startH = useHeightAnim ? this.content.offsetHeight : 0;

      for (let i = from; i < to; i++) {
         const item = items[i];
         item.style.display = "";
         if (animate && this.anim.in) {
            this.anim.in(item, i - from, this.stagger, this.duration);
         } else {
            this.#clearStyles(item);
         }
      }

      this.shown = to;

      if (useHeightAnim) {
         // Items are now in DOM at opacity 0 — measure their natural height,
         // then lock back to startH so the CSS transition has a proper from-value.
         this.content.style.transition = "";
         this.content.style.height = "auto";
         const endH = this.content.offsetHeight;
         this.content.style.height = startH + "px";
         // Force reflow so the browser registers startH before we animate
         void this.content.offsetHeight;
         this.#animateHeightTo(endH);
      }
   }

   #hideAfter(keepCount) {
      const items = this.items;

      if (this.animation !== "none" && this.content) {
         const toHide = items.slice(keepCount);
         const toKeep = items.slice(0, keepCount);

         // Derive target height from kept items' bounding rects — no display toggle.
         // Toggling display:none → "" forces a grid reflow on kept items and causes
         // -webkit-line-clamp text to flash unclamped for one paint frame.
         let endH;
         if (toKeep.length === 0) {
            endH = 0;
         } else {
            const contentTop = this.content.getBoundingClientRect().top;
            const lastKeptBottom = toKeep[toKeep.length - 1].getBoundingClientRect().bottom;
            endH = Math.round(lastKeptBottom - contentTop);
         }

         // Instantly zero-out hidden items without touching display
         toHide.forEach((el) => {
            el.style.opacity = "0";
            el.style.transition = "none";
         });

         // One rAF lets the browser commit opacity:0 before we lock the height.
         // Without this, the height/overflow change lands in the same paint as
         // opacity:0, and the style-recalc can flash -webkit-line-clamp on kept items.
         requestAnimationFrame(() => {
            this.#lockHeight();
            this.#animateHeightTo(endH);

            const fadeDur = this.duration * 0.5;
            toHide.forEach((item) => {
               const el = item;
               setTimeout(() => {
                  el.style.display = "none";
                  this.#clearStyles(el);
               }, fadeDur);
            });
         });
      } else {
         for (let i = keepCount; i < items.length; i++) {
            const item = items[i];
            item.style.display = "none";
            this.#clearStyles(item);
         }
      }

      this.shown = keepCount;
   }

   // ─── Update button ────────────────────────────────────────────────────────
   // Принцип:
   //   1. Завжди зберігаємо базові класи (show-more-btn + cls.base)
   //   2. Модифікатори (done, close) додаємо/знімаємо через classList
   //   3. Контент кнопки оновлюємо через #setBtnContent — не чіпаємо класи

   #updateBtn() {
      if (!this.btn) return;

      if (this.mode === "batch") {
         this.#updateBtnBatch();
      } else {
         this.#updateBtnToggle();
      }
   }

   #updateBtnBatch() {
      if (this.isDone) {
         if (this.doneVariant === "hide") {
            this.#hideBtn();
         } else {
            // disabled — додаємо classBtnDone
            this.btn.disabled = true;
            this.#addModifier(this.cls.done);
            this.#removeModifier(this.cls.close);
            this.#setBtnContent(renderIcon(this.icon), this.labelDone);
         }
         return;
      }

      // Активна кнопка
      this.#showBtn();
      this.btn.disabled = false;
      this.#removeModifier(this.cls.done);
      this.#removeModifier(this.cls.close);

      const remaining = this.total - this.shown;
      const next = Math.min(remaining, this.#getActivePerPage());
      const count = this.showCount ? ` ${next}` : "";
      this.#setBtnContent(renderIcon(this.icon), `${this.label}${count}`);
   }

   #updateBtnToggle() {
      if (this.isOpen) {
         if (this.toggleHide) {
            // Кнопка "сховати"
            this.#showBtn();
            this.btn.disabled = false;
            this.#removeModifier(this.cls.done);
            this.#addModifier(this.cls.close);
            this.#setBtnContent(
               renderIcon(this.iconClose || this.icon),
               this.labelToggleClose,
            );
         } else {
            // Все відкрито, toggleHide=false
            this.#removeModifier(this.cls.close);
            if (this.doneVariant === "hide") {
               this.#hideBtn();
            } else {
               this.btn.disabled = true;
               this.#addModifier(this.cls.done);
               this.#setBtnContent(renderIcon(this.icon), this.labelDone);
            }
         }
      } else {
         // Закрито — кнопка "відкрити"
         this.#showBtn();
         this.btn.disabled = false;
         this.#removeModifier(this.cls.done);
         this.#removeModifier(this.cls.close);

         const remaining = this.total - this.shown;
         const count = this.showCount ? ` ${remaining}` : "";
         this.#setBtnContent(
            renderIcon(this.icon),
            `${this.labelToggleOpen}${count}`,
         );
      }
   }

   // ─── Button helpers ───────────────────────────────────────────────────────

   /**
    * Оновлює тільки контент кнопки — класи не чіпаємо
    * @param {string} iconHtml
    * @param {string} text
    */
   #setBtnContent(iconHtml, text) {
      if (!this.btn) return;
      const savedClass = this.btn.className;
      const span = this.btn.querySelector("span");
      if (span) {
         // Іконка вже рендерена через <Icon> в Astro — оновлюємо тільки текст
         span.textContent = text;
      } else {
         // Fallback: кнопка без Astro-іконки
         this.btn.innerHTML = `${iconHtml}<span>${text}</span>`;
      }
      this.btn.className = savedClass;
   }

   /** Плавно ховає кнопку */
   #hideBtn() {
      if (!this.btn) return;
      this.btn.style.transition = `opacity ${this.duration * 0.5}ms ease, transform ${this.duration * 0.5}ms ease`;
      this.btn.style.opacity = "0";
      this.btn.style.transform = "translateY(6px)";
      setTimeout(() => {
         if (this.btn) {
            this.btn.style.display = "none";
            // Скидаємо інлайн стилі щоб при можливому показі знову все було чисто
            this.btn.style.opacity = "";
            this.btn.style.transform = "";
            this.btn.style.transition = "";
         }
      }, this.duration * 0.5);
   }

   /** Показує кнопку якщо була захована */
   #showBtn() {
      if (!this.btn) return;
      this.btn.style.display = "";
      this.btn.style.opacity = "";
      this.btn.style.transform = "";
      this.btn.style.transition = "";
   }

   /**
    * Додає модифікатор класу якщо він є і ще не доданий
    * @param {string} cls
    */
   #addModifier(cls) {
      if (!cls || !this.btn) return;
      cls.split(" ")
         .filter(Boolean)
         .forEach((c) => this.btn.classList.add(c));
   }

   /**
    * Знімає модифікатор класу
    * @param {string} cls
    */
   #removeModifier(cls) {
      if (!cls || !this.btn) return;
      cls.split(" ")
         .filter(Boolean)
         .forEach((c) => this.btn.classList.remove(c));
   }

   // ─── Update info ──────────────────────────────────────────────────────────

   #updateInfo() {
      if (!this.info) return;
      this.info.textContent = `${this.shown} / ${this.total}`;
   }

   // ─── Scroll ───────────────────────────────────────────────────────────────

   #scrollToItem(fromIndex) {
      const target = this.items[fromIndex];
      if (!target) return;
      const top =
         target.getBoundingClientRect().top +
         window.scrollY -
         this.scrollOffset;
      window.scrollTo({ top, behavior: "smooth" });
   }

   // ─── Helpers ──────────────────────────────────────────────────────────────

   #clearStyles(el) {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.filter = "";
      el.style.transition = "";
      el.style.transitionDelay = "";
   }

   #dispatch() {
      this.root.dispatchEvent(
         new CustomEvent("show-more:change", {
            bubbles: true,
            detail: {
               shown: this.shown,
               total: this.total,
               isDone: this.isDone,
               isOpen: this.isOpen,
               mode: this.mode,
            },
         }),
      );
   }

   // ─── Public API ───────────────────────────────────────────────────────────

   destroy() {
      this._mqCleanup?.();
      this._mqCleanup = null;
      if (this.content) {
         this.content.style.overflow = "";
         this.content.style.height = "";
         this.content.style.transition = "";
      }
      this.items.forEach((item) => {
         item.style.display = "";
         this.#clearStyles(item);
      });
      ShowMore.#instances.delete(this.root);
   }
}

// ─── Init / View Transitions ──────────────────────────────────────────────────

function initShowMore() {
   document
      .querySelectorAll("[data-show-more-root]:not([data-show-more-ready])")
      .forEach((root) => {
         ShowMore.getInstance(root)?.destroy();
         root.dataset.showMoreReady = "";
         new ShowMore(root);
      });
}

// Cleanup перед переходом — прибираємо прапорці щоб reinit спрацював
document.addEventListener("page:leave", () => {
   document
      .querySelectorAll("[data-show-more-ready]")
      .forEach((el) => delete el.dataset.showMoreReady);
});

document.addEventListener("page:ready", initShowMore);

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initShowMore);
} else {
   initShowMore();
}

export { ShowMore, initShowMore };
export default ShowMore;
