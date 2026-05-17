# CustomSwitch

Кастомний toggle switch з плавною анімацією, градієнтом, підтримкою клавіатури (Tab, Space), інтеграцією з валідацією форми та адаптивністю для сенсорних пристроїв.

```
src/
├── components/forms/CustomSwitch.astro              — компонент
├── styles/components/forms/_custom-switch.scss      — стилі (з toRem() і CSS змінними)
└── scripts/init/custom-switch.js                    — логіка (порожній, CSS driven)
```

---

## Підключення

```astro
---
import CustomSwitch from "@components/forms/CustomSwitch.astro";
---

<div class="form-group">
   <CustomSwitch name="notifications" label="Отримувати сповіщення" checked />
</div>
```

> Стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop            | Тип       | Default         | Опис                                     |
| --------------- | --------- | --------------- | ---------------------------------------- |
| `name`          | `string`  | —               | Атрибут `name` для форми (обов'язково)   |
| `id`            | `string`  | `switch-{name}` | Унікальний ID елемента                   |
| `label`         | `string`  | —               | Текст поміч switch (або слот)            |
| `required`      | `boolean` | `false`         | Обов'язкове поле для форми               |
| `checked`       | `boolean` | `false`         | Вже включено при завантаженні            |
| `disabled`      | `boolean` | `false`         | Вимкнути switch (сірий + неклікабельний) |
| `value`         | `string`  | —               | Значення передати в форму                |
| `class`         | `string`  | —               | Додаткові CSS класи на wrapper           |
| `data-error-*`  | `string`  | —               | Повідомлення про помилку для валідатора  |
| `[key: string]` | `any`     | —               | Інші HTML атрибути (data-_, aria-_, etc) |

---

## Приклади

**Базовий switch:**

```astro
<div class="form-group">
   <CustomSwitch name="agree" label="Я погоджуюсь" />
</div>
```

**Включений за замовчуванням:**

```astro
<div class="form-group">
   <CustomSwitch name="darkMode" label="Темна тема" checked />
</div>
```

**З валідацією:**

```astro
<div class="form-group">
   <CustomSwitch
      name="terms"
      label="Я прийму умови використання"
      required
      data-error-required="Вы повинні прийняти умови"
   />
</div>
```

**Зі слотом для складного тексту:**

```astro
<div class="form-group">
   <CustomSwitch name="newsletter">
      Підписатися на розсилку
      <a href="/privacy">політика приватності</a>
   </CustomSwitch>
</div>
```

**Вимкнений switch:**

```astro
<div class="form-group">
   <CustomSwitch name="locked" label="Цей параметр заблокований" disabled />
</div>
```

**Вимкнений і включений:**

```astro
<div class="form-group">
   <CustomSwitch
      name="readOnly"
      label="Налаштування не можна змінити"
      checked
      disabled
   />
</div>
```

---

## Як працює

### HTML структура

```html
<label class="custom-switch">
   <input type="checkbox" class="custom-switch__input" ... />
   <span class="custom-switch__track">
      <span class="custom-switch__thumb"></span>
   </span>
   <span class="custom-switch__label"> Текст або слот </span>
</label>
```

- **`custom-switch__input`** — справжній `<input type="checkbox">` прихований (opacity: 0, width: 1px)
- **`custom-switch__track`** — доріжка switch (44×24px або 48×26px на мобілі)
- **`custom-switch__thumb`** — кружок що ковзає (20×20px, переміщується при включенні)
- **`custom-switch__label`** — текст поміч switch (гнучка ширина)

### Стани

| Стан                | CSS селектор                                 | Виконання                            |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| **Базовий**         | `.custom-switch__track`                      | Сіра доріжка, білий кружок ліворуч   |
| **Hover**           | `.custom-switch:hover .custom-switch__track` | Темніша доріжка, піднята тінь        |
| **Focus**           | `:focus-visible ~ .custom-switch__track`     | Синій outline + shadow               |
| **Checked**         | `:checked ~ .custom-switch__track`           | Синій градієнт, кружок праворуч      |
| **Checked + Hover** | `:checked ~ .custom-switch__track:hover`     | Темніший градієнт                    |
| **Active**          | `:active .custom-switch__thumb`              | Кружок розширюється (24px)           |
| **Disabled**        | `:disabled ~ .custom-switch__track`          | Сіра, неклікабельна, бліда           |
| **Error**           | `.form-group.error .custom-switch__track`    | Червоний градієнт, красне заповнення |
| **Success**         | `.form-group.success .custom-switch__track`  | Зелений градієнт, зелене заповнення  |

### Анімація

- **Переміщення кружка:** 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Зміна фону:** 0.3s плавна (градієнт змінюється)
- **Тінь:** 0.3s для піднесення при активності
- **Розширення при натиску:** гладко розширюється на 4px (24px)

### Адаптивність

**На мобілі (< 640px):**

- Розмір доріжки: 44×24px → 48×26px
- Розмір кружка: 20px → 22px
- Розмір тексту: 14px → 15px
- Gap: 12px → 14px (більше простору)

**На тач-девайсах (hover: none):**

- Розмір доріжки: мінімум 52×28px (зручно палець)
- Розмір кружка: 24px
- Gap: 16px (максимальний простір)
- Border-radius доріжки: 14px (більш закруглено)

### Клавіатура

- **Tab** — переміщення на switch
- **Space** — вмикання/вимикання (стандартна `<input type="checkbox">` поведінка)

### Валідація

Інтегровано з `FormValidator`:

```astro
<CustomSwitch
   name="agree"
   label="Прийти умови"
   required
   data-error-required="Вы повинні прийняти"
/>
```

Валідатор автоматично знайде прихований інпут і перевірить його. При помилці обгортка `.form-group` отримає клас `.error`, що запустить червоний стиль.

---

## Налаштування стилів

Усі розміри і параметри задані на початку `_custom-switch.scss`:

```scss
$switch-track-width: 44; // Ширина доріжки (44px)
$switch-track-height: 24; // Висота доріжки (24px)
$switch-track-radius: 12; // Заокруглення (12px)
$switch-thumb-size: 20; // Розмір кружка (20px)
$switch-thumb-offset: 2; // Відступ від краю (2px)
$switch-label-font-size: 14; // Розмір тексту (14px)
$switch-gap: 12; // Відступ між track і text (12px)

// Мобільна версія
$switch-track-width-mobile: 48;
$switch-track-height-mobile: 26;
$switch-thumb-size-mobile: 22;
$switch-label-font-size-mobile: 15;

// Тач-девайси
$switch-track-width-touch: 52;
$switch-track-height-touch: 28;
$switch-track-radius-touch: 14;
$switch-thumb-size-touch: 24;
```

Змініть ці значення щоб підлаштувати розміри під ваш дизайн. Усі значення автоматично конвертуються в `rem` через функцію `toRem()`.

---

## Кольори (CSS змінні)

Стилі використовують CSS змінні з палітри:

```css
--color-border       /* Базова доріжка */
--color-bg           /* Кружок */
--color-text         /* Текст label */
--color-text-muted   /* Hover доріжка */
--color-primary      /* Checked стан (градієнт) */
--color-bg-alt       /* Disabled фон */
--color-error        /* Помилка (градієнт) */
--color-success      /* Успіх (градієнт) */
```

Щоб змінити кольори, оновіть значення в `src/styles/base/_palette.scss`:

```scss
$colors: (
   "primary": #007bff,
   // ← Checked стан
   "text": #1a1a1a,
   // ← Label текст
   "border": #e5e5e5,
   // ← Базова доріжка
   "error": #dc3545,
   // ← Error градієнт
   "success": #28a745,
   // ← Success градієнт
   ...,
);
```

---

## Особливості

✨ **Градієнт** — при включенні доріжка переходить в красивий синій градієнт (135°)

✨ **Тінь під кружком** — піднесена тінь при наведенні та активності

✨ **Розширення при натиску** — кружок розширюється на 4px під час натиску (акцент)

✨ **Плавні переходи** — усе анімується 0.3s з профільною кривою

✨ **Доступність** — повна клавіатурна навігація та поддержка screen readers

---

## Доступність (A11y)

✅ **Клавіатурна навігація** — Tab для фокусу, Space для вмикання/вимикання

✅ **Screen readers** — справжній `<input>` дозволяє читати інформацію

✅ **Focus стан** — видимий outline + shadow для користувачів без миші

✅ **High contrast** — контрастні кольори за замовчуванням

✅ **Touch friendly** — мінімум 52×28px на сенсорних пристроях

---

## VS Code сніпет

| Prefix             | Що розгортає            |
| ------------------ | ----------------------- |
| `fswitch`          | `CustomSwitch` базовий  |
| `fswitch:checked`  | З `checked` атрибутом   |
| `fswitch:required` | З валідацією `required` |
