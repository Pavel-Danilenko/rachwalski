# Preloader

Два варіанти прелоадера. Підключається автоматично через `BaseLayout.astro`.

```
src/
├── components/interactive/
│   ├── Preloader.astro          ← Lottie (кастомна анімація)
│   └── PreloaderBasic.astro     ← Базовий (лічильник 0–100%)
├── scripts/init/
│   ├── preloader.js             ← Lottie логіка
│   └── preloader-basic.js       ← Базова логіка
└── styles/components/interactive/
    ├── _preloader.scss          ← Стилі Lottie
    └── _preloader-basic.scss    ← Стилі базового
```

---

## Перемикання

У `BaseLayout.astro` є проп `preloader`:

| Значення | Результат |
|---|---|
| `"default"` | Lottie-анімація з `/public/lottie/data.json` |
| `"basic"` | Лічильник 0–100% + прогресбар |
| `"none"` | Без прелоадера |

```astro
<!-- Lottie (активний на поточному проєкті) -->
<BaseLayout preloader="default">

<!-- Базовий лічильник -->
<BaseLayout preloader="basic">

<!-- Без прелоадера -->
<BaseLayout preloader="none">
```

---

## Lottie прелоадер (`preloader="default"`)

Підхоплює JSON-анімацію з `/public/lottie/data.json` (і зображення з `/public/lottie/images/`).

### Props (Preloader.astro)

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `fadeDuration` | `number` | `600` | Тривалість fade-out анімації (мс) |
| `minDisplayTime` | `number` | `0` | Мінімальний час показу (мс) |

### Підготовка Lottie файлів

1. Експортуй анімацію з After Effects через Bodymovin у папку
2. Скопіюй `data.json` → `/public/lottie/data.json`
3. Скопіюй папку `images/` → `/public/lottie/images/`

### Як це працює

```
Перший візит або F5?  →  НІ  →  exit (не показуємо)
   ↓ ТАК
bodyLock() + показати прелоадер
   ↓
Lottie анімація (autoplay, loop: false)
   ↓
Обидві умови виконані: анімація закінчилась + window.load
   ↓
bodyUnlock()
html.classList.add("preloader-loaded")
fade-out → display: none
sessionStorage.set("preloader_shown", "true")
document.dispatchEvent("preloader:hidden")
```

---

## Базовий прелоадер (`preloader="basic"`)

Лічильник від 0 до 100% з горизонтальним прогресбаром.

### Props (PreloaderBasic.astro)

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `fadeDuration` | `number` | `600` | Тривалість fade-out анімації (мс) |
| `minDisplayTime` | `number` | `0` | Мінімальний час показу (мс) |
| `simulationDuration` | `number` | `800` | Час анімації лічильника від 0 до 90% (мс) |
| `logoText` | `string` | — | Текст логотипу всередині прелоадера |
| `logoSrc` | `string` | — | URL зображення логотипу |
| `logoAlt` | `string` | `"Logo"` | Alt для зображення логотипу |

```astro
<PreloaderBasic minDisplayTime={2000} simulationDuration={1500} logoText="BRAND" />
```

### Кастомізація кольорів

```scss
.preloader-basic {
   --preloader-bg:          var(--color-bg);
   --preloader-color:       var(--color-text);
   --preloader-color-muted: var(--color-text-muted);
   --preloader-bar-track:   var(--color-border);
   --preloader-bar-fill:    var(--color-primary);
}
```

### Як це працює

```
Перший візит або F5?  →  НІ  →  exit (не показуємо)
   ↓ ТАК
bodyLock() + показати прелоадер
   ↓
анімація 0% → 90% → чекаємо window.load → 100%
   ↓
bodyUnlock()
html.classList.add("preloader-loaded")
fade-out → display: none
sessionStorage.set("preloader_shown", "true")
document.dispatchEvent("preloader:hidden")
```

---

## Спільні особливості

**Без flash при reload** — `<script is:inline>` всередині компонента одразу показує прелоадер синхронно під час парсингу HTML, до завантаження будь-яких бандлів.

**Подія `preloader:hidden`** — диспатчиться після повного зникнення (після `display: none`). Використовується в `video.js` для старту pageIntro-відео після прелоадера.

```js
document.addEventListener("preloader:hidden", () => {
   // прелоадер повністю зник
});
```

**CSS клас `preloader-loaded`** — додається на `<html>` коли прелоадер починає зникати:

```scss
.hero__title {
   opacity: 0;
   transition: opacity 0.6s ease;
}
.preloader-loaded .hero__title {
   opacity: 1;
}
```
