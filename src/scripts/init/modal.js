import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

const FOCUSABLE = [
   "a[href]", "button:not([disabled])", "input:not([disabled])",
   "select:not([disabled])", "textarea:not([disabled])",
   "[tabindex]:not([tabindex='-1'])",
].join(", ");

class Modal {
   constructor() {
      this.previousFocus = null;
      this.isOpen        = false;
      this.wasLocked     = false;

      this.onFocusTrap = this._focusTrap.bind(this);
      this._bindEvents();
   }

   _bindEvents() {
      document.addEventListener("click", (e) => {
         const openBtn = e.target.closest("[data-popup-open]");
         if (openBtn) {
            e.preventDefault();
            this.open(openBtn.getAttribute("data-popup-open"));
            return;
         }

         if (e.target.closest("[data-popup-close]")) {
            e.preventDefault();
            this.close();
            return;
         }

         // Закрити по backdrop
         const active = document.querySelector(".popup--open");
         if (active && !e.target.closest(".popup__content") &&
             active.dataset.backdropClose !== "false") {
            this.close();
         }
      });

      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && this.isOpen) this.close();
      });
   }

   _focusTrap(e) {
      if (e.key !== "Tab") return;

      const active    = document.querySelector(".popup--open");
      if (!active) return;

      const focusable = [...active.querySelectorAll(FOCUSABLE)];
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
         e.preventDefault();
         last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
         e.preventDefault();
         first.focus();
      }
   }

   open(id) {
      if (this.isOpen) return;

      const modal = document.querySelector(`[data-popup="${id}"]`);
      if (!modal) return;

      this.previousFocus = document.activeElement;
      this.wasLocked     = document.documentElement.classList.contains("lock");

      modal.classList.add("popup--open");
      modal.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("popup-show");

      if (!this.wasLocked) bodyLock();

      // Focus trap
      document.addEventListener("keydown", this.onFocusTrap);

      // Фокус на першу кнопку закриття або контент
      const firstFocus =
         modal.querySelector("[data-popup-close]") ??
         modal.querySelector(".popup__content");
      firstFocus?.focus();

      this.isOpen = true;
   }

   close() {
      if (!this.isOpen) return;

      const active = document.querySelector(".popup--open");
      if (!active) return;

      active.classList.remove("popup--open");
      active.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("popup-show");

      document.removeEventListener("keydown", this.onFocusTrap);

      const prevFocus    = this.previousFocus;
      const wasLocked    = this.wasLocked;
      this.previousFocus = null;
      this.isOpen        = false;
      this.wasLocked     = false;

      if (!wasLocked) bodyUnlock(300);

      // Повертаємо фокус через 50ms — поки overflow:hidden ще активний.
      // Безпечно бо overflow:hidden не змінює scroll позицію (на відміну від position:fixed).
      setTimeout(() => prevFocus?.focus(), 50);
   }
}

// Прив'язуємо події ОДИН раз — Modal.open/close завжди роблять свіжий querySelector
(function init() {
   if (window._modal) return;
   window._modal = new Modal();
})();

document.addEventListener("page:ready", () => {
   if (!window._modal) window._modal = new Modal();
});
