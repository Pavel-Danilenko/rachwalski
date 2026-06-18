const MOBILE_BREAKPOINT = 768;

function getColCount() {
   return window.innerWidth > MOBILE_BREAKPOINT ? 2 : 1;
}

function redistributeCards(grid, activeTab, activeCategory) {
   const colCount = getColCount();

   // Спершу збираємо всі картки — до будь-яких змін DOM
   const allCards = [...grid.querySelectorAll("[data-reviews-type]")];

   // Виносимо картки з колонок у корінь grid перед тим як видаляти колонки
   let cols = [...grid.querySelectorAll(":scope > .reviews-grid__col")];
   allCards.forEach((card) => grid.insertBefore(card, cols[0] ?? null));

   // Sync column count in DOM (картки вже витягнуті — видалення колонок безпечне)
   cols = [...grid.querySelectorAll(":scope > .reviews-grid__col")];
   while (cols.length > colCount) {
      grid.removeChild(cols.pop());
      cols = [...grid.querySelectorAll(":scope > .reviews-grid__col")];
   }
   while (cols.length < colCount) {
      const col = document.createElement("div");
      col.className = "reviews-grid__col";
      grid.appendChild(col);
      cols = [...grid.querySelectorAll(":scope > .reviews-grid__col")];
   }

   // Clear columns
   cols.forEach((col) => (col.innerHTML = ""));

   // Distribute — visible to alternating cols, hidden to col[0] (out of sight)
   let visibleIdx = 0;
   allCards.forEach((card) => {
      const matchTab =
         activeTab === "all" || card.dataset.reviewsType === activeTab;
      const matchCat =
         !activeCategory ||
         card.dataset.reviewsCategory === activeCategory;
      const visible = matchTab && matchCat;

      card.hidden = !visible;

      if (visible) {
         cols[visibleIdx % colCount].appendChild(card);
         visibleIdx++;
      } else {
         cols[0].appendChild(card); // hidden, don't affect layout
      }
   });
}

export function initTestimonialsFilter() {
   const grid = document.querySelector("[data-reviews-grid]");
   if (!grid) return;

   if (grid.dataset.testimonialsFilterInit) return;
   grid.dataset.testimonialsFilterInit = "true";

   const filtersEl = document.querySelector("[data-reviews-filters]");

   let activeTab = "all";
   let activeCategory = "";

   // Initial distribution
   redistributeCards(grid, activeTab, activeCategory);

   if (!filtersEl) return;

   // Tab change
   filtersEl.addEventListener("filter:change", (e) => {
      activeTab = e.detail.tab;
      activeCategory = "";

      // Swap select wrappers
      filtersEl.querySelectorAll("[data-reviews-select-wrapper]").forEach((w) => {
         w.hidden = w.dataset.reviewsSelectWrapper !== activeTab;
         // Reset select value
         const sel = w.querySelector(".hidden-select");
         if (sel) sel.value = "";
      });

      redistributeCards(grid, activeTab, activeCategory);
   });

   // Category change
   filtersEl.querySelectorAll(".hidden-select").forEach((sel) => {
      sel.addEventListener("change", () => {
         activeCategory = sel.value;
         redistributeCards(grid, activeTab, activeCategory);
      });
   });

   // Resize — rebalance columns
   let resizeTimer;
   window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(
         () => redistributeCards(grid, activeTab, activeCategory),
         150,
      );
   });

}

document.addEventListener("page:ready", initTestimonialsFilter);
requestAnimationFrame(initTestimonialsFilter);

