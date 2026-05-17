// src/scripts/init/menu.js
// src/scripts/init/menu.js

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  📖 ТУТОРІАЛ: Кастомне меню з data-атрибутами                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
🎯 ВИКОРИСТАННЯ КОМПОНЕНТА MenuCustom.astro
════════════════════════════════════════════════════════════════════════════════

Компонент MenuCustom.astro вже включає базову структуру:
✅ <nav data-menu> - обгортка
✅ <button data-menu-trigger> - бургер (вже налаштований)
✅ Підключений menu.js

ВСЕ ЩО ТРЕБА - додати контент через <slot />

ПРИКЛАД:
```astro
import MenuCustom from '@components/menu/MenuCustom.astro';

// <MenuCustom>
//   <!-- Тут твоя структура меню -->
//   <div data-menu-overlay>
//     <a href="/">Головна</a>
//     <a href="/about">Про нас</a>
//   </div>
// </MenuCustom>
```

════════════════════════════════════════════════════════════════════════════════
✅ ОБОВ'ЯЗКОВІ АТРИБУТИ
════════════════════════════════════════════════════════════════════════════════

[data-menu-overlay] - ОБОВ'ЯЗКОВИЙ! Контейнер який відкривається/закривається

МІНІМАЛЬНИЙ ПРИКЛАД:
```astro
// <MenuCustom>
//   <div data-menu-overlay>
//     <a href="/">Головна</a>
//   </div>
// </MenuCustom>
```

════════════════════════════════════════════════════════════════════════════════
📚 ТИПИ МЕНЮ ТА АТРИБУТИ
════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣  ПРОСТЕ МЕНЮ                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Тільки посилання, без вкладеності.
```astro
// <MenuCustom>
//   <div data-menu-overlay class="my-menu">
//     <a href="/">Головна</a>
//     <a href="/about">Про нас</a>
//     <a href="/services">Послуги</a>
//     <a href="/contact">Контакти</a>
//   </div>
// </MenuCustom>
```

┌──────────────────────────────────────────────────────────────────────────────┐
│ 2️⃣  МЕНЮ З ACCORDION (розкривні списки)                                      │
└──────────────────────────────────────────────────────────────────────────────┘

АТРИБУТИ:
- data-menu-dropdown-toggle - кнопка відкриття/закриття
- data-menu-dropdown - список який розкривається
```astro
// <MenuCustom>
//   <div data-menu-overlay>
//     <a href="/">Головна</a>
    
//     <!-- Accordion -->
//     <button data-menu-dropdown-toggle>Послуги</button>
//     <ul data-menu-dropdown>
//       <li><a href="/web">Веб-розробка</a></li>
//       <li><a href="/mobile">Мобільні додатки</a></li>
//     </ul>
    
//     <a href="/contact">Контакти</a>
//   </div>
// </MenuCustom>
```

ФІЧА: Закривати інші accordion при відкритті
Додай closeOthers={true} в компонент:
```astro
<MenuCustom closeOthers={true}>
  <!-- Тепер тільки один accordion відкритий одночасно -->
</MenuCustom>
```

┌──────────────────────────────────────────────────────────────────────────────┐
│ 3️⃣  СКЛАДНЕ МЕНЮ (субменю-екрани)                                            │
└──────────────────────────────────────────────────────────────────────────────┘

Як в інтернет-магазинах - переходи між екранами.

АТРИБУТИ:
- data-submenu-open - кнопка відкриває наступний екран
- data-submenu - сам екран субменю
- data-submenu-back - кнопка "Назад"
- data-menu-close - кнопка "Закрити все меню"
```astro
// <MenuCustom>
//   <div data-menu-overlay>
    
//     <!-- Головний екран -->
//     <div class="main-screen">
//       <a href="/">Головна</a>
//       <button data-submenu-open>Каталог →</button>
//       <a href="/contact">Контакти</a>
//     </div>
    
//     <!-- Субменю-екран -->
//     <div data-submenu class="submenu-screen">
//       <button data-submenu-back>← Назад</button>
//       <h3>Каталог</h3>
      
//       <a href="/electronics">Електроніка</a>
//       <a href="/clothes">Одяг</a>
      
//       <!-- Можна відкрити ще глибший рівень -->
//       <button data-submenu-open>Взуття →</button>
//     </div>
    
//     <!-- Екран 2-го рівня -->
//     <div data-submenu class="submenu-screen">
//       <button data-submenu-back>← Назад</button>
//       <h3>Взуття</h3>
      
//       <a href="/sport">Спортивне</a>
//       <a href="/casual">Повсякденне</a>
//     </div>
    
//   </div>
// </MenuCustom>
```

┌──────────────────────────────────────────────────────────────────────────────┐
│ 4️⃣  КОМБІНОВАНЕ МЕНЮ (субменю + accordion)                                   │
└──────────────────────────────────────────────────────────────────────────────┘

Можна поєднувати всі типи в одному меню.
```astro
// <MenuCustom closeOthers={true}>
//   <div data-menu-overlay>
    
//     <div class="main">
//       <a href="/">Головна</a>
//       <button data-submenu-open>Каталог →</button>
//     </div>
    
//     <!-- Субменю з accordion всередині -->
//     <div data-submenu>
//       <button data-submenu-back>← Назад</button>
//       <button data-menu-close>× Закрити</button>
      
//       <h3>Каталог</h3>
      
//       <!-- Accordion всередині субменю -->
//       <button data-menu-dropdown-toggle>Бренди</button>
//       <ul data-menu-dropdown>
//         <li><a href="/nike">Nike</a></li>
//         <li><a href="/adidas">Adidas</a></li>
//       </ul>
      
//       <button data-menu-dropdown-toggle>Розміри</button>
//       <ul data-menu-dropdown>
//         <li><a href="/s">S</a></li>
//         <li><a href="/m">M</a></li>
//       </ul>
//     </div>
    
//   </div>
// </MenuCustom>
```

════════════════════════════════════════════════════════════════════════════════
🎨 АТРИБУТИ ДЛЯ CSS (автоматично додаються JS)
════════════════════════════════════════════════════════════════════════════════

JS автоматично міняє атрибути - використовуй їх для стилізації:

┌─ ГОЛОВНЕ МЕНЮ ─────────────────────────────────────────────────────────────┐
│ [data-menu-open="true"]  → на overlay (меню відкрито)                      │
│ [aria-expanded="true"]   → на бургері (меню відкрито)                      │
│ .is-animating            → на бургері (анімація, не клікабельний)          │
│ .menu-open               → на <html> (меню відкрито)                       │
│ .lock                    → на <html> (скрол заблоковано)                   │
└────────────────────────────────────────────────────────────────────────────┘

┌─ ACCORDION ────────────────────────────────────────────────────────────────┐
│ [data-expanded="true"]   → на кнопці (accordion розкрито)                  │
│ [data-menu-open="true"]  → на списку (accordion розкрито)                  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ СУБМЕНЮ-ЕКРАНИ ───────────────────────────────────────────────────────────┐
│ [data-submenu-active="true"] → на екрані (екран активний/видимий)          │
└────────────────────────────────────────────────────────────────────────────┘



════════════════════════════════════════════════════════════════════════════════
🔑 АКТИВНІ ПОСИЛАННЯ
════════════════════════════════════════════════════════════════════════════════

JS автоматично додає клас .is-active до активної сторінки.

ПРИКЛАД CSS:
```css
a.is-active {
  font-weight: 600;
  color: #0066ff;
}
```

════════════════════════════════════════════════════════════════════════════════
⌨️ КЛАВІАТУРА
════════════════════════════════════════════════════════════════════════════════

- ESC → Закрити меню (або повернутись назад якщо є субменю)
- Клік поза меню → Закрити меню

════════════════════════════════════════════════════════════════════════════════
💡 ПОРАДИ
════════════════════════════════════════════════════════════════════════════════

1. Завжди додавай [data-menu-overlay] - без нього меню не працює
2. Для складних меню використовуй семантичні класи (.main-screen, .submenu-screen)
3. Субменю-екрани мають бути сусідами в DOM (всередині overlay)
4. Accordion можна використовувати скрізь (в головному меню і в субменю)
5. Використовуй closeOthers={true} для accordion якщо хочеш щоб відкривався тільки один

════════════════════════════════════════════════════════════════════════════════

*/

// ... весь код menu.js ...

import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

class Menu {
   constructor() {
      this.menu = document.querySelector("[data-menu]");

      if (!this.menu) {
         return;
      }

      this.trigger = this.menu.querySelector("[data-menu-trigger]");
      this.overlay = this.menu.querySelector("[data-menu-overlay]");

      if (!this.overlay) {
         return;
      }

      // Ініціалізація стану
      this.isOpen = false;
      this.isAnimating = false;
      // Має збігатись з --transition-base в settings.scss (0.3s = 300ms)
      this.animationDuration = 300;
      this.closeOthers = this.menu.hasAttribute("data-menu-close-others");
      this.screenHistory = [];

      // Зберігаємо bound методи для можливості видалення
      this.boundHandleOutsideClick = this.handleOutsideClickEvent.bind(this);
      this.boundHandleEscape = this.handleEscapeEvent.bind(this);
      this.boundFocusTrap = this.handleFocusTrap.bind(this);

      // Скидаємо стан
      this.resetState();

      // Ініціалізуємо
      this.init();
   }

   resetState() {
      // Скидаємо DOM атрибути
      this.overlay.setAttribute("data-menu-open", "false");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.classList.remove("is-animating");

      // Скидаємо класи на html
      document.documentElement.classList.remove("menu-open");

      // Скидаємо субменю
      const allSubmenus = this.overlay.querySelectorAll("[data-submenu]");
      allSubmenus.forEach((sub) => {
         sub.setAttribute("data-submenu-active", "false");
      });

      // Скидаємо dropdown
      const allDropdowns = this.overlay.querySelectorAll(
         "[data-menu-dropdown-toggle]",
      );
      allDropdowns.forEach((toggle) => {
         toggle.setAttribute("data-expanded", "false");
         const dropdown = toggle.nextElementSibling;
         if (dropdown) {
            dropdown.setAttribute("data-menu-open", "false");
         }
      });

      // Скидаємо внутрішній стан
      this.isOpen = false;
      this.isAnimating = false;
      this.screenHistory = [];
   }

   init() {
      // Видаляємо старі listener'и перед додаванням нових
      this.removeEventListeners();

      // Бургер
      if (this.trigger && this.overlay) {
         this.trigger.addEventListener("click", () => this.toggle());
      }

      // Event delegation
      this.menuClickHandler = (e) => {
         // Dropdown
         const dropdownToggle = e.target.closest("[data-menu-dropdown-toggle]");
         if (dropdownToggle) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(dropdownToggle);
            return;
         }

         // Submenu open
         const submenuOpen = e.target.closest("[data-submenu-open]");
         if (submenuOpen) {
            e.preventDefault();
            e.stopPropagation();
            this.openSubmenu(submenuOpen);
            return;
         }

         // Submenu back
         const submenuBack = e.target.closest("[data-submenu-back]");
         if (submenuBack) {
            e.preventDefault();
            e.stopPropagation();
            this.goBackSubmenu();
            return;
         }

         // Close menu
         const menuClose = e.target.closest("[data-menu-close]");
         if (menuClose) {
            e.preventDefault();
            e.stopPropagation();
            this.close();
            return;
         }
      };

      this.menu.addEventListener("click", this.menuClickHandler);
      document.addEventListener("click", this.boundHandleOutsideClick);
      document.addEventListener("keydown", this.boundHandleEscape);
   }

   removeEventListeners() {
      if (this.menuClickHandler) {
         this.menu.removeEventListener("click", this.menuClickHandler);
      }
      document.removeEventListener("click", this.boundHandleOutsideClick);
      document.removeEventListener("keydown", this.boundHandleEscape);
      document.removeEventListener("keydown", this.boundFocusTrap);
   }

   // ==========================================
   // ГОЛОВНЕ МЕНЮ
   // ==========================================

   toggle() {
      if (this.isAnimating) {
         return;
      }

      this.isAnimating = true;
      this.trigger.classList.add("is-animating");

      this.isOpen = !this.isOpen;

      this.overlay.setAttribute("data-menu-open", this.isOpen);
      this.trigger.setAttribute("aria-expanded", this.isOpen);

      if (this.isOpen) {
         document.documentElement.classList.add("menu-open");
         bodyLock(this.animationDuration);
         // Focus trap — тільки на desktop (на mobile focus викликає resize viewport)
         if (window.innerWidth > 768) {
            setTimeout(() => {
               document.addEventListener("keydown", this.boundFocusTrap);
               this.getFirstFocusable()?.focus();
            }, this.animationDuration);
         } else {
            document.addEventListener("keydown", this.boundFocusTrap);
         }
      } else {
         document.documentElement.classList.remove("menu-open");
         bodyUnlock(this.animationDuration);
         document.removeEventListener("keydown", this.boundFocusTrap);
         this.resetSubmenus();
         // Повертаємо фокус на бургер після закриття
         this.trigger?.focus();
      }

      setTimeout(() => {
         this.isAnimating = false;
         this.trigger.classList.remove("is-animating");
      }, this.animationDuration);
   }

   open() {
      if (!this.isOpen && !this.isAnimating) {
         this.toggle();
      }
   }

   close() {
      if (this.isOpen && !this.isAnimating) {
         this.toggle();
      }
   }

   // ==========================================
   // DROPDOWN
   // ==========================================

   toggleDropdown(toggle) {
      const submenu = toggle.nextElementSibling;
      if (!submenu || !submenu.hasAttribute("data-menu-dropdown")) return;

      const isExpanded = toggle.getAttribute("data-expanded") === "true";

      if (this.closeOthers && !isExpanded) {
         this.closeOtherDropdowns(toggle);
      }

      toggle.setAttribute("data-expanded", String(!isExpanded));
      submenu.setAttribute("data-menu-open", String(!isExpanded));
   }

   closeOtherDropdowns(currentToggle) {
      const parent = currentToggle.closest(".menu__item")?.parentElement;
      if (!parent) return;

      const siblings = parent.querySelectorAll("[data-menu-dropdown-toggle]");
      siblings.forEach((sibling) => {
         if (sibling !== currentToggle) {
            sibling.setAttribute("data-expanded", "false");
            const submenu = sibling.nextElementSibling;
            if (submenu) {
               submenu.setAttribute("data-menu-open", "false");
            }
         }
      });
   }

   // ==========================================
   // СУБМЕНЮ-ЕКРАНИ
   // ==========================================

   openSubmenu(button) {
      const submenu = this.findNextSubmenu(button);

      if (!submenu) {
         return;
      }

      const currentScreen = this.overlay.querySelector(
         '[data-submenu-active="true"]',
      );

      if (currentScreen) {
         this.screenHistory.push(currentScreen);
      } else {
         this.screenHistory.push(this.overlay);
      }

      this.closeAllDropdownsInScreen(currentScreen || this.overlay);

      if (currentScreen) {
         currentScreen.setAttribute("data-submenu-active", "false");
      }

      submenu.setAttribute("data-submenu-active", "true");
   }

   goBackSubmenu() {
      if (this.screenHistory.length === 0) {
         return;
      }

      const currentScreen = this.overlay.querySelector(
         '[data-submenu-active="true"]',
      );

      if (currentScreen) {
         this.closeAllDropdownsInScreen(currentScreen);
         currentScreen.setAttribute("data-submenu-active", "false");
      }

      const prevScreen = this.screenHistory.pop();

      if (prevScreen !== this.overlay) {
         prevScreen.setAttribute("data-submenu-active", "true");
      }
   }

   findNextSubmenu(button) {
      // 1. Явна цільова прив'язка через значення атрибуту (надійно)
      //    <button data-submenu-open="services"> → <div data-submenu="services">
      const target = button.dataset.submenuOpen;
      if (target) {
         return this.overlay.querySelector(`[data-submenu="${target}"]`);
      }

      // 2. Fallback: DOM-сусід (для простих однорівневих меню без значення)
      //    <button data-submenu-open> → наступний [data-submenu] поруч
      let submenu = button.nextElementSibling;
      if (submenu?.hasAttribute("data-submenu")) return submenu;

      const parent = button.parentElement;
      submenu = parent?.nextElementSibling;
      if (submenu?.hasAttribute("data-submenu")) return submenu;

      return null;
   }

   closeAllDropdownsInScreen(screen) {
      const dropdowns = screen.querySelectorAll("[data-menu-dropdown-toggle]");
      dropdowns.forEach((toggle) => {
         toggle.setAttribute("data-expanded", "false");
         const dropdown = toggle.nextElementSibling;
         if (dropdown) {
            dropdown.setAttribute("data-menu-open", "false");
         }
      });
   }

   resetSubmenus() {
      const allSubmenus = this.overlay.querySelectorAll("[data-submenu]");
      allSubmenus.forEach((sub) => {
         sub.setAttribute("data-submenu-active", "false");
      });

      this.screenHistory = [];
      this.closeAllDropdownsInScreen(this.overlay);
   }

   // ==========================================
   // EVENT HANDLERS
   // ==========================================

   handleOutsideClickEvent(e) {
      if (!this.isOpen || this.isAnimating) return;

      const isClickInside = this.menu.contains(e.target);
      if (!isClickInside) {
         this.toggle();
      }
   }

   // ==========================================
   // FOCUS TRAP
   // ==========================================

   getFocusable() {
      return [
         ...this.overlay.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), ' +
            'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
         ),
      ].filter((el) => !el.closest("[data-submenu-active='false']"));
   }

   getFirstFocusable() { return this.getFocusable()[0] ?? null; }
   getLastFocusable()  { const f = this.getFocusable(); return f[f.length - 1] ?? null; }

   handleFocusTrap(e) {
      if (e.key !== "Tab") return;

      const focusable = this.getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
         if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
         }
      } else {
         if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
         }
      }
   }

   handleEscapeEvent(e) {
      if (e.key === "Escape" && this.isOpen && !this.isAnimating) {
         if (this.screenHistory.length > 0) {
            this.goBackSubmenu();
         } else {
            this.toggle();
         }
      }
   }

   // ==========================================
   // CLEANUP
   // ==========================================

   destroy() {
      this.removeEventListeners();
      this.resetState();
   }
}

// ==========================================
// ІНІЦІАЛІЗАЦІЯ
// ==========================================

function initMenu() {
   // Видаляємо старий інстанс
   if (window.menu && typeof window.menu.destroy === "function") {
      window.menu.destroy();
   }

   // Створюємо новий
   window.menu = new Menu();
}

// Перше завантаження
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initMenu);
} else {
   initMenu();
}

// Astro View Transitions
document.addEventListener("page:ready", initMenu);

export default Menu;
