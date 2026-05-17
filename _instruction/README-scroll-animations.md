# Scroll-анімації та навігація по секціям

Три скрипти що працюють разом:

```
data-watch.js   — додає клас коли елемент потрапляє у viewport
scroll-nav.js   — активний пункт меню при скролі (слухає data-watch)
goto-block.js   — плавний скрол до секції при кліку
```

```
src/scripts/global/data-watch.js
src/scripts/init/scroll-nav.js
src/scripts/global/goto-block.js
```

---

## Як вони пов'язані

```
Юзер скролить сторінку
  ↓
data-watch (IntersectionObserver)
  → секція #about увійшла у viewport
  → додає клас _watcher-view на <section id="about">
  ↓
scroll-nav (MutationObserver)
  → бачить що _watcher-view з'явився
  → знімає is-active з усіх пунктів меню
  → додає is-active на <a data-goto="#about">
```

**Важливо:** `scroll-nav` не стежить за скролом напряму — він слухає `_watcher-view` який ставить `data-watch`. Тому секції навігації **обов'язково** мають мати `data-watch`.

---

## Частина 1 — data-watch: анімації при скролі

### Базові атрибути

```html
<!-- Клас додається/знімається при вході/виході -->
<div data-watch>Анімується щоразу</div>

<!-- Клас додається ОДИН РАЗ і залишається -->
<div data-watch-once>Анімується тільки при першому показі</div>
```

За замовчуванням додається клас **`_watcher-view`**.

### SCSS анімація

```scss
.my-block {
   opacity: 0;
   transform: translateY(40px);
   transition: opacity 0.6s ease, transform 0.6s ease;

   &._watcher-view {
      opacity: 1;
      transform: translateY(0);
   }
}
```

### Всі атрибути

| Атрибут | Приклад | Опис |
|---|---|---|
| `data-watch` | — | Постійне — клас є поки секція видна |
| `data-watch-once` | — | Одноразово — клас додається назавжди |
| `data-watch-margin` | `"-100px"` | Тригер за 100px до появи (раніше запуск) |
| `data-watch-threshold` | `"0.3"` | 30% елемента має бути видно (0–1) |
| `data-watch-delay` | `"200"` | Затримка мс перед додаванням класу |
| `data-watch-class` | `"visible"` | Свій клас замість `_watcher-view` |
| `data-watch-event` | `"myEvent"` | Диспатчить CustomEvent на елемент |
| `data-watch-root` | `".wrap"` | Контейнер замість viewport |

### Приклади

```html
<!-- Запуск трохи раніше ніж елемент з'явиться -->
<div data-watch-once data-watch-margin="-80px">

<!-- Тільки коли половина елемента видна -->
<div data-watch-once data-watch-threshold="0.5">

<!-- Каскадний ефект — кожен з затримкою -->
<div data-watch-once data-watch-delay="0">Перший</div>
<div data-watch-once data-watch-delay="150">Другий</div>
<div data-watch-once data-watch-delay="300">Третій</div>

<!-- Свій клас -->
<div data-watch-once data-watch-class="fade-in">
```

```scss
.fade-in-block {
   opacity: 0;
   &.fade-in { opacity: 1; transition: opacity 0.5s; }
}
```

---

## Частина 2 — scroll-nav: активне меню при скролі

Вимагає `data-watch` на секціях — без нього не працює.

### Підключення (3 кроки)

**Крок 1** — Навігація з `data-scroll-nav`:
```html
<nav data-scroll-nav>
   <a data-goto="#about">Про нас</a>
   <a data-goto="#services">Послуги</a>
   <a data-goto="#contact">Контакти</a>
</nav>
```

**Крок 2** — Секції з `data-watch`:
```html
<section id="about"    data-watch data-watch-threshold="0.4">...</section>
<section id="services" data-watch data-watch-threshold="0.4">...</section>
<section id="contact"  data-watch data-watch-threshold="0.4">...</section>
```

**Крок 3** — Стилі для активного пункту:
```scss
[data-scroll-nav] a {
   color: var(--color-text-muted);
   transition: color 0.2s;

   &.is-active {
      color: var(--color-primary);
      font-weight: 600;
   }
}
```

### Активний клас на секції

Якщо потрібен `is-active` і на самій секції — додай `data-scroll-nav-section`:

```html
<section id="about" data-watch data-watch-threshold="0.4" data-scroll-nav-section>
```

```scss
section {
   &.is-active {
      background: var(--color-bg-alt);
   }
}
```

---

## Частина 3 — goto-block: скрол до секції при кліку

### Базове використання

```html
<a data-goto="#about">Перейти до секції</a>
<button data-goto="#contact">Зв'язатись</button>
```

### Відступ зверху (offset)

Якщо є sticky хедер — секція не сховається за ним:

```html
<!-- Фіксований відступ -->
<a data-goto="#about" data-goto-offset="80">

<!-- Автоматично: висота .header -->
<a data-goto="#about" data-goto-offset=".header">

<!-- Висота .header + додатково 20px -->
<a data-goto="#about" data-goto-offset=".header, 20">
```

### Хеш в URL

При заходженні на `site.com/page#about` — автоматично скролить до `#about`.

### Закриття меню

При кліку на `data-goto` — мобільне меню закривається автоматично.

---

## Прогрес-бар скролу

```html
<div data-nav-progress></div>
```

Встановлює CSS-змінну `--scroll-progress` (від 0 до 1):

```scss
[data-nav-progress] {
   position: fixed;
   top: 0;
   left: 0;
   height: 3px;
   background: var(--color-primary);
   width: calc(var(--scroll-progress, 0) * 100%);
   z-index: 9999;
   transition: width 0.1s linear;
}
```

---

## Повний приклад — одна сторінка

```html
<!-- Хедер зі sticky навігацією -->
<header class="header" data-lock>
   <nav data-scroll-nav>
      <a data-goto="#hero"     data-goto-offset=".header">Головна</a>
      <a data-goto="#about"    data-goto-offset=".header">Про нас</a>
      <a data-goto="#services" data-goto-offset=".header">Послуги</a>
      <a data-goto="#contact"  data-goto-offset=".header">Контакти</a>
   </nav>

   <!-- Прогрес скролу -->
   <div data-nav-progress></div>
</header>

<!-- Секції — data-watch обов'язково для scroll-nav -->
<section id="hero"     data-watch data-watch-threshold="0.4">
   <h1 data-watch-once data-watch-margin="-50px">Заголовок</h1>
   <p  data-watch-once data-watch-margin="-50px" data-watch-delay="150">Підзаголовок</p>
</section>

<section id="about"    data-watch data-watch-threshold="0.4">
   <div class="about-card" data-watch-once data-watch-delay="0">...</div>
   <div class="about-card" data-watch-once data-watch-delay="200">...</div>
</section>

<section id="services" data-watch data-watch-threshold="0.4">...</section>
<section id="contact"  data-watch data-watch-threshold="0.4">...</section>
```

---

## Що де використовувати

| Задача | Що використати |
|---|---|
| Анімація елементів при скролі | `data-watch-once` |
| Повторна анімація (туди/назад) | `data-watch` |
| Активний пункт меню при скролі | `data-watch` на секції + `data-scroll-nav` |
| Клік → скрол до секції | `data-goto` + `data-goto-offset` |
| Прогрес скролу | `data-nav-progress` |
