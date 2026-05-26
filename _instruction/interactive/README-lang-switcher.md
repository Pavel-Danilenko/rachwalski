# LanguageSwitcher — перемикач мов

Мінімальний, гнучкий компонент перемикання мов. Відкриває дропдаун по кліку.  
Без зовнішніх залежностей — підходить для будь-якого проекту.

```
src/
├── components/ui/LanguageSwitcher.astro   — компонент (HTML + JS)
└── styles/components/ui/_lang-switcher.scss — базові стилі
```

---

## Підключення

```astro
import LanguageSwitcher from "@components/ui/LanguageSwitcher.astro";
```

---

## Мінімальний приклад

```astro
<LanguageSwitcher
  languages={[
    { code: "EN", label: "English",  href: "#",    active: true },
    { code: "FR", label: "Français", href: "/fr/" },
  ]}
/>
```

---

## Props

| Prop | Тип | Обов'язково | Опис |
|---|---|---|---|
| `languages` | `Language[]` | ✅ | Масив мов |
| `class` | `string` | — | Додатковий CSS-клас |

### Об'єкт `Language`

| Поле | Тип | Обов'язково | Опис |
|---|---|---|---|
| `code` | `string` | ✅ | Короткий код у тригері: `"EN"`, `"FR"` |
| `label` | `string` | ✅ | Повна назва у дропдауні: `"English"` |
| `href` | `string` | ✅ | URL мовної версії або `"#"` як заглушка |
| `active` | `boolean` | — | Поточна активна мова |

---

## Варіанти посилань

### Заглушка (поки немає перекладу)

```astro
{ code: "FR", label: "Français", href: "#" }
```

### URL-prefix (Astro i18n або WP)

```astro
{ code: "EN", label: "English",  href: "/en/" }
{ code: "FR", label: "Français", href: "/fr/" }
```

### Query param

```astro
{ code: "EN", label: "English",  href: "?lang=en" }
{ code: "FR", label: "Français", href: "?lang=fr" }
```

---

## Кастомізація CSS-змінними

Встав змінні у батьківський елемент або `:root`:

```scss
.header {
  --lang-trigger-color:   #fff;        // колір тексту тригера
  --lang-trigger-hover:   #fff;        // колір при hover
  --lang-dropdown-bg:     #1a1a1a;     // фон дропдауну
  --lang-dropdown-radius: 8px;         // радіус кутів
  --lang-option-hover-bg: #2a2a2a;     // фон пункту при hover
}
```

---

## HTML-атрибути (для стилізації)

| Атрибут / клас | Де | Опис |
|---|---|---|
| `.is-open` | `.lang-switcher` | дропдаун відкрито |
| `.is-active` | `.lang-switcher__option` | поточна мова |
| `aria-expanded` | тригер | `true` / `false` |

---

## Поведінка

- Клік на тригер → відкрити / закрити дропдаун
- Клік поза компонентом → закрити
- `Escape` → закрити
- Активна мова (`active: true`) не відображається у дропдауні
- Підтримує Barba.js / Astro transitions (`page:ready`)
- Захист від подвійної ініціалізації (`data-lang-init`)
