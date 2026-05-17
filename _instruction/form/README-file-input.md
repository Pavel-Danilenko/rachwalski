# CustomFileInput

Поле завантаження файлів з drag & drop, прев'ю зображень, списком файлів, accordion і інтеграцією з FormValidator.

```
src/
├── components/forms/CustomFileInput.astro          — компонент
├── scripts/init/custom-file-input.js               — логіка
└── styles/components/forms/_custom-file-input.scss — стилі
```

---

## Підключення

```astro
---
import CustomFileInput from "@components/forms/CustomFileInput.astro";
---

<div class="form-group">
   <CustomFileInput
      name="files"
      accept=".jpg,.png,.pdf"
      maxSize={5}
      errorRequired="Додайте файл"
      errorFileSize="Файл перевищує 5 МБ"
      errorFileType="Непідтримуваний формат"
   />
</div>
```

> Скрипт і стилі підключаються **автоматично** всередині компонента.

---

## Пропси

### Основні

| Prop       | Тип       | Default | Опис                                     |
| ---------- | --------- | ------- | ---------------------------------------- |
| `name`     | `string`  | —       | Атрибут `name` для форми                 |
| `accept`   | `string`  | —       | Дозволені типи файлів (`.jpg,.png,.pdf`) |
| `multiple` | `boolean` | `false` | Дозволити декілька файлів                |
| `maxSize`  | `number`  | —       | Максимальний розмір в МБ                 |
| `maxFiles` | `number`  | —       | Максимальна кількість файлів             |
| `required` | `boolean` | `false` | Обов'язкове поле                         |

### Відображення

| Prop                    | Тип       | Default | Опис                                 |
| ----------------------- | --------- | ------- | ------------------------------------ |
| `compact`               | `boolean` | `false` | Компактний режим кнопки              |
| `showFileList`          | `boolean` | `true`  | Показувати список файлів             |
| `showPreview`           | `boolean` | `true`  | Прев'ю зображень                     |
| `showFileListAccordion` | `boolean` | `true`  | Список у accordion                   |
| `accordionDefaultOpen`  | `boolean` | `false` | Accordion відкритий за замовчуванням |
| `showRemoveAll`         | `boolean` | `true`  | Кнопка "Видалити всі"                |
| `showButtonCounter`     | `boolean` | `true`  | Лічильник файлів на кнопці           |
| `showProgress`          | `boolean` | `false` | Прогрес-бар завантаження             |
| `showDropZone`          | `boolean` | `true`  | Overlay при перетягуванні            |
| `showClearButton`       | `boolean` | `false` | Кнопка очищення під кнопкою          |
| `showMaxFilesHint`      | `boolean` | `true`  | Підказка про ліміт файлів            |
| `showTotalSize`         | `boolean` | `true`  | Загальний розмір файлів              |
| `showFileTypeBadges`    | `boolean` | `true`  | Бейджі типу файлу (PDF, IMG…)        |
| `enableSort`            | `boolean` | `false` | Сортування списку                    |
| `compactList`           | `boolean` | `false` | Компактний список файлів             |

### i18n тексти

| Prop                  | Default                         |
| --------------------- | ------------------------------- |
| `buttonText`          | `"Додати файл"`                 |
| `buttonTextWithFiles` | `"Додати ще ({count}/{max})"`   |
| `dragText`            | `"Або перетягніть файл сюди"`   |
| `dropZoneText`        | `"Відпустіть файли тут"`        |
| `fileListText`        | `"Обрані файли:"`               |
| `fileListButtonText`  | `"Переглянути файли ({count})"` |
| `removeFileText`      | `"Видалити"`                    |
| `removeAllText`       | `"Видалити всі"`                |
| `emptyStateText`      | `"Файлів поки немає"`           |
| `totalSizeText`       | `"Загальний розмір: {size}"`    |
| `sortByNameText`      | `"За назвою"`                   |
| `sortBySizeText`      | `"За розміром"`                 |
| `sortByTypeText`      | `"За типом"`                    |

### Валідація

```astro
<CustomFileInput
   name="files"
   required
   errorRequired="Додайте файл"
   errorFileSize="Файл перевищує ліміт"
   errorFileType="Непідтримуваний формат"
   errorMaxFiles="Забагато файлів"
/>
```

---

## Приклади

**Базовий (один файл):**

```astro
<div class="form-group">
   <CustomFileInput
      name="avatar"
      accept="image/*"
      maxSize={2}
      required
      errorRequired="Завантажте фото"
      errorFileSize="Фото має бути менше 2 МБ"
      errorFileType="Тільки зображення"
   />
</div>
```

**Кілька файлів з лімітом:**

```astro
<div class="form-group">
   <CustomFileInput
      name="docs"
      multiple
      accept=".pdf,.doc,.docx"
      maxSize={10}
      maxFiles={5}
      buttonText="Додати документи"
      dragText="або перетягніть сюди"
      fileListButtonText="Документи ({count})"
      errorFileSize="Файл більше 10 МБ"
      errorFileType="Тільки PDF або DOC"
      errorMaxFiles="Максимум 5 файлів"
   />
</div>
```

**Компактний режим без accordion:**

```astro
<div class="form-group">
   <CustomFileInput
      name="attachment"
      compact
      showFileListAccordion={false}
      showTotalSize={false}
      accept="image/*,.pdf"
      maxSize={5}
      buttonText="Upload file "
   />
</div>
```

**З сортуванням і прогресом:**

```astro
<div class="form-group">
   <CustomFileInput
      name="files"
      multiple
      enableSort
      showProgress
      accordionDefaultOpen
      sortByNameText="За назвою"
      sortBySizeText="За розміром"
      sortByTypeText="За типом"
   />
</div>
```

---

## Як працює

- **Drag & drop**: при перетягуванні показується кольоровий overlay, файли додаються при відпусканні
- **Прев'ю**: зображення відображаються мініатюрами (FileReader API), для інших файлів — іконки
- **Skeleton loader**: показується поки завантажується прев'ю зображення
- **Бейджі**: автоматично визначає тип (IMG, PDF, DOC, XLS, ZIP) і колір бейджа
- **Template**: `createFileItem` клонує HTML з `<template>` тега замість `createElement` — швидше і чистіше
- **Валідація**: інтегровано з `FormValidator` через `data-error-*` атрибути на прихованому `<input type="file">`
- **Стани**: `--dragover`, `--uploading`, `--success` — CSS класи для різних станів

---

## VS Code сніпет

| Prefix       | Що розгортає                                   |
| ------------ | ---------------------------------------------- |
| `ffile`      | `CustomFileInput` базовий з основними пропсами |
| `ffilemulti` | `CustomFileInput` для кількох файлів з лімітом |
