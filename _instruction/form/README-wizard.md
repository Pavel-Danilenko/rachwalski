# FormWizard

Мультикрокова форма з `ProgressStepper`, валідацією кожного кроку, підсумком і анімаціями переходів.

```
src/
├── components/progress-bar/ProgressStepper.astro — індикатор кроків
├── components/forms/ContactForm.astro            — обгортка форми (wizardId prop)
├── scripts/init/form-wizard.js                   — логіка (кроки, валідація, підсумок)
└── styles/components/forms/_form-wizard.scss     — стилі (кнопки, анімації, summary)
```

> `_form-wizard.scss` потрібно підключити вручну на сторінці де використовується wizard:
> ```astro
> import "@styles/components/forms/_form-wizard.scss";
> ```

---

## Мінімальний приклад

```astro
---
import ProgressStepper from "@components/progress-bar/ProgressStepper.astro";
import ContactForm from "@components/forms/ContactForm.astro";
import "@styles/components/forms/_form-wizard.scss";
---

<ProgressStepper
   id="wizard"
   steps={[
      { label: "Особисті дані" },
      { label: "Контакти" },
      { label: "Підтвердження" },
   ]}
   currentStep={1}
/>

<ContactForm
   formId="my-wizard"
   wizardId="wizard"
   successMessage="Форму надіслано!"
>
   <!-- Крок 1 -->
   <div data-wizard-step="1">
      <div class="form-group">
         <input type="text" name="name" placeholder="Ім'я" required
            data-error-required="Введіть ім'я" />
      </div>
   </div>

   <!-- Крок 2 -->
   <div data-wizard-step="2">
      <div class="form-group">
         <input type="email" name="email" placeholder="Email" required
            data-error-required="Введіть email" />
      </div>
   </div>

   <!-- Крок 3 (підсумок) -->
   <div data-wizard-step="3" data-wizard-summary>
      <h3>Перевірте дані</h3>
      <!-- Заповнюється автоматично -->
   </div>

   <!-- Кнопки -->
   <div class="wizard-buttons">
      <button type="button" data-wizard-prev>Назад</button>
      <button type="button" data-wizard-next>Далі</button>
      <button type="submit" data-wizard-submit>Надіслати</button>
   </div>
</ContactForm>
```

---

## Обов'язкові атрибути

### ProgressStepper
| Атрибут | Опис |
|---------|------|
| `id` | Унікальний ID — має збігатися з `wizardId` у ContactForm |
| `steps` | Масив `{label: string, description?: string}` |
| `currentStep` | Початковий крок (зазвичай `1`) |

### ContactForm
| Prop | Опис |
|------|------|
| `formId` | ID форми |
| `wizardId` | ID степпера (має збігатися з `ProgressStepper id`) |

### Кроки
| Атрибут | Опис |
|---------|------|
| `data-wizard-step="N"` | Номер кроку (1, 2, 3...) |
| `data-wizard-summary` | Позначає останній крок як підсумок |

### Кнопки
| Атрибут | Опис |
|---------|------|
| `data-wizard-prev` | Кнопка "Назад" |
| `data-wizard-next` | Кнопка "Далі" (валідує поточний крок) |
| `data-wizard-submit` | Кнопка відправки (видна тільки на останньому кроці) |

---

## Пропси ProgressStepper

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Орієнтація |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Розмір |
| `showLabels` | `boolean` | `true` | Показувати назви кроків |
| `showNumbers` | `boolean` | `true` | Номери в кружках |
| `showCheckmarks` | `boolean` | `true` | Галочки на завершених |
| `showLine` | `boolean` | `true` | Лінія між кроками |
| `checkIcon` | `string` | — | Іконка зі спрайту для завершених |
| `color` | `string` | — | Кастомний колір активного кроку |

---

## Опціональне блокування кнопки "Далі"

```astro
<ContactForm wizardDisableNext={true} ...>
```

Корисно для кроків де потрібна особлива дія перед переходом.

---

## Як працює

1. JS знаходить всі `[data-wizard-step]` і показує тільки активний
2. Клік "Далі" → валідує поля поточного кроку через `FormValidator`
3. Якщо валідація пройшла → показує наступний крок + оновлює степпер
4. На кроці з `data-wizard-summary` → автоматично збирає всі значення форми і відображає їх
5. Клік по кружку степпера → переходить на той крок (тільки завершені)
6. Кнопка "Редагувати" в підсумку → повертає на відповідний крок

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `fwizard` | Повний 3-кроковий wizard з ProgressStepper |
