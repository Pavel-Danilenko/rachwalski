# Counter — анімація підрахунку чисел

Анімує число від початкового до цільового значення при потраплянні в viewport (через `data-watch`).

```
src/components/ui/Counter.astro
src/scripts/init/counter.js
```

---

## Встановлення

Нічого встановлювати не потрібно. Підключення вже зроблено в `app.js`:
```js
if (document.querySelector("[data-counter-target]"))
   tasks.push(import("@scripts/init/counter"));
```

---

## Використання

```astro
---
import Counter from "@components/ui/Counter.astro";
---

<Counter target={1000} suffix="+" />
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `target` | `number` | — | **Обов'язковий.** Кінцеве число |
| `start` | `number` | `0` | Початкове значення |
| `duration` | `number` | `2000` | Тривалість анімації (мс) |
| `once` | `boolean` | `true` | `true` — запуск один раз, `false` — щоразу при скролі |
| `locale` | `string` | — | Локаль форматування (`"en-US"`, `"uk-UA"`, `"de-DE"`) |
| `decimals` | `number` | — | Кількість знаків після коми |
| `thousands` | `string` | — | Розділювач тисяч (`","`, `"."`, `" "`, `""`) |
| `decimal` | `string` | — | Розділювач дробів (`"."` або `","`) |
| `short` | `boolean` | `false` | Скорочений формат: `1500` → `1.5K` |
| `prefix` | `string` | `""` | Текст перед числом (`"$"`, `"₴"`, `"від "`) |
| `suffix` | `string` | `""` | Текст після числа (`"+"`, `"%"`, `" грн"`) |
| `easing` | `string` | `"ease-out"` | Тип анімації (див. нижче) |
| `watchMargin` | `string` | — | Відступ для тригера (`"0px"`, `"-100px"`) |
| `watchThreshold` | `number` | — | Видимість елемента для тригера (`0.0`–`1.0`) |
| `watchDelay` | `number` | — | Затримка перед стартом (мс) |
| `watchClass` | `string` | — | Кастомний клас замість `_watcher-view` |
| `class` | `string` | `""` | Додаткові CSS класи |

---

## Easing

| Значення | Ефект |
|---|---|
| `"ease-out"` | Швидкий старт, плавна зупинка (дефолт) |
| `"ease-in"` | Повільний старт, прискорення |
| `"ease-in-out"` | Повільний старт і кінець |
| `"linear"` | Рівномірна швидкість |

---

## Приклади

### Базовий
```astro
<Counter target={1000} />
```

### З суфіксом і префіксом
```astro
<Counter target={250} suffix="+" />
<Counter target={5000} prefix="₴" suffix=" грн" />
<Counter target={99} suffix="%" />
```

### Форматування через locale
```astro
<!-- 1 000 (пробіл як розділювач тисяч) -->
<Counter target={1000000} locale="uk-UA" />

<!-- 1,000,000 -->
<Counter target={1000000} locale="en-US" />

<!-- 1.000,00 -->
<Counter target={1000} locale="de-DE" decimals={2} />
```

### Ручне форматування
```astro
<!-- 1 000 -->
<Counter target={1000} thousands=" " />

<!-- 1.000,50 -->
<Counter target={1000.5} thousands="." decimal="," decimals={2} />
```

### Скорочений формат (K / M / B)
```astro
<!-- → 10.0K -->
<Counter target={10000} short />

<!-- → 1.5M+ -->
<Counter target={1500000} short suffix="+" />

<!-- → 2.3B -->
<Counter target={2300000000} short decimals={1} />
```

### Багаторазова анімація (при кожному скролі)
```astro
<Counter target={100} once={false} />
```

### Із затримкою (для ефекту каскаду)
```astro
<Counter target={150} suffix="+" watchDelay={0} />
<Counter target={300} suffix="+" watchDelay={200} />
<Counter target={500} suffix="+" watchDelay={400} />
```

### Від'ємний старт / зворотній відлік
```astro
<Counter target={0} start={100} suffix="%" duration={3000} />
```

### Десяткові числа
```astro
<Counter target={4.9} decimals={1} suffix=" ★" />
<Counter target={99.9} decimals={1} suffix="%" />
```

---

## JavaScript події

```js
document.querySelector(".my-counter").addEventListener("counterComplete", (e) => {
   console.log("Готово:", e.detail.finalValue);
});

document.querySelector(".my-counter").addEventListener("counterReset", (e) => {
   console.log("Скинуто до:", e.detail.startValue);
});
```

---

## Ручний запуск через JS

```js
// Запустити конкретний лічильник вручну
const el = document.querySelector("[data-counter-target]");
window.counter.start(el);
```

---

## Без компонента (чистий HTML)

Якщо використовуєш без Astro-компонента — додай атрибути вручну і підключи скрипт:

```html
<div
   data-watch-once
   data-counter-target="1000"
   data-counter-suffix="+"
   data-counter-duration="2000"
   data-counter-easing="ease-out"
>0</div>
```

> Скрипт підключається автоматично через `app.js` якщо є `[data-counter-target]` на сторінці.
