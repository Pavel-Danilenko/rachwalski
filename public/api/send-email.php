<?php
/**
 * ========================================
 * CONTACT FORM EMAIL HANDLER (with PHPMailer)
 * ========================================
 */

/**
 * ========================================
 * 📧 CONTACT FORM EMAIL HANDLER (PHP + PHPMailer)
 * ========================================
 *
 * Обробляє відправку контактних форм через PHP
 * Працює на будь-якому хостингу з PHP 7.4+
 * Автоматично збирає всі поля з форми
 *
 * ========================================
 * 🧪 ТЕСТУВАННЯ ЛОКАЛЬНО (з Mailhog)
 * ========================================
 *
 * Mailhog - це fake SMTP сервер для перегляду email без реальної відправки.
 * Всі "відправлені" листи можна побачити в браузері.
 *
 * КРОК 1: Встановлення залежностей
 * --------------------------------
 *
 * 1.1. Встанови Homebrew (якщо немає):
 *      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
 *
 * 1.2. Встанови Mailhog:
 *      brew install mailhog
 *
 * 1.3. Встанови Composer (якщо немає):
 *      brew install composer
 *
 * 1.4. Встанови PHPMailer (в корені проекту):
 *      cd ~/Documents/job/DanylenkoTemplateStart
 *      composer require phpmailer/phpmailer
 *
 *      Це створить папку vendor/ з бібліотеками
 *
 *
 * КРОК 2: Запуск Mailhog (Terminal 1)
 * ------------------------------------
 *
 * Відкрий Terminal і запусти:
 *      mailhog
 *
 * Побачиш:
 *      [SMTP] Binding to address: 0.0.0.0:1025
 *      [HTTP] Binding to address: 0.0.0.0:8025
 *
 * Тепер Mailhog працює! Не закривай цей Terminal.
 *
 * Відкрий в браузері для перегляду листів:
 *      http://localhost:8025
 *
 *
 * КРОК 3: Запуск PHP сервера (Terminal 2 - НОВИЙ!)
 * -------------------------------------------------
 *
 * Відкрий НОВИЙ Terminal (не закривай перший!)
 *
 * 3.1. Перейди в корінь проекту:
 *      cd ~/Documents/job/DanylenkoTemplateStart
 *
 * 3.2. Перевір де ти (має показати шлях до проекту):
 *      pwd
 *
 *      Очікуваний вивід:
 *      /Users/твоє-ім'я/Documents/job/DanylenkoTemplateStart
 *
 * 3.3. Перейди в папку де лежить send-email.php:
 *      cd public/api
 *
 * 3.4. Перевір що файл тут є:
 *      ls
 *
 *      Має показати:
 *      send-email.php
 *
 * 3.5. Перевір де ти зараз (повинен бути в public/api):
 *      pwd
 *
 *      Має показати:
 *      /Users/твоє-ім'я/Documents/job/DanylenkoTemplateStart/public/api
 *
 * 3.6. ТЕПЕР запусти PHP сервер:
 *      php -S localhost:8888
 *
 *      Побачиш:
 *      [Thu Jan 29 10:00:00 2026] PHP 8.x.x Development Server (http://localhost:8888) started
 *
 * 3.7. Перевір що сервер працює - відкрий в браузері:
 *      http://localhost:8888/send-email.php
 *
 *      Має показати JSON помилку (це нормально!):
 *      {"success":false,"message":"Дозволений тільки POST метод"}
 *
 * ✅ Якщо бачиш JSON - все працює правильно!
 * ❌ Якщо "Not Found" - ти запустив PHP сервер не в тій папці, повтори крок 3.
 *
 *
 * КРОК 4: Запуск Astro (Terminal 3 - НОВИЙ!)
 * -------------------------------------------
 *
 * Відкрий ще один НОВИЙ Terminal (тепер їх буде 3!)
 *
 * 4.1. Перейди в корінь проекту:
 *      cd ~/Documents/job/DanylenkoTemplateStart
 *
 * 4.2. Запусти Astro:
 *      npm run dev
 *
 *      Астро запуститься на:
 *      http://localhost:4321
 *
 *
 * КРОК 5: Налаштування форми для тестування
 * ------------------------------------------
 *
 * В твоєму .astro файлі з формою додай:
 *
 *      <ContactForm
 *         backend="php"
 *         action="http://localhost:8888/send-email.php"
 *         recipientEmail="test@example.com"
 *         successMessage="Дякуємо!"
 *         errorMessage="Помилка"
 *      >
 *         <input name="name" required />
 *         <input name="email" required />
 *         <button type="submit">Відправити</button>
 *      </ContactForm>
 *
 * ⚠️ ВАЖЛИВО: action="http://localhost:8888/send-email.php" - тільки для локального тестування!
 *
 *
 * КРОК 6: Тестування
 * ------------------
 *
 * Тепер у тебе працюють ТРИ сервіси:
 *
 * Terminal 1: Mailhog        → http://localhost:8025  (перегляд листів)
 * Terminal 2: PHP сервер     → http://localhost:8888
 * Terminal 3: Astro          → http://localhost:4321  (твій сайт)
 *
 * 6.1. Відкрий свій сайт:
 *      http://localhost:4321
 *
 * 6.2. Заповни форму і натисни "Відправити"
 *
 * 6.3. Перевір email в Mailhog:
 *      http://localhost:8025
 *
 * ✅ Якщо лист з'явився - все працює!
 *
 *
 * КРОК 7: Зупинка серверів
 * ------------------------
 *
 * Коли закінчив тестування:
 *
 * - В Terminal 1 (Mailhog): Ctrl + C
 * - В Terminal 2 (PHP): Ctrl + C
 * - В Terminal 3 (Astro): Ctrl + C
 *
 *
 * ========================================
 * 🚀 ДЕПЛОЙ НА ПРОДАКШН (реальний хостинг)
 * ========================================
 *
 * КРОК 1: Підготовка файлів
 * --------------------------
 *
 * 1.1. Видали action з форми в .astro файлі:
 *
 *      БУЛО:
 *      <ContactForm
 *         backend="php"
 *         action="http://localhost:8888/send-email.php"  ❌ ВИДАЛИ ЦЕЙ РЯДОК
 *      >
 *
 *      СТАЛО:
 *      <ContactForm
 *         backend="php"
 *         recipientEmail="твій-реальний-email@gmail.com"
 *      >
 *
 * 1.2. Оновлення SMTP налаштувань в send-email.php:
 *
 *      Знайди в цьому файлі (приблизно рядок 200):
 *
 *      // ЗАКОМЕНТУЙ ЦІ РЯДКИ (для Mailhog):
 *      // $mailer->Host = 'localhost';
 *      // $mailer->Port = 1025;
 *      // $mailer->SMTPAuth = false;
 *      // $mailer->SMTPAutoTLS = false;
 *
 *      // РОЗКОМЕНТУЙ ЦІ РЯДКИ (для реального хостингу):
 *      $mailer->Host = 'smtp.yourdomain.com';     // SMTP сервер хостингу
 *      $mailer->Port = 587;                        // Або 465 для SSL
 *      $mailer->SMTPAuth = true;
 *      $mailer->Username = 'noreply@yourdomain.com';  // Email хостингу
 *      $mailer->Password = 'твій-пароль';              // Пароль від email
 *      $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Або SMTPS для 465
 *
 *      ⚠️ Дані SMTP береш у свого хостинг-провайдера (cPanel, Plesk тощо)
 *
 * 1.3. Зміни відправника:
 *
 *      БУЛО:
 *      $mailer->setFrom('noreply@example.com', $sender_name);
 *
 *      СТАЛО (використай email з хостингу):
 *      $mailer->setFrom('noreply@yourdomain.com', $sender_name);
 *
 *
 * КРОК 2: Білд проекту
 * --------------------
 *
 * 2.1. Зроби білд Astro:
 *      npm run build
 *
 *      Це створить папку dist/ з готовим сайтом
 *
 *
 * КРОК 3: Завантаження на хостинг
 * --------------------------------
 *
 * 3.1. Структура файлів на хостингу:
 *
 *      public_html/                      (або www/, httpdocs/)
 *      ├── index.html                    ← З dist/
 *      ├── _astro/                       ← З dist/
 *      │   ├── main.css
 *      │   └── main.js
 *      ├── api/
 *      │   └── send-email.php            ← Цей файл
 *      └── vendor/                       ← Папка з Composer
 *          ├── autoload.php
 *          └── phpmailer/
 *
 * 3.2. Що завантажувати через FTP/SSH:
 *
 *      a) Весь вміст папки dist/ → в public_html/
 *      b) Файл send-email.php → в public_html/api/
 *      c) Папку vendor/ → в public_html/vendor/
 *
 * ⚠️ ВАЖЛИВО: Якщо на хостингу немає Composer:
 *
 *    - Завантаж папку vendor/ з локального проекту
 *    - АБО встанови Composer на хостингу через SSH:
 *      ssh user@yourdomain.com
 *      cd public_html
 *      composer require phpmailer/phpmailer
 *
 *
 * КРОК 4: Перевірка на хостингу
 * ------------------------------
 *
 * 4.1. Перевір що PHP файл доступний:
 *      https://yourdomain.com/api/send-email.php
 *
 *      Має показати:
 *      {"success":false,"message":"Дозволений тільки POST метод"}
 *
 * 4.2. Відкрий свій сайт:
 *      https://yourdomain.com
 *
 * 4.3. Заповни форму і відправ
 *
 * 4.4. Перевір чи прийшов лист на твій реальний email
 *
 * ✅ Якщо лист прийшов - все працює!
 *
 *
 * КРОК 5: Налаштування SMTP (популярні хостинги)
 * -----------------------------------------------
 *
 * ➤ cPanel (Hostinger, Bluehost, etc.):
 *   - Email Accounts → Create Email Account
 *   - Скопіюй SMTP дані з розділу "Configure Email Client"
 *   - Зазвичай:
 *     Host: mail.yourdomain.com
 *     Port: 587 (TLS) або 465 (SSL)
 *     Username: noreply@yourdomain.com
 *     Password: пароль який створив
 *
 * ➤ Gmail SMTP (якщо хочеш використати Gmail):
 *   - Увімкни 2FA: https://myaccount.google.com/security
 *   - Створи App Password: https://myaccount.google.com/apppasswords
 *   - Використай:
 *     Host: smtp.gmail.com
 *     Port: 587
 *     Username: твій-email@gmail.com
 *     Password: app-password (16 символів без пробілів)
 *
 * ➤ AWS SES, SendGrid, Mailgun:
 *   - Зареєструйся і отримай API credentials
 *   - Використай їх SMTP дані
 *
 *
 * ========================================
 * 🐛 TROUBLESHOOTING (розв'язання проблем)
 * ========================================
 *
 * ПРОБЛЕМА 1: "Connection refused" при локальному тестуванні
 * -----------------------------------------------------------
 * ✅ Рішення:
 *    - Перевір що Mailhog запущений (Terminal 1)
 *    - Перевір що PHP сервер запущений (Terminal 2)
 *    - Перевір що в формі правильний action="http://localhost:8888/send-email.php"
 *
 *
 * ПРОБЛЕМА 2: "Not Found" при відкритті http://localhost:8888/send-email.php
 * --------------------------------------------------------------------------
 * ✅ Рішення:
 *    - PHP сервер запущений не в тій папці!
 *    - Зупини сервер (Ctrl+C)
 *    - Перейди в правильну папку:
 *      cd ~/Documents/job/DanylenkoTemplateStart/public/api
 *      php -S localhost:8888
 *
 *
 * ПРОБЛЕМА 3: Лист не приходить в Mailhog
 * ----------------------------------------
 * ✅ Рішення:
 *    - Відкрий http://localhost:8025 - має бути інтерфейс Mailhog
 *    - Перевір що в send-email.php:
 *      $mailer->Host = 'localhost';
 *      $mailer->Port = 1025;
 *    - Подивись Terminal 2 - там будуть помилки якщо щось не так
 *
 *
 * ПРОБЛЕМА 4: "Invalid address" помилка
 * --------------------------------------
 * ✅ Рішення:
 *    - Зміни:
 *      $mailer->setFrom('noreply@localhost', ...);
 *      на:
 *      $mailer->setFrom('noreply@example.com', ...);
 *
 *
 * ПРОБЛЕМА 5: Листи не приходять на продакшні
 * -------------------------------------------
 * ✅ Рішення:
 *    - Перевір що SMTP дані правильні (Host, Port, Username, Password)
 *    - Перевір що email існує на хостингу
 *    - Перевір spam папку
 *    - Подивись error_log на хостингу
 *    - Спробуй змінити Port: 587 → 465 (або навпаки)
 *
 *
 * ПРОБЛЕМА 6: "Class 'PHPMailer' not found"
 * ------------------------------------------
 * ✅ Рішення:
 *    - Папка vendor/ не завантажена на хостинг
 *    - Шлях до autoload.php неправильний
 *    - Перевір що є:
 *      require __DIR__ . '/../../vendor/autoload.php';
 *
 *
 * ========================================
 * 📚 ДОДАТКОВА ІНФОРМАЦІЯ
 * ========================================
 *
 * • Документація PHPMailer: https://github.com/PHPMailer/PHPMailer
 * • Mailhog: https://github.com/mailhog/MailHog
 * • Composer: https://getcomposer.org/
 *
 * • Для питань та багів - звертайся до розробника форми
 *
 * ========================================
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . "/../../vendor/autoload.php";

$configFile = __DIR__ . "/mail.config.php";
if (!file_exists($configFile)) {
   http_response_code(500);
   echo json_encode(["success" => false, "message" => "mail.config.php not found. Copy mail.config.example.php → mail.config.php"]);
   exit();
}
$config = require $configFile;

// CORS — тільки для дозволених джерел (allowed_origins у mail.config.php).
// Дефолт — localhost dev-порти. Прод same-origin ("/api/send-email.php")
// працює завжди без ACAO-заголовка. `*` прибрано, щоб чужі сайти не могли
// дьоргати ендпоінт через браузер відвідувача.
$allowedOrigins = isset($config["allowed_origins"]) && is_array($config["allowed_origins"])
   ? $config["allowed_origins"]
   : ["http://localhost:4321", "http://localhost:8888"];
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
if ($origin !== "" && in_array($origin, $allowedOrigins, true)) {
   header("Access-Control-Allow-Origin: " . $origin);
   header("Vary: Origin");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// JSON Response
header("Content-Type: application/json; charset=utf-8");

// CORS preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
   http_response_code(204);
   exit();
}

// Перевірка методу запиту
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
   http_response_code(405);
   echo json_encode([
      "success" => false,
      "message" => "Дозволений тільки POST метод",
   ]);
   exit();
}

// ========================================
// ЗБИРАЄМО ВСІ ПОЛЯ АВТОМАТИЧНО
// ========================================

$systemFields = ["recipient_email", "recipient_name", "sender_name", "subject", "form_key"];
$allFields = [];

foreach ($_POST as $key => $value) {
   if (in_array($key, $systemFields)) {
      continue;
   }

   $stringValue = trim($value);
   if ($stringValue !== "") {
      $allFields[$key] = $stringValue;
   }
}

// Обов'язкові поля
$name = isset($_POST["name"]) ? trim($_POST["name"]) : "";
$email = isset($_POST["email"]) ? trim($_POST["email"]) : "";

// Email налаштування
$form_key = isset($_POST["form_key"]) ? trim($_POST["form_key"]) : "";
$form_emails = isset($config["form_emails"]) ? $config["form_emails"] : [];

// Отримувач — ВИКЛЮЧНО з серверного конфіга (form_key → email, або fallback).
// НЕ беремо з $_POST: інакше будь-хто міг би вказати довільну адресу і
// перетворити ендпоінт на відкритий спам-релей (open mail relay).
$recipient_email =
   ($form_key && isset($form_emails[$form_key])
      ? $form_emails[$form_key]
      : null) ?:
   $config["recipient_email"];

$recipient_name = $config["recipient_name"];
$sender_name = isset($_POST["sender_name"])
   ? $_POST["sender_name"]
   : $config["from_name"];
$subject_field = isset($_POST["subject"]) ? trim($_POST["subject"]) : "";

// ========================================
// ВАЛІДАЦІЯ
// ========================================

$errors = [];

if (!empty($name) && strlen($name) < 2) {
   $errors[] = "Name is too short (min 2 characters)";
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
   $errors[] = "Valid email is required";
}

if (!empty($errors)) {
   http_response_code(400);
   echo json_encode([
      "success" => false,
      "message" => implode(", ", $errors),
      "errors" => $errors,
   ]);
   exit();
}

// ========================================
// ЗАХИСТ ВІД СПАМУ
// ========================================

// Honeypot
if (!empty($_POST["website"])) {
   http_response_code(400);
   echo json_encode([
      "success" => false,
      "message" => "Spam detected",
   ]);
   exit();
}

// Rate limiting
session_start();
$current_time = time();
$last_submit_time = isset($_SESSION["last_submit_time"])
   ? $_SESSION["last_submit_time"]
   : 0;

if ($current_time - $last_submit_time < 5) {
   http_response_code(429);
   echo json_encode([
      "success" => false,
      "message" => "Будь ласка, зачекайте перед наступним відправленням",
   ]);
   exit();
}

$_SESSION["last_submit_time"] = $current_time;

// ========================================
// ФУНКЦІЯ ФОРМАТУВАННЯ
// ========================================

function formatFieldName($fieldName)
{
   return ucwords(str_replace(["_", "-"], " ", $fieldName));
}

// ========================================
// ГЕНЕРУЄМО HTML EMAIL
// ========================================

$email_subject = !empty($subject_field)
   ? $subject_field
   : "New message from " . $name;

// Генеруємо HTML для всіх полів
$fieldsHTML = "";
foreach ($allFields as $key => $value) {
   $label = formatFieldName($key);
   $formattedValue = nl2br(htmlspecialchars($value));

   if ($key === "email") {
      $displayValue =
         '<a href="mailto:' .
         htmlspecialchars($value) .
         '" style="color: #3b82f6; text-decoration: none;">' .
         htmlspecialchars($value) .
         "</a>";
   } elseif ($key === "phone" || $key === "tel" || $key === "telephone") {
      $displayValue =
         '<a href="tel:' .
         htmlspecialchars($value) .
         '" style="color: #3b82f6; text-decoration: none;">' .
         htmlspecialchars($value) .
         "</a>";
   } else {
      $displayValue = $formattedValue;
   }

   $fieldsHTML .=
      '
      <div class="field">
         <div class="field-label">' .
      $label .
      '</div>
         <div class="field-value">' .
      $displayValue .
      '</div>
      </div>';
}

$email_body =
   '
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <style>
      body {
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
         line-height: 1.6;
         color: #333;
         margin: 0;
         padding: 0;
         background-color: #f5f5f5;
      }
      .container {
         max-width: 600px;
         margin: 20px auto;
         background: #ffffff;
         border-radius: 8px;
         overflow: hidden;
         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
         background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
         color: #ffffff;
         padding: 30px 20px;
         text-align: center;
      }
      .header h1 {
         margin: 0;
         font-size: 24px;
         font-weight: 600;
      }
      .header p {
         margin: 5px 0 0 0;
         opacity: 0.9;
         font-size: 14px;
      }
      .badge {
         display: inline-block;
         margin-top: 12px;
         padding: 4px 14px;
         background: rgba(255,255,255,0.2);
         border: 1px solid rgba(255,255,255,0.4);
         border-radius: 20px;
         font-size: 12px;
         font-weight: 600;
         letter-spacing: 0.5px;
         text-transform: uppercase;
      }
      .content {
         padding: 30px 20px;
      }
      .field {
         margin-bottom: 20px;
         padding: 15px;
         background: #f9fafb;
         border-radius: 6px;
         border-left: 4px solid #3b82f6;
      }
      .field-label {
         font-weight: 600;
         color: #374151;
         margin-bottom: 5px;
         font-size: 12px;
         text-transform: uppercase;
         letter-spacing: 0.5px;
      }
      .field-value {
         color: #1f2937;
         font-size: 15px;
         word-wrap: break-word;
      }
      .field-value a {
         color: #3b82f6;
         text-decoration: none;
      }
      .divider {
         height: 1px;
         background: #e5e7eb;
         margin: 20px 0;
      }
      .footer {
         padding: 20px;
         text-align: center;
         background: #f9fafb;
         color: #6b7280;
         font-size: 13px;
      }
      .meta {
         font-size: 12px;
         color: #9ca3af;
         margin-top: 10px;
      }
   </style>
</head>
<body>
   <div class="container">
      <div class="header">
         <h1>📧 New Contact Message</h1>
         <p>' . htmlspecialchars($sender_name) . '</p>
         ' . (!empty($form_key) ? '<div class="badge">' . htmlspecialchars($form_key) . '</div>' : '') . '
      </div>
      
      <div class="content">
         ' .
   $fieldsHTML .
   '
         
         <div class="divider"></div>
         
         <div class="meta">
            <strong>IP:</strong> ' .
   htmlspecialchars($_SERVER["REMOTE_ADDR"]) .
   '<br>
            <strong>Date:</strong> ' .
   date("d.m.Y H:i:s") .
   '<br>
            <strong>User Agent:</strong> ' .
   htmlspecialchars($_SERVER["HTTP_USER_AGENT"] ?? "Unknown") .
   '
         </div>
      </div>
      
      <div class="footer">
         <p>This is an automated message from your contact form</p>
      </div>
   </div>
</body>
</html>
';

// Plain text версія
$fieldsText = "New message from contact form\n\n";
foreach ($allFields as $key => $value) {
   $fieldsText .= formatFieldName($key) . ": " . $value . "\n";
}
$fieldsText .= "\n---\n";
if (!empty($form_key)) {
   $fieldsText .= "Form: " . $form_key . "\n";
}
$fieldsText .= "IP: " . $_SERVER["REMOTE_ADDR"] . "\n";
$fieldsText .= "Date: " . date("d.m.Y H:i:s");

// ========================================
// ВІДПРАВКА EMAIL (PHPMailer + Mailhog)
// ========================================

$mailer = new PHPMailer(true);

try {
   // SMTP — читається з mail.config.php
   $mailer->isSMTP();
   $mailer->Host    = $config["smtp_host"];
   $mailer->Port    = $config["smtp_port"];
   $mailer->CharSet = "UTF-8";

   if (!empty($config["smtp_user"]) && !empty($config["smtp_pass"])) {
      $mailer->SMTPAuth = true;
      $mailer->Username = $config["smtp_user"];
      $mailer->Password = $config["smtp_pass"];
      $mailer->SMTPSecure = ($config["smtp_port"] == 465)
         ? PHPMailer::ENCRYPTION_SMTPS
         : PHPMailer::ENCRYPTION_STARTTLS;
   }

   // Відправник
   $mailer->setFrom($config["from_email"], $sender_name);
   $mailer->addReplyTo($email, $name);

   // Отримувач
   $mailer->addAddress($recipient_email, $recipient_name);

   // Контент
   $mailer->isHTML(true);
   $mailer->CharSet = "UTF-8";
   $mailer->Subject = $email_subject;
   $mailer->Body = $email_body;
   $mailer->AltBody = $fieldsText;

   // Вкладення файлів
   $allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
   $maxFileSize  = 5 * 1024 * 1024; // 5 MB

   if (!empty($_FILES)) {
      foreach ($_FILES as $fileField) {
         $indexes = isset($fileField["name"]) && is_array($fileField["name"])
            ? array_keys($fileField["name"])
            : [0];

         foreach ($indexes as $i) {
            $tmpName  = is_array($fileField["tmp_name"]) ? $fileField["tmp_name"][$i] : $fileField["tmp_name"];
            $origName = is_array($fileField["name"])     ? $fileField["name"][$i]     : $fileField["name"];
            $fileError = is_array($fileField["error"])   ? $fileField["error"][$i]    : $fileField["error"];
            $fileSize = is_array($fileField["size"])     ? $fileField["size"][$i]     : $fileField["size"];

            if ($fileError !== UPLOAD_ERR_OK || !is_uploaded_file($tmpName)) continue;
            if ($fileSize > $maxFileSize) continue;

            $mimeType = mime_content_type($tmpName);
            if (!in_array($mimeType, $allowedTypes)) continue;

            $mailer->addAttachment($tmpName, $origName);
         }
      }
   }

   $mailer->send();

   // ✅ УСПІХ
   http_response_code(200);
   echo json_encode([
      "success" => true,
      "message" => "Message sent successfully!",
   ]);
} catch (Exception $e) {
   // ❌ ТЕХНІЧНА ПОМИЛКА
   http_response_code(500);
   echo json_encode([
      "success" => false,
   ]);

   error_log("PHPMailer Error: " . $mailer->ErrorInfo);
}
?>
