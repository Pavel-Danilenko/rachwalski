# LocationsMap

Блок з картою Google Maps та статичною панеллю локацій клініки. Використовує базовий компонент `GoogleMap`.

```
src/
├── components/section/LocationsMap.astro            — компонент (панель + карта)
├── components/ui/GoogleMap.astro                    — базовий компонент карти
└── styles/components/section/_locations-map.scss    — стилі
```

> Документація по базовому компоненту карти → `_instruction/ui/README-google-map.md`

---

## Як підключити

```astro
---
import LocationsMap from "@components/section/LocationsMap.astro";
---

<section class="locations">
   <LocationsMap />
</section>
```

---

## Структура компонента

```
.locations-map
├── .locations-map__container     ← заголовок (2 колонки: title + description)
└── .locations-map__body          ← повна ширина
    ├── .locations-map__panel     ← ліва панель з локаціями
    │   ├── .location-card        ← Cabinet Paris 08
    │   └── .location-card        ← Cabinet Paris 16
    └── .locations-map__map-wrap  ← права частина: GoogleMap
```

---

## Адаптив

| Брейкпоінт | Поведінка |
|---|---|
| > `lg` (991px) | Дві колонки: панель 2fr / карта 3fr |
| ≤ `lg` | Одна колонка: спочатку панель, потім карта |
| ≤ `md` | Заголовок в одну колонку |

---

## Вирівнювання панелі

Ліва панель вирівнюється по лівому краю контейнера через:

```scss
padding-left: max(
   #{toRem(15)},
   calc((100vw - var(--container-max-width)) / 2 + #{toRem(15)})
);
```

Це забезпечує однакове положення тексту з контентом контейнера при будь-якій ширині вікна.

---

## Координати локацій

Маркери захардкоджені в `LocationsMap.astro`:

| Локація | lat | lng |
|---|---|---|
| Cabinet Paris 08 | `48.8752` | `2.3122` |
| Clinique Alphand (Paris 16) | `48.8743` | `2.2803` |

Щоб змінити — редагуй масив `markers` та `center` у frontmatter компонента.

---

## Транспорт — кольори метро

Кольори ліній паризького метро передаються через CSS custom property `--metro-color`:

```html
<span class="location-card__metro" style="--metro-color: #FFCA00; --metro-text: #000">1</span>
```

| Лінія | Колір | Текст |
|---|---|---|
| 1 | `#FFCA00` | `#000` |
| 2 | `#003CA6` | `#fff` |
| 6 | `#6ECA97` | `#000` |

---

## Додати нову локацію

**Крок 1.** Додай маркер у масив `markers` у `LocationsMap.astro`:

```js
const markers = [
   { lat: 48.8752, lng: 2.3122, title: "Cabinet Paris 08" },
   { lat: 48.8743, lng: 2.2803, title: "Clinique Alphand" },
   { lat: 48.860, lng: 2.350, title: "Нова локація" },   // ← додай
];
```

**Крок 2.** Додай картку `.location-card` у `.locations-map__panel`.

**Крок 3.** За потреби скоригуй `center` щоб карта охоплювала всі маркери.
