// split-text.js

/*
 * ============================================================
 * SPLIT-TEXT.JS — ТУТОРІАЛ
 * ============================================================
 *
 * Підключення в компоненті:
 * --------------------------
 * import "../scripts/animations/split-text.js";
 *
 *
 * ============================================================
 * БАЗОВЕ ВИКОРИСТАННЯ
 * ============================================================
 *
 * Додай атрибут data-split до текстового елемента.
 * Літери розлітаються хаотично з blur ефектом і злітаються
 * назад коли елемент входить в зону видимості.
 *
 * <h1 data-split>Привіт світ</h1>
 *
 * ВАЖЛИВО: Без data-watch елемент використовує власний
 * IntersectionObserver і спрацьовує незалежно від прелоадера.
 * Якщо потрібно щоб анімація чекала прелоадер —
 * використовуй data-watch або data-watch-once.
 *
 *
 * ============================================================
 * КЕРУВАННЯ ЧЕРЕЗ СКРОЛ (data-watch)
 * ============================================================
 *
 * Комбінуй з data-watch або data-watch-once.
 * DataWatch автоматично стартує після прелоадера —
 * тому анімація не запуститься поки сайт не завантажиться.
 *
 * Один раз — літери збираються і залишаються:
 * <h1 data-watch-once data-split>Привіт світ</h1>
 *
 * Кожного разу — літери розлітаються при виході з viewport
 * і збираються знову при вході:
 * <h1 data-watch data-split>Привіт світ</h1>
 *
 *
 * ============================================================
 * НАЛАШТУВАННЯ
 * ============================================================
 *
 * data-split-spread="200"
 *   Відстань на яку розлітаються літери в пікселях.
 *   Дефолт: 200 (літери розлітаються від 120px до 200px)
 *   <h1 data-split data-split-spread="100">Ніжно</h1>
 *   <h1 data-split data-split-spread="400">Агресивно</h1>
 *
 * data-split-duration="700"
 *   Тривалість анімації збору/розльоту в мілісекундах.
 *   Дефолт: 700
 *   <h1 data-split data-split-duration="400">Швидко</h1>
 *   <h1 data-split data-split-duration="1200">Повільно</h1>
 *
 * data-split-stagger="40"
 *   Затримка між анімацією кожної літери в мілісекундах.
 *   Більше = літери збираються більш "по черзі".
 *   Дефолт: 40
 *   <h1 data-split data-split-stagger="20">Майже одночасно</h1>
 *   <h1 data-split data-split-stagger="80">По черзі</h1>
 *
 * data-split-threshold="0.15"
 *   Який відсоток елемента має бути видимим щоб спрацювала анімація.
 *   Від 0 (будь-який піксель) до 1 (весь елемент).
 *   Працює тільки без data-watch (з власним IntersectionObserver).
 *   Дефолт: 0.15
 *   <h1 data-split data-split-threshold="0.5">Половина видима</h1>
 *
 *
 * ============================================================
 * КОМБІНАЦІЇ — ПРИКЛАДИ
 * ============================================================
 *
 * Ніжний розліт при скролі один раз:
 * <h2 data-watch-once data-split data-split-spread="150">Заголовок</h2>
 *
 * Агресивний розліт кожного разу:
 * <h2 data-watch data-split data-split-spread="500" data-split-duration="900">
 *   Заголовок
 * </h2>
 *
 * Повільна поява з великим stagger (красиво для коротких слів):
 * <h1 data-watch-once data-split data-split-stagger="100" data-split-duration="1000">
 *   Привіт
 * </h1>
 *
 * Без прелоадера — одразу через власний IntersectionObserver:
 * <h2 data-split data-split-threshold="0.3">Заголовок</h2>
 *
 */

class SplitText {
   constructor(element) {
      this.element = element;
      this.config = this.getConfig();
      this.chars = [];
      this.charData = [];
      this.observer = null;
      this.isVisible = false;

      this.build();
      this.initTrigger();
   }

   getConfig() {
      return {
         spread: parseInt(this.element.dataset.splitSpread) || 200,
         duration: parseInt(this.element.dataset.splitDuration) || 700,
         stagger: parseInt(this.element.dataset.splitStagger) || 40,
         threshold: parseFloat(this.element.dataset.splitThreshold) || 0.15,
         // Тригер визначається автоматично по наявності data-watch / data-watch-once
         isWatch:
            this.element.hasAttribute("data-watch") ||
            this.element.hasAttribute("data-watch-once"),
      };
   }

   random(min, max) {
      return Math.random() * (max - min) + min;
   }

   build() {
      if (this.element.dataset.splitBuilt) return;

      if (!this.element.dataset.splitOriginal) {
         this.element.dataset.splitOriginal = this.element.textContent.trim();
      }

      const text = this.element.dataset.splitOriginal;
      const words = text.split(" ");

      this.element.textContent = "";
      this.chars = [];
      this.charData = [];

      words.forEach((word, wordIndex) => {
         const wordSpan = document.createElement("span");
         wordSpan.classList.add("split-text__word");

         word.split("").forEach((char) => {
            const charSpan = document.createElement("span");
            charSpan.classList.add("split-text__char");
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
            this.chars.push(charSpan);

            const angle = this.random(0, Math.PI * 2);
            const distance = this.random(
               this.config.spread * 0.6,
               this.config.spread,
            );
            this.charData.push({
               x: Math.cos(angle) * distance,
               y: Math.sin(angle) * distance,
               rotation: this.random(-30, 30),
            });
         });

         this.element.appendChild(wordSpan);

         if (wordIndex < words.length - 1) {
            const space = document.createElement("span");
            space.classList.add("split-text__space");
            space.textContent = " ";
            this.element.appendChild(space);
         }
      });

      this.setScattered(false);
      this.element.dataset.splitBuilt = "true";
   }

   setScattered(animate) {
      this.chars.forEach((char, i) => {
         const d = this.charData[i];
         const dur = animate ? this.config.duration : 0;
         const delay = animate ? i * this.config.stagger : 0;

         char.style.transition = animate
            ? `transform ${dur}ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms,
           opacity ${dur}ms ease ${delay}ms,
           filter ${dur}ms ease ${delay}ms`
            : "none";

         char.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rotation}deg)`;
         char.style.opacity = "0";
         char.style.filter = "blur(8px)";
      });
   }

   setGathered(animate) {
      this.chars.forEach((char, i) => {
         const dur = animate ? this.config.duration : 0;
         const delay = animate
            ? (this.chars.length - 1 - i) * this.config.stagger
            : 0;

         char.style.transition = animate
            ? `transform ${dur}ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms,
           opacity ${dur}ms ease ${delay}ms,
           filter ${dur}ms ease ${delay}ms`
            : "none";

         char.style.transform = "translate(0, 0) rotate(0deg)";
         char.style.opacity = "1";
         char.style.filter = "blur(0px)";
      });
   }

   initTrigger() {
      if (this.config.isWatch) {
         this._watchObserver = new MutationObserver(() => {
            const isVisible = this.element.classList.contains("_watcher-view");
            if (isVisible && !this.isVisible) {
               this.isVisible = true;
               this.setGathered(true);
            } else if (!isVisible && this.isVisible) {
               this.isVisible = false;
               this.setScattered(true);
            }
         });
         this._watchObserver.observe(this.element, {
            attributes: true,
            attributeFilter: ["class"],
         });
      } else {
         // auto — через IntersectionObserver одразу
         this.observer = new IntersectionObserver(
            (entries) => {
               entries.forEach((entry) => {
                  const wasVisible = this.isVisible;
                  this.isVisible = entry.isIntersecting;

                  if (entry.isIntersecting && !wasVisible) {
                     this.setGathered(true);
                  } else if (!entry.isIntersecting && wasVisible) {
                     this.setScattered(true);
                  }
               });
            },
            { threshold: this.config.threshold },
         );
         this.observer.observe(this.element);
      }
   }

   destroy() {
      if (this.observer) {
         this.observer.disconnect();
         this.observer = null;
      }
   }
}

const initializedElements = new WeakSet();

function initSplitText() {
   document.querySelectorAll("[data-split]").forEach((el) => {
      if (initializedElements.has(el)) return;
      initializedElements.add(el);
      new SplitText(el);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initSplitText);
} else {
   initSplitText();
}

document.addEventListener("page:ready", initSplitText);

export default SplitText;
