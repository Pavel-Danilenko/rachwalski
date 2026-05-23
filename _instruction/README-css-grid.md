# CSS Grid — повний довідник

> Всі властивості, всі значення, всі варіації. Від базового до складного.

---

## Зміст

1. [Базова концепція](#basic)
2. [Властивості батька (контейнера)](#parent)
   - [display](#display)
   - [grid-template-columns / grid-template-rows](#columns-rows)
   - [grid-template-areas](#areas)
   - [grid-template](#template)
   - [gap / row-gap / column-gap](#gap)
   - [grid-auto-columns / grid-auto-rows](#auto-size)
   - [grid-auto-flow](#auto-flow)
   - [justify-items](#justify-items)
   - [align-items](#align-items)
   - [place-items](#place-items)
   - [justify-content](#justify-content)
   - [align-content](#align-content)
   - [place-content](#place-content)
3. [Властивості дитини (grid item)](#child)
   - [grid-column / grid-row](#column-row)
   - [grid-area](#area)
   - [justify-self / align-self / place-self](#self)
4. [Функції та одиниці](#units)
   - [fr](#fr)
   - [repeat()](#repeat)
   - [minmax()](#minmax)
   - [fit-content()](#fit-content)
   - [auto-fill vs auto-fit](#auto-fill-fit)
5. [Іменовані лінії](#named-lines)
6. [subgrid](#subgrid)
7. [Практичні шаблони](#patterns)
8. [Швидка шпаргалка](#cheatsheet)

---

<a id="basic"></a>

## 1. Базова концепція

Grid — це двовимірна система розкладки (рядки + колонки одночасно).

```
Батько (display: grid)
┌─────────────┬─────────────┬─────────────┐
│   col 1     │   col 2     │   col 3     │  ← рядок 1
├─────────────┼─────────────┼─────────────┤
│   col 1     │   col 2     │   col 3     │  ← рядок 2
└─────────────┴─────────────┴─────────────┘
  ↑ лінія 1   ↑ лінія 2    ↑ лінія 3    ↑ лінія 4
```

Лінії — це невидимі межі між клітинками. Нумеруються від 1. З кінця — від -1.

```
колонки: | 1 | 2 | 3 |
лінії:  1   2   3   4
        або з кінця: -4 -3 -2 -1
```

---

<a id="parent"></a>

## 2. Властивості батька (контейнера)

<a id="display"></a>

### `display`

```css
display: grid; /* блоковий grid */
display: inline-grid; /* рядковий grid (рідко) */
```

---

<a id="columns-rows"></a>

### `grid-template-columns` / `grid-template-rows`

Визначають кількість і розмір колонок/рядків.

```css
/* Фіксовані значення */
grid-template-columns: 200px 400px 200px;
grid-template-rows: 100px 200px;

/* Відсотки (від батька) */
grid-template-columns: 25% 50% 25%;

/* Дробові частини (fr) */
grid-template-columns: 1fr 2fr 1fr;

/* Авто (за вмістом) */
grid-template-columns: auto auto auto;

/* Мінімакс */
grid-template-columns: minmax(200px, 1fr) minmax(100px, 2fr);

/* repeat() */
grid-template-columns: repeat(3, 1fr);
grid-template-columns: repeat(4, 200px);
grid-template-columns: repeat(
   3,
   1fr 2fr
); /* 6 колонок: 1fr 2fr 1fr 2fr 1fr 2fr */

/* Мікс */
grid-template-columns: 280px 1fr;
grid-template-columns: 200px 1fr auto;
grid-template-columns: repeat(3, 1fr) 200px;

/* Іменовані лінії */
grid-template-columns: [start] 1fr [middle] 2fr [end];

/* none (скидання) */
grid-template-columns: none;
```

```css
/* Рядки — ті ж самі варіанти */
grid-template-rows: 80px 1fr auto;
grid-template-rows: repeat(3, minmax(100px, auto));
grid-template-rows: none; /* рядки визначаються автоматично */
```

---

<a id="areas"></a>

### `grid-template-areas`

Візуальна схема розкладки через імена.

```css
.container {
   display: grid;
   grid-template-columns: 200px 1fr;
   grid-template-rows: 80px 1fr 60px;
   grid-template-areas:
      "header  header"
      "sidebar content"
      "footer  footer";
}

/* Дітям прописуємо імена */
.header {
   grid-area: header;
}
.sidebar {
   grid-area: sidebar;
}
.content {
   grid-area: content;
}
.footer {
   grid-area: footer;
}
```

```css
/* Пропуск клітинки — крапка */
grid-template-areas:
   "logo   nav    nav"
   ".      main   aside"
   "footer footer footer";
```

> Важливо: кожне ім'я має формувати прямокутник. Г-подібні форми не можна.

---

<a id="template"></a>

### `grid-template` (shorthand)

Скорочення для `grid-template-rows`, `grid-template-columns`, `grid-template-areas` разом.

```css
/* grid-template: rows / columns */
grid-template: 80px 1fr 60px / 200px 1fr;

/* З areas */
grid-template:
   "header header" 80px
   "sidebar content" 1fr
   "footer footer" 60px
   / 200px 1fr;

/* none */
grid-template: none;
```

---

<a id="gap"></a>

### `gap` / `row-gap` / `column-gap`

Відступи між клітинками (не по краях контейнера).

```css
/* Обидва одразу */
gap: 24px;
gap: 16px 32px; /* row-gap column-gap */

/* Окремо */
row-gap: 16px;
column-gap: 32px;

/* Будь-які одиниці */
gap: 1rem;
gap: 2%;
gap: clamp(12px, 2vw, 32px);
```

---

<a id="auto-size"></a>

### `grid-auto-columns` / `grid-auto-rows`

Розмір клітинок, які виникають автоматично (не описані в `grid-template`).

```css
/* Коли дітей більше ніж визначено в template */
grid-template-columns: repeat(3, 1fr); /* тільки 3 колонки */
grid-auto-rows: 200px; /* всі авто-рядки по 200px */

/* Варіанти значень */
grid-auto-rows: auto;
grid-auto-rows: 100px;
grid-auto-rows: minmax(100px, auto);
grid-auto-rows: 1fr;
grid-auto-columns: minmax(200px, 1fr);
```

---

<a id="auto-flow"></a>

### `grid-auto-flow`

Як автоматично розміщувати елементи.

```css
grid-auto-flow: row; /* (default) — заповнює рядками, ліво→право */
grid-auto-flow: column; /* заповнює колонками, зверху→вниз */
grid-auto-flow: row dense; /* рядки + заповнює дірки */
grid-auto-flow: column dense; /* колонки + заповнює дірки */
```

```
row (default):         column:            row dense:
[ 1 ][ 2 ][ 3 ]      [ 1 ][ 3 ][ 5 ]   [ 1 ][ 2 ][ 3 ]
[ 4 ][ 5 ][ 6 ]      [ 2 ][ 4 ][ 6 ]   [ 4 ][   ][ 5 ]
```

`dense` — заповнює пустоти якщо попередній елемент займає кілька клітинок.

---

<a id="justify-items"></a>

### `justify-items`

Вирівнювання дітей всередині своєї клітинки по **горизонтальній осі**.

```css
justify-items: stretch; /* (default) — розтягти на всю ширину клітинки */
justify-items: start; /* до лівого краю */
justify-items: end; /* до правого краю */
justify-items: center; /* по центру */
```

```
stretch:          start:       end:         center:
[████████████]   [██ ]        [  ██]       [ ██ ]
[████████████]   [██ ]        [  ██]       [ ██ ]
```

---

<a id="align-items"></a>

### `align-items`

Вирівнювання дітей всередині своєї клітинки по **вертикальній осі**.

```css
align-items: stretch; /* (default) */
align-items: start; /* до верхнього краю */
align-items: end; /* до нижнього краю */
align-items: center; /* по центру */
align-items: baseline; /* по базовій лінії тексту */
```

---

<a id="place-items"></a>

### `place-items`

Shorthand для `align-items` + `justify-items`.

```css
place-items: center; /* align=center, justify=center */
place-items: start end; /* align=start, justify=end */
place-items: stretch center; /* align=stretch, justify=center */
```

---

<a id="justify-content"></a>

### `justify-content`

Вирівнювання **всієї сітки** всередині контейнера по горизонталі.
Спрацьовує якщо сітка менша за контейнер (колонки не `fr`).

```css
justify-content: start; /* (default) — ліво */
justify-content: end; /* право */
justify-content: center; /* по центру */
justify-content: stretch; /* розтягнути */
justify-content: space-between; /* рівні відступи між, без країв */
justify-content: space-around; /* рівні відступи навколо кожного */
justify-content: space-evenly; /* рівні відступи між і по краях */
```

```
space-between:  [col]    [col]    [col]
space-around:    [col]  [col]  [col]
space-evenly:   [col]   [col]   [col]
```

---

<a id="align-content"></a>

### `align-content`

Вирівнювання **всієї сітки** по вертикалі.
Спрацьовує якщо рядки не заповнюють весь контейнер.

```css
align-content: start;
align-content: end;
align-content: center;
align-content: stretch;
align-content: space-between;
align-content: space-around;
align-content: space-evenly;
```

---

<a id="place-content"></a>

### `place-content`

Shorthand для `align-content` + `justify-content`.

```css
place-content: center;
place-content: space-between center;
place-content: start space-evenly;
```

---

<a id="child"></a>

## 3. Властивості дитини (grid item)

<a id="column-row"></a>

### `grid-column` / `grid-row`

Вказуємо яку клітинку/клітинки займає елемент.

---

#### Як читати `grid-column: A / B`

Це означає **від лінії A до лінії B**.
Лінії — це межі між колонками, рахуються від 1.

```
Сітка з 4 колонок:

 | col1 | col2 | col3 | col4 |
1      2      3      4      5
```

Від'ємні числа рахуються з кінця:

```
 | col1 | col2 | col3 | col4 |
-5     -4     -3     -2     -1
```

Тобто `-1` — це завжди остання лінія, незалежно від кількості колонок.

---

#### `grid-column: 1` — стоїть у першій колонці

```css
grid-column: 1;
/* Те саме що: grid-column: 1 / 2 */
/* Елемент займає тільки 1-у колонку */
```

```
[ ■ ][   ][   ][   ]
  1    2    3    4
```

---

#### `grid-column: 1 / -1` — розтягується на всю ширину

```css
grid-column: 1 / -1;
/* Від першої лінії до останньої — займає ВСІ колонки */
/* Працює для будь-якої кількості колонок! */
```

```
[ ■■■■■■■■■■■■■■■■ ]
  1    2    3    4
```

Саме тому `1 / -1` краще ніж `1 / 5` — не треба знати скільки колонок.

---

#### Практичний приклад — твій кейс (4 колонки)

```
grid-template-columns: repeat(4, 1fr)

[ experience ][ publications ][ location--main (span 2) ]
[ satisfaction (1 / -1 або span 4)                      ]
```

```css
/* stat займає 1 колонку — просто не чіпаємо, auto */
.bio-hero__stat--experience {
   grid-column: 1;
}
.bio-hero__stat--publications {
   grid-column: 2;
}

/* stat на весь рядок */
.bio-hero__stat--satisfaction {
   grid-column: 2 / 3;
}

/* location займає 2 останні колонки */
.bio-hero__location--main {
   grid-column: 3 / -1;
}
.bio-hero__location--alphand {
   grid-column: 3 / -1;
}
```

---

#### Всі варіанти синтаксису

```css
/* Повний синтаксис: від лінії / до лінії */
grid-column: 1 / 3; /* від лінії 1 до лінії 3 (займає 2 колонки) */
grid-column: 2 / 4;
grid-column: 1 / -1; /* від першої до останньої (вся ширина) */
grid-column: -3 / -1; /* дві останні колонки */

/* span — кількість клітинок від поточної позиції */
grid-column: span 2; /* займає 2 колонки */
grid-column: span 3;
grid-column: 2 / span 2; /* починається з лінії 2, займає 2 колонки */

/* Скорочені форми */
grid-column-start: 1;
grid-column-end: 3;

/* Рядки — аналогічно */
grid-row: 1 / 3;
grid-row: span 2;
grid-row: 2 / -1;

/* Окремо */
grid-row-start: 1;
grid-row-end: 3;
```

```
Приклад:
grid-template-columns: repeat(4, 1fr);

.a { grid-column: 1 / 3; }  → займає col 1 і 2
.b { grid-column: span 3; } → займає 3 колонки з поточної
.c { grid-column: 1 / -1; } → вся ширина (всі 4 колонки)
```

---

<a id="area"></a>

### `grid-area`

Або ім'я для `grid-template-areas`, або shorthand для row-start / col-start / row-end / col-end.

```css
/* Ім'я (для grid-template-areas) */
grid-area: header;
grid-area: sidebar;

/* Shorthand: row-start / col-start / row-end / col-end */
grid-area: 1 / 2 / 3 / 4;
grid-area: 2 / 1 / span 2 / span 3;
```

---

<a id="self"></a>

### `justify-self` / `align-self` / `place-self`

Вирівнювання конкретної дитини всередині своєї клітинки (перевизначає `justify-items` / `align-items`).

```css
justify-self: stretch; /* (default) */
justify-self: start;
justify-self: end;
justify-self: center;

align-self: stretch;
align-self: start;
align-self: end;
align-self: center;
align-self: baseline;

/* Shorthand: align / justify */
place-self: center;
place-self: start end;
place-self: center stretch;
```

---

<a id="units"></a>

## 4. Функції та одиниці

<a id="fr"></a>

### `fr`

Дробова одиниця — ділить **залишковий** вільний простір після вирахування фіксованих розмірів.

```css
grid-template-columns: 300px 1fr;
/* Контейнер 1000px → 300px фіксовано → 700px на 1fr */

grid-template-columns: 300px 1fr 2fr;
/* 700px / 3 частини → 1fr = 233px, 2fr = 466px */

grid-template-columns: 1fr 1fr 1fr;
/* Рівні колонки — аналог repeat(3, 1fr) */
```

> `fr` не може бути менша за мінімальний розмір вмісту, якщо не вказано `minmax`.

---

<a id="repeat"></a>

### `repeat()`

```css
/* repeat(кількість, розмір) */
repeat(3, 1fr)             /* 3 рівні колонки */
repeat(4, 200px)           /* 4 по 200px */
repeat(12, 1fr)            /* 12-колонна сітка */

/* repeat з кількома значеннями */
repeat(2, 1fr 2fr)         /* 4 колонки: 1fr 2fr 1fr 2fr */
repeat(3, 100px 1fr auto)  /* 9 колонок */

/* auto-fill і auto-fit — адаптивна кількість колонок */
repeat(auto-fill, minmax(200px, 1fr))
repeat(auto-fit,  minmax(200px, 1fr))
```

---

<a id="minmax"></a>

### `minmax()`

Задає мінімальний і максимальний розмір колонки/рядка.

```css
minmax(200px, 1fr)     /* мін 200px, макс — доступна ширина */
minmax(100px, auto)    /* мін 100px, макс — за вмістом */
minmax(0, 1fr)         /* мін 0 (fr не обмежена мінімумом вмісту) */
minmax(200px, 400px)   /* від 200 до 400px */
minmax(auto, 1fr)      /* мін — за вмістом, макс — 1fr */

/* Тільки в grid-template-columns / grid-template-rows */
grid-template-columns: minmax(200px, 1fr) minmax(100px, 2fr);
grid-template-rows: minmax(80px, auto);

/* В поєднанні з repeat */
grid-template-columns: repeat(3, minmax(0, 1fr));
```

---

<a id="fit-content"></a>

### `fit-content()`

Колонка розтягується до вмісту, але не більше вказаного максимуму.

```css
fit-content(200px)  /* max = 200px, але якщо вміст менший — по вмісту */
fit-content(50%)

grid-template-columns: fit-content(300px) 1fr;
/* Перша колонка: мін — вміст, макс — 300px. Друга — решта. */
```

---

<a id="auto-fill-fit"></a>

### `auto-fill` vs `auto-fit`

Обидва автоматично визначають **кількість колонок** щоб вмістити елементи.

```css
/* auto-fill — заповнює порожні місця (колонки існують навіть якщо пусті) */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* auto-fit — стискає порожні колонки до 0 (елементи розтягуються) */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

```
Якщо 3 елементи в контейнері 800px з minmax(200px, 1fr):

auto-fill: [item][item][item][    ][    ]  ← пусті колонки є, елементи не розтягуються
auto-fit:  [   item   ][   item   ][ item ]  ← пусті зникають, елементи заповнюють
```

> **Правило:** якщо хочеш щоб елементи розтягувались — `auto-fit`. Фіксована ширина — `auto-fill`.

---

<a id="named-lines"></a>

## 5. Іменовані лінії

Лініям можна давати імена і використовувати замість цифр.

```css
.container {
   grid-template-columns: [sidebar-start] 200px [sidebar-end main-start] 1fr [main-end];
   /* Одна лінія може мати кілька імен */

   grid-template-rows: [header-start] 80px [header-end content-start] 1fr [content-end];
}

/* Розміщення за іменами */
.sidebar {
   grid-column: sidebar-start / sidebar-end;
}
.main {
   grid-column: main-start / main-end;
}
.header {
   grid-row: header-start / header-end;
}
```

```css
/* З repeat — автоматично нумерує */
grid-template-columns: repeat(3, [col-start] 1fr [col-end]);
/* Лінії: col-start 1, col-end 1, col-start 2, col-end 2 ... */

.item {
   grid-column: col-start 1 / col-end 3;
}
```

---

<a id="subgrid"></a>

## 6. `subgrid`

Дозволяє дитині наслідувати сітку батька (замість створення власної).

```css
.parent {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   gap: 16px;
}

.child {
   grid-column: 1 / 3; /* займає 2 колонки батька */
   display: grid;
   grid-template-columns: subgrid; /* використовує ті ж 2 колонки батька */
}

.grandchild {
   grid-column: 1 / 2; /* перша колонка батьківської сітки */
}
```

> Підтримка: Chrome 117+, Firefox 71+, Safari 16+. IE не підтримує.

---

<a id="patterns"></a>

## 7. Практичні шаблони

### Класичний page layout

```css
.page {
   display: grid;
   grid-template-columns: 280px 1fr;
   grid-template-rows: 80px 1fr 60px;
   grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
   min-height: 100vh;
}

.header {
   grid-area: header;
}
.sidebar {
   grid-area: sidebar;
}
.main {
   grid-area: main;
}
.footer {
   grid-area: footer;
}
```

---

### Адаптивні картки

```css
.cards {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
   gap: 24px;
}
/* Автоматично 1, 2, 3, 4 колонки залежно від ширини */
```

---

### 12-колонна сітка

```css
.grid {
   display: grid;
   grid-template-columns: repeat(12, 1fr);
   gap: 24px;
}

.col-4 {
   grid-column: span 4;
}
.col-6 {
   grid-column: span 6;
}
.col-12 {
   grid-column: span 12;
}
```

---

### Holy Grail layout

```css
.holy-grail {
   display: grid;
   grid-template: auto 1fr auto / 200px 1fr 200px;
   grid-template-areas:
      "header  header  header"
      "left    main    right"
      "footer  footer  footer";
   min-height: 100vh;
}
```

---

### Центрування будь-чого

```css
.center {
   display: grid;
   place-items: center;
   min-height: 100vh;
}
```

---

### Фото-галерея з різними розмірами

```css
.gallery {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   grid-auto-rows: 200px;
   gap: 16px;
}

.gallery__item--wide {
   grid-column: span 2;
}
.gallery__item--tall {
   grid-row: span 2;
}
.gallery__item--big {
   grid-column: span 2;
   grid-row: span 2;
}
```

---

### Header: лого + nav + кнопка

```css
.header {
   display: grid;
   grid-template-columns: auto 1fr auto;
   align-items: center;
   gap: 24px;
}
/* logo | nav (займає всю середину) | кнопка */
```

---

### Sidebar + content

```css
.layout {
   display: grid;
   grid-template-columns: 280px 1fr;
   gap: 40px;
}

@media (max-width: 768px) {
   .layout {
      grid-template-columns: 1fr;
   }
}
```

---

### Stat counters (2 колонки, 3 елементи)

```css
.stats {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 16px;
}

/* 3-й на весь рядок */
.stat:nth-child(3) {
   grid-column: 1 / -1;
}

/* або 3-й залишається зліва (нічого не робити) */
```

---

<a id="cheatsheet"></a>

## 8. Швидка шпаргалка

```
БАТЬКО:
  display: grid | inline-grid
  grid-template-columns: <розміри>
  grid-template-rows: <розміри>
  grid-template-areas: "..."
  grid-template: <rows> / <cols>
  gap: <row> <col>
  row-gap / column-gap: ...
  grid-auto-flow: row | column | dense | row dense | column dense
  grid-auto-rows / grid-auto-columns: ...
  justify-items:   start | end | center | stretch
  align-items:     start | end | center | stretch | baseline
  place-items:     <align> <justify>
  justify-content: start | end | center | stretch | space-between | space-around | space-evenly
  align-content:   start | end | center | stretch | space-between | space-around | space-evenly
  place-content:   <align> <justify>

ДИТИНА:
  grid-column: <start> / <end> | span <n>
  grid-row:    <start> / <end> | span <n>
  grid-column-start / grid-column-end: ...
  grid-row-start    / grid-row-end:    ...
  grid-area: <name> | <row-start> / <col-start> / <row-end> / <col-end>
  justify-self: start | end | center | stretch
  align-self:   start | end | center | stretch | baseline
  place-self:   <align> <justify>

ОДИНИЦІ ТА ФУНКЦІЇ:
  px | % | fr | auto | em | rem | vw | vh
  minmax(min, max)
  fit-content(max)
  repeat(n | auto-fill | auto-fit, size)
  subgrid
```
