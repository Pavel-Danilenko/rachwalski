export function initFilterTabs() {
   document.querySelectorAll("[data-filter-tabs]").forEach((el) => {
      if (el.dataset.filterTabsInit) return;
      el.dataset.filterTabsInit = "true";

      const nav = el.querySelector(".filter-tabs__nav");
      const btns = el.querySelectorAll("[data-filter-tab]");
      const indicator = el.querySelector(".filter-tabs__indicator");
      const defaultTab = el.dataset.defaultTab;

      let activeBtn =
         el.querySelector(`[data-filter-tab="${defaultTab}"]`) || btns[0];

      function updateIndicator(btn, animate = true) {
         if (!indicator || !nav) return;
         const btnRect = btn.getBoundingClientRect();
         const navRect = nav.getBoundingClientRect();
         const left = btnRect.left - navRect.left;

         indicator.style.transition = animate
            ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none";
         indicator.style.transform = `translateX(${left}px)`;
         indicator.style.width = `${btnRect.width}px`;
      }

      function setActive(btn) {
         btns.forEach((b) => {
            b.classList.remove("is-active");
            b.setAttribute("aria-pressed", "false");
         });
         btn.classList.add("is-active");
         btn.setAttribute("aria-pressed", "true");
         updateIndicator(btn);
         activeBtn = btn;

         el.dispatchEvent(
            new CustomEvent("filter:change", {
               bubbles: true,
               detail: { tab: btn.dataset.filterTab },
            }),
         );
      }

      // Ставимо індикатор без анімації при ініціалізації
      requestAnimationFrame(() => updateIndicator(activeBtn, false));

      btns.forEach((btn) => {
         btn.addEventListener("click", () => {
            if (btn === activeBtn) return;
            setActive(btn);
         });
      });

      // Оновлюємо позицію при ресайзі
      let resizeTimer;
      window.addEventListener("resize", () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(() => updateIndicator(activeBtn, false), 100);
      });
   });
}

document.addEventListener("page:ready", initFilterTabs);
requestAnimationFrame(initFilterTabs);
