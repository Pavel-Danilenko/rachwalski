// goto-block.js

// ============================================================
// ПАРСИНГ data-goto-offset
// Підтримує три формати:
// "80"             → відступ 80px
// ".header"        → висота елемента .header
// ".header, 20"    → висота елемента .header + 20px
// ============================================================
// goto-block.js

function parseOffset(offsetAttr) {
   if (!offsetAttr) return 0;

   const parts = offsetAttr.split(",").map((s) => s.trim());
   let total = 0;

   parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith(".") || part.startsWith("#")) {
         const el = document.querySelector(part);
         if (el) total += el.offsetHeight;
      } else {
         const num = parseInt(part);
         if (!isNaN(num)) total += num;
      }
   });

   return total;
}

export function gotoBlock(selector, offsetAttr = "") {
   const target = document.querySelector(selector);
   if (!target) return;

   const offset = parseOffset(offsetAttr);
   const targetPosition = target.getBoundingClientRect().top + window.scrollY;
   const finalPosition = targetPosition - offset;

   window.scrollTo({
      top: Math.max(0, finalPosition),
      behavior: "smooth",
   });
}

function closeMenu() {
   if (document.documentElement.hasAttribute("data-menu-open")) {
      document.documentElement.removeAttribute("data-menu-open");
   }
}

function initGotoBlock() {
   // capture: true — спрацьовуємо ДО Astro ClientRouter
   // щоб preventDefault зупинив навігацію
   document.addEventListener(
      "click",
      (e) => {
         const trigger = e.target.closest("[data-goto]");
         if (!trigger) return;

         e.preventDefault();
         e.stopPropagation();

         const selector = trigger.dataset.goto;
         if (!selector) return;

         const offsetAttr = trigger.dataset.gotoOffset || "";

         closeMenu();
         gotoBlock(selector, offsetAttr);
      },
      true,
   ); // ← capture phase
}

function initHashScroll() {
   function scrollToHash() {
      const hash = window.location.hash;
      if (!hash || hash === "#") return;
      setTimeout(() => gotoBlock(hash), 100);
   }

   window.addEventListener("load", scrollToHash, { once: true });
   document.addEventListener("astro:page-load", scrollToHash);
}

initGotoBlock();
initHashScroll();

export default gotoBlock;
