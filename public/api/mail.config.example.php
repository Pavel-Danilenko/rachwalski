<?php
/**
 * Конфігурація відправки email
 *
 * Скопіюй цей файл:
 *   mail.config.example.php → mail.config.php
 *
 * Заповни значення під своє середовище.
 * mail.config.php не потрапляє в git.
 */

return [

   // ─── Локальна розробка (Mailhog) ───────────────────────────────────────────
   // Залиш як є — просто запусти `mailhog` в терміналі
   'smtp_host' => 'localhost',
   'smtp_port' => 1025,
   'smtp_user' => '',
   'smtp_pass' => '',

   // ─── Продакшн ─────────────────────────────────────────────────────────────
   // Закоментуй рядки вище і розкоментуй нижче.
   // Дані береш у хостинг-провайдера (cPanel → Email Accounts → Configure).
   //
   // 'smtp_host' => 'smtp.yourdomain.com',   // або smtp.gmail.com для Gmail
   // 'smtp_port' => 587,                      // 587 (TLS) або 465 (SSL)
   // 'smtp_user' => 'noreply@yourdomain.com', // email з хостингу або Gmail
   // 'smtp_pass' => 'your-password',          // пароль або App Password

   // ─── Відправник ────────────────────────────────────────────────────────────
   // Має збігатись з smtp_user на реальному хостингу (інакше потрапить у спам)
   'from_email' => 'noreply@yourdomain.com',
   'from_name'  => 'Website',

   // ─── Мапи форм (formKey → email) ───────────────────────────────────────────
   // Використовується коли в компоненті передаєш formKey="contact"
   // Email не потрапляє в HTML — безпечний варіант для кількох форм
   'form_emails' => [
      'contact' => 'contact@yourdomain.com',
      'sales'   => 'sales@yourdomain.com',
      'support' => 'support@yourdomain.com',
   ],

   // ─── Fallback отримувач ────────────────────────────────────────────────────
   // Якщо formKey не переданий і recipientEmail не вказаний в компоненті
   'recipient_email' => 'your-email@gmail.com',
   'recipient_name'  => 'Admin',

];
