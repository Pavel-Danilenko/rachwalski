# Astro — Компоненти: створення, структура, підключення

---

## 1. Структура проекту

```
src/
  components/
    layout/        ← Header, Footer (глобальні обгортки)
    sections/      ← Faq, Hero, CardsSlider (контентні блоки)
    ui/            ← Button, Icon, Counter (дрібні UI елементи)
    interactive/   ← Accordion, Tabs, Modal
    sliders/       ← Swiper-обгортки
  styles/
    components/
      sections/    ← _faq.scss, _hero.scss
      ui/          ← _button.scss
    pages/         ← _rhinoplasty.scss (унікальні стилі сторінки)
  data/            ← rhinoplasty-faq.ts (великі набори даних)
```

---

## 2. Коли виносити в компонент?

| Ситуація | Рішення |
|---|---|
| Секція повторюється на 2+ сторінках | Компонент у `sections/` |
| UI елемент (кнопка, іконка) | Компонент у `ui/` |
| Унікальна секція тільки на одній сторінці | Можна залишити в сторінці |
| Хедер / футер | Компонент у `layout/` |

---

## 3. Пропси — управління контентом компонента

Пропси дозволяють передавати різний контент в один і той самий компонент.
Дизайн — один. Контент — різний на кожній сторінці.

### Базові типи пропсів

```astro
---
interface Props {
   // Рядок
   title: string;

   // Необов'язковий рядок (? = можна не передавати)
   subtitle?: string;

   // Число
   duration: number;

   // Булеве значення
   multiple?: boolean;

   // Масив рядків
   tags: string[];

   // Масив об'єктів
   items: {
      title: string;
      text: string;
   }[];

   // Один з варіантів (enum)
   theme?: "light" | "dark";
}

// Деструктуризація з дефолтними значеннями
const {
   title,
   subtitle = "",        // дефолт — пустий рядок
   duration = 300,       // дефолт — 300
   multiple = false,     // дефолт — false
   theme = "light",      // дефолт — light
   tags,
   items,
} = Astro.props;
---
```

---

## 4. Простий компонент з пропсами (FAQ)

```astro
---
// src/components/sections/Faq.astro
import "@styles/components/sections/_faq.scss";
import Accordion from "@components/interactive/accordion.astro";
import Icon from "@components/ui/Icon.astro";

interface Props {
   title?: string;
   items: {
      question: string;
      answer: string;
   }[];
}

const { title = "FAQ", items } = Astro.props;
---

<section class="faq">
   <div class="faq__container _container">
      {title && <h2 class="faq__title">{title}</h2>}

      <div class="faq__column-right">
         <Accordion defaultOpen={[0]} duration={350}>
            {items.map((item) => (
               <div data-accordion-item>
                  <button data-accordion-trigger class="fs-20">
                     {item.question}
                     <Icon name="arrow-down" />
                  </button>
                  <div data-accordion-content>
                     <div>
                        <div class="accordion__body">
                           {item.answer}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </Accordion>
      </div>
   </div>
</section>
```

Використання на сторінці:

```astro
---
import Faq from "@components/sections/Faq.astro";

const faqItems = [
   {
      question: "How long is the recovery time?",
      answer: "Lorem ipsum..."
   },
   {
      question: "Who is Dr. Martin Rachwalski?",
      answer: "Lorem ipsum..."
   },
];
---

<Faq title="Frequently asked questions" items={faqItems} />
```

---

## 5. Складна вкладеність пропсів

Для складніших секцій де є вкладені об'єкти.

### Приклад — секція з карточками послуг

```astro
---
// src/components/sections/Services.astro
import "@styles/components/sections/_services.scss";
import Icon from "@components/ui/Icon.astro";

interface ServiceItem {
   icon: string;
   title: string;
   text: string;
   tags?: string[];          // необов'язкові теги
   link?: {                  // необов'язкове посилання
      href: string;
      label: string;
   };
}

interface Props {
   title?: string;
   subtitle?: string;
   items: ServiceItem[];
   theme?: "light" | "dark";
   columns?: 2 | 3 | 4;
}

const {
   title,
   subtitle,
   items,
   theme = "light",
   columns = 3,
} = Astro.props;
---

<section class="services" data-theme={theme}>
   <div class="services__container _container">
      {title && <h2 class="services__title">{title}</h2>}
      {subtitle && <p class="services__subtitle">{subtitle}</p>}

      <div class="services__grid" style={`--columns: ${columns}`}>
         {items.map((item) => (
            <div class="services__card">
               <Icon name={item.icon} />
               <h3 class="services__card-title">{item.title}</h3>
               <p class="services__card-text">{item.text}</p>

               {item.tags && (
                  <ul class="services__tags">
                     {item.tags.map((tag) => (
                        <li class="services__tag">{tag}</li>
                     ))}
                  </ul>
               )}

               {item.link && (
                  <a href={item.link.href} class="services__link">
                     {item.link.label}
                  </a>
               )}
            </div>
         ))}
      </div>
   </div>
</section>
```

Використання:

```astro
---
import Services from "@components/sections/Services.astro";

const services = [
   {
      icon: "scalpel",
      title: "Rhinoplasty",
      text: "Nose reshaping surgery...",
      tags: ["surgical", "face"],
      link: {
         href: "/services/rhinoplasty",
         label: "Learn more"
      }
   },
   {
      icon: "eye",
      title: "Blepharoplasty",
      text: "Eyelid surgery...",
      tags: ["surgical", "eyes"],
      // link — не передаємо, він необов'язковий
   },
];
---

<Services
   title="Our services"
   subtitle="Expert surgical procedures"
   items={services}
   theme="dark"
   columns={3}
/>
```

---

## 6. Масив з вкладеними масивами (глибока вкладеність)

Наприклад секція з групами і підпунктами:

```astro
---
// src/components/sections/PriceList.astro
interface PriceItem {
   name: string;
   price: string;
   note?: string;
}

interface PriceGroup {
   title: string;
   items: PriceItem[];   // ← вкладений масив
}

interface Props {
   groups: PriceGroup[];
}

const { groups } = Astro.props;
---

<section class="price-list">
   <div class="price-list__container _container">
      {groups.map((group) => (
         <div class="price-list__group">
            <h3 class="price-list__group-title">{group.title}</h3>

            <ul class="price-list__items">
               {group.items.map((item) => (
                  <li class="price-list__item">
                     <span class="price-list__name">{item.name}</span>
                     <span class="price-list__price">{item.price}</span>
                     {item.note && (
                        <span class="price-list__note">{item.note}</span>
                     )}
                  </li>
               ))}
            </ul>
         </div>
      ))}
   </div>
</section>
```

Використання:

```astro
---
import PriceList from "@components/sections/PriceList.astro";

const priceGroups = [
   {
      title: "Surgical procedures",
      items: [
         { name: "Rhinoplasty", price: "from €4,500", note: "includes anesthesia" },
         { name: "Blepharoplasty", price: "from €2,800" },
         { name: "Facelift", price: "from €7,200", note: "full procedure" },
      ]
   },
   {
      title: "Non-surgical treatments",
      items: [
         { name: "Botox", price: "from €350" },
         { name: "Fillers", price: "from €450" },
      ]
   },
];
---

<PriceList groups={priceGroups} />
```

---

## 7. Передача пропсів — три способи

### Інлайн (для малої кількості даних)
```astro
<Faq
   title="FAQ"
   items={[
      { question: "Питання 1", answer: "Відповідь 1" },
      { question: "Питання 2", answer: "Відповідь 2" },
   ]}
/>
```

### Змінна у frontmatter (для великої кількості даних)
```astro
---
const faqItems = [
   { question: "Питання 1", answer: "Відповідь 1" },
   // ...багато пунктів
];
---

<Faq items={faqItems} />
```

### Окремий data файл (для дуже великих наборів або даних що шаряться між сторінками)

Створи `src/data/rhinoplasty-faq.ts`:
```ts
export const rhinoplastyFaq = [
   { question: "How long is the recovery?", answer: "..." },
   { question: "Is it painful?", answer: "..." },
];
```

Використання на сторінці:
```astro
---
import Faq from "@components/sections/Faq.astro";
import { rhinoplastyFaq } from "@data/rhinoplasty-faq";
---

<Faq items={rhinoplastyFaq} />
```

---

## 8. Slot — гнучкий контент

Коли не знаєш заздалегідь що буде всередині компонента.

### Простий slot
```astro
---
// Card.astro
---
<div class="card">
   <slot />
</div>
```

```astro
<Card>
   <h3>Заголовок</h3>
   <p>Будь-який контент</p>
</Card>
```

### Іменовані slots (кілька зон)
```astro
---
// Section.astro
interface Props {
   title?: string;
}
const { title } = Astro.props;
---

<section class="section">
   <div class="section__header">
      {title && <h2>{title}</h2>}
      <slot name="header-extra" />
   </div>
   <div class="section__body">
      <slot />
   </div>
   <div class="section__footer">
      <slot name="footer" />
   </div>
</section>
```

```astro
<Section title="Наша команда">
   <span slot="header-extra">12 спеціалістів</span>

   <p>Основний контент секції</p>

   <a slot="footer" href="/team">Вся команда →</a>
</Section>
```

---

## 9. Підключення компонентів на сторінці

```astro
---
// rhinoplasty.astro
import Faq from "@components/sections/Faq.astro";
import Services from "@components/sections/Services.astro";
import PriceList from "@components/sections/PriceList.astro";

const faqItems = [...];
const services = [...];
const priceGroups = [...];
---

<BaseLayout>
   <PageMain>
      <Services items={services} theme="dark" columns={3} />
      <PriceList groups={priceGroups} />
      <Faq items={faqItems} title="Frequently asked questions" />
   </PageMain>
</BaseLayout>
```

---

## 10. Стилі компонента

```scss
// src/styles/components/sections/_faq.scss
@use "@styles/utils" as *;

.faq {
   &__container {
   }

   &__title {
   }

   &__accordion {
      counter-reset: accordion-counter;

      [data-accordion-item] {
         counter-increment: accordion-counter;
      }

      [data-accordion-trigger]::before {
         content: "/" counter(accordion-counter, decimal-leading-zero);
      }
   }
}
```

Підключення в компоненті:
```astro
---
import "@styles/components/sections/_faq.scss";
---
```

---

## 11. Правила іменування

| Що | Формат | Приклад |
|---|---|---|
| Компонент | PascalCase | `Faq.astro`, `CardsSlider.astro` |
| SCSS файл | _kebab-case | `_faq.scss`, `_cards-slider.scss` |
| CSS класи | BEM | `.faq__title`, `.services__card` |
| Пропси | camelCase | `defaultOpen`, `slidesPerView` |
| Data файли | kebab-case | `rhinoplasty-faq.ts` |

---

## 12. Аліаси шляхів (tsconfig.json)

```json
{
   "compilerOptions": {
      "baseUrl": ".",
      "paths": {
         "@components/*": ["src/components/*"],
         "@styles/*":     ["src/styles/*"],
         "@assets/*":     ["src/assets/*"],
         "@data/*":       ["src/data/*"]
      }
   }
}
```

---

## 13. Чеклист перед створенням компонента

- [ ] Секція повторюється або може повторитись? → виносимо в `sections/`
- [ ] Визначив які дані змінюються між сторінками → це пропси
- [ ] Визначив які дані завжди однакові → хардкод в шаблоні
- [ ] Описав `interface Props` з правильними типами
- [ ] Поставив `?` на необов'язкові пропси
- [ ] Задав дефолтні значення де потрібно
- [ ] Великий масив даних → виніс у змінну або окремий файл `src/data/`
- [ ] Створив SCSS файл у правильній папці
- [ ] Підключив SCSS в компоненті
- [ ] Використав BEM іменування
- [ ] Компонент називається `PascalCase`
