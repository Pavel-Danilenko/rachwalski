# DanylenkoTemplateStart

**Базовий стартер для статичних сайтів на Astro.**  
Швидкий, компонентний, з оптимізацією зображень, SCSS-структурою та сучасним підходом до JavaScript.

Ідеально підходить для лендінгів, портфоліо, корпоративних сайтів та невеликих/середніх проектів.

## Технології

- **Astro** (остання версія) — статична генерація, islands-архітектура, нульовий JS за замовчуванням
- **SCSS** — модульна структура стилів
- **Vanilla JavaScript** — без фреймворків, з tree-shaking та вибірковим підключенням
- **Vite** — вбудований (через Astro), швидкий dev-сервер та оптимізований білд

## Структура проекту

```
src/
├── components/        — Astro-компоненти (тільки HTML + імпорт SCSS)
├── layouts/           — BaseLayout.astro
├── pages/             — сторінки
├── scripts/
│   ├── app.js         — точка входу, авто-реєстрація модулів
│   ├── init/          — стандартні віджети (accordion, tabs, forms…)
│   ├── sliders/       — проектні слайдери
│   ├── global/        — глобальні утиліти (barba, scroll, watch…)
│   └── animation/     — анімації
└── styles/
    ├── main.scss      — глобальні стилі
    └── pages/         — стилі окремих сторінок (_rhinoplasty.scss…)
```

---

## JavaScript + Barba — правила

Сайт використовує **Barba.js** для переходів між сторінками без перезавантаження.  
Barba замінює тільки `<main data-barba="container">` — `<head>` і глобальні скрипти залишаються незмінними.

### ⚠️ Заборонено

**Не писати `<script>` в Astro-компонентах**, якщо компонент є тільки на підсторінці:

```astro
<!-- ❌ Цей script ніколи не запуститься при навігації через Barba -->
<script>
  const swiper = new Swiper(...)
</script>
```

Astro бандлить такий script в JS-файл сторінки. При переході через Barba новий JS не завантажується — тільки DOM свапається.

### ✅ Правило для нових компонентів

**Варіант 1 — стандартний віджет** (accordion, tabs, form-inputs тощо):
1. Створи `src/scripts/init/назва.js`
2. Додай рядок в `app.js`: `if (document.querySelector("[data-назва]")) tasks.push(import("@scripts/init/назва"))`

**Варіант 2 — проектний слайдер** (унікальна логіка на Swiper):
1. Створи `src/scripts/sliders/назва.js`
2. Додай `export const selector = "[data-назва]"` на початку файлу
3. Все — `app.js` підхопить автоматично, нічого більше не потрібно

### Шаблон init-файлу

```js
export const selector = "[data-my-component]";

let initialized = false;

function initMyComponent() {
  const el = document.querySelector(selector);
  if (!el || initialized) return; // guard від подвійного запуску
  initialized = true;
  // ... логіка ініціалізації
}

function destroyMyComponent() {
  initialized = false;
  // ... очищення: destroy swiper, removeEventListener тощо
}

initMyComponent(); // перше завантаження сторінки
document.addEventListener("page:ready", initMyComponent); // навігація через Barba
document.addEventListener("page:leave", destroyMyComponent); // очищення перед переходом
```

> **Чому guard обов'язковий:** `initMyComponent()` запускається двічі при прямому reload —  
> один раз коли модуль підвантажується, другий раз коли спрацьовує `page:ready` listener.  
> `destroy` скидає guard, тому при наступній навігації ініціалізація відбудеться знову.

### Page-specific SCSS

SCSS що імпортується тільки на підсторінці — автоматично підвантажується при навігації через Barba (через `syncMeta` в `barba.js`). Нічого додаткового робити не потрібно:

```astro
---
// rhinoplasty.astro
import "@styles/pages/_rhinoplasty.scss"; // ✅ підвантажиться автоматично
---
```

### Стандартний слайдер без кастомної логіки

Якщо слайдер не має унікального поводження — використовуй універсальний `[data-slider]` через data-атрибути, без жодних нових файлів:

```astro
<div data-slider
     data-slides-mobile="1"
     data-slides-desktop="3"
     data-space-desktop="24"
     data-loop="true">
```

---
