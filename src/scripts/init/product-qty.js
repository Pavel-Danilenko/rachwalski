/**
 * ProductQty — керування кількістю товару
 *
 * Атрибути:
 * - data-qty-minus  — кнопка зменшення
 * - data-qty-plus   — кнопка збільшення
 *
 * Шукає найближчий input[name="quantity"] всередині спільного батька.
 */

class ProductQty {
   constructor() {
      this.init();
   }

   init() {
      document.querySelectorAll("[data-qty-minus], [data-qty-plus]").forEach((btn) => {
         btn.addEventListener("click", (e) => this.handleClick(e));
      });
   }

   handleClick(e) {
      const btn = e.currentTarget;
      const wrap = btn.closest(".product-detail__qty");
      if (!wrap) return;

      const input = wrap.querySelector("input[name='quantity']");
      if (!input) return;

      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || Infinity;
      let value = parseInt(input.value) || 1;

      if (btn.hasAttribute("data-qty-plus")) {
         value = Math.min(value + 1, max);
      } else {
         value = Math.max(value - 1, min);
      }

      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
   }
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => new ProductQty());
} else {
   new ProductQty();
}

document.addEventListener("astro:page-load", () => new ProductQty());

export default ProductQty;
