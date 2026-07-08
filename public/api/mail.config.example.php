<?php
/**
 * Mail Configuration — ПРИКЛАД
 *
 * Скопіюй цей файл:
 *   mail.config.example.php → mail.config.php
 *
 * mail.config.php НЕ потрапляє в git (є в .gitignore).
 *
 * ─── На WordPress ─────────────────────────────────────────────────────────────
 * Підключи mail-settings.wp.php в functions.php теми:
 *   require_once get_template_directory() . '/api/mail-settings.wp.php';
 *
 * Тоді всі значення нижче налаштовуються в:
 *   WP Адмінка → Параметри → Mail Settings
 *   (без редагування коду)
 *
 * ─── Без WordPress ────────────────────────────────────────────────────────────
 * Заповни значення напряму в mail.config.php
 */

return [

   // ─── SMTP ─────────────────────────────────────────────────────────────────
   // Локальна розробка (Mailhog):  host=localhost, port=1025, user/pass=''
   // Gmail:  host=smtp.gmail.com,  port=587, pass=App Password
   // cPanel: host=mail.domain.com, port=587
   'smtp_host' => 'localhost',
   'smtp_port' => 1025,
   'smtp_user' => '',
   'smtp_pass' => '',

   // ─── Відправник ───────────────────────────────────────────────────────────
   // from_email має збігатись зі smtp_user на реальному хостингу
   'from_email' => 'noreply@rachwalski.com',
   'from_name'  => 'Rachwalski Website',

   // ─── Отримувачі форм ──────────────────────────────────────────────────────
   // formKey у компоненті → email куди йде лист
   'form_emails' => [
      'book'       => 'office@rachwalski.com',    // Popup "Book consultation"
      'contact'    => 'office@rachwalski.com',    // Сторінка Contact + Footer
      'newsletter' => 'marketing@rachwalski.com', // Newsletter секція
   ],

   // ─── Fallback ─────────────────────────────────────────────────────────────
   // Якщо formKey не переданий або його немає у form_emails
   'recipient_email' => 'office@rachwalski.com',
   'recipient_name'  => 'Admin',

   // ─── CORS: дозволені джерела крос-доменних запитів ─────────────────────────
   // Прод на тому ж домені ("/api/send-email.php") працює БЕЗ цього списку.
   // Додай сюди домен(и) лише якщо форма постить з іншого походження.
   // Якщо ключ прибрати — дефолт у коді дозволяє тільки localhost dev-порти.
   'allowed_origins' => [
      'http://localhost:4321',        // Astro dev
      'http://localhost:8888',        // локальний PHP-сервер
      // 'https://rachwalski.surgery', // прод-домен — розкоментуй за потреби
   ],

];
