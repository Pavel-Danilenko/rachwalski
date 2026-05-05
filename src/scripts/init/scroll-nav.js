// scroll-nav.js
// Активний клас на пунктах меню при скролі по секціям + прогрес скролу

// ============================================================
// АКТИВНИЙ КЛАС ПРИ СКРОЛІ
// is-active на посилання в [data-scroll-nav]
// is-active на секцію — якщо є атрибут data-scroll-nav-section (опціонально)
// ============================================================
// scroll-nav.js

// scroll-nav.js

// scroll-nav.js

function initSectionWatch() {
   const navLinks = document.querySelectorAll("[data-scroll-nav] [data-goto]");
   if (!navLinks.length) return;

   // Збираємо тільки секції які мають відповідне посилання в меню
   const watchedSections = [];

   navLinks.forEach((link) => {
      const selector = link.dataset.goto;
      if (!selector) return;

      const section = document.querySelector(selector);
      if (!section) return;

      if (
         !section.hasAttribute("data-watch") &&
         !section.hasAttribute("data-watch-once")
      )
         return;

      watchedSections.push({ section, link });
   });

   if (!watchedSections.length) return;

   watchedSections.forEach(({ section, link }) => {
      const mo = new MutationObserver(() => {
         const isVisible = section.classList.contains("_watcher-view");

         if (isVisible) {
            // Знімаємо з усіх — додаємо тільки на поточний
            navLinks.forEach((l) => l.classList.remove("is-active"));
            watchedSections.forEach(({ section: s }) => {
               if (s.hasAttribute("data-scroll-nav-section")) {
                  s.classList.remove("is-active");
               }
            });

            link.classList.add("is-active");

            if (section.hasAttribute("data-scroll-nav-section")) {
               section.classList.add("is-active");
            }
         } else {
            // Секція вийшла з viewport — знімаємо is-active
            link.classList.remove("is-active");

            if (section.hasAttribute("data-scroll-nav-section")) {
               section.classList.remove("is-active");
            }
         }
      });

      mo.observe(section, {
         attributes: true,
         attributeFilter: ["class"],
      });
   });
}

function initScrollProgress() {
   const progressEl = document.querySelector("[data-nav-progress]");
   if (!progressEl) return;

   let rafId = null;

   function updateProgress() {
      const docHeight =
         document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      progressEl.style.setProperty("--scroll-progress", progress.toFixed(4));
      rafId = null;
   }

   window.addEventListener(
      "scroll",
      () => {
         if (rafId) return;
         rafId = requestAnimationFrame(updateProgress);
      },
      { passive: true },
   );

   updateProgress();
}

function initScrollNav() {
   initSectionWatch();
   initScrollProgress();
}

initScrollNav();
document.addEventListener("astro:page-load", initScrollNav);

export default initScrollNav;
