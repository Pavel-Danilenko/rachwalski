/**
 * CollectionFilter — фільтр варіантів на сторінці колекції
 *
 * data-атрибути карток (з Liquid):
 *   data-product   = {{ product.handle }}
 *   data-option1   = {{ variant.option1 | handleize }}
 *   data-option2   = {{ variant.option2 | handleize }}
 *   data-price     = {{ variant.price }}  (в центах: 99900 = $999.00)
 *
 * data-атрибути root [data-collection-page]:
 *   data-label-product   = "Model"
 *   data-label-option1   = "Color"       ← з Shopify product.options
 *   data-label-option2   = "Memory"
 *   data-filter-accordion = "true"|"false"  ← accordion на desktop
 *
 * data-атрибути [data-filter-root]:
 *   data-label-filter = "Filters"        ← заголовок фільтра
 *   data-label-price  = "Price"          ← назва цінового слайдера
 *   data-label-reset  = "Clear filters"  ← кнопка скидання
 */

// ── SVG icons ─────────────────────────────────────────────────────────────────

const ICON_FILTER = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
   stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
   <line x1="4" y1="6" x2="20" y2="6"/>
   <circle cx="8" cy="6" r="2.2" fill="currentColor" stroke="none"/>
   <line x1="4" y1="12" x2="20" y2="12"/>
   <circle cx="16" cy="12" r="2.2" fill="currentColor" stroke="none"/>
   <line x1="4" y1="18" x2="20" y2="18"/>
   <circle cx="11" cy="18" r="2.2" fill="currentColor" stroke="none"/>
</svg>`;

const ICON_CHEVRON = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none"
   stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
   <path d="M1 1.5l5 5 5-5"/>
</svg>`;

// ── CollectionFilter ──────────────────────────────────────────────────────────

class CollectionFilter {
   /** @param {HTMLElement} root */
   constructor(root) {
      this.root = root;
      this.filterRoot = null;
      this.active = {};
      this.priceMin = null;
      this.priceMax = null;
      this.allPriceMin = 0;
      this.allPriceMax = 0;
      this.originalSelector = null;

      // Labels (i18n — від Shopify settings, не захардкоджені в JS)
      this.labelFilter = "";
      this.labelPrice = "";
      this.labelReset = "";
      this.labelPriceFrom = "";
      this.labelPriceTo = "";

      // Price filter type: "range" | "inputs" | "both"
      this.priceFilterType = "range";

      // Filter position per breakpoint
      this.filterPositionDesktop = "top";
      this.filterPositionTablet  = "top";
      this.filterPositionMobile  = "top";

      // Chips & empty state
      this.showChips = true;
      this.labelEmpty = "No products found";

      // Accordion
      this.accordionDesktop = false;
      this.filterNested = false;
      this._resizeTimer = null;

      // Sort
      this.showSort = true;
      this.currentSort = "default";
      this.originalOrder = [];

      this.init();
   }

   init() {
      const filterRoot = this.root.querySelector("[data-filter-root]");
      if (!filterRoot) return;
      this.filterRoot = filterRoot;

      this.cards = [...this.root.querySelectorAll(".collection-card[data-option1]")];
      if (!this.cards.length) return;

      const paginationRoot = this.root.querySelector("[data-pagination-root]");
      if (paginationRoot) this.originalSelector = paginationRoot.dataset.itemSelector;

      // Читаємо лейбли з data-атрибутів (Shopify settings → Liquid → data-*)
      this.labelFilter    = filterRoot.dataset.labelFilter    || "";
      this.labelPrice     = filterRoot.dataset.labelPrice     || "";
      this.labelReset     = filterRoot.dataset.labelReset     || "";
      this.labelPriceFrom = filterRoot.dataset.labelPriceFrom || "";
      this.labelPriceTo   = filterRoot.dataset.labelPriceTo   || "";

      // Price filter type: "range" | "inputs" | "both"
      this.priceFilterType = filterRoot.dataset.priceFilterType || "range";

      // Chips & empty state
      this.showChips  = filterRoot.dataset.showChips !== "false";
      this.labelEmpty = filterRoot.dataset.labelEmpty || "No products found";

      // Nested mode — моделі всередині категорій
      this.filterNested = this.root.dataset.filterNested === "true";

      // Accordion on desktop
      this.accordionDesktop = this.root.dataset.filterAccordion === "true";

      // Sort
      this.showSort = this.root.dataset.showSort !== "false";
      this.originalOrder = [...this.cards];

      // Filter position per breakpoint (JS dynamically sets data-filter-position)
      this.filterPositionDesktop = this.root.dataset.filterPositionDesktop || "top";
      this.filterPositionTablet  = this.root.dataset.filterPositionTablet  || "top";
      this.filterPositionMobile  = this.root.dataset.filterPositionMobile  || "top";
      this._updateFilterPosition();

      // Ціновий діапазон — мінімум завжди 0 (щоб фільтр починався з нуля)
      const prices = this.cards
         .map((c) => parseInt(c.dataset.price ?? "0", 10))
         .filter((p) => p > 0);

      if (prices.length) {
         this.allPriceMin = 0;
         this.allPriceMax = Math.max(...prices);
         this.priceMin = 0;
         this.priceMax = this.allPriceMax;
      }

      this.buildFilterUI(filterRoot);
      this._createEmptyState();

      // ── Sort bar (статичний CustomSelect у HTML) ───────────────────────────
      const sortWrapper = this.root.querySelector("[data-sort-select]");
      if (sortWrapper) {
         if (!this.showSort) {
            sortWrapper.querySelector(".collection__sort-label")?.remove();
            sortWrapper.querySelector(".custom-select-wrapper")?.remove();
         } else {
            const hiddenSelect = sortWrapper.querySelector(".hidden-select");
            if (hiddenSelect) {
               hiddenSelect.addEventListener("change", () => {
                  this.currentSort = hiddenSelect.value || "default";
                  this._applySortAndFilter();
               });
            }
         }
      }

      // ── View toggle ────────────────────────────────────────────────────────
      this.showViewToggle = this.root.dataset.showViewToggle !== "false";
      const viewToggle = this.root.querySelector("[data-view-toggle]");
      if (viewToggle) {
         if (!this.showViewToggle) {
            viewToggle.hidden = true;
         } else {
            const grid = this.root.querySelector(".collection__grid");
            const savedView = localStorage.getItem("collection-view") || "grid";
            this._applyView(savedView, viewToggle, grid);

            viewToggle.addEventListener("click", (e) => {
               const btn = e.target.closest("[data-view]");
               if (!btn) return;
               const view = btn.dataset.view;
               this._applyView(view, viewToggle, grid);
               localStorage.setItem("collection-view", view);
            });
         }
      }

      // ── Result count (початкове значення) ─────────────────────────────────
      this._updateResultCount();

      filterRoot.addEventListener("click", (e) => {
         const btn = e.target.closest("[data-filter-btn]");
         if (btn) this.handleClick(btn);

         // Nested: категорія — тільки accordion toggle, не фільтр
         const catToggle = e.target.closest("[data-nested-toggle]");
         if (catToggle) this._toggleNestedCat(catToggle);

         if (e.target.closest("[data-filter-reset]")) this.reset();

         // Chip remove
         const chip = e.target.closest("[data-chip-option]");
         if (chip) this._handleChipRemove(chip);
      });

      // Resize handler для accordion
      window.addEventListener("resize", () => {
         clearTimeout(this._resizeTimer);
         this._resizeTimer = setTimeout(() => this._handleResize(), 200);
      });
   }

   // ── Збираємо унікальні значення опцій ────────────────────────────────────

   collectGroups() {
      const keys = ["type", "product", "option1", "option2", "option3"];
      const groups = {};
      for (const key of keys) {
         groups[key] = new Set();
         for (const card of this.cards) {
            const val = card.dataset[key];
            if (val) groups[key].add(val);
         }
         if (groups[key].size < 2) delete groups[key];
      }
      return groups;
   }

   getGroupLabel(option) {
      const d = this.root.dataset;
      return {
         type:    d.labelType    || "Category",
         product: d.labelProduct || "Model",
         option1: d.labelOption1 || "Option 1",
         option2: d.labelOption2 || "Option 2",
         option3: d.labelOption3 || "Option 3",
      }[option] ?? option;
   }

   countForValue(option, value) {
      return this.cards.filter((c) => c.dataset[option] === value).length;
   }

   // ── Будуємо UI фільтра ────────────────────────────────────────────────────

   buildFilterUI(filterRoot) {
      const groups = this.collectGroups();
      filterRoot.innerHTML = "";

      // ── Заголовок фільтра з іконкою (+ chevron для мобільного toggle) ─────
      const body = document.createElement("div");
      body.className = "filter__body";
      const bodyInner = document.createElement("div");
      bodyInner.className = "filter__body-inner";
      body.appendChild(bodyInner);

      if (this.labelFilter) {
         const heading = document.createElement("div");
         heading.className = "filter__heading";

         const textWrap = document.createElement("span");
         textWrap.className = "filter__heading-text-wrap";

         const text = document.createElement("span");
         text.className = "filter__heading-text";
         text.textContent = this.labelFilter;

         // Badge — shows count of active filters (hidden by default)
         const badge = document.createElement("span");
         badge.className = "filter__heading-badge";
         badge.dataset.filterBadge = "";
         badge.hidden = true;

         textWrap.appendChild(text);
         textWrap.appendChild(badge);

         const icon = document.createElement("span");
         icon.className = "filter__heading-icon";
         icon.innerHTML = ICON_FILTER;

         // Chevron — видимий тільки на мобілі, ховається/вмикається через CSS
         const chevron = document.createElement("span");
         chevron.className = "filter__heading-chevron";
         chevron.innerHTML = ICON_CHEVRON;

         heading.appendChild(textWrap);
         heading.appendChild(icon);
         heading.appendChild(chevron);
         filterRoot.appendChild(heading);

         // Mobile toggle: натискання на heading відкриває/закриває весь фільтр
         heading.addEventListener("click", () => {
            if (window.innerWidth > 767) return;
            const isOpen = body.classList.contains("filter__body--open");
            body.classList.toggle("filter__body--open", !isOpen);
            filterRoot.classList.toggle("filter--body-open", !isOpen);
         });
      }

      // Chips container (active filter tags)
      if (this.showChips) {
         const chips = document.createElement("div");
         chips.className = "filter__chips";
         chips.dataset.filterChips = "";
         chips.hidden = true;
         filterRoot.appendChild(chips);
      }

      // ── Групи опцій (всі — в body) ────────────────────────────────────────
      for (const [option, values] of Object.entries(groups)) {
         // Nested mode: "type" → будуємо з вкладеними моделями; "product" → пропускаємо
         if (this.filterNested && option === "product") continue;

         if (this.filterNested && option === "type") {
            bodyInner.appendChild(this._buildNestedTypeGroup(values));
            continue;
         }

         bodyInner.appendChild(this._buildOptionGroup(option, values));
      }

      // ── Price range ────────────────────────────────────────────────────────
      if (this.allPriceMax > this.allPriceMin) {
         bodyInner.appendChild(this.buildPriceRange());
      }

      // ── Reset ──────────────────────────────────────────────────────────────
      if (bodyInner.querySelectorAll(".filter__group").length) {
         const reset = document.createElement("button");
         reset.type = "button";
         reset.className = "filter__reset";
         reset.dataset.filterReset = "";
         reset.textContent = this.labelReset;
         reset.hidden = true;
         bodyInner.appendChild(reset);
      }

      filterRoot.appendChild(body);

      // ── Ініціалізуємо accordion ────────────────────────────────────────────
      this._initAccordions();
   }

   _getSortedCards() {
      const sorted = [...this.cards];
      switch (this.currentSort) {
         case "price-asc":
            return sorted.sort((a, b) => parseInt(a.dataset.price || 0) - parseInt(b.dataset.price || 0));
         case "price-desc":
            return sorted.sort((a, b) => parseInt(b.dataset.price || 0) - parseInt(a.dataset.price || 0));
         case "name-asc":
            return sorted.sort((a, b) => (a.dataset.title || "").localeCompare(b.dataset.title || ""));
         case "name-desc":
            return sorted.sort((a, b) => (b.dataset.title || "").localeCompare(a.dataset.title || ""));
         default:
            return sorted.sort((a, b) => this.originalOrder.indexOf(a) - this.originalOrder.indexOf(b));
      }
   }

   _applySortAndFilter() {
      const grid = this.root.querySelector(".collection__grid");
      if (!grid) return;
      const sorted = this._getSortedCards();
      sorted.forEach(card => grid.appendChild(card));
      this.applyFilter();
   }

   // ── Будівники груп ────────────────────────────────────────────────────────

   /** Звичайна плоска група опцій (color, memory, тощо) */
   _buildOptionGroup(option, values) {
      const group = document.createElement("div");
      group.className = "filter__group";
      group.dataset.filterGroup = option;

      group.appendChild(this._buildGroupLabel(option));

      // filter__group-acc — grid container для анімації (0fr ↔ 1fr)
      const acc = document.createElement("div");
      acc.className = "filter__group-acc";

      // inner — overflow:hidden обгортка (обов'язкова для grid trick)
      const inner = document.createElement("div");
      inner.className = "filter__group-acc-inner";

      const btns = document.createElement("div");
      btns.className = "filter__group-btns";

      for (const value of [...values].sort()) {
         if (!value || value === "false") continue;
         btns.appendChild(this._buildFilterBtn(option, value));
      }

      inner.appendChild(btns);
      acc.appendChild(inner);
      group.appendChild(acc);
      return group;
   }

   /** Повертає label div з chevron */
   _buildGroupLabel(option) {
      const label = document.createElement("div");
      label.className = "filter__group-label";
      label.setAttribute("role", "button");
      label.tabIndex = 0;

      const text = document.createElement("span");
      text.textContent = this.getGroupLabel(option);
      label.appendChild(text);

      const chevron = document.createElement("span");
      chevron.className = "filter__chevron";
      chevron.innerHTML = ICON_CHEVRON;
      label.appendChild(chevron);

      label.addEventListener("keydown", (e) => {
         if (e.key === "Enter" || e.key === " ") { e.preventDefault(); label.click(); }
      });
      return label;
   }

   /** Повертає одну filter__btn кнопку */
   _buildFilterBtn(option, value) {
      const count = this.countForValue(option, value);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter__btn";
      btn.dataset.filterBtn = "";
      btn.dataset.option = option;
      btn.dataset.value = value;

      const lbl = document.createElement("span");
      lbl.textContent = this.formatValue(value);
      const cnt = document.createElement("span");
      cnt.className = "filter__btn-count";
      cnt.textContent = `(${count})`;

      btn.appendChild(lbl);
      btn.appendChild(cnt);
      return btn;
   }

   /**
    * Nested group: кожна категорія — accordion toggle.
    * Моделі всередині — filter buttons.
    */
   _buildNestedTypeGroup(typeValues) {
      const group = document.createElement("div");
      group.className = "filter__group filter__group--nested";
      group.dataset.filterGroup = "type";

      group.appendChild(this._buildGroupLabel("type"));

      // Outer accordion wrapper (grid 0fr/1fr)
      const acc = document.createElement("div");
      acc.className = "filter__group-acc";

      const inner = document.createElement("div");
      inner.className = "filter__group-acc-inner";

      for (const typeVal of [...typeValues].sort()) {
         if (!typeVal || typeVal === "false") continue;

         const typeCount = this.countForValue("type", typeVal);
         const catWrap = document.createElement("div");
         catWrap.className = "filter__nested-cat";
         catWrap.dataset.nestedCat = typeVal;

         // Кнопка категорії — ТІЛЬКИ accordion toggle, не фільтр
         const catBtn = document.createElement("button");
         catBtn.type = "button";
         catBtn.className = "filter__btn filter__btn--cat";
         catBtn.dataset.nestedToggle = typeVal;

         const catLbl = document.createElement("span");
         catLbl.textContent = this.formatValue(typeVal);
         const catCnt = document.createElement("span");
         catCnt.className = "filter__btn-count";
         catCnt.textContent = `(${typeCount})`;
         const catChevron = document.createElement("span");
         catChevron.className = "filter__cat-chevron";
         catChevron.innerHTML = ICON_CHEVRON;

         catBtn.appendChild(catLbl);
         catBtn.appendChild(catCnt);
         catBtn.appendChild(catChevron);
         catWrap.appendChild(catBtn);

         // Моделі: grid accordion (0fr/1fr)
         const modelsAcc = document.createElement("div");
         modelsAcc.className = "filter__nested-models";

         const modelsInner = document.createElement("div"); // overflow:hidden wrapper
         const modelBtns = document.createElement("div");
         modelBtns.className = "filter__group-btns filter__nested-model-btns";

         const modelCards = this.cards.filter((c) => c.dataset.type === typeVal);
         const modelValues = [...new Set(modelCards.map((c) => c.dataset.product).filter(Boolean))].sort();
         modelValues.forEach((modelVal) => modelBtns.appendChild(this._buildFilterBtn("product", modelVal)));

         modelsInner.appendChild(modelBtns);
         modelsAcc.appendChild(modelsInner);
         catWrap.appendChild(modelsAcc);
         inner.appendChild(catWrap);
      }

      acc.appendChild(inner);
      group.appendChild(acc);
      return group;
   }

   // ── Nested accordion helpers ──────────────────────────────────────────────

   _toggleNestedCat(catBtn) {
      const catWrap = catBtn.closest(".filter__nested-cat");
      if (!catWrap) return;
      const modelsAcc = catWrap.querySelector(".filter__nested-models");
      if (!modelsAcc) return;
      const isOpen = catWrap.classList.contains("filter__nested-cat--open");
      catWrap.classList.toggle("filter__nested-cat--open", !isOpen);
      modelsAcc.classList.toggle("filter__nested-models--open", !isOpen);
   }

   _setNestedOpen(catWrap, modelsAcc, isOpen) {
      catWrap.classList.toggle("filter__nested-cat--open", isOpen);
      modelsAcc.classList.toggle("filter__nested-models--open", isOpen);
   }

   // ── Accordion (grid 0fr/1fr) ──────────────────────────────────────────────

   /** Чи активний accordion зараз (desktop setting або мобільний розмір) */
   _isAccordionActive() {
      return this.accordionDesktop || window.innerWidth <= 767;
   }

   _initAccordions() {
      const groups = this.filterRoot.querySelectorAll(
         ".filter__group:not(.filter__group--price)",
      );
      if (!groups.length) return;

      groups.forEach((group) => {
         const labelEl = group.querySelector(".filter__group-label");
         const acc = group.querySelector(".filter__group-acc");
         if (!labelEl || !acc) return;

         if (!labelEl._accHandler) {
            labelEl._accHandler = () => {
               if (!this._isAccordionActive()) return;
               const isOpen = acc.classList.contains("filter__group-acc--open");
               this._setGroupOpen(group, !isOpen);
            };
            labelEl.addEventListener("click", labelEl._accHandler);
         }

         this._applyAccordionState(group);
      });

      this._updateFilterClass();
   }

   _applyAccordionState(group) {
      const acc = group.querySelector(".filter__group-acc");
      if (!acc) return;

      const isActive = this._isAccordionActive();

      if (!isActive) {
         // Не accordion — CSS через filter--accordion-active показує весь контент
         acc.classList.remove("filter__group-acc--open");
         group.removeAttribute("data-acc-open");
      } else {
         if (!group.hasAttribute("data-acc-open")) {
            group.dataset.accOpen = "false";
         }
         const isOpen = group.dataset.accOpen === "true";
         acc.classList.toggle("filter__group-acc--open", isOpen);
      }
   }

   _setGroupOpen(group, isOpen) {
      const acc = group.querySelector(".filter__group-acc");
      if (!acc) return;
      group.dataset.accOpen = isOpen ? "true" : "false";
      acc.classList.toggle("filter__group-acc--open", isOpen);
   }

   /** Grid 0fr/1fr не потребує ручного оновлення висот — CSS сам перераховує */
   _refreshOpenHeights() {}

   _updateFilterClass() {
      this.filterRoot.classList.toggle(
         "filter--accordion-active",
         this._isAccordionActive(),
      );
   }

   /** Встановлює data-filter-position залежно від ширини екрану */
   _updateFilterPosition() {
      const w = window.innerWidth;
      let pos;
      if (w > 1199)     pos = this.filterPositionDesktop;
      else if (w > 959) pos = this.filterPositionTablet;
      else              pos = this.filterPositionMobile;
      this.root.dataset.filterPosition = pos;
   }

   _handleResize() {
      this._updateFilterPosition();

      this.filterRoot
         .querySelectorAll(".filter__group:not(.filter__group--price)")
         .forEach((group) => this._applyAccordionState(group));
      this._updateFilterClass();

      // При переході на desktop — скидаємо мобільний стан body
      if (window.innerWidth > 767) {
         const body = this.filterRoot.querySelector(".filter__body");
         if (body) body.classList.remove("filter__body--open");
         this.filterRoot.classList.remove("filter--body-open");
      }
   }

   // ── Price range / inputs ──────────────────────────────────────────────────

   buildPriceRange() {
      const type = this.priceFilterType; // "range" | "inputs" | "both"

      const group = document.createElement("div");
      group.className = "filter__group filter__group--price";
      group.dataset.filterGroup = "price";

      // Label
      const label = document.createElement("div");
      label.className = "filter__group-label filter__group-label--static";
      const labelText = document.createElement("span");
      labelText.textContent = this.labelPrice;
      label.appendChild(labelText);
      group.appendChild(label);

      // ── Slider section (range | both) ────────────────────────────────────────
      let minSlider = null;
      let maxSlider = null;

      if (type === "range" || type === "both") {
         // Price display (текстові мітки min/max)
         const display = document.createElement("div");
         display.className = "filter__price-display";
         const minLbl = document.createElement("span");
         minLbl.className = "filter__price-val filter__price-val--min";
         minLbl.dataset.priceMin = "";
         minLbl.textContent = this.formatPrice(this.allPriceMin);
         const sep = document.createElement("span");
         sep.textContent = " — ";
         const maxLbl = document.createElement("span");
         maxLbl.className = "filter__price-val filter__price-val--max";
         maxLbl.dataset.priceMax = "";
         maxLbl.textContent = this.formatPrice(this.allPriceMax);
         display.appendChild(minLbl);
         display.appendChild(sep);
         display.appendChild(maxLbl);
         group.appendChild(display);

         // Dual range wrapper
         const rangeWrap = document.createElement("div");
         rangeWrap.className = "filter__price-range";

         const track = document.createElement("div");
         track.className = "filter__price-track";
         const fill = document.createElement("div");
         fill.className = "filter__price-fill";
         fill.dataset.priceFill = "";
         track.appendChild(fill);
         rangeWrap.appendChild(track);

         minSlider = document.createElement("input");
         minSlider.type = "range";
         minSlider.className = "filter__price-input filter__price-input--min";
         minSlider.min = String(this.allPriceMin);
         minSlider.max = String(this.allPriceMax);
         minSlider.value = String(this.allPriceMin);
         minSlider.dataset.priceInput = "min";

         maxSlider = document.createElement("input");
         maxSlider.type = "range";
         maxSlider.className = "filter__price-input filter__price-input--max";
         maxSlider.min = String(this.allPriceMin);
         maxSlider.max = String(this.allPriceMax);
         maxSlider.value = String(this.allPriceMax);
         maxSlider.dataset.priceInput = "max";

         rangeWrap.appendChild(minSlider);
         rangeWrap.appendChild(maxSlider);
         group.appendChild(rangeWrap);
      }

      // ── Text inputs section (inputs | both) ──────────────────────────────────
      let minTextInput = null;
      let maxTextInput = null;

      if (type === "inputs" || type === "both") {
         const inputsWrap = document.createElement("div");
         inputsWrap.className = "filter__price-inputs";

         minTextInput = document.createElement("input");
         minTextInput.type = "number";
         minTextInput.className = "filter__price-text-input filter__price-text-input--from";
         minTextInput.placeholder = this.labelPriceFrom;
         minTextInput.min = "0";
         minTextInput.value = "0";
         minTextInput.dataset.priceTextInput = "min";

         const inputsSep = document.createElement("span");
         inputsSep.className = "filter__price-inputs-sep";
         inputsSep.textContent = "—";

         maxTextInput = document.createElement("input");
         maxTextInput.type = "number";
         maxTextInput.className = "filter__price-text-input filter__price-text-input--to";
         maxTextInput.placeholder = this.labelPriceTo;
         maxTextInput.min = "0";
         maxTextInput.dataset.priceTextInput = "max";

         inputsWrap.appendChild(minTextInput);
         inputsWrap.appendChild(inputsSep);
         inputsWrap.appendChild(maxTextInput);
         group.appendChild(inputsWrap);
      }

      // ── Shared update logic ───────────────────────────────────────────────────
      let _textDebounce = null;

      /** Оновлює slider fill + відображення мінімальної мітки */
      const updateSliderUI = (min, max) => {
         const range = this.allPriceMax - this.allPriceMin;
         const leftPct  = range ? ((min - this.allPriceMin) / range) * 100 : 0;
         const rightPct = range ? ((this.allPriceMax - max) / range) * 100 : 0;
         const fillEl = group.querySelector("[data-price-fill]");
         if (fillEl) { fillEl.style.left = `${leftPct}%`; fillEl.style.right = `${rightPct}%`; }
         const minLbl = group.querySelector("[data-price-min]");
         const maxLbl = group.querySelector("[data-price-max]");
         if (minLbl) minLbl.textContent = this.formatPrice(min);
         if (maxLbl) maxLbl.textContent = this.formatPrice(max);
      };

      /** Нормалізує значення введення з урахуванням меж */
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

      const commitFilter = (min, max) => {
         this.priceMin = min;
         this.priceMax = max;
         this.applyFilter();
      };

      // Slider listeners
      if (minSlider && maxSlider) {
         const onSlider = () => {
            let min = parseInt(minSlider.value, 10);
            let max = parseInt(maxSlider.value, 10);
            if (min > max) { minSlider.value = String(max); min = max; }
            if (max < min) { maxSlider.value = String(min); max = min; }

            updateSliderUI(min, max);
            // Слайдер НЕ оновлює текстові поля — тільки поля оновлюють слайдер
            commitFilter(min, max);
         };
         minSlider.addEventListener("input", onSlider);
         maxSlider.addEventListener("input", onSlider);
      }

      // Text input listeners
      if (minTextInput || maxTextInput) {
         const onTextInput = () => {
            clearTimeout(_textDebounce);
            _textDebounce = setTimeout(() => {
               // Значення в dollars → конвертуємо в cents
               const fromDollars = parseFloat(minTextInput?.value || "");
               const toDollars   = parseFloat(maxTextInput?.value || "");

               let min = isNaN(fromDollars) ? this.allPriceMin : clamp(Math.round(fromDollars * 100), this.allPriceMin, this.allPriceMax);
               let max = isNaN(toDollars)   ? this.allPriceMax : clamp(Math.round(toDollars * 100),   this.allPriceMin, this.allPriceMax);

               if (min > max) max = min;

               // Синхронізуємо слайдер
               if (minSlider) minSlider.value = String(min);
               if (maxSlider) maxSlider.value = String(max);
               updateSliderUI(min, max);

               commitFilter(min, max);
            }, 350);
         };
         if (minTextInput) minTextInput.addEventListener("input", onTextInput);
         if (maxTextInput) maxTextInput.addEventListener("input", onTextInput);
      }

      // Ініціалізуємо відображення одразу при побудові: fill + labels коректні без першого drag
      if (type === "range" || type === "both") {
         updateSliderUI(this.allPriceMin, this.allPriceMax);
      }

      return group;
   }

   // ── Лічильники ────────────────────────────────────────────────────────────

   updateCounts() {
      this.root.querySelectorAll("[data-filter-btn]").forEach((btn) => {
         const { option, value } = btn.dataset;
         const countEl = btn.querySelector(".filter__btn-count");
         if (!countEl) return;

         const count = this.cards.filter((card) => {
            if (card.dataset[option] !== value) return false;
            for (const [ao, av] of Object.entries(this.active)) {
               if (ao === option) continue;
               if (!av.has(card.dataset[ao] ?? "")) return false;
            }
            const price = parseInt(card.dataset.price ?? "0", 10);
            if (price > 0 && (price < this.priceMin || price > this.priceMax)) return false;
            return true;
         }).length;

         countEl.textContent = `(${count})`;
         btn.disabled = count === 0 && !btn.classList.contains("is-active");
      });

      // Оновлюємо висоту відкритих accordion-груп (вміст міг змінитися)
      this._refreshOpenHeights();
   }

   // ── Клік по кнопці ────────────────────────────────────────────────────────

   handleClick(btn) {
      const { option, value } = btn.dataset;
      if (!this.active[option]) this.active[option] = new Set();

      if (this.active[option].has(value)) {
         this.active[option].delete(value);
         btn.classList.remove("is-active");
      } else {
         this.active[option].add(value);
         btn.classList.add("is-active");
      }

      if (!this.active[option].size) delete this.active[option];
      this.applyFilter();
   }

   // ── Застосовуємо фільтр ───────────────────────────────────────────────────

   applyFilter() {
      const hasActive =
         Object.keys(this.active).length > 0 ||
         this.priceMin > this.allPriceMin ||
         this.priceMax < this.allPriceMax;

      const resetBtn = this.root.querySelector("[data-filter-reset]");
      if (resetBtn) resetBtn.hidden = !hasActive;

      for (const card of this.cards) {
         const matches = this.cardMatches(card);
         if (matches) delete card.dataset.filteredOut;
         else card.dataset.filteredOut = "";
      }

      this._updateBadge();
      this.updateChips();
      this.updateCounts();
      this.syncPagination();
   }

   _updateBadge() {
      const badgeEl = this.filterRoot.querySelector("[data-filter-badge]");
      if (!badgeEl) return;
      let count = 0;
      for (const values of Object.values(this.active)) count += values.size;
      if (this.priceMin > this.allPriceMin || this.priceMax < this.allPriceMax) count++;
      badgeEl.textContent = String(count);
      badgeEl.hidden = count === 0;
   }

   updateChips() {
      const chipsEl = this.filterRoot.querySelector("[data-filter-chips]");
      if (!chipsEl) return;
      chipsEl.innerHTML = "";

      for (const [option, values] of Object.entries(this.active)) {
         for (const value of values) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "filter__chip";
            chip.dataset.chipOption = option;
            chip.dataset.chipValue = value;
            const groupLabel = this.getGroupLabel(option);
            chip.innerHTML = `<span>${groupLabel}: ${this.formatValue(value)}</span><span class="filter__chip-remove" aria-hidden="true">&times;</span>`;
            chipsEl.appendChild(chip);
         }
      }

      // Price chip
      if (this.priceMin > this.allPriceMin || this.priceMax < this.allPriceMax) {
         const chip = document.createElement("button");
         chip.type = "button";
         chip.className = "filter__chip filter__chip--price";
         chip.dataset.chipOption = "price";
         chip.innerHTML = `<span>${this.formatPrice(this.priceMin)} — ${this.formatPrice(this.priceMax)}</span><span class="filter__chip-remove" aria-hidden="true">&times;</span>`;
         chipsEl.appendChild(chip);
      }

      chipsEl.hidden = chipsEl.children.length === 0;
   }

   _handleChipRemove(chip) {
      const { chipOption, chipValue } = chip.dataset;
      if (chipOption === "price") {
         this.priceMin = this.allPriceMin;
         this.priceMax = this.allPriceMax;
         const minSlider = this.filterRoot.querySelector("[data-price-input='min']");
         const maxSlider = this.filterRoot.querySelector("[data-price-input='max']");
         if (minSlider) minSlider.value = String(this.allPriceMin);
         if (maxSlider) maxSlider.value = String(this.allPriceMax);
         const fillEl = this.filterRoot.querySelector("[data-price-fill]");
         if (fillEl) { fillEl.style.left = "0%"; fillEl.style.right = "0%"; }
         const minLbl = this.filterRoot.querySelector("[data-price-min]");
         const maxLbl = this.filterRoot.querySelector("[data-price-max]");
         if (minLbl) minLbl.textContent = this.formatPrice(this.allPriceMin);
         if (maxLbl) maxLbl.textContent = this.formatPrice(this.allPriceMax);
         const minText = this.filterRoot.querySelector("[data-price-text-input='min']");
         const maxText = this.filterRoot.querySelector("[data-price-text-input='max']");
         if (minText) minText.value = "0";
         if (maxText) maxText.value = "";
      } else {
         if (this.active[chipOption]) {
            this.active[chipOption].delete(chipValue);
            if (!this.active[chipOption].size) delete this.active[chipOption];
         }
         const btn = this.filterRoot.querySelector(
            `[data-filter-btn][data-option="${chipOption}"][data-value="${chipValue}"]`
         );
         if (btn) btn.classList.remove("is-active");
      }
      this.applyFilter();
   }

   _createEmptyState() {
      const paginationRoot = this.root.querySelector("[data-pagination-root]");
      const grid = this.root.querySelector(".collection__grid");
      if (!paginationRoot && !grid) return;

      const empty = document.createElement("div");
      empty.className = "collection__empty";
      empty.dataset.collectionEmpty = "";
      empty.hidden = true;
      empty.textContent = this.labelEmpty;

      if (paginationRoot) {
         paginationRoot.after(empty);
      } else if (grid) {
         grid.after(empty);
      }
   }

   cardMatches(card) {
      for (const [option, values] of Object.entries(this.active)) {
         if (!values.has(card.dataset[option] ?? "")) return false;
      }
      const price = parseInt(card.dataset.price ?? "0", 10);
      if (price > 0) {
         if (price < this.priceMin || price > this.priceMax) return false;
      }
      return true;
   }

   // ── Скидаємо фільтри ──────────────────────────────────────────────────────

   reset() {
      this.active = {};
      this.priceMin = this.allPriceMin;
      this.priceMax = this.allPriceMax;

      // Скидаємо сорт
      this.currentSort = "default";
      const grid = this.root.querySelector(".collection__grid");
      if (grid) this.originalOrder.forEach(card => grid.appendChild(card));
      const sortWrapper = this.root.querySelector("[data-sort-select]");
      if (sortWrapper) {
         const defaultOpt = sortWrapper.querySelector('.custom-select__option[data-value="default"]');
         if (defaultOpt) defaultOpt.click();
      }

      this.root.querySelectorAll("[data-filter-btn].is-active").forEach((b) =>
         b.classList.remove("is-active"),
      );
      this.root.querySelectorAll("[data-filter-btn]").forEach((b) => {
         b.disabled = false;
         const countEl = b.querySelector(".filter__btn-count");
         if (countEl) {
            countEl.textContent = `(${this.countForValue(b.dataset.option, b.dataset.value)})`;
         }
      });

      // Slider inputs
      const minSlider = this.root.querySelector("[data-price-input='min']");
      const maxSlider = this.root.querySelector("[data-price-input='max']");
      if (minSlider) minSlider.value = String(this.allPriceMin);
      if (maxSlider) maxSlider.value = String(this.allPriceMax);

      const minLbl = this.root.querySelector("[data-price-min]");
      const maxLbl = this.root.querySelector("[data-price-max]");
      if (minLbl) minLbl.textContent = this.formatPrice(this.allPriceMin);
      if (maxLbl) maxLbl.textContent = this.formatPrice(this.allPriceMax);
      const fillEl = this.root.querySelector("[data-price-fill]");
      if (fillEl) { fillEl.style.left = "0%"; fillEl.style.right = "0%"; }

      // Text inputs (From / To)
      const minText = this.root.querySelector("[data-price-text-input='min']");
      const maxText = this.root.querySelector("[data-price-text-input='max']");
      if (minText) minText.value = "0";
      if (maxText) maxText.value = "";

      for (const card of this.cards) {
         delete card.dataset.filteredOut;
         card.style.display = "";
      }

      const resetBtn = this.root.querySelector("[data-filter-reset]");
      if (resetBtn) resetBtn.hidden = true;

      // Clear badge & chips
      this._updateBadge();
      this.updateChips();

      // Hide empty state
      const emptyEl = this.root.querySelector("[data-collection-empty]");
      if (emptyEl) emptyEl.hidden = true;

      const paginationRoot = this.root.querySelector("[data-pagination-root]");
      if (paginationRoot && this.originalSelector) {
         paginationRoot.dataset.itemSelector = this.originalSelector;
      }

      // В nested режимі — закриваємо всі категорії
      if (this.filterNested) {
         this.filterRoot.querySelectorAll(".filter__nested-cat").forEach((catWrap) => {
            const modelsEl = catWrap.querySelector(".filter__nested-models");
            if (modelsEl) this._setNestedOpen(catWrap, modelsEl, false);
         });
      }

      // Скидаємо accordion — всі групи закриті
      this.filterRoot
         .querySelectorAll(".filter__group:not(.filter__group--price)")
         .forEach((group) => {
            if (this._isAccordionActive()) {
               this._setGroupOpen(group, false);
            }
         });

      this.syncPagination();
   }

   // ── Синхронізація з пагінацією ────────────────────────────────────────────

   syncPagination() {
      const paginationRoot = this.root.querySelector("[data-pagination-root]");
      if (!paginationRoot) {
         this.cards.forEach((c) => {
            c.style.display = c.dataset.filteredOut !== undefined ? "none" : "";
         });
         this._updateEmptyState();
         return;
      }

      import("@scripts/init/pagination")
         .then(({ Pagination }) => {
            const instance = Pagination.getInstance(paginationRoot);
            if (instance) instance.destroy();

            const hasFilter =
               Object.keys(this.active).length > 0 ||
               this.priceMin > this.allPriceMin ||
               this.priceMax < this.allPriceMax;

            paginationRoot.dataset.itemSelector = hasFilter
               ? ".collection-card:not([data-filtered-out])"
               : this.originalSelector ?? ".collection-card";

            this.cards.forEach((c) => {
               c.style.display = c.dataset.filteredOut !== undefined ? "none" : "";
            });

            delete paginationRoot.dataset.paginationReady;
            new Pagination(paginationRoot);
            this._updateEmptyState();
         })
         .catch(() => {
            this.cards.forEach((c) => {
               c.style.display = c.dataset.filteredOut !== undefined ? "none" : "";
            });
            this._updateEmptyState();
         });
   }

   _updateEmptyState() {
      const visibleCount = this.cards.filter(c => !c.hasAttribute("data-filtered-out")).length;
      const emptyEl = this.root.querySelector("[data-collection-empty]");
      if (emptyEl) emptyEl.hidden = visibleCount > 0;
      this._updateResultCount(visibleCount);
   }

   _updateResultCount(visibleCount) {
      const el = this.root.querySelector("[data-result-count]");
      if (!el) return;
      const total = this.cards.length;
      const count = visibleCount !== undefined
         ? visibleCount
         : this.cards.filter(c => !c.hasAttribute("data-filtered-out")).length;
      el.textContent = count === total ? `${total} products` : `${count} of ${total}`;
   }

   _applyView(view, toggleEl, gridEl) {
      toggleEl.querySelectorAll("[data-view]").forEach(btn => {
         btn.classList.toggle("is-active", btn.dataset.view === view);
      });
      if (gridEl) gridEl.dataset.view = view;
   }

   // ── Helpers ───────────────────────────────────────────────────────────────

   formatValue(value) {
      return value
         .replace(/-/g, " ")
         .replace(/\b(\d+)\s*(gb|tb)\b/gi, (_, n, u) => n + u.toUpperCase())
         .replace(/\b\w/g, (c) => c.toUpperCase());
   }

   formatPrice(cents) {
      return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 });
   }
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initCollectionFilter() {
   document
      .querySelectorAll("[data-collection-page]:not([data-filter-ready])")
      .forEach((root) => {
         root.dataset.filterReady = "";
         new CollectionFilter(root);
      });
}

document.addEventListener("astro:before-swap", () => {
   document.querySelectorAll("[data-filter-ready]").forEach((el) => {
      delete el.dataset.filterReady;
   });
});

document.addEventListener("astro:page-load", initCollectionFilter);

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initCollectionFilter);
} else {
   initCollectionFilter();
}

export default CollectionFilter;
