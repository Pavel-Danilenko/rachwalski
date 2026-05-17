# Pagination

Клієнтська пагінація з анімаціями, 5 варіантами навігації, URL sync, keyboard, swipe і aria-live для screen readers.

```
src/
├── components/pagination/Pagination.astro         — компонент
├── scripts/init/pagination.js                     — Pagination клас
└── styles/components/pagination/_pagination.scss  — стилі
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fpagination` | Базова пагінація |
| `fpagination-full` | Повна — всі опції |

---

## Мінімальний приклад

```astro
---
import Pagination from "@components/pagination/Pagination.astro";
---

<Pagination itemSelector=".card" perPage={6}>
   <div class="card">Картка 1</div>
   <div class="card">Картка 2</div>
   <!-- ...скільки завгодно -->
</Pagination>
```

---

## Всі Props

### Логіка
| Prop | Default | Опис |
|---|---|---|
| `itemSelector` | — | **Обов'язковий.** CSS-селектор елементів |
| `perPage` | `6` | Елементів на сторінку |
| `siblings` | `1` | Кількість сторінок поруч з активною (`1 2 [3] 4 5`) |

### Анімація
| Prop | Default | Опис |
|---|---|---|
| `animation` | `"fade"` | `none \| fade \| slide \| scale \| blur` |
| `animationDuration` | `300` | Тривалість (мс) |
| `animationStagger` | `40` | Затримка між елементами (мс) |
| `animationDirectional` | `true` | Слайд враховує напрямок (вперед/назад) |

### Навігація
| Prop | Default | Опис |
|---|---|---|
| `navVariant` | `"default"` | `default \| pill \| minimal \| outline \| ghost` |
| `showInfo` | `true` | Лічильник `"2 / 10"` під кнопками |
| `showArrows` | `true` | Стрілки ← → |
| `showFirstLast` | `false` | Кнопки першої/останньої сторінки |
| `showProgress` | `false` | Прогрес-бар під пагінацією |

### Іконки (SVG sprite)
| Prop | Опис |
|---|---|
| `iconPrev` / `iconNext` | Іконки стрілок |
| `iconFirst` / `iconLast` | Іконки першої/останньої |

### Тексти (i18n)
| Prop | Default |
|---|---|
| `labelPrev` | `"Попередня сторінка"` |
| `labelNext` | `"Наступна сторінка"` |
| `labelFirst` | `"Перша сторінка"` |
| `labelLast` | `"Остання сторінка"` |
| `labelPage` | `"Сторінка {page} з {pages}"` |
| `labelInfo` | `"{current} / {pages}"` |

### Поведінка
| Prop | Default | Опис |
|---|---|---|
| `scrollTo` | `false` | Скролити до верху контейнера при зміні сторінки |
| `scrollOffset` | `0` | Відступ від верху при скролі (px) |
| `keyboard` | `false` | ← → клавіші для переключення |
| `swipe` | `false` | Touch swipe на мобільному |
| `urlSync` | `false` | Синхронізація з `?page=N` в URL |
| `urlParam` | `"page"` | Назва параметра в URL |

### Кастомні класи
`class`, `classContent`, `classNav`, `classBtn`, `classBtnActive`, `classBtnArrow`, `classEllipsis`, `classInfo`, `classProgress`

---

## Приклади

### Повна конфігурація
```astro
<Pagination
   itemSelector=".post"
   perPage={9}
   siblings={2}
   animation="slide"
   navVariant="pill"
   showProgress={true}
   showFirstLast={true}
   keyboard={true}
   swipe={true}
   scrollTo={true}
   scrollOffset={80}
   urlSync={true}
>
   {posts.map(p => <PostCard {...p} />)}
</Pagination>
```

### Мінімальний стиль
```astro
<Pagination
   itemSelector=".item"
   perPage={5}
   navVariant="minimal"
   showInfo={false}
   animation="fade"
>
   ...
</Pagination>
```

### Ghost варіант (без рамок)
```astro
<Pagination itemSelector=".card" perPage={8} navVariant="ghost">
   ...
</Pagination>
```

---

## Nav variants

| Variant | Опис |
|---|---|
| `default` | Кнопки з рамкою |
| `pill` | Круглі кнопки |
| `minimal` | Без рамки, активна — underline |
| `outline` | Активна — кольорова рамка без фону |
| `ghost` | Без рамок, активна — напівпрозорий фон |

---

## Анімації

| Значення | Ефект |
|---|---|
| `none` | Без анімації |
| `fade` | Opacity |
| `slide` | Горизонтальний слайд (напрямок залежить від сторінки) |
| `scale` | Масштабування |
| `blur` | Розфокус |

---

## JS Events

```js
document.querySelector("[data-pagination-root]").addEventListener("pagination:change", (e) => {
   const { page, prevPage, total, pages } = e.detail;
   console.log(`Сторінка ${page} з ${pages}`);
});
```

## Public API

```js
import { Pagination } from "@scripts/init/pagination";

const root = document.querySelector("[data-pagination-root]");
const instance = Pagination.getInstance(root);

instance.goTo(3);     // перейти на сторінку 3
instance.destroy();   // знищити
```

---

## CSS кастомізація

```scss
.my-section {
   --pg-active-bg:    var(--color-secondary);
   --pg-active-color: #fff;
   --pg-radius:       var(--radius-full);
   --pg-size:         #{toRem(44)};
   --pg-gap:          #{toRem(6)};
}
```
