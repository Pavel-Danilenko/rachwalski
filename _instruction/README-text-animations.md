# Текстові анімації — typing + split

Два скрипти для анімації тексту. Обидва інтегруються з `data-watch` для запуску при скролі.

```
src/scripts/animation/typing.js  — друкарська машинка / плавна поява
src/scripts/animation/split.js   — розліт літер і збирання
```

---

## typing.js — друкарська машинка

### Базове використання

```html
<!-- Режим "type" — літера за літерою (дефолт) -->
<h1 data-typing>Привіт світ</h1>

<!-- Режим "fade" — літери плавно виринають знизу -->
<h1 data-typing="fade">Привіт світ</h1>
```

### Всі атрибути

| Атрибут | Дефолт | Опис |
|---|---|---|
| `data-typing` | `"type"` | Режим: `"type"` або `"fade"` |
| `data-typing-speed` | `60` | Мс між появою кожної літери |
| `data-typing-delay` | `0` | Затримка перед стартом (мс) |
| `data-typing-cursor` | — | Додає мигаючий курсор `\|` після тексту |

### Приклади

```html
<!-- Заголовок з курсором -->
<h1 data-typing data-typing-cursor>Привіт світ</h1>

<!-- Швидко -->
<h2 data-typing data-typing-speed="25">Швидко</h2>

<!-- Повільно з затримкою -->
<h2 data-typing data-typing-speed="100" data-typing-delay="500">Повільно</h2>

<!-- Плавна поява літер -->
<p data-typing="fade">Текст появляється плавно</p>
```

### З data-watch (при скролі)

```html
<!-- Один раз — коли елемент потрапляє у viewport -->
<h2 data-watch-once data-typing>Заголовок</h2>

<!-- Щоразу — перезапускається коли входить/виходить -->
<h2 data-watch data-typing data-typing-speed="40">Повторюється</h2>

<!-- Fade при скролі з затримкою -->
<h2 data-watch-once data-typing="fade" data-typing-delay="200">Плавно при скролі</h2>
```

---

## split.js — розліт літер

Літери розлітаються хаотично з blur-ефектом і збираються назад коли елемент потрапляє у viewport.

### Базове використання

```html
<!-- Одразу через власний IntersectionObserver -->
<h1 data-split>Привіт світ</h1>
```

### Всі атрибути

| Атрибут | Дефолт | Опис |
|---|---|---|
| `data-split` | — | Вмикає анімацію |
| `data-split-spread` | `200` | Відстань розльоту літер (px) |
| `data-split-duration` | `700` | Тривалість анімації (мс) |
| `data-split-stagger` | `40` | Затримка між літерами (мс) |
| `data-split-threshold` | `0.15` | % видимості для тригера (без data-watch) |

### Приклади

```html
<!-- Ніжний розліт -->
<h2 data-split data-split-spread="100">М'яко</h2>

<!-- Агресивний розліт -->
<h2 data-split data-split-spread="500">Вибух</h2>

<!-- Повільна анімація по черзі -->
<h1 data-split data-split-stagger="80" data-split-duration="1000">По черзі</h1>

<!-- Швидкий збір -->
<h1 data-split data-split-duration="400" data-split-stagger="20">Швидко</h1>
```

### З data-watch (при скролі)

```html
<!-- Один раз — збирається і залишається -->
<h2 data-watch-once data-split>Заголовок</h2>

<!-- Щоразу — розлітається при виході, збирається при вході -->
<h2 data-watch data-split data-split-spread="300">Туди-сюди</h2>

<!-- З тонким налаштуванням -->
<h1 data-watch-once data-split
    data-split-spread="150"
    data-split-duration="900"
    data-split-stagger="60">
   Гарний заголовок
</h1>
```

---

## Різниця між режимами тригера

| | Без `data-watch` | З `data-watch-once` | З `data-watch` |
|---|---|---|---|
| Коли стартує | Одразу при завантаженні | При першому потраплянні у viewport | При кожному потраплянні |
| Повторюється | Ні | Ні | Так |
| Чекає прелоадер | Ні | Так | Так |

**Рекомендація:** для заголовків — `data-watch-once`, для інтерактивних елементів — `data-watch`.

---

## Комбінування з іншими ефектами

```html
<!-- Typing + затримка після split на іншому елементі -->
<h1 data-watch-once data-split data-split-stagger="60">Заголовок</h1>
<p  data-watch-once data-typing="fade" data-typing-delay="600">Підзаголовок</p>

<!-- Каскад: кожен елемент з затримкою -->
<h2 data-watch-once data-typing data-typing-delay="0">Перший</h2>
<h2 data-watch-once data-typing data-typing-delay="400">Другий</h2>
<h2 data-watch-once data-typing data-typing-delay="800">Третій</h2>
```

---

## CSS для курсору (typing)

Анімація курсору вбудована в JS. Якщо потрібно змінити стиль:

```scss
@keyframes typingBlink {
   0%, 100% { opacity: 1; }
   50%       { opacity: 0; }
}
```

---

## Barba.js

Обидва скрипти слухають `page:ready` і використовують `WeakSet` щоб не ініціалізувати один елемент двічі. Після Barba-навігації — нові елементи ініціалізуються автоматично.
