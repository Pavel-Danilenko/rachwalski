# Меню — покрокова інструкція

---

## Як це працює (3 речі)

```
1. nav.ts        — список всіх сторінок (url + назва)
2. NavItem       — один пункт меню що бере дані з nav.ts
3. MenuCustom    — обгортка: бургер + overlay + JS логіка
```

Ти пишеш структуру меню сам (де колонки, де dropdown) — компоненти дають тільки дані і логіку.

---

## Частина 1 — nav.ts

Файл `src/config/nav.ts` — єдине місце де зберігаються URL і назви.
Змінюєш тут → оновлюється скрізь.

### Звичайна сторінка

```ts
home:    { label: "Головна",  url: "/" },
about:   { label: "Про нас",  url: "/about" },
contact: { label: "Контакти", url: "/contact" },
```

### Dropdown trigger (відкриває підменю, сам нікуди не веде)

```ts
services: {
   label: "Послуги",
   // немає url → стане <button>, не <a>
},
```

### Dropdown trigger але і сам є посиланням

```ts
services: {
   label: "Послуги",
   url: "/services",   // є url → стане <a>
},
```

### Просто текст / заголовок колонки (не кнопка, не посилання)

```ts
servicesTitle: { label: "Наші послуги" },
// потім в шаблоні: <NavItem nav="servicesTitle" as="span" />
```

### З дочірніми пунктами

```ts
services: {
   label: "Послуги",
   children: {
      web:    { label: "Веб-розробка", url: "/services/web" },
      design: { label: "Дизайн",       url: "/services/design" },
   },
},
```

### Підменю всередині підменю

```ts
services: {
   label: "Послуги",
   children: {
      web: {
         label: "Веб-розробка",
         url: "/services/web",
         children: {
            landing: { label: "Лендінги", url: "/services/web/landing" },
            shop:    { label: "Магазини",  url: "/services/web/shop" },
         },
      },
   },
},
```

### Відкрити в новій вкладці

```ts
docs: { label: "Документація", url: "https://docs.example.com", target: "_blank" },
```

### Скрол до секції (не переходить на іншу сторінку)

```ts
scrollContact: {
   label: "Зв'язатись",
   goto: "#contact",
   gotoOffset: ".header",   // враховує висоту хедера при скролі
},
```

---

## Частина 2 — NavItem

`NavItem` — один пункт меню. Сам вирішує що рендерити:

| Що в nav.ts | Що рендериться |
|---|---|
| є `url` | `<a href="/about">Про нас</a>` |
| є `goto` | `<a href="#contact" data-goto="#contact">` |
| немає `url` і `goto` | `<button type="button">Послуги</button>` |
| передав `as="span"` | `<span>Назва</span>` |

### Базові приклади

```astro
<!-- Просто посилання -->
<NavItem nav="about" />
→ <a href="/about">Про нас</a>

<!-- З CSS класом -->
<NavItem nav="about" class="nav__link" />
→ <a href="/about" class="nav__link">Про нас</a>

<!-- Примусово кнопка -->
<NavItem nav="services" as="button" />
→ <button type="button">Послуги</button>

<!-- Просто текст -->
<NavItem nav="servicesTitle" as="span" />
→ <span>Наші послуги</span>
```

### Додати іконку перед текстом

```astro
<NavItem nav="about">
   <svg slot="before">...</svg>
</NavItem>
→ <a href="/about"><svg/>Про нас</a>
```

### Додати іконку і опис

```astro
<NavItem nav="about">
   <svg slot="before">...</svg>
   <span slot="after">Дізнайся більше про команду</span>
</NavItem>
→ <a href="/about"><svg/>Про нас<span>Дізнайся більше...</span></a>
```

> `slot="before"` — контент ДО тексту  
> `slot="after"` — контент ПІСЛЯ тексту

### Обгорнути текст в span (для стилізації)

```astro
<NavItem nav="about" wrapLabel />
→ <a href="/about"><span class="nav-label">Про нас</span></a>

<!-- Тепер можна стилізувати .nav-label в SCSS -->
```

---

## Частина 3 — MenuCustom

Обгортка яка додає:
- Бургер кнопку (мобільне меню)
- JS логіку (відкриття/закриття, dropdown, фокус-трап)
- `data-menu` атрибут для скриптів

```astro
<MenuCustom>
   <!-- тут твоя структура -->
</MenuCustom>
```

### Пропси

```astro
<MenuCustom
   closeOthers        <!-- закривати інші dropdown при відкритті нового -->
   burgerLabel="Меню" <!-- aria-label для бургера (для скрін-рідерів) -->
   class="my-nav"     <!-- CSS клас на <nav> -->
/>
```

---

## Частина 4 — Будуємо меню

### Просте горизонтальне меню

```astro
---
import MenuCustom from "@components/menu/MenuCustom.astro";
import NavItem    from "@components/menu/NavItem.astro";
---

<MenuCustom>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">
         <li><NavItem nav="home"    class="header__nav-link" /></li>
         <li><NavItem nav="about"   class="header__nav-link" /></li>
         <li><NavItem nav="contact" class="header__nav-link" /></li>
      </ul>
   </div>
</MenuCustom>
```

> `data-menu-overlay` — обов'язковий на обгортці списку. JS використовує його для відкриття/закриття на мобільному.

---

### Меню з dropdown

```astro
<MenuCustom>
   <div data-menu-overlay class="header__nav">
      <ul class="header__nav-list">

         <li><NavItem nav="home" class="header__nav-link" /></li>

         <!-- Пункт з dropdown -->
         <li data-submenu-open="services">

            <!-- Тригер — відкриває dropdown -->
            <NavItem nav="services" as="button" data-menu-dropdown-toggle class="header__nav-link" />

            <!-- Підменю -->
            <ul data-submenu="services" class="dropdown">
               <li><NavItem nav="servicesWeb"    class="dropdown__link" /></li>
               <li><NavItem nav="servicesDesign" class="dropdown__link" /></li>
            </ul>

         </li>

         <li><NavItem nav="contact" class="header__nav-link" /></li>

      </ul>
   </div>
</MenuCustom>
```

**Що важливо:**
- `data-submenu-open="services"` — на `<li>` батьківського пункту
- `data-menu-dropdown-toggle` — на тригері (кнопці що відкриває)
- `data-submenu="services"` — на контейнері підменю
- Значення `"services"` у всіх трьох — **однакове**

---

### Мега-меню

```astro
<MenuCustom>
   <div data-menu-overlay class="mega">

      <ul class="mega__nav">
         <li><NavItem nav="home" class="mega__link" /></li>

         <!-- Тригер мега-меню -->
         <li data-submenu-open="services">
            <NavItem nav="services" as="button" data-menu-dropdown-toggle class="mega__link" />

            <!-- Панель мега-меню -->
            <div data-submenu="services" class="mega__panel">

               <!-- Колонка 1 — посилання -->
               <div class="mega__col">
                  <NavItem nav="servicesWeb">
                     <svg slot="before">...</svg>
                     <span slot="after">Сайти і застосунки</span>
                  </NavItem>
                  <NavItem nav="servicesDesign">
                     <svg slot="before">...</svg>
                     <span slot="after">UI/UX і брендинг</span>
                  </NavItem>
               </div>

               <!-- Колонка 2 — кастомний блок (пишеш що хочеш) -->
               <div class="mega__col mega__col--promo">
                  <img src="/img/promo.jpg" alt="" />
                  <p>Безкоштовна консультація</p>
                  <NavItem nav="contact" class="btn btn--primary" />
               </div>

            </div>
         </li>

      </ul>

   </div>
</MenuCustom>
```

---

## Активний клас

Працює автоматично. Скрипт `menu-active-links.js` сам додає `is-active` на посилання поточної сторінки.

```scss
.header__nav-link {
   &.is-active {
      color: var(--color-primary);
   }
}
```

---

## Додати нову сторінку — 2 кроки

**Крок 1** — `src/config/nav.ts`:
```ts
blog: { label: "Блог", url: "/blog" },
```

**Крок 2** — в шаблоні меню:
```astro
<li><NavItem nav="blog" class="header__nav-link" /></li>
```

Все. Більше нічого шукати по коду.

---

## Часті питання

**Як зробити пункт що не є посиланням?**
```ts
// nav.ts — без url
services: { label: "Послуги" }
```
```astro
// шаблон — as="button" або as="span"
<NavItem nav="services" as="button" />
```

**Як зробити заголовок колонки?**
```ts
colTitle: { label: "Напрямки" }
```
```astro
<NavItem nav="colTitle" as="span" class="mega__col-title" />
```

**Як відкрити посилання в новій вкладці?**
```ts
docs: { label: "Документація", url: "https://...", target: "_blank" }
```

**Як зробити скрол до секції?**
```ts
scrollServices: { label: "Послуги", goto: "#services", gotoOffset: ".header" }
```
