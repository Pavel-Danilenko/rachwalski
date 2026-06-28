/**
 * DataWatch - спостереження за елементами при скролі
 * Використовує Intersection Observer API
 *
 * Атрибути:
 * - data-watch - постійне спостереження (клас додається/прибирається)
 * - data-watch-once - одноразове спостереження (клас додається назавжди)
 * - data-watch-margin - відступ для trigger (наприклад: "0px", "100px", "-50px")
 * - data-watch-threshold - скільки % елемента має бути видно (0.0 - 1.0)
 * - data-watch-delay - затримка перед додаванням класу в мс
 * - data-watch-class - кастомний клас (за замовчуванням: "_watcher-view")
 * - data-watch-event - кастомна подія для dispatch
 * - data-watch-root - селектор контейнера для спостереження
 */

// data-watch.js

class DataWatch {
   constructor() {
      this.config = {
         defaultClass: "_watcher-view",
         defaultMargin: "0px",
         defaultThreshold: 0,
         defaultDelay: 0,
      };

      this.observers = new Map();
      this.timeouts = new WeakMap();
      this.pendingTimeouts = new Set(); // id відкладених enter — щоб скасувати в destroy

      this.init();
   }

   init() {
      const watchElements = document.querySelectorAll(
         "[data-watch], [data-watch-once]",
      );
      if (watchElements.length === 0) return;
      watchElements.forEach((element) => this.observeElement(element));
   }

   getElementConfig(element) {
      return {
         margin: element.dataset.watchMargin || this.config.defaultMargin,
         threshold:
            parseFloat(element.dataset.watchThreshold) ||
            this.config.defaultThreshold,
         delay:
            parseInt(element.dataset.watchDelay) || this.config.defaultDelay,
         customClass: element.dataset.watchClass || this.config.defaultClass,
         customEvent: element.dataset.watchEvent || null,
         root: element.dataset.watchRoot
            ? document.querySelector(element.dataset.watchRoot)
            : null,
         once: element.hasAttribute("data-watch-once"),
      };
   }

   getObserverKey(config) {
      return `${config.margin}-${config.threshold}-${config.root ? "custom" : "viewport"}`;
   }

   getObserver(config) {
      const key = this.getObserverKey(config);
      if (!this.observers.has(key)) {
         const observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
               root: config.root,
               rootMargin: config.margin,
               threshold: config.threshold,
            },
         );
         this.observers.set(key, observer);
      }
      return this.observers.get(key);
   }

   observeElement(element) {
      const config = this.getElementConfig(element);
      // skip once-elements that already animated (persist outside barba container)
      if (config.once && element.classList.contains(config.customClass)) return;
      element._watchConfig = config;
      const observer = this.getObserver(config);
      observer.observe(element);
   }

   handleIntersection(entries) {
      entries.forEach((entry) => {
         const element = entry.target;
         const config = element._watchConfig;
         if (entry.isIntersecting) {
            this.handleEnter(element, config);
         } else {
            this.handleLeave(element, config);
         }
      });
   }

   handleEnter(element, config) {
      const addClassAndDispatch = () => {
         element.classList.add(config.customClass);
         if (config.customEvent) {
            element.dispatchEvent(
               new CustomEvent(config.customEvent, {
                  detail: { element, action: "enter" },
               }),
            );
         }
         if (config.once) {
            const observer = this.observers.get(this.getObserverKey(config));
            if (observer) observer.unobserve(element);
         }
      };

      if (config.delay > 0) {
         const id = setTimeout(() => {
            this.pendingTimeouts.delete(id);
            addClassAndDispatch();
         }, config.delay);
         this.timeouts.set(element, id);
         this.pendingTimeouts.add(id);
      } else {
         addClassAndDispatch();
      }
   }

   handleLeave(element, config) {
      if (this.timeouts.has(element)) {
         const id = this.timeouts.get(element);
         clearTimeout(id);
         this.pendingTimeouts.delete(id);
         this.timeouts.delete(element);
      }
      if (config.once) return;
      element.classList.remove(config.customClass);
      if (config.customEvent) {
         element.dispatchEvent(
            new CustomEvent(config.customEvent, {
               detail: { element, action: "leave" },
            }),
         );
      }
   }

   reinit() {
      this.observers.forEach((observer) => observer.disconnect());
      this.observers.clear();
      this.init();
   }

   destroy() {
      this.observers.forEach((observer) => observer.disconnect());
      this.observers.clear();
      // Скасовуємо відкладені enter-таймери, щоб вони не додавали клас
      // вже на видалені (barba) елементи.
      this.pendingTimeouts.forEach((id) => clearTimeout(id));
      this.pendingTimeouts.clear();
      this.timeouts = new WeakMap();
   }
}

function startDataWatch() {
   if (window.dataWatch) window.dataWatch.destroy();
   window.dataWatch = new DataWatch();
}

// Чекаємо поки обидва класи є на <html>:
// preloader-loaded — прелоадер завершився
// page-loaded — перехід між сторінками завершився
let pendingMO = null; // один спільний очікувач — щоб не накопичувались при кількох page:ready

function waitAndStart() {
   const html = document.documentElement;
   const hasPreloader = () => document.querySelector("#preloader") !== null;

   const isReady = () => {
      if (hasPreloader()) {
         return (
            html.classList.contains("preloader-loaded") &&
            html.classList.contains("page-loaded")
         );
      } else {
         return html.classList.contains("page-loaded");
      }
   };

   // Прибираємо попередній очікувач (напр. кілька page:ready підряд) — без витоку.
   if (pendingMO) {
      pendingMO.disconnect();
      pendingMO = null;
   }

   if (isReady()) {
      startDataWatch();
      return;
   }

   pendingMO = new MutationObserver(() => {
      if (isReady()) {
         pendingMO.disconnect();
         pendingMO = null;
         startDataWatch();
      }
   });

   pendingMO.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", waitAndStart);
} else {
   waitAndStart();
}

// При переході між сторінками — page-loaded видалявся в app.js
// і додається знову після завершення переходу
// MutationObserver в waitAndStart побачить це і стартує
document.addEventListener("page:ready", waitAndStart);

export default DataWatch;
