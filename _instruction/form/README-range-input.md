# CustomRangeInput

Слайдер з заповненням треку, відображенням поточного значення і валідацією.

```
src/
├── components/forms/CustomRangeInput.astro      — компонент
├── scripts/init/range-input.js                  — логіка (fill + value display)
└── styles/components/forms/_range-input.scss    — стилі
```

---

## Підключення

```astro
---
import CustomRangeInput from "@components/forms/CustomRangeInput.astro";
---

<div class="form-group">
   <CustomRangeInput name="volume" min={0} max={100} value={50} />
</div>
```

---

## Пропси

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` |
| `min` | `number` | `0` | Мінімальне значення |
| `max` | `number` | `100` | Максимальне значення |
| `step` | `number` | `1` | Крок |
| `value` | `number` | середина | Початкове значення |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути |
| `unit` | `string` | `""` | Одиниця виміру (`%`, `px`, `km`) |
| `showValue` | `boolean` | `true` | Показувати поточне значення |
| `showMinMax` | `boolean` | `false` | Показувати мін/макс по боках |
| `errorRequired` | `string` | — | Текст помилки |

---

## Приклади

**Гучність:**
```astro
<div class="form-group">
   <CustomRangeInput name="volume" min={0} max={100} value={70} unit="%" showMinMax />
</div>
```

**Ціновий діапазон:**
```astro
<div class="form-group">
   <CustomRangeInput name="budget" min={100} max={10000} step={100} value={3000} unit=" грн" showMinMax />
</div>
```

**Без відображення значення:**
```astro
<div class="form-group">
   <CustomRangeInput name="opacity" min={0} max={1} step={0.1} value={0.5} showValue={false} />
</div>
```

---

## Як працює

- CSS змінна `--range-fill` встановлюється в Astro (SSR) і оновлюється JS при кожному `input`
- Трек заповнюється через `linear-gradient` з `--range-fill` — без зайвих DOM елементів
- Thumb стилізований однаково для Webkit і Firefox
- Інтегрується з `FormValidator` через стандартний `<input type="range">`

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `frange` | `CustomRangeInput` з основними пропсами |
