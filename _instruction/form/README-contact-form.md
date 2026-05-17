# ContactForm

Компонент форми з вбудованою валідацією, автоформатуванням телефону, автокорекцією email та двома режимами відображення результату.

```
src/
├── components/forms/
│   ├── ContactForm.astro       — обгортка <form>
│   ├── CustomSelect.astro      — кастомний селект
│   ├── CustomCheckbox.astro    — кастомний чекбокс
│   ├── CustomRadio.astro       — кастомні радіокнопки
│   ├── CustomFileInput.astro   — поле завантаження файлу
│   ├── CustomDatePicker.astro  — вибір дати
│   └── CustomSwitch.astro      — перемикач
├── scripts/init/
│   ├── contact-form.js         — відправка + показ результату
│   └── form-validation.js      — клас FormValidator
└── styles/components/forms/
    └── _contact-form.scss      — стилі форми, станів, modal
```

---

## Підключення

```astro
---
import ContactForm from "@components/forms/ContactForm.astro";
import CustomSelect from "@components/forms/CustomSelect.astro";
---

<ContactForm recipientEmail="you@gmail.com">
   <!-- поля через slot -->
</ContactForm>
```

> Скрипт `contact-form.js` та стилі підключаються **автоматично** всередині компонента — зовні нічого не імпортувати.

---

## Пропси ContactForm

| Prop                | Тип                    | Default                  | Опис                                        |
| ------------------- | ---------------------- | ------------------------ | ------------------------------------------- |
| `backend`           | `"php" \| "api"`       | `"php"`                  | Метод відправки                             |
| `action`            | `string`               | —                        | Свій URL (замінює дефолтний)                |
| `formKey`           | `string`               | —                        | Ключ форми — сервер знаходить email з env/config (безпечно) |
| `recipientEmail`    | `string`               | —                        | Прямий email — видно в HTML, лише якщо formKey не вказаний  |
| `recipientName`     | `string`               | —                        | Ім'я отримувача                             |
| `senderName`        | `string`               | —                        | Підпис відправника в листі                  |
| `method`            | `"POST" \| "GET"`      | `"POST"`                 | Метод форми                                 |
| `formId`            | `string`               | `"contact-form"`         | ID форми                                    |
| `successMessage`    | `string`               | `"Дякуємо!..."`          | Повідомлення після успіху                   |
| `errorMessage`      | `string`               | `"Помилка відправки..."` | Повідомлення при помилці                    |
| `modalType`         | `"inline" \| "modal"`  | `"inline"`               | Де показувати результат                     |
| `autoCloseDuration` | `number`               | `50`                     | Секунди автозакриття modal (0 = вимкнено)   |
| `successIcon`       | `string`               | `"check-circle"`         | ID іконки зі sprite (успіх)                 |
| `errorIcon`         | `string`               | `"x-circle"`             | ID іконки зі sprite (помилка)               |
| `successImage`      | `string`               | —                        | URL картинки для успіху (пріоритет над icon)|
| `errorImage`        | `string`               | —                        | URL картинки для помилки                    |
| `lockScroll`        | `boolean`              | `false`                  | Блокувати скрол при відкритті modal         |

---

## Методи відправки

### 1. PHP (`backend="php"`)

Форма відправляє на `/api/send-email.php` — PHP-скрипт з PHPMailer. Підходить для будь-якого хостингу з PHP 7.4+, а також для WordPress.

```astro
<ContactForm
   backend="php"
   recipientEmail="you@gmail.com"
   successMessage="Листа надіслано!"
>
   <!-- поля -->
</ContactForm>
```

#### Як це працює

1. JS збирає дані форми → `fetch POST` на `/api/send-email.php`
2. PHP читає налаштування з `mail.config.php`
3. PHPMailer відправляє лист через SMTP
4. PHP повертає `{ success: true/false }` → JS показує результат

#### Файли

```
public/api/
├── send-email.php            — обробник (не чіпаємо)
├── mail.config.php           — твої налаштування (не в git)
└── mail.config.example.php   — шаблон конфігу
vendor/                       — PHPMailer (встановлюється один раз)
```

---

#### Крок 1 — встановити PHPMailer (один раз)

```bash
composer require phpmailer/phpmailer
```

---

#### Крок 2 — створити конфіг

Скопіюй шаблон:
```bash
cp public/api/mail.config.example.php public/api/mail.config.php
```

Відкрий `public/api/mail.config.php`. Побачиш такий вміст:

```php
'smtp_host' => 'localhost',   // ← адреса SMTP сервера
'smtp_port' => 1025,          // ← порт
'smtp_user' => '',            // ← логін (email на хостингу)
'smtp_pass' => '',            // ← пароль
```

**Для локального тесту** — нічого не змінюй, файл вже налаштований на Mailhog.

**Для продакшну** — заміни значення на дані свого хостингу:
```php
'smtp_host' => 'smtp.gmail.com',          // ← свій SMTP сервер
'smtp_port' => 587,                        // ← свій порт
'smtp_user' => 'noreply@yourdomain.com',   // ← свій email
'smtp_pass' => 'your-password',            // ← свій пароль
```

> Де взяти ці дані — дивись розділ **SMTP дані для популярних сервісів** нижче.

---

#### Крок 3 — локальне тестування (Mailhog)

Mailhog — fake SMTP сервер: листи перехоплюються і видно в браузері, нікуди не йдуть.

```bash
brew install mailhog   # один раз
```

Запустити 3 термінали:

| # | Команда | Посилання |
|---|---------|-----------|
| 1 | `mailhog` | `http://localhost:8025` — перегляд листів |
| 2 | `cd public/api && php -S localhost:8888` | PHP сервер |
| 3 | `npm run dev` | `http://localhost:4321` — сайт |

В компоненті тимчасово вкажи `action`:
```astro
<ContactForm
   backend="php"
   action="http://localhost:8888/send-email.php"
   recipientEmail="test@example.com"
>
```

Відправ форму → перевір листи на `http://localhost:8025`.

> Перед деплоєм — прибери `action` з компонента.

---

#### Крок 4 — деплой на хостинг

```bash
npm run build
```

Завантажити на хостинг (FTP/SSH):

| Що | Куди |
|----|------|
| Вміст `dist/` | `public_html/` |
| `public/api/send-email.php` | `public_html/api/` |
| `public/api/mail.config.php` | `public_html/api/` |
| Папка `vendor/` | `public_html/vendor/` |

Перевірка: відкрий `https://yourdomain.com/api/send-email.php` — має повернути `{"success":false,"message":"Дозволений тільки POST метод"}`.

---

#### SMTP дані для популярних сервісів

**cPanel (Hostinger, Bluehost тощо)** — Email Accounts → Configure Email Client:
```php
'smtp_host' => 'mail.yourdomain.com',
'smtp_port' => 587,
'smtp_user' => 'noreply@yourdomain.com',
'smtp_pass' => 'пароль поштової скриньки',
```

**Gmail** — спочатку [створи App Password](https://myaccount.google.com/apppasswords) (потрібна 2FA):
```php
'smtp_host' => 'smtp.gmail.com',
'smtp_port' => 587,
'smtp_user' => 'твій@gmail.com',
'smtp_pass' => 'app password (16 символів)',
```

---

#### Troubleshooting

| Проблема | Рішення |
|----------|---------|
| `mail.config.php not found` | Скопіюй `mail.config.example.php → mail.config.php` |
| Лист не приходить в Mailhog | Перевір що `smtp_host = localhost`, `smtp_port = 1025` в конфігу |
| "Class 'PHPMailer' not found" | Папка `vendor/` не завантажена на хостинг |
| Листи не приходять на продакшні | Перевір SMTP дані, папку spam, спробуй `smtp_port = 465` |
| Лист потрапляє в спам | `from_email` має збігатись з `smtp_user` |

---

### 2. API / Node.js (`backend="api"`)

Форма відправляє на `/api/contact` — Astro SSR endpoint з nodemailer + Gmail SMTP.

```astro
<ContactForm
   backend="api"
   formKey="contact"
   successMessage="Листа надіслано!"
>
   <!-- поля -->
</ContactForm>
```

**`.env`** — додай email для кожного ключа:
```env
FORM_CONTACT=contact@gmail.com
FORM_SALES=sales@company.com
FORM_SUPPORT=support@company.com

# Fallback якщо formKey не вказаний
CONTACT_EMAIL=your-email@gmail.com
```

> Email зберігається тільки на сервері — в HTML не потрапляє.

**Налаштування `.env`:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=recipient@gmail.com
```

> `CONTACT_EMAIL` — fallback якщо `recipientEmail` не переданий через props.  
> Для Gmail: [створити App Password](https://myaccount.google.com/apppasswords) (потрібна двофакторна автентифікація).  
> Endpoint знаходиться: `src/pages/api/contact.ts`

---

## Валідація

Валідатор працює **автоматично** при підключенні `ContactForm`. Він ініціалізується для будь-якої форми з атрибутом `data-success-message`.

### Обов'язкова структура

Кожне поле **повинне** бути в `.form-group` — без нього валідатор ігнорує поле:

```html
<div class="form-group">
   <input type="text" name="name" required data-error-required="Введіть ім'я" />
</div>
```

Валідатор автоматично додає `<span class="error-message">` всередину `.form-group`.

---

### Атрибути валідації

| Атрибут                  | Де використовувати        | Опис                                    |
| ------------------------ | ------------------------- | --------------------------------------- |
| `required`               | будь-яке поле             | Обов'язкове поле                        |
| `data-error-required`    | будь-яке поле             | Текст помилки якщо порожнє              |
| `type="email"`           | input                     | Автоматична валідація email             |
| `data-error-email`       | input[type=email]         | Текст помилки невірного формату         |
| `data-hint-corrected`    | input[type=email]         | Підказка при автокорекції (`{domain}`)  |
| `data-phone`             | input[type=tel]           | Автоформатування + валідація телефону   |
| `data-error-phone`       | input[type=tel]           | Текст помилки невірного телефону        |
| `data-min-length="N"`    | input, textarea           | Мінімальна кількість символів           |
| `data-max-length="N"`    | input, textarea           | Максимальна кількість символів          |
| `data-error-min-length`  | input, textarea           | Текст помилки                           |
| `data-error-max-length`  | input, textarea           | Текст помилки                           |
| `data-min-words="N"`     | textarea                  | Мінімальна кількість слів               |
| `data-error-min-words`   | textarea                  | Текст помилки                           |
| `data-pattern="regex"`   | input                     | Кастомний регулярний вираз              |
| `data-error-pattern`     | input                     | Текст помилки                           |
| `data-error-spam`        | textarea                  | Перевірка на спам (авто для textarea)   |
| `min` / `max`            | input[type=number/date]   | Мінімум / максимум                      |
| `data-error-min`         | input[type=number]        | Текст помилки                           |
| `data-error-max`         | input[type=number]        | Текст помилки                           |
| `data-error-min-date`    | input[type=date]          | Текст помилки                           |
| `data-error-max-date`    | input[type=date]          | Текст помилки                           |
| `data-max-size="N"`      | input[type=file]          | Максимальний розмір файлу (МБ)          |
| `data-error-file-size`   | input[type=file]          | Текст помилки розміру                   |
| `data-error-file-type`   | input[type=file]          | Текст помилки типу файлу                |

### CSS-стани (додаються автоматично на `.form-group`)

```scss
.form-group.error   { /* поле не пройшло валідацію */ }
.form-group.success { /* поле валідне */ }

.error-message { /* текст помилки під полем */ }
.hint-message  { /* підказка автокорекції email */ }
```

---

## Режими відображення результату

### inline (за замовчуванням)

Повідомлення з'являється під формою:

```astro
<ContactForm modalType="inline" successMessage="Дякуємо!">
   <!-- поля -->
   <!-- .form-message додається автоматично -->
</ContactForm>
```

### modal

Спливаюче вікно на весь екран:

```astro
<ContactForm
   modalType="modal"
   successMessage="Ваш запит прийнято!"
   autoCloseDuration={5}
   lockScroll={true}
>
   <!-- поля -->
</ContactForm>
```

---

## VS Code сніпети

Файл: `.vscode/astro.code-snippets`

| Prefix     | Що розгортає                                              |
| ---------- | --------------------------------------------------------- |
| `cform`    | Повна форма з усіма базовими полями (ім'я, email, тел, селект, textarea) |
| `fgroup`   | Одне поле `input` в `.form-group` з атрибутами валідації  |
| `fgroupta` | `textarea` в `.form-group` з валідацією                   |

**Як використовувати:**

1. Відкрий `.astro` файл
2. Введи префікс (`cform`, `fgroup`, `fgroupta`)
3. Натисни `Tab` — розгорнеться сніпет з курсорами по полях

> Сніпет `cform` має вибір через `Tab`: `backend` (api/php), `modalType` (inline/modal) та плейсхолдери для всіх текстів.

---

## Сніпет — базова форма

Готова структура для швидкого старту. Скопіюй і підставляй:

```astro
---
import ContactForm from "@components/forms/ContactForm.astro";
import CustomSelect from "@components/forms/CustomSelect.astro";
---

<ContactForm
   backend="api"
   formKey="contact"
   successMessage="Дякуємо! Ми зв'яжемося з вами найближчим часом."
   errorMessage="Помилка відправки. Спробуйте ще раз."
   modalType="inline"
>
   <div class="form-fields">

      <!-- Ім'я -->
      <div class="form-group">
         <input
            type="text"
            name="name"
            placeholder="Ваше ім'я"
            required
            data-error-required="Введіть ваше ім'я"
            data-min-length="2"
            data-error-min-length="Ім'я занадто коротке"
         />
      </div>

      <!-- Email -->
      <div class="form-group">
         <input
            type="email"
            name="email"
            placeholder="email@example.com"
            required
            data-error-required="Введіть email"
            data-error-email="Невірний формат email"
            data-hint-corrected="Виправлено на {domain}"
         />
      </div>

      <!-- Телефон -->
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

      <!-- Селект -->
      <div class="form-group">
         <CustomSelect
            name="service"
            placeholder="Оберіть послугу"
            required
            errorRequired="Оберіть послугу"
            options={[
               { value: "web", label: "Веб-розробка" },
               { value: "design", label: "Дизайн" },
               { value: "seo", label: "SEO" },
            ]}
         />
      </div>

      <!-- Повідомлення -->
      <div class="form-group">
         <textarea
            name="message"
            placeholder="Ваше повідомлення"
            rows="4"
            required
            data-error-required="Напишіть повідомлення"
            data-min-words="3"
            data-error-min-words="Мінімум 3 слова"
            data-error-spam="Схоже на спам"
         ></textarea>
      </div>

      <button type="submit">Надіслати</button>

   </div>
</ContactForm>
```
