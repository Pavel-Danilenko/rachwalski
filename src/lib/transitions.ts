// src/lib/transitions.ts
import { fade, slide } from "astro:transitions";

// 1. Кастомізований fade (тільки duration, бо easing не підтримується)
export const customFade = ({ duration = "0.4s" } = {}) => {
   return fade({ duration });
};

// 2. Кастомізований slide (тільки duration)
export const customSlide = ({ duration = "0.6s" } = {}) => {
   return slide({ duration });
};

// 3. Кастомна анімація "zoom" (тут easing ПРАЦЮЄ, бо це custom з keyframes)
export const zoomTransition = ({
   duration = "0.5s",
   easing = "ease-out", // Можна міняти!
} = {}) => {
   return {
      forwards: {
         old: { name: "zoomOut", duration, easing: "ease-in" }, // Окремо для old/new, щоб "назад" коректно
         new: { name: "zoomIn", duration, easing },
      },
      backwards: {
         old: {
            name: "zoomIn",
            duration,
            easing: "ease-in",
            direction: "reverse",
         },
         new: { name: "zoomOut", duration, easing, direction: "reverse" },
      },
   };
};

// 4. Slide знизу (з fade для плавності)
export const slideFromBottom = ({
   duration = "0.7s",
   easing = "ease-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "slideOutBottom", duration, easing: "ease-in" },
         new: { name: "slideInBottom", duration, easing },
      },
      backwards: {
         old: {
            name: "slideInBottom",
            duration,
            easing: "ease-in",
            direction: "reverse",
         },
         new: {
            name: "slideOutBottom",
            duration,
            easing,
            direction: "reverse",
         },
      },
   };
};

// 5. Fade з масштабуванням (покращений fade)
export const fadeWithScale = ({
   duration = "0.6s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "fadeOutScale", duration, easing },
         new: { name: "fadeInScale", duration, easing },
      },
      backwards: {
         old: { name: "fadeInScale", duration, easing, direction: "reverse" },
         new: { name: "fadeOutScale", duration, easing, direction: "reverse" },
      },
   };
};

// 6. 3D Flip (вау-ефект — переворот по горизонталі)
export const flip3D = ({ duration = "0.8s", easing = "ease-in-out" } = {}) => {
   return {
      forwards: {
         old: { name: "flipOut", duration, easing },
         new: { name: "flipIn", duration, easing },
      },
      backwards: {
         old: { name: "flipIn", duration, easing, direction: "reverse" },
         new: { name: "flipOut", duration, easing, direction: "reverse" },
      },
   };
};

// 7. Проста: горизонтальний слайд (з fade для плавності)
export const horizontalSlide = ({
   duration = "0.7s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "slideOutLeft", duration, easing: "ease-in" },
         new: { name: "slideInRight", duration, easing },
      },
      backwards: {
         old: {
            name: "slideInRight",
            duration,
            easing: "ease-in",
            direction: "reverse",
         },
         new: { name: "slideOutLeft", duration, easing, direction: "reverse" },
      },
   };
};

// 8. Вау: Iris reveal (кругле розкриття, топ-тренд 2025 — cinematic mask)
export const irisReveal = ({
   duration = "1s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "irisClose", duration, easing },
         new: { name: "irisOpen", duration, easing },
      },
      backwards: {
         old: { name: "irisOpen", duration, easing, direction: "reverse" },
         new: { name: "irisClose", duration, easing, direction: "reverse" },
      },
   };
};

// 9. Curtain reveal (штори розсуваються горизонтально — cinematic вау)
export const curtainReveal = ({
   duration = "1.2s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "curtainClose", duration, easing },
         new: { name: "curtainOpen", duration, easing },
      },
      backwards: {
         old: { name: "curtainOpen", duration, easing, direction: "reverse" },
         new: { name: "curtainClose", duration, easing, direction: "reverse" },
      },
   };
};

// 10. Glitch reveal (цифровий збій — futuristic топ 2026)
export const glitchReveal = ({
   duration = "0.8s",
   easing = "steps(4, end)", // Для "піксельного" відчуття
} = {}) => {
   return {
      forwards: {
         old: { name: "glitchOut", duration, easing },
         new: { name: "glitchIn", duration, easing },
      },
      backwards: {
         old: { name: "glitchIn", duration, easing, direction: "reverse" },
         new: { name: "glitchOut", duration, easing, direction: "reverse" },
      },
   };
};

// 11. Потужний 3D: Cube rotate (обертання як куб в глибині — топ 3D ефект)
export const cube3DRotate = ({
   duration = "1.2s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "cubeOut", duration, easing: "ease-in" },
         new: { name: "cubeIn", duration, easing: "ease-out" },
      },
      backwards: {
         old: {
            name: "cubeIn",
            duration,
            easing: "ease-in",
            direction: "reverse",
         },
         new: {
            name: "cubeOut",
            duration,
            easing: "ease-out",
            direction: "reverse",
         },
      },
   };
};

// 12. Магічний 3D: Vortex portal (вихор-портал — прям магія з глибиною і blur)
export const magicVortex = ({
   duration = "1.4s",
   easing = "ease-in-out",
} = {}) => {
   return {
      forwards: {
         old: { name: "vortexOut", duration, easing: "ease-in" },
         new: { name: "vortexIn", duration, easing: "ease-out" },
      },
      backwards: {
         old: {
            name: "vortexIn",
            duration,
            easing: "ease-in",
            direction: "reverse",
         },
         new: {
            name: "vortexOut",
            duration,
            easing: "ease-out",
            direction: "reverse",
         },
      },
   };
};
