// src/scripts/modal.js
// Клас для попапів з класом popup-show на <html>

import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

class Modal {
   constructor() {
      this.modals = document.querySelectorAll("[data-popup]");
      if (this.modals.length === 0) return;

      this.previousFocus = null;
      this.isOpen = false; // 🔥 Статус відкритого попапа
      this.bodyLock = false; // 🔥 Чи був body locked до відкриття попапа

      this.bindEvents();
   }

   bindEvents() {
      document.addEventListener("click", (e) => {
         // Відкриття
         const openBtn = e.target.closest("[data-popup-open]");
         if (openBtn) {
            e.preventDefault();
            const id = openBtn.getAttribute("data-popup-open");
            this.open(id);
            return;
         }

         // Закриття
         const closeBtn = e.target.closest("[data-popup-close]");
         const clickedOutside = !e.target.closest(".popup__content");
         const activeModal = document.querySelector(".popup--open");
         if (closeBtn || (clickedOutside && activeModal)) {
            e.preventDefault();
            this.close();
         }
      });

      // ESC
      document.addEventListener("keydown", (e) => {
         if (e.code === "Escape" && this.isOpen) {
            this.close();
         }
      });
   }

   open(id) {
      // 🔥 ВАЖЛИВО: Якщо попап вже відкритий - ігноруємо
      if (this.isOpen) return;

      const modal = document.querySelector(`[data-popup="${id}"]`);
      if (!modal) return;

      // 🔥 Перевіряємо чи був body locked до відкриття
      this.bodyLock = document.documentElement.classList.contains("lock");

      this.previousFocus = document.activeElement;

      modal.classList.add("popup--open");
      modal.setAttribute("aria-hidden", "false");

      // Клас на <html>
      document.documentElement.classList.add("popup-show");

      // 🔥 Блокуємо скрол тільки якщо він не був заблокований раніше
      if (!this.bodyLock) {
         bodyLock();
      }

      // Фокус на кнопку закриття
      const closeBtn =
         modal.querySelector("[data-popup-close]") ||
         modal.querySelector(".popup__content");
      if (closeBtn) {
         closeBtn.focus();
      }

      // 🔥 Встановлюємо статус
      this.isOpen = true;
   }

   close() {
      // 🔥 ВАЖЛИВО: Якщо попап не відкритий - ігноруємо
      if (!this.isOpen) return;

      const activeModal = document.querySelector(".popup--open");
      if (!activeModal) return;

      // Повертаємо фокус
      if (
         this.previousFocus &&
         typeof this.previousFocus.focus === "function"
      ) {
         this.previousFocus.focus();
      }

      activeModal.classList.remove("popup--open");
      activeModal.setAttribute("aria-hidden", "true");

      // Прибираємо клас з <html>
      document.documentElement.classList.remove("popup-show");

      // 🔥 Розблокуємо скрол тільки якщо ми його блокували
      if (!this.bodyLock) {
         bodyUnlock();
      }

      this.previousFocus = null;

      // 🔥 Скидаємо статус
      this.isOpen = false;
      this.bodyLock = false;
   }
}

// Автоініціалізація
new Modal();
