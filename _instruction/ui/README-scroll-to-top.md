# ScrollToTop — кнопка "вгору"

Універсальний компонент. Показується після прокрутки на `threshold` px, клік → плавний скрол на top. Базова анімація — пружинний slide-in справа + scale. Позиція, розмір, колір — виключно в стилях проекту.

```
src/components/ui/ScrollToTop.astro
src/styles/components/ui/_scroll-to-top.scss   ← базова анімація
src/scripts/init/scroll-to-top.js
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `scroll-top` | Project styles — позиція/розмір/колір |

---

## Підключення

Компонент вже підключений у `BaseLayout.astro` поза Barba-контейнером — рендериться на всіх сторінках, ініціалізується один раз.

```astro
{!hideChrome && <ScrollToTop />}
```

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `threshold` | `number` | `window.innerHeight` | px від top, після яких показується кнопка |
| `icon` | `string` | `"arrow-up-scroll"` | назва іконки зі спрайту |
| `class` | `string` | `""` | додаткові CSS-класи |

---

## Базове використання

```astro
<ScrollToTop />
```

З кастомним порогом (після 500px):

```astro
<ScrollToTop threshold={500} />
```

З іншою іконкою:

```astro
<ScrollToTop icon="chevron-up" />
```

---

## Базові стилі (анімація)

Файл `_scroll-to-top.scss` — тільки transition/opacity/transform. **Не містить** position, size, color.

```scss
.scroll-top {
   opacity: 0;
   pointer-events: none;
   transform: translateX(150%) scale(0.4);
   transition:
      opacity 0.35s ease,
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); // spring

   &.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0) scale(1);
   }
}
```

---

## Стилі проекту

Пиши в `_common.scss` або в стилях конкретної сторінки. Сніпет `scroll-top` генерує готовий блок.

Типовий приклад (мобільна кнопка, fixed, над MobileBookingBar):

```scss
.scroll-top {
   display: none;

   @include respond-to("md") {
      display: flex;
      align-items: center;
      justify-content: center;

      position: fixed;
      bottom: toRem(76);   // над MobileBookingBar (16px + ~46px + 10px gap)
      right: toRem(16);
      z-index: 101;

      width: toRem(40);
      height: toRem(40);
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(11, 17, 26, 0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: var(--color-white);
      cursor: pointer;
      font-size: toRem(18);

      @media (any-hover: hover) {
         &:hover {
            background: rgba(11, 17, 26, 0.55);
         }
      }
   }
}
```

---

## JS — як працює

- `data-scroll-top` — атрибут кнопки (авто-виявлення в `app.js`)
- `data-threshold` — кастомний поріг (опційно)
- `data-scroll-top-init` — захист від подвійної ініціалізації
- `is-visible` — клас для показу кнопки
- На `page:ready` (SPA-навігація) клас `is-visible` знімається автоматично

---

## SPA (Barba.js)

Компонент рендериться **поза** `data-barba="container"`, тому ініціалізується один раз. При переходах між сторінками кнопка ховається (scroll повертається на top), а після прокрутки знову з'являється.
