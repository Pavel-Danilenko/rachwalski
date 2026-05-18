# Testimonials Filter — фільтрація відгуків

Система фільтрації для сторінки Testimonials: таби (View all / Surgical / Non-surgical) + CustomSelect для категорій. Категорії змінюються залежно від активного табу.

```
src/pages/testimonials.astro
src/styles/pages/_testimonials.scss
src/scripts/init/testimonials-filter.js
```

---

## Як працює

1. **Таби** — `Tabs` компонент з `indicator={true}` (та ж капсула що на Fees)
2. **Категорії** — три окремі `CustomSelect` (по одному на таб), показується тільки активний
3. При зміні табу — ховається старий select wrapper, показується відповідний
4. При зміні категорії — картки фільтруються за `data-reviews-category`

---

## Структура HTML

```html
<!-- Таб-навігація (slot="buttons") -->
<button class="tabs__button" data-tab="all">View all</button>
<button class="tabs__button" data-tab="surgical">Surgical</button>
<button class="tabs__button" data-tab="non-surgical">Non-surgical</button>

<!-- Категорії (slot="aside") — три селекти -->
<div data-reviews-select-wrapper="all">      <!-- видимий -->
   <CustomSelect ... />
</div>
<div data-reviews-select-wrapper="surgical" hidden>
   <CustomSelect ... />
</div>
<div data-reviews-select-wrapper="non-surgical" hidden>
   <CustomSelect ... />
</div>

<!-- Картка з data-атрибутами -->
<article data-reviews-type="surgical" data-reviews-category="rhinoplasty">
   ...
</article>
```

---

## Data-атрибути картки

| Атрибут | Значення | Опис |
|---|---|---|
| `data-reviews-type` | `surgical` \| `non-surgical` | Тип процедури (для фільтру по табу) |
| `data-reviews-category` | `rhinoplasty`, `botox`, ... | Конкретна категорія (для фільтру по select) |

---

## Додавання нової картки

```astro
<article
   class="review-card glass br-12"
   data-reviews-type="surgical"
   data-reviews-category="facelift"
>
   <div class="review-card__stars">
      <Icon name="star" /> <!-- × 5 -->
   </div>
   <span class="review-card__procedure">Facelift</span>
   <ShowMoreText lines={4} labelMore="Show more" labelLess="Show less">
      "Review text here..."
   </ShowMoreText>
   <div class="review-card__footer">
      <span class="review-card__author">Name</span>
      <div class="review-card__source">
         <Icon name="reviews-label" />
         <span>estheticon</span>
      </div>
   </div>
</article>
```

---

## Додавання нової категорії

1. Додай в масив `categories` в `testimonials.astro`:
```ts
surgical: [
   ...
   { value: "chin", label: "Chin augmentation" }, // ← нова
],
```

2. Додай `data-reviews-category="chin"` на картки цієї категорії.

---

## Barba.js

Скрипт (`testimonials-filter.js`) реєструється на `page:ready` + `requestAnimationFrame`. Guard `data-testimonials-filter-init` на `.reviews-tabs` елементі — скидається через `cleanupPage()` в `barba.js`.
