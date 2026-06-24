import lottie from "lottie-web";
import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

let _running = false;

function initPreloader() {
   if (_running) return;

   const navEntry = performance.getEntriesByType("navigation")[0];
   const navType = navEntry ? navEntry.type : "navigate";
   const isReload = navType === "reload";
   const isFirstVisit = !sessionStorage.getItem("preloader_shown");

   if (!isFirstVisit && !isReload) return;

   _running = true;

   const preloader = document.getElementById("preloader");
   const container = document.getElementById("preloaderLottie");

   if (!preloader || !container) return;

   const fadeDuration = Number(preloader.dataset.fadeDuration) || 600;
   const minDisplayTime = Number(preloader.dataset.minDisplayTime) || 0;

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

         setTimeout(() => {
            preloader.style.display = "none";
            sessionStorage.setItem("preloader_shown", "true");
            document.dispatchEvent(new CustomEvent("preloader:hidden"));
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
   }
}

initPreloader();
