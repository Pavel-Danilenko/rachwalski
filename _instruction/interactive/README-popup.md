# Popup

Модальні вікна з backdrop, анімацією, focus trap, ESC і підтримкою Astro transitions.

```
src/
├── components/popups/
│   ├── Popups.astro      — контейнер всіх попапів (підключений у BaseLayout)
│   └── MyPopup.astro     — компонент одного попапу
├── scripts/init/modal.js — логіка (open/close, focus trap, bodyLock)
└── styles/components/popups/_popup.scss — стилі
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fpopup` | Новий попап у `Popups.astro` |
| `fpopup-open` | Кнопка відкриття попапу |

---

## Як підключити

**Крок 1.** `Popups.astro` вже є у `BaseLayout.astro` — нічого не треба.

**Крок 2.** Додай свій попап у `Popups.astro`:

```astro
<MyPopup id="my-modal">
   <button data-popup-close aria-label="Закрити">✕</button>
   <h2>Заголовок</h2>
   <p>Контент попапу</p>
</MyPopup>
```

**Крок 3.** На будь-якій сторінці додай кнопку відкриття:

```html
<button data-popup-open="my-modal">Відкрити</button>
```

---

## Props (`MyPopup.astro`)

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `id` | `string` | — | **Обов'язковий.** Унікальний ідентифікатор |
| `backdropClose` | `boolean` | `true` | Закривати при кліку поза контентом |
| `maxWidth` | `string` | `560px` | Максимальна ширина картки (`"800px"`, `"90vw"`) |
| `class` | `string` | — | Додатковий клас на `.popup__content` |

---

## Приклади

### Базовий
```astro
<MyPopup id="info">
   <button data-popup-close aria-label="Закрити">✕</button>
   <h2>Інформація</h2>
   <p>Текст...</p>
</MyPopup>
```

### Широкий (галерея, відео)
```astro
<MyPopup id="gallery" maxWidth="90vw" backdropClose={true}>
   <button data-popup-close aria-label="Закрити">✕</button>
   <img src="/img/photo.jpg" alt="Фото" style="width: 100%;" />
</MyPopup>
```

### Без закриття по backdrop (важлива форма)
```astro
<MyPopup id="confirm" backdropClose={false}>
   <h2>Підтвердіть дію</h2>
   <p>Ви впевнені?</p>
   <div>
      <button data-popup-close>Скасувати</button>
      <button>Підтвердити</button>
   </div>
</MyPopup>
```

### Відкриття з посилання
```html
<a href="#" data-popup-open="feedback">Написати нам</a>
```

---

## Data-атрибути

| Атрибут | На чому | Що робить |
|---|---|---|
| `data-popup-open="id"` | `button`, `a` | Відкриває попап з відповідним id |
| `data-popup-close` | `button`, `a` | Закриває активний попап |
| `data-popup="id"` | на `.popup` | Ідентифікатор (генерується компонентом) |
| `data-backdrop-close="false"` | на `.popup` | Забороняє закриття по backdrop |

---

## Класи що JS додає

| Клас | Де | Умова |
|---|---|---|
| `popup--open` | `.popup` | Попап відкритий |
| `popup-show` | `<html>` | Попап відкритий (для backdrop CSS) |
| `lock` | `<html>` | Скрол заблоковано |

---

## Клавіатура

| Клавіша | Дія |
|---|---|
| `Escape` | Закрити попап |
| `Tab` / `Shift+Tab` | Циклиться тільки по елементах попапу (focus trap) |
| Клік поза `.popup__content` | Закрити (якщо `backdropClose={true}`) |

---

## CSS кастомізація

```scss
// Кастомний розмір
.my-wide-popup {
   max-width: 800px;
}

// Кастомна анімація (замість translateY)
.popup--open .my-popup-content {
   animation: slideDown 0.3s ease;
}
```
