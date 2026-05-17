# Gallery — галерея з lightbox

Галерея з автоматичною оптимізацією зображень і Fancybox lightbox. Дані беруться з Astro Content Collections.

```
src/components/media/gallery.astro    — компонент
src/scripts/init/gallery.js           — Fancybox ініціалізація
src/content/config.ts                 — схема колекції
src/content/{назва}/                  — папка з даними
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `fgallery` | Повне підключення галереї |
| `fgallery:item` | Один елемент колекції (markdown) |

---

## Встановлення

```bash
npm install @fancyapps/ui
```

Вже встановлено і підключено в `gallery.js`.

---

## Крок 1 — Створити колекцію в `config.ts`

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const myGalleryCollection = defineCollection({
   type: "content",
   schema: ({ image }) =>
      z.object({
         title:       z.string(),
         shortDesc:   z.string().optional(),   // підпис при hover
         fullCaption: z.string().optional(),   // підпис у lightbox
         thumb:       image(),                 // мініатюра (обов'язкова)
         full:        image().optional(),      // повне фото для lightbox (якщо інше)
         width:       z.number().optional(),   // ширина full фото
         height:      z.number().optional(),   // висота full фото
         order:       z.number().optional(),   // порядок сортування
      }),
});

export const collections = {
   gallery: myGalleryCollection,
   // або своя назва:
   // portfolio: portfolioCollection,
};
```

---

## Крок 2 — Додати зображення і markdown файли

```
src/content/gallery/
├── images/
│   ├── photo-1.jpg
│   └── photo-2.jpg
├── 01-photo.md
└── 02-photo.md
```

**Структура одного файлу:**

```md
---
title: "Назва фото"
shortDesc: "Короткий опис (hover)"
fullCaption: "Повний опис у lightbox"
thumb: ./images/photo-1.jpg
full: ./images/photo-1-full.jpg
width: 1920
height: 1280
order: 1
---
```

> Якщо `full` не вказаний — для lightbox використовується `thumb`.
> `order` — сортування (менше = вище).

---

## Крок 3 — Підключити компонент

```astro
---
import Gallery from "@components/media/gallery.astro";
---

<Gallery collectionName="gallery" />
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `collectionName` | `string` | — | **Обов'язковий.** Назва колекції з `config.ts` |
| `showHover` | `boolean` | `true` | Hover-ефект (overlay + назва + іконка) |
| `showTitle` | `boolean` | `true` | Назва при hover |
| `showDesc` | `boolean` | `true` | Короткий опис при hover |
| `showIcon` | `boolean` | `true` | Іконка zoom при hover |
| `showCaption` | `boolean` | `true` | Підпис у lightbox |
| `className` | `string` | `""` | Додатковий CSS клас на обгортці |
| `imageFormats` | `array` | `["webp"]` | Формати для оптимізації |
| `includeLegacyFallback` | `boolean` | `false` | Додати JPEG fallback |

---

## Приклади

### Мінімальна — без hover
```astro
<Gallery collectionName="gallery" showHover={false} />
```

### Тільки зображення без підписів
```astro
<Gallery
   collectionName="gallery"
   showTitle={false}
   showDesc={false}
   showCaption={false}
/>
```

### З кастомним класом (для сітки)
```astro
<Gallery collectionName="portfolio" className="portfolio-grid" />
```
```scss
.portfolio-grid {
   display: grid;
   grid-template-columns: repeat(3, 1fr);
   gap: 1rem;
}
```

### З AVIF + JPEG fallback
```astro
<Gallery
   collectionName="gallery"
   imageFormats={["avif", "webp"]}
   includeLegacyFallback
/>
```

---

## Структура HTML

```html
<div class="gallery__body">
   <a data-fancybox="gallery" href="/full-image.webp" class="gallery__img">
      <picture>
         <source type="image/webp" srcset="...">
         <img class="gallery__picture" loading="lazy" alt="...">
      </picture>
      <!-- hover ефект -->
      <div class="gallery__overlay"></div>
      <div class="gallery__info">
         <h3 class="gallery__title">Назва</h3>
         <p class="gallery__desc">Опис</p>
      </div>
      <div class="gallery__icon">...</div>
   </a>
</div>
```

---

## Сітка — CSS

Компонент рендерить тільки елементи. Сітку задаєш через CSS на батьківському контейнері:

```scss
// Проста 3-колонкова сітка
.gallery-section .gallery__body {
   display: grid;
   grid-template-columns: repeat(3, 1fr);
   gap: 1rem;

   @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
   }
   @media (max-width: 480px) {
      grid-template-columns: 1fr;
   }
}

// Masonry-стиль
.gallery-section .gallery__body {
   columns: 3;
   gap: 1rem;

   .gallery__img {
      break-inside: avoid;
      margin-bottom: 1rem;
   }
}
```

---

## Кілька галерей на одній сторінці

Кожна галерея — окрема колекція з різним `data-fancybox` атрибутом:

```astro
<!-- Автоматично — різні колекції = різні lightbox групи -->
<Gallery collectionName="portfolio" />
<Gallery collectionName="team" />
```
