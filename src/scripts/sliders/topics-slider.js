import Swiper from "swiper";
import { Navigation } from "swiper/modules";

export const selector = "[data-topics-slider]";

const BREAKPOINTS = [
   { minWidth: 0,    slidesPerView: 1.1, spaceBetween: 16, cardsPerSlide: 1, cardGap: 16 },
   { minWidth: 768,  slidesPerView: 2,   spaceBetween: 20, cardsPerSlide: 2, cardGap: 16 },
   { minWidth: 1024, slidesPerView: 2,   spaceBetween: 20, cardsPerSlide: 3, cardGap: 20 },
   { minWidth: 1440, slidesPerView: 2,   spaceBetween: 24, cardsPerSlide: 3, cardGap: 24 },
];

// Per-element state
const instances = new WeakMap();

function getConfig() {
   const width = window.innerWidth;
   let active = BREAKPOINTS[0];
   BREAKPOINTS.forEach((bp) => { if (width >= bp.minWidth) active = bp; });
   return active;
}

function build(el) {
   const inst = instances.get(el);
   if (!inst) return;

   const wrapper = el.querySelector(".swiper-wrapper");
   if (!wrapper) return;

   const cfg = getConfig();

   if (inst.swiper && cfg.cardsPerSlide === inst.currentCardsPerSlide) {
      inst.swiper.params.slidesPerView = cfg.slidesPerView;
      inst.swiper.params.spaceBetween  = cfg.spaceBetween;
      inst.swiper.update();
      return;
   }

   inst.currentCardsPerSlide = cfg.cardsPerSlide;
   if (inst.swiper) inst.swiper.destroy(true, true);
   wrapper.innerHTML = "";

   if (cfg.cardsPerSlide === 1) {
      inst.originalCardsHTML.forEach((html) => {
         const slide = document.createElement("div");
         slide.className = "swiper-slide";
         slide.innerHTML = html;
         wrapper.appendChild(slide);
      });
   } else {
      for (let i = 0; i < inst.originalCardsHTML.length; i += cfg.cardsPerSlide) {
         const group = document.createElement("div");
         group.className = "swiper-slide";
         group.style.cssText = `display:flex; flex-direction:column; gap:${cfg.cardGap}px;`;
         inst.originalCardsHTML.slice(i, i + cfg.cardsPerSlide).forEach((html) => {
            const tmp = document.createElement("div");
            tmp.innerHTML = html;
            group.appendChild(tmp.firstElementChild);
         });
         wrapper.appendChild(group);
      }
   }

   inst.swiper = new Swiper(el.querySelector(".swiper"), {
      modules: [Navigation],
      loop: false,
      speed: 800,
      slidesPerView: cfg.slidesPerView,
      spaceBetween: cfg.spaceBetween,
      navigation: {
         prevEl: el.querySelector(".slider__arrow--prev"),
         nextEl: el.querySelector(".slider__arrow--next"),
      },
   });
}

function initTopicsSlider() {
   document.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.topicsSliderInitialized) return;
      el.dataset.topicsSliderInitialized = "true";

      const wrapper = el.querySelector(".swiper-wrapper");
      if (!wrapper) return;

      const originalCardsHTML = Array.from(
         wrapper.querySelectorAll(":scope > .swiper-slide"),
      ).map((slide) => slide.innerHTML);

      const resizeHandler = () => {
         clearTimeout(instances.get(el)?.resizeTimer);
         const inst = instances.get(el);
         if (inst) inst.resizeTimer = setTimeout(() => build(el), 200);
      };

      instances.set(el, {
         swiper: null,
         currentCardsPerSlide: null,
         originalCardsHTML,
         resizeTimer: null,
         resizeHandler,
      });

      build(el);
      window.addEventListener("resize", resizeHandler);
   });
}

function destroyTopicsSlider() {
   document.querySelectorAll(`${selector}[data-topics-slider-initialized]`).forEach((el) => {
      const inst = instances.get(el);
      if (inst) {
         inst.swiper?.destroy(true, true);
         window.removeEventListener("resize", inst.resizeHandler);
         instances.delete(el);
      }
      delete el.dataset.topicsSliderInitialized;
   });
}

// Same pattern as tabs.js
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTopicsSlider);
} else {
   initTopicsSlider();
}

document.addEventListener("page:ready", initTopicsSlider);
document.addEventListener("page:leave", destroyTopicsSlider);

export { initTopicsSlider, destroyTopicsSlider };
