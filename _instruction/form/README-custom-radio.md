# CustomRadio

Кастомне радіо-поле (один вибір) з гладкою анімацією крапки, підтримкою клавіатури (Tab, Arrow keys), інтеграцією з валідацією форми та адаптивністю для сенсорних пристроїв.

```
src/
├── components/forms/CustomRadio.astro              — компонент
├── styles/components/forms/_custom-radio.scss      — стилі (з toRem() і CSS змінними)
└── scripts/init/custom-radio.js                    — логіка (порожній, CSS driven)
```

---

## Підключення

```astro
---
import CustomRadio from "@components/forms/CustomRadio.astro";
---

<fieldset class="form-group">
   <legend>Виберіть один варіант:</legend>

   <CustomRadio name="plan" value="basic" label="Базовий план" />

   <CustomRadio name="plan" value="pro" label="Профі план" />
</fieldset>
```

> Стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop            | Тип       | Default                | Опис                                              |
| --------------- | --------- | ---------------------- | ------------------------------------------------- |
| `name`          | `string`  | —                      | Атрибут `name` для форми (обов'язково)            |
| `value`         | `string`  | —                      | Значення передати в форму при вборі (обов'язково) |
| `id`            | `string`  | `radio-{name}-{value}` | Унікальний ID елемента                            |
| `label`         | `string`  | —                      | Текст поміч радіо (або слот)                      |
| `required`      | `boolean` | `false`                | Обов'язкове поле для форми                        |
| `checked`       | `boolean` | `false`                | Вже встановлено при завантаженні                  |
| `disabled`      | `boolean` | `false`                | Вимкнути радіо (сірий + неклікабельний)           |
| `class`         | `string`  | —                      | Додаткові CSS класи на wrapper                    |
| `data-error-*`  | `string`  | —                      | Повідомлення про помилку для валідатора           |
| `[key: string]` | `any`     | —                      | Інші HTML атрибути (data-_, aria-_, etc)          |

---

## Приклади

**Базове радіо:**

```astro
<fieldset class="form-group">
   <legend>Виберіть один:</legend>

   <CustomRadio name="choice" value="yes" label="Так" />

   <CustomRadio name="choice" value="no" label="Ні" />
</fieldset>
```

**Група радіо з предзаповненням:**

```astro
<fieldset class="form-group">
   <legend>Виберіть план підписки:</legend>

   <CustomRadio name="subscription" value="free" label="Безплатний" />

   <CustomRadio name="subscription" value="pro" label="Профі" checked />

   <CustomRadio name="subscription" value="enterprise" label="Enterprise" />
</fieldset>
```

**З валідацією:**

```astro
<fieldset class="form-group">
   <legend>Обов'язковий вибір:</legend>

   <CustomRadio
      name="agree"
      value="yes"
      label="Я прийму умови"
      required
      data-error-required="Вы повинні прийняти умови"
   />

   <CustomRadio name="agree" value="no" label="Я не згоден" />
</fieldset>
```

**З використанням слота:**

```astro
<fieldset class="form-group">
   <legend>Виберіть опцію:</legend>

   <CustomRadio name="feature" value="monthly">
      Щомісячна підписка
      <a href="/pricing">детальніше</a>
   </CustomRadio>

   <CustomRadio name="feature" value="annual">
      Річна підписка
      <strong>-20% скидка</strong>
   </CustomRadio>
</fieldset>
```

**Вимкнена опція:**

```astro
<fieldset class="form-group">
   <legend>Виберіть:</legend>

   <CustomRadio name="status" value="active" label="Активно" />

   <CustomRadio name="status" value="unavailable" label="Недоступно" disabled />
</fieldset>
```

---

## Як працює

### HTML структура

```html
<label class="custom-radio">
   <input type="radio" class="custom-radio__input" ... />
   <span class="custom-radio__circle"></span>
   <span class="custom-radio__label"> Текст або слот </span>
</label>
```

- **`custom-radio__input`** — справжній `<input type="radio">` прихований (opacity: 0, width: 1px)
- **`custom-radio__circle`** — видимий круг (20×20px або 22px на мобілі)
- **`custom-radio__label`** — текст поміч радіо (гнучка ширина)

### Стани

| Стан                | CSS селектор                                | Виконання                            |
| ------------------- | ------------------------------------------- | ------------------------------------ |
| **Базовий**         | `.custom-radio__circle`                     | Білий круг, сіра лінія               |
| **Hover**           | `.custom-radio:hover .custom-radio__circle` | Темніша лінія (#94a3b8 → text-muted) |
| **Focus**           | `:focus-visible ~ .custom-radio__circle`    | Синій outline + subtle shadow        |
| **Checked**         | `:checked ~ .custom-radio__circle`          | Синій круг + білий крапка всередині  |
| **Checked + Hover** | `:checked ~ .custom-radio__circle:hover`    | Темніший синій (opacity: 0.9)        |
| **Disabled**        | `:disabled ~ .custom-radio__circle`         | Сірий круг, неклікабельний           |
| **Error**           | `.form-group.error .custom-radio__circle`   | Червона лінія + червоне заповнення   |
| **Success**         | `.form-group.success .custom-radio__circle` | Зелена лінія + зелене заповнення     |

### Анімація

- **Перехід лінії:** 0.2s ease (hover, focus)
- **Крапка:** 0.2s cubic-bezier(0.4, 0, 0.2, 1) (scale 0 → 1)
- **Всього:** smooth, легко помічається, не відволікає

### Адаптивність

**На мобілі (< 640px):**

- Розмір радіо: 20px → 22px
- Розмір крапки: 8px → 9px
- Розмір тексту: 14px → 15px

**На тач-девайсах (hover: none):**

- Розмір: мінімум 24px (зручно палець)
- Розмір крапки: 10px
- Gap: 8px → 12px (більше простору)

### Клавіатура

- **Tab** — переміщення між радіо
- **Arrow Up/Down або Left/Right** — переміщення по радіо в групі (стандартна `<input type="radio">` поведінка)
- **Space** — вибір поточного (якщо ще не вибране)

### Валідація

Інтегровано з `FormValidator`:

```astro
<CustomRadio
   name="agree"
   value="yes"
   label="Я прийму"
   required
   data-error-required="Оберіть один варіант"
/>
```

Валідатор автоматично знайде прихований інпут і перевірить його. При помилці обгортка `.form-group` отримає клас `.error`, що запустить червону стилізацію.

---

## Налаштування стилів

Усі розміри і параметри задані на початку `_custom-radio.scss`:

```scss
$radio-size: 20; // Розмір круга (20px)
$radio-border: 2; // Товщина лінії (2px)
$radio-dot-size: 8; // Розмір крапки (8px)
$radio-label-font-size: 14; // Розмір тексту (14px)
$radio-gap: 8; // Відступ між кругом і текстом (8px)

// Мобільна версія
$radio-size-mobile: 22;
$radio-dot-size-mobile: 9;
$radio-label-font-size-mobile: 15;

// Тач-девайси
$radio-size-touch: 24;
$radio-dot-size-touch: 10;
$radio-gap-touch: 12;
```

Змініть ці значення щоб підлаштувати розміри під ваш дизайн. Усі значення автоматично конвертуються в `rem` через функцію `toRem()`.

---

## Кольори (CSS змінні)

Стилі використовують CSS змінні з палітри:

```css
--color-border       /* Основна лінія */
--color-bg           /* Фон радіо */
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

## Група радіо в `<fieldset>`

Для семантики завжди використовуйте `<fieldset>` з `<legend>`:

```astro
<fieldset class="form-group">
   <legend>Оберіть план:</legend>

   <CustomRadio name="plan" value="basic" label="Базовий" />
   <CustomRadio name="plan" value="pro" label="Профі" />
   <CustomRadio name="plan" value="enterprise" label="Enterprise" />
</fieldset>
```

Це правильно для:

- ✅ Screen readers (читають Legend як опис групи)
- ✅ Клавіатурної навігації (Tab переходить між радіо)
- ✅ Семантики HTML (машини розуміють групу)

---

## Доступність (A11y)

✅ **Клавіатурна навігація** — Tab для переміщення, Arrow keys для вибору в групі

✅ **Screen readers** — справжній `<input>` дозволяє читати всю інформацію

✅ **Focus стан** — видимий outline + shadow для користувачів без миші

✅ **High contrast** — контрастні кольори за замовчуванням

✅ **Touch friendly** — мінімум 24px на сенсорних пристроях

---

## VS Code сніпет

| Prefix                  | Що розгортає               |
| ----------------------- | -------------------------- |
| `fradio`                | `CustomRadio` простий      |
| `fradio:group`          | Група радіо в `<fieldset>` |
| `fradio:group-required` | З валідацією `required`    |
