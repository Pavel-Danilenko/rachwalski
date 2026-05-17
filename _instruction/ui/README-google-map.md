# GoogleMap

Базовий компонент карти Google Maps з кастомними маркерами та темним стилем під дизайн проекту. Підтримує Barba.js навігацію.

```
src/
├── components/ui/GoogleMap.astro          — HTML-компонент (data-атрибути)
├── scripts/maps/google-map.js             — ініціалізація API, маркери, Barba.js
└── styles/components/ui/_google-map.scss — базові стилі контейнера
```

---

## Як підключити

**Крок 1.** Додай API ключ у `.env`:

```env
PUBLIC_GOOGLE_MAPS_KEY=твій_ключ
```

**Крок 2.** Імпортуй і використовуй:

```astro
---
import GoogleMap from "@components/ui/GoogleMap.astro";
---

<GoogleMap
   markers={[{ lat: 48.875, lng: 2.312, title: "Назва локації" }]}
   center={{ lat: 48.875, lng: 2.296 }}
   zoom={13}
/>
```

> `app.js` автоматично підвантажить `google-map.js` коли на сторінці є `[data-google-map]`.

---

## Props

| Prop | Тип | Default | Опис |
|---|---|---|---|
| `markers` | `Marker[]` | `[]` | Масив маркерів на карті |
| `center` | `{ lat, lng }` | перший маркер або Париж | Центр карти при завантаженні |
| `zoom` | `number` | `13` | Початковий зум (1=світ, 20=будинок) |
| `id` | `string` | авто-генерований | Унікальний `id` для div контейнера |
| `class` | `string` | — | Додатковий CSS клас |

### Тип `Marker`

```ts
interface Marker {
   lat: number;    // широта
   lng: number;    // довгота
   title?: string; // текст при hover на маркер
}
```

---

## Як знайти координати адреси

**Варіант 1 — Google Maps:**
1. Відкрий [maps.google.com](https://maps.google.com)
2. Знайди потрібну адресу
3. Клікни правою кнопкою → перший рядок показує координати `48.8752, 2.3122`
4. Клік на координати — вони скопіюються

**Варіант 2 — latlong.net:**
1. Зайди на [latlong.net](https://www.latlong.net)
2. Введи адресу → отримаєш `lat` і `lng`

**Приклад:**
```js
const markers = [
   { lat: 48.8752, lng: 2.3122, title: "Cabinet Paris 08" },
   { lat: 48.8743, lng: 2.2803, title: "Clinique Alphand" },
];
// Центр між двома маркерами — приблизна середня точка
const center = { lat: 48.875, lng: 2.296 };
```

---

## Налаштування маркера

Google Maps завантажує іконку як `data:image/svg+xml` — самодостатній файл.  
Спрайт (`<use href="#icon">`) тут **не працює**. Іконку вставляй прямо в код маркера.

### Структура маркера (`google-map.js`)

```js
const MARKER_SVG = `<svg width="44" height="56" viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Зовнішня форма піна -->
  <path d="M22 0C9.85 0 0 9.85 0 22C0 30.84 4.76 38.52 11.9 42.66L22 56L32.1 42.66C39.24 38.52 44 30.84 44 22C44 9.85 34.15 0 22 0Z" fill="#ffffff"/>

  <!-- Темне коло всередині -->
  <circle cx="22" cy="22" r="13" fill="#0b111a"/>

  <!-- Іконка: встав <path> з SVG файлу сюди з fill="white" -->
  <!-- icon -->
</svg>`;
```

### Як додати іконку

1. Відкрий потрібний SVG з `src/icons/` у текстовому редакторі
2. Знайди атрибут `viewBox` — наприклад `viewBox="0 0 32 30"`
3. Скопіюй всі `<path>` всередині (без `<svg>` обгортки)
4. Встав в маркер через `<g>` з `transform` і `fill="white"`:

```js
<!-- icon -->
<g transform="translate(9, 9.8) scale(0.8125)" fill="white">
  <path d="...скопійовані path з SVG файлу..."/>
</g>
```

> **Підрахунок `transform`:**  
> Коло має `r=13` → доступна область `26×26px`, починається з `x=9, y=9`.  
> Якщо оригінальна іконка `32×30` → `scale = 26/32 ≈ 0.8125`.  
> `translate(9, 9)` = початок кола. Вертикально: `9 + (26 - 30*0.8125)/2 ≈ 9.8`.

### Змінити кольори маркера

| Елемент | Де міняти | За замовчуванням |
|---|---|---|
| Форма піна | `fill` на першому `<path>` | `#ffffff` (білий) |
| Фон кола | `fill` на `<circle>` | `#0b111a` (темний) |
| Іконка | `fill` на `<g>` | `white` |

---

## Стиль карти

Темна кольорова схема з палітри проекту. Редагуй масив `MAP_STYLES` у `google-map.js`.

| Елемент | Колір |
|---|---|
| Фон (суша) | `#0b111a` |
| Дороги | `#c8cdd8` |
| Магістралі | `#ffffff` |
| Текст підписів | `#d0d4dc` |
| Вода | `#05080e` |
| POI | приховані |

---

## Декілька карт на сторінці

Кожен `<GoogleMap>` отримує унікальний `id` автоматично.  
API завантажується **один раз** (singleton через `window.__gmapsLoaded`).

```astro
<GoogleMap markers={markers1} center={center1} zoom={14} />
<GoogleMap markers={markers2} center={center2} zoom={12} />
```

---

## Barba.js

При `page:leave` — стан очищається.  
При `page:ready` — карта ініціалізується повторно.  
Google Maps API залишається завантаженим між переходами.

---

## Отримати API ключ

1. [console.cloud.google.com](https://console.cloud.google.com) → новий проект
2. **APIs & Services → Library** → увімкни **Maps JavaScript API**
3. **Credentials → + Create Credentials → API Key**
4. Обмеж ключ: **HTTP referrers** → додай `http://localhost:4321/*` і домен сайту
5. Збережи ключ у `.env` → перезапусти dev server

Безкоштовний ліміт: $200/місяць ≈ 28 000 завантажень карти.
