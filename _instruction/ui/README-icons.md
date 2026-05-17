# SVG Sprite — система іконок

Іконки зберігаються як окремі SVG файли. При білді Vite збирає їх у один спрайт — жодних HTTP-запитів, колір через CSS.

```
src/icons/          ← SVG файли сюди
src/components/ui/
├── IconSprite.astro ← генерує спрайт (підключений в BaseLayout)
└── Icon.astro       ← компонент для використання іконки
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `ficon` | Базова іконка |
| `ficon:size` | З явним розміром |
| `ficon:color` | З кольором через CSS-змінну |
| `ficon:full` | З усіма пропсами |

---

## Крок 1 — Додати SVG файл

Клади SVG в `src/icons/`:

```
src/icons/
├── arrow-down.svg
├── close.svg
├── eye.svg
└── my-icon.svg     ← свій файл
```

**Вимоги до SVG:**
- Файл називається `kebab-case.svg` → іконка `name="kebab-case"`
- Немає захардкоджених кольорів — `fill` і `stroke` будуть замінені на `currentColor` автоматично
- `fill="none"` зберігається (для stroke-іконок)
- Є атрибут `viewBox` — без нього іконка не відображається коректно

**Підготовка SVG (якщо є кольори):**
```xml
<!-- Було (не OK) -->
<path fill="#333" stroke="#000" d="..."/>

<!-- Стане автоматично (OK) -->
<path fill="currentColor" stroke="none" d="..."/>
```

> Спрайт перебудовується автоматично при запуску `npm run dev` або `npm run build`.

---

## Крок 2 — Використати іконку

```astro
---
import Icon from "@components/ui/Icon.astro";
---

<Icon name="close" />
```

Де `name` — ім'я файлу без `.svg`.

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `name` | `string` | — | **Обов'язковий.** Ім'я файлу без `.svg` |
| `size` | `number` \| `string` | — | Розмір: число = px, рядок = будь-яка одиниця |
| `color` | `string` | — | Колір (CSS-значення або змінна) |
| `class` | `string` | — | Додатковий CSS клас |

---

## Приклади

### Базова іконка
```astro
<Icon name="close" />
```

### З розміром
```astro
<Icon name="close" size={24} />          <!-- 24px -->
<Icon name="close" size="2rem" />        <!-- 2rem -->
<Icon name="close" size="1.5em" />       <!-- відносно батьківського шрифту -->
```

### З кольором
```astro
<Icon name="close" color="var(--color-primary)" />
<Icon name="close" color="#ff0000" />
<Icon name="close" color="currentColor" />   <!-- успадковує від батьківського -->
```

### З CSS класом
```astro
<Icon name="close" class="btn__icon" />
```

### Комбінований
```astro
<Icon name="close" size={20} color="var(--color-text-muted)" class="modal__close-icon" />
```

---

## Розмір за замовчуванням

Без `size` іконка має розмір `1em × 1em` — успадковує `font-size` батьківського елемента:

```astro
<!-- Іконка буде 24px — такий самий розмір як текст кнопки -->
<button style="font-size: 24px">
   <Icon name="close" />
   Закрити
</button>
```

```scss
// Або через SCSS:
.my-button {
   font-size: 1.25rem;

   .icon { /* іконка теж 1.25rem */ }
}
```

---

## Колір за замовчуванням

Без `color` іконка успадковує `color` батьківського елемента через `currentColor`:

```scss
.header {
   color: #fff;
   // всі Icon всередині header будуть білими
}

.btn--primary {
   color: #fff;
   // іконка в кнопці теж біла
}
```

---

## Як працює спрайт

1. `IconSprite.astro` читає всі `src/icons/*.svg` через `import.meta.glob`
2. Кожен SVG обробляється: кольори → `currentColor`, витягується `viewBox`
3. Генерується прихований `<svg>` з `<symbol id="icon-{name}">` для кожного файлу
4. `Icon.astro` рендерить `<svg><use href="#icon-{name}"></use></svg>`
5. JS підтягує `viewBox` із символу на svg елемент (для коректних пропорцій)

```html
<!-- Те що генерується в HTML -->
<svg style="display:none">
   <defs>
      <symbol id="icon-close" viewBox="0 0 24 24">...</symbol>
      <symbol id="icon-eye"   viewBox="0 0 24 24">...</symbol>
   </defs>
</svg>

<!-- Використання -->
<svg class="icon" viewBox="0 0 24 24">
   <use href="#icon-close"></use>
</svg>
```

---

## Список поточних іконок

| Ім'я | Файл |
|---|---|
| `arrow-dawn` | arrow-dawn.svg |
| `calendar` | calendar.svg |
| `close` | close.svg |
| `eye` | eye.svg |
| `eye-off` | eye-off.svg |
| `loop` | loop.svg |
| `zoom-in` | zoom-in.svg |

---

## Поширені помилки

**Іконка не відображається:**
- Перевір що файл є в `src/icons/`
- Перевір що `name` збігається з ім'ям файлу (без `.svg`)
- Перевір що SVG має атрибут `viewBox`

**Іконка чорна замість потрібного кольору:**
- Встанови `color` проп або задай `color` на батьківському елементі в CSS

**Іконка неправильного розміру:**
- Без `size` — розмір = `font-size` батьківського елемента
- Явно задай `size={24}` або керуй через CSS `font-size`

**SVG виглядає неправильно після додавання:**
- Перевір що в SVG немає захардкоджених кольорів (крім `fill="none"`)
- Перевір наявність `viewBox` в SVG файлі
