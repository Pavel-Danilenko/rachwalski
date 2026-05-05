// // src/scripts/components/accordion.js

// // ← Головна перевірка: виконуємо тільки в браузері
// // src/scripts/components/accordion.js

// // src/scripts/components/accordion.js

// if (typeof window !== "undefined" && typeof document !== "undefined") {
//    // Головна функція ініціалізації одного акордеону
//    function initAccordion(accordionElement) {
//       if (!accordionElement || accordionElement._accordionInitialized) return;

//       const OPEN_CLASS = "--show";

//       const config = {
//          maxScreenWidth: accordionElement.dataset.maxW
//             ? parseFloat(accordionElement.dataset.maxW)
//             : false,
//          minScreenWidth: accordionElement.dataset.minW
//             ? parseFloat(accordionElement.dataset.minW)
//             : false,
//          collapseOthers: accordionElement.hasAttribute("data-single")
//             ? accordionElement.dataset.single !== "false"
//             : true,
//          transitionDuration: accordionElement.dataset.dur || "0.4s",
//          typeAnimation: accordionElement.dataset.ease || "ease",
//       };

//       const items = accordionElement.querySelectorAll("[data-acc-item]");
//       if (!items.length) return;

//       function setContentHeight(item, isOpen) {
//          const content = item.querySelector("[data-acc-content]");
//          if (!content) return;

//          if (isAccordionActive()) {
//             content.style.transition = `height ${config.transitionDuration} ${config.typeAnimation}`;
//             content.style.overflow = "hidden";
//             content.style.height = isOpen ? `${content.scrollHeight}px` : "0px";
//          } else {
//             content.style.height = "";
//             content.style.overflow = "";
//             content.style.transition = "";
//          }
//       }

//       function isAccordionActive() {
//          const w = window.innerWidth;
//          return (
//             (config.maxScreenWidth === false || w <= config.maxScreenWidth) &&
//             (config.minScreenWidth === false || w >= config.minScreenWidth)
//          );
//       }

//       function toggleItem(targetItem, force = null) {
//          if (!isAccordionActive()) return;

//          const isOpen = targetItem.classList.contains(OPEN_CLASS);
//          const shouldOpen = force !== null ? force : !isOpen;

//          if (config.collapseOthers && shouldOpen) {
//             items.forEach((other) => {
//                if (other !== targetItem) {
//                   other.classList.remove(OPEN_CLASS);
//                   setContentHeight(other, false);
//                }
//             });
//          }

//          targetItem.classList.toggle(OPEN_CLASS, shouldOpen);
//          setContentHeight(targetItem, shouldOpen);
//       }

//       function initialize() {
//          items.forEach((item) => {
//             const title = item.querySelector("[data-acc-title]");
//             const content = item.querySelector("[data-acc-content]");
//             if (!title || !content) return;

//             content.style.height = "0px";
//             content.style.overflow = "hidden";

//             if (item.hasAttribute("data-open") && isAccordionActive()) {
//                toggleItem(item, true);
//             }

//             const handler = (e) => {
//                e.preventDefault();
//                toggleItem(item);
//             };

//             if (title._accHandler) {
//                title.removeEventListener("click", title._accHandler);
//             }

//             title.addEventListener("click", handler);
//             title._accHandler = handler;
//             title.style.cursor = "pointer";
//          });

//          setupObservers();
//       }

//       function deinitialize() {
//          items.forEach((item) => {
//             item.classList.remove(OPEN_CLASS);
//             const content = item.querySelector("[data-acc-content]");
//             const title = item.querySelector("[data-acc-title]");
//             if (content) {
//                content.style.height = "";
//                content.style.overflow = "";
//                content.style.transition = "";
//             }
//             if (title && title._accHandler) {
//                title.removeEventListener("click", title._accHandler);
//                delete title._accHandler;
//                title.style.cursor = "";
//             }
//          });
//       }

//       function setupObservers() {
//          const resizeObs = new ResizeObserver((entries) => {
//             entries.forEach((entry) => {
//                const content = entry.target;
//                const item = content.closest("[data-acc-item]");
//                if (
//                   item &&
//                   item.classList.contains(OPEN_CLASS) &&
//                   isAccordionActive()
//                ) {
//                   content.style.height = `${content.scrollHeight}px`;
//                }
//             });
//          });

//          const mutationObs = new MutationObserver(() => {
//             items.forEach((item) => {
//                if (item.classList.contains(OPEN_CLASS) && isAccordionActive()) {
//                   const content = item.querySelector("[data-acc-content]");
//                   if (content)
//                      content.style.height = `${content.scrollHeight}px`;
//                }
//             });
//          });

//          items.forEach((item) => {
//             const content = item.querySelector("[data-acc-content]");
//             if (content) {
//                resizeObs.observe(content);
//                mutationObs.observe(content, {
//                   childList: true,
//                   subtree: true,
//                   characterData: true,
//                });
//             }
//          });
//       }

//       function handleResize() {
//          const hadOpenItems = [...items].some((i) =>
//             i.classList.contains(OPEN_CLASS),
//          );
//          const itemsWithDataOpen = [...items].filter((i) =>
//             i.hasAttribute("data-open"),
//          );

//          deinitialize();

//          if (isAccordionActive()) {
//             initialize();

//             if (hadOpenItems && itemsWithDataOpen.length > 0) {
//                itemsWithDataOpen.forEach((item) => toggleItem(item, true));
//             }
//          }
//       }

//       let timer;
//       window.addEventListener("resize", () => {
//          clearTimeout(timer);
//          timer = setTimeout(handleResize, 250);
//       });

//       handleResize();

//       // Помітка, що цей акордеон вже ініціалізований
//       accordionElement._accordionInitialized = true;
//    }

//    // Ініціалізуємо всі акордеони після повного DOM
//    const initAllAccordions = () => {
//       document.querySelectorAll("[data-acc]").forEach(initAccordion);
//    };

//    // Запускаємо після DOM ready
//    if (document.readyState === "loading") {
//       document.addEventListener("DOMContentLoaded", initAllAccordions);
//    } else {
//       initAllAccordions();
//    }

//    // Додатково: MutationObserver для динамічно доданих акордеонів (наприклад, через View Transitions або <slot />)
//    const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//          mutation.addedNodes.forEach((node) => {
//             if (node.nodeType === Node.ELEMENT_NODE) {
//                if (node.matches("[data-acc]")) {
//                   initAccordion(node);
//                }
//                node.querySelectorAll("[data-acc]").forEach(initAccordion);
//             }
//          });
//       });
//    });

//    observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//    });
// }

// new version

// ========================================
// accordion.js
// ========================================
//   Скрипт для accordion, який працює через data-атрибути

export function initAccordion() {
   const accordions = document.querySelectorAll("[data-accordion]");

   // Якщо немає accordion - виходимо
   if (accordions.length === 0) return;

   accordions.forEach((accordion) => {
      // Перевіряємо чи вже ініціалізовано цей accordion
      if (accordion.dataset.accordionInitialized === "true") return;

      // Позначаємо як ініціалізований
      accordion.dataset.accordionInitialized = "true";

      const multiple =
         accordion.getAttribute("data-accordion-multiple") === "true";
      const defaultOpen = accordion.getAttribute("data-accordion-default");
      const minWidth = accordion.getAttribute("data-accordion-min");
      const maxWidth = accordion.getAttribute("data-accordion-max");
      const duration = parseInt(
         accordion.getAttribute("data-accordion-duration") || "400",
      );

      const items = accordion.querySelectorAll("[data-accordion-item]");

      // Функція перевірки breakpoints
      function checkBreakpoints() {
         const width = window.innerWidth;
         let isActive = true;

         if (minWidth && width < parseInt(minWidth)) {
            isActive = false;
         }
         if (maxWidth && width > parseInt(maxWidth)) {
            isActive = false;
         }

         accordion.setAttribute("data-accordion-active", isActive.toString());

         if (!isActive) {
            items.forEach((item) => {
               const content = item.querySelector("[data-accordion-content]");
               if (content) {
                  content.style.height = "auto";
               }
            });
         } else {
            items.forEach((item) => {
               const content = item.querySelector("[data-accordion-content]");
               const trigger = item.querySelector("[data-accordion-trigger]");
               if (content && trigger) {
                  const isExpanded =
                     trigger.getAttribute("aria-expanded") === "true";
                  content.style.height = isExpanded
                     ? content.scrollHeight + "px"
                     : "0px";
               }
            });
         }

         return isActive;
      }

      // Функція оновлення висоти контенту
      function updateContentHeight(content, isExpanded) {
         if (isExpanded) {
            content.style.height = content.scrollHeight + "px";
         } else {
            content.style.height = "0px";
         }
      }

      // Функція закриття пункту
      function closeItem(item) {
         const trigger = item.querySelector("[data-accordion-trigger]");
         const content = item.querySelector("[data-accordion-content]");

         if (trigger && content) {
            trigger.setAttribute("aria-expanded", "false");
            updateContentHeight(content, false);
         }
      }

      // Функція відкриття пункту
      function openItem(item) {
         const trigger = item.querySelector("[data-accordion-trigger]");
         const content = item.querySelector("[data-accordion-content]");

         if (trigger && content) {
            trigger.setAttribute("aria-expanded", "true");
            updateContentHeight(content, true);
         }
      }

      // Ініціалізація початкового стану
      items.forEach((item, index) => {
         const trigger = item.querySelector("[data-accordion-trigger]");
         const content = item.querySelector("[data-accordion-content]");

         if (!trigger || !content) return;

         // Встановлюємо тривалість анімації
         content.style.transition = `height ${duration}ms ease`;

         // Перевіряємо чи цей пункт має бути відкритий за замовчуванням
         let isDefaultOpen = false;
         if (defaultOpen) {
            const openIndexes = defaultOpen
               .split(",")
               .map((i) => parseInt(i.trim()));
            isDefaultOpen = openIndexes.includes(index);
         }

         // Додаємо ARIA атрибути
         const itemId = `accordion-item-${Math.random().toString(36).substr(2, 9)}`;
         trigger.setAttribute("aria-expanded", isDefaultOpen.toString());
         trigger.setAttribute("aria-controls", itemId);
         content.setAttribute("id", itemId);

         // Встановлюємо початкову висоту
         content.style.height = isDefaultOpen
            ? content.scrollHeight + "px"
            : "0px";

         // Обробник кліку
         trigger.addEventListener("click", (e) => {
            e.preventDefault();

            // Перевіряємо чи accordion активний - якщо ні, не обробляємо клік
            const isActive =
               accordion.getAttribute("data-accordion-active") === "true";
            if (!isActive) return;

            const isExpanded = trigger.getAttribute("aria-expanded") === "true";

            if (!multiple && !isExpanded) {
               // Закриваємо всі інші пункти
               items.forEach((otherItem) => {
                  if (otherItem !== item) {
                     closeItem(otherItem);
                  }
               });
            }

            // Перемикаємо поточний пункт
            if (isExpanded) {
               closeItem(item);
            } else {
               openItem(item);
            }
         });
      });

      // Обробка resize з оптимізацією
      let resizeTimeout;
      const resizeObserver = new ResizeObserver(() => {
         clearTimeout(resizeTimeout);
         resizeTimeout = setTimeout(() => {
            const wasActive =
               accordion.getAttribute("data-accordion-active") === "true";
            const isActive = checkBreakpoints();

            // Якщо accordion активний - перераховуємо висоту відкритих пунктів
            if (isActive) {
               items.forEach((item) => {
                  const trigger = item.querySelector(
                     "[data-accordion-trigger]",
                  );
                  const content = item.querySelector(
                     "[data-accordion-content]",
                  );

                  if (
                     trigger &&
                     content &&
                     trigger.getAttribute("aria-expanded") === "true"
                  ) {
                     // Тимчасово ставимо auto щоб отримати реальну висоту
                     content.style.height = "auto";
                     const height = content.scrollHeight;
                     // Повертаємо анімовану висоту
                     content.style.height = height + "px";
                  }
               });
            }

            // Якщо стан змінився з активного на неактивний або навпаки
            if (wasActive !== isActive) {
               items.forEach((item) => {
                  const content = item.querySelector(
                     "[data-accordion-content]",
                  );
                  if (content && !isActive) {
                     // Коли деактивується - показуємо весь контент
                     content.style.height = "auto";
                  }
               });
            }
         }, 100);
      });

      // Спостерігаємо за зміною розміру accordion контейнера
      resizeObserver.observe(accordion);

      // Початкова перевірка breakpoints
      checkBreakpoints();
   });
}

// Автоматична ініціалізація
if (typeof document !== "undefined") {
   document.addEventListener("DOMContentLoaded", initAccordion);
   // Для Astro view transitions
   document.addEventListener("astro:page-load", initAccordion);
}
