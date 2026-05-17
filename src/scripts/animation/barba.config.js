/**
 * barba.config.js — налаштування переходів між сторінками
 * ─────────────────────────────────────────────────────────
 * Редагуй тільки цей файл. barba.js не чіпай.
 *
 * ── animation (список всіх варіантів) ─────────────────────
 *   Базові:   "none" | "fade"
 *   Slide:    "slide-up" | "slide-down" | "slide-left" | "slide-right"
 *   Scale:    "scale" | "zoom-in"
 *   Blur:     "blur"
 *   Clip:     "clip" | "clip-up" | "curtain"
 *   Вау:      "iris" | "flip" | "flip-x" | "morph" | "push" | "glitch"
 *
 * ── ease (GSAP) ───────────────────────────────────────────
 *   "power1/2/3/4.out"    — стандарт (більша цифра = різкіше)
 *   "expo.out"            — дуже швидкий старт
 *   "back.out(1.7)"       — overshoot (пружинка)
 *   "elastic.out(1, 0.3)" — пружна анімація
 *   "sine.out"            — найм'якіше
 *
 * ── namespace ─────────────────────────────────────────────
 *   Задається в BaseLayout: <BaseLayout namespace="about">
 *   Якщо namespace не вказано або немає запису → береться default
 */

export const transitions = {
   // ── Дефолт для всіх сторінок ──────────────────────────────────────────
   default: {
      animation: "fade",
      duration: { leave: 0.5, enter: 0.55 },
      ease: { leave: "power2.in", enter: "power2.out" },
      animateFooter: false,
      // color — колір overlay між сторінками (показується під clip-анімаціями)
      // Приклади: "var(--color-primary)" | "#000" | "#fff" | "var(--color-bg-alt)"
      // null → без overlay (для fade/slide де overlay не потрібен)
      color: null,              // null → вимкнено. Увімкнути: "var(--color-primary)" | "#000"
   },

   // ── Per-page ───────────────────────────────────────────────────────────
   // Розкоментуй або додай свої сторінки. Незазначені поля → з default.

   // about: {
   //    animation: "slide-up",
   //    duration:  { leave: 0.3, enter: 0.5 },
   // },

   // home: {
   //    animation: "iris",
   //    duration:  { leave: 0.45, enter: 0.65 },
   //    ease:      { leave: "power3.in", enter: "power3.out" },
   //    animateFooter: true,
   // },

   // services: {
   //    animation: "clip",
   //    duration:  { leave: 0.35, enter: 0.5 },
   // },

   // contact: {
   //    animation: "morph",
   //    duration:  { leave: 0.35, enter: 0.5 },
   //    ease:      { leave: "power2.in", enter: "back.out(1.2)" },
   // },
};
