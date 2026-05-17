/**
 * Marquee Script - з підтримкою Astro View Transitions
 * З підтримкою responsive speed та space
 */

class MarqueeManager {
   constructor() {
      this.instances = new Map();
      this.styles = new Set();
   }

   init() {
      const marquees = document.querySelectorAll("[data-marquee]");
      marquees.forEach((wrapper) => {
         if (!this.instances.has(wrapper)) {
            this.createMarquee(wrapper);
         }
      });
   }

   destroy() {
      this.instances.forEach((instance) => instance.cleanup());
      this.instances.clear();
      this.styles.forEach((style) => style.remove());
      this.styles.clear();
   }

   // Повертає правильне значення speed/space залежно від ширини екрану
   getResponsiveValue(wrapper, attr) {
      const w = window.innerWidth;
      if (w < 768) {
         return (
            parseFloat(wrapper.dataset[`${attr}Mobile`]) ||
            parseFloat(wrapper.dataset[attr])
         );
      } else if (w < 1199) {
         return (
            parseFloat(wrapper.dataset[`${attr}Tablet`]) ||
            parseFloat(wrapper.dataset[attr])
         );
      }
      return parseFloat(wrapper.dataset[attr]);
   }

   createMarquee(wrapper) {
      const dataMarqueeSpace = this.getResponsiveValue(wrapper, "marqueeSpace");
      const direction = wrapper.dataset.marqueeDirection || "left";
      // pauseOnHover: перевіряємо і "true" і наявність порожнього атрибуту
      const pauseOnHover = wrapper.dataset.marqueePause === "true" || wrapper.hasAttribute("data-marquee-pause");
      let startPosition = parseFloat(wrapper.dataset.marqueeStart) || 0;
      const minWidth = parseInt(wrapper.dataset.marqueeMinWidth || "0");
      const maxWidth = parseInt(wrapper.dataset.marqueeMaxWidth || "999999");

      const isVertical = direction === "bottom" || direction === "top";

      const checkBreakpoint = () => {
         const width = window.innerWidth;
         return width >= minWidth && width <= maxWidth;
      };

      if (!checkBreakpoint()) {
         wrapper.style.display = "none";
         return;
      }

      wrapper.style.display = "";

      const items = Array.from(wrapper.children);
      if (!items.length) return;

      items.forEach((item) => item.setAttribute("data-marquee-item", ""));

      const inner = document.createElement("div");
      inner.setAttribute("data-marquee-inner", "");
      inner.innerHTML = wrapper.innerHTML;
      wrapper.innerHTML = "";
      wrapper.appendChild(inner);

      let cacheArray = [];
      const animName = `marquee-${Math.floor(Math.random() * 10000000)}`;

      const $items = wrapper.querySelectorAll("[data-marquee-item]");
      let spaceBetweenItem = parseFloat(
         window.getComputedStyle($items[0])?.getPropertyValue("margin-right"),
      );
      // Використовуємо dataMarqueeSpace навіть якщо 0 — це валідне значення
      let spaceBetween = spaceBetweenItem
         ? spaceBetweenItem
         : !isNaN(dataMarqueeSpace)
           ? dataMarqueeSpace
           : 30;

      let sumSize = 0;
      let firstScreenVisibleSize = 0;
      let initialSizeElements = 0;
      let initialElementsLength = inner.children.length;
      let index = 0;
      let counterDuplicateElements = 0;

      const getElSize = (el) => {
         return isVertical ? el.offsetHeight : el.offsetWidth;
      };

      const setBaseStyles = (firstScreenVisibleSize) => {
         let baseStyle = "display: flex; flex-wrap: nowrap;";

         if (isVertical) {
            baseStyle += `
               flex-direction: column;
               position: relative;
               will-change: transform;`;
            if (direction === "bottom") {
               baseStyle += `top: -${firstScreenVisibleSize}px;`;
            }
         } else {
            baseStyle += `
               position: relative;
               will-change: transform;`;
            if (direction === "right") {
               baseStyle += `inset-inline-start: -${firstScreenVisibleSize}px;`;
            }
         }

         inner.style.cssText = baseStyle;
      };

      const setDirectionAnim = (totalWidth) => {
         switch (direction) {
            case "right":
            case "bottom":
               return totalWidth;
            default:
               return -totalWidth;
         }
      };

      const animation = () => {
         // Беремо актуальний speed для поточного breakpoint
         const speed =
            this.getResponsiveValue(wrapper, "marqueeSpeed") / 10 || 100;

         const keyFrameCss = `@keyframes ${animName} {
            0% {
               transform: translate${isVertical ? "Y" : "X"}(${startPosition}%);
            }
            100% {
               transform: translate${isVertical ? "Y" : "X"}(${setDirectionAnim(firstScreenVisibleSize)}px);
            }
         }`;

         const style = document.createElement("style");
         style.classList.add(animName);
         style.textContent = keyFrameCss;
         document.head.appendChild(style);
         this.styles.add(style);

         inner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed}s infinite linear`;
      };

      const addDuplicateElements = () => {
         sumSize =
            firstScreenVisibleSize =
            initialSizeElements =
            counterDuplicateElements =
            index =
               0;

         // Оновлюємо space для поточного breakpoint — 0 це валідне значення
         const currentSpace = this.getResponsiveValue(wrapper, "marqueeSpace");
         spaceBetween = !isNaN(currentSpace) ? currentSpace : 30;

         const parentNodeWidth = getElSize(wrapper);
         let childrenEl = Array.from(inner.children);

         if (!childrenEl.length) return;

         if (!cacheArray.length) {
            cacheArray = childrenEl.map((item) => item.cloneNode(true));
         } else {
            childrenEl = [...cacheArray];
         }

         inner.style.display = "flex";
         if (isVertical) inner.style.flexDirection = "column";
         inner.innerHTML = "";

         childrenEl.forEach((item) => {
            const clone = item.cloneNode(true);

            if (isVertical) {
               clone.style.marginBottom = `${spaceBetween}px`;
            } else {
               clone.style.marginRight = `${spaceBetween}px`;
               clone.style.flexShrink = 0;
            }

            inner.append(clone);

            const sizeEl = getElSize(clone);
            sumSize += sizeEl + spaceBetween;
            firstScreenVisibleSize += sizeEl + spaceBetween;
            initialSizeElements += sizeEl + spaceBetween;
            counterDuplicateElements += 1;
         });

         const multiplyWidth = parentNodeWidth * 2 + initialSizeElements;

         for (; sumSize < multiplyWidth; index += 1) {
            if (!childrenEl[index]) index = 0;

            const cloneNode = childrenEl[index].cloneNode(true);

            if (isVertical) {
               cloneNode.style.marginBottom = `${spaceBetween}px`;
            } else {
               cloneNode.style.marginRight = `${spaceBetween}px`;
               cloneNode.style.flexShrink = 0;
            }

            inner.append(cloneNode);

            const existingElement = inner.children[index];
            sumSize += getElSize(existingElement) + spaceBetween;

            if (
               firstScreenVisibleSize < parentNodeWidth ||
               counterDuplicateElements % initialElementsLength !== 0
            ) {
               counterDuplicateElements += 1;
               firstScreenVisibleSize +=
                  getElSize(existingElement) + spaceBetween;
            }
         }

         setBaseStyles(firstScreenVisibleSize);
      };

      const correctSpaceBetween = () => {
         if (spaceBetweenItem) {
            $items.forEach((item) => item.style.removeProperty("margin-right"));
            spaceBetweenItem = parseFloat(
               window
                  .getComputedStyle($items[0])
                  .getPropertyValue("margin-right"),
            );
            const currentSpace = this.getResponsiveValue(
               wrapper,
               "marqueeSpace",
            );
            spaceBetween = spaceBetweenItem
               ? spaceBetweenItem
               : !isNaN(currentSpace)
                 ? currentSpace
                 : 30;
         }
      };

      const init = () => {
         correctSpaceBetween();
         addDuplicateElements();
         animation();
         initEvents();
      };

      const onResize = () => {
         document.head.querySelector(`.${animName}`)?.remove();
         init();
      };

      const onChangePaused = (e) => {
         const { type, target } = e;
         target.style.animationPlayState =
            type === "mouseenter" ? "paused" : "running";
      };

      const onChangeStartPosition = () => {
         startPosition = 0;
         inner.removeEventListener("animationiteration", onChangeStartPosition);
         onResize();
      };

      const initEvents = () => {
         if (startPosition) {
            inner.addEventListener("animationiteration", onChangeStartPosition);
         }
         if (pauseOnHover) {
            inner.removeEventListener("mouseenter", onChangePaused);
            inner.removeEventListener("mouseleave", onChangePaused);
            inner.addEventListener("mouseenter", onChangePaused);
            inner.addEventListener("mouseleave", onChangePaused);
         }
      };

      let prevWidth = window.innerWidth;
      let resizeTimeout;

      const handleResize = () => {
         clearTimeout(resizeTimeout);
         resizeTimeout = setTimeout(() => {
            const currentWidth = window.innerWidth;
            if (prevWidth !== currentWidth) {
               prevWidth = currentWidth;
               const isInRange =
                  currentWidth >= minWidth && currentWidth <= maxWidth;
               if (!isInRange) {
                  wrapper.style.display = "none";
                  cleanup();
               } else {
                  wrapper.style.display = "";
                  onResize();
               }
            }
         }, 50);
      };

      window.addEventListener("resize", handleResize);

      const cleanup = () => {
         inner.removeEventListener("mouseenter", onChangePaused);
         inner.removeEventListener("mouseleave", onChangePaused);
         inner.removeEventListener("animationiteration", onChangeStartPosition);
         window.removeEventListener("resize", handleResize);
         const style = document.head.querySelector(`.${animName}`);
         if (style) {
            style.remove();
            this.styles.delete(style);
         }
      };

      init();
      this.instances.set(wrapper, { wrapper, inner, cleanup, onResize });
   }
}

let manager = null;

function initMarquee() {
   if (!manager) {
      manager = new MarqueeManager();
   }
   manager.init();
}

function destroyMarquee() {
   manager?.destroy();
   manager = null;
}

if (typeof document !== "undefined") {
   document.addEventListener("page:ready", initMarquee);
   document.addEventListener("page:leave", destroyMarquee);
}

export { initMarquee, destroyMarquee };
