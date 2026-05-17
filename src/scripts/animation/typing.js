// typing.js
/*
 * ============================================================
 * TYPING.JS — ТУТОРІАЛ
 * ============================================================
 *
 * Підключення в компоненті:
 * --------------------------
 * import "../scripts/animations/typing.js";
 *
 *
 * ============================================================
 * БАЗОВЕ ВИКОРИСТАННЯ
 * ============================================================
 *
 * Просто додай атрибут data-typing до будь-якого текстового елемента.
 * Анімація запуститься одразу після того як прелоадер зникне.
 *
 * <h1 data-typing>Привіт світ</h1>
 *
 *
 * ============================================================
 * РЕЖИМИ АНІМАЦІЇ
 * ============================================================
 *
 * Є два режими — вказуються як значення атрибута data-typing:
 *
 * 1. "type" (дефолт) — літера з'являється за літерою як друкарська машинка
 *    <h1 data-typing>Привіт світ</h1>
 *    <h1 data-typing="type">Привіт світ</h1>
 *
 * 2. "fade" — літери плавно з'являються знизу вгору по черзі
 *    <h1 data-typing="fade">Привіт світ</h1>
 *
 *
 * ============================================================
 * КЕРУВАННЯ ЧЕРЕЗ СКРОЛ (data-watch)
 * ============================================================
 *
 * Комбінуй з data-watch або data-watch-once щоб анімація
 * запускалась коли елемент входить в зону видимості.
 *
 * ВАЖЛИВО: data-watch/data-watch-once керується через DataWatch.
 * DataWatch автоматично стартує після прелоадера.
 *
 * Один раз — анімація спрацьовує тільки при першому попаданні в viewport:
 * <h1 data-watch-once data-typing>Привіт світ</h1>
 *
 * Кожного разу — анімація повторюється щоразу як елемент
 * входить/виходить з viewport:
 * <h1 data-watch data-typing>Привіт світ</h1>
 *
 *
 * ============================================================
 * НАЛАШТУВАННЯ
 * ============================================================
 *
 * data-typing-speed="60"
 *   Швидкість між появою літер у мілісекундах.
 *   Менше = швидше. Дефолт: 60
 *   <h1 data-typing data-typing-speed="30">Швидко</h1>
 *   <h1 data-typing data-typing-speed="120">Повільно</h1>
 *
 * data-typing-delay="300"
 *   Затримка перед початком анімації у мілісекундах.
 *   Дефолт: 0
 *   <h1 data-typing data-typing-delay="500">З затримкою</h1>
 *
 * data-typing-cursor
 *   Додає мигаючий курсор | після тексту.
 *   Атрибут без значення — просто додай і він з'явиться.
 *   <h1 data-typing data-typing-cursor>З курсором|</h1>
 *
 *
 * ============================================================
 * КОМБІНАЦІЇ — ПРИКЛАДИ
 * ============================================================
 *
 * Заголовок після прелоадера з курсором:
 * <h1 data-typing data-typing-cursor>Привіт світ</h1>
 *
 * Плавна поява при скролі один раз:
 * <h2 data-watch-once data-typing="fade">Про нас</h2>
 *
 * Швидкий тайпінг при скролі кожного разу:
 * <p data-watch data-typing data-typing-speed="30">Повторюється</p>
 *
 * З затримкою щоб не перекривати іншу анімацію:
 * <h1 data-typing data-typing-delay="800" data-typing-cursor>Привіт</h1>
 *
 */

class Typing {
   constructor(element) {
      this.element = element;
      this.config = this.getConfig();
      this.chars = [];
      this.isBuilt = false;
      this.isPlaying = false;
      this.timeoutIds = []; // зберігаємо всі setTimeout щоб можна було скасувати

      this.build();
      this.initTrigger();
   }

   getConfig() {
      return {
         mode: this.element.dataset.typing || "type",
         speed: parseInt(this.element.dataset.typingSpeed) || 60,
         delay: parseInt(this.element.dataset.typingDelay) || 0,
         cursor: this.element.hasAttribute("data-typing-cursor"),
         isWatch:
            this.element.hasAttribute("data-watch") ||
            this.element.hasAttribute("data-watch-once"),
      };
   }

   build() {
      if (this.isBuilt) return;

      // Зберігаємо оригінальний текст
      const originalText = this.element.textContent.replace(/\s+/g, " ").trim();
      if (!originalText) return;

      this.element.dataset.typingOriginal = originalText;

      // Розбиваємо на слова, фільтруємо порожні
      const words = originalText.split(" ").filter(Boolean);

      this.element.innerHTML = "";
      this.chars = [];

      words.forEach((word, wordIndex) => {
         const wordSpan = document.createElement("span");
         wordSpan.style.cssText = "display:inline-block; white-space:nowrap;";

         Array.from(word).forEach((char) => {
            const charSpan = document.createElement("span");
            charSpan.style.cssText =
               "display:inline-block; opacity:0; will-change:opacity,transform;";
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
            this.chars.push(charSpan);
         });

         this.element.appendChild(wordSpan);

         // Пробіл між словами
         if (wordIndex < words.length - 1) {
            const space = document.createTextNode(" ");
            this.element.appendChild(space);
         }
      });

      if (this.config.cursor) {
         const cursor = document.createElement("span");
         cursor.style.cssText =
            "display:inline-block; animation:typingBlink 0.8s step-end infinite;";
         cursor.textContent = "|";
         this.element.appendChild(cursor);
      }

      this.isBuilt = true;
   }

   // Скасовуємо всі активні таймери
   clearTimeouts() {
      this.timeoutIds.forEach((id) => clearTimeout(id));
      this.timeoutIds = [];
   }

   reset() {
      this.clearTimeouts();
      this.isPlaying = false;
      this.chars.forEach((char) => {
         char.style.opacity = "0";
         char.style.filter = "";
         char.style.transform = "";
         char.style.transition = "";
      });
   }

   play() {
      if (this.isPlaying || !this.chars.length) return;
      this.isPlaying = true;

      const startId = setTimeout(() => {
         if (this.config.mode === "fade") {
            this.playFade();
         } else {
            this.playType();
         }
      }, this.config.delay);

      this.timeoutIds.push(startId);
   }

   playType() {
      this.chars.forEach((char, index) => {
         const id = setTimeout(() => {
            char.style.opacity = "1";
         }, index * this.config.speed);
         this.timeoutIds.push(id);
      });
   }

   playFade() {
      this.chars.forEach((char, index) => {
         const id = setTimeout(() => {
            char.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            char.style.transform = "translateY(0)";
            char.style.opacity = "1";
         }, index * this.config.speed);
         this.timeoutIds.push(id);
      });

      // Встановлюємо початковий стан для fade
      this.chars.forEach((char) => {
         char.style.transform = "translateY(8px)";
      });
   }

   initTrigger() {
      if (!this.isBuilt) return;

      if (this.config.isWatch) {
         this._watchObserver = new MutationObserver(() => {
            const isVisible = this.element.classList.contains("_watcher-view");
            if (isVisible) {
               this.reset();
               this.play();
            } else {
               this.reset();
            }
         });
         this._watchObserver.observe(this.element, {
            attributes: true,
            attributeFilter: ["class"],
         });
      } else {
         this.play();
      }
   }
}

const initializedElements = new WeakSet();

function initTyping() {
   document.querySelectorAll("[data-typing]").forEach((el) => {
      if (initializedElements.has(el)) return;
      initializedElements.add(el);
      new Typing(el);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTyping);
} else {
   initTyping();
}

document.addEventListener("page:ready", initTyping);

export default Typing;
