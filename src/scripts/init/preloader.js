// lottie_light — полегшена збірка (тільки SVG-renderer, який ми й використовуємо).
// ~45% менша за повну lottie-web; прелоудер на критичному шляху, тож вага важлива.
import lottie from "lottie-web/build/player/lottie_light";
import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

let _running = false;

function initPreloader() {
   if (_running) return;

   const preloader = document.getElementById("preloader");
   const container = document.getElementById("preloaderLottie");

   if (!preloader || !container) return;

   // Only animate if is:inline already made the preloader visible.
   // is:inline sets opacity:1 only on first session visit and sets sessionStorage
   // synchronously during parsing — before any deferred module script can run.
   // If the preloader is hidden here, this session already saw it.
   if (preloader.style.opacity !== "1") return;

   _running = true;

   const fadeDuration = Number(preloader.dataset.fadeDuration) || 600;
   const minDisplayTime = Number(preloader.dataset.minDisplayTime) || 0;
   // Стеля очікування window.load: важкі ресурси (відео-інтро з preload="auto")
   // тримають подію load на повільному з'єднанні — не чекаємо їх вічно.
   const maxWait = Number(preloader.dataset.maxWait) || 5000;

   preloader.style.transition = "none";
   preloader.style.opacity = "1";
   preloader.style.visibility = "visible";

   bodyLock();

   const isMobile = window.matchMedia("(max-width: 1199px)").matches;
   const lottiePath = isMobile ? "/lottie/mobile/data.json" : "/lottie/data.json";

   const anim = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: lottiePath,
   });

   const startTime = Date.now();
   let pageLoaded = false;
   let animDone = false;

   function tryHide() {
      if (!pageLoaded || !animDone) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
         bodyUnlock();
         document.documentElement.classList.add("preloader-loaded");

         preloader.style.transition = `opacity ${fadeDuration}ms ease, visibility ${fadeDuration}ms ease`;
         preloader.style.opacity = "0";
         preloader.style.visibility = "hidden";

         // Dispatch when fade STARTS so underlying content (video intro) can begin
         // playing behind the fading preloader — eliminates the 1-second black gap.
         document.dispatchEvent(new CustomEvent("preloader:hidden"));

         setTimeout(() => {
            preloader.style.display = "none";
         }, fadeDuration + 50);
      }, remaining);
   }

   anim.addEventListener("DOMLoaded", () => {
      const svg = container.querySelector("svg");
      if (svg) svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
   });

   anim.addEventListener("complete", () => {
      animDone = true;
      tryHide();
   });

   anim.addEventListener("data_failed", () => {
      animDone = true;
      tryHide();
   });

   if (document.readyState === "complete") {
      pageLoaded = true;
   } else {
      window.addEventListener("load", () => {
         pageLoaded = true;
         tryHide();
      }, { once: true });
      // Запобіжник: якщо load не настав за maxWait (відео-інтро delay-ить його на
      // повільному інеті) — вважаємо сторінку готовою і ховаємо прелоудер. Відео при
      // цьому ще не буферизоване → video.js покаже фінальний кадр (all-or-nothing).
      setTimeout(() => {
         if (!pageLoaded) {
            pageLoaded = true;
            tryHide();
         }
      }, maxWait);
   }
}

initPreloader();
