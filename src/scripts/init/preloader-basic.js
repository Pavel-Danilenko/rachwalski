import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

function initPreloaderBasic() {
   const navEntry = performance.getEntriesByType("navigation")[0];
   const isReload = navEntry ? navEntry.type === "reload" : false;
   const isFirstVisit = !sessionStorage.getItem("preloader_shown");

   if (!isFirstVisit && !isReload) return;

   sessionStorage.setItem("preloader_shown", "true");

   const preloader = document.getElementById("preloader");
   const numberEl = document.getElementById("preloaderNumber");
   const barEl = document.getElementById("preloaderBar");

   if (!preloader || !numberEl || !barEl) return;

   const fadeDuration = Number(preloader.dataset.fadeDuration) || 600;
   const minDisplayTime = Number(preloader.dataset.minDisplayTime) || 0;
   const simulationDuration = Number(preloader.dataset.simulationDuration) || 800;

   preloader.style.transition = "none";
   preloader.style.opacity = "1";
   preloader.style.visibility = "visible";

   bodyLock();

   let currentValue = 0;
   let animationId = null;
   let isFinishing = false;
   const startTime = Date.now();

   function animateTo(target, duration, onComplete) {
      if (animationId) { cancelAnimationFrame(animationId); animationId = null; }

      const from = currentValue;
      const diff = target - from;
      if (diff <= 0) { if (onComplete) onComplete(); return; }

      const startTs = performance.now();

      function step(ts) {
         const progress = Math.min((ts - startTs) / duration, 1);
         const eased = 1 - Math.pow(1 - progress, 3);
         const value = Math.round(from + diff * eased);

         currentValue = value;
         numberEl.textContent = String(value);
         barEl.style.width = value + "%";

         if (progress < 1) {
            animationId = requestAnimationFrame(step);
         } else {
            animationId = null;
            currentValue = target;
            numberEl.textContent = String(target);
            barEl.style.width = target + "%";
            if (onComplete) onComplete();
         }
      }

      animationId = requestAnimationFrame(step);
   }

   function hidePreloader() {
      if (isFinishing) return;
      isFinishing = true;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
         bodyUnlock();

         animateTo(100, 300, () => {
            document.documentElement.classList.add("preloader-loaded");

            preloader.style.transition = `opacity ${fadeDuration}ms ease, visibility ${fadeDuration}ms ease`;
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";

            setTimeout(() => {
               preloader.style.display = "none";
               document.dispatchEvent(new CustomEvent("preloader:hidden"));
            }, fadeDuration + 50);
         });
      }, remaining);
   }

   animateTo(90, simulationDuration, null);

   if (document.readyState === "complete") {
      hidePreloader();
   } else {
      window.addEventListener("load", hidePreloader, { once: true });
   }
}

initPreloaderBasic();
