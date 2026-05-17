# CustomDatePicker

Кастомний календар з підтримкою режимів single/range/multiple, локалізацією, шорткатами, обмеженнями дат та інтеграцією з FormValidator.

```
src/
├── components/forms/CustomDatePicker.astro          — компонент
├── scripts/init/custom-datepicker.js               — логіка (генерація календаря, навігація)
└── styles/components/forms/_custom-datepicker.scss — стилі
```

---

## Підключення

```astro
---
import CustomDatePicker from "@components/forms/CustomDatePicker.astro";
---

<div class="form-group">
   <CustomDatePicker
      name="date"
      placeholder="Оберіть дату"
      data-error-required="Оберіть дату"
      required
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Пропси

### Основні

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `mode` | `"single" \| "range" \| "multiple"` | `"single"` | Режим вибору дати |
| `value` | `string` | — | Початкове значення (YYYY-MM-DD) |
| `placeholder` | `string` | `"Select date"` | Плейсхолдер |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути компонент |
| `readonly` | `boolean` | `false` | Тільки для читання |

### Формат і локалізація

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `format` | `string` | `"DD.MM.YYYY"` | Формат відображення дати |
| `firstDayOfWeek` | `number` | `1` | Перший день тижня (0=Нд, 1=Пн) |
| `monthNames` | `string[]` | EN | Назви місяців |
| `dayNamesMin` | `string[]` | EN | Короткі назви днів (Пн, Вт...) |

### Обмеження

| Prop | Тип | Опис |
| ---- | --- | ---- |
| `minDate` | `string` | Мінімальна дата (YYYY-MM-DD) |
| `maxDate` | `string` | Максимальна дата (YYYY-MM-DD) |
| `disabledDates` | `string[]` | Конкретні вимкнені дати |
| `disabledDaysOfWeek` | `number[]` | Вимкнені дні тижня (0=Нд, 6=Сб) |

### UI

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `showTodayButton` | `boolean` | `true` | Кнопка "Сьогодні" |
| `showClearButton` | `boolean` | `true` | Кнопка очищення |
| `showYearDropdown` | `boolean` | `true` | Клікабельний рік в заголовку |
| `showMonthDropdown` | `boolean` | `true` | Клікабельний місяць в заголовку |
| `showShortcuts` | `boolean` | `false` | Швидкі шорткати |
| `showMultipleMonths` | `number` | `1` | Кількість місяців одночасно |
| `shortcuts` | `Array<{label, value}>` | `[]` | Список шорткатів |

### Валідація (через data-атрибути)

```astro
<CustomDatePicker
   name="date"
   required
   data-error-required="Оберіть дату"
   data-error-min-date="Дата не може бути в минулому"
   data-error-max-date="Дата перевищує допустиму"
/>
```

---

## Приклади

**Базовий:**
```astro
<div class="form-group">
   <CustomDatePicker
      name="date"
      placeholder="Оберіть дату"
      required
      data-error-required="Оберіть дату"
   />
</div>
```

**Українська локалізація:**
```astro
<div class="form-group">
   <CustomDatePicker
      name="date"
      placeholder="Оберіть дату"
      format="DD.MM.YYYY"
      firstDayOfWeek={1}
      monthNames={["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"]}
      dayNamesMin={["Нд","Пн","Вт","Ср","Чт","Пт","Сб"]}
      todayText="Сьогодні"
      clearText="Очистити"
      required
      data-error-required="Оберіть дату"
   />
</div>
```

**Range (діапазон дат):**
```astro
<div class="form-group">
   <CustomDatePicker
      name="dateRange"
      mode="range"
      placeholder="Початок — Кінець"
      applyText="Застосувати"
      cancelText="Скасувати"
   />
</div>
```

**З обмеженнями і вимкненими вихідними:**
```astro
<div class="form-group">
   <CustomDatePicker
      name="workDate"
      placeholder="Робочий день"
      minDate="2025-01-01"
      maxDate="2025-12-31"
      disabledDaysOfWeek={[0, 6]}
      disabledDates={["2025-01-07"]}
      required
      data-error-required="Оберіть дату"
      data-error-min-date="Дата не може бути раніше 2025"
   />
</div>
```

**З шорткатами:**
```astro
<div class="form-group">
   <CustomDatePicker
      name="date"
      showShortcuts
      shortcuts={[
         { label: "Сьогодні", value: "today" },
         { label: "Завтра",   value: "tomorrow" },
         { label: "+7 днів",  value: "+7d" },
         { label: "+30 днів", value: "+30d" },
      ]}
   />
</div>
```

---

## Як працює

- **Hidden input**: зберігає значення у форматі `YYYY-MM-DD` для відправки
- **Display input**: показує дату у форматі визначеному через `format`
- **Навігація**: клік на місяць або рік в заголовку відкриває grid для швидкого вибору
- **Breadcrumbs**: показує поточний шлях навігації (рік → місяць → день)
- **Валідація**: інтегровано з `FormValidator` через `data-error-*` атрибути на wrapper

### Анімації переходів

Prop `transition` керує типом анімації. Додатково — різні анімації залежно від контексту навігації:

| Дія | Анімація |
|-----|----------|
| Клік **→ наступний місяць/рік** | Слайд вліво |
| Клік **← попередній місяць/рік** | Слайд вправо |
| Клік на **місяць або рік** в заголовку | Zoom out — камера відлітає вгору по ієрархії |
| Клік на **день або місяць** в гриді | Zoom in — камера наближається вниз по ієрархії |

Доступні значення `transition`:

| Значення | Опис |
|----------|------|
| `"slide"` | Горизонтальний слайд з правильним напрямком (default) |
| `"fade"` | Плавне зникнення/появлення |
| `"scale"` | Масштабування |
| `"none"` | Без анімації |

```astro
<!-- Приклад зміни анімації -->
<CustomDatePicker name="date" transition="fade" />
```

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `fdatepicker` | `CustomDatePicker` з українською локалізацією та валідацією |
| `fdatepickerrange` | `CustomDatePicker` в режимі range |
