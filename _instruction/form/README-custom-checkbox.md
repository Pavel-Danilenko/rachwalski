# CustomCheckbox

Кастомний чекбокс з гладкою анімацією, підтримкою клавіатури (Tab, Space), інтеграцією з валідацією форми та адаптивністю для сенсорних пристроїв.

```
src/
├── components/forms/CustomCheckbox.astro              — компонент
├── styles/components/forms/_custom-checkbox.scss      — стилі (з toRem() і CSS змінними)
└── scripts/init/custom-checkbox.js                    — логіка (порожній, CSS driven)
```

---

## Підключення

```astro
---
import CustomCheckbox from "@components/forms/CustomCheckbox.astro";
---

<div class="form-group">
   <CustomCheckbox
      name="terms"
      label="Я прийму умови використання"
      required
      data-error-required="Ви повинні прийняти умови"
   />
</div>
```

> Стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop            | Тип       | Default           | Опис                                      |
| --------------- | --------- | ----------------- | ----------------------------------------- |
| `name`          | `string`  | —                 | Атрибут `name` для форми (обов'язково)    |
| `id`            | `string`  | `checkbox-{name}` | Унікальний ID елемента                    |
| `label`         | `string`  | —                 | Текст поміч чекбоксом (або слот)          |
| `required`      | `boolean` | `false`           | Обов'язкове поле для форми                |
| `checked`       | `boolean` | `false`           | Вже встановлено при завантаженні          |
| `disabled`      | `boolean` | `false`           | Вимкнути чекбокс (сірий + неклікабельний) |
| `value`         | `string`  | —                 | Значення передати в форму                 |
| `class`         | `string`  | —                 | Додаткові CSS класи на wrapper            |
| `data-error-*`  | `string`  | —                 | Повідомлення про помилку для валідатора   |
| `[key: string]` | `any`     | —                 | Інші HTML атрибути (data-_, aria-_, etc)  |

---

## Приклади

**Базовий чекбокс:**

```astro
<div class="form-group">
   <CustomCheckbox name="agree" label="Я згоден" />
</div>
```

**Обов'язковий чекбокс з валідацією:**

```astro
<div class="form-group">
   <CustomCheckbox
      name="terms"
      label="Я прийму умови використання"
      required
      data-error-required="Ви повинні прийняти умови"
   />
</div>
```

**З використанням слота для складного текста:**

```astro
<div class="form-group">
   <CustomCheckbox name="newsletter">
      Підписатися на розсилку
      <a href="/privacy">політика приватності</a>
   </CustomCheckbox>
</div>
```

**Передзаповнений і вимкнений:**

```astro
<div class="form-group">
   <CustomCheckbox
      name="readonly"
      label="Система заблокувала цей параметр"
      checked
      disabled
   />
</div>
```

**З кастомним value:**

```astro
<div class="form-group">
   <CustomCheckbox name="options" value="premium" label="Преміум підписка" />
</div>
```

**Декілька чекбоксів (в групі):**

```astro
<fieldset class="form-group">
   <legend>Виберіть інтереси:</legend>

   <CustomCheckbox name="interests" value="tech" label="Технології" />

   <CustomCheckbox name="interests" value="design" label="Дизайн" />

   <CustomCheckbox name="interests" value="marketing" label="Маркетинг" />
</fieldset>
```

---

## Як працює

### HTML структура

```html
<label class="custom-checkbox">
   <input type="checkbox" class="custom-checkbox__input" ... />
   <span class="custom-checkbox__box"></span>
   <span class="custom-checkbox__label"> Текст або слот </span>
</label>
```

- **`custom-checkbox__input`** — справжній `<input type="checkbox">` прихований (opacity: 0, width: 1px)
- **`custom-checkbox__box`** — видимий кастомний чекбокс (20×20px або 22px на мобілі)
- **`custom-checkbox__label`** — текст поміч чекбоксом (гнучка ширина)

### Стани

| Стан                | CSS селектор                                   | Виконання                                   |
| ------------------- | ---------------------------------------------- | ------------------------------------------- |
| **Базовий**         | `.custom-checkbox__box`                        | Білий квадрат, сіра лінія, заокруглені кути |
| **Hover**           | `.custom-checkbox:hover .custom-checkbox__box` | Темніша лінія (#94a3b8 → text-muted)        |
| **Focus**           | `:focus-visible ~ .custom-checkbox__box`       | Синій outline + subtle shadow               |
| **Checked**         | `:checked ~ .custom-checkbox__box`             | Синій фон + білий галочка (CSS ::after)     |
| **Checked + Hover** | `:checked ~ .custom-checkbox__box:hover`       | Темніший синій (opacity: 0.9)               |
| **Disabled**        | `:disabled ~ .custom-checkbox__box`            | Сірий фон, неклікабельний, бліді текст      |
| **Error**           | `.form-group.error .custom-checkbox__box`      | Червона лінія + червоне заповнення          |
| **Success**         | `.form-group.success .custom-checkbox__box`    | Зелена лінія + зелене заповнення            |

### Анімація

- **Перехід лінії:** 0.2s ease (hover, focus)
- **Галочка:** 0.2s cubic-bezier(0.4, 0, 0.2, 1) (check → rotate + scale)
- **Всього:** smooth, легко помічається, не відволікає

### Адаптивність

**На мобілі (< 640px):**

- Розмір чекбокса: 20px → 22px
- Розмір тексту: 14px → 15px

**На тач-девайсах (hover: none):**

- Розмір: мінімум 24px (зручно палець)
- Gap: 8px → 12px (більше простору)

### Клавіатура

- **Tab** — переміщення між чекбоксами
- **Space** — увімкнення/вимкнення (стандартна `<input type="checkbox">` поведінка)

### Валідація

Інтегровано з `FormValidator`:

```astro
<CustomCheckbox
   name="terms"
   required
   data-error-required="Ви повинні прийняти умови"
/>
```

Валідатор автоматично знайде прихований інпут і перевірить його. При помилці обгортка `.form-group` отримає клас `.error`, що запустить червону стилізацію.

---

## Налаштування стилів

Усі розміри і параметри задані на початку `_custom-checkbox.scss`:

```scss
$checkbox-size: 20; // Розмір (20px)
$checkbox-border: 2; // Товщина лінії (2px)
$checkbox-radius: 4; // Заокруглення (4px)
$checkbox-label-font-size: 14; // Розмір тексту (14px)
$checkbox-gap: 8; // Відступ між боксом і текстом (8px)

// Мобільна версія
$checkbox-size-mobile: 22;
$checkbox-label-font-size-mobile: 15;

// Тач-девайси
$checkbox-size-touch: 24;
$checkbox-gap-touch: 12;
```

Змініть ці значення щоб підлаштувати розміри під ваш дизайн. Усі значення автоматично конвертуються в `rem` через функцію `toRem()`.

---

## Кольори (CSS змінні)

Стилі використовують CSS змінні з pallate:

```css
--color-border       /* Основна лінія */
--color-bg           /* Фон чекбокса */
--color-text         /* Текст labels */
--color-text-muted   /* Hover лінія */
--color-primary      /* Checked стан */
--color-bg-alt       /* Disabled фон */
--color-error        /* Помилка */
--color-success      /* Успіх */
```

Щоб змінити кольори, оновіть значення в `src/styles/base/_palette.scss`:

```scss
$colors: (
   "primary": #007bff,
   // ← Checked стан
   "text": #1a1a1a,
   // ← Label текст
   "border": #e5e5e5,
   // ← Лінія
   ...,
);
```

---

## Доступність (A11y)

✅ **Клавіатурна навігація** — Tab + Space як стандартний `<input type="checkbox">`

✅ **Screen readers** — справжній `<input>` дозволяє читати всю інформацію

✅ **Focus стан** — видимий outline + shadow для користувачів без миші

✅ **High contrast** — контрастні кольори за замовчуванням

✅ **Touch friendly** — мінімум 24px на сенсорних пристроях

---

## VS Code сніпет

| Prefix               | Що розгортає               |
| -------------------- | -------------------------- |
| `fcheckbox`          | `CustomCheckbox` базовий   |
| `fcheckbox:required` | З валідацією `required`    |
| `fcheckbox:group`    | Група чекбоксів з fieldset |
