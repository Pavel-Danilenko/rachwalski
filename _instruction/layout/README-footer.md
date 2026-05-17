# Footer

Футер з гнучкою slot-системою: колонки лінків, соціалки, копірайт.

```
src/
├── components/layout/footer.astro          — компонент
└── styles/components/layout/_footer.scss   — стилі (підключені в компоненті)
```

---

## Як підключається

Футер підключений у `BaseLayout.astro` один раз — контент редагується там же.  
На окремих сторінках футер **не потрібно підключати** — він є автоматично через лейаут.

---

## Slots

| Slot | Де рендериться | Fallback |
|---|---|---|
| `default` | `.footer__grid` (грід колонок) | — |
| `top` | Над гнідом (лого, опис компанії) | порожньо (не рендериться) |
| `bottom` | Нижня панель (копірайт + соціалки) | `copyright` prop |

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `copyright` | `string` | `© {рік} My Company` | Текст копірайту (якщо не перевизначений через slot `bottom`) |
| `class` | `string` | — | Додатковий CSS клас |

---

## Базове використання (в BaseLayout)

```astro
<Footer copyright="© 2025 My Company">

   <!-- Default slot → .footer__grid (колонки) -->
   <div class="footer__col">
      <span class="footer__col-title">Компанія</span>
      <ul class="footer__col-list">
         <li><a href="/about" class="footer__col-link">Про нас</a></li>
         <li><a href="/services" class="footer__col-link">Послуги</a></li>
      </ul>
   </div>

   <div class="footer__col">
      <span class="footer__col-title">Підтримка</span>
      <ul class="footer__col-list">
         <li><a href="/faq" class="footer__col-link">FAQ</a></li>
         <li><a href="/privacy" class="footer__col-link">Конфіденційність</a></li>
      </ul>
   </div>

   <!-- Slot "bottom" → нижня панель замість автоматичного копірайту -->
   <Fragment slot="bottom">
      <p class="footer__copyright">© 2025 My Company</p>
      <div class="footer__socials">
         <a href="#" class="footer__social-link" aria-label="Instagram">
            <svg>...</svg>
         </a>
      </div>
   </Fragment>

</Footer>
```

---

## Варіанти

### Тільки копірайт (мінімальний)
```astro
<Footer copyright="© 2025 My Company. All rights reserved." />
```

### З лого у верхній секції
```astro
<Footer>
   <Fragment slot="top">
      <Logo href="/" text="My Company" />
      <p>Розробляємо сучасні веб-продукти</p>
   </Fragment>

   <div class="footer__col">...</div>
</Footer>
```

### Кастомна нижня панель без соціалок
```astro
<Footer>
   <div class="footer__col">...</div>

   <Fragment slot="bottom">
      <p class="footer__copyright">© 2025 My Company</p>
      <nav>
         <a href="/privacy">Конфіденційність</a>
         <a href="/terms">Умови</a>
      </nav>
   </Fragment>
</Footer>
```

---

## CSS класи

```
.footer                — wrapper
.footer__container     — max-width центрований контейнер
.footer__top           — верхня секція (slot "top")
.footer__grid          — auto-fit грід для колонок
.footer__col           — одна колонка
.footer__col-title     — заголовок колонки (uppercase)
.footer__col-list      — список лінків
.footer__col-link      — один лінк
.footer__bottom        — нижня панель (flex, space-between)
.footer__copyright     — текст копірайту
.footer__socials       — обгортка соціальних іконок
.footer__social-link   — кругла кнопка соціалки
```

---

## Responsive

| Ширина | Колонки |
|---|---|
| > 768px | `auto-fit minmax(180px, 1fr)` — автоматично |
| ≤ 768px | 2 колонки, bottom — вертикально |
| ≤ 480px | 1 колонка |
