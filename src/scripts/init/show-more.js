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
   return `<svg class="icon" aria-hidden="true"><use href="#icon-${iconName}"></use></svg>`;
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

      // Параметри
      this.perPage = parseInt(root.dataset.perPage ?? "6", 10);
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

      this.#init();
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

   // ─── Init ─────────────────────────────────────────────────────────────────

   #init() {
      this.items.forEach((item) => {
         item.style.display = "none";
         this.#clearStyles(item);
      });

      this.shown = 0;
      this.isOpen = false;

      this.#reveal(this.perPage, false);
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
      this.#reveal(this.perPage, true);
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
         this.#hideAfter(this.perPage);
         this.isOpen = false;
         this.#updateBtn();
         this.#updateInfo();
         this.#dispatch();
      }
   }

   // ─── Reveal / Hide ────────────────────────────────────────────────────────

   #reveal(count, animate) {
      const items = this.items;
      const from = this.shown;
      const to = Math.min(from + count, this.total);

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
   }

   #hideAfter(keepCount) {
      const items = this.items;

      for (let i = keepCount; i < items.length; i++) {
         const item = items[i];
         if (this.animation !== "none") {
            item.style.transition = `opacity ${this.duration * 0.4}ms ease`;
            item.style.opacity = "0";
            const el = item;
            setTimeout(() => {
               el.style.display = "none";
               this.#clearStyles(el);
            }, this.duration * 0.4);
         } else {
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
      const next = Math.min(remaining, this.perPage);
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
      // Зберігаємо класи перед зміною
      const savedClass = this.btn.className;
      this.btn.innerHTML = `${iconHtml}<span>${text}</span>`;
      // Відновлюємо класи якщо innerHTML їх зачепив (не чіпає, але для безпеки)
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

document.addEventListener("astro:before-swap", () => {
   document
      .querySelectorAll("[data-show-more-ready]")
      .forEach((el) => delete el.dataset.showMoreReady);
});

document.addEventListener("astro:page-load", initShowMore);

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initShowMore);
} else {
   initShowMore();
}

export { ShowMore, initShowMore };
export default ShowMore;
