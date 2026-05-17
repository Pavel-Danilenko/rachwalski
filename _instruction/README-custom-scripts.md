# Кастомні скрипти

Документація по підключенню власного JavaScript для конкретного проекту.

---

## Структура

```
src/scripts/
├── app.js              — головний файл (не чіпати)
├── custom.js           — ← ТВІЙ ФАЙЛ. Сюди весь кастомний код
├── animation/
├── global/
└── init/
```

---

## custom.js — глобальний кастомний файл

Підключений в `app.js` автоматично. Виконується на кожній сторінці.

```js
// src/scripts/custom.js

document.addEventListener("page:ready", () => {
   // Код виконується при:
   // — першому завантаженні сторінки
   // — кожному переході через Barba
});

document.addEventListener("page:leave", () => {
   // Cleanup перед переходом на іншу сторінку
   // Зупинити таймери, від'єднати слухачі, скинути стани
});
```

> `page:ready` — аналог `DOMContentLoaded` але для Barba. Завжди використовуй його замість `DOMContentLoaded`.

---

## Приклади

### Просте підключення плагіну

```js
document.addEventListener("page:ready", () => {
   const el = document.querySelector(".my-element");
   if (!el) return;

   // ініціалізація
   const instance = new SomePlugin(el, { option: true });

   // зберігаємо для cleanup
   el._instance = instance;
});

document.addEventListener("page:leave", () => {
   document.querySelectorAll(".my-element").forEach((el) => {
      el._instance?.destroy();
      delete el._instance;
   });
});
```

### Анімація при скролі (без повторної ініціалізації)

```js
document.addEventListener("page:ready", () => {
   document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      if (el.dataset.initialized) return;
      el.dataset.initialized = "true";

      // логіка
   });
});
```

### Подія на кнопку

```js
document.addEventListener("page:ready", () => {
   document.querySelector(".my-btn")?.addEventListener("click", () => {
      console.log("clicked");
   });
});
```

> Event listeners на конкретні елементи не потребують cleanup — елемент видаляється Barba разом з контейнером.

---

## Підключення окремого JS-файлу

Якщо кастомного коду стає багато — винеси в окремий файл і підключи в `custom.js`:

```js
// src/scripts/custom.js
import "./custom/hero-animation";
import "./custom/product-filter";
import "./custom/map";
```

```
src/scripts/
├── custom.js
└── custom/
    ├── hero-animation.js
    ├── product-filter.js
    └── map.js
```

Кожен файл має свою структуру з `page:ready` / `page:leave`.

---

## Per-page скрипти (коли потрібна логіка тільки для однієї сторінки)

Якщо код потрібен **тільки для конкретної сторінки** — щоб не вантажити його на всіх:

### Крок 1 — Додай namespace на сторінці

```astro
<!-- src/pages/about.astro -->
<BaseLayout namespace="about">
```

### Крок 2 — Створи файл `pages/{namespace}.js`

```
src/scripts/custom/
└── pages/
    └── about.js     ← підключиться автоматично тільки на /about
```

```js
// src/scripts/custom/pages/about.js

export default function () {
   // Код виконується при кожному переході на /about
   console.log("about page ready");
}
```

### Крок 3 — Підключи glob в app.js

```js
// src/scripts/app.js
const pageModules = import.meta.glob("@scripts/custom/pages/*.js");

document.addEventListener("page:ready", async () => {
   const ns = document.querySelector("[data-barba-namespace]")?.dataset.barbaNamespace;
   const mod = pageModules[`/src/scripts/custom/pages/${ns}.js`];
   if (mod) await mod();
});
```

> Файли підвантажуються **лінь** (lazy) — `about.js` не завантажується на `/home`. Ідеально для важких бібліотек (карти, відео, canvas).

---

## Правила

| Правило | Причина |
|---|---|
| Завжди `page:ready` замість `DOMContentLoaded` | `DOMContentLoaded` не спрацює після Barba-навігації |
| Перевіряй `if (!el) return` | Елемент може не існувати на поточній сторінці |
| Cleanup в `page:leave` для плагінів | Уникнути memory leak і конфліктів після переходу |
| `data-initialized` guard якщо є ризик подвійного запуску | `page:ready` викликається при кожному переході |

---

## Підключення зовнішньої бібліотеки через npm

```bash
npm install some-library
```

```js
// src/scripts/custom.js
import SomeLibrary from "some-library";

document.addEventListener("page:ready", () => {
   const el = document.querySelector("[data-some]");
   if (!el || el.dataset.initialized) return;
   el.dataset.initialized = "true";

   new SomeLibrary(el);
});
```

---

## Підключення зовнішнього скрипту через CDN

В `BaseLayout.astro`:
```astro
<script src="https://cdn.example.com/library.min.js" defer></script>
```

В `custom.js` — використовуй глобальну змінну яку бібліотека додає на `window`.
