# CustomPasswordInput

Поле пароля з інтерактивним SVG-оком що стежить за курсором, індикатором сили пароля, чеклістом вимог і попередженням про Caps Lock.

```
src/
├── components/forms/CustomPasswordInput.astro  — компонент
├── scripts/init/password-input.js              — логіка (без HTML, без тексту)
└── styles/components/forms/_password-input.scss — стилі
```

---

## Підключення

```astro
---
import CustomPasswordInput from "@components/forms/CustomPasswordInput.astro";
---

<div class="form-group">
   <CustomPasswordInput
      name="password"
      required
      errorRequired="Введіть пароль"
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `placeholder` | `string` | `""` | Плейсхолдер |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути поле |
| `autocomplete` | `string` | `"current-password"` | Атрибут autocomplete |
| `showStrength` | `boolean` | `false` | Показати індикатор сили |
| `showRequirements` | `boolean` | `false` | Показати чекліст вимог |
| `minLength` | `number` | `8` | Мінімальна довжина пароля |
| `requireUppercase` | `boolean` | `false` | Вимагати велику літеру |
| `requireLowercase` | `boolean` | `false` | Вимагати малу літеру |
| `requireNumbers` | `boolean` | `false` | Вимагати цифру |
| `requireSpecial` | `boolean` | `false` | Вимагати спецсимвол |
| `toggleLabel` | `string` | `"Toggle password visibility"` | aria-label кнопки toggle |
| `capsLockText` | `string` | `"Caps Lock is on"` | Текст попередження Caps Lock |
| `strengthWeak` | `string` | `"Weak"` | Текст для слабкого пароля |
| `strengthMedium` | `string` | `"Medium"` | Текст для середнього пароля |
| `strengthStrong` | `string` | `"Strong"` | Текст для сильного пароля |
| `requirementTexts` | `object` | — | Тексти для кожної вимоги (дивись нижче) |
| `errorRequired` | `string` | — | Помилка якщо поле порожнє |
| `errorMinLength` | `string` | — | Помилка якщо пароль занадто короткий |
| `errorWeak` | `string` | — | Помилка якщо пароль занадто слабкий |

### requirementTexts

```astro
requirementTexts={{
   length:    "Мінімум 8 символів",
   uppercase: "Велика літера",
   lowercase: "Мала літера",
   numbers:   "Цифра",
   special:   "Спецсимвол (!@#...)",
}}
```

---

## Приклади

**Базовий (тільки toggle):**
```astro
<div class="form-group">
   <CustomPasswordInput
      name="password"
      placeholder="Пароль"
      required
      toggleLabel="Показати/сховати пароль"
      errorRequired="Введіть пароль"
      errorMinLength="Мінімум 8 символів"
   />
</div>
```

**З індикатором сили:**
```astro
<div class="form-group">
   <CustomPasswordInput
      name="password"
      required
      showStrength
      strengthWeak="Слабкий"
      strengthMedium="Середній"
      strengthStrong="Сильний"
      errorRequired="Введіть пароль"
   />
</div>
```

**Повний варіант — з вимогами:**
```astro
<div class="form-group">
   <CustomPasswordInput
      name="password"
      placeholder="Придумайте пароль"
      required
      showStrength
      showRequirements
      minLength={8}
      requireUppercase
      requireNumbers
      requireSpecial
      toggleLabel="Показати/сховати пароль"
      capsLockText="Caps Lock увімкнено"
      strengthWeak="Слабкий"
      strengthMedium="Середній"
      strengthStrong="Сильний"
      requirementTexts={{
         length:    "Мінімум 8 символів",
         uppercase: "Велика літера (A-Z)",
         numbers:   "Цифра (0-9)",
         special:   "Спецсимвол (!@#$...)",
      }}
      errorRequired="Введіть пароль"
      errorMinLength="Пароль занадто короткий"
      errorWeak="Пароль занадто слабкий"
   />
</div>
```

---

## Як працює

### Oko (toggle кнопка)

Іконка ока — це inline SVG з кількома шарами:

| Елемент | Поведінка |
|---------|-----------|
| `eye-shape` | Форма ока — плавно прижмурюється через CSS `d` property animation коли пароль видно |
| `eye-gaze` | Група iris + зіниця + catchlight — стежить за курсором з lerp-інерцією |
| `eye-slash` | Діагональна лінія — намальовується через `stroke-dashoffset` коли пароль видно |

**Cursor tracking з lerp:**
Зіниця не скаче миттєво до позиції курсора — вона "тягнеться" через `requestAnimationFrame` loop з коефіцієнтом `0.07` (7% відстані за кадр при 60fps). Це дає природну інерцію як у справжнього ока. rAF loop зупиняється автоматично коли рух < 0.005px.

```
Lerp factor 0.04 → повільніше, більше інерції
Lerp factor 0.07 → default (природно)
Lerp factor 0.12 → швидше, менше інерції
```

Змінюється в [password-input.js](../../src/scripts/init/password-input.js) у рядку `lerp(a, b, 0.07)`.

**Закриття ока:**
- `eye-shape` морфить через CSS `d` → верхній контур опускається з `y≈3` до `y≈8.5`, нижній підіймається з `y≈21` до `y≈15.5`
- `eye-gaze` зникає (`opacity: 0`) поки oko прижмурюється
- `eye-slash` малюється з затримкою 100ms після початку закриття

---

### Інші функції

- **Caps Lock** — слухає `keydown/keyup`, показує попередження якщо увімкнено
- **Strength** — рахує скільки вимог виконано → 1 бар (слабкий), 2 бари (середній), 3 бари (сильний). CSS `data-level` на елементі strength контролює колір барів
- **Requirements** — кожна вимога перевіряється regex в реальному часі, `✓` коли виконано
- **Валідація** — інтегровано з `FormValidator`: `minLength` і `required` через data-атрибути, `errorWeak` — через blur

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `fpassword` | Повний `CustomPasswordInput` з усіма пропсами і Tab-стопами |
