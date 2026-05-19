export function initTextToggle() {
   document.querySelectorAll("[data-text-toggle]").forEach((el) => {
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

      // Shared state — оновлюється при кожному check()
      let clampedHeight = 0;

      function check() {
         const isExpanded = btn.getAttribute("aria-expanded") === "true";

         // Виміряти натуральну висоту БЕЗ clamp
         content.style.webkitLineClamp = "";
         content.style.overflow = "hidden";
         void content.offsetHeight;
         const naturalHeight = content.getBoundingClientRect().height;

         if (naturalHeight === 0) return;

         // Виміряти висоту З clamp
         content.style.webkitLineClamp = lines;
         void content.offsetHeight;
         clampedHeight = content.getBoundingClientRect().height;

         if (naturalHeight <= clampedHeight + 2) {
            // Текст вміщується — кнопка не потрібна
            btn.hidden = true;
            btn.style.display = "none";
            // Якщо був expanded — скидаємо
            if (isExpanded) {
               btn.setAttribute("aria-expanded", "false");
               btn.classList.remove("is-expanded");
               el.classList.remove("is-expanded");
               if (label) label.textContent = labelMore;
            }
            content.style.webkitLineClamp = "";
            if (!hasAnimation) content.style.overflow = "";
         } else {
            // Текст не вміщується — кнопка потрібна
            btn.hidden = false;
            btn.style.display = "";
            // Якщо зараз collapsed — тримаємо clamp
            if (!isExpanded) {
               content.style.webkitLineClamp = lines;
            } else {
               // Якщо expanded — прибираємо clamp
               content.style.webkitLineClamp = "";
               if (!hasAnimation) content.style.overflow = "visible";
            }
         }
      }

      // Клік-хендлер і ResizeObserver встановлюємо лише раз
      if (!el.dataset.textToggleInit) {
         el.dataset.textToggleInit = "true";

         // Слідкуємо тільки за шириною — щоб не зациклитись на зміні висоти від check()
         let prevWidth = 0;
         const ro = new ResizeObserver((entries) => {
            const newWidth = entries[0]?.contentRect.width ?? 0;
            if (Math.abs(newWidth - prevWidth) < 1) return;
            prevWidth = newWidth;
            check();
         });
         ro.observe(el);

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

                  void content.offsetHeight;

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

                  void content.offsetHeight;

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

      }

      check();
   });
}

document.addEventListener("page:ready", initTextToggle);
requestAnimationFrame(() => requestAnimationFrame(initTextToggle));
