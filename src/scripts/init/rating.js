function buildRating(wrapper) {
   if (wrapper.dataset.initialized) return;
   wrapper.dataset.initialized = "true";

   const max      = parseInt(wrapper.dataset.max ?? "5");
   const disabled = wrapper.dataset.disabled === "true";
   const icons    = wrapper.querySelectorAll(".rating__icon");
   const inputs   = wrapper.querySelectorAll(".rating__input");
   const label    = wrapper.querySelector("[data-rating-label]");

   if (disabled) return;

   const getChecked = () => {
      const checked = wrapper.querySelector(".rating__input:checked");
      return checked ? parseInt(checked.value) : 0;
   };

   const highlight = (val) => {
      icons.forEach((icon) => {
         const iconVal = parseInt(icon.dataset.val);
         icon.classList.toggle("is-filled",  iconVal <= val);
         icon.classList.toggle("is-hovered", iconVal <= val);
      });
   };

   const reset = () => {
      const current = getChecked();
      icons.forEach((icon) => {
         const iconVal = parseInt(icon.dataset.val);
         icon.classList.remove("is-hovered");
         icon.classList.toggle("is-filled", iconVal <= current);
      });
   };

   const updateLabel = (val) => {
      if (!label) return;
      const labels = wrapper.querySelectorAll(".rating__item-label");
      label.textContent = val > 0 && labels[val - 1]
         ? labels[val - 1].textContent
         : "";
   };

   // Ініціалізація початкового стану
   reset();
   updateLabel(getChecked());

   // Hover на іконці
   icons.forEach((icon) => {
      const item = icon.closest(".rating__item");

      item.addEventListener("mouseenter", () => {
         highlight(parseInt(icon.dataset.val));
      });

      item.addEventListener("mouseleave", reset);
   });

   // Вибір значення
   inputs.forEach((input) => {
      input.addEventListener("change", () => {
         reset();
         updateLabel(parseInt(input.value));
         wrapper.classList.add("is-rated");
      });
   });
}

function initRatings() {
   document.querySelectorAll("[data-rating]").forEach(buildRating);
}

initRatings();
document.addEventListener("page:ready", initRatings);
