# settings.scss — головний конфіг проєкту

Один файл керує сіткою, брейкпоінтами, типографікою, кнопками, радіусами, z-index та transitions для всього сайту. Змінив тут → оновилось скрізь.

```
src/styles/settings.scss          ← сам конфіг (SCSS-змінні)
src/styles/base/_variables.scss   ← генерує з нього CSS custom properties (--color-*, --text-*, --radius-* ...)
src/styles/main.scss              ← контейнер, wrapper, класи-модифікатори контейнера
src/styles/utils/_mixins.scss     ← міксини (respond-to, fluid-space, bleed-grid ...), теж читають settings
```

> ⚠️ Після зміни **брейкпоінтів** запусти `npm run snippets` — оновляться px-підказки у VS Code сніпетах.

---

## Сітка

| Змінна | Дефолт | Що означає |
|---|---|---|
| `$min-width` | `320` | Мінімальна ширина сайту (px). `wrapper` не стискається вужче |
| `$max-width` | `1440` | Верхня межа для fluid-розрахунків (`fluid-space`, type-scale) |
| `$max-width-container` | `1280` | Ширина **контенту** контейнера, без бокових падінгів |
| `$container-padding` | `30` | Сумарний боковий падінг контейнера (по 15px з кожного боку) |
| `$container-width` | `1280 + 30 = 1310` | Повна ширина контейнера З падінгами — саме вона стоїть у `max-width` |

Контейнером стає **будь-який** елемент з класом `*__container` (BEM-режим, див. `$container-selector-type` нижче): `header__container`, `hero__container`, `faq__container` — усі отримують однакову ширину/падінги/центрування автоматично, окремий клас `.container` писати не треба.

### Як контейнер влаштований під капотом (main.scss)

```scss
[class*="__container"] {
   width: 100%;
   max-width: var(--container-w, 81.875rem);      // 1310px — стандарт
   padding-left: var(--container-pad, 0.9375rem);  // 15px
   padding-right: var(--container-pad, 0.9375rem);
   margin: 0 auto;
}
```

Ширина і падінги читаються з CSS-змінних `--container-w` / `--container-pad` з fallback-ом на стандарт. Це дає три способи кастомізації без перезапису стилів (у DevTools нічого не закреслюється).

---

## Кастомні розміри контейнера

### Спосіб 1 — клас з мапи (для повторюваних розмірів)

У `settings.scss`:

```scss
$container-sizes: (
   "wide": 1382,     // → клас .container--wide
   // "narrow": 960, // → клас .container--narrow (додай коли треба)
);

$container-paddings: (
   // "roomy": 30,   // → клас .container-pad--roomy (30px з кожного боку)
   // "flush": 0,    // → клас .container-pad--flush (без відступів)
);
```

Кожен рядок автоматично стає класом (генерація в `main.scss`). У розмітці — додатковим класом поверх будь-якого `*__container`:

```html
<div class="header__container container--wide">
<div class="post__container container--narrow container-pad--roomy">
```

**Семантика значень:**
- `$container-sizes` — **повна** ширина контейнера в px, бокові падінги вже враховані (`box-sizing: border-box`). Тобто `"wide": 1382` = 1382px від краю до краю, контент усередині = 1382 − 2×15 = 1352px.
- `$container-paddings` — падінг **з кожного боку** в px (стандарт — 15).

### Спосіб 2 — інлайн-змінна (разовий випадок)

Коли розмір потрібен один раз і плодити клас у мапі шкода:

```html
<div class="hero__container" style="--container-w: 75rem">
<div class="cta__container" style="--container-pad: 2rem">
```

### Спосіб 3 — змінна на батьківській секції (каскад)

CSS-змінні успадковуються, тож можна задати ширину для цілої секції/сторінки — всі `*__container` всередині підхоплять:

```scss
.landing-hero {
   --container-w: #{toRem(1382)};
}
```

> ⚠️ Це і фіча, і підводний камінь: змінна на батьку зачепить **усі** вкладені контейнери, включно з тими, що всередині вкладених секцій. Якщо треба тільки один — вішай клас/інлайн на сам елемент.

### Поради

- 2–3 розміри покривають 99% макетів (стандарт + широкий + вузький для тексту). Якщо в мапі з'явились близнюки типу 1360/1382/1400 — уточни макет у дизайнера.
- Іменуй за призначенням, якщо розмір специфічний: `"header": 1382` теж валідно.

---

## Брейкпоінти

| Змінна | Значення | Ключ у `$breakpoints` |
|---|---|---|
| `$pc` | `$container-width` (1310) | `xl` |
| `$tablet` | `991.98` | `lg` |
| `$mobile` | `767.98` | `md` |
| `$mobile-small` | `479.98` | `sm` |
| — | `320` | `xs` |
| `$max-width` | `1440` | `xxl` |

Використання через міксини (приймають і ключ, і число):

```scss
@include respond-to("md") { ... }    // max-width: 767.98px (desktop-first)
@include respond-from("md") { ... }  // min-width: 768px (mobile-first)
@include respond-to(1199) { ... }    // довільне число теж можна
```

---

## Режими (перемикачі)

| Змінна | Дефолт | Варіанти |
|---|---|---|
| `$responsive-type` | `1` | `1` — контейнер один на всі екрани (fluid). `2` — «сходинки»: 970px на tablet, 750px на mobile (як Bootstrap). Коментар у main.scss радить `2`, але проєкт живе на `1` — і це ок для fluid-дизайну |
| `$container-selector-type` | `"bem"` | `"bem"` — контейнер = будь-який `[class*="__container"]`. `"class"` — тільки явний `.container` |

> ⚠️ При `$responsive-type: 2` медіа-запити задають `max-width`/`padding` напряму і переб'ють значення з `--container-w`/`--container-pad` на менших екранах. З дефолтним `1` конфлікту немає.

---

## Типографіка

- `$font-primary` / `$font-secondary` — сімейства (обидва зараз DM Sans; Bai Jamjuree підключений точково в компонентах, напр. субтайтл прелоудера).
- `$font-size-base: 18` — базовий розмір.
- `$type-scale` — fluid-шкала: кожен ключ = пара min/max (px), між `$mobile` і `$pc` розмір тече плавно. Генерує `--text-xs` ... `--text-hero`.

```scss
font-size: var(--text-xl);      // у компоненті
@include type-scale("xl");      // або через міксин
```

> ⚠️ **Нюанс шкали:** `"2xl"` зараз (16–18) — **менший** за `"xl"` (22–28) і дорівнює `"base"`. Через це `h3` (scale: 2xl) рендериться дрібнішим за `h4` (scale: xl). Схоже на історичний артефакт — але воно так стилізує весь сайт, тому НЕ чіпай без окремого рішення і перевірки всіх сторінок.

- `$headings` — мапа h1–h6: кожен тег бере scale + вагу + line-height. `null` = успадкувати. Дефолти — у `$headings-defaults`.

---

## Решта секцій (коротко)

| Секція | Що генерує | Використання |
|---|---|---|
| `$border-widths` | `--border-sm` ... `--border-xl` | `border: var(--border-sm) solid ...` |
| `$radius` | `--radius-sm` ... `--radius-full` | `border-radius: var(--radius-lg)` |
| `$z-index` | `--z-below` ... `--z-toast` | `z-index: var(--z-modal, 400)` |
| `$transition` | `--transition-fast/base/slow/bounce` | `transition: color var(--transition-base)` |
| Кнопки (`$btn-*`) | базові стилі `<button>` | більшість `null` = стилі задають класи `.btn--*` |
| Посилання (`$link-*`) | колір/декорація `<a>` | |

---

## Підводні камені / FAQ

**`--container-max-width` ≠ `$container-width`.** CSS-змінна `--container-max-width` (з `base/_variables.scss`) = 1280 **без** падінгів, а `max-width` контейнера = 1310 **з** падінгами. Різні числа для різних задач — не плутай при використанні в компонентах.

**`bleed-grid` прив'язаний до стандартної ширини.** Міксини `bleed-grid` / `bleed-left` / `bleed-right` (full-bleed сітки в `_mixins.scss`) рахують offset від `$max-width-container` на етапі компіляції. Кастомний `.container--wide` на них **не впливає** — full-bleed секція завжди вирівнюється по стандартному контейнеру (1280).

**Чому мій `max-width` на `*__container` не працює?** Глобальне правило контейнера і твій локальний клас мають однакову специфічність — виграє той, хто пізніше в бандлі, а порядок бандла не гарантований. Правильний шлях: змінна `--container-w` (способи 1–3 вище), а не власний `max-width`.

**Змінив брейкпоінти — сніпети брешуть.** `npm run snippets` перегенерує підказки.
