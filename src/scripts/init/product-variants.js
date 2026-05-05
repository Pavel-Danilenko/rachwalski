import { initFancybox } from "@scripts/init/gallery.js";

/**
 * ProductVariants — вибір варіантів товару
 *
 * Очікує на сторінці:
 * - <div id="product-variants-json" hidden> — масив variants від Shopify
 * - [data-option-name] [data-option-value] — кнопки варіантів (генерує index.ts)
 * - input[name="id"] — прихований input у формі (генерує index.ts)
 * - .product-detail__price[data-money-format] — ціна з форматом магазину
 */

class ProductVariants {
   constructor() {
      const dataEl = document.getElementById("product-variants-json");
      if (!dataEl) return;

      try {
         this.variants = JSON.parse(dataEl.textContent || "[]");
      } catch {
         this.variants = [];
      }

      // Порядок опцій береться з DOM — відповідає порядку в product.options_with_values
      this.optionOrder = [];
      this.selectedOptions = {};
      this.galleryData = this._parseGalleryData();
      this._thumbSlideChangeHandler = null;
      this.init();
   }

   init() {
      const buttons = document.querySelectorAll("[data-option-name]");
      if (!buttons.length) return;

      // Збираємо порядок опцій з DOM (порядок важливий для matchVariant)
      buttons.forEach((btn) => {
         const name = btn.dataset.optionName;
         if (!this.optionOrder.includes(name)) {
            this.optionOrder.push(name);
         }
      });

      // Читаємо початково активні кнопки (Liquid ставить is-active на selected_value)
      buttons.forEach((btn) => {
         if (btn.classList.contains("is-active")) {
            this.selectedOptions[btn.dataset.optionName] = btn.dataset.optionValue;
         }
      });

      // Якщо для якоїсь опції нічого не активно — активуємо першу кнопку
      this.optionOrder.forEach((optionName) => {
         if (!this.selectedOptions[optionName]) {
            const first = document.querySelector(`[data-option-name="${CSS.escape(optionName)}"]`);
            if (first) {
               first.classList.add("is-active");
               this.selectedOptions[optionName] = first.dataset.optionValue;
            }
         }
      });

      buttons.forEach((btn) => {
         btn.addEventListener("click", () => this.handleClick(btn));
      });

      // Ініціалізуємо галерею для початково вибраного варіанту.
      // Чекаємо window.load (Swiper в ProductGallery теж там), потім ще rAF щоб Swiper точно встиг.
      if (this.galleryData?.allImages?.length) {
         const selectedValues = this.optionOrder.map((name) => this.selectedOptions[name]);
         const initialVariant = this.variants.find((v) =>
            v.options.every((opt, i) => opt === selectedValues[i])
         );
         if (initialVariant) {
            const runInitGallery = () => {
               requestAnimationFrame(() => {
                  let attempts = 0;
                  const tryInit = () => {
                     const mainEl = document.querySelector(".product-gallery__main");
                     if (mainEl?.swiper) {
                        try { this._updateGallery(initialVariant); } catch (e) { /* ignore */ }
                     } else if (attempts++ < 20) {
                        setTimeout(tryInit, 50);
                     }
                  };
                  tryInit();
               });
            };
            if (document.readyState === "complete") {
               runInitGallery();
            } else {
               window.addEventListener("load", runInitGallery, { once: true });
            }
         }
      }
   }

   handleClick(btn) {
      const name = btn.dataset.optionName;
      const value = btn.dataset.optionValue;

      // Знімаємо is-active з усіх кнопок цієї опції
      document.querySelectorAll(`[data-option-name="${CSS.escape(name)}"]`).forEach((b) => {
         b.classList.remove("is-active");
      });
      btn.classList.add("is-active");

      this.selectedOptions[name] = value;
      this.updateVariant();
   }

   updateVariant() {
      if (!this.variants.length) return;

      // Значення в порядку опцій з DOM — відповідає v.options в Shopify
      const selectedValues = this.optionOrder.map((name) => this.selectedOptions[name]);

      const variant = this.variants.find((v) =>
         v.options.every((opt, i) => opt === selectedValues[i])
      );

      if (!variant) return;

      // Оновлюємо URL без перезавантаження (стандарт Shopify)
      const url = new URL(window.location.href);
      url.searchParams.set("variant", variant.id);
      history.replaceState({ variantId: variant.id }, "", url.toString());

      // Перемикаємо галерею для варіанту
      try {
         if (this.galleryData?.allImages?.length) {
            this._updateGallery(variant);
         } else if (variant.featured_image) {
            const imageId = String(variant.featured_image.id);
            const mainEl = document.querySelector(".product-gallery__main");
            if (mainEl) {
               const slides = mainEl.querySelectorAll("[data-image-id]");
               slides.forEach((slide, index) => {
                  if (slide.dataset.imageId === imageId) {
                     const swiper = mainEl.swiper;
                     if (swiper) swiper.slideTo(index);
                  }
               });
            }
         }
      } catch (e) {
         console.warn("[ProductVariants] gallery update error:", e);
      }

      // Читаємо формат грошей з data-атрибуту (встановлює index.ts: {{ shop.money_format }})
      const priceEl = document.querySelector(".product-page__price-current, .product-detail__price");
      const moneyFormat = priceEl?.dataset.moneyFormat || null;

      // Оновлюємо ціну
      if (priceEl && variant.price != null) {
         priceEl.textContent = this.formatMoney(variant.price, moneyFormat);
      }

      // Оновлюємо стару ціну
      const comparePriceEl = document.querySelector(".product-page__price-old, .product-detail__price-old");
      if (comparePriceEl) {
         if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            comparePriceEl.textContent = this.formatMoney(variant.compare_at_price, moneyFormat);
            comparePriceEl.style.display = "";
         } else {
            comparePriceEl.style.display = "none";
         }
      }

      // Оновлюємо бейдж знижки
      const discountEl = document.querySelector(".product-detail__discount");
      if (discountEl) {
         if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            const pct = Math.round((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
            discountEl.textContent = `-${pct}%`;
         } else {
            discountEl.textContent = "";
         }
      }

      // Оновлюємо SKU
      const skuEl = document.querySelector("[data-product-sku]");
      if (skuEl) {
         skuEl.textContent = variant.sku || "";
         const skuWrap = skuEl.closest(".product-detail__sku");
         if (skuWrap) skuWrap.style.display = variant.sku ? "" : "none";
      }

      // Оновлюємо заголовок: "iPhone 17 Pro Max — Black / 256GB"
      const titleEl = document.querySelector("[data-base-title]");
      if (titleEl) {
         const baseTitle = titleEl.dataset.baseTitle;
         const variantTitle = variant.title;
         titleEl.textContent = variantTitle && variantTitle !== "Default Title"
            ? `${baseTitle} — ${variantTitle}`
            : baseTitle;
      }

      // Оновлюємо кнопку Add to Cart / Sold out
      const submitBtn = document.querySelector("[type='submit']");
      if (submitBtn) {
         if (variant.available) {
            submitBtn.classList.remove("is-sold-out");
            submitBtn.disabled = false;
         } else {
            submitBtn.classList.add("is-sold-out");
            submitBtn.disabled = true;
         }
      }
   }

   _parseGalleryData() {
      const el = document.getElementById("product-gallery-data");
      if (!el) return null;
      try {
         return JSON.parse(el.textContent || "{}");
      } catch {
         return null;
      }
   }

   _updateGallery(variant) {
      const data = this.galleryData;
      const variantId = String(variant.id);
      const entry = (data.variantGalleries ?? []).find((v) => v.id === variantId);
      const images = (entry?.images != null ? entry.images : data.allImages) ?? [];

      const galleryRoot = document.querySelector(".product-gallery");
      if (!galleryRoot || !images.length) return;

      // Dispatch event — ProductGallery.astro handles rebuild in its own scope
      // (has access to thumbsSwiper reference, syncThumbSize, etc.)
      galleryRoot.dispatchEvent(new CustomEvent("gallery:update", { detail: { images } }));

      if (galleryRoot.dataset.galleryFancybox === "true") {
         initFancybox();
      }
   }

   /**
    * Форматує ціну в центах за форматом Shopify (shop.money_format)
    * Shopify формат: "₴{{amount}}", "${{amount}}", "{{amount}} грн" і т.д.
    * Якщо формат не переданий — просто ділить на 100
    */
   formatMoney(cents, format) {
      const raw = (cents / 100).toFixed(2);
      // {{amount}} — з роздільником тисяч як у Shopify: 1,200.00
      const amount = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const amountNoDecimals = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const amountWithComma = raw.replace(".", ",");
      const amountNoDecimalsWithComma = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      if (!format) return amount;

      return format
         .replace("{{amount}}", amount)
         .replace("{{amount_no_decimals}}", amountNoDecimals)
         .replace("{{amount_with_comma_separator}}", amountWithComma)
         .replace("{{amount_no_decimals_with_comma_separator}}", amountNoDecimalsWithComma);
   }
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => new ProductVariants());
} else {
   new ProductVariants();
}

document.addEventListener("astro:page-load", () => new ProductVariants());

export default ProductVariants;
