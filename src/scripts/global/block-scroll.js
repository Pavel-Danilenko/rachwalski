// block-scroll.js
// Блокування скролу через overflow: hidden на <html>.
// Компенсує зникнення скролбара padding-right на фіксованих елементах.

const paddingSelectors = "[data-lock]";
let isLocked = false;
let unlockTimer = null;

export function bodyLock() {
   if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
   }
   if (isLocked) return;
   isLocked = true;

   const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
   if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty("--scrollbar-width", scrollbarWidth + "px");
      document.querySelectorAll(paddingSelectors).forEach((el) => {
         el.style.paddingRight = scrollbarWidth + "px";
      });
      document.body.style.paddingRight = scrollbarWidth + "px";
   }

   document.documentElement.classList.add("lock");
}

export function bodyUnlock(delay = 300) {
   if (!isLocked) return;

   unlockTimer = setTimeout(() => {
      unlockTimer = null;
      isLocked = false;
      document.documentElement.classList.remove("lock");
      document.documentElement.style.removeProperty("--scrollbar-width");
      document.querySelectorAll(paddingSelectors).forEach((el) => {
         el.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
   }, delay);
}

export function resetBodyLock() {
   if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
   }
   isLocked = false;
   document.documentElement.classList.remove("lock");
   document.body.style.paddingRight = "";
   document.querySelectorAll(paddingSelectors).forEach((el) => {
      el.style.paddingRight = "";
   });
}

if (typeof document !== "undefined") {
   document.addEventListener("page:leave", () => {
      if (unlockTimer) {
         clearTimeout(unlockTimer);
         unlockTimer = null;
      }
      isLocked = false;
   });
}
