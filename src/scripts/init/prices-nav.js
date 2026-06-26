// prices-nav.js
// Sticky-навігація категорій на fees: активна кнопка визначається скролом (scroll-spy),
// індикатор (span) їде під активну (як було на табах), а при «прилипанні» бар
// отримує клас .is-stuck (для затемнення фону).

function initPricesNav() {
   const nav = document.querySelector("[data-prices-nav]");
   if (!nav || nav.dataset.pricesNavInit) return;
   nav.dataset.pricesNavInit = "true";

   const wrapper = nav.querySelector(".prices-nav__wrapper");
   const list = nav.querySelector(".prices-nav__list");
   const buttons = [...nav.querySelectorAll(".prices-nav__button")];
   const indicator = nav.querySelector(".prices-nav__indicator");
   const sentinel = document.querySelector("[data-prices-nav-sentinel]");
   if (!buttons.length || !list || !indicator) return;

   // Секція кожної кнопки = її data-goto target
   const sections = buttons.map((b) => document.querySelector(b.dataset.goto));
   let activeIdx = -1;

   function reposition(animate) {
      if (activeIdx < 0) return;
      const btn = buttons[activeIdx];
      const listRect = list.getBoundingClientRect();
      const r = btn.getBoundingClientRect();
      if (!animate) indicator.style.transition = "none";
      indicator.style.transform = `translateX(${(r.left - listRect.left).toFixed(2)}px)`;
      indicator.style.width = `${r.width.toFixed(2)}px`;
      if (!animate) {
         void indicator.offsetWidth; // зафіксувати без анімації
         indicator.style.transition = "";
      }
   }

   function setActive(idx, animate = true) {
      if (idx === activeIdx) return;
      activeIdx = idx;
      buttons.forEach((b, i) =>
         b.setAttribute("aria-selected", i === idx ? "true" : "false"),
      );
      reposition(animate);
   }

   // Активна = остання секція, чий верх перетнув лінію (висота nav + запас).
   // Тому до botox активна 1-а, від botox і нижче — 2-а.
   function computeActive() {
      const line = nav.offsetHeight + 60;
      let idx = 0;
      sections.forEach((sec, i) => {
         if (sec && sec.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
   }

   setActive(0, false); // стартова без анімації

   let ticking = false;
   function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
         computeActive();
         ticking = false;
      });
   }
   window.addEventListener("scroll", onScroll, { passive: true });
   window.addEventListener("resize", () => reposition(false));
   window.addEventListener("load", () => reposition(false));

   // «Прилипання»: коли сентинел (над nav) виходить за верх — бар стає stuck
   if (sentinel && wrapper) {
      const io = new IntersectionObserver(
         ([entry]) => wrapper.classList.toggle("is-stuck", !entry.isIntersecting),
         { threshold: 0 },
      );
      io.observe(sentinel);
   }

   computeActive();
}

if (typeof document !== "undefined") {
   initPricesNav();
   document.addEventListener("page:ready", initPricesNav);
}
