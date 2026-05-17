# Preloader

Повноекранний прелоадер з лічильником відсотків і прогрес-баром. Показується тільки при першому завантаженні або F5, при переходах між сторінками Astro — не показується.

```
src/
├── components/interactive/Preloader.astro        — компонент (розміщується в BaseLayout)
├── scripts/init/preloader.js                     — логіка (анімація, hide, sessionStorage)
└── styles/components/interactive/_preloader.scss — стилі
```

## Сніпети VS Code

| Префікс | Опис |
|---|---|
| `fpreloader` | Вставити `<Preloader />` з усіма пропами |

---

## Підключення

Розміщується **один раз** у `BaseLayout.astro` — до закриття `</body>`:

```astro
---
import Preloader from "@components/interactive/Preloader.astro";
---

<Preloader />
```

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `hideDelay` | `number` | `500` | Затримка перед зникненням після завантаження (мс) |
| `fadeDuration` | `number` | `600` | Тривалість fade-out анімації (мс) |
| `minDisplayTime` | `number` | `0` | Мінімальний час показу (мс). `0` = зникає одразу після load |
| `simulationDuration` | `number` | `800` | Час анімації лічильника від 0 до 90% (мс) |

---

## Приклади

### Дефолт (швидкий)
```astro
<Preloader />
```

### З мінімальним часом показу (для ефекту)
```astro
<Preloader
   minDisplayTime={2000}
   simulationDuration={1500}
   fadeDuration={800}
/>
```

### Швидкий (майже непомітний)
```astro
<Preloader
   simulationDuration={300}
   fadeDuration={400}
   hideDelay={200}
/>
```

---

## Кастомізація кольорів

За замовчуванням — темний фон, білий текст. Перевизнач CSS-змінні:

```scss
// Світлий прелоадер
.preloader {
   --preloader-bg:          var(--color-bg);
   --preloader-color:       var(--color-text);
   --preloader-color-muted: var(--color-text-muted);
   --preloader-bar-track:   var(--color-border);
   --preloader-bar-fill:    var(--color-primary);
}
```

```scss
// Брендовий колір
.preloader {
   --preloader-bg:        var(--color-primary);
   --preloader-color:     #fff;
   --preloader-bar-fill:  #fff;
}
```

---

## Як це працює

```
DOMContentLoaded
   ↓
Перший візит або F5?  →  НІ  →  exit (не показуємо)
   ↓ ТАК
Показати прелоадер (opacity: 1) + bodyLock()
   ↓
Анімація 0% → 90% за simulationDuration
   ↓
window "load" event (всі ресурси завантажені)
   ↓
bodyUnlock() → анімація 90% → 100%
   ↓
html.classList.add("preloader-loaded")
   ↓
fade-out за fadeDuration → display: none
   ↓
sessionStorage.set("preloader_shown", "true")
```

**При переходах між сторінками Astro** — `sessionStorage` зберігається, тому `!isFirstVisit && !isReload` → прелоадер не показується.  
**При F5** — sessionStorage очищається браузером → прелоадер показується знову.

---

## CSS клас `preloader-loaded`

Після зникнення прелоадера на `<html>` додається клас `preloader-loaded`. Використовуй для анімацій входу:

```scss
// Елементи невидимі поки не закриється прелоадер
.hero__title {
   opacity: 0;
   transform: translateY(20px);
   transition: opacity 0.6s ease, transform 0.6s ease;
}

.preloader-loaded .hero__title {
   opacity: 1;
   transform: translateY(0);
}
```
