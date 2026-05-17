export function initAccordion() {
   const accordions = document.querySelectorAll("[data-accordion]");
   if (!accordions.length) return;

   accordions.forEach((accordion) => {
      if (accordion.dataset.accordionInitialized === "true") return;
      accordion.dataset.accordionInitialized = "true";

      const multiple  = accordion.getAttribute("data-accordion-multiple") === "true";
      const defaultOpen = accordion.getAttribute("data-accordion-default");
      const minWidth  = accordion.getAttribute("data-accordion-min");
      const maxWidth  = accordion.getAttribute("data-accordion-max");
      const duration  = accordion.getAttribute("data-accordion-duration") || "400";

      // Тривалість анімації через CSS-змінну — не треба чіпати кожен content окремо
      accordion.style.setProperty("--accordion-duration", duration + "ms");

      // Беремо тільки "свої" items — не залазимо в вкладені акордеони
      const items = [...accordion.querySelectorAll("[data-accordion-item]")].filter(
         (item) => item.closest("[data-accordion]") === accordion,
      );

      function checkBreakpoints() {
         const w = window.innerWidth;
         let active = true;
         if (minWidth && w < parseInt(minWidth)) active = false;
         if (maxWidth && w > parseInt(maxWidth)) active = false;
         accordion.setAttribute("data-accordion-active", String(active));
         return active;
      }

      function closeItem(item) {
         item.querySelector("[data-accordion-trigger]")
            ?.setAttribute("aria-expanded", "false");
      }

      function openItem(item) {
         item.querySelector("[data-accordion-trigger]")
            ?.setAttribute("aria-expanded", "true");
      }

      items.forEach((item, index) => {
         const trigger = item.querySelector("[data-accordion-trigger]");
         if (!trigger) return;

         // Початковий стан
         let isOpen = false;
         if (defaultOpen) {
            const indexes = defaultOpen.split(",").map((i) => parseInt(i.trim()));
            isOpen = indexes.includes(index);
         }
         trigger.setAttribute("aria-expanded", String(isOpen));

         trigger.addEventListener("click", (e) => {
            e.preventDefault();
            if (accordion.getAttribute("data-accordion-active") === "false") return;

            const expanded = trigger.getAttribute("aria-expanded") === "true";

            if (!multiple && !expanded) {
               items.forEach((other) => { if (other !== item) closeItem(other); });
            }

            expanded ? closeItem(item) : openItem(item);
         });
      });

      // ResizeObserver тільки для breakpoints — висоту більше не рахуємо
      let t;
      new ResizeObserver(() => {
         clearTimeout(t);
         t = setTimeout(checkBreakpoints, 100);
      }).observe(accordion);

      checkBreakpoints();
   });
}

if (typeof document !== "undefined") {
   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAccordion);
   } else {
      initAccordion();
   }
   document.addEventListener("page:ready", initAccordion);
}
