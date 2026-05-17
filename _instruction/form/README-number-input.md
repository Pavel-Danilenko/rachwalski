# CustomNumberInput

Числове поле з кнопками `+` і `−`, автоматичним блокуванням на межах, підтримкою довгого кліку і інтеграцією з FormValidator.

```
src/
├── components/forms/CustomNumberInput.astro      — компонент
├── scripts/init/number-input.js                  — логіка (кнопки, repeat, валідація)
└── styles/components/forms/_number-input.scss    — стилі
```

---

## Підключення

```astro
---
import CustomNumberInput from "@components/forms/CustomNumberInput.astro";
---

<div class="form-group">
   <CustomNumberInput
      name="quantity"
      value={1}
      min={1}
      max={99}
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `value` | `number` | `0` | Початкове значення |
| `min` | `number` | — | Мінімальне значення (кнопка `−` блокується) |
| `max` | `number` | — | Максимальне значення (кнопка `+` блокується) |
| `step` | `number` | `1` | Крок зміни значення |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути компонент |
| `placeholder` | `string` | `"0"` | Плейсхолдер |
| `errorRequired` | `string` | — | Помилка якщо порожнє |
| `errorMin` | `string` | — | Помилка якщо менше мінімуму |
| `errorMax` | `string` | — | Помилка якщо більше максимуму |

---

## Приклади

**Кількість товару (e-commerce):**
```astro
<div class="form-group">
   <CustomNumberInput
      name="quantity"
      value={1}
      min={1}
      max={99}
      required
      errorRequired="Вкажіть кількість"
   />
</div>
```

**Вік з кроком 1:**
```astro
<div class="form-group">
   <CustomNumberInput
      name="age"
      value={18}
      min={1}
      max={120}
      errorMin="Мінімальний вік: 1"
      errorMax="Максимальний вік: 120"
   />
</div>
```

**Ціна з кроком 100:**
```astro
<div class="form-group">
   <CustomNumberInput
      name="price"
      value={1000}
      min={100}
      max={100000}
      step={100}
   />
</div>
```

---

## Як працює

- **Кнопки `+`/`−`**: змінюють значення на `step`, диспатчать `input` і `change` події для FormValidator
- **Межі**: кнопка `−` блокується при `value === min`, кнопка `+` при `value === max`
- **Довгий клік**: тримаєш кнопку → значення змінюється кожні 120ms (зручно для великих діапазонів)
- **Ручне введення**: при зміні поля вручну — значення автоматично округлюється до `step` і обрізається до `min/max`
- **Стрілки браузера**: приховані через CSS — тільки кнопки `+`/`−`
- **Валідація**: інтегровано з `FormValidator` через стандартні `data-error-*` атрибути

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `fnumber` | `CustomNumberInput` в `.form-group` з `min`, `max`, `step` |
