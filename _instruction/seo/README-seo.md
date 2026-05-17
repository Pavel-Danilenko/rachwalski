# SEO — налаштування проекту

## Де знаходиться SEO-код

| Файл | Що робить |
|------|-----------|
| `src/layouts/BaseLayout.astro` | Всі мета-теги, OG, Twitter Card, canonical |
| `public/robots.txt` | Дозволи для пошукових роботів + посилання на sitemap |
| `public/og-image.svg` | Placeholder OG-зображення (замінити на реальний JPG) |
| `astro.config.mjs` | `site` URL + підключення `@astrojs/sitemap` |

---

## Як передавати SEO-дані на сторінку

Кожна сторінка використовує `BaseLayout` і передає пропси:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
---

<BaseLayout
  title="Заголовок сторінки | Назва сайту"
  description="Опис сторінки для пошуку та шерінгу (120–155 символів)."
  ogImage="/og-image.jpg"
>
  <!-- контент -->
</BaseLayout>
```

### Всі пропси BaseLayout

| Проп | Тип | Дефолт | Опис |
|------|-----|--------|------|
| `title` | `string` | `"Назва сайту — Коротке гасло"` | Заголовок вкладки та пошуку |
| `description` | `string` | тестовий текст | Опис для пошуку і соцмереж |
| `ogImage` | `string` | `"/og-image.svg"` | Шлях або URL картинки для шерінгу |
| `lang` | `string` | `"uk"` | Мова сторінки (`uk`, `en`, ...) |
| `noindex` | `boolean` | `false` | `true` — сторінка не індексується |
| `stickyHeader` | `boolean` | `false` | Прилипаючий хедер |
| `namespace` | `string` | `"default"` | Barba.js namespace для анімацій |

---

## Що генерується автоматично

- **`<link rel="canonical">`** — будується з `Astro.site` + поточний pathname. Потребує правильного `PUBLIC_SITE_URL` в `.env`.
- **`og:image`** — автоматично перетворюється на абсолютний URL (навіть якщо передати `/og-image.jpg`).
- **`og:locale`** — генерується з `lang` пропа (`uk` → `uk_UA`, решта — як є).
- **`sitemap-index.xml`** — генерується при білді через `@astrojs/sitemap`.

---

## Що потрібно замінити перед продом

### 1. `.env` — реальний URL сайту
```env
PUBLIC_SITE_URL=https://yoursite.com
```
Використовується в `astro.config.mjs` (`site:`) та для canonical і og:image.

### 2. `src/layouts/BaseLayout.astro` — назва сайту
Знайди рядок `const siteName = "Назва сайту"` і встав реальну:
```ts
const siteName = "Назва вашої компанії";
```

### 3. `src/layouts/BaseLayout.astro` — дефолтні title і description
Дефолти спрацьовують, якщо сторінка не передала пропси:
```ts
title       = "Назва сайту — Коротке гасло або ключове слово",
description = "Тестовий опис...",
```

### 4. `public/og-image.svg` → реальний JPG/PNG
Замін placeholder на реальне зображення **1200×630px**:
```
public/og-image.jpg   ← рекомендовано (JPG менший за розміром)
```
Після цього оновити дефолт у `BaseLayout.astro`:
```ts
ogImage = "/og-image.jpg",
```
І у `src/pages/index.astro`:
```astro
ogImage="/og-image.jpg"
```

### 5. `public/robots.txt` — реальний URL sitemap
```
Sitemap: https://yoursite.com/sitemap-index.xml
```

---

## Закрити сторінку від індексації

```astro
<BaseLayout noindex={true}>
```

Генерує: `<meta name="robots" content="noindex, nofollow" />`

Приклади де це потрібно: `/admin`, `/thank-you`, `/preview/*`, сторінки пагінації.

---

## Sitemap

Генерується автоматично при `astro build` → `sitemap-index.xml` + `sitemap-0.xml`.

Налаштування в `astro.config.mjs`:
```js
sitemap({
  changefreq: "weekly",  // як часто змінюється контент
  priority: 0.7,         // пріоритет сторінок (0.0–1.0)
  filter: (page) => !page.includes("/secret/"),  // виключити сторінки
})
```

Щоб виключити окремі сторінки — додай їх у `filter`.

---

## Перевірка SEO після деплою

1. **Google Search Console** — додай сайт, перевір coverage і sitemap
2. **Facebook Sharing Debugger** — `https://developers.facebook.com/tools/debug/` — перевір OG-теги
3. **Twitter Card Validator** — `https://cards-dev.twitter.com/validator`
4. **[PageSpeed Insights](https://pagespeed.web.dev/)** — Core Web Vitals
5. **robots.txt** — `https://yoursite.com/robots.txt` — переконайся що доступний

---

## Структура мета-тегів що генеруються

```html
<!-- Primary SEO -->
<title>Назва сторінки | Назва сайту</title>
<meta name="description" content="Опис..." />
<link rel="canonical" href="https://yoursite.com/page/" />

<!-- Open Graph (Facebook, Telegram, LinkedIn) -->
<meta property="og:site_name" content="Назва сайту" />
<meta property="og:title" content="Назва сторінки | Назва сайту" />
<meta property="og:description" content="Опис..." />
<meta property="og:url" content="https://yoursite.com/page/" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="uk_UA" />
<meta property="og:image" content="https://yoursite.com/og-image.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Назва сторінки | Назва сайту" />
<meta name="twitter:description" content="Опис..." />
<meta name="twitter:image" content="https://yoursite.com/og-image.jpg" />
```
