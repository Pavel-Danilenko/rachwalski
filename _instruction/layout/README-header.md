# Header

Шапка сайту з адаптивною навігацією і бургер-меню. Підключається один раз у `BaseLayout.astro`.

```
src/
├── components/layout/Header.astro              — компонент шапки
├── components/menu/MenuCustom.astro            — обгортка меню (бургер + overlay)
├── scripts/init/menu.js                        — логіка (toggle, dropdown, submenu, ESC)
├── scripts/init/menu-active-links.js           — авто-підсвічування активного лінку
└── styles/components/
    ├── layout/_header.scss                     — стилі header + nav (desktop + mobile)
    └── menu/_menu-custom.scss                  — стилі бургера + dropdown
```

---

## Props (`Header.astro`)

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `sticky` | `boolean` | `false` | Прилипаючий хедер (`position: sticky; top: 0`) |
| `class` | `string` | — | Додатковий CSS клас |

```astro
<!-- В BaseLayout.astro -->
<Header />
<Header sticky={true} />
```

---

## Структура навігації

Контент навігації знаходиться **в `Header.astro`** — редагуй там:

```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">
         <li><a href="/" class="header__nav-link">Головна</a></li>
         <li><a href="/about" class="header__nav-link">Про нас</a></li>
      </ul>
   </div>
</MenuCustom>
```

> `data-menu-overlay` — **обов'язковий** атрибут. JS керує відкриттям/закриттям саме цього елементу.

---

## Як працює меню

**Desktop (> 768px):** `.header__nav` завжди видимий, бургер прихований.

**Mobile (≤ 768px):**
- `.header__nav` — `position: fixed`, `transform: translateX(-100%)` (прихований)
- Бургер кнопка з'являється
- Клік на бургер → JS ставить `data-menu-open="true"` на overlay → CSS показує навігацію
- При відкритті JS додає клас `menu-open` на `<html>` і блокує скрол

```
Бургер click → Menu.toggle() → data-menu-open="true" на .header__nav
                              → .menu-open на <html>
                              → bodyLock()
```

---

## MenuCustom Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `closeOthers` | `boolean` | `false` | Закривати інші dropdown при відкритті |
| `class` | `string` | — | Додатковий CSS клас на `<nav>` |

---

## Типи меню

### 1. Просте (поточна реалізація)
```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">
         <li><a href="/" class="header__nav-link">Головна</a></li>
         <li><a href="/about" class="header__nav-link">Про нас</a></li>
      </ul>
   </div>
</MenuCustom>
```

### 2. З dropdown (accordion)
```astro
<MenuCustom closeOthers={true}>
   <div data-menu-overlay class="header__nav">
      <a href="/" class="header__nav-link">Головна</a>

      <!-- Dropdown trigger -->
      <button class="header__nav-link" data-menu-dropdown-toggle>
         Послуги
      </button>
      <!-- Dropdown list (CSS Grid trick) -->
      <ul class="dropdown__item">
         <div>
            <li><a href="/web">Веб-розробка</a></li>
            <li><a href="/design">Дизайн</a></li>
         </div>
      </ul>
   </div>
</MenuCustom>
```

### 3. З субменю-екранами — шторки (будь-яка глибина)

Кожна шторка — окремий екран. Кнопка зі значенням `data-submenu-open="ключ"` відкриває `data-submenu="ключ"`. Без DOM ID — тільки data-атрибути.

```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">

      <!-- ── Головний екран ── -->
      <ul>
         <li><a href="/">Головна</a></li>
         <li><button data-submenu-open="services">Послуги →</button></li>
         <li><button data-submenu-open="catalog">Каталог →</button></li>
         <li><a href="/contact">Контакти</a></li>
      </ul>

      <!-- ── Шторка: Послуги ── -->
      <div data-submenu="services">
         <button data-submenu-back>← Назад</button>
         <h3>Послуги</h3>
         <ul>
            <li><a href="/web">Веб-розробка</a></li>
            <li><button data-submenu-open="design">Дизайн →</button></li>
            <li><a href="/seo">SEO</a></li>
         </ul>
      </div>

      <!-- ── Шторка: Дизайн (2-й рівень) ── -->
      <div data-submenu="design">
         <button data-submenu-back>← Назад</button>
         <h3>Дизайн</h3>
         <ul>
            <li><a href="/ui">UI/UX</a></li>
            <li><a href="/branding">Брендинг</a></li>
            <li><button data-submenu-open="branding-detail">Деталі →</button></li>
         </ul>
      </div>

      <!-- ── Шторка: 3-й рівень ── -->
      <div data-submenu="branding-detail">
         <button data-submenu-back>← Назад</button>
         <button data-menu-close>✕ Закрити</button>
         <h3>Брендинг</h3>
         <ul>
            <li><a href="/logo">Логотип</a></li>
            <li><a href="/identity">Айдентика</a></li>
         </ul>
      </div>

      <!-- ── Шторка: Каталог (паралельна гілка) ── -->
      <div data-submenu="catalog">
         <button data-submenu-back>← Назад</button>
         <h3>Каталог</h3>
         <ul>
            <li><a href="/electronics">Електроніка</a></li>
            <li><a href="/clothes">Одяг</a></li>
         </ul>
      </div>

   </div>
</MenuCustom>
```

> **Ключове:** `data-submenu-open="services"` явно вказує яку шторку відкрити. Можна мати скільки завгодно паралельних шторок і будь-яку глибину вкладення.

---

## JS Data-атрибути

| Атрибут | На елементі | Що робить |
|---|---|---|
| `data-menu-overlay` | nav wrapper | **Обов'язковий.** JS керує відкриттям |
| `data-menu-trigger` | бургер | Кнопка відкриття (генерується автоматично) |
| `data-menu-dropdown-toggle` | кнопка | Відкриває dropdown |
| `data-menu-dropdown` | список | Контент dropdown |
| `data-submenu-open` | кнопка | Відкриває субменю-екран |
| `data-submenu` | div | Екран субменю |
| `data-submenu-back` | кнопка | Повернутись на попередній екран |
| `data-menu-close` | будь-який | Закрити все меню |
| `data-scroll-nav` | nav wrapper | Scroll-шпигун (підсвічує активний пункт при скролі) |

---

## CSS класи що додає JS

| Клас/атрибут | Де | Умова |
|---|---|---|
| `menu-open` | `<html>` | Меню відкрито |
| `data-menu-open="true"` | overlay | Меню відкрито |
| `aria-expanded="true"` | бургер | Меню відкрито |
| `is-active` | лінки | Поточна сторінка (menu-active-links.js) |
| `data-expanded="true"` | dropdown toggle | Dropdown відкрито |
| `data-submenu-active="true"` | submenu div | Субменю активне |

---

## Клавіатура

| Клавіша | Дія |
|---|---|
| `Escape` | Закрити меню (або повернутись назад якщо є активне субменю) |
| Клік поза меню | Закрити меню |

---

## CSS кастомізація

Всі стилі навігації в `_header.scss`. Для кастомізації:

```scss
// Кастомний колір активного лінку
.header__nav-link.is-active {
   color: var(--color-secondary);
   background: color-mix(in srgb, var(--color-secondary) 8%, transparent);
}

// Мобільне меню — анімація справа (замість зліва)
@media (max-width: 768px) {
   .header__nav {
      transform: translateX(100%); // ← справа
   }
}
```
