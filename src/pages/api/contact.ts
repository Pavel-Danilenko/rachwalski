import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

/**
 * ========================================
 * CONTACT FORM API ENDPOINT
 * ========================================
 *
 * Обробляє відправку контактних форм через Astro SSR
 * Працює з nodemailer + Gmail SMTP
 *
 * Підтримує:
 * - Автоматичне відображення всіх полів форми
 * - Різні recipient email (через props або hidden input)
 * - Fallback на .env CONTACT_EMAIL
 * - HTML шаблони email
 * - Валідацію
 */

export const prerender =
   import.meta.env.BUILD_MODE === "shopify" ||
   import.meta.env.BUILD_MODE === "static" ||
   import.meta.env.BUILD_MODE === "wp"
      ? true
      : false;

export const POST: APIRoute = async ({ request }) => {
   try {
      // ========================================
      // 1. ОТРИМУЄМО ДАНІ З ФОРМИ
      // ========================================
      const formData = await request.formData();

      // Системні поля (не показуємо в email)
      const systemFields = [
         "recipient_email",
         "recipient_name",
         "sender_name",
         "subject",
      ];

      // Обов'язкові поля
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;

      // Email налаштування
      const formKey = formData.get("form_key") as string;
      const recipientEmail =
         (formKey && import.meta.env[`FORM_${formKey.toUpperCase()}`]) ||
         (formData.get("recipient_email") as string) ||
         import.meta.env.CONTACT_EMAIL;
      const recipientName =
         (formData.get("recipient_name") as string) || "Website Admin";
      const senderName =
         (formData.get("sender_name") as string) || "Contact Form";
      const subject = formData.get("subject") as string;

      // ========================================
      // 2. ВАЛІДАЦІЯ (показуємо конкретні помилки)
      // ========================================
      const errors: string[] = [];

      if (!name || name.trim().length < 2) {
         errors.push("Name is required (min 2 characters)");
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         errors.push("Valid email is required");
      }

      if (!recipientEmail) {
         errors.push("Recipient email is not configured");
      }

      // Якщо є помилки валідації - показуємо їх користувачу
      if (errors.length > 0) {
         return new Response(
            JSON.stringify({
               success: false,
               message: errors.join(", "), // 👈 Показуємо конкретні помилки валідації
               errors,
            }),
            {
               status: 400,
               headers: { "Content-Type": "application/json" },
            },
         );
      }

      // ========================================
      // 3. ЗБИРАЄМО ВСІ ПОЛЯ АВТОМАТИЧНО
      // ========================================
      const allFields: Record<string, string> = {};

      for (const [key, value] of formData.entries()) {
         // Пропускаємо системні поля
         if (systemFields.includes(key)) continue;

         // Додаємо тільки заповнені поля
         const stringValue = String(value).trim();
         if (stringValue) {
            allFields[key] = stringValue;
         }
      }

      // ========================================
      // 4. ФУНКЦІЯ ДЛЯ ФОРМАТУВАННЯ НАЗВ ПОЛІВ
      // ========================================
      const formatFieldName = (fieldName: string): string => {
         return fieldName
            .replace(/_/g, " ") // user_name -> user name
            .replace(/([A-Z])/g, " $1") // userName -> user Name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") // user name -> User Name
            .trim();
      };

      // ========================================
      // 5. SMTP ТРАНСПОРТ
      // ========================================
      const transporter = nodemailer.createTransport({
         host: import.meta.env.SMTP_HOST || "smtp.gmail.com",
         port: parseInt(import.meta.env.SMTP_PORT || "587"),
         secure: false,
         auth: {
            user: import.meta.env.SMTP_USER,
            pass: import.meta.env.SMTP_PASS,
         },
      });

      // Перевірка SMTP з'єднання (технічна помилка - НЕ показуємо деталі)
      try {
         await transporter.verify();
      } catch (error) {
         console.error("❌ SMTP connection failed:", error);
         // НЕ передаємо message - буде використаний errorMessage з форми
         return new Response(
            JSON.stringify({
               success: false,
            }),
            {
               status: 500,
               headers: { "Content-Type": "application/json" },
            },
         );
      }

      // ========================================
      // 6. ГЕНЕРУЄМО HTML EMAIL (АВТОМАТИЧНО)
      // ========================================
      const emailSubject = subject || `New message from ${name}`;

      // Генеруємо HTML для всіх полів
      const fieldsHTML = Object.entries(allFields)
         .map(([key, value]) => {
            const label = formatFieldName(key);
            const formattedValue = value.replace(/\n/g, "<br>");

            // Спеціальна обробка для email/phone (робимо клікабельними)
            let displayValue = formattedValue;
            if (key === "email") {
               displayValue = `<a href="mailto:${value}" style="color: #3b82f6; text-decoration: none;">${value}</a>`;
            } else if (
               key === "phone" ||
               key === "tel" ||
               key === "telephone"
            ) {
               displayValue = `<a href="tel:${value}" style="color: #3b82f6; text-decoration: none;">${value}</a>`;
            }

            return `
         <div class="field">
            <div class="field-label">${label}</div>
            <div class="field-value">${displayValue}</div>
         </div>`;
         })
         .join("");

      const emailHTML = `
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
         <p>${senderName}</p>
      </div>
      
      <div class="content">
         ${fieldsHTML}
         
         <div class="divider"></div>
         
         <div class="meta">
            <strong>IP:</strong> ${request.headers.get("x-forwarded-for") || "unknown"}<br>
            <strong>Date:</strong> ${new Date().toLocaleString()}<br>
            <strong>User Agent:</strong> ${request.headers.get("user-agent") || "unknown"}
         </div>
      </div>
      
      <div class="footer">
         <p>This is an automated message from your contact form</p>
      </div>
   </div>
</body>
</html>
      `;

      // Plain text версія
      const fieldsText = Object.entries(allFields)
         .map(([key, value]) => `${formatFieldName(key)}: ${value}`)
         .join("\n");

      // ========================================
      // 7. ВІДПРАВКА EMAIL
      // ========================================
      const info = await transporter.sendMail({
         from: `"${senderName}" <${import.meta.env.SMTP_USER}>`,
         to: `"${recipientName}" <${recipientEmail}>`,
         replyTo: `"${name}" <${email}>`,
         subject: emailSubject,
         html: emailHTML,
         text: `
New message from contact form

${fieldsText}

---
IP: ${request.headers.get("x-forwarded-for") || "unknown"}
Date: ${new Date().toLocaleString()}
         `.trim(),
      });

      console.log("✅ Email sent:", info.messageId);

      // ========================================
      // 8. УСПІШНА ВІДПОВІДЬ
      // ========================================
      return new Response(
         JSON.stringify({
            success: true,
            message: "Message sent successfully!",
            messageId: info.messageId,
         }),
         {
            status: 200,
            headers: { "Content-Type": "application/json" },
         },
      );
   } catch (error) {
      // Загальна помилка (технічна) - НЕ показуємо деталі
      console.error("❌ Contact form error:", error);

      // НЕ передаємо message - буде використаний errorMessage з форми
      return new Response(
         JSON.stringify({
            success: false,
         }),
         {
            status: 500,
            headers: { "Content-Type": "application/json" },
         },
      );
   }
};
