# slide-nav — рухомий індикатор навігації

Переміщує `<span>` (або будь-який елемент) до активного пункту навігації.
Спрацьовує коли будь-який скрипт додає клас `is-active` на елемент всередині контейнера.

```
src/scripts/init/slide-nav.js
```

---

## Підключення

### 1. Додай атрибути в HTML

```html
<div class="nav__list" data-slide-nav>
   <a class="nav__link" href="#section1">Пункт 1</a>
   <a class="nav__link" href="#section2">Пункт 2</a>
   <a class="nav__link" href="#section3">Пункт 3</a>
   <span class="nav__indicator" data-slide-indicator></span>
</div>
```

`data-slide-nav` — на батьківському контейнері  
`data-slide-indicator` — на span що буде рухатись  
Span додаєш сам в HTML, стилізуєш сам.

### 2. app.js підхопить автоматично

Якщо `[data-slide-nav]` є на сторінці — скрипт завантажиться сам.

---

## Орієнтація

За замовчуванням — **вертикальна** (рухається по `top` / `height`).

```html
<!-- вертикальна (дефолт) -->
<div data-slide-nav>...</div>

<!-- горизонтальна (рухається по left / width) -->
<div data-slide-nav="horizontal">...</div>
```

---

## Приклади

### ToC (вертикальна, з toc.js)

```html
<div class="toc__list" data-slide-nav>
   <a class="toc__link" href="#intro"    data-goto="#intro">Вступ</a>
   <a class="toc__link" href="#details"  data-goto="#details">Деталі</a>
   <a class="toc__link" href="#results"  data-goto="#results">Результати</a>
   <span class="toc__indicator" data-slide-indicator></span>
</div>
```

`toc.js` додає `is-active` → `slide-nav.js` рухає індикатор.

### Таби (горизонтальна, з tabs.js)

```html
<div class="tabs__nav" data-slide-nav="horizontal">
   <button class="tabs__button" data-tab="tab1">Таб 1</button>
   <button class="tabs__button" data-tab="tab2">Таб 2</button>
   <span class="tabs__indicator" data-slide-indicator></span>
</div>
```

`tabs.js` додає `is-active` → `slide-nav.js` рухає індикатор горизонтально.

---

## Стилізація span

```scss
.nav__indicator {
   position: absolute;
   left: 0;
   width: 3px;
   background: var(--color-primary);
   transition: top 0.3s ease, height 0.3s ease;
   // Для горизонтальної:
   // transition: left 0.3s ease, width 0.3s ease;
}
```

Батьківський контейнер має бути `position: relative`.

---

## Як працює з іншими скриптами

Скрипт **не залежить** від конкретного скрипту що додає `is-active`.  
Він просто слухає зміни класу через `MutationObserver`.

| Скрипт | Що робить | slide-nav реагує |
|--------|-----------|-----------------|
| `toc.js` | додає `is-active` на лінк при скролі | ✅ |
| `tabs.js` | додає `is-active` на кнопку табу | ✅ |
| `menu-active-links.js` | додає `is-active` на пункт меню | ✅ |
| Будь-який інший | додає `is-active` на дочірній елемент | ✅ |

---

## Barba.js

Автоматично очищається на `page:leave` і переініціалізується на `page:ready`.
