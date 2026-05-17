# ShowMore

Компонент покрокового розкриття контенту. Два режими: `batch` (завантажити ще N) і `toggle` (показати все / сховати). П'ять анімацій зі stagger-ефектом.

```
src/
├── components/pagination/Showmore.astro            — компонент
├── scripts/init/show-more.js                       — ShowMore клас
└── styles/components/pagination/_show-more.scss    — стилі
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fshowmore` | Batch режим (завантажити ще) |
| `fshowmore-toggle` | Toggle режим (показати все / сховати) |

---

## Мінімальний приклад

```astro
---
import Showmore from "@components/pagination/Showmore.astro";
---

<Showmore itemSelector=".card" perPage={6}>
   <div class="card">Картка 1</div>
   <div class="card">Картка 2</div>
   <!-- ...скільки завгодно -->
</Showmore>
```

> `itemSelector` — CSS-селектор елементів всередині компонента. Перші `perPage` видимі, решта приховані.

---

## Всі Props

### Логіка

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `itemSelector` | `string` | — | **Обов'язковий.** CSS-селектор елементів |
| `perPage` | `number` | `6` | Кількість елементів за один клік |
| `mode` | `"batch" \| "toggle"` | `"batch"` | Режим роботи |

### Batch режим

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `doneVariant` | `"hide" \| "disabled"` | `"hide"` | Що робити з кнопкою коли всі показані |

### Toggle режим

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `toggleHide` | `boolean` | `true` | Показувати кнопку "Сховати" після розкриття |

### Анімація

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `animation` | `"none" \| "fade" \| "slide-up" \| "scale" \| "blur"` | `"fade"` | Тип анімації нових елементів |
| `animationDuration` | `number` | `300` | Тривалість анімації (мс) |
| `animationStagger` | `number` | `40` | Затримка між елементами (мс) |

### Тексти кнопки

| Prop | Default |
|---|---|
| `label` | `"Показати ще"` |
| `labelDone` | `"Це все"` |
| `labelToggleOpen` | `"Показати всі"` |
| `labelToggleClose` | `"Сховати"` |
| `showCount` | `false` — показати кількість в кнопці (`"Показати ще 6"`) |

### Іконки (SVG sprite)

| Prop | Опис |
|---|---|
| `icon` | Назва іконки для кнопки "Показати ще" |
| `iconClose` | Назва іконки для кнопки "Сховати" (toggle режим) |

### Скрол

| Prop | Default | Опис |
|---|---|---|
| `scrollToNew` | `false` | Скролити до першого нового елементу після кліку |
| `scrollOffset` | `0` | Відступ від верху при скролі (px) |

### Класи

| Prop | Опис |
|---|---|
| `class` | Клас на wrapper `.show-more-wrapper` |
| `classContent` | Клас на `.show-more-content` |
| `classFooter` | Клас на `.show-more-footer` |
| `classBtn` | Базові класи кнопки (замінюють дефолтні стилі) |
| `classBtnDone` | Додається до кнопки коли `done/disabled` |
| `classBtnClose` | Додається до кнопки коли toggle відкрито |
| `classInfo` | Клас на лічильник `"6 / 20"` |

---

## Приклади

### Картки з анімацією
```astro
<Showmore
   itemSelector=".product-card"
   perPage={6}
   animation="slide-up"
   animationStagger={50}
   showCount={true}
>
   {products.map(p => <ProductCard {...p} />)}
</Showmore>
```

### Toggle — "Показати всі відгуки"
```astro
<Showmore
   itemSelector=".review"
   perPage={3}
   mode="toggle"
   labelToggleOpen="Всі відгуки"
   labelToggleClose="Сховати"
   animation="fade"
>
   {reviews.map(r => <Review {...r} />)}
</Showmore>
```

### З кастомною кнопкою (власний клас)
```astro
<Showmore
   itemSelector=".item"
   perPage={4}
   classBtn="btn btn--outline"
   classBtnDone="btn btn--outline btn--disabled"
   label="Завантажити ще"
   labelDone="Більше немає"
>
   ...
</Showmore>
```

### З іконками зі спрайту
```astro
<Showmore
   itemSelector=".card"
   perPage={6}
   icon="arrow-down"
   mode="toggle"
   iconClose="arrow-up"
   labelToggleOpen="Показати всі"
   labelToggleClose="Сховати"
>
   ...
</Showmore>
```

### Скрол до нових елементів (з відступом для sticky header)
```astro
<Showmore
   itemSelector=".post"
   perPage={5}
   scrollToNew={true}
   scrollOffset={80}
>
   ...
</Showmore>
```

---

## JS Events

Після кожного кліку компонент генерує подію:

```js
document.querySelector("[data-show-more-root]").addEventListener("show-more:change", (e) => {
   const { shown, total, isDone, isOpen, mode } = e.detail;
   console.log(`Показано ${shown} з ${total}`);
});
```

## Public API

```js
import { ShowMore } from "@scripts/init/show-more";

const root = document.querySelector("[data-show-more-root]");
const instance = ShowMore.getInstance(root);

// Методи через instance...
instance.destroy(); // скинути стан, прибрати з Map
```

---

## Анімації

| Значення | Ефект |
|---|---|
| `none` | Без анімації |
| `fade` | Плавна поява (opacity) |
| `slide-up` | Підйом знизу + opacity |
| `scale` | Масштабування + opacity |
| `blur` | Розфокус → фокус + opacity |

Всі анімації мають stagger — елементи з'являються по черзі з затримкою `animationStagger` мс.
