# Scroll Parallax — "фонова" картинка, що рухається повільніше/швидше за скрол

Класичний background-parallax (картинка ледь "відстає" від скролу), реалізований через `translateY` + `IntersectionObserver` — **на відміну від `background-attachment: fixed`, працює на iOS Safari**, плавний, без репейнтів.

```
src/scripts/init/scroll-parallax.js
```

Підключення вже є в `src/scripts/app.js` — спрацьовує автоматично, якщо на сторінці є хоч один `[data-scroll-parallax]`.

> У поточному проєкті цей ефект ніде не використовується — це готовий до перевикористання модуль для інших збірок на цьому шаблоні.

---

## Як підключити

1. Контейнер з **фіксованою/обчислюваною висотою** (через CSS — `height`, `aspect-ratio`, `min-height` тощо) отримує `data-scroll-parallax`.
2. Картинка (або відео) всередині отримує `data-scroll-parallax-item data-scroll-parallax-shift="100"`.

```html
<section class="hero" style="height: 60vh;" data-scroll-parallax>
   <img src="/bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="100" />

   <div class="hero__content">...</div>
</section>
```

**Більше нічого робити не треба** — скрипт автоматично:

- ставить контейнеру `overflow: hidden`, `position: relative` і `contain: paint` (якщо не задано);
- збільшує картинку на `2 × shift` по висоті (`height: calc(100% + 200px)`) і зсуває її на `-shift` (`top: -100px`), щоб під час руху ніколи не з'явилась "дірка" по краях;
- додає `object-fit: cover` для `<img>`/`<video>`.

### У цьому проєкті — через `<Img>` / `<Video>`

**В проєкті немає прямих `<img>`/`<video>` — лише компоненти `<Img>` (`src/components/media/Img.astro`) і `<Video>` (`src/components/media/Video.astro`).** Обидва пропускають будь-які невідомі пропси через `...restProps` прямо на `<img>`/`<video>`, тож `data-scroll-parallax-*` передаються як звичайні пропси:

```astro
---
import Img from "@components/media/Img.astro";
---

<div class="hero__media" data-scroll-parallax>
   <Img
      src={heroImg}
      alt=""
      loading="eager"
      data-scroll-parallax-item
      data-scroll-parallax-shift="100"
   />
</div>
```

`data-scroll-parallax` ставиться на **окрему обгортку** (`.hero__media`, із заданою через CSS висотою), а `data-scroll-parallax-item`/`data-scroll-parallax-shift` — пропсами на `<Img>`/`<Video>`, вони приземляться на сам `<img>`/`<video>` всередині `.img-wrapper`. `.img-wrapper` не має `position`, тож абсолютно позиціонований `<img>` орієнтується саме на `.hero__media` (яка отримує `position: relative` автоматично) — `wrapperClass`/`aspect-ratio` для `<Img>` тут не потрібні.

Усі приклади нижче — для стислості написані через звичайний `<img>`, але в реальному коді просто замінюй `<img src="..." alt="" ...>` на `<Img src={...} alt="" ...>` (або `<Video ... />`) з тими самими `data-scroll-parallax-*` пропсами.

---

## Атрибути

| Атрибут | Тип | Дефолт | Опис |
|---|---|---|---|
| `data-scroll-parallax` | — | — | Маркер контейнера (обов'язково задати йому висоту через CSS) |
| `data-scroll-parallax-item` | — | — | Елемент, що рухається (зазвичай `<img>`, можна `<video>` або `<div>` з фоном) |
| `data-scroll-parallax-shift` | `number` (px) | `0` | Максимальний зсув картинки вгору/вниз, поки контейнер проходить через в'юпорт. Більше значення — сильніший ефект, але й більший "запас" картинки (потрібна якісна картинка з запасом по висоті) |
| `data-scroll-parallax-shift-x` | `number` (px) | `0` | Опційно: те саме по горизонталі (`translateX`). "Запас" по ширині розраховується автоматично, так само як для `shift` |
| `data-scroll-parallax-scale` | `number` | `0` (вимкнено) | Опційно: Ken Burns zoom-in — `scale` росте з `1` до `1 + scale`, поки контейнер проходить через в'юпорт. Оскільки масштаб лише збільшує картинку, додатковий "запас" не потрібен |
| `data-scroll-parallax-rotate` | `number` (deg) | `0` (вимкнено) | Опційно: легкий поворот картинки (`rotate`), що синхронізований зі скролом — від `+rotate°` до `-rotate°`, `0°` у центрі в'юпорта. Скрипт сам додає відсотковий запас з кожного боку, щоб після повороту кути не "відкрили" фон контейнера |
| `data-scroll-parallax-fade` | `number` (0..1) | `0` (вимкнено) | Опційно: `opacity` згасає на краях в'юпорта (повна прозорість при значенні `1`) і повертається до `1` у центрі |
| `data-scroll-parallax-blur` | `number` (px) | `0` (вимкнено) | Опційно: на краях в'юпорта картинка розфокусована (`blur`), у центрі — чітка (`blur: 0`) |

**Напрямок руху**: від'ємний `shift`/`shift-x` інвертує напрямок (картинка рухається в протилежний бік відносно скролу) — розмір "запасу" розраховується від `|shift|`/`|shift-x|`, тож дірок не буде в обох випадках.

---

## Приклади

**Базовий фон секції**:

```html
<section class="promo" style="height: 50vh;" data-scroll-parallax>
   <img src="/promo-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="80" />
   <div class="promo__content">...</div>
</section>
```

**Сильніший ефект (велика hero-секція)**:

```html
<section class="hero" style="height: 100vh;" data-scroll-parallax>
   <img src="/hero-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="160" />
</section>
```

**Декілька шарів з різною швидкістю** (глибина):

```html
<section class="hero" style="height: 80vh;" data-scroll-parallax>
   <img src="/layer-back.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="140" />
   <img src="/layer-front.png" alt="" data-scroll-parallax-item data-scroll-parallax-shift="60" />
</section>
```

**Горизонтальний зсув** (`shift-x`) — для композицій, де картинка ширша за контейнер (напр. широкий пейзаж у вузькій секції):

```html
<section class="hero" style="height: 80vh;" data-scroll-parallax>
   <img src="/wide-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="80" data-scroll-parallax-shift-x="60" />
</section>
```

**Ken Burns zoom-in** (`scale`) — картинка повільно "наближається" по ходу скролу через секцію:

```html
<section class="hero" style="height: 100vh;" data-scroll-parallax>
   <img src="/hero-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="100" data-scroll-parallax-scale="0.15" />
</section>
```

`scale="0.15"` означає, що картинка плавно збільшиться з `1` до `1.15`, поки секція проходить через екран. Можна комбінувати з `shift`/`shift-x` — це дає одночасно зсув і зум.

**Легкий поворот** (`rotate`) — картинка ледь "хитається" по ходу скролу:

```html
<section class="hero" style="height: 100vh;" data-scroll-parallax>
   <img src="/hero-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-rotate="4" />
</section>
```

Рекомендований діапазон — `2-8°`, більші кути виглядають надто "грайливо" для фонової картинки.

**Fade на краях** (`fade`) — картинка плавно з'являється/зникає, поки секція входить/виходить з екрана:

```html
<section class="hero" style="height: 100vh;" data-scroll-parallax>
   <img src="/hero-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="100" data-scroll-parallax-fade="0.8" />
</section>
```

**Blur-to-focus** (`blur`) — картинка розфокусована на краях в'юпорта і стає чіткою в центрі (кінематографічний ефект):

```html
<section class="hero" style="height: 100vh;" data-scroll-parallax>
   <img src="/hero-bg.jpg" alt="" data-scroll-parallax-item data-scroll-parallax-shift="100" data-scroll-parallax-blur="10" />
</section>
```

Усі опційні атрибути (`shift-x`, `scale`, `rotate`, `fade`, `blur`) можна комбінувати між собою — кожен впливає на свою частину `transform`/`opacity`/`filter` незалежно.

---

## Як підібрати `shift`

`shift` — це **запас у px**, на скільки картинка має бути більшою за контейнер з кожного боку по вертикалі (скрипт додає це автоматично через `calc()`). Орієнтири:

| Висота секції | Рекомендований `shift` |
|---|---|
| ~40-60vh (банер/промо) | `60–100` |
| ~80-100vh (hero на весь екран) | `120–200` |

Якщо картинка низької роздільної здатності — занадто великий `shift` може зробити "запас" помітно розмитим/пікселізованим при скролі. Для великих `shift` бери картинку з запасом по висоті (~ `висота секції + 2 × shift`).

---

## Поведінка та обмеження

- **`prefers-reduced-motion: reduce`** — картинка отримує потрібний розмір (без "дірок"), але `transform` не рухається — ефект вимкнено для користувачів, що просять менше анімації.
- **`IntersectionObserver`** — `scroll`/`resize` обробляються лише поки контейнер у в'юпорті (+ запас `25%`). Поза екраном — жодних обчислень.
- **rAF-throttle** — `transform` оновлюється не частіше ніж раз на кадр.
- **Контейнеру потрібна висота** — без CSS-висоти (`height`/`aspect-ratio`/`min-height`) контейнер "стиснеться" до висоти картинки і ефект буде непомітний.
- **Працює на мобільних/iOS** — на відміну від `background-attachment: fixed`.

### Продуктивність

- Контейнер автоматично отримує `contain: paint` — браузер ізолює перемальовування "виїжджаючої" картинки всередині контейнера, не зачіпаючи решту сторінки.
- `translate`/`scale`/`rotate`/`opacity` не викликають reflow/layout (тільки compositing) — дешеві для будь-якої кількості елементів.
- `data-scroll-parallax-blur` використовує `filter: blur()` — дорожчий за `transform`/`opacity` (потребує репейнту шару). Використовуй помірні значення (`5-15px`) і не на дуже великих картинках.

---

## Barba.js

Той самий патерн, що й `parallax.js`:

- ініціалізація на `DOMContentLoaded` + `page:ready`, guard `data-scroll-parallax-init` на контейнері.
- Окремого запису в `cleanupPage()` не потрібно — контейнер видаляється разом з Barba-контейнером.
- Активні `IntersectionObserver`/`scroll`/`resize` listeners коректно знімаються на `page:leave`.
