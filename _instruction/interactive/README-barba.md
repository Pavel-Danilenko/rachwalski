# Barba.js + GSAP — Переходи між сторінками

Плавні переходи між сторінками без перезавантаження. Barba керує навігацією, GSAP анімує.

```
src/scripts/animation/
├── barba.js         — логіка (Barba init, всі анімації, cleanup)
├── barba.config.js  — ← ТУТ НАЛАШТОВУЄШ (анімація, тривалість, per-page)
├── split.js
└── typing.js
```

---

## Встановлення

```bash
npm install @barba/core gsap
```

Підключення вже зроблено в `app.js`:
```js
import "@scripts/animation/barba";
```

Якщо треба **вимкнути** Barba — закоментуй цей рядок:
```js
// import "@scripts/animation/barba";
```

> Сайт продовжить працювати зі стандартними перезавантаженнями сторінок.

---

## Два способи керування переходом

| Спосіб | Коли | Де |
|---|---|---|
| **1. Пропси на `<BaseLayout>`** ⭐ | швидко змінити перехід для сторінки, без правки JS | у файлі сторінки |
| **2. `namespace` + `barba.config.js`** | іменовані пресети для перевикористання | у конфігу |

**Пріоритет:** атрибути (пропси) **>** namespace-конфіг **>** `default`.

---

## Спосіб 1 — пропси на BaseLayout (рекомендовано) ⭐

Нічого не чіпаєш у JS — усе через пропси сторінки.

```astro
<BaseLayout
   transition="iris"                 // назва анімації (список нижче)
   transitionLeave={0.5}             // тривалість виходу (сек)
   transitionEnter={0.8}             // тривалість входу (сек)
   transitionEaseLeave="power2.in"   // GSAP ease виходу
   transitionEaseEnter="expo.out"    // GSAP ease входу
   transitionColor="#000"            // overlay-колір для шторок/iris (опц.)
>
```

Усі пропси **опціональні** — що не вказав, береться з `barba.config.js` (`default` або namespace).

| Проп | Що | Приклад |
|---|---|---|
| `transition` | назва анімації | `"fade"`, `"iris"`, `"morph"` |
| `transitionLeave` | тривалість виходу (сек) | `0.5` |
| `transitionEnter` | тривалість входу (сек) | `0.8` |
| `transitionEaseLeave` | ease виходу | `"power2.in"` |
| `transitionEaseEnter` | ease входу | `"expo.out"` |
| `transitionColor` | overlay-колір | `"#000"`, `"var(--color-primary)"` |

**Глобальні дефолти переходу** задані прямо в `BaseLayout` — міняєш в одному місці для всього сайту, без правки `barba.config.js`:

```ts
transition       = "fade"   // анімація за замовчуванням для всього сайту
transitionLeave  = 0.7      // тривалість виходу (сек)
transitionEnter  = 0.9      // тривалість входу (сек)
```

> Оскільки ці дефолти завжди віддаються як атрибути, вони мають пріоритет над `animation`/`duration` з `barba.config.js`. Тобто щоб увімкнути інший ефект глобально — змінюєш `transition = "fade"` на потрібний (напр. `"vortex"`) прямо в `BaseLayout`. Для однієї сторінки — проп `transition`.

```astro
<!-- швидкий приклад: одна сторінка з iris + чорним overlay -->
<BaseLayout transition="iris" transitionEnter={1} transitionEaseEnter="expo.out" transitionColor="#000">
```

> Технічно: пропси віддаються як `data-tr-*` атрибути на barba-контейнер, а `barba.js` (`getConfig`) накладає їх поверх namespace-конфігу. Сам `barba.js` чіпати не треба.

---

## Спосіб 2 — namespace + barba.config.js (іменовані пресети)

Потрібно зробити **два кроки**:

---

### Крок 1 — Додати `namespace` на сторінці

Відкрий файл сторінки (`src/pages/about.astro`) і передай `namespace` в `BaseLayout`:

```astro
---
// src/pages/about.astro
import BaseLayout from "@layouts/BaseLayout.astro";
---

<BaseLayout namespace="about" title="Про нас">
   ...
</BaseLayout>
```

```astro
---
// src/pages/index.astro
import BaseLayout from "@layouts/BaseLayout.astro";
---

<BaseLayout namespace="home" title="Головна">
   ...
</BaseLayout>
```

```astro
---
// src/pages/services.astro
import BaseLayout from "@layouts/BaseLayout.astro";
---

<BaseLayout namespace="services" title="Послуги">
   ...
</BaseLayout>
```

> Якщо `namespace` не вказати — сторінка використовує `default` анімацію.

---

### Крок 2 — Додати запис у `barba.config.js`

Відкрий `src/scripts/animation/barba.config.js` і додай запис з **тим самим ключем** що й `namespace`:

```js
export const transitions = {

   // ── Дефолт — для всіх сторінок без кастомних налаштувань ──
   default: {
      animation: "fade",
      duration:  { leave: 0.3, enter: 0.45 },
      ease:      { leave: "power2.in", enter: "power2.out" },
   },

   // ── namespace="about" → анімація "slide-up" ───────────────
   about: {
      animation: "slide-up",
      duration:  { leave: 0.3, enter: 0.5 },
   },

   // ── namespace="home" → анімація "iris" ────────────────────
   home: {
      animation: "iris",
      duration:  { leave: 0.45, enter: 0.65 },
      ease:      { leave: "power3.in", enter: "power3.out" },
   },

   // ── namespace="services" → анімація "clip" ────────────────
   services: {
      animation: "clip",
   },

};
```

> Незазначені поля (`duration`, `ease`) автоматично беруться з `default`.

---

### Зв'язок namespace ↔ конфіг

```
Сторінка                     barba.config.js
──────────────────────────── ──────────────────────────
namespace="about"    ──────→ about: { animation: "..." }
namespace="home"     ──────→ home:  { animation: "..." }
namespace="services" ──────→ services: { ... }
(без namespace)      ──────→ default: { ... }
```

---

## Всі параметри конфігу

```js
{
   animation: "fade",                  // назва анімації (див. список нижче)
   duration: {
      leave: 0.3,                      // тривалість виходу (секунди)
      enter: 0.45,                     // тривалість входу (секунди)
   },
   ease: {
      leave: "power2.in",              // плавність виходу (GSAP ease)
      enter: "power2.out",             // плавність входу (GSAP ease)
   },
   color: "var(--color-primary)",      // колір overlay під clip/iris/curtain анімаціями
                                       // null або відсутній → без overlay
   animateFooter: false,               // true → footer анімується разом з контентом
}
```

### `color` — кольоровий overlay між сторінками

За замовчуванням **вимкнений** (`color: null`). Вмикається коли потрібен візуальний акцент між переходами.

**Коли потрібен:** при clip-анімаціях (`curtain`, `iris`, `clip`, `diagonal`, `rise`, `spotlight`, `accordion`) — без `color` під зрізаним контентом видно білий фон. З `color` — з'являється кольоровий overlay.

**Як працює:** overlay плавно з'являється разом з виходом старої сторінки і зникає поки нова вже видима — виглядає як кольоровий "серпанок".

```js
color: null,                      // вимкнено (дефолт)
color: "var(--color-primary)",    // колір бренду
color: "#000",                    // чорний — кінематографічний
color: "var(--color-bg-alt)",     // темний фон сайту
color: "#1a1a2e",                 // кастомний HEX
```

> Для `fade`, `slide-*`, `blur`, `scale` — overlay зазвичай не потрібен, залишай `null`.

> Якщо для сторінки вказати тільки `animation` — решта береться з `default`.

---

## Список анімацій

### Базові

| Назва | Ефект |
|---|---|
| `none` | Миттєво, без анімації |
| `fade` | Плавне затухання → поява |

### Slide

| Назва | Ефект |
|---|---|
| `slide-up` | Стара йде вгору, нова знизу |
| `slide-down` | Стара вниз, нова зверху |
| `slide-left` | Стара вліво, нова справа |
| `slide-right` | Стара вправо, нова зліва |

### Scale / Zoom

| Назва | Ефект |
|---|---|
| `scale` | Стискається → розширюється |
| `zoom-in` | Стара збільшується, нова виростає |

### Blur

| Назва | Ефект |
|---|---|
| `blur` | Розфокус при виході, різкість при вході |

### Clip / Wipe

| Назва | Ефект |
|---|---|
| `clip` | Шторка зверху вниз |
| `clip-up` | Шторка знизу вгору |
| `curtain` | Горизонтальна шторка зліва |
| `iris` | Кругове розкриття з центру |
| `iris-left` | Кругове розкриття з лівого краю |
| `diagonal` | Діагональна шторка — зліва-знизу вправо-вгору |
| `spotlight` | Звужується в точку → розкривається |
| `accordion` | Стискається в центр по вертикалі |
| `rise` | Сторінка виростає знизу вгору |

### 3D

| Назва | Ефект |
|---|---|
| `flip` | Горизонтальний переворот по Y (як карта) |
| `flip-x` | Вертикальний переворот по X |

### Комбо / Вау ⭐

| Назва | Ефект |
|---|---|
| `morph` | Blur + scale — плавний преміум |
| `push` | Стара відкидається вниз, нова зверху |
| `glitch` | Цифровий збій — skew + jitter |
| `cinematic` | Важкий blur + zoom — як у кіно |
| `shatter` | Розліт — стара "вибухає", нова збирається |
| `dive` | Стара тоне в глибину, нова спливає — 3D perspective |
| `vortex` ⚡ | Вихор — стара закручується в точку, нова розкручується назад (spin + scale + blur) |
| `door` ⚡ | 3D-двері — стара як стулка зліва, нова в'їжджає справа |

---

## Готові пресети (copy-paste)

### Agency / Мінімалізм
```js
default: {
   animation: "slide-up",
   duration:  { leave: 0.25, enter: 0.45 },
   ease:      { leave: "power3.in", enter: "expo.out" },
   color:     null,
},
```

### Преміум / Luxury brand
```js
default: {
   animation: "morph",
   duration:  { leave: 0.5, enter: 0.7 },
   ease:      { leave: "power2.inOut", enter: "power2.out" },
   color:     null,
},
```

### Кінематографічний
```js
default: {
   animation: "cinematic",
   duration:  { leave: 0.5, enter: 0.65 },
   ease:      { leave: "power3.in", enter: "power3.out" },
   color:     "#000",             // чорний overlay — ефект як у кіно
},
```

### Портфоліо / Арт-напрямок
```js
default: {
   animation: "iris",
   duration:  { leave: 0.55, enter: 0.7 },
   ease:      { leave: "power3.inOut", enter: "power3.out" },
   color:     "var(--color-primary)",   // колір бренду розкривається колом
},
```

### Технологічний / Futuristic
```js
default: {
   animation: "glitch",
   duration:  { leave: 0.5, enter: 0.45 },
   ease:      { leave: "power2.in", enter: "power2.out" },
   color:     null,
},
```

### Драматичний / Занурення
```js
default: {
   animation: "dive",
   duration:  { leave: 0.5, enter: 0.6 },
   ease:      { leave: "power3.in", enter: "back.out(1.1)" },
   color:     null,
},
```

### Шторка з кольором бренду
```js
default: {
   animation: "curtain",
   duration:  { leave: 0.45, enter: 0.55 },
   ease:      { leave: "power3.in", enter: "power3.out" },
   color:     "var(--color-primary)",
},
```

### Різні анімації для кожної сторінки
```js
default:  { animation: "fade",      color: null },
home:     { animation: "iris",      color: "var(--color-primary)", duration: { leave: 0.5, enter: 0.65 } },
about:    { animation: "slide-up",  color: null, duration: { leave: 0.3, enter: 0.5 } },
services: { animation: "curtain",   color: "#000", duration: { leave: 0.45, enter: 0.55 } },
contact:  { animation: "dive",      color: null, duration: { leave: 0.4, enter: 0.55 } },
```

---

## GSAP ease — швидка шпаргалка

```
"power1.out"              — м'яке гальмування
"power2.out"              — стандарт (рекомендується)
"power3.out"              — чітке зупинення
"power4.out"              — дуже різке зупинення
"expo.out"                — дуже швидкий старт, плавне закінчення
"sine.out"                — найм'якіше
"back.out(1.7)"           — невеликий overshoot (пружинка)
"elastic.out(1, 0.3)"     — пружна анімація
"bounce.out"              — відскок
"circ.out"                — кругова крива

"power2.inOut"            — прискорення і гальмування
"expo.inOut"              — різкий старт і стоп
```

---

## Приклади налаштувань

### Мінімальне (тільки fade)
```js
export const transitions = {
   default: {
      animation: "fade",
      duration:  { leave: 0.3, enter: 0.4 },
      ease:      { leave: "power2.in", enter: "power2.out" },
   },
};
```

### Різні анімації на кожній сторінці
```js
export const transitions = {
   default: {
      animation: "fade",
      duration:  { leave: 0.3, enter: 0.4 },
      ease:      { leave: "power2.in", enter: "power2.out" },
   },

   home: {
      animation: "push",
      duration:  { leave: 0.4, enter: 0.55 },
      ease:      { leave: "power3.in", enter: "power2.out" },
   },

   about: {
      animation: "iris",
      duration:  { leave: 0.5, enter: 0.7 },
      ease:      { leave: "power3.inOut", enter: "power3.out" },
   },

   services: {
      animation: "clip",
      duration:  { leave: 0.35, enter: 0.5 },
      ease:      { leave: "expo.in", enter: "expo.out" },
   },

   contact: {
      animation: "morph",
      duration:  { leave: 0.35, enter: 0.5 },
      ease:      { leave: "power2.in", enter: "back.out(1.2)" },
   },
};
```

### Швидкий і чистий (agency-стиль)
```js
default: {
   animation: "slide-up",
   duration:  { leave: 0.25, enter: 0.45 },
   ease:      { leave: "power3.in", enter: "expo.out" },
},
```

### Преміум повільний
```js
default: {
   animation: "morph",
   duration:  { leave: 0.5, enter: 0.7 },
   ease:      { leave: "power2.inOut", enter: "power2.out" },
},
```

---

## Анімація footer

За замовчуванням header і footer статичні — анімується тільки основний контент `<main>`.

Щоб footer теж анімувався разом з контентом — додай `animateFooter: true` в конфіг:

```js
// barba.config.js

default: {
   animation:     "fade",
   duration:      { leave: 0.3, enter: 0.45 },
   ease:          { leave: "power2.in", enter: "power2.out" },
   animateFooter: true,    // ← footer анімується разом
},

// Або тільки для конкретної сторінки:
home: {
   animation:     "iris",
   animateFooter: true,
},
```

> Footer завжди анімується fade + slide Y незалежно від типу анімації контенту.

---

## Вимкнути Barba (повернутись до звичайних переходів)

В `app.js` закоментувати один рядок:
```js
// import "@scripts/animation/barba";  // ← закоментувати
```

Сайт продовжить працювати — просто зі стандартними перезавантаженнями сторінок.

---

## Додати свою анімацію

В `barba.js` в об'єкт `ANIMATIONS` додати новий ключ:

```js
"my-animation": {
   leave: (el, duration, ease) => gsap.to(el, {
      // будь-яка CSS властивість
      opacity: 0,
      y: -50,
      rotate: 5,
      duration,
      ease,
   }),
   enter: (el, duration, ease) => gsap.from(el, {
      opacity: 0,
      y: 50,
      rotate: -5,
      duration,
      ease,
   }),
},
```

Потім використовувати в `barba.config.js`:
```js
about: { animation: "my-animation" }
```

---

## Заборонити перехід для конкретного посилання

Додати клас `no-transition`:
```html
<a href="/page" class="no-transition">Без анімації</a>
```

---

## Підключення власних скриптів — сумісність з Barba ⚠️

> Це найважливіший розділ якщо пишеш нові скрипти. Неправильне підключення = скрипт не працює після Barba-навігації.

### Чому скрипти ламаються після переходу

Barba не перезавантажує сторінку — він замінює лише `<main data-barba="container">`. Це означає:

- `<script>` теги всередині Astro компонентів запускаються **тільки один раз** при початковому завантаженні
- Якщо юзер зайшов спочатку на **іншу сторінку** (де скрипт відсутній), а потім перейшов на **цільову** — скрипт ніколи не виконався, `page:ready` listener не зареєстрований → скрипт не ініціалізується

**Приклад проблеми:**
```
/blog → перезавантаження → /home (Barba) → партнери не анімуються ❌
```
Причина: `partners.js` ніколи не завантажувався на `/blog`, тому `page:ready` listener відсутній.

---

### ✅ Правильний патерн підключення

Всі скрипти мають проходити через `loadModules()` в `app.js`. Саме він викликається на кожен `page:ready`.

#### Крок 1 — Додати в `app.js`

```js
// src/scripts/app.js — в функцію loadModules()

if (document.querySelector("[data-my-feature]"))
   tasks.push(import("@scripts/init/my-feature"));
```

Selector перевіряє чи є елемент **на поточній сторінці** після кожного Barba-переходу.

#### Крок 2 — Написати скрипт за шаблоном

```js
// src/scripts/init/my-feature.js

function initMyFeature() {
   const elements = document.querySelectorAll("[data-my-feature]");

   elements.forEach((el) => {
      // Захист від подвійної ініціалізації
      if (el.dataset.myFeatureInit) return;
      el.dataset.myFeatureInit = "true";

      // ... логіка
   });
}

// Запуск при першому завантаженні (якщо DOM вже готовий)
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initMyFeature);
} else {
   initMyFeature();
}

// Запуск після кожного Barba-переходу
document.addEventListener("page:ready", initMyFeature);
```

#### Крок 3 — Прибрати `<script>` з Astro компонента (якщо є)

```astro
<!-- ❌ НЕ ПРАВИЛЬНО — запускається лише раз при першому завантаженні -->
<script>
   import "@scripts/init/my-feature";
</script>

<!-- ✅ ПРАВИЛЬНО — нічого не імпортуємо в компоненті, все через app.js -->
```

#### Крок 4 — Додати cleanup в `barba.js`

Щоб при переході скидався прапорець ініціалізації:

```js
// src/scripts/animation/barba.js — в функцію cleanupPage()

["[data-my-feature][data-my-feature-init]", "myFeatureInit"],
```

---

### Захист від подвійної ініціалізації

`loadModules()` викликається при кожному `page:ready`. Без захисту — скрипт ініціалізується двічі на одному елементі.

```js
// dataset-атрибут на елементі — скидається барбою при переході
if (el.dataset.myFeatureInit) return;
el.dataset.myFeatureInit = "true";
```

`cleanupPage()` в `barba.js` видаляє ці атрибути **перед** переходом → нова сторінка завжди отримує чисті елементи.

---

### Скасування при переході (для складних анімацій)

Якщо скрипт запускає `requestAnimationFrame`, таймери або підписки — їх треба скасувати при `page:leave`:

```js
// Реєстр активних функцій скасування
const activeCancels = new Set();

document.addEventListener("page:leave", () => {
   activeCancels.forEach((fn) => fn());
   activeCancels.clear();
});

function runAnimation(element) {
   let cancelled = false;

   function cancel() {
      cancelled = true;
      activeCancels.delete(cancel);
      // ... cleanup: clearInterval, removeEventListener, cancelAnimationFrame тощо
   }
   activeCancels.add(cancel);

   function tick() {
      if (cancelled) return;
      // ... анімація
      requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
}
```

---

### Page Visibility API (для canvas/rAF анімацій)

Коли юзер перемикає вкладку → `requestAnimationFrame` паузується, але `performance.now()` продовжує рахувати. При поверненні `elapsed` стрибає → анімація ламається.

```js
let hiddenAt = null;
let start = performance.now();

const onVisibility = () => {
   if (document.hidden) {
      hiddenAt = performance.now();
   } else if (hiddenAt !== null) {
      // Зміщуємо start на час відсутності — анімація відновлюється з тієї ж точки
      start += performance.now() - hiddenAt;
      hiddenAt = null;
   }
};
document.addEventListener("visibilitychange", onVisibility);

// Прибираємо при cleanup
function cancel() {
   document.removeEventListener("visibilitychange", onVisibility);
}
```

---

### Чеклист нового скрипта ✅

```
□ Selector перевірено в loadModules() (app.js)
□ Скрипт НЕ імпортується напряму в Astro компоненті
□ initXxx() викликається одразу + реєструється в page:ready
□ dataset-прапорець захищає від подвійної ініціалізації
□ Прапорець очищається в cleanupPage() (barba.js)
□ rAF / інтервали / listeners скасовуються при page:leave
□ Page Visibility API компенсує час прихованої вкладки
```

---

### Приклад — partners.js (реальний кейс)

```
Проблема: юзер зайшов на /blog → F5 → перейшов на /home → зірки не анімуються

Причина: partners.js підключався через <script> в Partners.astro
         → не виконувався на /blog
         → page:ready listener відсутній
         → після Barba-переходу на /home — не ініціалізується

Рішення:
1. Прибрали <script> з Partners.astro
2. Додали в loadModules():
      if (document.querySelector("[data-partners]"))
         tasks.push(import("@scripts/init/partners"));
3. partners.js: initPartners() + page:ready listener
4. cleanupPage(): ["[data-partners][data-partners-init]", "partnersInit"]
5. page:leave: activeCancels.forEach(fn => fn()) — скасування rAF
6. visibilitychange: компенсація часу прихованої вкладки
```
