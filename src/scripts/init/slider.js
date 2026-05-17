import Swiper from "swiper";
import {
   Navigation,
   Pagination,
   Autoplay,
   EffectFade,
   EffectCards,
   EffectCreative,
   EffectCoverflow,
} from "swiper/modules";

function initSliders() {
   document.querySelectorAll("[data-slider]").forEach((el) => {
      if (el.dataset.sliderInitialized) return;
      el.dataset.sliderInitialized = "true";

      const d = el.dataset;
      const swiperEl = el.querySelector(".swiper");
      if (!swiperEl) return;

      const prevEl       = el.querySelector(".slider__arrow--prev");
      const nextEl       = el.querySelector(".slider__arrow--next");
      const paginationEl = el.querySelector(".slider__pagination");

      const num  = (key, fallback) => d[key] !== undefined ? parseFloat(d[key]) : fallback;
      const bool = (key, fallback) => d[key] !== undefined ? d[key] === "true" : fallback;

      const slidesMobile   = num("slidesMobile",   1);
      const slidesTabletSm = num("slidesTabletSm", slidesMobile);
      const slidesTablet   = num("slidesTablet",   slidesTabletSm);
      const slidesDesktop  = num("slidesDesktop",  slidesTablet);

      const spaceMobile   = num("spaceMobile",   16);
      const spaceTabletSm = num("spaceTabletSm", spaceMobile);
      const spaceTablet   = num("spaceTablet",   spaceTabletSm);
      const spaceDesktop  = num("spaceDesktop",  spaceTablet);

      const arrows           = bool("arrows",           true);
      const arrowsMobile     = bool("arrowsMobile",     false);
      const showPagination   = bool("pagination",       true);
      const paginationMobile = bool("paginationMobile", true);
      const loop             = bool("loop",             false);
      const grabCursor       = bool("grabCursor",       true);
      const centered         = bool("centered",         false);

      const speed          = num("speed", 500);
      const effect         = d.effect         ?? "slide";
      const paginationType = d.paginationType ?? "bullets";
      const autoplayDelay  = d.autoplay ? parseFloat(d.autoplay) : 0;

      const getBreakpoint = () => {
         const w = window.innerWidth;
         if (w >= 1200) return "desktop";
         if (w >= 960)  return "tablet";
         if (w >= 768)  return "tabletSm";
         return "mobile";
      };

      const updateVisibility = () => {
         const isMobile   = getBreakpoint() === "mobile";
         const showArrows = isMobile ? arrowsMobile : arrows;
         const showPag    = isMobile ? paginationMobile : showPagination;
         if (prevEl)       prevEl.style.display       = showArrows ? "" : "none";
         if (nextEl)       nextEl.style.display       = showArrows ? "" : "none";
         if (paginationEl) paginationEl.style.display = showPag    ? "" : "none";
      };

      const totalSlides = el.querySelectorAll(".swiper-slide").length;
      const maxSPV      = Math.max(slidesMobile, slidesTabletSm, slidesTablet, slidesDesktop);
      const safeLoop    = loop && totalSlides >= Math.ceil(maxSPV) * 2;

      const config = {
         modules: [Navigation, Pagination, Autoplay, EffectFade, EffectCards, EffectCreative, EffectCoverflow],
         speed,
         effect,
         loop: safeLoop,
         grabCursor,
         centeredSlides: centered,
         watchOverflow: true,
         breakpoints: {
            0:    { slidesPerView: slidesMobile,   spaceBetween: spaceMobile,   centeredSlides: centered },
            768:  { slidesPerView: slidesTabletSm, spaceBetween: spaceTabletSm, centeredSlides: centered },
            960:  { slidesPerView: slidesTablet,   spaceBetween: spaceTablet,   centeredSlides: centered },
            1200: { slidesPerView: slidesDesktop,  spaceBetween: spaceDesktop,  centeredSlides: centered },
         },
         navigation:      { prevEl, nextEl },
         pagination:      { el: paginationEl, clickable: true, type: paginationType },
         coverflowEffect: { depth: 100, scale: 0.85, rotate: 0, stretch: 0, modifier: 1, slideShadows: false },
         creativeEffect:  { prev: { shadow: true, translate: ["-120%", 0, -500] }, next: { translate: ["100%", 0, 0] } },
      };

      if (autoplayDelay > 0) {
         config.autoplay = { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true };
      }

      const swiper = new Swiper(swiperEl, config);

      if (swiper.slides.length <= 1) {
         if (prevEl)       prevEl.style.display       = "none";
         if (nextEl)       nextEl.style.display       = "none";
         if (paginationEl) paginationEl.style.display = "none";
      } else {
         updateVisibility();
      }

      window.addEventListener("resize", updateVisibility);
   });
}

function destroySliders() {
   document.querySelectorAll("[data-slider-initialized]").forEach((el) => {
      const swiperEl = el.querySelector(".swiper");
      if (swiperEl?.swiper) swiperEl.swiper.destroy(true, true);
      delete el.dataset.sliderInitialized;
   });
}

initSliders();
document.addEventListener("page:ready", initSliders);
document.addEventListener("page:leave", destroySliders);

export { initSliders, destroySliders };
