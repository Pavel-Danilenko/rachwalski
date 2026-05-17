/**
 * page-lifecycle.js — централізовані події сторінки
 *
 * page:ready  — сторінка готова (DOM + усі ресурси)
 * page:leave  — сторінка зараз зміниться (час cleanup)
 *
 * Сумісний з:
 *   - Barba.js (transitions.js вручну викликає dispatch*)
 *   - Astro ClientRouter (слухає astro:page-load як fallback)
 *   - Без жодного роутера (DOMContentLoaded)
 */

export function dispatchPageReady() {
   document.dispatchEvent(new CustomEvent("page:ready"));
}

export function dispatchPageLeave() {
   document.dispatchEvent(new CustomEvent("page:leave"));
}

// ── Ініціальне завантаження ────────────────────────────────────────────────
if (typeof document !== "undefined") {
   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", dispatchPageReady);
   } else {
      // DOM вже готовий (скрипт завантажився після DOMContentLoaded)
      dispatchPageReady();
   }

   // Astro ClientRouter (якщо є — fallback для dev-режиму)
   document.addEventListener("astro:page-load", dispatchPageReady);
   document.addEventListener("astro:before-swap", dispatchPageLeave);
}
