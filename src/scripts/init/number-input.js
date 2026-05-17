function buildNumberInput(wrapper) {
   if (wrapper.dataset.initialized) return;
   wrapper.dataset.initialized = "true";

   const input   = wrapper.querySelector(".number-input__field");
   const btnMinus = wrapper.querySelector(".number-input__btn--minus");
   const btnPlus  = wrapper.querySelector(".number-input__btn--plus");

   const min  = input.min !== "" ? parseFloat(input.min) : -Infinity;
   const max  = input.max !== "" ? parseFloat(input.max) : Infinity;
   const step = parseFloat(input.step) || 1;

   const round = (val) => Math.round(val / step) * step;

   const updateButtons = (val) => {
      if (btnMinus) btnMinus.disabled = input.disabled || val <= min;
      if (btnPlus)  btnPlus.disabled  = input.disabled || val >= max;
   };

   // Захист від рекурсії: setValue диспатчить change → change listener викликає setValue
   let setting = false;

   const setValue = (val) => {
      if (setting) return;
      setting = true;
      const clamped = Math.min(max, Math.max(min, round(val)));
      input.value = clamped;
      updateButtons(clamped);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      setting = false;
   };

   // Ініціалізація
   updateButtons(parseFloat(input.value) || 0);

   // Ручне введення
   input.addEventListener("change", () => {
      setValue(parseFloat(input.value) || 0);
   });

   // Блокуємо введення не-числових символів
   input.addEventListener("keydown", (e) => {
      if (["e", "E", "+"].includes(e.key)) e.preventDefault();
   });

   // Довгий клік — повторення (без подвійного спрацювання)
   let holdTimeout = null;
   let interval    = null;
   let isRepeating = false;

   const startRepeat = (btn, fn) => {
      btn.addEventListener("mousedown", () => {
         isRepeating = false;
         holdTimeout = setTimeout(() => {
            isRepeating = true;
            interval = setInterval(fn, 100);
         }, 400);
      });

      // click спрацьовує тільки якщо не було repeat-режиму
      btn.addEventListener("click", () => {
         if (!isRepeating) fn();
      });

      const stop = () => {
         clearTimeout(holdTimeout);
         clearInterval(interval);
         isRepeating = false;
      };

      btn.addEventListener("mouseup",    stop);
      btn.addEventListener("mouseleave", stop);
   };

   if (btnMinus) startRepeat(btnMinus, () => setValue((parseFloat(input.value) || 0) - step));
   if (btnPlus)  startRepeat(btnPlus,  () => setValue((parseFloat(input.value) || 0) + step));
}

function initNumberInputs() {
   document.querySelectorAll("[data-number-input]").forEach(buildNumberInput);
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initNumberInputs);
} else {
   initNumberInputs();
}
document.addEventListener("page:ready", initNumberInputs);
