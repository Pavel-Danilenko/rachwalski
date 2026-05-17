# MenuCustom — Кастомне меню

Потужна система меню з підтримкою будь-якої складності: просте, dropdown-accordion, багаторівневі шторки (submenu-screens), мега-меню. Весь функціонал через `data-атрибути` — JS і CSS підхоплюють автоматично.

```
src/
├── components/menu/MenuCustom.astro          — компонент-обгортка (бургер + slot)
├── scripts/init/menu.js                      — Menu клас (toggle, dropdown, submenu, ESC, focus trap)
├── scripts/init/menu-active-links.js         — авто-підсвічування активного лінку
└── styles/components/menu/_menu-custom.scss  — бургер + dropdown анімація
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fmenu` | Просте меню — лінки без вкладення |
| `fmenu-dropdown` | Меню з dropdown-accordion |
| `fmenu-submenu` | Меню з шторками (submenu-screens) |
| `fmenu-mega` | Повне меню: dropdown + шторки + back + close |

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `closeOthers` | `boolean` | `false` | Закривати інші dropdown при відкритті нового |
| `burgerLabel` | `string` | `"Відкрити меню"` | aria-label бургера |
| `class` | `string` | — | Додатковий клас на `<nav>` |

---

## Обов'язкова структура

```astro
<MenuCustom>
   <div data-menu-overlay class="...">
      <!-- весь контент меню тут -->
   </div>
</MenuCustom>
```

> `data-menu-overlay` — **обов'язковий**. JS керує відкриттям/закриттям саме цього елементу.  
> CSS на `.header__nav[data-menu-open="true"]` — показує drawer на мобайлі.

---

## Рівень 1 — Просте меню

Тільки лінки. Бургер відкриває весь `data-menu-overlay`.

```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">
         <li><a href="/" class="header__nav-link">Головна</a></li>
         <li><a href="/about" class="header__nav-link">Про нас</a></li>
         <li><a href="/services" class="header__nav-link">Послуги</a></li>
         <li><a href="/contact" class="header__nav-link">Контакти</a></li>
      </ul>
   </div>
</MenuCustom>
```

---

## Рівень 2 — Dropdown (accordion)

Пункт розкривається на місці — CSS Grid анімація. Підходить для desktop-dropdown і мобільних accordion.

```astro
<MenuCustom closeOthers={true}>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">
         <li><a href="/" class="header__nav-link">Головна</a></li>

         <li>
            <!-- Кнопка відкриття dropdown -->
            <button class="header__nav-link" data-menu-dropdown-toggle>
               Послуги
               <span class="menu-arrow">▾</span>
            </button>

            <!-- Контент dropdown — CSS Grid trick: 0fr → 1fr -->
            <ul data-menu-dropdown>
               <div><!-- overflow wrapper -->
                  <li><a href="/web">Веб-розробка</a></li>
                  <li><a href="/design">Дизайн</a></li>
                  <li><a href="/seo">SEO</a></li>
               </div>
            </ul>
         </li>

         <li><a href="/contact" class="header__nav-link">Контакти</a></li>
      </ul>
   </div>
</MenuCustom>
```

**Як працює анімація dropdown:**
```
click [data-menu-dropdown-toggle]
  → JS: data-expanded="true" на кнопці
  → JS: data-menu-open="true" на [data-menu-dropdown]
  → CSS: [data-menu-dropdown][data-menu-open="true"] { grid-template-rows: 1fr }
  → анімація розкриття
```

> `closeOthers={true}` — закриває попередній dropdown при відкритті нового.

---

## Рівень 3 — Submenu-screens (шторки)

Кожна "шторка" — окремий екран. Клік відкриває наступний екран поверх поточного. Є кнопка "Назад".

**Ключове правило:** `data-submenu-open="ключ"` → відкриває `data-submenu="ключ"`.

```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">

      <!-- ══ Головний екран ══════════════════════════════════════ -->
      <ul class="header__nav-list">
         <li><a href="/" class="header__nav-link">Головна</a></li>
         <li>
            <button class="header__nav-link" data-submenu-open="services">
               Послуги →
            </button>
         </li>
         <li>
            <button class="header__nav-link" data-submenu-open="catalog">
               Каталог →
            </button>
         </li>
         <li><a href="/contact" class="header__nav-link">Контакти</a></li>
      </ul>

      <!-- ══ Шторка: Послуги ════════════════════════════════════ -->
      <div data-submenu="services" class="menu-screen">
         <div class="menu-screen__head">
            <button class="menu-back" data-submenu-back>← Назад</button>
            <span class="menu-screen__title">Послуги</span>
         </div>
         <ul>
            <li><a href="/web">Веб-розробка</a></li>
            <li>
               <button data-submenu-open="design">Дизайн →</button>
            </li>
            <li><a href="/seo">SEO</a></li>
         </ul>
      </div>

      <!-- ══ Шторка: Дизайн (2-й рівень) ═══════════════════════ -->
      <div data-submenu="design" class="menu-screen">
         <div class="menu-screen__head">
            <button class="menu-back" data-submenu-back>← Назад</button>
            <button class="menu-close-btn" data-menu-close>✕ Закрити</button>
         </div>
         <ul>
            <li><a href="/ui">UI/UX дизайн</a></li>
            <li><a href="/branding">Брендинг</a></li>
            <li><a href="/print">Поліграфія</a></li>
         </ul>
      </div>

      <!-- ══ Шторка: Каталог (паралельна гілка) ════════════════ -->
      <div data-submenu="catalog" class="menu-screen">
         <div class="menu-screen__head">
            <button class="menu-back" data-submenu-back>← Назад</button>
            <span class="menu-screen__title">Каталог</span>
         </div>
         <ul>
            <li><a href="/electronics">Електроніка</a></li>
            <li><a href="/clothes">Одяг</a></li>
            <li><a href="/sport">Спорт</a></li>
         </ul>
      </div>

   </div>
</MenuCustom>
```

**Як це працює:**
```
[data-submenu-open="services"] click
  → JS: знаходить [data-submenu="services"]
  → JS: поточний екран → data-submenu-active="false"
  → JS: наступний екран → data-submenu-active="true"
  → CSS показує новий екран (слайд/fade/тощо)

[data-submenu-back] click
  → JS: повертається до попереднього екрана зі стеку
```

---

## Рівень 4 — Мега-меню (dropdown + submenu + будь-яка глибина)

Комбінація всіх типів. Можна додавати будь-яку глибину.

```astro
<MenuCustom closeOthers={true}>
   <div data-menu-overlay class="header__nav">

      <!-- ══ Головний екран ══════════════════════════════════════ -->
      <ul class="header__nav-list">
         <li><a href="/">Головна</a></li>

         <!-- Dropdown на desktop -->
         <li>
            <button data-menu-dropdown-toggle>
               Компанія <span>▾</span>
            </button>
            <ul data-menu-dropdown>
               <div>
                  <li><a href="/about">Про нас</a></li>
                  <li><a href="/team">Команда</a></li>
                  <li><a href="/careers">Вакансії</a></li>
               </div>
            </ul>
         </li>

         <!-- Шторка на mobile -->
         <li>
            <button data-submenu-open="catalog">
               Каталог →
            </button>
         </li>

         <!-- Кнопка закрити все -->
         <li>
            <button data-menu-close>✕</button>
         </li>
      </ul>

      <!-- ══ Шторка: Каталог з accordion всередині ══════════════ -->
      <div data-submenu="catalog" class="menu-screen">
         <button data-submenu-back>← Назад</button>
         <h3>Каталог</h3>

         <!-- Accordion всередині шторки -->
         <button data-menu-dropdown-toggle>
            Електроніка <span>▾</span>
         </button>
         <ul data-menu-dropdown>
            <div>
               <li><a href="/phones">Телефони</a></li>
               <li><a href="/laptops">Ноутбуки</a></li>
               <li>
                  <!-- Шторка з шторки — 3-й рівень -->
                  <button data-submenu-open="laptops-brands">
                     Бренди →
                  </button>
               </li>
            </div>
         </ul>

         <button data-menu-dropdown-toggle>
            Одяг <span>▾</span>
         </button>
         <ul data-menu-dropdown>
            <div>
               <li><a href="/men">Чоловіче</a></li>
               <li><a href="/women">Жіноче</a></li>
            </div>
         </ul>
      </div>

      <!-- ══ Шторка: Бренди ноутбуків (3-й рівень) ══════════════ -->
      <div data-submenu="laptops-brands" class="menu-screen">
         <button data-submenu-back>← Назад</button>
         <button data-menu-close>✕ Закрити</button>
         <h3>Бренди</h3>
         <ul>
            <li><a href="/apple">Apple</a></li>
            <li><a href="/dell">Dell</a></li>
            <li><a href="/lenovo">Lenovo</a></li>
         </ul>
      </div>

   </div>
</MenuCustom>
```

---

## Всі data-атрибути

### На елементах (ти додаєш)

| Атрибут | На чому | Що робить |
|---|---|---|
| `data-menu-overlay` | `div` | **Обов'язковий.** JS відкриває/закриває цей блок |
| `data-menu-dropdown-toggle` | `button` | Відкриває/закриває dropdown під собою |
| `data-menu-dropdown` | `ul/div` | Контент dropdown (CSS Grid анімація) |
| `data-submenu-open="ключ"` | `button` | Відкриває шторку з відповідним ключем |
| `data-submenu="ключ"` | `div` | Екран шторки (ключ = унікальна назва) |
| `data-submenu-back` | `button` | Повертає на попередній екран |
| `data-menu-close` | `button/a` | Закриває все меню повністю |

### Які JS додає автоматично (для CSS)

| Атрибут/клас | Де | Умова |
|---|---|---|
| `data-menu-open="true"` | на overlay | Меню відкрито |
| `data-menu-open="true"` | на `[data-menu-dropdown]` | Dropdown відкрито |
| `aria-expanded="true"` | на бургері | Меню відкрито |
| `data-expanded="true"` | на `[data-menu-dropdown-toggle]` | Dropdown відкрито |
| `data-submenu-active="true"` | на `[data-submenu]` | Шторка активна/видима |
| `data-submenu-active="false"` | на `[data-submenu]` | Шторка прихована |
| `.menu-open` | на `<html>` | Меню відкрито (для backdrop через CSS) |
| `.is-active` | на `<a>` | Поточна сторінка (menu-active-links.js) |
| `.lock` | на `<html>` | Скрол заблоковано |

---

## Клавіатура

| Клавіша | Дія |
|---|---|
| `Escape` | Закрити меню. Якщо є активна шторка — повернутись назад |
| `Tab` | Циклиться тільки по елементах видимого екрана (focus trap) |
| `Shift + Tab` | Назад по фокусу всередині меню |
| Клік поза меню | Закрити меню |

---

## CSS підказки для стилізації

### Backdrop при відкритому меню
```scss
html.menu-open::before {
   content: '';
   position: fixed;
   inset: 0;
   background: color-mix(in srgb, #000 50%, transparent);
   z-index: calc(var(--z-overlay, 300) - 1);
}
```

### Шторка (базові стилі)
```scss
[data-submenu] {
   display: none;
   &[data-submenu-active="true"] { display: block; }
}

// Або з анімацією:
[data-submenu] {
   position: absolute;
   inset: 0;
   background: var(--color-bg);
   transform: translateX(100%);
   transition: transform var(--transition-base);

   &[data-submenu-active="true"] {
      transform: translateX(0);
   }
}
```

### Стрілка dropdown
```scss
[data-menu-dropdown-toggle] .menu-arrow {
   transition: rotate var(--transition-fast);
}
[data-menu-dropdown-toggle][data-expanded="true"] .menu-arrow {
   rotate: 180deg;
}
```

### Активне посилання
```scss
.header__nav-link.is-active {
   color: var(--color-primary);
   font-weight: 600;
}
```

---

## Обмеження

- **Одне меню на сторінку** — `querySelector("[data-menu]")` бере перший елемент
- Шторки (`data-submenu`) мають бути **прямими нащадками** `data-menu-overlay`
- Dropdown (`data-menu-dropdown`) має бути **наступним сусідом** після `data-menu-dropdown-toggle`
