// blog-filter.js — фільтрація постів блогу за категорією
// Слухає зміни на [data-blog-filter] (CustomSelect wrapper).
// Використовує data-filter-excluded — окремо від data-search-excluded,
// тому пошук і фільтр працюють разом незалежно.

export const selector = "[data-blog-filter]";

function initBlogFilter() {
   const wrapper = document.querySelector(selector);
   if (!wrapper) return;
   if (wrapper.dataset.blogFilterInit) return;
   wrapper.dataset.blogFilterInit = "true";

   // CustomSelect рендерить нативний <select> всередині wrapper
   const select = wrapper.querySelector("select");
   if (!select) return;

   const paginationRoot = document.querySelector("[data-pagination-root]");

   function applyFilter(category) {
      document.querySelectorAll(".post-card").forEach((card) => {
         if (!category) {
            // "All" — знімаємо фільтр
            card.removeAttribute("data-filter-excluded");
            return;
         }

         const cardCategory = card
            .querySelector(".post-card__category")
            ?.textContent?.trim()
            .toLowerCase();

         if (cardCategory === category.toLowerCase()) {
            card.removeAttribute("data-filter-excluded");
         } else {
            card.setAttribute("data-filter-excluded", "");
         }
      });

      paginationRoot?.dispatchEvent(new CustomEvent("pagination:filter"));
   }

   select.addEventListener("change", () => applyFilter(select.value));
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initBlogFilter);
} else {
   initBlogFilter();
}

document.addEventListener("page:ready", initBlogFilter);
