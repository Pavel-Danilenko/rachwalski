# Blog Search

Клієнтський пошук по картках блогу з пагінацією. Фільтрує `.post-card` за заголовком, описом і категорією. Працює разом з компонентом `Pagination` — перераховує сторінки після кожного пошуку.

```
src/
├── scripts/init/blog-search.js          — логіка пошуку
├── components/forms/CustomSearch.astro  — UI компонент поля пошуку
└── styles/pages/_blog.scss             — стилі mark та empty-state
```

---

## Як підключити

**Крок 1.** Імпортуй `CustomSearch` на сторінці блогу:

```astro
---
import CustomSearch from "@components/forms/CustomSearch.astro";
---
```

**Крок 2.** Додай компонент з атрибутом `data-blog-search`:

```astro
<CustomSearch
   placeholder="Search articles..."
   data-blog-search
/>
```

> `app.js` автоматично підвантажить `blog-search.js` коли на сторінці є `[data-blog-search]`.

---

## Налаштування (data-атрибути)

| Атрибут | Тип | Default | Опис |
|---|---|---|---|
| `data-debounce` | `number` (мс) | `0` | Затримка перед пошуком. `300` — пошук через 300мс після зупинки введення |
| `data-min-chars` | `number` | `2` | Мінімум символів для початку пошуку |
| `data-highlight` | `"true"` | вимкнено | Підсвічує збіги в заголовку та описі через `<mark>` |
| `[data-search-empty]` | HTML елемент | — | Текст "нічого не знайдено" — рендериться в HTML, JS тільки показує/ховає |

### Приклад з усіма опціями:

```astro
<CustomSearch
   placeholder="Search articles..."
   data-blog-search
   data-debounce="300"
   data-min-chars="2"
   data-highlight="true"
   data-empty-text="No articles found"
/>
```

### Повідомлення "нічого не знайдено"

Текст рендериться в HTML — не в JS (для підтримки перекладів):

```astro
<!-- В шаблоні сторінки, поруч з Pagination -->
<p data-search-empty hidden>No articles found for your search.</p>
```

JS знаходить `[data-search-empty]` і лише перемикає атрибут `hidden`. Текст змінюєш в HTML.

### Вимкнути окрему фішку:

```astro
<!-- Без debounce — пошук миттєво -->
data-debounce="0"

<!-- Без highlight — просто не додавай атрибут -->

<!-- Без повідомлення — просто не додавай [data-search-empty] в HTML -->
```

---

## По яких полях шукає

Пошук відбувається по трьох полях одночасно:

| Поле | CSS-клас |
|---|---|
| Заголовок | `.post-card__title` |
| Опис (excerpt) | `.post-card__excerpt` |
| Категорія | `.post-card__category` |

Щоб додати або прибрати поле — відредагуй рядок в `blog-search.js`:

```js
const matches = title.includes(q) || excerpt.includes(q) || category.includes(q);
```

---

## Як це працює з пагінацією

1. Пошук додає `data-search-excluded` на картки що не збігаються
2. `Pagination.get items()` автоматично їх ігнорує → `total` і `pages` перераховуються
3. Диспатчується `pagination:filter` → `Pagination.refresh()` → рендер з 1-ї сторінки

Результат: якщо знайдено 6 постів при `perPage=3` → показуються 2 сторінки.

---

## Кнопка очищення (×)

Вбудована в `CustomSearch.astro`. З'являється автоматично коли є текст в полі (клас `has-value` на враппері).

Клік:
- Очищає поле
- Тригерить `input` і `search` події → пошук скидається
- Повертає пагінацію до початкового стану

---

## Стилі

```scss
// _blog.scss

// Підсвічування збігів
mark {
   background: var(--color-accent);
   color: var(--color-black);
}

// Повідомлення "нічого не знайдено"
.blog-search-empty {
   text-align: center;
   color: var(--color-text-muted);
}
```

---

## WordPress

На WP підхід той самий — PHP виводить всі пости в DOM, JS-скрипт фільтрує. Для великого блогу (500+ постів) краще замінити на серверний пошук через WP REST API або редирект на `/search/?s=query`.
