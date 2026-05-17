# Slider

Архітектура: **кожен слайдер — окремий самодостатній Astro-компонент**.  
Дані, HTML, стилі і Swiper-конфіг — все в одному файлі. На сторінці тільки `<MySlider />`.

```
src/components/sliders/
├── Slider.astro          — базовий конфігурований wrapper (опційно)
├── ReviewsSlider.astro   — приклад: слайдер відгуків
└── HeroSlider.astro      — (створюєш коли треба)
```

```
src/styles/components/sliders/
└── _slider.scss          — спільні стилі: стрілки, пагінація
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fslider-new` | Новий самодостатній компонент — дані, HTML, стилі, Swiper скрипт |
| `fslider` | Підключити готовий компонент на сторінці (`<MySlider />`) |

---

## Чому така архітектура

| Звичайний підхід | Наш підхід |
|---|---|
| `<Slider slides={data} config={...} />` — купа пропів | `<ReviewsSlider />` — нічого зайвого |
| Конфіг розкиданий по сторінці | Конфіг в одному файлі |
| Однаковий HTML для всіх слайдів | Кожен слайдер має свій унікальний HTML |
| Складно кастомізувати | Відкрив файл → змінив → готово |

---

## Як створити новий слайдер

**1. Сніпет `fslider-new`** → вводиш назву (`hero`, `team`, `gallery`) → генерується повний файл.

**2. Структура файлу:**

```astro
---
// 1. Swiper CSS (обов'язково!)
import "swiper/css";
// + ефекти якщо треба:
// import "swiper/css/effect-fade";
// import "swiper/css/effect-cards";

// 2. Спільні стилі стрілок/пагінації
import "@styles/components/sliders/_slider.scss";

// 3. Дані прямо тут
const slides = [
   { title: "Заголовок", text: "Текст" },
];
---

<!-- 4. HTML -->
<div class="my-slider">
   <div class="swiper">
      <div class="swiper-wrapper">
         {slides.map((s) => (
            <div class="swiper-slide">
               <!-- твій кастомний HTML картки -->
            </div>
         ))}
      </div>
      <div class="my-slider__pagination swiper-pagination"></div>
   </div>

   <!-- стрілки (зі _slider.scss) -->
   <button class="slider__arrow slider__arrow--prev" aria-label="Попередній">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
         <polyline points="15 18 9 12 15 6"/>
      </svg>
   </button>
   <button class="slider__arrow slider__arrow--next" aria-label="Наступний">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
         <polyline points="9 18 15 12 9 6"/>
      </svg>
   </button>
</div>

<!-- 5. Стилі картки -->
<style>
   .my-slider { position: relative; padding-bottom: 2.5rem; }
   .my-card { /* ... */ }
</style>

<!-- 6. Swiper ініціалізація -->
<script>
   import Swiper from "swiper";
   import { Navigation, Pagination } from "swiper/modules";

   function init() {
      document.querySelectorAll(".my-slider").forEach((el) => {
         if (el.dataset.swiperInit) return;
         el.dataset.swiperInit = "true";

         new Swiper(el.querySelector(".swiper"), {
            modules: [Navigation, Pagination],
            // ... твій конфіг
         });
      });
   }

   init();
   document.addEventListener("astro:page-load", init);
</script>
```

**3. Підключення на сторінці** — тільки це:

```astro
---
import MySlider from "@components/sliders/MySlider.astro";
---

<MySlider />
```

---

## Swiper JS — основні параметри

> Повна документація: **https://swiperjs.com/swiper-api**

### Базові

```js
new Swiper(".swiper", {
   slidesPerView: 3,        // кількість видимих слайдів
   spaceBetween: 24,        // відступ між слайдами (px)
   loop: true,              // нескінченна прокрутка
   speed: 500,              // швидкість переходу (ms)
   grabCursor: true,        // курсор-рука при drag
   centeredSlides: false,   // активний слайд по центру
   initialSlide: 0,         // початковий слайд (з 0)
   direction: "horizontal", // "horizontal" | "vertical"
   watchOverflow: true,     // вимикає Swiper якщо слайдів менше ніж slidesPerView
});
```

### Responsive (breakpoints)

```js
breakpoints: {
   // ключ = min-width у пікселях
   0:    { slidesPerView: 1, spaceBetween: 16 },
   640:  { slidesPerView: 2, spaceBetween: 20 },
   1024: { slidesPerView: 3, spaceBetween: 24 },
   1440: { slidesPerView: 4, spaceBetween: 30 },
},
```

### Навігація (стрілки)

```js
// Імпорт:
import { Navigation } from "swiper/modules";

// Конфіг:
modules: [Navigation],
navigation: {
   prevEl: el.querySelector(".slider__arrow--prev"), // або ".swiper-button-prev"
   nextEl: el.querySelector(".slider__arrow--next"),
   disabledClass: "swiper-button-disabled",          // клас на disabled стрілці
   hideOnClick: false,
},
```

### Пагінація (булети / дроби / прогрес-бар)

```js
// Імпорт:
import { Pagination } from "swiper/modules";

// Булети (default):
modules: [Pagination],
pagination: {
   el: el.querySelector(".swiper-pagination"),
   clickable: true,
   type: "bullets",            // "bullets" | "fraction" | "progressbar" | "custom"
   dynamicBullets: true,       // булети міняють розмір (як у YouTube)
},

// Дроби (1 / 5):
pagination: { el: "...", type: "fraction" },

// Прогрес-бар:
pagination: { el: "...", type: "progressbar" },
```

CSS для progressbar треба додати самостійно або імпортувати:
```js
import "swiper/css/pagination";
```

### Autoplay

```js
import { Autoplay } from "swiper/modules";

modules: [Autoplay],
autoplay: {
   delay: 3000,                  // ms між слайдами
   disableOnInteraction: false,  // не зупиняти після drag
   pauseOnMouseEnter: true,      // пауза при наведенні
   stopOnLastSlide: false,
},
```

### Ефекти

> Кожен ефект потребує свій CSS-імпорт і модуль!

#### Fade
```js
import "swiper/css/effect-fade";
import { EffectFade } from "swiper/modules";

modules: [EffectFade],
effect: "fade",
fadeEffect: { crossFade: true },
```

#### Cards (стопка карток)
```js
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

modules: [EffectCards],
effect: "cards",
cardsEffect: {
   slideShadows: true,
   rotate: true,
   perSlideOffset: 8,
   perSlideRotate: 2,
},
```

#### Coverflow
```js
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper/modules";

modules: [EffectCoverflow],
effect: "coverflow",
coverflowEffect: {
   rotate: 30,       // кут повороту
   stretch: 0,       // розтяжка між слайдами
   depth: 100,       // глибина (z-axis)
   modifier: 1,
   slideShadows: true,
},
centeredSlides: true,
```

#### Creative (повна свобода анімації)
```js
import "swiper/css/effect-creative";
import { EffectCreative } from "swiper/modules";

modules: [EffectCreative],
effect: "creative",
creativeEffect: {
   prev: {
      shadow: true,
      translate: ["-120%", 0, -500],  // [x, y, z]
   },
   next: {
      translate: ["100%", 0, 0],
   },
},
```

### Scrollbar

```js
import "swiper/css/scrollbar";
import { Scrollbar } from "swiper/modules";

modules: [Scrollbar],
scrollbar: {
   el: ".swiper-scrollbar",
   draggable: true,
   hide: false,
},
```

### Keyboard / Mousewheel

```js
import { Keyboard, Mousewheel } from "swiper/modules";

modules: [Keyboard, Mousewheel],
keyboard: { enabled: true },
mousewheel: { enabled: true, releaseOnEdges: true },
```

### Thumbs (мініатюри)

```js
import { Thumbs } from "swiper/modules";

// Ініціалізуєш два Swiper:
const thumbsSwiper = new Swiper(".gallery-thumbs", {
   slidesPerView: 4,
   spaceBetween: 8,
});

const mainSwiper = new Swiper(".gallery-main", {
   modules: [Thumbs],
   thumbs: { swiper: thumbsSwiper },
});
```

---

## Events — корисні колбеки

```js
new Swiper(".swiper", {
   on: {
      slideChange(swiper) {
         console.log("Активний слайд:", swiper.activeIndex);
      },
      reachEnd(swiper) {
         console.log("Останній слайд");
      },
      init(swiper) {
         console.log("Swiper ініціалізовано");
      },
   },
});
```

---

## Корисні методи (в консолі або в коді)

```js
const swiper = new Swiper(...);

swiper.slideNext();           // наступний слайд
swiper.slidePrev();           // попередній слайд
swiper.slideTo(2);            // перейти до слайду з індексом 2
swiper.activeIndex;           // поточний індекс
swiper.slides.length;         // кількість слайдів
swiper.autoplay.start();      // запустити autoplay
swiper.autoplay.stop();       // зупинити autoplay
swiper.destroy();             // знищити Swiper (для cleanup)
swiper.update();              // перерахувати розміри (після зміни DOM)
```

---

## Приклад: додати новий модуль з офіційного сайту

1. Йдеш на **https://swiperjs.com/swiper-api** → знаходиш потрібний модуль
2. Додаєш CSS-імпорт у `---` блок компонента:
   ```js
   import "swiper/css/effect-flip";
   ```
3. Додаєш модуль у `<script>`:
   ```js
   import { EffectFlip } from "swiper/modules";
   ```
4. Додаєш у `modules: [...]` і конфіг:
   ```js
   modules: [Navigation, Pagination, EffectFlip],
   effect: "flip",
   ```

---

## Спільні стилі (`_slider.scss`)

Стрілки і пагінація-булети описані в `_slider.scss` і доступні в **будь-якому** слайдері:

```scss
.slider__arrow          // базова стрілка
.slider__arrow--prev    // ліва
.slider__arrow--next    // права
.slider__pagination     // wrapper для булетів
```

Кастомні стилі картки — **в `<style>` тегу компонента** (скоуповано автоматично Astro).
