# Marquee

Безкінечна прокрутка контенту. Автоматично клонує елементи щоб заповнити рядок, адаптується до розміру екрану.

```
src/
├── components/interactive/Marquee.astro        — компонент
├── scripts/init/marquee.js                     — MarqueeManager (ініціалізація, resize, pause)
└── styles/components/interactive/_marquee.scss — базові стилі (overflow, flex)
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fmarquee` | Базовий — speed, space, direction, pauseOnHover |
| `fmarquee-full` | Повний — всі пропи з коментарями і breakpoints |

---

## Мінімальний приклад

```astro
---
import Marquee from "@components/interactive/Marquee.astro";
---

<Marquee>
   <span>Текст 1</span>
   <span>Текст 2</span>
   <span>Текст 3</span>
</Marquee>
```

JS сам клонує елементи щоб заповнити рядок — не треба вручну дублювати.

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `speed` | `number` | `10` | Швидкість (менше = швидше). Базова одиниця: px/s ÷ 10 |
| `speedTablet` | `number` | = speed | Швидкість 768–1199px |
| `speedMobile` | `number` | = speedTablet | Швидкість < 768px |
| `space` | `number` | `30` | Відступ між елементами (px) |
| `spaceTablet` | `number` | = space | Відступ 768–1199px |
| `spaceMobile` | `number` | = spaceTablet | Відступ < 768px |
| `direction` | `"left" \| "right" \| "top" \| "bottom"` | `"left"` | Напрямок прокрутки |
| `pauseOnHover` | `boolean` | `false` | Зупинити при наведенні |
| `startPosition` | `number` | `0` | Початкова позиція (% зміщення) |
| `minWidth` | `number` | — | Активний від цієї ширини (px) |
| `maxWidth` | `number` | — | Активний до цієї ширини (px) |
| `class` | `string` | — | Додатковий CSS клас |

---

## Приклади

### Логотипи партнерів
```astro
<Marquee speed={8} space={60} pauseOnHover={true} class="partners-marquee">
   <img src="/logos/logo1.svg" alt="Partner 1" />
   <img src="/logos/logo2.svg" alt="Partner 2" />
   <img src="/logos/logo3.svg" alt="Partner 3" />
</Marquee>
```

```scss
.partners-marquee {
   padding: toRem(24) 0;
   background: var(--color-bg-alt);

   img {
      height: toRem(40);
      opacity: 0.5;
      filter: grayscale(1);
      transition: opacity var(--transition-fast), filter var(--transition-fast);
      &:hover { opacity: 1; filter: none; }
   }
}
```

### Текстовий рядок (як у заголовку)
```astro
<Marquee speed={6} space={40} class="text-marquee">
   <span>Розробка сайтів</span>
   <span>✦</span>
   <span>UI/UX дизайн</span>
   <span>✦</span>
   <span>Брендинг</span>
   <span>✦</span>
</Marquee>
```

```scss
.text-marquee {
   span {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
      text-transform: uppercase;
      letter-spacing: 0.05em;
   }
}
```

### Зворотній напрямок
```astro
<Marquee direction="right" speed={12} space={20}>
   <div class="tag">Tag 1</div>
   <div class="tag">Tag 2</div>
</Marquee>
```

### Вертикальна прокрутка
```astro
<Marquee direction="top" speed={8} space={16} class="vertical-marquee">
   <div>Рядок 1</div>
   <div>Рядок 2</div>
   <div>Рядок 3</div>
</Marquee>
```

```scss
.vertical-marquee {
   height: 200px; // для вертикального обов'язково задати висоту
   overflow: hidden;
}
```

### Тільки на мобільному
```astro
<Marquee maxWidth={768}>
   <span>Mobile only marquee</span>
</Marquee>
```

### Два ряди в протилежних напрямках
```astro
<Marquee direction="left"  speed={8} space={24} class="row-marquee">
   <span>Item A</span><span>Item B</span>
</Marquee>
<Marquee direction="right" speed={8} space={24} class="row-marquee">
   <span>Item C</span><span>Item D</span>
</Marquee>
```

---

## Як JS будує marquee

```
[data-marquee]                 ← wrapper (overflow:hidden)
  └─ [data-marquee-inner]      ← JS створює, керує animation
       ├─ [data-marquee-item]  ← оригінальні елементи + клони
       ├─ [data-marquee-item]
       └─ ... (клони поки не заповниться 2× ширина)
```

1. JS бере дочірні елементи зі slot
2. Клонує їх поки сума ширин ≥ ширина контейнера × 2
3. Генерує унікальний `@keyframes` і задає `animation` на inner
4. При resize — перераховує все заново
5. При `pauseOnHover` — `mouseenter` ставить `animationPlayState: paused`

---

## CSS кастомізація

Marquee навмисно **не стилізує** вміст — тільки `overflow:hidden` і `flex`.  
Всі стилі — через клас на wrapper:

```scss
// Через клас (рекомендовано)
.my-marquee {
   padding: toRem(16) 0;

   [data-marquee-item] {
      // стилі елементів якщо потрібно
   }
}
```

> **Не задавай** `margin-right` / `margin-bottom` на елементах у CSS —  
> використовуй prop `space`. JS сам встановлює margin через style.

---

## Швидкість: як підібрати

| `speed` | Відчуття |
|---|---|
| `3–5` | Дуже швидко |
| `6–10` | Нормально (default 10) |
| `15–25` | Повільно |
| `30+` | Дуже повільно |

Для мобільного зазвичай трохи повільніше: `speedMobile={speedDesktop + 3}`
