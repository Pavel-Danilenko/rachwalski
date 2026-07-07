// scroll-to-top.js — показує кнопку "вгору" після прокрутки на threshold px,
// плавно скролить на top. Кнопка знаходиться поза Barba-контейнером (BaseLayout),
// тому ініціалізується один раз і не потребує повторного init при SPA-навігації.

function initScrollToTop() {
   document.querySelectorAll("[data-scroll-top]").forEach((btn) => {
      if (btn.dataset.scrollTopInit) return;
      btn.dataset.scrollTopInit = "true";

      const threshold =
         btn.dataset.threshold !== undefined
            ? parseInt(btn.dataset.threshold, 10)
            : window.innerHeight;

      const update = () => {
         const belowThreshold = window.scrollY > threshold;
         // Ховаємо кнопку якщо близько до footer (60px від дна)
         const distanceToBottom =
            document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
         const nearFooter = distanceToBottom < 60;

         const visible = belowThreshold && !nearFooter;
         btn.classList.toggle("is-visible", visible);
         document
            .querySelector(".video-banner__music")
            ?.classList.toggle("is-scroll-top-visible", visible);
      };

      window.addEventListener("scroll", update, { passive: true });
      update();

      btn.addEventListener("click", () => {
         window.scrollTo({ top: 0, behavior: "smooth" });
      });
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initScrollToTop);
} else {
   initScrollToTop();
}

// На SPA-навігації скидаємо видимість (нова сторінка = scroll зверху)
document.addEventListener("page:ready", () => {
   document.querySelectorAll("[data-scroll-top]").forEach((btn) => {
      btn.classList.remove("is-visible");
   });
});
