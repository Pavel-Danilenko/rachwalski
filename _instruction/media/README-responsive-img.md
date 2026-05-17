# ResponsiveImg — різні зображення для desktop і mobile

Компонент для **art direction** — коли на мобайлі потрібне інше зображення, а не просто менший розмір того самого. Браузер завантажує **тільки одне** зображення — те, що підходить під поточний екран.

```
src/components/media/ResponsiveImg.astro
src/styles/components/media/_img.scss
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `frimg` | Базовий ResponsiveImg з імпортом |
| `frimg:hero` | Hero / LCP (eager + fetchpriority) |
| `frimg:bp` | З кастомним брейкпоінтом |

---

## Підключення

```astro
---
import ResponsiveImg from "@components/media/ResponsiveImg.astro";
import heroDesktop from "@assets/img/hero-desktop.jpg";
import heroMobile from "@assets/img/hero-mobile.jpg";
---
```

> Обидва зображення ОБОВ'ЯЗКОВО імпортувати через `import` — Astro оптимізує тільки статичні імпорти.

---

## Базове використання

```astro
<ResponsiveImg
   srcDesktop={heroDesktop}
   srcMobile={heroMobile}
   alt="Hero"
/>
```

За замовчуванням мобільне зображення показується при ширині **< 768px**.

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `srcDesktop` | `ImageMetadata` | — | **Обов'язковий.** Зображення для desktop |
| `srcMobile` | `ImageMetadata` | — | **Обов'язковий.** Зображення для mobile |
| `alt` | `string` | — | **Обов'язковий.** Текст альтернативи |
| `breakpoint` | `number` | `768` | Точка перемикання в px. Mobile = `< breakpoint` |
| `wrapperClass` | `string` | `""` | Клас на обгортці `<div>` |
| `class` | `string` | `""` | Клас на `<img>` |
| `loading` | `"lazy"` \| `"eager"` | `"lazy"` | `eager` для hero/першого екрану |
| `fetchpriority` | `"high"` \| `"low"` \| `"auto"` | — | `high` для LCP зображення |
| `decoding` | `"async"` \| `"sync"` \| `"auto"` | `"async"` | `sync` для критичних зображень |
| `quality` | `number` | `80` | Якість 1–100 |
| `widthsDesktop` | `number[]` | `[768, 1280, 1920]` | srcset розміри для desktop |
| `widthsMobile` | `number[]` | `[375, 640, 768]` | srcset розміри для mobile |
| `objectFit` | `"cover"` \| `"contain"` \| `"fill"` \| `"none"` | `"cover"` | CSS `object-fit` |

---

## Приклади

### Hero / LCP зображення

```astro
<ResponsiveImg
   srcDesktop={heroDesktop}
   srcMobile={heroMobile}
   alt="Hero"
   loading="eager"
   fetchpriority="high"
   decoding="sync"
   quality={90}
   wrapperClass="hero__bg hero-gradient__bg hero-gradient__bg--height-100"
/>
```

### Кастомний брейкпоінт (перемикається на < 1024px)

```astro
<ResponsiveImg
   srcDesktop={imgDesktop}
   srcMobile={imgMobile}
   alt="Опис"
   breakpoint={1024}
   wrapperClass="section__img"
/>
```

### З кастомними srcset розмірами

```astro
<ResponsiveImg
   srcDesktop={imgDesktop}
   srcMobile={imgMobile}
   alt="Опис"
   widthsDesktop={[1280, 1920, 2560]}
   widthsMobile={[375, 480, 768]}
   quality={85}
/>
```

---

## Структура HTML

```html
<div class="img-wrapper">
   <picture>
      <!-- mobile: завантажується тільки на < 768px -->
      <source media="(max-width: 767px)" srcset="mobile-400w.webp 400w, mobile-640w.webp 640w" type="image/webp" />
      <!-- desktop: завантажується на >= 768px -->
      <source srcset="desktop-768w.webp 768w, desktop-1280w.webp 1280w, desktop-1920w.webp 1920w" type="image/webp" />
      <!-- fallback для браузерів без WebP -->
      <img class="img-wrapper__img" src="desktop-fallback.jpg" alt="..." loading="lazy" decoding="async" />
   </picture>
</div>
```

---

## Коли використовувати ResponsiveImg vs Img

| Ситуація | Компонент |
|---|---|
| Те саме зображення, різний розмір | `Img` з `widths` і `sizes` |
| Різна кадрування/композиція для mobile | `ResponsiveImg` |
| Горизонтальне фото на desktop, вертикальне на mobile | `ResponsiveImg` |
| Повний герой на desktop, обрізаний на mobile | `ResponsiveImg` |

---

## Barba.js

Компонент генерує чистий HTML (`<picture>`, `<source>`, `<img>`) — **жодного JavaScript**. Браузер вибирає зображення нативно через `media` атрибут. Barba.js не впливає на роботу компонента.
