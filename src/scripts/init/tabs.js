/**
 * ============================================
 * TABS - З scrollable та стрілками
 * ============================================
 */

class Tabs {
   constructor(container) {
      this.container = container;
      this.nav = container.querySelector(".tabs__nav");
      this.buttons = container.querySelectorAll("[data-tab]");
      this.panels = container.querySelectorAll("[data-tab-content]");
      this.defaultTab = container.dataset.defaultTab;

      this.animation = container.dataset.animation || "none";
      this.animationDuration =
         parseInt(container.dataset.animationDuration) || 300;

      this.hasIndicator = container.dataset.indicator === "true";
      this.indicator = container.querySelector(".tabs__indicator");

      this.indicatorMinWidth =
         parseInt(container.dataset.indicatorMinWidth) || null;
      this.indicatorMaxWidth =
         parseInt(container.dataset.indicatorMaxWidth) || null;

      // 🔥 НОВІ ПАРАМЕТРИ ДЛЯ SCROLLABLE
      this.isScrollable = container.dataset.scrollable === "true";
      this.arrowLeft = container.querySelector(".tabs__arrow--left");
      this.arrowRight = container.querySelector(".tabs__arrow--right");
      this.scrollAmount = 200; // Скільки px скролити за один клік

      this.init();
   }

   init() {
      if (this.animation !== "none") {
         this.container.classList.add(`tabs--animation-${this.animation}`);
      }

      const activeTab = this.defaultTab || this.buttons[0]?.dataset.tab;
      if (activeTab) {
         this.showTab(activeTab, false);
      }

      if (this.hasIndicator && this.indicator) {
         this.updateIndicator(false);
         this.checkIndicatorVisibility();

         window.addEventListener("resize", () => {
            this.checkIndicatorVisibility();
            this.updateIndicator(false);
         });
      }

      // 🔥 Ініціалізуємо scrollable функціонал
      if (this.isScrollable) {
         this.initScrollable();
      }

      this.buttons.forEach((button) => {
         button.addEventListener("click", (e) => {
            const tabId = e.currentTarget.dataset.tab;
            this.showTab(tabId, true);
         });
      });

      // Клавіатурна навігація (ARIA-стандарт)
      this.nav.addEventListener("keydown", (e) => {
         this.handleKeydown(e);
      });
   }

   handleKeydown(e) {
      const buttons = [...this.buttons];
      const activeIndex = buttons.findIndex((b) => b.classList.contains("active"));
      let nextIndex = activeIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
         e.preventDefault();
         nextIndex = (activeIndex + 1) % buttons.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
         e.preventDefault();
         nextIndex = (activeIndex - 1 + buttons.length) % buttons.length;
      } else if (e.key === "Home") {
         e.preventDefault();
         nextIndex = 0;
      } else if (e.key === "End") {
         e.preventDefault();
         nextIndex = buttons.length - 1;
      } else {
         return;
      }

      const nextButton = buttons[nextIndex];
      this.showTab(nextButton.dataset.tab, true);
      nextButton.focus();
   }

   // 🔥 НОВА ФУНКЦІЯ: ініціалізація scrollable
   initScrollable() {
      // Перевіряємо чи потрібні стрілки при завантаженні
      this.updateArrowsVisibility();

      // Перевіряємо при resize
      window.addEventListener("resize", () => {
         this.updateArrowsVisibility();
      });

      // Перевіряємо при скролі
      this.nav.addEventListener("scroll", () => {
         this.updateArrowsState();
      });

      // Обробники кліків на стрілки
      if (this.arrowLeft) {
         this.arrowLeft.addEventListener("click", () => {
            this.scrollTabs("left");
         });
      }

      if (this.arrowRight) {
         this.arrowRight.addEventListener("click", () => {
            this.scrollTabs("right");
         });
      }

      // Оновлюємо стан стрілок
      this.updateArrowsState();
   }

   // 🔥 НОВА ФУНКЦІЯ: перевірка чи потрібні стрілки
   updateArrowsVisibility() {
      if (!this.isScrollable) return;

      const isOverflowing = this.nav.scrollWidth > this.nav.clientWidth;

      if (isOverflowing) {
         // Показуємо стрілки
         if (this.arrowLeft) this.arrowLeft.style.display = "flex";
         if (this.arrowRight) this.arrowRight.style.display = "flex";
         this.container.classList.add("tabs--has-arrows");
      } else {
         // Ховаємо стрілки
         if (this.arrowLeft) this.arrowLeft.style.display = "none";
         if (this.arrowRight) this.arrowRight.style.display = "none";
         this.container.classList.remove("tabs--has-arrows");
      }

      this.updateArrowsState();
   }

   // 🔥 НОВА ФУНКЦІЯ: оновлення стану стрілок (disabled/enabled)
   updateArrowsState() {
      if (!this.isScrollable) return;

      const scrollLeft = this.nav.scrollLeft;
      const maxScroll = this.nav.scrollWidth - this.nav.clientWidth;

      // Лівий край - вимикаємо ліву стрілку
      if (this.arrowLeft) {
         if (scrollLeft <= 0) {
            this.arrowLeft.disabled = true;
            this.arrowLeft.classList.add("tabs__arrow--disabled");
         } else {
            this.arrowLeft.disabled = false;
            this.arrowLeft.classList.remove("tabs__arrow--disabled");
         }
      }

      // Правий край - вимикаємо праву стрілку
      if (this.arrowRight) {
         if (scrollLeft >= maxScroll - 1) {
            // -1 для точності
            this.arrowRight.disabled = true;
            this.arrowRight.classList.add("tabs__arrow--disabled");
         } else {
            this.arrowRight.disabled = false;
            this.arrowRight.classList.remove("tabs__arrow--disabled");
         }
      }
   }

   // 🔥 НОВА ФУНКЦІЯ: скрол табів
   scrollTabs(direction) {
      const scrollDistance =
         direction === "left" ? -this.scrollAmount : this.scrollAmount;

      this.nav.scrollBy({
         left: scrollDistance,
         behavior: "smooth",
      });
   }

   checkIndicatorVisibility() {
      if (!this.indicator) return;

      const windowWidth = window.innerWidth;
      let shouldShow = true;

      if (
         this.indicatorMinWidth !== null &&
         windowWidth < this.indicatorMinWidth
      ) {
         shouldShow = false;
      }

      if (
         this.indicatorMaxWidth !== null &&
         windowWidth > this.indicatorMaxWidth
      ) {
         shouldShow = false;
      }

      if (shouldShow) {
         this.indicator.style.display = "block";
      } else {
         this.indicator.style.display = "none";
      }
   }

   showTab(tabId, animate = true) {
      const activePanel = this.container.querySelector(
         `[data-tab-content="${tabId}"]`,
      );
      const activeButton = this.container.querySelector(
         `[data-tab="${tabId}"]`,
      );

      if (!activePanel || !activeButton) return;

      if (activeButton.classList.contains("active")) return;

      if (animate && this.animation !== "none") {
         this.animateTabChange(activePanel);
      } else {
         this.instantTabChange(activePanel);
      }

      this.updateButtons(activeButton);

      if (this.hasIndicator && this.indicator) {
         this.updateIndicator(animate);
      }

      // 🔥 Скролимо до активного табу якщо scrollable
      if (this.isScrollable) {
         this.scrollToActiveTab(activeButton);
      }
   }

   // 🔥 НОВА ФУНКЦІЯ: скрол до активного табу
   scrollToActiveTab(button) {
      const buttonRect = button.getBoundingClientRect();
      const navRect = this.nav.getBoundingClientRect();

      // Перевіряємо чи кнопка видима повністю
      const isFullyVisible =
         buttonRect.left >= navRect.left && buttonRect.right <= navRect.right;

      if (!isFullyVisible) {
         // Скролимо так щоб кнопка була в центрі
         const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
         const navCenter = this.nav.offsetWidth / 2;

         this.nav.scrollTo({
            left: buttonCenter - navCenter,
            behavior: "smooth",
         });
      }
   }

   animateTabChange(newPanel) {
      const currentPanel = this.container.querySelector(".tabs__panel.active");

      if (currentPanel) {
         currentPanel.classList.add("exiting");

         setTimeout(() => {
            currentPanel.classList.remove("active", "exiting");
            currentPanel.setAttribute("hidden", "");
            this.showNewPanel(newPanel);
         }, this.animationDuration);
      } else {
         this.showNewPanel(newPanel);
      }
   }

   showNewPanel(panel) {
      panel.removeAttribute("hidden");
      panel.classList.add("entering");
      panel.offsetHeight;
      panel.classList.add("active");

      setTimeout(() => {
         panel.classList.remove("entering");
      }, this.animationDuration);
   }

   instantTabChange(newPanel) {
      this.panels.forEach((panel) => {
         panel.classList.remove("active", "entering", "exiting");
         panel.setAttribute("hidden", "");
      });

      newPanel.classList.add("active");
      newPanel.removeAttribute("hidden");
   }

   updateButtons(activeButton) {
      this.buttons.forEach((button) => {
         button.classList.remove("active");
         button.setAttribute("aria-selected", "false");
      });

      activeButton.classList.add("active");
      activeButton.setAttribute("aria-selected", "true");
   }

   updateIndicator(animate = true) {
      const activeButton = this.container.querySelector("[data-tab].active");

      if (!activeButton || !this.indicator) return;

      const buttonRect = activeButton.getBoundingClientRect();
      const navRect = this.nav.getBoundingClientRect();

      // 🔥 Враховуємо скрол при розрахунку позиції
      const left = buttonRect.left - navRect.left + this.nav.scrollLeft;
      const width = buttonRect.width;

      this.container.style.setProperty("--animation-duration", `${this.animationDuration}ms`);

      if (animate) {
         this.indicator.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      } else {
         this.indicator.style.transition = "none";
      }

      this.indicator.style.transform = `translateX(${left}px)`;
      this.indicator.style.width = `${width}px`;
   }
}

// Ініціалізація
function initTabs() {
   const tabContainers = document.querySelectorAll("[data-tabs]");

   tabContainers.forEach((container) => {
      if (!container.dataset.tabsInitialized) {
         new Tabs(container);
         container.dataset.tabsInitialized = "true";
      }
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initTabs);
} else {
   initTabs();
}

document.addEventListener("page:ready", initTabs);
