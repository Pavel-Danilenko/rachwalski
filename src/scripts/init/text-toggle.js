export function initTextToggle() {
   document.querySelectorAll("[data-text-toggle]").forEach((el) => {
      if (el.dataset.textToggleInit) return;

      const content = el.querySelector("[data-text-toggle-content]");
      const btn = el.querySelector("[data-text-toggle-btn]");
      const label = el.querySelector("[data-text-toggle-label]");
      if (!content || !btn) return;

      const lines = parseInt(el.dataset.lines) || 4;
      const duration = parseInt(el.dataset.duration) || 400;
      const hasAnimation = el.hasAttribute("data-animation");
      const hasScrollTo = el.hasAttribute("data-scroll-to");
      const labelMore = btn.dataset.labelMore || "Show more";
      const labelLess = btn.dataset.labelLess || "Show less";

      // Виміряти натуральну висоту БЕЗ clamp (overflow:hidden залишається)
      content.style.webkitLineClamp = "";
      content.style.overflow = "hidden";
      void content.offsetHeight;
      const naturalHeight = content.getBoundingClientRect().height;

      // Якщо висота 0 — layout ще не готовий, спробуємо пізніше
      if (naturalHeight === 0) return;

      // Виміряти висоту З clamp
      content.style.webkitLineClamp = lines;
      void content.offsetHeight;
      const clampedHeight = content.getBoundingClientRect().height;

      // Layout готовий — виставляємо guard
      el.dataset.textToggleInit = "true";

      // Якщо текст повністю вміщується — кнопка не потрібна
      if (naturalHeight <= clampedHeight + 2) {
         btn.hidden = true;
         btn.style.display = "none";
         content.style.webkitLineClamp = "";
         if (!hasAnimation) content.style.overflow = "";
         return;
      }

      btn.addEventListener("click", () => {
         const expanded = btn.getAttribute("aria-expanded") === "true";

         if (!expanded) {
            // ── Expand ────────────────────────────────────────────────────
            content.style.webkitLineClamp = "";

            if (hasAnimation) {
               const fullHeight = content.scrollHeight;
               content.style.overflow = "hidden";
               content.style.transition = "none";
               content.style.maxHeight = `${clampedHeight}px`;

               void content.offsetHeight; // force reflow

               content.style.transition = `max-height ${duration}ms ease`;
               content.style.maxHeight = `${fullHeight}px`;

               content.addEventListener("transitionend", () => {
                  content.style.maxHeight = "none";
                  content.style.overflow = "visible";
                  content.style.transition = "";
               }, { once: true });
            } else {
               content.style.overflow = "visible";
            }

            btn.setAttribute("aria-expanded", "true");
            btn.classList.add("is-expanded");
            el.classList.add("is-expanded");
            if (label) label.textContent = labelLess;

         } else {
            // ── Collapse ──────────────────────────────────────────────────
            if (hasAnimation) {
               const fullHeight = content.scrollHeight;
               content.style.overflow = "hidden";
               content.style.transition = "none";
               content.style.maxHeight = `${fullHeight}px`;

               void content.offsetHeight; // force reflow

               content.style.transition = `max-height ${duration}ms ease`;
               content.style.maxHeight = `${clampedHeight}px`;

               content.addEventListener("transitionend", () => {
                  content.style.webkitLineClamp = lines;
                  content.style.maxHeight = "";
                  content.style.transition = "";
               }, { once: true });
            } else {
               content.style.webkitLineClamp = lines;
               content.style.overflow = "";
            }

            btn.setAttribute("aria-expanded", "false");
            btn.classList.remove("is-expanded");
            el.classList.remove("is-expanded");
            if (label) label.textContent = labelMore;

            if (hasScrollTo) {
               setTimeout(() => {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
               }, duration + 50);
            }
         }
      });
   });
}

document.addEventListener("page:ready", initTextToggle);
requestAnimationFrame(() => requestAnimationFrame(initTextToggle));
