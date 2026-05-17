# Tabs

Таби з анімаціями, scrollable навігацією, animated indicator і клавіатурною підтримкою.

```
src/
├── components/interactive/Tabs.astro          — компонент
├── scripts/init/tabs.js                       — клас Tabs (логіка, анімації, keyboard)
└── styles/components/interactive/_tabs.scss   — стилі (підключені в компоненті)
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `ftabs` | Базовий tabs з 3 панелями |
| `ftabs-full` | Повний — всі props з коментарями |
| `ftabs-panel` | Одна кнопка + панель (додати в існуючий Tabs) |

---

## Мінімальний приклад

```astro
---
import Tabs from "@components/interactive/Tabs.astro";
---

<Tabs>
   <Fragment slot="buttons">
      <button class="tabs__button" data-tab="tab1">Перший</button>
      <button class="tabs__button" data-tab="tab2">Другий</button>
      <button class="tabs__button" data-tab="tab3">Третій</button>
   </Fragment>

   <Fragment slot="panels">
      <div class="tabs__panel" data-tab-content="tab1">Контент 1</div>
      <div class="tabs__panel" data-tab-content="tab2">Контент 2</div>
      <div class="tabs__panel" data-tab-content="tab3">Контент 3</div>
   </Fragment>
</Tabs>
```

> `data-tab` на кнопці = `data-tab-content` на панелі — мають збігатись.

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `id` | `string` | auto | Унікальний ID (генерується автоматично) |
| `defaultTab` | `string` | перший | Який таб активний за замовчуванням |
| `animation` | `"none" \| "fade" \| "slide" \| "scale" \| "flip"` | `"none"` | Анімація переключення |
| `animationDuration` | `number` | `300` | Тривалість анімації (мс) |
| `indicator` | `boolean` | `false` | Анімована лінія під активним табом |
| `indicatorMinWidth` | `number` | — | Indicator тільки від цієї ширини (px) |
| `indicatorMaxWidth` | `number` | — | Indicator тільки до цієї ширини (px) |
| `scrollable` | `boolean` | `false` | Горизонтальний скрол + стрілки |
| `class` | `string` | — | Додатковий CSS клас |

---

## Приклади

### З анімацією та indicator
```astro
<Tabs animation="fade" indicator={true} defaultTab="tab2">
   <Fragment slot="buttons">
      <button class="tabs__button" data-tab="tab1">Один</button>
      <button class="tabs__button" data-tab="tab2">Два</button>
   </Fragment>
   <Fragment slot="panels">
      <div class="tabs__panel" data-tab-content="tab1">...</div>
      <div class="tabs__panel" data-tab-content="tab2">...</div>
   </Fragment>
</Tabs>
```

### Scrollable (багато табів)
```astro
<Tabs scrollable={true} indicator={true}>
   <Fragment slot="buttons">
      <button class="tabs__button" data-tab="t1">Таб 1</button>
      <button class="tabs__button" data-tab="t2">Таб 2</button>
      <!-- ...скільки завгодно -->
   </Fragment>
   <Fragment slot="panels">
      <div class="tabs__panel" data-tab-content="t1">...</div>
   </Fragment>
</Tabs>
```

### Indicator тільки на desktop
```astro
<Tabs indicator={true} indicatorMinWidth={768}>
   ...
</Tabs>
```

---

## Анімації

| Значення | Ефект |
|---|---|
| `"none"` | Без анімації (миттєво) |
| `"fade"` | Плавне затухання/появлення |
| `"slide"` | Слайд зліва/справа |
| `"scale"` | Масштабування |
| `"flip"` | 3D-поворот по Y |

---

## Клавіатура (ARIA-стандарт)

| Клавіша | Дія |
|---|---|
| `←` / `↑` | Попередній таб |
| `→` / `↓` | Наступний таб |
| `Home` | Перший таб |
| `End` | Останній таб |

---

## Кастомізація стилів

Всі кольори через CSS-змінні:

```scss
.my-tabs {
   // Кастомний колір активного табу
   .tabs__button.active { color: var(--color-secondary); border-bottom-color: var(--color-secondary); }
   .tabs__indicator { background: var(--color-secondary); }

   // Кастомний розмір шрифту кнопок
   .tabs__button { font-size: var(--text-sm); padding: toRem(8) toRem(16); }

   // Прибрати нижню лінію
   .tabs__nav { border-bottom: none; }
}
```
