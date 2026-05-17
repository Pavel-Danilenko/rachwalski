# Accordion

Акордеон з анімацією через **CSS Grid** (`grid-template-rows: 0fr → 1fr`). JS тільки перемикає `aria-expanded` — ніяких `scrollHeight`, вкладені акордеони працюють стабільно.

```
src/
├── components/interactive/accordion.astro          — Astro-компонент (обгортка)
├── scripts/init/accordion.js                       — логіка (toggle, breakpoints)
└── styles/components/interactive/_accordion.scss   — стилі (підключені в компоненті)
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `faccordion` | Повний accordion з імпортом і 2 готовими пунктами |
| `faccordion-item` | Один item — вставляється в існуючий `<Accordion>` |

---

## Мінімальний приклад

```astro
---
import Accordion from "@components/interactive/accordion.astro";
---

<Accordion>
   <div data-accordion-item>
      <button data-accordion-trigger>
         Заголовок
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" class="icon">
            <polyline points="6 9 12 15 18 9"/>
         </svg>
      </button>
      <div data-accordion-content>
         <div>                           <!-- overflow layer -->
            <div class="accordion__body"> <!-- padding layer -->
               Контент...
            </div>
         </div>
      </div>
   </div>
</Accordion>
```

### Структура content — 3 шари

| Шар | Елемент | Роль |
|---|---|---|
| 1 | `[data-accordion-content]` | `display:grid` — анімація розкриття |
| 2 | `> div` (перший дочірній) | `overflow:hidden` — обрізає вміст |
| 3 | `.accordion__body` | `padding` — відступ (не в overflow, щоб не обрізати тіні) |

---

## Props (`<Accordion>`)

| Prop | Тип | За замовчуванням | Опис |
|---|---|---|---|
| `multiple` | `boolean` | `false` | Дозволяти відкривати декілька одночасно |
| `defaultOpen` | `number[]` | `[]` | Індекси відкритих за замовчуванням (з 0) |
| `duration` | `number` | `400` | Швидкість анімації в мс |
| `minWidth` | `number` | — | Активний тільки від цієї ширини (px) |
| `maxWidth` | `number` | — | Активний тільки до цієї ширини (px) |
| `class` | `string` | — | Додатковий CSS клас на контейнер |

---

## Всі приклади

### Відкритий перший за замовчуванням
```astro
<Accordion defaultOpen={[0]}>
   ...
</Accordion>
```

### Декілька відкритих одночасно
```astro
<Accordion multiple={true} defaultOpen={[0, 2]}>
   ...
</Accordion>
```

### Кастомна швидкість
```astro
<Accordion duration={600}>
   ...
</Accordion>
```

### Тільки на мобільному (до 768px)
```astro
<Accordion maxWidth={768}>
   ...
</Accordion>
```

### Вкладений акордеон

Просто вкладаємо `<Accordion>` всередину `.accordion__body`. Зовнішній акордеон автоматично адаптується до нової висоти бо не залежить від `scrollHeight`.

```astro
<Accordion>
   <div data-accordion-item>
      <button data-accordion-trigger>Зовнішній пункт <svg class="icon">...</svg></button>
      <div data-accordion-content>
         <div>
            <div class="accordion__body">
               <Accordion multiple={true}>
                  <div data-accordion-item>
                     <button data-accordion-trigger>Вкладений A <svg class="icon">...</svg></button>
                     <div data-accordion-content>
                        <div><div class="accordion__body">Контент A</div></div>
                     </div>
                  </div>
               </Accordion>
            </div>
         </div>
      </div>
   </div>
</Accordion>
```

---

## CSS класи для кастомізації

```scss
.accordion          // flex-контейнер
.accordion__body    // padding-обгортка (шар 3)
```

Data-атрибути яким CSS призначає стилі:

```
[data-accordion]               — контейнер
[data-accordion-item]          — елемент (border-bottom)
[data-accordion-trigger]       — кнопка заголовку
[data-accordion-content]       — grid-wrapper (анімація)
[data-accordion-active="false"] — accordion вимкнений (breakpoint)
[aria-expanded="true"]         — відкритий стан (CSS перемикає grid-template-rows)
```

---

## Кастомізація через CSS змінні

```scss
// Перевизначити тривалість анімації глобально:
[data-accordion] { --accordion-duration: 600ms; }

// Або лише для конкретного:
#my-accordion { --accordion-duration: 200ms; }
```

---

## Як це працює

```
click [data-accordion-trigger]
  ↓
aria-expanded: "false" → "true"
  ↓
CSS: [aria-expanded="true"] + [data-accordion-content] { grid-template-rows: 1fr }
  ↓
анімація grid-template-rows: 0fr → 1fr (transition)
  ↓
overflow:hidden на дочірньому div обрізає під час анімації
```

Ніякого JS-розрахунку висоти — браузер сам знає висоту контенту через `1fr`.
