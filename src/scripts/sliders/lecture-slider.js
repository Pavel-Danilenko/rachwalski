import Swiper from "swiper";
import { Navigation } from "swiper/modules";

export const selector = "[data-lecture-slider]";

const instances = new WeakMap();

function init(el) {
   if (instances.has(el)) return;

   const swiper = new Swiper(el.querySelector(".swiper"), {
      modules: [Navigation],
      grabCursor: true,
      loop: false,
      speed: 500,
      observer: true,
      observeParents: true,
      slidesPerView: 1.15,
      spaceBetween: 12,
      navigation: {
         prevEl: el.querySelector(".lecture-slider__arrow--prev"),
         nextEl: el.querySelector(".lecture-slider__arrow--next"),
      },
      breakpoints: {
         768: {
            slidesPerView: 2,
            spaceBetween: 12,
         },
         992: {
            slidesPerView: 3,
            spaceBetween: 12,
         },
      },
   });

   instances.set(el, swiper);
}

function destroy(el) {
   const swiper = instances.get(el);
   if (!swiper) return;
   swiper.destroy(true, true);
   instances.delete(el);
}

function initAll() {
   document.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.lectureSliderInitialized) return;
      el.dataset.lectureSliderInitialized = "true";
      init(el);
   });
}

function destroyAll() {
   document.querySelectorAll(`${selector}[data-lecture-slider-initialized]`).forEach((el) => {
      destroy(el);
      delete el.dataset.lectureSliderInitialized;
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initAll);
} else {
   initAll();
}

document.addEventListener("page:ready", initAll);
document.addEventListener("page:leave", destroyAll);

export { initAll as initLectureSlider, destroyAll as destroyLectureSlider };
