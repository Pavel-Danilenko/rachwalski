# Phone Fields

Два варіанти поля телефону — простий і розширений з вибором країни.

---

## Варіант 1 — Simple Phone (`data-phone`)

Простий `<input>` з автоформатуванням. Підходить коли країна відома заздалегідь.

**Файл:** `src/scripts/init/form-validation.js` (вбудовано у FormValidator)

### Підключення

```astro
<div class="form-group">
   <input
      type="tel"
      name="phone"
      placeholder="+380"
      required
      data-phone
      data-error-required="Введіть номер телефону"
      data-error-phone="Невірний формат телефону"
   />
</div>
```

### Атрибути

| Атрибут | Опис |
| ------- | ---- |
| `data-phone` | Вмикає автоформатування і валідацію |
| `data-error-required` | Текст помилки якщо поле порожнє |
| `data-error-phone` | Текст помилки якщо номер невірний |

### Як працює

- Автоматично додає `+` при фокусі
- Форматує номер під час вводу по країні:
  - Україна `+380` → `+380 XX XXX XX XX`
  - Польща `+48` → `+48 XXX XXX XXX`
  - США/Канада `+1` → `+1 XXX XXX XXXX`
  - Інші → `+XXX XX XXX XXXX`
- Валідує довжину по коду країни

---

## Варіант 2 — CustomPhoneInput

Компонент з дропдауном вибору країни, прапорцями, пошуком і форматуванням по масках для 66 країн.

```
src/
├── components/forms/CustomPhoneInput.astro   — компонент
├── scripts/init/phone-input.js               — логіка (без HTML, без тексту)
├── styles/components/forms/_phone-input.scss  — стилі
└── data/phone-countries.ts                   — список країн (name, iso2, dial, flag)
```

### Підключення

```astro
---
import CustomPhoneInput from "@components/forms/CustomPhoneInput.astro";
---

<div class="form-group">
   <CustomPhoneInput
      name="phone"
      defaultCountry="UA"
      required
      errorRequired="Введіть номер телефону"
      errorPhone="Невірний формат телефону"
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

### Пропси

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `defaultCountry` | `string` | `"UA"` | ISO2 код країни за замовчуванням |
| `placeholder` | `string` | `"XX XXX XX XX"` | Плейсхолдер поля номера |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути поле |
| `searchable` | `boolean` | `false` | Показати пошук у дропдауні |
| `alphabetical` | `boolean` | `false` | Сортувати країни за алфавітом |
| `showCode` | `boolean` | `false` | Показати ISO код (`UA`) замість прапорця |
| `searchPlaceholder` | `string` | `"Search..."` | Плейсхолдер поля пошуку |
| `noResultsText` | `string` | `"Nothing found"` | Текст коли нічого не знайдено |
| `errorRequired` | `string` | — | Текст помилки якщо поле порожнє |
| `errorPhone` | `string` | — | Текст помилки якщо номер невірний |

### Приклади

**Базовий:**
```astro
<div class="form-group">
   <CustomPhoneInput
      name="phone"
      defaultCountry="UA"
      required
      errorRequired="Введіть номер"
      errorPhone="Невірний номер"
   />
</div>
```

**З пошуком і сортуванням:**
```astro
<div class="form-group">
   <CustomPhoneInput
      name="phone"
      defaultCountry="PL"
      required
      searchable
      alphabetical
      searchPlaceholder="Пошук країни..."
      noResultsText="Нічого не знайдено"
      errorRequired="Введіть номер"
      errorPhone="Невірний номер"
   />
</div>
```

**З ISO кодом замість прапорця:**
```astro
<div class="form-group">
   <CustomPhoneInput
      name="phone"
      showCode
      errorRequired="Введіть номер"
      errorPhone="Невірний номер"
   />
</div>
```

### Як працює

1. Список країн рендериться **в Astro** (SSR) — не генерується в JS
2. JS читає країни з DOM — нуль тексту в скрипті
3. Форматування по масках: кожна країна має свій шаблон (`XX XXX XX XX`)
4. Валідація інтегрована з `FormValidator` через прихований `<input type="tel">`
5. При blur без вводу — автоматично показує `errorRequired`
6. При введенні — очищає помилку, форматує номер, валідує при blur

### Додавання нових країн

Відкрий `src/data/phone-countries.ts` і додай рядок:

```ts
["Country Name", "ISO", "+XXX", "🏳️"],
```

Потім у `src/scripts/init/phone-input.js` додай правило форматування:

```js
ISO: [мінЦифр, максЦифр, "XX XXX XXXX"],
```

---

## VS Code сніпети

Файл: `.vscode/astro.code-snippets`

| Prefix | Що розгортає |
| ------ | ------------ |
| `fphone` | `CustomPhoneInput` в `.form-group` з усіма пропсами |
| `fphonesi` | Простий `input[data-phone]` для однієї країни |

**Як використовувати:** відкрий `.astro` файл → введи префікс → `Tab`

---

## Порівняння

| | Simple (`data-phone`) | CustomPhoneInput |
|---|---|---|
| Вибір країни | Немає | Дропдаун з прапорцями |
| Пошук країни | Немає | Є (проп `searchable`) |
| Країн | 3 + загальний | 66 |
| Складність | Простий `<input>` | Окремий компонент |
| Підходить для | Локальних форм (одна країна) | Міжнародних форм |
