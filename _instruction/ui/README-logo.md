# Logo

Логотип сайту. На головній — `<div>`, на інших сторінках — `<a href="/">`. Після Barba-навігації автоматично свопає елемент без перезавантаження сторінки.

```
src/components/ui/Logo.astro
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `flogo` | Базовий логотип (для хедера) |
| `flogo:img` | Логотип із зображенням |
| `flogo:footer` | Логотип для футера (alwaysLink) |

---

## Використання

### Хедер — стандартна поведінка

```astro
---
import Logo from "@components/ui/Logo.astro";
---

<!-- Текстовий логотип -->
<Logo href="/" text="My Logo" />

<!-- Логотип-зображення -->
<Logo href="/" imageSrc="/logo.svg" imageAlt="My Company" />

<!-- Кастомний слот -->
<Logo href="/">
   <img src="/logo.svg" alt="My Company" />
   <span>My Brand</span>
</Logo>
```

### Футер — завжди посилання

```astro
<!-- alwaysLink → завжди <a href="/"> навіть на головній -->
<Logo href="/" text="My Logo" alwaysLink />
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `href` | `string` | `"/"` | URL куди веде лого |
| `text` | `string` | — | Текстовий логотип |
| `imageSrc` | `string` | — | URL зображення |
| `imageAlt` | `string` | `"Logo"` | Alt для зображення |
| `alwaysLink` | `boolean` | `false` | Завжди `<a>` (для футера) |
| `target` | `"_blank"` \| `"_self"` | `"_self"` | Відкрити в новій вкладці |
| `class` | `string` | — | Додатковий CSS клас |

---

## Логіка рендерингу

```
alwaysLink = false (дефолт — для хедера):
  Головна сторінка  →  <div class="logo">          (не посилання)
  Інші сторінки     →  <a href="/" class="logo">   (посилання)

alwaysLink = true (для футера):
  Будь-яка сторінка →  <a href="/" class="logo">   (завжди посилання)
```

---

## Як працює після Barba-навігації

Header не замінюється Barba (він поза контейнером). Тому JS слідкує за переходами і свопає `<div>` ↔ `<a>` при кожному `page:ready`:

```
Перехід: / → /about  →  <div> стає <a href="/">
Перехід: /about → /  →  <a> стає <div>
```

> Логотипи з `alwaysLink` (`data-logo-swap` відсутній) JS не чіпає — вони завжди `<a>`.

---

## Стилізація

```scss
// Розмір тексту
.logo__text {
   font-size: var(--text-xl);
   font-weight: 700;
}

// Розмір зображення (дефолт height: 40px)
.logo__img {
   height: 2.5rem;
}

// Кастомний клас на компоненті
<Logo href="/" text="Brand" class="header__logo" />
```

```scss
.header__logo {
   gap: 0.5rem;   // відстань між зображенням і текстом
}
```

---

## Приклад у хедері та футері

```astro
<!-- Header.astro -->
<Logo href="/" text="My Logo" />

<!-- Footer.astro -->
<Logo href="/" text="My Logo" alwaysLink class="footer__logo" />
```
