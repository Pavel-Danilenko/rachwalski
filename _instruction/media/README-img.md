# Img — оптимізоване зображення

Компонент для зображень через `astro:assets`. Автоматично генерує WebP, srcset, lazy loading.

```
src/components/media/Img.astro
src/styles/components/media/_img.scss
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `fimg` | Базовий Img з імпортом |
| `fimg:hero` | Hero / LCP зображення (eager + fetchpriority) |
| `fimg:class` | З кастомними класами на img і wrapper |
| `fimg:contain` | object-fit contain (логотип, іконка) |

---

## Підключення

```astro
---
import Img from "@components/media/Img.astro";
import heroImg from "@assets/img/hero.jpg";
---
```

> Зображення ОБОВ'ЯЗКОВО імпортувати через `import` — Astro оптимізує тільки статичні імпорти.

---

## Базове використання

```astro
<Img src={heroImg} alt="Опис зображення" />
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `src` | `ImageMetadata` | — | **Обов'язковий.** Імпортований файл |
| `alt` | `string` | — | **Обов'язковий.** Текст альтернативи |
| `width` | `number` | — | Ширина — разом з `height` задає `aspect-ratio` |
| `height` | `number` | — | Висота |
| `class` | `string` | `""` | Клас на `<img>` |
| `wrapperClass` | `string` | `""` | Клас на обгортці `<div>` |
| `loading` | `"lazy"` \| `"eager"` | `"lazy"` | `eager` для hero/першого екрану |
| `fetchpriority` | `"high"` \| `"low"` \| `"auto"` | — | `high` для LCP зображення |
| `decoding` | `"async"` \| `"sync"` \| `"auto"` | `"async"` | `sync` для критичних зображень |
| `objectFit` | `"cover"` \| `"contain"` \| `"fill"` \| `"none"` | `"cover"` | CSS `object-fit` |
| `sizes` | `string` | `"(max-width: 768px) 100vw, 800px"` | Responsive sizes |
| `quality` | `number` | `80` | Якість 1–100 |
| `formats` | `array` | `["webp"]` | Формати для `<source>` |
| `widths` | `number[]` | `[400, 800, 1200]` | Брейкпоінти srcset |
| `includeLegacyFallback` | `boolean` | `false` | Додати JPEG fallback для старих браузерів |

---

## Приклади

### Звичайне зображення
```astro
<Img src={cardImg} alt="Картка" width={800} height={600} />
```

### Hero / LCP зображення (перший екран)
```astro
<Img
   src={heroImg}
   alt="Hero"
   width={1920}
   height={1080}
   loading="eager"
   fetchpriority="high"
   decoding="sync"
   quality={90}
   sizes="100vw"
   widths={[768, 1280, 1920]}
/>
```

> Для LCP: `loading="eager"` + `fetchpriority="high"` — браузер завантажить одразу, без очікування.

### Логотип / іконка (contain)
```astro
<Img src={logoImg} alt="Логотип" width={200} height={80} objectFit="contain" />
```

### Із кастомними класами
```astro
<Img
   src={teamImg}
   alt="Команда"
   width={600}
   height={400}
   class="team__photo"
   wrapperClass="team__photo-wrapper"
/>
```

### Різні формати + JPEG fallback (для старих браузерів)
```astro
<Img
   src={img}
   alt="..."
   formats={["avif", "webp"]}
   includeLegacyFallback
/>
```

### Кастомний розмір srcset
```astro
<Img
   src={img}
   alt="..."
   widths={[320, 640, 960, 1280]}
   sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
/>
```

---

## Aspect ratio

Якщо передати `width` і `height` — обгортка отримає `aspect-ratio` через CSS-змінну. Це запобігає **layout shift (CLS)** — сторінка не "стрибає" під час завантаження.

```astro
<!-- aspect-ratio: 16/9 буде встановлено автоматично -->
<Img src={img} alt="..." width={1280} height={720} />
```

```scss
// Або задай в SCSS:
.my-image {
   aspect-ratio: 4/3;
}
```

---

## Структура HTML

```html
<div class="img-wrapper" style="--aspect-ratio: 16/9">
   <picture>
      <source type="image/webp" srcset="...">
      <img class="img-wrapper__img" src="..." alt="..." loading="lazy" decoding="async">
   </picture>
</div>
```

---

## Стилізація

```scss
// Розмір обгортки:
.my-wrapper {
   width: 300px;
   height: 200px;
}

// Або через клас на компоненті:
.card__img-wrapper {
   border-radius: var(--radius-md);
   overflow: hidden;
}
```

Всі стилі самого зображення (object-fit, width: 100%) — в `_img.scss`, не потрібно повторювати.
