/**
 * ============================================================================
 * FORM VALIDATOR - ПОВНА ДОКУМЕНТАЦІЯ
 * ============================================================================
 *
 * Потужна система валідації форм з підтримкою багатомовності
 *
 * БАЗОВЕ ВИКОРИСТАННЯ:
 * --------------------
 * <form data-success-message>
 *    <input
 *       type="email"
 *       name="email"
 *       required
 *       data-error-required="Поле обов'язкове"
 *    />
 * </form>
 *
 * ============================================================================
 * ТИПИ ВАЛІДАЦІЇ
 * ============================================================================
 */

/**
 * 1. REQUIRED (обов'язкове поле)
 * -------------------------------
 * Атрибут: required
 * Атрибут помилки: data-error-required
 *
 * Працює для: input, textarea, select, checkbox, radio
 *
 * Приклади:
 *
 * <input
 *    type="text"
 *    name="name"
 *    required
 *    data-error-required="Будь ласка, введіть ім'я"
 * />
 *
 * <textarea
 *    name="message"
 *    required
 *    data-error-required="Повідомлення не може бути порожнім"
 * ></textarea>
 *
 * <select
 *    name="country"
 *    required
 *    data-error-required="Оберіть країну"
 * >
 *    <option value="">Виберіть...</option>
 *    <option value="ua">Україна</option>
 * </select>
 */

/**
 * 2. EMAIL ВАЛІДАЦІЯ
 * -------------------
 * Тип: type="email"
 * Атрибут помилки: data-error-email
 * Додатковий атрибут: data-hint-corrected (для автокорекції)
 *
 * Автоматична корекція популярних помилок:
 * - gmial.com → gmail.com
 * - yahooo.com → yahoo.com
 * - hotmial.com → hotmail.com
 * - і багато інших
 *
 * Приклад:
 *
 * <input
 *    type="email"
 *    name="email"
 *    required
 *    data-error-required="Email обов'язковий"
 *    data-error-email="Введіть коректний email"
 *    data-hint-corrected="Автоматично виправлено на {domain}"
 * />
 *
 * ВАЖЛИВО: {domain} буде замінено на виправлений домен
 */

/**
 * 3. ТЕЛЕФОН (з автоформатуванням)
 * ---------------------------------
 * Атрибут: data-phone
 * Атрибут помилки: data-error-phone
 *
 * Підтримує формати:
 * - Україна: +380 XX XXX XX XX (12 цифр)
 * - Польща: +48 XXX XXX XXX (11 цифр)
 * - США/Канада: +1 XXX XXX XXXX (11 цифр)
 * - Інші: +XXX XX XXX XXXX (10-15 цифр)
 *
 * Автоматично додає + і форматує під час вводу
 *
 * Приклад:
 *
 * <input
 *    type="tel"
 *    name="phone"
 *    data-phone
 *    required
 *    data-error-required="Телефон обов'язковий"
 *    data-error-phone="Введіть коректний номер телефону"
 * />
 *
 * Користувач вводить: 380501234567
 * Результат: +380 50 123 45 67
 */

/**
 * 4. URL ВАЛІДАЦІЯ
 * ----------------
 * Тип: type="url"
 * Атрибут помилки: data-error-url
 *
 * Перевіряє чи це валідна URL адреса
 *
 * Приклад:
 *
 * <input
 *    type="url"
 *    name="website"
 *    data-error-url="Введіть коректну URL адресу"
 *    placeholder="https://example.com"
 * />
 */

/**
 * 5. NUMBER ВАЛІДАЦІЯ
 * -------------------
 * Тип: type="number"
 * HTML атрибути: min, max
 * Атрибути помилок: data-error-min, data-error-max
 *
 * Приклад:
 *
 * <input
 *    type="number"
 *    name="age"
 *    min="18"
 *    max="100"
 *    data-error-min="Мінімальний вік: 18"
 *    data-error-max="Максимальний вік: 100"
 * />
 */

/**
 * 6. DATE ВАЛІДАЦІЯ
 * -----------------
 * Тип: type="date"
 * HTML атрибути: min, max
 * Атрибути помилок: data-error-min-date, data-error-max-date
 *
 * Приклад:
 *
 * <input
 *    type="date"
 *    name="birthdate"
 *    min="1920-01-01"
 *    max="2006-12-31"
 *    data-error-min-date="Дата не може бути раніше 1920"
 *    data-error-max-date="Вам має бути мінімум 18 років"
 * />
 */

/**
 * 7. TIME ВАЛІДАЦІЯ
 * -----------------
 * Тип: type="time"
 * HTML атрибути: min, max
 * Атрибути помилок: data-error-min-time, data-error-max-time
 *
 * Приклад:
 *
 * <input
 *    type="time"
 *    name="meeting_time"
 *    min="09:00"
 *    max="18:00"
 *    data-error-min-time="Робочий час з 09:00"
 *    data-error-max-time="Робочий час до 18:00"
 * />
 */

/**
 * 8. FILE ВАЛІДАЦІЯ
 * -----------------
 * Тип: type="file"
 * HTML атрибут: accept (типи файлів)
 * Кастомний атрибут: data-max-size (в МБ)
 * Атрибути помилок: data-error-file-size, data-error-file-type
 *
 * Приклади:
 *
 * // Тільки зображення, максимум 5 МБ
 * <input
 *    type="file"
 *    name="avatar"
 *    accept="image/jpeg,image/png,image/webp"
 *    data-max-size="5"
 *    data-error-file-size="Файл має бути менше 5 МБ"
 *    data-error-file-type="Дозволені тільки JPG, PNG, WEBP"
 * />
 *
 * // PDF документи до 10 МБ
 * <input
 *    type="file"
 *    name="document"
 *    accept=".pdf"
 *    data-max-size="10"
 *    data-error-file-size="Файл має бути менше 10 МБ"
 *    data-error-file-type="Дозволені тільки PDF файли"
 * />
 *
 * // Будь-які зображення
 * <input
 *    type="file"
 *    name="photo"
 *    accept="image/*"
 *    data-max-size="3"
 * />
 */

/**
 * 9. MIN/MAX LENGTH (довжина тексту)
 * -----------------------------------
 * Атрибути: data-min-length, data-max-length
 * Атрибути помилок: data-error-min-length, data-error-max-length
 *
 * Працює для: input[type="text"], textarea
 *
 * Приклади:
 *
 * // Пароль мінімум 8 символів
 * <input
 *    type="password"
 *    name="password"
 *    data-min-length="8"
 *    data-max-length="100"
 *    data-error-min-length="Пароль має бути мінімум 8 символів"
 *    data-error-max-length="Пароль занадто довгий"
 * />
 *
 * // Username від 3 до 20 символів
 * <input
 *    type="text"
 *    name="username"
 *    data-min-length="3"
 *    data-max-length="20"
 *    data-error-min-length="Мінімум 3 символи"
 *    data-error-max-length="Максимум 20 символів"
 * />
 */

/**
 * 10. MIN/MAX WORDS (кількість слів)
 * -----------------------------------
 * Атрибути: data-min-words, data-max-words
 * Атрибути помилок: data-error-min-words, data-error-max-words
 *
 * Корисно для textarea (коментарі, відгуки)
 *
 * Приклад:
 *
 * <textarea
 *    name="review"
 *    data-min-words="10"
 *    data-max-words="500"
 *    data-error-min-words="Відгук має містити мінімум 10 слів"
 *    data-error-max-words="Відгук занадто довгий (максимум 500 слів)"
 * ></textarea>
 */

/**
 * 11. CUSTOM PATTERN (регулярний вираз)
 * --------------------------------------
 * Атрибут: data-pattern
 * Атрибут помилки: data-error-pattern
 *
 * Дозволяє валідувати по кастомному regex
 *
 * Приклади:
 *
 * // Тільки латинські літери
 * <input
 *    type="text"
 *    name="username"
 *    data-pattern="^[a-zA-Z0-9_]+$"
 *    data-error-pattern="Тільки латинські літери, цифри та _"
 * />
 *
 * // Український номер телефону
 * <input
 *    type="text"
 *    name="phone"
 *    data-pattern="^\+380\d{9}$"
 *    data-error-pattern="Формат: +380XXXXXXXXX"
 * />
 *
 * // Поштовий індекс
 * <input
 *    type="text"
 *    name="zipcode"
 *    data-pattern="^\d{5}$"
 *    data-error-pattern="Індекс має містити 5 цифр"
 * />
 */

/**
 * 12. SPAM CHECK (для textarea)
 * ------------------------------
 * Автоматична перевірка на спам в textarea
 * Атрибут помилки: data-error-spam
 *
 * Перевіряє:
 * - Повторення одного символу > 5 разів (aaaaaaaa)
 * - Повторення одного слова > 3 разів підряд
 * - Більше 70% великих літер (CAPS LOCK)
 *
 * Приклад:
 *
 * <textarea
 *    name="comment"
 *    data-error-spam="Ваше повідомлення схоже на спам"
 * ></textarea>
 */

/**
 * 13. CHECKBOX ВАЛІДАЦІЯ
 * -----------------------
 * Тип: type="checkbox"
 * Атрибут: required (для обов'язкових)
 * Атрибут помилки: data-error-required
 *
 * Приклад:
 *
 * <label>
 *    <input
 *       type="checkbox"
 *       name="terms"
 *       required
 *       data-error-required="Прийміть умови користування"
 *    />
 *    Я приймаю умови користування
 * </label>
 */

/**
 * 14. RADIO BUTTONS ВАЛІДАЦІЯ
 * ----------------------------
 * Тип: type="radio"
 * Атрибут: required (на всіх кнопках групи)
 * Атрибут помилки: data-error-required (достатньо на одній)
 *
 * Приклад:
 *
 * <label>
 *    <input
 *       type="radio"
 *       name="gender"
 *       value="male"
 *       required
 *       data-error-required="Оберіть стать"
 *    />
 *    Чоловік
 * </label>
 *
 * <label>
 *    <input
 *       type="radio"
 *       name="gender"
 *       value="female"
 *       required
 *    />
 *    Жінка
 * </label>
 */

/**
 * ============================================================================
 * ТИПОВІ СЦЕНАРІЇ ВИКОРИСТАННЯ
 * ============================================================================
 */

/**
 * СЦЕНАРІЙ 1: Форма реєстрації
 * -----------------------------
 */
/**
 * <form data-success-message>
 *    <!-- Ім'я -->
 *    <input
 *       type="text"
 *       name="name"
 *       required
 *       data-min-length="2"
 *       data-error-required="Введіть ваше ім'я"
 *       data-error-min-length="Ім'я занадто коротке"
 *       placeholder="Ваше ім'я"
 *    />
 *
 *    <!-- Email -->
 *    <input
 *       type="email"
 *       name="email"
 *       required
 *       data-error-required="Email обов'язковий"
 *       data-error-email="Невірний формат email"
 *       data-hint-corrected="Виправлено на {domain}"
 *       placeholder="email@example.com"
 *    />
 *
 *    <!-- Пароль -->
 *    <input
 *       type="password"
 *       name="password"
 *       required
 *       data-min-length="8"
 *       data-error-required="Пароль обов'язковий"
 *       data-error-min-length="Мінімум 8 символів"
 *       placeholder="Придумайте пароль"
 *    />
 *
 *    <!-- Телефон -->
 *    <input
 *       type="tel"
 *       name="phone"
 *       data-phone
 *       required
 *       data-error-required="Телефон обов'язковий"
 *       data-error-phone="Невірний формат телефону"
 *       placeholder="+380"
 *    />
 *
 *    <!-- Умови -->
 *    <label>
 *       <input
 *          type="checkbox"
 *          name="terms"
 *          required
 *          data-error-required="Прийміть умови"
 *       />
 *       Я приймаю умови користування
 *    </label>
 *
 *    <button type="submit">Зареєструватись</button>
 * </form>
 */

/**
 * СЦЕНАРІЙ 2: Форма контактів
 * ----------------------------
 */
/**
 * <form data-success-message>
 *    <input
 *       type="text"
 *       name="name"
 *       required
 *       data-error-required="Як до вас звертатися?"
 *    />
 *
 *    <input
 *       type="email"
 *       name="email"
 *       required
 *       data-error-required="Email обов'язковий"
 *       data-error-email="Перевірте email"
 *    />
 *
 *    <textarea
 *       name="message"
 *       required
 *       data-min-words="10"
 *       data-error-required="Напишіть повідомлення"
 *       data-error-min-words="Мінімум 10 слів"
 *       data-error-spam="Схоже на спам"
 *    ></textarea>
 *
 *    <button type="submit">Відправити</button>
 * </form>
 */

/**
 * СЦЕНАРІЙ 3: Форма завантаження файлів
 * --------------------------------------
 */
/**
 * <form data-success-message>
 *    <input
 *       type="file"
 *       name="avatar"
 *       accept="image/jpeg,image/png"
 *       data-max-size="5"
 *       required
 *       data-error-required="Оберіть фото"
 *       data-error-file-size="Максимум 5 МБ"
 *       data-error-file-type="Тільки JPG або PNG"
 *    />
 *
 *    <input
 *       type="file"
 *       name="resume"
 *       accept=".pdf,.doc,.docx"
 *       data-max-size="10"
 *       data-error-file-size="Максимум 10 МБ"
 *       data-error-file-type="Тільки PDF або DOC"
 *    />
 *
 *    <button type="submit">Завантажити</button>
 * </form>
 */

/**
 * СЦЕНАРІЙ 4: Форма бронювання
 * -----------------------------
 */
/**
 * <form data-success-message>
 *    <input
 *       type="date"
 *       name="checkin"
 *       min="2025-01-15"
 *       required
 *       data-error-required="Оберіть дату заїзду"
 *       data-error-min-date="Дата не може бути в минулому"
 *    />
 *
 *    <input
 *       type="time"
 *       name="arrival_time"
 *       min="14:00"
 *       max="23:00"
 *       data-error-min-time="Заїзд з 14:00"
 *       data-error-max-time="Заїзд до 23:00"
 *    />
 *
 *    <input
 *       type="number"
 *       name="guests"
 *       min="1"
 *       max="10"
 *       required
 *       data-error-required="Вкажіть кількість гостей"
 *       data-error-min="Мінімум 1 гість"
 *       data-error-max="Максимум 10 гостей"
 *    />
 *
 *    <button type="submit">Забронювати</button>
 * </form>
 */

/**
 * ============================================================================
 * БАГАТОМОВНІСТЬ (i18n)
 * ============================================================================
 */

/**
 * ІНТЕГРАЦІЯ З ASTRO i18n
 * ------------------------
 *
 * // src/i18n/uk.json
 * {
 *    "form": {
 *       "name_required": "Введіть ім'я",
 *       "email_required": "Email обов'язковий",
 *       "email_invalid": "Невірний формат email",
 *       "email_corrected": "Виправлено на {domain}",
 *       "phone_required": "Телефон обов'язковий",
 *       "phone_invalid": "Невірний номер"
 *    }
 * }
 *
 * // src/i18n/en.json
 * {
 *    "form": {
 *       "name_required": "Enter your name",
 *       "email_required": "Email is required",
 *       "email_invalid": "Invalid email format",
 *       "email_corrected": "Corrected to {domain}",
 *       "phone_required": "Phone is required",
 *       "phone_invalid": "Invalid phone number"
 *    }
 * }
 *
 * // Використання в Astro
 * ---
 * import { t } from '@i18n';
 * ---
 *
 * <input
 *    type="email"
 *    name="email"
 *    required
 *    data-error-required={t('form.email_required')}
 *    data-error-email={t('form.email_invalid')}
 *    data-hint-corrected={t('form.email_corrected')}
 * />
 */

/**
 * ============================================================================
 * СТИЛІЗАЦІЯ СТАНІВ
 * ============================================================================
 */

/**
 * CSS КЛАСИ
 * ---------
 * Валідатор автоматично додає класи до form-group:
 *
 * .error   - коли є помилка валідації
 * .success - коли поле валідне
 *
 * HTML структура:
 * <div class="form-group error">
 *    <input type="text" class="error" />
 *    <span class="error-message">Текст помилки</span>
 * </div>
 *
 * Приклад SCSS:
 *
 * .form-group {
 *    &.error {
 *       input {
 *          border-color: #dc3545;
 *       }
 *    }
 *
 *    &.success {
 *       input {
 *          border-color: #28a745;
 *       }
 *    }
 * }
 *
 * .error-message {
 *    color: #dc3545;
 *    font-size: 0.875rem;
 *    margin-top: 0.25rem;
 * }
 *
 * .hint-message {
 *    color: #17a2b8;
 *    font-size: 0.875rem;
 *    margin-top: 0.25rem;
 * }
 */

/**
 * ============================================================================
 * ВАЖЛИВІ ПРИМІТКИ
 * ============================================================================
 */

/**
 * 1. ІНІЦІАЛІЗАЦІЯ
 * ----------------
 * Форма повинна мати атрибут data-success-message для автоматичної ініціалізації
 *
 * <form data-success-message>...</form>
 */

/**
 * 2. ОБОВ'ЯЗКОВІ АТРИБУТИ ПОМИЛОК
 * --------------------------------
 * ЗАВЖДИ вказуйте data-error-* атрибути для required полів
 * Валідатор НЕ має fallback текстів (для багатомовності)
 */

/**
 * 3. EMAIL АВТОКОРЕКЦІЯ
 * ---------------------
 * Працює автоматично для type="email"
 * Виправляє популярні помилки (gmial → gmail, yahooo → yahoo)
 * Щоб показати підказку, додайте data-hint-corrected
 */

/**
 * 4. ТЕЛЕФОН АВТОФОРМАТ
 * ---------------------
 * Атрибут data-phone автоматично:
 * - Додає + на початку
 * - Форматує номер під час вводу
 * - Валідує довжину для різних країн
 */

/**
 * 5. SPAM ПЕРЕВІРКА
 * -----------------
 * Автоматична для всіх textarea
 * Можна відключити не додаючи data-error-spam
 */

/**
 * ============================================================================
 * BROWSER SUPPORT
 * ============================================================================
 */

/**
 * ✅ Chrome 90+
 * ✅ Firefox 88+
 * ✅ Safari 14+
 * ✅ Edge 90+
 * ✅ Мобільні браузери
 */

/**
 * ============================================================================
 * КІНЕЦЬ ДОКУМЕНТАЦІЇ
 * ============================================================================
 *
 * Для питань звертайтесь до команди розробки
 * Happy coding! 🚀
 */

//=====================================================

// export class FormValidator {
//    constructor(form, options = {}) {
//       this.form = form;
//       this.options = {
//          errorClass: "error",
//          errorMessageClass: "error-message",
//          successClass: "success",
//          ...options,
//       };

//       // Популярні помилки в email доменах для автокорекції
//       this.emailCorrections = {
//          "gmial.com": "gmail.com",
//          "gmai.com": "gmail.com",
//          "gmil.com": "gmail.com",
//          "gmali.com": "gmail.com",
//          "yahooo.com": "yahoo.com",
//          "yaho.com": "yahoo.com",
//          "outloook.com": "outlook.com",
//          "outlok.com": "outlook.com",
//          "hotmial.com": "hotmail.com",
//          "hotmal.com": "hotmail.com",
//          "icloud.con": "icloud.com",
//          "icould.com": "icloud.com",
//       };

//       this.init();
//    }

//    init() {
//       // Валідація при submit
//       this.form.addEventListener("submit", (e) => {
//          if (!this.validateForm()) {
//             e.preventDefault();
//          }
//       });

//       // Знаходимо всі поля які потребують валідації
//       const inputs = this.form.querySelectorAll("input, textarea, select");

//       inputs.forEach((input) => {
//          // Додаємо обгортку для помилок якщо її немає
//          this.ensureErrorContainer(input);

//          // Створюємо порожнє поле для помилки одразу
//          this.createErrorElement(input);

//          // Для radio buttons валідуємо при зміні будь-якої кнопки в групі
//          if (input.type === "radio") {
//             input.addEventListener("change", () => {
//                // Валідуємо всю групу радіокнопок
//                const radioGroup = this.form.querySelectorAll(
//                   `input[name="${input.name}"]`,
//                );
//                radioGroup.forEach((radio) => this.validateField(radio));
//             });
//          } else {
//             input.addEventListener("blur", () => this.validateField(input));

//             // Для select використовуємо change замість input
//             if (input.tagName === "SELECT") {
//                input.addEventListener("change", () => this.clearError(input));
//             } else {
//                input.addEventListener("input", () => this.clearError(input));
//             }
//          }

//          // Ініціалізація телефонних інпутів
//          if (input.hasAttribute("data-phone")) {
//             this.initPhoneInput(input);
//          }

//          // Автокорекція email при blur
//          if (input.type === "email") {
//             input.addEventListener("blur", () => this.correctEmail(input));
//          }
//       });
//    }

//    ensureErrorContainer(input) {
//       const parent = input.parentElement;

//       // Якщо батьківський елемент не має класу form-group, створюємо його
//       if (!parent.classList.contains("form-group")) {
//          const wrapper = document.createElement("div");
//          wrapper.className = "form-group";
//          parent.insertBefore(wrapper, input);
//          wrapper.appendChild(input);
//       }
//    }

//    createErrorElement(input) {
//       const existingError = input.parentElement.querySelector(
//          `.${this.options.errorMessageClass}`,
//       );

//       if (!existingError) {
//          const errorElement = document.createElement("span");
//          errorElement.className = this.options.errorMessageClass;
//          errorElement.textContent = "";
//          input.parentElement.appendChild(errorElement);
//       }
//    }

//    correctEmail(input) {
//       if (!input.value) return;

//       const email = input.value.toLowerCase().trim();
//       const parts = email.split("@");

//       if (parts.length !== 2) return;

//       const [localPart, domain] = parts;

//       // Перевіряємо чи є домен в списку помилок
//       if (this.emailCorrections[domain]) {
//          const correctedEmail = `${localPart}@${this.emailCorrections[domain]}`;
//          input.value = correctedEmail;

//          // Показуємо підказку про автокорекцію
//          this.showHint(
//             input,
//             `Автоматично виправлено на ${this.emailCorrections[domain]}`,
//          );

//          // Валідуємо виправлений email
//          setTimeout(() => this.validateField(input), 100);
//       }
//    }

//    showHint(field, message) {
//       const hintElement = field.parentElement.querySelector(".hint-message");

//       if (!hintElement) {
//          const hint = document.createElement("span");
//          hint.className = "hint-message";
//          hint.textContent = message;
//          field.parentElement.appendChild(hint);

//          // Видаляємо підказку через 3 секунди
//          setTimeout(() => hint.remove(), 3000);
//       }
//    }

//    initPhoneInput(input) {
//       // Додаємо + при фокусі, якщо поле порожнє
//       input.addEventListener("focus", (e) => {
//          if (!e.target.value) {
//             e.target.value = "+";
//          }
//       });

//       // Видаляємо + при blur якщо тільки + без цифр
//       input.addEventListener("blur", (e) => {
//          if (e.target.value === "+" || e.target.value.trim() === "") {
//             e.target.value = "";
//          }
//          // Викликаємо валідацію після очищення
//          this.validateField(e.target);
//       });

//       // Форматування телефону при вводі
//       input.addEventListener("input", (e) => {
//          let value = e.target.value;

//          // Залишаємо тільки + та цифри
//          value = value.replace(/[^\d+]/g, "");

//          // Якщо користувач видалив +, повертаємо його
//          if (value && !value.startsWith("+")) {
//             value = "+" + value.replace(/\+/g, "");
//          }

//          // Форматуємо номер
//          if (value.length > 1) {
//             value = this.formatPhoneNumber(value);
//          }

//          e.target.value = value;
//       });

//       // Забороняємо видалення + на початку
//       input.addEventListener("keydown", (e) => {
//          const value = e.target.value;
//          if (value === "+" && e.key === "Backspace") {
//             e.preventDefault();
//          }
//       });
//    }

//    formatPhoneNumber(value) {
//       const digits = value.substring(1);

//       if (digits.startsWith("380")) {
//          return this.formatUkraine(digits);
//       } else if (digits.startsWith("48")) {
//          return this.formatPoland(digits);
//       } else if (digits.startsWith("1")) {
//          return this.formatUSA(digits);
//       } else {
//          return this.formatGeneral(digits);
//       }
//    }

//    formatUkraine(digits) {
//       let formatted = "+380";
//       if (digits.length > 3) {
//          formatted += " " + digits.substring(3, 5);
//       }
//       if (digits.length > 5) {
//          formatted += " " + digits.substring(5, 8);
//       }
//       if (digits.length > 8) {
//          formatted += " " + digits.substring(8, 10);
//       }
//       if (digits.length > 10) {
//          formatted += " " + digits.substring(10, 12);
//       }
//       return formatted;
//    }

//    formatPoland(digits) {
//       let formatted = "+48";
//       if (digits.length > 2) {
//          formatted += " " + digits.substring(2, 5);
//       }
//       if (digits.length > 5) {
//          formatted += " " + digits.substring(5, 8);
//       }
//       if (digits.length > 8) {
//          formatted += " " + digits.substring(8, 11);
//       }
//       return formatted;
//    }

//    formatUSA(digits) {
//       let formatted = "+1";
//       if (digits.length > 1) {
//          formatted += " " + digits.substring(1, 4);
//       }
//       if (digits.length > 4) {
//          formatted += " " + digits.substring(4, 7);
//       }
//       if (digits.length > 7) {
//          formatted += " " + digits.substring(7, 11);
//       }
//       return formatted;
//    }

//    formatGeneral(digits) {
//       let formatted = "+";
//       let index = 0;

//       const countryCodeLength =
//          digits.length >= 2
//             ? digits.startsWith("1")
//                ? 1
//                : digits.length >= 3
//                  ? 3
//                  : 2
//             : digits.length;

//       formatted += digits.substring(0, countryCodeLength);
//       index = countryCodeLength;

//       if (digits.length > index) {
//          formatted += " " + digits.substring(index, index + 2);
//          index += 2;
//       }
//       if (digits.length > index) {
//          formatted += " " + digits.substring(index, index + 3);
//          index += 3;
//       }
//       if (digits.length > index) {
//          formatted += " " + digits.substring(index, index + 4);
//       }

//       return formatted;
//    }

//    validateForm() {
//       const inputs = this.form.querySelectorAll("input, textarea, select");
//       let isValid = true;

//       inputs.forEach((input) => {
//          if (!this.validateField(input)) {
//             isValid = false;
//          }
//       });

//       return isValid;
//    }

//    validateField(field) {
//       this.clearError(field);

//       // Пропускаємо не required порожні поля
//       if (
//          !field.hasAttribute("required") &&
//          !field.value.trim() &&
//          field.type !== "radio"
//       ) {
//          return true;
//       }

//       // Radio buttons validation
//       if (field.type === "radio" && field.hasAttribute("required")) {
//          const radioGroup = this.form.querySelectorAll(
//             `input[name="${field.name}"]`,
//          );
//          const isChecked = Array.from(radioGroup).some(
//             (radio) => radio.checked,
//          );

//          if (!isChecked) {
//             const message =
//                field.getAttribute("data-error-required") || "Error";
//             const firstRadio = radioGroup[0];
//             this.showError(firstRadio, message);
//             return false;
//          } else {
//             radioGroup.forEach((radio) => this.clearError(radio));
//             return true;
//          }
//       }

//       // Checkbox validation
//       if (field.type === "checkbox" && field.hasAttribute("required")) {
//          if (!field.checked) {
//             const message =
//                field.getAttribute("data-error-required") || "Error";
//             this.showError(field, message);
//             return false;
//          } else {
//             this.showSuccess(field);
//             return true;
//          }
//       }

//       // Select validation
//       if (field.tagName === "SELECT" && field.hasAttribute("required")) {
//          if (!field.value || field.value === "" || field.value === "default") {
//             const message =
//                field.getAttribute("data-error-required") || "Error";
//             this.showError(field, message);
//             return false;
//          } else {
//             this.showSuccess(field);
//             return true;
//          }
//       }

//       // Required для інших полів
//       if (field.hasAttribute("required") && !field.value.trim()) {
//          const message = field.getAttribute("data-error-required") || "Error";
//          this.showError(field, message);
//          return false;
//       }

//       // Email validation
//       if (field.type === "email" && field.value) {
//          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//          if (!emailPattern.test(field.value)) {
//             const message = field.getAttribute("data-error-email") || "Error";
//             this.showError(field, message);
//             return false;
//          } else {
//             this.showSuccess(field);
//          }
//       }

//       // URL validation
//       if (field.type === "url" && field.value) {
//          try {
//             new URL(field.value);
//             this.showSuccess(field);
//          } catch {
//             const message = field.getAttribute("data-error-url") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Number validation
//       if (field.type === "number" && field.value) {
//          const min = field.getAttribute("min");
//          const max = field.getAttribute("max");

//          if (min && parseFloat(field.value) < parseFloat(min)) {
//             const message = field.getAttribute("data-error-min") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          if (max && parseFloat(field.value) > parseFloat(max)) {
//             const message = field.getAttribute("data-error-max") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          this.showSuccess(field);
//       }

//       // Date validation
//       if (field.type === "date" && field.value) {
//          const minDate = field.getAttribute("min");
//          const maxDate = field.getAttribute("max");

//          if (minDate && field.value < minDate) {
//             const message =
//                field.getAttribute("data-error-min-date") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          if (maxDate && field.value > maxDate) {
//             const message =
//                field.getAttribute("data-error-max-date") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          this.showSuccess(field);
//       }

//       // Time validation
//       if (field.type === "time" && field.value) {
//          const minTime = field.getAttribute("min");
//          const maxTime = field.getAttribute("max");

//          if (minTime && field.value < minTime) {
//             const message =
//                field.getAttribute("data-error-min-time") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          if (maxTime && field.value > maxTime) {
//             const message =
//                field.getAttribute("data-error-max-time") || "Error";
//             this.showError(field, message);
//             return false;
//          }

//          this.showSuccess(field);
//       }

//       // Color validation
//       if (field.type === "color" && field.value) {
//          this.showSuccess(field);
//       }

//       // Range validation
//       if (field.type === "range" && field.value) {
//          this.showSuccess(field);
//       }

//       // File validation
//       if (field.type === "file" && field.files && field.files.length > 0) {
//          const maxSize = field.getAttribute("data-max-size");
//          if (maxSize) {
//             const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024;
//             const file = field.files[0];

//             if (file.size > maxSizeBytes) {
//                const message =
//                   field.getAttribute("data-error-file-size") || "Error";
//                this.showError(field, message);
//                return false;
//             }
//          }

//          const accept = field.getAttribute("accept");
//          if (accept) {
//             const file = field.files[0];
//             const acceptedTypes = accept.split(",").map((type) => type.trim());
//             const fileType = file.type;
//             const fileExt = "." + file.name.split(".").pop();

//             const isValid = acceptedTypes.some(
//                (type) =>
//                   type === fileType ||
//                   type === fileExt ||
//                   (type.endsWith("/*") &&
//                      fileType.startsWith(type.replace("/*", ""))),
//             );

//             if (!isValid) {
//                const message =
//                   field.getAttribute("data-error-file-type") || "Error";
//                this.showError(field, message);
//                return false;
//             }
//          }

//          this.showSuccess(field);
//       }

//       // Phone validation
//       if (field.hasAttribute("data-phone") && field.value) {
//          if (!this.validatePhone(field.value)) {
//             const message = field.getAttribute("data-error-phone") || "Error";
//             this.showError(field, message);
//             return false;
//          } else {
//             this.showSuccess(field);
//          }
//       }

//       // Textarea spam check
//       if (field.tagName === "TEXTAREA" && field.value) {
//          if (this.isSpam(field.value)) {
//             const message = field.getAttribute("data-error-spam") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Min Length validation
//       if (field.hasAttribute("data-min-length")) {
//          const min = parseInt(field.getAttribute("data-min-length"));
//          const valueLength = field.hasAttribute("data-phone")
//             ? field.value.replace(/\D/g, "").length
//             : field.value.trim().length;

//          if (valueLength < min) {
//             const message =
//                field.getAttribute("data-error-min-length") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Max Length validation
//       if (field.hasAttribute("data-max-length")) {
//          const max = parseInt(field.getAttribute("data-max-length"));
//          if (field.value.length > max) {
//             const message =
//                field.getAttribute("data-error-max-length") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Custom Pattern validation
//       if (field.hasAttribute("data-pattern")) {
//          const pattern = new RegExp(field.getAttribute("data-pattern"));
//          if (!pattern.test(field.value)) {
//             const message = field.getAttribute("data-error-pattern") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Min words validation
//       if (field.hasAttribute("data-min-words") && field.value) {
//          const minWords = parseInt(field.getAttribute("data-min-words"));
//          const wordCount = field.value.trim().split(/\s+/).length;

//          if (wordCount < minWords) {
//             const message =
//                field.getAttribute("data-error-min-words") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Max words validation
//       if (field.hasAttribute("data-max-words") && field.value) {
//          const maxWords = parseInt(field.getAttribute("data-max-words"));
//          const wordCount = field.value.trim().split(/\s+/).length;

//          if (wordCount > maxWords) {
//             const message =
//                field.getAttribute("data-error-max-words") || "Error";
//             this.showError(field, message);
//             return false;
//          }
//       }

//       // Показуємо success для валідних полів
//       if (
//          field.value.trim() &&
//          field.type !== "checkbox" &&
//          field.type !== "radio" &&
//          field.tagName !== "SELECT" &&
//          !field.hasAttribute("data-phone")
//       ) {
//          this.showSuccess(field);
//       }

//       return true;
//    }

//    isSpam(text) {
//       // Повторення одного символу більше 5 разів підряд
//       if (/(.)\1{5,}/.test(text)) {
//          return true;
//       }

//       // Повторення одного слова більше 3 разів підряд
//       const words = text.split(/\s+/);
//       for (let i = 0; i < words.length - 3; i++) {
//          if (
//             words[i] === words[i + 1] &&
//             words[i] === words[i + 2] &&
//             words[i] === words[i + 3]
//          ) {
//             return true;
//          }
//       }

//       // Занадто багато великих літер (>70%)
//       const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
//       const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
//       if (letterCount > 0 && upperCaseCount / letterCount > 0.7) {
//          return true;
//       }

//       return false;
//    }

//    validatePhone(value) {
//       const digits = value.replace(/\D/g, "");

//       if (digits.length < 10) return false;

//       if (digits.startsWith("380")) {
//          return digits.length === 12;
//       } else if (digits.startsWith("48")) {
//          return digits.length === 11;
//       } else if (digits.startsWith("1")) {
//          return digits.length === 11;
//       }

//       return digits.length >= 10 && digits.length <= 15;
//    }

//    showError(field, message) {
//       field.classList.add(this.options.errorClass);
//       field.classList.remove(this.options.successClass);

//       const errorElement = field.parentElement.querySelector(
//          `.${this.options.errorMessageClass}`,
//       );

//       if (errorElement) {
//          errorElement.textContent = message;
//       }
//    }

//    showSuccess(field) {
//       field.classList.remove(this.options.errorClass);
//       field.classList.add(this.options.successClass);

//       const errorElement = field.parentElement.querySelector(
//          `.${this.options.errorMessageClass}`,
//       );
//       if (errorElement) {
//          errorElement.textContent = "";
//       }
//    }

//    clearError(field) {
//       field.classList.remove(this.options.errorClass);
//       field.classList.remove(this.options.successClass);

//       const errorElement = field.parentElement.querySelector(
//          `.${this.options.errorMessageClass}`,
//       );
//       if (errorElement) {
//          errorElement.textContent = "";
//       }
//    }
// }

// new version

export class FormValidator {
   constructor(form, options = {}) {
      this.form = form;
      this.options = {
         errorClass: "error",
         errorMessageClass: "error-message",
         successClass: "success",
         hintMessageClass: "hint-message",
         hintDuration: 3000,
         ...options,
      };

      this.emailCorrections = {
         "gmial.com": "gmail.com",
         "gmai.com": "gmail.com",
         "gmil.com": "gmail.com",
         "gmali.com": "gmail.com",
         "yahooo.com": "yahoo.com",
         "yaho.com": "yahoo.com",
         "outloook.com": "outlook.com",
         "outlok.com": "outlook.com",
         "hotmial.com": "hotmail.com",
         "hotmal.com": "hotmail.com",
         "icloud.con": "icloud.com",
         "icould.com": "icloud.com",
      };

      this.init();
   }

   init() {
      this.form.addEventListener("submit", (e) => {
         if (!this.validateForm()) {
            e.preventDefault();
         }
      });

      const inputs = this.form.querySelectorAll("input, textarea, select");

      inputs.forEach((input) => {
         this.createErrorElement(input);

         if (input.type === "radio") {
            input.addEventListener("change", () => {
               const radioGroup = this.form.querySelectorAll(
                  `input[name="${input.name}"]`,
               );
               radioGroup.forEach((radio) => this.validateField(radio));
            });
         } else {
            input.addEventListener("blur", () => this.validateField(input));

            if (input.tagName === "SELECT") {
               input.addEventListener("change", () => this.clearError(input));
            } else {
               input.addEventListener("input", () => this.clearError(input));
            }
         }

         if (input.hasAttribute("data-phone")) {
            this.initPhoneInput(input);
         }

         if (input.type === "email") {
            input.addEventListener("blur", () => this.correctEmail(input));
         }
      });
   }

   createErrorElement(input) {
      const formGroup = input.closest(".form-group");

      if (!formGroup) {
         console.warn(
            "FormValidator: input не знаходиться в .form-group",
            input,
         );
         return;
      }

      const existingError = formGroup.querySelector(
         `.${this.options.errorMessageClass}`,
      );

      if (!existingError) {
         const errorElement = document.createElement("span");
         errorElement.className = this.options.errorMessageClass;
         errorElement.textContent = "";
         formGroup.appendChild(errorElement);
      }
   }

   correctEmail(input) {
      if (!input.value) return;

      const email = input.value.toLowerCase().trim();
      const parts = email.split("@");

      if (parts.length !== 2) return;

      const [localPart, domain] = parts;

      if (this.emailCorrections[domain]) {
         const correctedEmail = `${localPart}@${this.emailCorrections[domain]}`;
         input.value = correctedEmail;

         const hintMessage = input.getAttribute("data-hint-corrected");
         if (hintMessage) {
            const message = hintMessage.replace(
               "{domain}",
               this.emailCorrections[domain],
            );
            this.showHint(input, message);
         }

         setTimeout(() => this.validateField(input), 100);
      }
   }

   showHint(field, message) {
      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      const hintElement = formGroup.querySelector(
         `.${this.options.hintMessageClass}`,
      );

      if (!hintElement) {
         const hint = document.createElement("span");
         hint.className = this.options.hintMessageClass;
         hint.textContent = message;
         formGroup.appendChild(hint);

         setTimeout(() => hint.remove(), this.options.hintDuration);
      }
   }

   initPhoneInput(input) {
      input.addEventListener("focus", (e) => {
         if (!e.target.value) {
            e.target.value = "+";
         }
      });

      input.addEventListener("blur", (e) => {
         if (e.target.value === "+" || e.target.value.trim() === "") {
            e.target.value = "";
         }
         this.validateField(e.target);
      });

      input.addEventListener("input", (e) => {
         let value = e.target.value;
         value = value.replace(/[^\d+]/g, "");

         if (value && !value.startsWith("+")) {
            value = "+" + value.replace(/\+/g, "");
         }

         if (value.length > 1) {
            value = this.formatPhoneNumber(value);
         }

         e.target.value = value;
      });

      input.addEventListener("keydown", (e) => {
         const value = e.target.value;
         if (value === "+" && e.key === "Backspace") {
            e.preventDefault();
         }
      });
   }

   formatPhoneNumber(value) {
      const digits = value.substring(1);

      if (digits.startsWith("380")) {
         return this.formatUkraine(digits);
      } else if (digits.startsWith("48")) {
         return this.formatPoland(digits);
      } else if (digits.startsWith("1")) {
         return this.formatUSA(digits);
      } else {
         return this.formatGeneral(digits);
      }
   }

   formatUkraine(digits) {
      let formatted = "+380";
      if (digits.length > 3) formatted += " " + digits.substring(3, 5);
      if (digits.length > 5) formatted += " " + digits.substring(5, 8);
      if (digits.length > 8) formatted += " " + digits.substring(8, 10);
      if (digits.length > 10) formatted += " " + digits.substring(10, 12);
      return formatted;
   }

   formatPoland(digits) {
      let formatted = "+48";
      if (digits.length > 2) formatted += " " + digits.substring(2, 5);
      if (digits.length > 5) formatted += " " + digits.substring(5, 8);
      if (digits.length > 8) formatted += " " + digits.substring(8, 11);
      return formatted;
   }

   formatUSA(digits) {
      let formatted = "+1";
      if (digits.length > 1) formatted += " " + digits.substring(1, 4);
      if (digits.length > 4) formatted += " " + digits.substring(4, 7);
      if (digits.length > 7) formatted += " " + digits.substring(7, 11);
      return formatted;
   }

   formatGeneral(digits) {
      let formatted = "+";
      let index = 0;

      const countryCodeLength =
         digits.length >= 2
            ? digits.startsWith("1")
               ? 1
               : digits.length >= 3
                 ? 3
                 : 2
            : digits.length;

      formatted += digits.substring(0, countryCodeLength);
      index = countryCodeLength;

      if (digits.length > index) {
         formatted += " " + digits.substring(index, index + 2);
         index += 2;
      }
      if (digits.length > index) {
         formatted += " " + digits.substring(index, index + 3);
         index += 3;
      }
      if (digits.length > index) {
         formatted += " " + digits.substring(index, index + 4);
      }

      return formatted;
   }

   validateForm() {
      const inputs = this.form.querySelectorAll("input, textarea, select");
      let isValid = true;

      inputs.forEach((input) => {
         // 👇 Передаємо true щоб НЕ очищати помилки
         if (!this.validateField(input, true)) {
            isValid = false;
         }
      });

      return isValid;
   }

   validateField(field, onSubmit = false) {
      // 👇 Очищаємо помилку ТІЛЬКИ якщо це НЕ submit
      if (!onSubmit) {
         this.clearError(field);
      }

      if (
         !field.hasAttribute("required") &&
         !field.value.trim() &&
         field.type !== "radio"
      ) {
         return true;
      }

      // Radio buttons validation
      if (field.type === "radio" && field.hasAttribute("required")) {
         const radioGroup = this.form.querySelectorAll(
            `input[name="${field.name}"]`,
         );
         const isChecked = Array.from(radioGroup).some(
            (radio) => radio.checked,
         );

         if (!isChecked) {
            const message = field.getAttribute("data-error-required");
            if (message) {
               const firstRadio = radioGroup[0];
               this.showError(firstRadio, message);
            }
            return false;
         } else {
            radioGroup.forEach((radio) => this.clearError(radio));
            return true;
         }
      }

      // Checkbox validation
      if (field.type === "checkbox" && field.hasAttribute("required")) {
         if (!field.checked) {
            const message = field.getAttribute("data-error-required");
            if (message) {
               this.showError(field, message);
            }
            return false;
         } else {
            this.showSuccess(field);
            return true;
         }
      }

      // Select validation
      if (field.tagName === "SELECT" && field.hasAttribute("required")) {
         if (!field.value || field.value === "" || field.value === "default") {
            const message = field.getAttribute("data-error-required");
            if (message) {
               this.showError(field, message);
            }
            return false;
         } else {
            this.showSuccess(field);
            return true;
         }
      }

      // Required для інших полів
      if (field.hasAttribute("required") && !field.value.trim()) {
         const message = field.getAttribute("data-error-required");
         if (message) {
            this.showError(field, message);
         }
         return false;
      }

      // Email validation
      if (field.type === "email" && field.value) {
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailPattern.test(field.value)) {
            const message = field.getAttribute("data-error-email");
            if (message) {
               this.showError(field, message);
            }
            return false;
         } else {
            this.showSuccess(field);
         }
      }

      // URL validation
      if (field.type === "url" && field.value) {
         try {
            new URL(field.value);
            this.showSuccess(field);
         } catch {
            const message = field.getAttribute("data-error-url");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Number validation
      if (field.type === "number" && field.value) {
         const min = field.getAttribute("min");
         const max = field.getAttribute("max");

         if (min && parseFloat(field.value) < parseFloat(min)) {
            const message = field.getAttribute("data-error-min");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         if (max && parseFloat(field.value) > parseFloat(max)) {
            const message = field.getAttribute("data-error-max");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         this.showSuccess(field);
      }

      // Date validation
      if (field.type === "date" && field.value) {
         const minDate = field.getAttribute("min");
         const maxDate = field.getAttribute("max");

         if (minDate && field.value < minDate) {
            const message = field.getAttribute("data-error-min-date");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         if (maxDate && field.value > maxDate) {
            const message = field.getAttribute("data-error-max-date");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         this.showSuccess(field);
      }

      // Time validation
      if (field.type === "time" && field.value) {
         const minTime = field.getAttribute("min");
         const maxTime = field.getAttribute("max");

         if (minTime && field.value < minTime) {
            const message = field.getAttribute("data-error-min-time");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         if (maxTime && field.value > maxTime) {
            const message = field.getAttribute("data-error-max-time");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }

         this.showSuccess(field);
      }

      // Color validation
      if (field.type === "color" && field.value) {
         this.showSuccess(field);
      }

      // Range validation
      if (field.type === "range" && field.value) {
         this.showSuccess(field);
      }

      // File validation
      if (field.type === "file" && field.files && field.files.length > 0) {
         const maxSize = field.getAttribute("data-max-size");
         if (maxSize) {
            const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024;
            const file = field.files[0];

            if (file.size > maxSizeBytes) {
               const message = field.getAttribute("data-error-file-size");
               if (message) {
                  this.showError(field, message);
               }
               return false;
            }
         }

         const accept = field.getAttribute("accept");
         if (accept) {
            const file = field.files[0];
            const acceptedTypes = accept.split(",").map((type) => type.trim());
            const fileType = file.type;
            const fileExt = "." + file.name.split(".").pop();

            const isValid = acceptedTypes.some(
               (type) =>
                  type === fileType ||
                  type === fileExt ||
                  (type.endsWith("/*") &&
                     fileType.startsWith(type.replace("/*", ""))),
            );

            if (!isValid) {
               const message = field.getAttribute("data-error-file-type");
               if (message) {
                  this.showError(field, message);
               }
               return false;
            }
         }

         this.showSuccess(field);
      }

      // Phone validation
      if (field.hasAttribute("data-phone") && field.value) {
         if (!this.validatePhone(field.value)) {
            const message = field.getAttribute("data-error-phone");
            if (message) {
               this.showError(field, message);
            }
            return false;
         } else {
            this.showSuccess(field);
         }
      }

      // Textarea spam check
      if (field.tagName === "TEXTAREA" && field.value) {
         if (this.isSpam(field.value)) {
            const message = field.getAttribute("data-error-spam");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Min Length validation
      if (field.hasAttribute("data-min-length")) {
         const min = parseInt(field.getAttribute("data-min-length"));
         const valueLength = field.hasAttribute("data-phone")
            ? field.value.replace(/\D/g, "").length
            : field.value.trim().length;

         if (valueLength < min) {
            const message = field.getAttribute("data-error-min-length");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Max Length validation
      if (field.hasAttribute("data-max-length")) {
         const max = parseInt(field.getAttribute("data-max-length"));
         if (field.value.length > max) {
            const message = field.getAttribute("data-error-max-length");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Custom Pattern validation
      if (field.hasAttribute("data-pattern")) {
         const pattern = new RegExp(field.getAttribute("data-pattern"));
         if (!pattern.test(field.value)) {
            const message = field.getAttribute("data-error-pattern");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Min words validation
      if (field.hasAttribute("data-min-words") && field.value) {
         const minWords = parseInt(field.getAttribute("data-min-words"));
         const wordCount = field.value.trim().split(/\s+/).length;

         if (wordCount < minWords) {
            const message = field.getAttribute("data-error-min-words");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Max words validation
      if (field.hasAttribute("data-max-words") && field.value) {
         const maxWords = parseInt(field.getAttribute("data-max-words"));
         const wordCount = field.value.trim().split(/\s+/).length;

         if (wordCount > maxWords) {
            const message = field.getAttribute("data-error-max-words");
            if (message) {
               this.showError(field, message);
            }
            return false;
         }
      }

      // Показуємо success для валідних полів
      if (
         field.value.trim() &&
         field.type !== "checkbox" &&
         field.type !== "radio" &&
         field.tagName !== "SELECT" &&
         !field.hasAttribute("data-phone")
      ) {
         this.showSuccess(field);
      }

      return true;
   }

   isSpam(text) {
      if (/(.)\1{5,}/.test(text)) {
         return true;
      }

      const words = text.split(/\s+/);
      for (let i = 0; i < words.length - 3; i++) {
         if (
            words[i] === words[i + 1] &&
            words[i] === words[i + 2] &&
            words[i] === words[i + 3]
         ) {
            return true;
         }
      }

      const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
      const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
      if (letterCount > 0 && upperCaseCount / letterCount > 0.7) {
         return true;
      }

      return false;
   }

   validatePhone(value) {
      const digits = value.replace(/\D/g, "");

      if (digits.length < 10) return false;

      if (digits.startsWith("380")) {
         return digits.length === 12;
      } else if (digits.startsWith("48")) {
         return digits.length === 11;
      } else if (digits.startsWith("1")) {
         return digits.length === 11;
      }

      return digits.length >= 10 && digits.length <= 15;
   }

   showError(field, message) {
      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      formGroup.classList.add(this.options.errorClass);
      formGroup.classList.remove(this.options.successClass);

      const errorElement = formGroup.querySelector(
         `.${this.options.errorMessageClass}`,
      );

      if (errorElement) {
         errorElement.textContent = message;
      }
   }

   showSuccess(field) {
      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      formGroup.classList.remove(this.options.errorClass);
      formGroup.classList.add(this.options.successClass);

      const errorElement = formGroup.querySelector(
         `.${this.options.errorMessageClass}`,
      );
      if (errorElement) {
         errorElement.textContent = "";
      }
   }

   clearError(field) {
      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      formGroup.classList.remove(this.options.errorClass);
      formGroup.classList.remove(this.options.successClass);

      const errorElement = formGroup.querySelector(
         `.${this.options.errorMessageClass}`,
      );
      if (errorElement) {
         errorElement.textContent = "";
      }
   }
}
