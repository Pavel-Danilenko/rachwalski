// src/scripts/global/block-scroll.js

const paddingSelectors = "[data-lock]";
let bodyLockStatus = true;
let lockCount = 0;

export function bodyLock(delay = 500) {
   if (!bodyLockStatus) {
      console.warn("Body lock is currently processing, skipping");
      return;
   }

   lockCount++;

   if (lockCount > 1) {
      return;
   }

   const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth + "px";

   document.querySelectorAll(paddingSelectors).forEach((el) => {
      el.style.paddingRight = scrollbarWidth;
   });

   document.body.style.paddingRight = scrollbarWidth;
   document.documentElement.classList.add("lock");

   bodyLockStatus = false;
   setTimeout(() => {
      bodyLockStatus = true;
   }, delay);
}

export function bodyUnlock(delay = 500) {
   lockCount--;

   if (lockCount > 0) {
      return;
   }

   lockCount = Math.max(0, lockCount);

   setTimeout(() => {
      if (lockCount === 0) {
         document.querySelectorAll(paddingSelectors).forEach((el) => {
            el.style.paddingRight = "";
         });

         document.body.style.paddingRight = "";
         document.documentElement.classList.remove("lock");
      }
   }, delay);

   bodyLockStatus = true;
}

// Скидання при переходах
export function resetBodyLock() {
   bodyLockStatus = true;
   lockCount = 0;

   document.querySelectorAll(paddingSelectors).forEach((el) => {
      el.style.paddingRight = "";
   });

   document.body.style.paddingRight = "";
   document.documentElement.classList.remove("lock");
}

// Автоматичне скидання
if (typeof document !== "undefined") {
   document.addEventListener("astro:after-swap", resetBodyLock);
}
