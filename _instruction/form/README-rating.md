# CustomRating

Зіркова оцінка з hover-ефектами, bounce анімацією при виборі і підписами під кожною зіркою.

```
src/
├── components/forms/CustomRating.astro     — компонент
├── scripts/init/rating.js                  — логіка (hover, вибір, анімація)
└── styles/components/forms/_rating.scss    — стилі
```

---

## Підключення

```astro
---
import CustomRating from "@components/forms/CustomRating.astro";
---

<div class="form-group">
   <CustomRating
      name="rating"
      required
      errorRequired="Поставте оцінку"
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Пропси

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `max` | `number` | `5` | Кількість зірок |
| `defaultValue` | `number` | `0` | Початково вибране значення |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути компонент |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Розмір іконок |
| `color` | `string` | — | Кастомний колір (CSS значення) |
| `icon` | `"star" \| "heart" \| "circle"` | `"star"` | Форма іконки |
| `showLabel` | `boolean` | `false` | Показувати підписи |
| `labels` | `string[]` | `[]` | Підписи для кожного значення |
| `errorRequired` | `string` | — | Помилка якщо не вибрано |

---

## Приклади

**Базовий:**
```astro
<div class="form-group">
   <CustomRating
      name="rating"
      required
      errorRequired="Поставте оцінку"
   />
</div>
```

**З підписами під зірками:**
```astro
<div class="form-group">
   <CustomRating
      name="rating"
      max={5}
      showLabel
      labels={["Погано", "Не дуже", "Нормально", "Добре", "Відмінно"]}
      required
      errorRequired="Поставте оцінку"
   />
</div>
```

**Сердечки, великий розмір, кастомний колір:**
```astro
<div class="form-group">
   <CustomRating
      name="rating"
      icon="heart"
      size="lg"
      color="#e91e63"
      max={5}
   />
</div>
```

**З початковим значенням:**
```astro
<div class="form-group">
   <CustomRating
      name="rating"
      defaultValue={3}
      max={5}
   />
</div>
```

---

## Як працює

- **HTML**: `max` радіо-інпутів рендеряться в Astro (SSR) — жодного HTML в JS
- **Hover**: підсвічує всі зірки до поточної позиції миші
- **Клік**: вибирає значення + bounce анімація на вибраній зірці
- **Валідація**: інтегровано з `FormValidator` — перший `<input type="radio">` має `required` і `data-error-required`
- **Колір**: керується CSS змінною `--rating-color` (можна перевизначити через проп `color`)

---

## VS Code сніпет

| Prefix | Що розгортає |
| ------ | ------------ |
| `frating` | `CustomRating` в `.form-group` з основними пропсами |
