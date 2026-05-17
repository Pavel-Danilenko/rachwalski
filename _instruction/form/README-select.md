# CustomSelect

Кастомний селект з пошуком, множинним вибором, групами опцій, тегами і лічильником.

```
src/
├── components/forms/CustomSelect.astro       — компонент
├── scripts/init/select.js                    — логіка
└── styles/components/forms/_select.scss      — стилі
```

---

## Підключення

```astro
---
import CustomSelect from "@components/forms/CustomSelect.astro";
---

<div class="form-group">
   <CustomSelect
      name="service"
      placeholder="Оберіть послугу"
      required
      errorRequired="Оберіть варіант"
      options={[
         { value: "web", label: "Веб-розробка" },
         { value: "design", label: "Дизайн" },
      ]}
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Типи опцій

### Проста опція
```ts
{ value: string; label: string; description?: string; disabled?: boolean; icon?: string }
```

### Група опцій
```ts
{ group: string; items: Option[]; groupPlaceholder?: string }
```

---

## Пропси

### Основні

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `name` | `string` | — | Атрибут `name` для форми |
| `options` | `Option[] \| OptionGroup[]` | — | Список опцій або груп |
| `placeholder` | `string` | `"Оберіть варіант"` | Плейсхолдер |
| `defaultValue` | `string \| string[]` | — | Початково вибране значення |
| `required` | `boolean` | `false` | Обов'язкове поле |
| `disabled` | `boolean` | `false` | Вимкнути компонент |
| `errorRequired` | `string` | — | Текст помилки якщо не вибрано |

### Пошук

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `searchable` | `boolean` | `false` | Показати поле пошуку |
| `searchPlaceholder` | `string` | `"Пошук..."` | Плейсхолдер пошуку |
| `searchClearable` | `boolean` | `false` | Кнопка очищення пошуку |
| `highlightSearch` | `boolean` | `false` | Підсвічувати збіги в пошуку |
| `noResultsText` | `string` | `"Нічого не знайдено"` | Текст якщо нічого не знайдено |

### Множинний вибір

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `multiple` | `boolean` | `false` | Множинний вибір |
| `maxSelections` | `number` | — | Ліміт вибору |
| `multipleSelectedText` | `string` | `"Вибрано:"` | Текст перед лічильником |
| `multipleDisplayLimit` | `number` | `2` | Скільки значень показувати |
| `showRemovableTags` | `boolean` | `false` | Теги з кнопкою видалення |
| `showSelectAll` | `boolean` | `false` | Кнопка "Вибрати всі" |
| `selectAllText` | `string` | `"Вибрати всі"` | Текст кнопки |
| `deselectAllText` | `string` | `"Скасувати все"` | Текст при знятті всіх |
| `showClearAllButton` | `boolean` | `false` | Окрема кнопка "Очистити все" |
| `clearAllButtonText` | `string` | `"Очистити все"` | Текст кнопки |
| `showCounter` | `boolean` | `false` | Лічильник вибраних |

### Інше

| Prop | Тип | Default | Опис |
| ---- | --- | ------- | ---- |
| `showClearButton` | `boolean` | `false` | Кнопка очищення в тригері |
| `clearButtonText` | `string` | `"Очистити"` | Текст кнопки |
| `sortAlphabetically` | `boolean` | `false` | Сортування за алфавітом |
| `maxDropdownHeight` | `string` | `"80vh"` | Макс. висота дропдауну |
| `enableGroupSelection` | `boolean` | `false` | Клік на групу вибирає всі в ній |

---

## Приклади

**Базовий:**
```astro
<div class="form-group">
   <CustomSelect
      name="city"
      placeholder="Оберіть місто"
      required
      errorRequired="Оберіть місто"
      options={[
         { value: "kyiv",   label: "Київ" },
         { value: "lviv",   label: "Львів" },
         { value: "odesa",  label: "Одеса" },
         { value: "kharkiv",label: "Харків" },
      ]}
   />
</div>
```

**З пошуком:**
```astro
<div class="form-group">
   <CustomSelect
      name="country"
      placeholder="Оберіть країну"
      searchable
      searchPlaceholder="Пошук країни..."
      noResultsText="Країну не знайдено"
      sortAlphabetically
      options={countries}
   />
</div>
```

**Множинний вибір з тегами:**
```astro
<div class="form-group">
   <CustomSelect
      name="skills"
      placeholder="Оберіть навички"
      multiple
      showRemovableTags
      showSelectAll
      maxSelections={5}
      selectAllText="Вибрати всі"
      deselectAllText="Скасувати"
      options={[
         { value: "js",   label: "JavaScript" },
         { value: "ts",   label: "TypeScript" },
         { value: "vue",  label: "Vue" },
         { value: "react",label: "React" },
      ]}
   />
</div>
```

**З групами:**
```astro
<div class="form-group">
   <CustomSelect
      name="service"
      placeholder="Оберіть послугу"
      options={[
         {
            group: "Розробка",
            items: [
               { value: "web",    label: "Веб-сайт" },
               { value: "mobile", label: "Мобільний застосунок" },
            ],
         },
         {
            group: "Дизайн",
            items: [
               { value: "ui",       label: "UI/UX дизайн" },
               { value: "branding", label: "Брендинг" },
            ],
         },
      ]}
   />
</div>
```

**З описом і іконками:**
```astro
<div class="form-group">
   <CustomSelect
      name="plan"
      placeholder="Оберіть тариф"
      options={[
         { value: "free",  label: "Free",  description: "До 3 проектів", icon: "🆓" },
         { value: "pro",   label: "Pro",   description: "Необмежено",    icon: "⭐" },
         { value: "team",  label: "Team",  description: "Командний",     icon: "👥" },
      ]}
   />
</div>
```

---

## Як працює

- **HTML**: список опцій рендериться в Astro (SSR)
- **Hidden select**: справжній `<select>` прихований — передає значення у форму і інтегрується з `FormValidator`
- **Пошук**: фільтрує по тексту опції прямо в DOM
- **Анімація дропдауну**: `visibility + opacity + transform` — плавне відкриття/закриття
- **Групи**: якщо `enableGroupSelection` — клік на заголовок групи вибирає всі опції в ній

---

## VS Code сніпети

| Prefix | Що розгортає |
| ------ | ------------ |
| `fselect` | Базовий `CustomSelect` з опціями |
| `fselectmulti` | `CustomSelect` з множинним вибором і тегами |
| `fselectgroup` | `CustomSelect` з групами опцій |
