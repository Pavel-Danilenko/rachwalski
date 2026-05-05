/**
 * ============================================
 * 📋 CONTACT FORM - ТУТОРІАЛ
 * ============================================
 *
 * Цей модуль обробляє відправку форм з валідацією та відображенням результату.
 * Підтримує два режими відображення: inline (всередині форми) та modal (спливаюче вікно).
 *
 * ============================================
 * 📦 БАЗОВІ АТРИБУТИ ФОРМИ
 * ============================================
 *
 * data-success-message="Текст успіху"
 *    - Повідомлення, яке показується після успішної відправки
 *    - ОБОВ'ЯЗКОВИЙ атрибут для ініціалізації форми
 *
 * data-error-message="Текст помилки"
 *    - Повідомлення при помилці відправки
 *    - Опціонально (є дефолтне значення)
 *
 * data-backend="php" або "api"
 *    - Тип бекенду для відправки
 *    - За замовчуванням: "php"
 *
 * ============================================
 * 🎨 РЕЖИМИ ВІДОБРАЖЕННЯ РЕЗУЛЬТАТУ
 * ============================================
 *
 * data-modal-type="inline" або "modal"
 *    - inline: повідомлення всередині форми (за замовчуванням)
 *    - modal: спливаюче вікно на весь екран
 *
 * ПРИКЛАД INLINE:
 * <form
 *    id="contact-form"
 *    data-success-message="Дякуємо!"
 *    data-modal-type="inline"
 * >
 *    <!-- поля форми -->
 *    <!-- Повідомлення з'явиться тут ↓ -->
 *    <div class="form-message"></div>
 * </form>
 *
 * ПРИКЛАД MODAL:
 * <form
 *    id="contact-form"
 *    data-success-message="Дякуємо!"
 *    data-modal-type="modal"
 * >
 *    <!-- поля форми -->
 * </form>
 * <!-- Модальне вікно буде окремо -->
 *
 * ============================================
 * ⏱️ НАЛАШТУВАННЯ MODAL ВІКНА
 * ============================================
 *
 * data-auto-close-duration="5"
 *    - Секунди автозакриття modal вікна
 *    - 0 = не закривати автоматично
 *    - За замовчуванням: 5 секунд
 *
 * ============================================
 * 🎨 ІКОНКИ ТА ЗОБРАЖЕННЯ В MODAL
 * ============================================
 *
 * data-success-icon="check-circle"
 *    - ID іконки зі sprite для успіху
 *    - Використовується якщо немає data-success-image
 *
 * data-error-icon="x-circle"
 *    - ID іконки зі sprite для помилки
 *    - Використовується якщо немає data-error-image
 *
 * data-success-image="/images/success.png"
 *    - URL картинки для успіху
 *    - Має пріоритет над іконкою
 *
 * data-error-image="/images/error.png"
 *    - URL картинки для помилки
 *    - Має пріоритет над іконкою
 *
 * ============================================
 * 🔒 БЛОКУВАННЯ СКРОЛУ (ОПЦІОНАЛЬНО)
 * ============================================
 *
 * data-lock-scroll="true"
 *    - Блокує скрол сторінки при відкритті modal
 *    - Додає padding справа (компенсація скролбару)
 *    - Додає класи "lock" та "form-modal-show" на <html>
 *    - За замовчуванням: false (вимкнено)
 *
 * ВАЖЛИВО:
 * Для роботи блокування скролу потрібен модуль block-scroll.js
 * і елементи з атрибутом [data-lock] для компенсації padding
 *
 * ============================================
 * 📧 EMAIL НАЛАШТУВАННЯ (для PHP backend)
 * ============================================
 *
 * Приховані поля (додаються автоматично через компонент):
 * - recipient_email: email отримувача
 * - recipient_name: ім'я отримувача
 * - sender_name: ім'я відправника
 *
 * ============================================
 * 💡 ПРИКЛАДИ ВИКОРИСТАННЯ
 * ============================================
 *
 * 1️⃣ ПРОСТА ФОРМА (inline повідомлення):
 *
 * <form
 *    id="simple-form"
 *    action="/api/send-email.php"
 *    data-success-message="Дякуємо за звернення!"
 *    data-error-message="Помилка відправки"
 * >
 *    <!-- поля -->
 *    <div class="form-message"></div>
 * </form>
 *
 *
 * 2️⃣ ФОРМА З MODAL ВІКНОМ:
 *
 * <form
 *    id="modal-form"
 *    action="/api/send-email.php"
 *    data-success-message="Ваше повідомлення надіслано!"
 *    data-error-message="Сталася помилка"
 *    data-modal-type="modal"
 *    data-auto-close-duration="10"
 *    data-success-icon="check"
 *    data-error-icon="alert"
 * >
 *    <!-- поля -->
 *
 *
 * </form>
 *
 *
 * 3️⃣ ФОРМА З БЛОКУВАННЯМ СКРОЛУ:
 *
 * <form
 *    id="locked-form"
 *    action="/api/send-email.php"
 *    data-success-message="Успіх!"
 *    data-modal-type="modal"
 *    data-lock-scroll="true"
 *    data-auto-close-duration="0"
 *    data-success-image="/images/success.svg"
 * >
 *    <!-- поля -->
 * </form>
 *
 *  обов'язково вказуємо пошту куди надходять листи
 * recipientEmail="mymail@gmail.com"
 *
 * 4️⃣ ФОРМА З КАСТОМНИМИ ЗОБРАЖЕННЯМИ:
 *
 * <form
 *    id="custom-form"
 *    action="/api/contact"
 *    recipientEmail="mymail@gmail.com"
 *    data-backend="api"
 *    data-success-message="Відправлено!"
 *    data-error-message="Помилка!"
 *    data-modal-type="modal"
 *    data-success-image="/images/party.gif"
 *    data-error-image="/images/sad.png"
 *    data-auto-close-duration="3"
 * >
 *    <!-- поля -->
 * </form>
 * ============================================
 */

// @scripts/init/contact-form.js

import { FormValidator } from "@scripts/init/form-validation";
import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

function initForms() {
   const forms = document.querySelectorAll("form[data-success-message]");

   forms.forEach((form) => {
      if (!form.dataset.validatorInitialized) {
         form.setAttribute("novalidate", "");

         const validator = new FormValidator(form);
         form.dataset.validatorInitialized = "true";

         form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const inputs = form.querySelectorAll("input, textarea, select");
            let isValid = true;

            inputs.forEach((input) => {
               if (!validator.validateField(input, true)) {
                  isValid = false;
               }
            });

            if (!isValid) {
               return;
            }

            await handleFormSubmit(form);
         });
      }
   });

   // 🔥 НОВЕ: Ініціалізація модальних вікон
   initModals();
}

/**
 * 📤 Відправка форми
 */
async function handleFormSubmit(form) {
   const submitBtn = form.querySelector('button[type="submit"]');
   const successMessage = form.dataset.successMessage;
   const errorMessage = form.dataset.errorMessage;
   const action = form.getAttribute("action");
   const modalType = form.dataset.modalType || "inline";

   // Зберігаємо оригінальний текст кнопки
   let originalBtnText = "";
   if (submitBtn) {
      const span = submitBtn.querySelector("span");
      originalBtnText = span ? span.textContent : submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.classList.add("loading");

      if (span) {
         span.textContent = "Sending...";
      }
   }

   // 🔥 ОНОВЛЕНО: Очищаємо повідомлення залежно від типу
   if (modalType === "inline") {
      const messageBlock = form.querySelector(".form-message");
      if (messageBlock) {
         messageBlock.textContent = "";
         messageBlock.className = "form-message";
      }
   }

   try {
      const formData = new FormData(form);

      const response = await fetch(action, {
         method: "POST",
         body: formData,
      });

      let result;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
         result = await response.json();
      } else {
         const text = await response.text();
         try {
            result = JSON.parse(text);
         } catch {
            throw new Error("Invalid server response");
         }
      }

      if (response.ok && result.success) {
         // ✅ УСПІХ
         showFormMessage(
            form,
            "success",
            successMessage || result.message || "Success!",
         );

         // Очищаємо форму
         form.reset();

         // Очищаємо всі класи error/success
         form.querySelectorAll(".form-group").forEach((group) => {
            group.classList.remove("error", "success");
         });

         // Очищаємо error messages
         form.querySelectorAll(".error-message").forEach((msg) => {
            msg.textContent = "";
         });

         // Ховаємо clear buttons
         form
            .querySelectorAll(".datepicker-clear, .select-clear")
            .forEach((btn) => {
               btn.style.display = "none";
            });
      } else {
         // ❌ ПОМИЛКА
         throw new Error(result.message || result.error || errorMessage);
      }
   } catch (error) {
      console.error("Form submission error:", error);
      showFormMessage(
         form,
         "error",
         error.message ||
            errorMessage ||
            "Something went wrong. Please try again.",
      );
   } finally {
      // Повертаємо кнопку
      if (submitBtn) {
         submitBtn.disabled = false;
         submitBtn.classList.remove("loading");

         const span = submitBtn.querySelector("span");
         if (span) {
            span.textContent = originalBtnText;
         } else {
            submitBtn.textContent = originalBtnText;
         }
      }
   }
}

/**
 * 🎨 Показати повідомлення (inline або modal)
 */
function showFormMessage(form, type, message) {
   const modalType = form.dataset.modalType || "inline";
   const formId = form.getAttribute("id");

   if (modalType === "inline") {
      // ✅ Старий спосіб - inline message
      const messageBlock = form.querySelector(".form-message");
      if (messageBlock) {
         messageBlock.textContent = message;
         messageBlock.className = `form-message ${type}`;

         // Скрол до повідомлення
         messageBlock.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
         });
      }
   } else {
      // 🔥 НОВИЙ - modal вікно
      showModal(form, type, message);
   }
}

/**
 * 🎨 Показати модальне вікно
 */
function showModal(form, type, message) {
   const formId = form.getAttribute("id");
   const modal = document.querySelector(
      `.form-modal[data-form-id="${formId}"]`,
   );

   if (!modal) {
      console.warn("Modal not found for form:", formId);
      return;
   }

   const iconContainer = modal.querySelector(".form-modal__icon");
   const messageContainer = modal.querySelector(".form-modal__message");
   const autoCloseDuration = parseInt(form.dataset.autoCloseDuration || "5");

   // 🔥 НОВИНКА: Перевіряємо чи треба блокувати скрол
   const lockScroll = form.dataset.lockScroll === "true";

   // Очищаємо попередній вміст
   iconContainer.innerHTML = "";
   messageContainer.textContent = message;

   // Додаємо клас типу
   modal.classList.remove("success", "error");
   modal.classList.add(type);

   // 🎨 Іконка або картинка
   const iconId =
      type === "success" ? form.dataset.successIcon : form.dataset.errorIcon;

   const imageSrc =
      type === "success" ? form.dataset.successImage : form.dataset.errorImage;

   if (imageSrc) {
      // Якщо є картинка - використовуємо її
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = type;
      img.className = "form-modal__image";
      iconContainer.appendChild(img);
   } else if (iconId && iconId !== "undefined") {
      // Якщо є іконка зі sprite
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("form-modal__svg-icon");

      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttributeNS(
         "http://www.w3.org/1999/xlink",
         "xlink:href",
         `#icon-${iconId}`,
      );

      svg.appendChild(use);
      iconContainer.appendChild(svg);
   } else {
      // Fallback - default іконки
      iconContainer.innerHTML =
         type === "success"
            ? '<svg class="form-modal__default-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg class="form-modal__default-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
   }

   // 🔥 НОВИНКА: Опціональне блокування скролу
   if (lockScroll) {
      // Додаємо клас на <html>
      document.documentElement.classList.add("form-modal-show");

      // bodyLock() вже сам додає клас "lock" і padding!
      bodyLock();
   }

   // Показуємо modal
   modal.style.display = "flex";

   // Анімація появи
   requestAnimationFrame(() => {
      modal.classList.add("visible");
   });

   // 🔥 Автозакриття (якщо autoCloseDuration > 0)
   if (autoCloseDuration > 0) {
      setTimeout(() => {
         closeModal(modal, lockScroll);
      }, autoCloseDuration * 1000);
   }
}

/**
 * ❌ Закрити модальне вікно
 */
function closeModal(modal, lockScroll = false) {
   modal.classList.remove("visible");

   // 🔥 НОВИНКА: Розблокування скролу
   if (lockScroll) {
      // Прибираємо наш клас
      document.documentElement.classList.remove("form-modal-show");

      // bodyUnlock() вже сам прибирає клас "lock" і padding!
      bodyUnlock();
   }

   setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("success", "error");
   }, 300);
}

/**
 * 🔘 Ініціалізація кнопок закриття модалів
 */
function initModals() {
   const modals = document.querySelectorAll(".form-modal");

   modals.forEach((modal) => {
      const closeBtn = modal.querySelector(".form-modal__close");
      const backdrop = modal.querySelector(".form-modal__backdrop");

      // 🔥 НОВИНКА: Знаходимо форму для перевірки lockScroll
      const formId = modal.dataset.formId;
      const form = formId ? document.getElementById(formId) : null;
      const lockScroll = form ? form.dataset.lockScroll === "true" : false;

      if (closeBtn) {
         closeBtn.addEventListener("click", () =>
            closeModal(modal, lockScroll),
         );
      }

      if (backdrop) {
         backdrop.addEventListener("click", () =>
            closeModal(modal, lockScroll),
         );
      }

      // ESC для закриття
      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && modal.classList.contains("visible")) {
            closeModal(modal, lockScroll);
         }
      });
   });
}

// ================================================
// Ініціалізація
// ================================================
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initForms);
} else {
   initForms();
}

document.addEventListener("astro:page-load", initForms);
document.addEventListener("astro:after-swap", initForms);
