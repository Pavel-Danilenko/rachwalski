import Swiper from "swiper";
import { Navigation } from "swiper/modules";

export const selector = "[data-cards-slider]";

// Per-element state instead of module-level singletons
const instances = new WeakMap();

function enable(el) {
   const inst = instances.get(el);
   if (!inst || inst.swiper) return;

   inst.swiper = new Swiper(el.querySelector(".swiper"), {
      modules: [Navigation],
      grabCursor: true,
      loop: true,
      speed: 600,
      observer: true,
      observeParents: true,
      // autoHeight підганяє висоту під активний слайд (стрибає). Прапорець
      // data-equal-height вимикає його → всі слайди тягнуться до найвищого
      // (flex-stretch, слайди мають height:auto у _cards-slider.scss).
      autoHeight: !el.hasAttribute("data-equal-height"),
      slidesPerView: parseFloat(el.dataset.slidesPerView ?? "1.2"),
      spaceBetween: 12,
      navigation: {
         prevEl: el.querySelector(".slider__arrow--prev"),
         nextEl: el.querySelector(".slider__arrow--next"),
      },
   });
}

function disable(el) {
   const inst = instances.get(el);
   if (!inst) return;
   inst.swiper?.destroy(true, true);
   inst.swiper = null;
}

function initCardsSlider() {
   document.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.cardsSliderInitialized) return;
      el.dataset.cardsSliderInitialized = "true";

      const mq = window.matchMedia("(max-width: 767px)");
      const mqHandler = (e) => (e.matches ? enable(el) : disable(el));

      instances.set(el, { swiper: null, mq, mqHandler });

      if (mq.matches) enable(el);
      mq.addEventListener("change", mqHandler);
   });
}

function destroyCardsSlider() {
   document.querySelectorAll(`${selector}[data-cards-slider-initialized]`).forEach((el) => {
      const inst = instances.get(el);
      if (inst) {
         // Тільки прибираємо mq listener — Swiper не руйнуємо (уникаємо flash при page:leave)
         inst.mq?.removeEventListener("change", inst.mqHandler);
         instances.delete(el);
      }
      delete el.dataset.cardsSliderInitialized;
   });
}

// Same pattern as tabs.js
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initCardsSlider);
} else {
   initCardsSlider();
}

document.addEventListener("page:ready", initCardsSlider);
document.addEventListener("page:leave", destroyCardsSlider);

export { initCardsSlider, destroyCardsSlider };
