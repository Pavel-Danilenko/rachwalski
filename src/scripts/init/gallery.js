// в першу черге треба встановинити локально
// з офіційного сайту https://fancyapps.com/fancybox/get-started/installation/

// # Gallery Component

// ## Installation

// To use Gallery with Fancybox lightbox:
// ```bash
// npm install @fancyapps/ui
// ```

// That's it! Gallery will work automatically.

import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

//=====================

export function initFancybox() {
   // ❗ ОБОВʼЯЗКОВО знищуємо попередні бінди
   Fancybox.destroy();

   Fancybox.bind("[data-fancybox]", {
      // =============================================
      // ЗАГАЛЬНІ НАЛАШТУВАННЯ
      // =============================================

      dragToClose: false,
      hideScrollbar: true,
      autoFocus: false,
      placeFocusBack: true,
      trapFocus: true,

      // =============================================
      // АНІМАЦІЇ
      // =============================================

      animated: true,
      showClass: "f-fadeIn",
      hideClass: "f-fadeOut",
      zoomEffect: false,

      // =============================================
      // ЗОБРАЖЕННЯ ТА ЗУМ
      // =============================================

      Images: {
         zoom: true,
         initialSize: "fit",
         Panzoom: {
            maxScale: 3,
         },
      },

      // =============================================
      // КАРУСЕЛЬ
      // =============================================

      Carousel: {
         infinite: false,
         transition: "slide",

         Autoplay: {
            timeout: 5000,
            autoStart: false,
            showProgress: true, // Круговий прогрес-бар біля кнопки autoplay
         },

         // =============================================
         // АДАПТИВНИЙ TOOLBAR (головне покращення для мобілки!)
         // =============================================

         Toolbar: {
            absolute: false,

            // Базовий toolbar (для мобілки < 768px) — мінімальний і лаконічний
            display: {
               // left: ["infobar"],  // Розкоментуй, якщо хочеш лічильник зліва навіть на мобілці
               middle: ["rotateCCW", "rotateCW", "flipX"], // Ховаємо zoom/rotate/flip на мобілці
               right: [
                  "autoplay", // Play/pause + прогрес-бар (головне для слайдшоу)
                  "thumbs", // Прев'ю (дуже корисно на мобілці)
                  "close", // Закриття
               ],
            },
         },

         Thumbs: {
            type: "modern",
            autoStart: true,
            minCount: 1, // Показувати навіть для 1 фото, якщо хочеш
         },

         // =============================================
         // BREAKPOINTS: повний toolbar на десктопі/планшеті
         // =============================================

         breakpoints: {
            "(min-width: 768px)": {
               // Для екранів ≥ 768px (планшети + десктоп)
               Toolbar: {
                  display: {
                     left: ["infobar"],
                     middle: [
                        "zoomIn",
                        "zoomOut",
                        "toggle1to1",
                        "rotateCCW",
                        "rotateCW",
                        "flipX",
                        "flipY",
                     ],
                     right: [
                        "download",
                        "toggleFull",
                        "thumbs",
                        "autoplay",
                        "close",
                     ],
                  },
               },
            },
         },
      },

      // =============================================
      // HASH В URL
      // =============================================

      Hash: false,

      // =============================================
      // КАСТОМНІ CSS-ЗМІННІ
      // =============================================

      mainStyle: {
         "--f-toolbar-padding": "0",
         "--f-button-svg-stroke-width": "1.5",
         "--f-arrow-svg-stroke-width": "1.75",
         "--f-thumb-width": "82px",
         "--f-thumb-height": "82px",
         "--f-thumb-border-radius": "8px",
         "--f-thumb-selected-shadow":
            "inset 0 0 0 2px #fff, 0 0 0 1.5px #ff2e00",
         "--f-progressbar-color": "#ff2e00",
      },

      // =============================================
      // CSS ДЛЯ ХОВИНГУ СТРІЛОК (додай окремо)
      // =============================================

      /*
      .fancybox__container .f-button[data-fancybox-prev],
      .fancybox__container .f-button[data-fancybox-next] {
        opacity: 0.4;
        transition: opacity 0.3s;
      }
      .fancybox__container:hover .f-button[data-fancybox-prev],
      .fancybox__container:hover .f-button[data-fancybox-next] {
        opacity: 1;
      }
      */
   });
}

// =============================================
// DOM READY — ОБОВʼЯЗКОВО
// =============================================

document.addEventListener("DOMContentLoaded", initFancybox);

// =============================================
// ASTRO NAVIGATION (якщо буде SPA-поведінка)
// =============================================

document.addEventListener("astro:page-load", initFancybox);
