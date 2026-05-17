// toc.js — Table of Contents scroll spy

const BREAKPOINTS = {
   desktop:   { rootMargin: "-20% 0px -70% 0px" },
   tablet_lg: { rootMargin: "-15% 0px -70% 0px" },
   tablet_sm: { rootMargin: "-10% 0px -70% 0px" },
   mobile:    { rootMargin: "-5%  0px -70% 0px"  },
};

function getConfig() {
   const w = window.innerWidth;
   if (w > 1199) return BREAKPOINTS.desktop;
   if (w > 960)  return BREAKPOINTS.tablet_lg;
   if (w > 767)  return BREAKPOINTS.tablet_sm;
   return BREAKPOINTS.mobile;
}

function getActiveByScroll(sections, offset = 140) {
   const scrollTop = window.scrollY + offset;
   let active = null;
   for (let i = sections.length - 1; i >= 0; i--) {
      const top = sections[i].getBoundingClientRect().top + window.scrollY;
      if (top <= scrollTop) { active = sections[i]; break; }
   }
   return active ?? sections[0];
}

// Module-level state — скидається при кожному initToc
let observer    = null;
let resizeTimer = null;
let isFrozen    = false;
let freezeTimer = null;

function initToc() {
   if (observer) { observer.disconnect(); observer = null; }
   clearTimeout(resizeTimer);
   clearTimeout(freezeTimer);
   isFrozen = false;

   // Barba тримає старий і новий контент одночасно під час анімації.
   // Новий завжди ОСТАННІЙ в DOM → беремо останній елемент
   const all = document.querySelectorAll("[data-toc]");
   const container = all[all.length - 1] ?? null;
   console.log("[toc] initToc container:", container?.className ?? "NOT FOUND", "total:", all.length);
   if (!container) return;

   const links = container.querySelectorAll("[data-goto]");
   if (!links.length) return;

   let sections = [...document.querySelectorAll("[data-toc-section]")];
   if (!sections.length) {
      sections = [...links]
         .map((link) => document.querySelector(link.dataset.goto))
         .filter(Boolean);
   }
   if (!sections.length) return;

   function setActive(activeSection) {
      if (isFrozen) return;
      links.forEach((link) => {
         const target = document.querySelector(link.dataset.goto);
         link.classList.toggle("is-active", target === activeSection);
      });
   }

   links.forEach((link) => {
      link.addEventListener("click", () => {
         isFrozen = true;
         links.forEach((l) => l.classList.remove("is-active"));
         link.classList.add("is-active");
         clearTimeout(freezeTimer);
         freezeTimer = setTimeout(() => {
            isFrozen = false;
            const correct = getActiveByScroll(sections);
            if (correct) setActive(correct);
         }, 900);
      });
   });

   observer = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target);
         });
      },
      { rootMargin: getConfig().rootMargin, threshold: 0 },
   );

   sections.forEach((s) => observer.observe(s));

   window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
         if (!observer) return;
         observer.disconnect();
         sections.forEach((s) => observer.observe(s));
      }, 200);
   });

   // rAF — гарантує що slide-nav вже підключив MutationObserver
   requestAnimationFrame(() => {
      const initial = getActiveByScroll(sections);
      console.log("[toc] rAF initial section:", initial?.id ?? "none");
      if (!initial) return;
      links.forEach((link) => {
         const target = document.querySelector(link.dataset.goto);
         const isActive = target === initial;
         link.classList.toggle("is-active", isActive);
         if (isActive) console.log("[toc] set is-active on:", link.textContent.trim());
      });
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initToc);
} else {
   initToc();
}

document.addEventListener("page:ready", initToc);
