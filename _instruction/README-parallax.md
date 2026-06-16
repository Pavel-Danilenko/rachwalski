# Parallax — mousemove-ефект для будь-якого блоку

Узагальнений ефект "елементи злегка рухаються за курсором" (як на головній у секції `treatments`). Без жодних класів і власного JS на сторінці — все налаштовується атрибутами `data-*` прямо в розмітці.

```
src/scripts/init/parallax.js
```

Підключення скрипта вже є в `src/scripts/app.js` — спрацьовує автоматично, якщо на сторінці є хоч один `[data-parallax]`.

---

## Як підключити

1. На контейнер (блок, всередині якого рухаються елементи) додай `data-parallax`.
2. На кожен елемент, що має рухатись, додай `data-parallax-item` + налаштування.

```html
<div class="my-block" data-parallax>
   <img src="..." alt="" data-parallax-item data-parallax-strength="-12" data-parallax-scale="1.02" />

   <div class="my-block__dot" data-parallax-item data-parallax-strength="20"></div>
</div>
```

В Astro-компоненті з `<Img>` — атрибути просто передаються як пропси (вони прокидаються на `<img>` через `...restProps`):

```astro
<div class="treatments__media" data-parallax>
   <Img
      src={img1}
      alt="..."
      data-parallax-item
      data-parallax-strength="-12"
      data-parallax-scale="1.02"
   />

   <div class="treatments__dot" data-parallax-item data-parallax-strength="20">
      <span class="treatments__dot-ring"></span>
   </div>
</div>
```

---

## Атрибути

### На контейнері `[data-parallax]`

| Атрибут | Тип | Дефолт | Опис |
|---|---|---|---|
| `data-parallax` | — | — | Маркер контейнера, обов'язковий |
| `data-parallax-min-width` | `number` (px) | — | Якщо ширина екрана менша — ефект для цього блоку не ініціалізується (корисно, якщо на планшетах з мишкою ефект не потрібен) |
| `data-parallax-perspective` | `number` (px) | `800` | `perspective` контейнера для 3D-tilt (`data-parallax-rotate`). Застосовується автоматично, лише якщо хоч один елемент має `data-parallax-rotate` |
| `data-parallax-lerp` | `number` (0..1) | — | Увімкнути інерційний рух через `requestAnimationFrame`. Менше значення = повільніше "доганяння" і плавніший рух. Якщо не задано — звичайний режим (CSS `transition`) |

### На кожному елементі `[data-parallax-item]`

| Атрибут | Тип | Дефолт | Опис |
|---|---|---|---|
| `data-parallax-item` | — | — | Маркер елемента, що рухається |
| `data-parallax-strength` | `number` (px) | `0` | Сила і напрямок зсуву. Додатне значення — елемент рухається **за** курсором, від'ємне — **проти** курсору (паралакс "вглиб") |
| `data-parallax-scale` | `number` | `1` | Опційний zoom при русі (напр. `1.02` — легке збільшення картинки) |
| `data-parallax-rotate` | `number` (deg) | — | Опційний 3D-tilt — елемент нахиляється (`rotateX`/`rotateY`) залежно від положення курсору. Контейнер автоматично отримує `perspective` |
| `data-parallax-ease` | `number` (мс) | — | Плавність (`transition-duration`) саме для цього елемента. Ігнорується, якщо на контейнері увімкнено `data-parallax-lerp` (плавність там керується самим `lerp`). Якщо не задано — береться значення з CSS (`transition` у відповідному `.scss`) |

---

## Приклади

**Картинка "вглиб" + декоративні крапки "ближче до курсору"** (як у `treatments`):

```html
<div class="card__media" data-parallax>
   <img data-parallax-item data-parallax-strength="-12" data-parallax-scale="1.02" />
   <div class="dot" data-parallax-item data-parallax-strength="20"></div>
   <div class="dot" data-parallax-item data-parallax-strength="28"></div> <!-- інша глибина -->
</div>
```

**Вимкнути ефект на планшетах** (наприклад, лишити тільки від 1024px):

```html
<div class="card__media" data-parallax data-parallax-min-width="1024">
   ...
</div>
```

**Кастомна плавність окремого елемента**:

```html
<div class="dot" data-parallax-item data-parallax-strength="20" data-parallax-ease="600"></div>
```

**3D-tilt (нахил картки за курсором)**:

```html
<div class="card" data-parallax>
   <div class="card__inner" data-parallax-item data-parallax-strength="-8" data-parallax-rotate="6"></div>
</div>
```

`perspective` для контейнера ставиться автоматично (`800px`), за потреби — `data-parallax-perspective="1200"`.

**Інерційний (lerp) рух** — елемент "доганяє" курсор з легкою затримкою, замість миттєвого зсуву + CSS-transition:

```html
<div class="card__media" data-parallax data-parallax-lerp="0.1">
   <img data-parallax-item data-parallax-strength="-12" data-parallax-scale="1.02" />
</div>
```

Менше значення `data-parallax-lerp` (напр. `0.05`) — повільніший, "масляний" рух; більше (напр. `0.3`) — швидша реакція, ближче до звичайного режиму.

---

## Поведінка та обмеження

- **Тільки desktop з мишкою** — ефект вимикається автоматично, якщо `(any-hover: hover)` не підтримується (тач-пристрої) або користувач має `prefers-reduced-motion: reduce`.
- **`data-parallax-min-width`** перевіряється лише при ініціалізації (на завантаженні сторінки / `page:ready`), без відстеження `resize`.
- **Плавність (`transition`)** не задається в JS за замовчуванням — рух одразу "стрибає" за курсором, а плавне "доїжджання" дає `transition: transform ...` у CSS відповідного елемента (як зараз для `.treatments__media img` і `.treatments__dot` — `0.4s ease-out`). `data-parallax-ease` лише перевизначає тривалість для конкретного елемента.
- **`data-parallax-lerp`** — альтернатива CSS-transition: рух рахується через `requestAnimationFrame` з інерцією. Активний лише для контейнерів, де явно вказано цей атрибут; `data-parallax-ease` для них не діє.
- **Reset** — на `mouseleave` контейнера всі `[data-parallax-item]` повертаються в `transform: ""` (звичайний режим) або плавно "доїжджають" до 0 (режим `lerp`).
- **Barba.js** — ініціалізується на `page:ready` з guard'ом `data-parallax-init` на контейнері, як інші скрипти. Окремого запису в `cleanupPage()` не потрібно — елемент видаляється разом з Barba-контейнером. Активні `lerp`-цикли (`requestAnimationFrame`) скасовуються на `page:leave`.

### Продуктивність

- **Звичайний режим** — запис `style.transform` обгорнутий у `requestAnimationFrame` (rAF-throttle): скільки б разів `mousemove` не "стрельнув" за кадр (буває 60-240/сек на трекпадах/високочастотних екранах), у DOM пишеться лише останнє значення, один раз на кадр.
- **`lerp`-режим** — `requestAnimationFrame`-цикл автоматично зупиняється, коли елемент "доїхав" до цілі (курсор не рухається), і відновлюється на наступному `mousemove`/`mouseleave` — без вічного фонового rAF на нерухомій сторінці.
- `transform` не викликає reflow/layout (тільки compositing), додаткових залежностей немає.

---

## Поточне використання

Секція `treatments` (`src/components/section/TreatmentsHotspot.astro`) — картинка зсувається "вглиб" (`-12px`, `scale(1.02)`), крапки-хотспоти рухаються "за курсором" (`+20px`).
