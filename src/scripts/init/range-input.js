function buildRangeInput(wrapper) {
   if (wrapper.dataset.initialized) return;
   wrapper.dataset.initialized = "true";

   const input    = wrapper.querySelector(".range-input__input");
   const valueEl  = wrapper.querySelector("[data-range-value]");
   const unit     = wrapper.dataset.unit ?? "";

   const update = () => {
      const min     = parseFloat(input.min) || 0;
      const max     = parseFloat(input.max) || 100;
      const val     = parseFloat(input.value);
      const percent = ((val - min) / (max - min)) * 100;

      wrapper.style.setProperty("--range-fill", `${percent}%`);
      if (valueEl) valueEl.textContent = `${val}${unit}`;
   };

   input.addEventListener("input", update);
   update();
}

function initRangeInputs() {
   document.querySelectorAll("[data-range-input]").forEach(buildRangeInput);
}

initRangeInputs();
document.addEventListener("page:ready", initRangeInputs);
