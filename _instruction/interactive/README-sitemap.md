# Sitemap

Компонент карти сайту. На десктопі — колонки. На мобільному — accordion.

```
src/components/sitemap/
├── Sitemap.astro        — обгортка з breakpoint + data-active-links
└── SitemapGroup.astro   — одна колонка / accordion-item
```

---

## Базове використання

```astro
---
import Sitemap      from "@components/sitemap/Sitemap.astro";
import SitemapGroup from "@components/sitemap/SitemapGroup.astro";
import NavItem      from "@components/menu/NavItem.astro";
---

<Sitemap>
   <SitemapGroup title="Компанія">
      <NavItem nav="about" />
      <NavItem nav="team" />
   </SitemapGroup>

   <SitemapGroup title="Послуги">
      <NavItem nav="servicesWeb" />
      <NavItem nav="servicesDesign" />
   </SitemapGroup>

   <SitemapGroup title="Контакти">
      <NavItem nav="contact" />
   </SitemapGroup>
</Sitemap>
```

**Десктоп** → колонки поряд (CSS Grid `auto-fit`)  
**Мобільний (< 768px)** → кожна група стає accordion-item (закрита за замовчуванням)

---

## Sitemap — пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `breakpoint` | `number` | `768` | Ширина екрана (px) при якій вмикається accordion |
| `class` | `string` | — | Додатковий CSS клас |

```astro
<!-- Accordion вмикається нижче 1024px -->
<Sitemap breakpoint={1024}>
   ...
</Sitemap>
```

---

## SitemapGroup — пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `title` | `string` | — | Назва групи — обов'язкове |
| `open` | `boolean` | `false` | Відкрита за замовчуванням на мобільному |
| `class` | `string` | — | Додатковий CSS клас |

```astro
<!-- Перша група відкрита за замовчуванням на мобільному -->
<SitemapGroup title="Компанія" open>
   ...
</SitemapGroup>
```

---

## Активний клас

`Sitemap.astro` вже має `data-active-links` — `menu-active-links.js` автоматично додає `is-active` і `aria-current="page"` на посилання поточної сторінки. Нічого додатково підключати не треба.

```scss
// Стилізуй в своєму SCSS:
.footer__col-link {
   &.is-active { color: var(--color-primary); }
}
```

### `data-active-links` — універсальний атрибут

Додай на будь-який контейнер де потрібен активний клас — не тільки sitemap:

```astro
<!-- Футер, sidebar, breadcrumbs — де завгодно -->
<nav data-active-links>
   <a href="/about">Про нас</a>
   <a href="/contact">Контакти</a>
</nav>
```

> `[data-menu]` теж відслідковується автоматично — нічого додавати не треба.

---

## Структура HTML (для розуміння)

`SitemapGroup` генерує три рівні вкладення для коректної CSS Grid анімації:

```html
<div class="sitemap__group-content">   <!-- 1. grid-template-rows: 0fr/1fr -->
   <div class="sitemap__group-overflow"> <!-- 2. overflow: hidden -->
      <div class="sitemap__group-inner"> <!-- 3. padding + flex column -->
         <!-- контент -->
      </div>
   </div>
</div>
```

---

## Кастомний контент в групі

Всередині `SitemapGroup` — будь-який HTML, не тільки `NavItem`:

```astro
<SitemapGroup title="Соцмережі">
   <a href="https://instagram.com" target="_blank">Instagram</a>
   <a href="https://linkedin.com"  target="_blank">LinkedIn</a>
</SitemapGroup>
```

---

## Повний приклад в футері

```astro
---
import Sitemap      from "@components/sitemap/Sitemap.astro";
import SitemapGroup from "@components/sitemap/SitemapGroup.astro";
import NavItem      from "@components/menu/NavItem.astro";
---

<footer class="footer">
   <Sitemap breakpoint={768}>

      <SitemapGroup title="Сторінки" open>
         <NavItem nav="home"    class="footer__col-link" />
         <NavItem nav="about"   class="footer__col-link" />
         <NavItem nav="contact" class="footer__col-link" />
      </SitemapGroup>

      <SitemapGroup title="Підтримка">
         <a href="/faq"     class="footer__col-link">FAQ</a>
         <a href="/privacy" class="footer__col-link">Конфіденційність</a>
      </SitemapGroup>

      <SitemapGroup title="Контакти">
         <a href="mailto:hello@example.com" class="footer__col-link">hello@example.com</a>
         <a href="tel:+380501234567"        class="footer__col-link">+38 (050) 123-45-67</a>
      </SitemapGroup>

   </Sitemap>
</footer>
```
