# Countdown

Гнучкий таймер зворотного відліку для Astro.

```
src/components/countdown/
├── Countdown.astro
├── countdown.js
└── countdown.scss
```

---

## Підключення

```astro
---
import Countdown from "@/components/countdown/Countdown.astro";
import "@/styles/_countdown.scss";
---
```

> Або імпортуй scss прямо в `Countdown.astro` через `<style lang="scss" src="./countdown.scss" />` — тоді зовні не треба.

---

## Пропси

| Prop               | Тип                                         | Default   | Опис                                                       |
| ------------------ | ------------------------------------------- | --------- | ---------------------------------------------------------- |
| `deadline`         | `string \| Date`                            | —         | Дедлайн. **Обов'язковий.** Підтримувані формати ↓          |
| `variant`          | `'tiles' \| 'inline' \| 'banner'`           | `'tiles'` | Візуальний варіант                                         |
| `labels`           | `Partial<Labels>`                           | —         | Лейбли одиниць. Кожен: `{ short, long }`                   |
| `labelFormat`      | `'short' \| 'long' \| 'none'`               | `'short'` | Яку форму лейблу показувати                                |
| `separator`        | `string`                                    | `':'`     | Символ між блоками. `''` = без сепаратора                  |
| `units`            | `CountdownUnit[]`                           | всі 4     | Які одиниці і в якому порядку                              |
| `animation`        | `'none' \| 'fade' \| 'slide' \| 'flip'`     | `'none'`  | Анімація зміни цифр для всіх блоків                        |
| `animationPerUnit` | `Partial<Record<CountdownUnit, Animation>>` | —         | Анімація окремо для кожної одиниці. Перекриває `animation` |
| `onExpire`         | `string`                                    | —         | JS-рядок що виконається коли таймер = 0                    |
| `class`            | `string`                                    | —         | Зовнішній CSS клас                                         |

### Slot `separator`

Якщо передати `<... slot="separator">`, він замінює рядковий `separator` проп:

```astro
<Countdown deadline={myDate}>
   <span slot="separator">·</span>
</Countdown>
```

---

## Формати дати

```astro
deadline="2025-12-31" <!-- кінець дня за локальним часом сервера -->
deadline="2025-12-31 23:59" <!-- теж локальний час, зручний формат -->
deadline="2025-12-31T23:59:00" <!-- ISO без таймзони — локальний час -->
deadline="2025-12-31T23:59:00Z" <!-- UTC — однаково для всіх країн -->
deadline="2025-12-31T23:59:00+02:00" <!-- конкретна таймзона, напр. Київ -->
deadline="2025-12-31T23:59:00-05:00" <!-- EST (Нью-Йорк) -->
```

### Таймзони — що вибрати?

**Акція закінчується одночасно для всіх** (найчастіший кейс):

```astro
deadline="2025-12-31T23:59:00Z"
```

Покупець в Азії і в США бачать однаковий залишок. Якщо до кінця 3 год — у всіх 3 год.

**Акція закінчується опівночі за конкретним часовим поясом:**

```astro
deadline="2025-12-31T23:59:00-05:00" <!-- кінець дня за Нью-Йорком -->
deadline="2025-12-31T23:59:00+02:00" <!-- кінець дня за Києвом -->
```

Покупець в Азії побачить що залишилось ще 10+ годин, бо для нього вже інший день — але акція ще йде за вказаним поясом.

> Браузер сам конвертує дату в локальний час користувача — нічого додатково робити не треба.

---

## Приклади

### Базово

```astro
<Countdown deadline="2025-12-31T23:59:00Z" />
```

### З лейблами і анімацією

```astro
<Countdown
   deadline="2025-12-31T23:59:00Z"
   variant="tiles"
   animation="flip"
   labels={{
      days: { short: "Д", long: "Дні" },
      hours: { short: "Год", long: "Години" },
      minutes: { short: "Хв", long: "Хвилини" },
      seconds: { short: "Сек", long: "Секунди" },
   }}
   labelFormat="short"
/>
```

### Різна анімація для різних блоків

```astro
<Countdown
   deadline="2025-12-31T23:59:00Z"
   animation="none"
   animationPerUnit={{ seconds: "slide", minutes: "fade" }}
/>
```

### Тільки хвилини і секунди, без сепаратора

```astro
<Countdown
   deadline={myDate}
   units={["minutes", "seconds"]}
   separator=""
   animation="fade"
/>
```

### Кастомний слот-сепаратор

```astro
<Countdown deadline={myDate}>
   <svg slot="separator" width="4" height="4" viewBox="0 0 4 4">
      <circle cx="2" cy="2" r="2" fill="currentColor"></circle>
   </svg>
</Countdown>
```

### Колбек на expire через CustomEvent (рекомендовано)

```astro
<Countdown id="my-timer" deadline={myDate} />
<script>
   document
      .getElementById("my-timer")
      .addEventListener("countdown:expire", () => {
         console.log("час вийшов!");
      });
</script>
```

### Або через onExpire проп

```astro
<Countdown
   deadline={myDate}
   onExpire="document.querySelector('.sale-banner').classList.add('hidden')"
/>
```

---

## Стилізація через CSS змінні

```scss
.my-timer {
   --cd-number-size: 3rem;
   --cd-label-size: 0.7rem;
   --cd-gap: 1rem;
   --cd-tile-bg: #f5f5f5;
   --cd-tile-radius: 1rem;
   --cd-sep-color: #999;
   --cd-number-color: #111;
   --cd-label-color: #888;
}
```

```astro
<Countdown deadline={myDate} class="my-timer" />
```

---

## Події

| Подія              | Bubbles | Опис                       |
| ------------------ | ------- | -------------------------- |
| `countdown:expire` | так     | Спрацьовує коли таймер = 0 |
