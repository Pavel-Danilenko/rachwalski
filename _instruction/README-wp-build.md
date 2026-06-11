# WordPress export (build-wp)

Окремий білд для ручного перенесення сторінок на WordPress/PHP, поки основний Astro-сайт продовжує розвиватись.

```bash
npm run build-wp
```

Результат — папка **`dist-wp/`** (в git не потрапляє).

---

## Що робить `build-wp`

1. `BUILD_MODE=wp` → `astro.config.mjs`:
   - `output: "static"` — **без Node-сервера**, тільки статичні HTML/CSS/JS файли (`output`/adapter логіка в `astro.config.mjs`)
   - JS/CSS **не мінімізуються**, але коментарі видаляються:
     - CSS — інлайн postcss-плагін `stripCssComments` (`astro.config.mjs`)
     - JS — `esbuild.legalComments: "none"`
   - HTML **не стискається** (`@playform/compress` з `collapseWhitespace: false`, `preserveLineBreaks: true`)
   - Хеші у назвах JS-чанків (`js/[name]-[hash].js`) — захист від колізій імен модулів
2. Видаляються `*.png/*.jpeg/*.jpg` з `dist-wp` (залишаються тільки оптимізовані `.webp/.avif` з `_astro/`)
3. `js-beautify --type html --indent-size 3 --replace` — робить HTML читабельним (з відступами), а не однією стиснутою лінією

---

## Сторінки, що йдуть в WP

Сторінка має бути **prerendered** (`export const prerender = true;` у фронтматері), щоб згенерувався статичний `index.html`.

Приклад: `src/pages/coming-soon.astro`.

> Готовий статичний `dist-wp/coming-soon/index.html` з читабельним HTML, окремими `/css/...` і `/js/...` файлами — береш розмітку і вручну переносиш у PHP-шаблон.

---

## Домен і SEO

- **`.env` → `PUBLIC_SITE_URL=https://rachwalski.surgery/`** — використовується для `canonical`, `og:url`, sitemap
- **`public/robots.txt`** — статичний файл, **не генерується автоматично**, домен в `Sitemap:` треба міняти вручну при зміні домену
- **`astro.config.mjs` → `sitemap({ filter: ... })`** — виключає з sitemap службові сторінки (`/secret/...`, `/alphabet`)
- **`noindex`** — проп `<BaseLayout noindex>` додає `<meta name="robots" content="noindex, nofollow">` і автоматично прибирає сторінку з sitemap (приклад: `src/pages/alphabet.astro`)

---

## Email-форми на WordPress

Контактні форми (`backend="php"`, `/api/send-email.php`) **вже готові** для WP-адмінки — нічого писати не треба, лише підключити:

1. На WP-сайті в `functions.php` теми додати:
   ```php
   require_once get_template_directory() . '/api/mail-settings.wp.php';
   ```
2. У WP Адмінці з'явиться **Параметри → Mail Settings** — клієнт сам міняє SMTP, email-відправника та email-отримувачів форм (Book / Contact / Newsletter), без правок коду.
3. `mail.config.php` автоматично визначає WP (шукає `wp-load.php`) і бере значення з `get_option()` замість хардкоду.

Детальніше і повний список файлів для деплою (`send-email.php`, `mail.config.php`, `mail.config.example.php`, `vendor/`) — у [`_instruction/form/README-contact-form.md`](form/README-contact-form.md), розділ "WordPress".

---

## Чеклист при деплої нової партії сторінок на WP

- [ ] `export const prerender = true;` на сторінці
- [ ] `npm run build-wp`
- [ ] перевірити `dist-wp/<page>/index.html`, `/css/`, `/js/` — все відкривається без 404 (`npx http-server dist-wp -p 4323 -c-1 -s`)
- [ ] перенести розмітку/стилі вручну в PHP-шаблон теми
- [ ] якщо сторінка службова/тестова — додати `noindex` і виключити з sitemap-фільтра

---

## Поступове портування сторінок (асет-пул)

`build-wp` щоразу перегенеровує `dist-wp/` повністю, але це **локальний експорт** — сам WP-сайт він не чіпає.

CSS/JS файли мають у назві **хеш вмісту** (`BaseLayout-D0wYcr9r.js`). Якщо файл не змінювався між білдами — назва та сама. Змінюється назва тільки в тих файлах, код яких реально змінили.

### Правило

На WP створи спільну папку для асетів (наприклад `/wp-content/themes/<тема>/assets-astro/css|js|_astro`).

При портуванні кожної нової сторінки:
1. `npm run build-wp`
2. перенести `index.html` сторінки в PHP-шаблон
3. докинути в `assets-astro/` **тільки нові/змінені** css/js файли, які вона використовує
4. **ніколи не видаляти** старі файли з `assets-astro/` при заливці нових — тільки додавати (без `rsync --delete`)

Завдяки контент-хешам файли, що не змінились, матимуть ту саму назву (нічого не дублюється), а вже портовані сторінки продовжать працювати зі своїми старими файлами.

### Видалення сторінки-заглушки (наприклад `coming-soon`)

Коли заглушка більше не потрібна:

- **видалити:** шаблон/маршрут сторінки в WP + файли, специфічні тільки для неї:
  - `css/coming-soon.css`
  - `js/ComingSoon-*.js`
- **не чіпати** (спільні файли, використовуються іншими сторінками):
  - `css/alphabet-2.css`
  - `js/BaseLayout...`, `js/Logo...`, `js/Icon...`, `js/Popups...`, `js/ContactForm...`, `js/CustomSelect...`, `js/CustomFileInput...`, `js/CustomPhoneInput...`, `js/Preloader...`

Орієнтир: файл з назвою сторінки — можна видаляти, решта — спільне, лишається.
