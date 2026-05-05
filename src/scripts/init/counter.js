/**
 *
 * важливо це якщо пілючати не через компонент тоді просто додаємо ці атрибути для
 * роботи але тоді і js підлючаємо !!!
 *
 * Counter - анімація підрахунку чисел
 * Інтеграція з data-watch для запуску при скролі
 *
 * Атрибути:
 * Основні:
 * - data-counter-target - кінцеве число (обов'язковий)
 * - data-counter-start - початкове число (за замовчуванням 0)
 * - data-counter-duration - тривалість анімації в мс (за замовчуванням 2000)
 *
 * Форматування (пріоритет 1 - locale):
 * - data-counter-locale - локаль для форматування ("en-US", "uk-UA", "de-DE")
 * - data-counter-decimals - кількість десяткових знаків
 *
 * Форматування (пріоритет 2 - ручне):
 * - data-counter-thousands - розділювач тисяч (",", ".", " ", "")
 * - data-counter-decimal - розділювач десяткових ("." або ",")
 *
 * Додатки:
 * - data-counter-prefix - префікс перед числом ("$", "₴", "€")
 * - data-counter-suffix - суфікс після числа ("+", "%", "K")
 *
 * Поведінка:
 * - data-counter-easing - тип анімації ("linear", "ease-out", "ease-in-out")
 *
 * Використання з data-watch:
 * <div data-watch-once data-counter-target="1000" data-counter-suffix="+">0</div>
 *
 * Або без data-watch (immediate start):
 * <div data-counter-target="1000" data-counter-trigger="immediate">0</div>
 */

class Counter {
   constructor() {
      this.counters = [];
      this.config = {
         defaultStart: 0,
         defaultDuration: 2000,
         defaultEasing: "ease-out",
      };

      this.init();
   }

   /**
    * Ініціалізація - знаходимо всі counter елементи
    */
   init() {
      const counterElements = document.querySelectorAll(
         "[data-counter-target]",
      );

      if (counterElements.length === 0) return;

      counterElements.forEach((element) => {
         const config = this.getElementConfig(element);

         // Якщо є data-watch-once або data-watch - чекаємо на подію
         if (
            element.hasAttribute("data-watch-once") ||
            element.hasAttribute("data-watch")
         ) {
            this.initWithWatch(element, config);
         } else {
            // Інакше запускаємо відразу
            this.startCounter(element, config);
         }
      });
   }

   /**
    * Отримуємо налаштування з атрибутів
    */
   getElementConfig(element) {
      const target = parseFloat(element.dataset.counterTarget);
      const start =
         element.dataset.counterStart !== undefined
            ? parseFloat(element.dataset.counterStart)
            : this.config.defaultStart;

      // Визначаємо decimals з пріоритетами
      let decimals;
      if (element.dataset.counterDecimals !== undefined) {
         // Пріоритет 1: Явно вказано в атрібуті
         decimals = parseInt(element.dataset.counterDecimals);
      } else if (element.dataset.counterLocale) {
         // Пріоритет 2: Якщо є locale - він сам визначить
         decimals = null;
      } else {
         // Пріоритет 3: Автовизначення - якщо ціле число то 0, інакше рахуємо
         decimals = Number.isInteger(target) ? 0 : this.getDecimalCount(target);
      }

      return {
         target,
         start,
         duration:
            parseInt(element.dataset.counterDuration) ||
            this.config.defaultDuration,

         // Форматування
         locale: element.dataset.counterLocale || null,
         decimals: decimals,
         thousandsSeparator:
            element.dataset.counterThousands !== undefined
               ? element.dataset.counterThousands
               : null,
         decimalSeparator: element.dataset.counterDecimal || null,
         short:
            element.dataset.counterShort === "true" ||
            element.hasAttribute("data-counter-short"),

         // Додатки
         prefix: element.dataset.counterPrefix || "",
         suffix: element.dataset.counterSuffix || "",

         // Анімація
         easing: element.dataset.counterEasing || this.config.defaultEasing,
      };
   }

   /**
    * Ініціалізація з data-watch
    */
   initWithWatch(element, config) {
      // Слухаємо клас _watcher-view або кастомний клас
      const watchClass = element.dataset.watchClass || "_watcher-view";

      // Перевіряємо чи це data-watch-once
      const isOnce = element.hasAttribute("data-watch-once");

      // Використовуємо MutationObserver для відстеження додавання/видалення класу
      const observer = new MutationObserver((mutations) => {
         mutations.forEach((mutation) => {
            if (
               mutation.type === "attributes" &&
               mutation.attributeName === "class"
            ) {
               if (element.classList.contains(watchClass)) {
                  // Клас додано - запускаємо counter
                  this.startCounter(element, config);

                  // Якщо data-watch-once - відключаємо observer після запуску
                  if (isOnce) {
                     observer.disconnect();
                  }
               } else {
                  // Клас видалено - скидаємо counter (тільки для data-watch, не once)
                  if (!isOnce && element.dataset.counterActive === "true") {
                     this.resetCounter(element, config);
                  }
               }
            }
         });
      });

      observer.observe(element, {
         attributes: true,
         attributeFilter: ["class"],
      });

      // Перевіряємо чи клас вже є (якщо елемент вже у viewport)
      if (element.classList.contains(watchClass)) {
         this.startCounter(element, config);

         // Якщо data-watch-once - відключаємо observer
         if (isOnce) {
            observer.disconnect();
         }
      }
   }

   /**
    * Запуск анімації counter
    */
   startCounter(element, config) {
      // Перевіряємо чи вже запущено
      if (element.dataset.counterActive === "true") return;
      element.dataset.counterActive = "true";

      const startTime = performance.now();
      const { start, target, duration, easing } = config;
      const difference = target - start;

      const animate = (currentTime) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / duration, 1);

         // Застосовуємо easing
         const easedProgress = this.applyEasing(progress, easing);

         // Обчислюємо поточне значення
         const currentValue = start + difference * easedProgress;

         // Форматуємо і виводимо
         element.textContent = this.formatNumber(currentValue, config);

         // Продовжуємо анімацію якщо не закінчилась
         if (progress < 1) {
            requestAnimationFrame(animate);
         } else {
            // Фінальне значення (точне)
            element.textContent = this.formatNumber(target, config);

            // Dispatch події про завершення
            const event = new CustomEvent("counterComplete", {
               detail: { element, finalValue: target },
            });
            element.dispatchEvent(event);
         }
      };

      requestAnimationFrame(animate);
   }

   /**
    * Скидання counter до початкового значення
    */
   resetCounter(element, config) {
      // Знімаємо флаг активності
      element.dataset.counterActive = "false";

      // Повертаємо до start значення
      element.textContent = this.formatNumber(config.start, config);

      // Dispatch події про reset
      const event = new CustomEvent("counterReset", {
         detail: { element, startValue: config.start },
      });
      element.dispatchEvent(event);
   }

   /**
    * Застосування easing функції
    */
   applyEasing(progress, easingType) {
      switch (easingType) {
         case "linear":
            return progress;

         case "ease-in":
            return progress * progress;

         case "ease-out":
            return progress * (2 - progress);

         case "ease-in-out":
            return progress < 0.5
               ? 2 * progress * progress
               : -1 + (4 - 2 * progress) * progress;

         default:
            return progress * (2 - progress); // ease-out за замовчуванням
      }
   }

   /**
    * Форматування числа
    */
   formatNumber(value, config) {
      const {
         locale,
         decimals,
         thousandsSeparator,
         decimalSeparator,
         prefix,
         suffix,
         short,
      } = config;

      let formattedNumber;

      // Якщо short формат - використовуємо K, M, B
      if (short) {
         formattedNumber = this.formatShortNumber(value, decimals);
      }
      // Пріоритет 1: Використовуємо locale якщо вказаний
      else if (locale) {
         const options = {};

         if (decimals !== null) {
            options.minimumFractionDigits = decimals;
            options.maximumFractionDigits = decimals;
         }

         formattedNumber = new Intl.NumberFormat(locale, options).format(value);
      }
      // Пріоритет 2: Ручне форматування
      else {
         // Використовуємо decimals (вже визначений в getElementConfig)
         const decimalCount = decimals !== null ? decimals : 0;

         formattedNumber = value.toFixed(decimalCount);

         // Застосовуємо кастомні розділювачі якщо вказані
         if (thousandsSeparator !== null || decimalSeparator !== null) {
            formattedNumber = this.applyCustomSeparators(
               formattedNumber,
               thousandsSeparator,
               decimalSeparator,
            );
         }
      }

      // Додаємо prefix та suffix
      return `${prefix}${formattedNumber}${suffix}`;
   }

   /**
    * Форматування числа в короткий формат (K, M, B, T)
    */
   formatShortNumber(value, decimals = 1) {
      const absValue = Math.abs(value);
      const sign = value < 0 ? "-" : "";

      const units = [
         { value: 1e12, symbol: "T" }, // Trillion
         { value: 1e9, symbol: "B" }, // Billion
         { value: 1e6, symbol: "M" }, // Million
         { value: 1e3, symbol: "K" }, // Thousand
      ];

      for (const unit of units) {
         if (absValue >= unit.value) {
            const shortValue = value / unit.value;
            const decimalCount = decimals !== null ? decimals : 1;
            return `${sign}${shortValue.toFixed(decimalCount)}${unit.symbol}`;
         }
      }

      // Якщо менше 1000 - просто число
      const decimalCount = decimals !== null ? decimals : 0;
      return value.toFixed(decimalCount);
   }

   /**
    * Визначення кількості десяткових знаків у числі
    */
   getDecimalCount(value) {
      const valueStr = value.toString();
      if (valueStr.includes(".")) {
         return valueStr.split(".")[1].length;
      }
      return 0;
   }

   /**
    * Застосування кастомних розділювачів
    */
   applyCustomSeparators(numberStr, thousandsSep, decimalSep) {
      // Розділяємо на цілу і десяткову частини
      const parts = numberStr.split(".");
      let integerPart = parts[0];
      const decimalPart = parts[1];

      // Застосовуємо розділювач тисяч якщо вказаний
      if (thousandsSep !== null) {
         integerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            thousandsSep,
         );
      }

      // Застосовуємо розділювач десяткових якщо вказаний і є десяткова частина
      if (decimalPart !== undefined) {
         const separator = decimalSep !== null ? decimalSep : ".";
         return `${integerPart}${separator}${decimalPart}`;
      }

      return integerPart;
   }

   /**
    * Реініціалізація (для динамічно доданих елементів)
    */
   reinit() {
      this.init();
   }

   /**
    * Запуск конкретного counter вручну
    */
   start(element) {
      const config = this.getElementConfig(element);
      this.startCounter(element, config);
   }
}

// Автоматична ініціалізація при завантаженні DOM
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => {
      window.counter = new Counter();
   });
} else {
   window.counter = new Counter();
}

// Підтримка Astro View Transitions
document.addEventListener("astro:page-load", () => {
   window.counter = new Counter();
});

export default Counter;
