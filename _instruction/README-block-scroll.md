# Block Scroll — блокування скролу

Блокує скрол сторінки при відкритті попапу або меню. Використовує `overflow: hidden` на `<html>` з компенсацією ширини скролбара.

```
src/scripts/global/block-scroll.js
```

---

## Як це працює

```
bodyLock()
  → вимірює ширину скролбара (≈15px на десктопі)
  → body.paddingRight += scrollbarWidth      (щоб body не стрибав)
  → [data-lock].paddingRight += scrollbarWidth (фіксовані елементи)
  → html.classList.add("lock")               → overflow: hidden

bodyUnlock(delay)
  → через delay мс: видаляє клас і скидає padding
```

Скрол позиція **ніколи не змінюється** — немає стрибка при відкритті/закритті.

---

## API

```js
import { bodyLock, bodyUnlock, resetBodyLock } from "@scripts/global/block-scroll";
```

### `bodyLock()`
Блокує скрол. Якщо вже заблоковано — ігнорується.

```js
bodyLock();
```

### `bodyUnlock(delay?)`
Розблоковує скрол через `delay` мс (дефолт 300мс — час CSS анімації закриття попапу).

```js
bodyUnlock();        // 300ms (дефолт)
bodyUnlock(500);     // кастомна затримка
```

### `resetBodyLock()`
Миттєво скидає блокування без затримки. Використовується автоматично при `page:leave` (Barba-навігація).

```js
resetBodyLock();
```

---

## data-lock — компенсація для фіксованих елементів

Коли скролбар зникає — фіксовані елементи (`position: fixed`) зсуваються вправо на ~15px. `data-lock` компенсує це автоматично.

**Додай на хедер або будь-який `position: fixed` елемент:**

```astro
<!-- Header.astro -->
<header class="header" data-lock>
```

```html
<!-- Будь-який fixed елемент -->
<div class="sticky-bar" data-lock>
<nav class="fixed-nav" data-lock>
```

При `bodyLock()` ці елементи отримають `paddingRight = scrollbarWidth`, при `bodyUnlock()` — знімається.

---

## Використання з попапом

Popup і меню вже підключені. Нічого додатково робити не треба.

Якщо пишеш власний компонент що блокує скрол:

```js
import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

// Відкрити
function openPanel() {
   bodyLock();
   panel.classList.add("is-open");
}

// Закрити
function closePanel() {
   panel.classList.remove("is-open");
   bodyUnlock(300); // 300ms = час CSS анімації закриття
}
```

---

## Barba.js

При переході між сторінками `resetBodyLock()` спрацьовує автоматично на `page:leave`. Якщо попап або меню відкриті під час навігації — скрол розблокується без залишкових стилів.

---

## CSS

```scss
// src/styles/base/_base.scss
.lock {
   overflow: hidden;
}
```

`overflow: hidden` на `<html>` — простий і надійний спосіб заблокувати скрол на всіх сучасних браузерах включно з iOS Safari 14+.

---

## Поширені помилки

**Хедер "стрибає" при відкритті попапу:**
→ Додай `data-lock` на `<header>`

**Скрол не розблоковується після закриття:**
→ Переконайся що `bodyUnlock()` викликається в `close()` компонента

**Два компоненти намагаються заблокувати одночасно:**
→ `isLocked` guard запобігає подвійному блокуванню — другий виклик `bodyLock()` ігнорується
