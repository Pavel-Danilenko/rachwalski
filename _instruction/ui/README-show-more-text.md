# ShowMoreText — розкривний текст

Компонент для обрізання тексту з кнопкою "Show more / Show less". Всі тексти кнопок передаються через атрибути — готово до перекладу.

```
src/components/ui/ShowMoreText.astro
src/styles/components/ui/_show-more-text.scss
src/scripts/init/text-toggle.js
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `fsmt` | Базовий ShowMoreText |
| `fsmt:anim` | З анімацією та кастомними лейблами |
| `fsmt:scroll` | З scrollTo при згортанні |

---

## Підключення

```astro
---
import ShowMoreText from "@components/ui/ShowMoreText.astro";
---
```

> JS (`text-toggle.js`) підключається автоматично через `app.js` — імпортується лише якщо є `[data-text-toggle]` на сторінці.

---

## Базове використання

```astro
<ShowMoreText lines={4} labelMore="Show more" labelLess="Show less">
   Lorem ipsum dolor sit amet, consectetur adipiscing elit...
</ShowMoreText>
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `lines` | `number` | `4` | Кількість видимих рядків у згорнутому стані |
| `labelMore` | `string` | `"Show more"` | Текст кнопки коли згорнуто |
| `labelLess` | `string` | `"Show less"` | Текст кнопки коли розгорнуто |
| `gradient` | `boolean` | `true` | Градієнт-fade знизу тексту коли згорнуто |
| `animation` | `boolean` | `true` | Плавна анімація розкриття/згортання |
| `duration` | `number` | `400` | Тривалість анімації в мс |
| `scrollTo` | `boolean` | `false` | Скролити до початку елемента при згортанні |
| `class` | `string` | `""` | Додатковий клас на обгортці |

> **Важливо:** `labelMore` і `labelLess` читаються з `data-атрибутів` — JS не містить жодного тексту. Передавай переклади через пропси.

---

## Приклади

### Базовий

```astro
<ShowMoreText lines={4} labelMore="Show more" labelLess="Show less">
   Long review text here...
</ShowMoreText>
```

### 2 рядки, повільна анімація

```astro
<ShowMoreText lines={2} duration={600}>
   Short excerpt of text...
</ShowMoreText>
```

### Без анімації

```astro
<ShowMoreText lines={3} animation={false} labelMore="Read more" labelLess="Close">
   Text content here...
</ShowMoreText>
```

### З scrollTo (для довгих текстів)

```astro
<ShowMoreText lines={5} scrollTo={true} labelMore="Expand" labelLess="Collapse">
   Very long text that when collapsed scrolls user back up...
</ShowMoreText>
```

### Без градієнту

```astro
<ShowMoreText lines={4} gradient={false}>
   Text without fade effect at the bottom...
</ShowMoreText>
```

---

## Як працює

1. JS (`text-toggle.js`) знаходить `[data-text-toggle]` і застосовує `webkit-line-clamp`
2. Якщо текст **не обрізається** — кнопка автоматично ховається
3. При кліку — анімує через `max-height` transition
4. Тексти кнопок беруться з `data-label-more` / `data-label-less` атрибутів

---

## Структура HTML

```html
<div class="show-more-text show-more-text--gradient"
     data-text-toggle
     data-lines="4"
     data-animation="true"
     data-duration="400">

   <div class="show-more-text__content" data-text-toggle-content>
      <!-- slot content -->
   </div>

   <button class="show-more-text__btn"
           data-text-toggle-btn
           data-label-more="Show more"
           data-label-less="Show less"
           type="button"
           aria-expanded="false">
      <span data-text-toggle-label>Show more</span>
      <!-- arrow icon -->
   </button>
</div>
```

---

## Barba.js

Скрипт зареєстрований на `page:ready` + `requestAnimationFrame` для першого завантаження. Guard `data-text-toggle-init` скидається при Barba переходах через `cleanupPage()`.

---

## Стилізація

```scss
// Змінити колір кнопки:
.show-more-text__btn { color: var(--color-accent); }

// Змінити колір градієнту:
.my-wrapper { --show-more-fade-color: var(--color-bg-alt); }
```

CSS-змінна `--show-more-fade-color` дозволяє підлаштувати градієнт до фону конкретного блоку.
