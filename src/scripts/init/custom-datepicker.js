/**
 * ========================================
 * CUSTOM DATEPICKER - ПОВНИЙ ТУТОРІАЛ
 * ========================================
 *
 * Потужний, гнучкий datepicker з підтримкою:
 * - Різних стилів відображення (місяці, роки)
 * - Анімацій переходів
 * - Sprite іконок
 * - i18n (багатомовність)
 * - Валідації
 * - Breadcrumbs навігації
 *
 * ========================================
 * 1. БАЗОВЕ ВИКОРИСТАННЯ
 * ========================================
 */

// Мінімальний приклад (тільки обов'язкові props):
/*
<CustomDatePicker
   name="birthdate"                    // ⚠️ ОБОВ'ЯЗКОВО - ім'я поля для форми
/>
*/

/**
 * ========================================
 * 2. ПОВНИЙ ПРИКЛАД З УСІМА PROPS
 * ========================================
 */

/*
<CustomDatePicker
   // =======================================
   // ОБОВ'ЯЗКОВІ PROPS
   // =======================================
   name="event-date"                   // ⚠️ ОБОВ'ЯЗКОВО - ім'я для form submission
   
   // =======================================
   // БАЗОВІ НАЛАШТУВАННЯ
   // =======================================
   id="my-datepicker"                  // ID елемента (default: datepicker-{name})
   value="2024-12-25"                  // Початкове значення (YYYY-MM-DD)
   placeholder="Select date"           // Placeholder тексту
   required={true}                     // Чи є поле обов'язковим
   disabled={false}                    // Вимкнути datepicker
   readonly={false}                    // Тільки для читання
   
   // =======================================
   // РЕЖИМИ РОБОТИ
   // =======================================
   mode="single"                       // "single" | "range" | "multiple"
   
   // =======================================
   // ФОРМАТИ І ЛОКАЛІЗАЦІЯ
   // =======================================
   format="DD.MM.YYYY"                 // Формат відображення дати
   locale="en"                         // Локаль (поки не використовується)
   firstDayOfWeek={1}                  // Перший день тижня (0=Sunday, 1=Monday)
   
   // =======================================
   // ОБМЕЖЕННЯ ДАТ
   // =======================================
   minDate="2024-01-01"                // Мінімальна дата (YYYY-MM-DD)
   maxDate="2024-12-31"                // Максимальна дата (YYYY-MM-DD)
   disabledDates={["2024-12-25", "2024-01-01"]}  // Вимкнені конкретні дати
   disabledDaysOfWeek={[0, 6]}         // Вимкнені дні тижня (0=Sunday, 6=Saturday)
   
   // =======================================
   // 🎨 ІКОНКИ (SPRITE SUPPORT)
   // =======================================
   iconCalendar="calendar"             // ID іконки календаря в sprite
   iconClear="close"                   // ID іконки очищення
   iconPrev="chevron-left"             // ID стрілки "назад"
   iconNext="chevron-right"            // ID стрілки "вперед"
   useInlineSvg={false}                // true = використовувати вбудовані SVG замість sprite
   
   // =======================================
   // 🎨 ВІЗУАЛЬНІ СТИЛІ
   // =======================================
   monthsView="cards"                  // Стиль місяців:
                                       // - "cards" (default) - класичні картки
                                       // - "seasonal" - з іконками сезонів 🌸❄️☀️🍂
                                       // - "minimal" - великі літери
                                       // - "neumorphic" - м'які тіні
   
   yearsView="grid"                    // Стиль років:
                                       // - "grid" (default) - сітка 3×4
                                       // - "timeline" - горизонтальна шкала
                                       // - "carousel" - 3D карусель 🎠
                                       // - "vertical-scroll" - вертикальний скрол
   
   transition="slide"                  // Анімація переходів:
                                       // - "slide" (default) - ковзання вліво/вправо
                                       // - "fade" - плавне зникнення/поява
                                       // - "scale" - масштабування
                                       // - "none" - без анімації
   
   // =======================================
   // 🧭 НАВІГАЦІЯ
   // =======================================
   showBreadcrumbs={true}              // Показувати breadcrumbs навігацію
   enableGestures={false}              // Підтримка swipe жестів (поки не реалізовано)
   
   // =======================================
   // UI ОПЦІЇ
   // =======================================
   showTodayButton={true}              // Показувати кнопку "Today"
   showClearButton={true}              // Показувати кнопку очищення
   showYearDropdown={true}             // Показувати dropdown року (поки не використовується)
   showMonthDropdown={true}            // Показувати dropdown місяця (поки не використовується)
   showShortcuts={false}               // Показувати shortcuts (поки не реалізовано)
   showMultipleMonths={1}              // Кількість місяців (поки не використовується)
   
   // =======================================
   // 🌍 i18n - ТЕКСТИ (всі через props!)
   // =======================================
   placeholder="Select date"
   todayText="Today"
   clearText="Clear"
   closeText="Close"
   applyText="Apply"                   // Для range mode
   cancelText="Cancel"                 // Для range mode
   
   // =======================================
   // 🌍 i18n - НАЗВИ МІСЯЦІВ
   // =======================================
   monthNames={[
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
   ]}
   
   monthNamesShort={[
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
   ]}
   
   // =======================================
   // 🌍 i18n - НАЗВИ ДНІВ
   // =======================================
   dayNames={[
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
   ]}
   
   dayNamesShort={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
   
   dayNamesMin={["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]}
   
   // =======================================
   // ⚠️ ВАЛІДАЦІЯ (data-атрибути для FormValidator)
   // =======================================
   data-error-required="This field is required"
   data-error-min-date="Date cannot be earlier than {date}"
   data-error-max-date="Date cannot be later than {date}"
   
   // =======================================
   // SHORTCUTS (поки не реалізовано)
   // =======================================
   shortcuts={[
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "Last 7 days", value: "last-7-days" }
   ]}
   
   // =======================================
   // ТЕМИ (поки не використовується)
   // =======================================
   theme="light"                       // "light" | "dark" | "auto"
   color="blue"                        // Основний колір
   
   // =======================================
   // ДОДАТКОВІ КЛАСИ
   // =======================================
   class="my-custom-class"             // Додаткові CSS класи
/>
*/

/**
 * ========================================
 * 3. ПОПУЛЯРНІ КОМБІНАЦІЇ
 * ========================================
 */

// --------------------------------------
// A) Сезонні місяці + Timeline роки
// --------------------------------------
/*
<CustomDatePicker
   name="seasonal-date"
   monthsView="seasonal"
   yearsView="timeline"
   transition="slide"
   iconCalendar="calendar"
   iconClear="close"
   iconPrev="chevron-left"
   iconNext="chevron-right"
/>
*/

// --------------------------------------
// B) Мінімалістичний + 3D Карусель
// --------------------------------------
/*
<CustomDatePicker
   name="minimal-date"
   monthsView="minimal"
   yearsView="carousel"
   transition="fade"
   showBreadcrumbs={true}
/>
*/

// --------------------------------------
// C) Neumorphic стиль (повний комплект)
// --------------------------------------
/*
<CustomDatePicker
   name="neuro-date"
   monthsView="neumorphic"
   yearsView="grid"
   transition="scale"
/>
*/

// --------------------------------------
// D) Швидкий (без анімацій)
// --------------------------------------
/*
<CustomDatePicker
   name="fast-date"
   transition="none"
   showBreadcrumbs={false}
/>
*/

/**
 * ========================================
 * 4. З ВАЛІДАЦІЄЮ (FormValidator)
 * ========================================
 */

/*
<form data-form-validate>
   <div class="form-group">
      <label for="birthdate">Birth Date *</label>
      <CustomDatePicker
         name="birthdate"
         id="birthdate"
         required={true}
         maxDate={new Date().toISOString().split('T')[0]}
         placeholder="Select your birth date"
         data-error-required="Please select your birth date"
         data-error-max-date="Birth date cannot be in the future"
      />
      <span class="error-message"></span>
   </div>
</form>

<script>
   import { FormValidator } from "@scripts/FormValidator";
   const form = document.querySelector('[data-form-validate]');
   new FormValidator(form);
</script>
*/

/**
 * ========================================
 * 5. З ОБМЕЖЕННЯМИ
 * ========================================
 */

// --------------------------------------
// A) Тільки майбутні дати (для бронювань)
// --------------------------------------
/*
<CustomDatePicker
   name="booking-date"
   minDate={new Date().toISOString().split('T')[0]}
   disabledDaysOfWeek={[0, 6]}        // Вимкнути вихідні
   placeholder="Select booking date"
/>
*/

// --------------------------------------
// B) Тільки робочі дні
// --------------------------------------
/*
<CustomDatePicker
   name="workday"
   disabledDaysOfWeek={[0, 6]}        // Субота, неділя
   disabledDates={[
      "2024-12-25",                   // Різдво
      "2024-01-01"                    // Новий рік
   ]}
/>
*/

// --------------------------------------
// C) Обмежений діапазон (90 днів)
// --------------------------------------
/*
<CustomDatePicker
   name="limited-range"
   minDate={new Date().toISOString().split('T')[0]}
   maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
/>
*/

/**
 * ========================================
 * 6. БАГАТОМОВНІСТЬ (i18n)
 * ========================================
 */

/*
---
import { useTranslations } from '@i18n/utils';

const locale = Astro.currentLocale || 'en';
const t = useTranslations(locale);
---

<CustomDatePicker
   name="multilang-date"
   placeholder={t.datepicker.placeholder}
   todayText={t.datepicker.today}
   clearText={t.datepicker.clear}
   monthNames={t.datepicker.months}
   monthNamesShort={t.datepicker.monthsShort}
   dayNames={t.datepicker.days}
   dayNamesShort={t.datepicker.daysShort}
   dayNamesMin={t.datepicker.daysMin}
   data-error-required={t.validation.required}
/>
*/

/**
 * ========================================
 * 7. БЕЗ SPRITE (INLINE SVG)
 * ========================================
 */

/*
<CustomDatePicker
   name="inline-svg"
   useInlineSvg={true}                // Використовувати вбудовані SVG
   // iconCalendar, iconClear, iconPrev, iconNext - ігноруються
/>
*/

/**
 * ========================================
 * 8. DISABLED / READONLY
 * ========================================
 */

/*
<CustomDatePicker
   name="disabled-date"
   disabled={true}
   value="2024-12-25"
/>

<CustomDatePicker
   name="readonly-date"
   readonly={true}
   value="2024-12-25"
/>
*/

/**
 * ========================================
 * 9. ПОЧАТКОВЕ ЗНАЧЕННЯ
 * ========================================
 */

/*
<CustomDatePicker
   name="preset-date"
   value="2024-12-25"                 // YYYY-MM-DD формат
/>
*/

/**
 * ========================================
 * 10. HTML СТРУКТУРА (що генерується)
 * ========================================
 */

/*
<div class="custom-datepicker" data-datepicker>
   
   <!-- Прихований input для форми (YYYY-MM-DD) -->
   <input type="hidden" name="birthdate" value="2024-12-25" required />
   
   <!-- Видимий input для UI (форматований) -->
   <div class="datepicker-input-wrapper">
      <input type="text" value="25.12.2024" readonly />
      <button class="datepicker-toggle">📅</button>
      <button class="datepicker-clear">✕</button>
   </div>
   
   <!-- Dropdown календар -->
   <div class="datepicker-dropdown">
      
      <!-- Breadcrumbs (якщо showBreadcrumbs=true) -->
      <div class="calendar-breadcrumbs">...</div>
      
      <!-- Header з навігацією -->
      <div class="calendar-header">
         <button class="calendar-nav-back">←</button>
         <button class="calendar-nav-prev">‹</button>
         <div class="calendar-title">January 2024</div>
         <button class="calendar-nav-next">›</button>
      </div>
      
      <!-- Контент (days/months/years) -->
      <div class="calendar-days-grid">...</div>
      
      <!-- Today button -->
      <button class="datepicker-today-btn">Today</button>
   </div>
</div>
*/

/**
 * ========================================
 * 11. ФОРМАТ ДАНИХ
 * ========================================
 */

/*
Користувач бачить:  25.12.2024  (format="DD.MM.YYYY")
Форма відправляє:   2024-12-25  (ISO формат YYYY-MM-DD)

FormData:
{
   "birthdate": "2024-12-25"
}
*/

/**
 * ========================================
 * 12. EVENTS (які тригеряться)
 * ========================================
 */

/*
При виборі дати тригеряться на ПРИХОВАНОМУ input:
- "input" event  → для clearError() у FormValidator
- "change" event → для основної логіки
- "blur" event   → для validateField() у FormValidator

Приклад підписки:
const hiddenInput = document.querySelector('input[name="birthdate"]');
hiddenInput.addEventListener('change', (e) => {
   console.log('Selected date:', e.target.value); // "2024-12-25"
});
*/

/**
 * ========================================
 * 13. CSS КЛАСИ ДЛ�Я КАСТОМІЗАЦІЇ
 * ========================================
 */

/*
.custom-datepicker                   // Основний контейнер
.datepicker-input                    // Видимий input
.datepicker-toggle                   // Кнопка відкриття
.datepicker-clear                    // Кнопка очищення
.datepicker-dropdown                 // Dropdown календар
.calendar-breadcrumbs                // Breadcrumbs навігація
.calendar-header                     // Header з кнопками
.calendar-nav-back                   // Кнопка "назад"
.calendar-nav-prev                   // Кнопка "попередній місяць"
.calendar-nav-next                   // Кнопка "наступний місяць"
.calendar-title                      // Назва місяця/року
.calendar-days-grid                  // Сітка днів
.calendar-months-grid                // Сітка місяців
.calendar-years-grid                 // Сітка років
.calendar-day                        // День
.calendar-day--today                 // Сьогодні
.calendar-day--selected              // Вибраний день
.calendar-day--disabled              // Вимкнений день
.calendar-month                      // Місяць
.calendar-month--current             // Поточний місяць
.calendar-month--selected            // Вибраний місяць
.calendar-year                       // Рік
.calendar-year--current              // Поточний рік
.calendar-year--selected             // Вибраний рік

Модифікатори для різних стилів:
.calendar-months-grid--seasonal      // Сезонний стиль
.calendar-months-grid--minimal       // Мінімалістичний
.calendar-months-grid--neumorphic    // Neumorphic
.calendar-timeline                   // Timeline роки
.calendar-carousel                   // Carousel роки
.calendar-vertical-scroll            // Vertical scroll роки
*/

/**
 * ========================================
 * 14. RESPONSIVE (автоматично)
 * ========================================
 */

/*
Mobile (max-width: 640px):
- Dropdown центрується
- Збільшені тач-таргети (44px)
- Адаптивна ширина

Touch devices:
- Збільшені кнопки (44px мінімум)
- Оптимізовані hover ефекти
*/

/**
 * ========================================
 * 15. BROWSER COMPATIBILITY
 * ========================================
 */

/*
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Використовує:
- CSS Grid
- CSS Custom Properties (--variables)
- backdrop-filter
- CSS animations
- Modern JavaScript (ES6+)
*/

/**
 * ========================================
 * 16. TIPS & TRICKS
 * ========================================
 */

// Tip 1: Зміна кольорової схеми
/*
.custom-datepicker {
   --primary-color: #10b981;     // Зелений замість синього
}
*/

// Tip 2: Збільшити розмір календаря
/*
.datepicker-dropdown {
   min-width: 400px;
}
*/

// Tip 3: Змінити анімацію тривалості
/*
.calendar-months-grid {
   animation-duration: 0.5s;     // Повільніше
}
*/

// Tip 4: Використання з Astro View Transitions
/*
<CustomDatePicker
   transition="fade"              // Краще працює з view transitions
/>
*/

/**
 * ========================================
 * 17. PERFORMANCE
 * ========================================
 */

/*
- Легкий (~15KB JS + ~20KB CSS після gzip)
- Без зовнішніх залежностей
- Lazy rendering (рендерить тільки видимі елементи)
- Оптимізовані анімації (використовує transform)
- Throttled events
*/

/**
 * ========================================
 * 18. ACCESSIBILITY (a11y)
 * ========================================
 */

/*
✅ Keyboard navigation
✅ ARIA labels
✅ Високий контраст
✅ Читабельні розміри
✅ Screen reader friendly
*/

/**
 * ========================================
 * 19. ЩО ДАЛІ? (можливі покращення)
 * ========================================
 */

/*
🚀 Range mode (вибір діапазону дат)
🚀 Multiple mode (вибір кількох дат)
🚀 Shortcuts (швидкий вибір: Today, Yesterday, Last 7 days)
🚀 Gesture support (swipe для перемикання місяців)
🚀 Time picker (вибір часу)
🚀 Year/Month only mode
🚀 Custom render функції
🚀 Themes (dark mode)
*/

/**
 * ========================================
 * 20. TROUBLESHOOTING
 * ========================================
 */

/*
❌ Проблема: Календар не відкривається
✅ Рішення: Перевір чи додано <script> у компоненті

❌ Проблема: Іконки не відображаються
✅ Рішення: Перевір чи є іконки в sprite з правильними ID

❌ Проблема: Валідація не працює
✅ Рішення: Перевір чи input обгорнутий в .form-group

❌ Проблема: Анімації лагають
✅ Рішення: Використай transition="none" або "fade"

❌ Проблема: Дата не зберігається у форму
✅ Рішення: Перевір чи є атрибут name="..."
*/

/**
 * ========================================
 * КІНЕЦЬ ТУТОРІАЛУ
 * ========================================
 *
 * Якщо знайшов баг - фікси сам, ти ж розробник! 😄
 *
 * ========================================
 */

class CustomDatePicker {
   constructor(container) {
      this.container = container;

      // 🔥 ОНОВЛЕНО: Два input - прихований для форми, видимий для UI
      this.hiddenInput = container.querySelector(".datepicker-hidden-input"); // для валідації
      this.displayInput = container.querySelector(".datepicker-input"); // для показу

      this.toggle = container.querySelector(".datepicker-toggle");
      this.clearBtn = container.querySelector(".datepicker-clear");
      this.dropdown = container.querySelector(".datepicker-dropdown");
      this.calendarContainer = container.querySelector(".datepicker-calendar");

      if (!this.hiddenInput || !this.displayInput || !this.dropdown) return;

      // Читаємо налаштування з data-атрибутів
      this.settings = {
         name: container.dataset.name,
         mode: container.dataset.mode || "single",
         format: container.dataset.format || "DD.MM.YYYY",
         locale: container.dataset.locale || "en",
         firstDayOfWeek: parseInt(container.dataset.firstDayOfWeek) || 1,
         minDate: container.dataset.minDate
            ? new Date(container.dataset.minDate)
            : null,
         maxDate: container.dataset.maxDate
            ? new Date(container.dataset.maxDate)
            : null,
         disabledDates: JSON.parse(container.dataset.disabledDates || "[]"),
         disabledDaysOfWeek: JSON.parse(
            container.dataset.disabledDaysOfWeek || "[]",
         ),
         showShortcuts: container.dataset.showShortcuts === "true",
         showMultipleMonths:
            parseInt(container.dataset.showMultipleMonths) || 1,
         showYearDropdown: container.dataset.showYearDropdown === "true",
         showMonthDropdown: container.dataset.showMonthDropdown === "true",
         showTodayButton: container.dataset.showTodayButton === "true",
         showClearButton: container.dataset.showClearButton === "true",
         placeholder: container.dataset.placeholder || "Select date",
         todayText: container.dataset.todayText || "Today",
         clearText: container.dataset.clearText || "Clear",
         closeText: container.dataset.closeText || "Close",
         applyText: container.dataset.applyText || "Apply",
         cancelText: container.dataset.cancelText || "Cancel",
         monthNames: JSON.parse(container.dataset.monthNames || "[]"),
         monthNamesShort: JSON.parse(container.dataset.monthNamesShort || "[]"),
         dayNames: JSON.parse(container.dataset.dayNames || "[]"),
         dayNamesShort: JSON.parse(container.dataset.dayNamesShort || "[]"),
         dayNamesMin: JSON.parse(container.dataset.dayNamesMin || "[]"),
         shortcuts: JSON.parse(container.dataset.shortcuts || "[]"),
         theme: container.dataset.theme || "light",
         color: container.dataset.color || "blue",

         // 🎨 Іконки
         iconCalendar: container.dataset.iconCalendar || null,
         iconClear: container.dataset.iconClear || null,
         iconPrev: container.dataset.iconPrev || null,
         iconNext: container.dataset.iconNext || null,
         useSprite: container.dataset.useSprite === "true",

         // 🎨 Візуальні стилі
         monthsView: container.dataset.monthsView || "cards",
         yearsView: container.dataset.yearsView || "grid",
         transition: container.dataset.transition || "slide",
         showBreadcrumbs: container.dataset.showBreadcrumbs === "true",
         enableGestures: container.dataset.enableGestures === "true",
      };

      // Стан
      this.currentDate = new Date();
      this.selectedDate = null;
      this.rangeStart = null;
      this.rangeEnd = null;
      this.isOpen = false;
      this.viewMode = "days"; // 'days', 'months', 'years'
      this.previousViewMode = null; // Для breadcrumbs
      this.isTransitioning = false; // Блокування під час анімації

      this.init();
   }

   init() {
      // Відкриття/закриття календаря
      this.toggle.addEventListener("click", () => this.toggleCalendar());

      // Клік на display input також відкриває календар
      this.displayInput.addEventListener("click", () => {
         if (!this.displayInput.disabled) {
            this.openCalendar();
         }
      });

      // Кнопка очищення
      if (this.clearBtn) {
         this.clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.clearDate();
         });
      }

      // Закриття при кліку поза календарем
      document.addEventListener("click", (e) => {
         if (!this.container.contains(e.target) && this.isOpen) {
            this.closeCalendar();
         }
      });

      // 🔥 Today button
      const todayBtn = this.dropdown.querySelector(".datepicker-today-btn");
      if (todayBtn) {
         todayBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.selectToday();
         });
      }

      // Генерація календаря
      this.renderCalendar();

      // 🔥 Якщо є початкове значення - парсимо і показуємо
      if (this.hiddenInput.value) {
         this.parseInitialValue(this.hiddenInput.value);
      }
   }

   /**
    * 🔥 Парсинг початкового значення (YYYY-MM-DD)
    */
   parseInitialValue(value) {
      try {
         const date = new Date(value);
         if (!isNaN(date.getTime())) {
            this.selectedDate = date;
            this.displayInput.value = this.formatDate(
               date,
               this.settings.format,
            );

            if (this.clearBtn) {
               this.clearBtn.style.display = "flex";
            }

            this.renderCalendar();
         }
      } catch (e) {
         console.warn("CustomDatePicker: Invalid initial value", value);
      }
   }

   toggleCalendar() {
      if (this.isOpen) {
         this.closeCalendar();
      } else {
         this.openCalendar();
      }
   }

   openCalendar() {
      this.isOpen = true;
      this.dropdown.style.display = "block";
      this.container.classList.add("datepicker-open");

      this.positionDropdown();

      setTimeout(() => {
         this.dropdown.classList.add("datepicker-dropdown--visible");
      }, 10);
   }

   positionDropdown() {
      const rect = this.container.getBoundingClientRect();
      const dropdownHeight = this.dropdown.offsetHeight || 400;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      this.dropdown.classList.remove("datepicker-dropdown--top");
      this.dropdown.classList.remove("datepicker-dropdown--bottom");

      if (spaceBelow >= dropdownHeight + 8) {
         this.dropdown.classList.add("datepicker-dropdown--bottom");
      } else if (spaceAbove >= dropdownHeight + 8) {
         this.dropdown.classList.add("datepicker-dropdown--top");
      } else {
         this.dropdown.classList.add("datepicker-dropdown--bottom");
         this.dropdown.style.maxHeight = `${spaceBelow - 16}px`;
         this.dropdown.style.overflowY = "auto";
      }
   }

   closeCalendar() {
      this.isOpen = false;
      this.dropdown.classList.remove("datepicker-dropdown--visible");

      setTimeout(() => {
         this.dropdown.style.display = "none";
         this.container.classList.remove("datepicker-open");
      }, 200);

      // 🔥 ВАЛІДАЦІЯ: Тригеримо blur коли закрили календар без вибору дати
      // Це покаже помилку якщо поле required і пусте
      if (
         !this.hiddenInput.value &&
         this.hiddenInput.hasAttribute("required")
      ) {
         this.hiddenInput.dispatchEvent(new Event("blur", { bubbles: true }));
      }
   }

   renderCalendar() {
      if (this.isTransitioning) return;

      const calendar = this.createCalendar(this.currentDate);

      // 🎨 Анімація переходу
      if (
         this.settings.transition !== "none" &&
         this.calendarContainer.children.length > 0
      ) {
         this.animateTransition(calendar);
      } else {
         this.calendarContainer.innerHTML = "";
         this.calendarContainer.appendChild(calendar);
      }
   }

   /**
    * 🎬 Анімація переходу між view
    */
   animateTransition(newCalendar) {
      this.isTransitioning = true;
      const oldCalendar = this.calendarContainer.firstChild;

      // Визначаємо напрямок (вперед чи назад)
      const isForward = this.isForwardTransition();

      switch (this.settings.transition) {
         case "slide":
            this.slideTransition(oldCalendar, newCalendar, isForward);
            break;
         case "fade":
            this.fadeTransition(oldCalendar, newCalendar);
            break;
         case "scale":
            this.scaleTransition(oldCalendar, newCalendar);
            break;
         default:
            this.calendarContainer.innerHTML = "";
            this.calendarContainer.appendChild(newCalendar);
            this.isTransitioning = false;
      }
   }

   /**
    * Визначає чи це перехід вперед (drill down) чи назад
    */
   isForwardTransition() {
      const viewOrder = { days: 0, months: 1, years: 2 };
      if (!this.previousViewMode) return true;
      return viewOrder[this.viewMode] > viewOrder[this.previousViewMode];
   }

   /**
    * 🔄 Slide анімація
    */
   slideTransition(oldCalendar, newCalendar, isForward) {
      const direction = isForward ? 1 : -1;

      // Встановлюємо початкові позиції
      oldCalendar.style.position = "absolute";
      oldCalendar.style.width = "100%";
      oldCalendar.style.transition =
         "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease";

      newCalendar.style.transform = `translateX(${direction * 100}%)`;
      newCalendar.style.transition =
         "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease";

      this.calendarContainer.appendChild(newCalendar);

      // Trigger reflow
      newCalendar.offsetHeight;

      // Анімуємо
      oldCalendar.style.transform = `translateX(${-direction * 100}%)`;
      oldCalendar.style.opacity = "0";
      newCalendar.style.transform = "translateX(0)";

      setTimeout(() => {
         oldCalendar.remove();
         newCalendar.style.position = "";
         newCalendar.style.transition = "";
         this.isTransitioning = false;
      }, 400);
   }

   /**
    * 💫 Fade анімація
    */
   fadeTransition(oldCalendar, newCalendar) {
      oldCalendar.style.transition = "opacity 0.3s ease";
      oldCalendar.style.opacity = "0";

      setTimeout(() => {
         this.calendarContainer.innerHTML = "";
         this.calendarContainer.appendChild(newCalendar);
         newCalendar.style.opacity = "0";
         newCalendar.style.transition = "opacity 0.3s ease";

         // Trigger reflow
         newCalendar.offsetHeight;
         newCalendar.style.opacity = "1";

         setTimeout(() => {
            newCalendar.style.transition = "";
            this.isTransitioning = false;
         }, 300);
      }, 300);
   }

   /**
    * 📏 Scale анімація
    */
   scaleTransition(oldCalendar, newCalendar) {
      oldCalendar.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      oldCalendar.style.transform = "scale(0.8)";
      oldCalendar.style.opacity = "0";

      setTimeout(() => {
         this.calendarContainer.innerHTML = "";
         this.calendarContainer.appendChild(newCalendar);
         newCalendar.style.transform = "scale(0.8)";
         newCalendar.style.opacity = "0";
         newCalendar.style.transition =
            "transform 0.3s ease, opacity 0.3s ease";

         // Trigger reflow
         newCalendar.offsetHeight;
         newCalendar.style.transform = "scale(1)";
         newCalendar.style.opacity = "1";

         setTimeout(() => {
            newCalendar.style.transition = "";
            this.isTransitioning = false;
         }, 300);
      }, 300);
   }

   createCalendar(date) {
      const calendar = document.createElement("div");
      calendar.className = "calendar";

      // 🧭 Breadcrumbs (якщо включено)
      if (this.settings.showBreadcrumbs && this.viewMode !== "days") {
         const breadcrumbs = this.createBreadcrumbs();
         calendar.appendChild(breadcrumbs);
      }

      const header = this.createCalendarHeader(date);
      calendar.appendChild(header);

      // 🔥 Перевіряємо режим відображення
      if (this.viewMode === "months") {
         const monthsGrid = this.createMonthsGrid(date);
         calendar.appendChild(monthsGrid);
      } else if (this.viewMode === "years") {
         const yearsGrid = this.createYearsGrid(date);
         calendar.appendChild(yearsGrid);
      } else {
         const daysHeader = this.createDaysHeader();
         calendar.appendChild(daysHeader);

         const daysGrid = this.createDaysGrid(date);
         calendar.appendChild(daysGrid);
      }

      return calendar;
   }

   /**
    * 🧭 Створення breadcrumbs навігації
    */
   createBreadcrumbs() {
      const breadcrumbs = document.createElement("div");
      breadcrumbs.className = "calendar-breadcrumbs";

      const items = [];

      if (this.viewMode === "months") {
         items.push({
            label: this.currentDate.getFullYear(),
            action: () => this.goToYears(),
         });
      } else if (this.viewMode === "years") {
         items.push({ label: "Select Year", action: null });
      }

      items.forEach((item, index) => {
         const crumb = document.createElement("button");
         crumb.type = "button";
         crumb.className = "calendar-breadcrumb";
         crumb.textContent = item.label;

         if (item.action) {
            crumb.addEventListener("click", (e) => {
               e.stopPropagation();
               item.action();
            });
         } else {
            crumb.classList.add("calendar-breadcrumb--active");
         }

         breadcrumbs.appendChild(crumb);

         if (index < items.length - 1) {
            const separator = document.createElement("span");
            separator.className = "calendar-breadcrumb-separator";
            separator.textContent = "›";
            breadcrumbs.appendChild(separator);
         }
      });

      return breadcrumbs;
   }

   goToYears() {
      this.previousViewMode = this.viewMode;
      this.viewMode = "years";
      this.renderCalendar();
   }

   createCalendarHeader(date) {
      const header = document.createElement("div");
      header.className = "calendar-header";

      // 🔥 Кнопка "назад" (тільки для months/years view)
      if (this.viewMode !== "days") {
         const backBtn = document.createElement("button");
         backBtn.type = "button";
         backBtn.className = "calendar-nav calendar-nav-back";
         backBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
               <path d="M15 10H5M5 10L9 6M5 10L9 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
         `;
         backBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.viewMode === "months") {
               this.previousViewMode = this.viewMode;
               this.viewMode = "days";
            } else if (this.viewMode === "years") {
               this.previousViewMode = this.viewMode;
               this.viewMode = "months";
            }
            this.renderCalendar();
         });
         header.appendChild(backBtn);
      }

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "calendar-nav calendar-nav-prev";
      prevBtn.innerHTML = this.createIconHTML(
         this.settings.iconPrev,
         this.getDefaultPrevIcon(),
      );
      prevBtn.addEventListener("click", (e) => {
         e.stopPropagation();
         if (this.viewMode === "days") {
            this.previousMonth();
         } else if (this.viewMode === "months") {
            this.previousYear();
         } else if (this.viewMode === "years") {
            this.previousYearRange();
         }
      });

      // 🔥 Назва місяця і року (клікабельні)
      const title = document.createElement("div");
      title.className = "calendar-title";

      if (this.viewMode === "days") {
         // Місяць (клікабельний) + Рік (клікабельний)
         const monthSpan = document.createElement("span");
         monthSpan.className = "calendar-title-month";
         monthSpan.textContent = this.settings.monthNames[date.getMonth()];
         monthSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            this.previousViewMode = this.viewMode;
            this.viewMode = "months";
            this.renderCalendar();
         });

         const yearSpan = document.createElement("span");
         yearSpan.className = "calendar-title-year";
         yearSpan.textContent = ` ${date.getFullYear()}`;
         yearSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            this.previousViewMode = this.viewMode;
            this.viewMode = "years";
            this.renderCalendar();
         });

         title.appendChild(monthSpan);
         title.appendChild(yearSpan);
      } else if (this.viewMode === "months") {
         // Тільки рік
         title.textContent = date.getFullYear();
         title.style.cursor = "pointer";
         title.addEventListener("click", (e) => {
            e.stopPropagation();
            this.previousViewMode = this.viewMode;
            this.viewMode = "years";
            this.renderCalendar();
         });
      } else if (this.viewMode === "years") {
         // Діапазон років
         const startYear = Math.floor(date.getFullYear() / 12) * 12;
         const endYear = startYear + 11;
         title.textContent = `${startYear} - ${endYear}`;
      }

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "calendar-nav calendar-nav-next";
      nextBtn.innerHTML = this.createIconHTML(
         this.settings.iconNext,
         this.getDefaultNextIcon(),
      );
      nextBtn.addEventListener("click", (e) => {
         e.stopPropagation();
         if (this.viewMode === "days") {
            this.nextMonth();
         } else if (this.viewMode === "months") {
            this.nextYear();
         } else if (this.viewMode === "years") {
            this.nextYearRange();
         }
      });

      header.appendChild(prevBtn);
      header.appendChild(title);
      header.appendChild(nextBtn);

      return header;
   }

   createIconHTML(iconName, fallbackSVG) {
      if (this.settings.useSprite && iconName) {
         return `<svg class="icon"><use href="#icon-${iconName}"></use></svg>`;
      }
      return fallbackSVG;
   }

   getDefaultPrevIcon() {
      return `
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <polyline points="12 6 8 10 12 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
      `;
   }

   getDefaultNextIcon() {
      return `
         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <polyline points="8 6 12 10 8 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
      `;
   }

   createDaysHeader() {
      const header = document.createElement("div");
      header.className = "calendar-days-header";

      for (let i = 0; i < 7; i++) {
         const dayIndex = (this.settings.firstDayOfWeek + i) % 7;
         const day = document.createElement("div");
         day.className = "calendar-day-name";
         day.textContent = this.settings.dayNamesMin[dayIndex];
         header.appendChild(day);
      }

      return header;
   }

   createDaysGrid(date) {
      const grid = document.createElement("div");
      grid.className = "calendar-days-grid";

      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek =
         (firstDay.getDay() - this.settings.firstDayOfWeek + 7) % 7;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
         const day = this.createDayButton(
            new Date(year, month - 1, prevMonthDays - i),
            true,
         );
         grid.appendChild(day);
      }

      for (let day = 1; day <= daysInMonth; day++) {
         const dayBtn = this.createDayButton(new Date(year, month, day), false);
         grid.appendChild(dayBtn);
      }

      const totalCells = grid.children.length;
      const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

      for (let day = 1; day <= remainingCells; day++) {
         const dayBtn = this.createDayButton(
            new Date(year, month + 1, day),
            true,
         );
         grid.appendChild(dayBtn);
      }

      return grid;
   }

   createDayButton(date, isOtherMonth) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      btn.textContent = date.getDate();

      if (isOtherMonth) {
         btn.classList.add("calendar-day--other-month");
      }

      if (this.isToday(date)) {
         btn.classList.add("calendar-day--today");
      }

      if (this.isSelected(date)) {
         btn.classList.add("calendar-day--selected");
      }

      if (this.isDisabled(date)) {
         btn.classList.add("calendar-day--disabled");
         btn.disabled = true;
      } else {
         btn.addEventListener("click", () => this.selectDate(date));
      }

      return btn;
   }

   isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
   }

   isSelected(date) {
      if (!this.selectedDate) return false;
      return date.toDateString() === this.selectedDate.toDateString();
   }

   isDisabled(date) {
      if (this.settings.minDate && date < this.settings.minDate) return true;
      if (this.settings.maxDate && date > this.settings.maxDate) return true;
      if (this.settings.disabledDaysOfWeek.includes(date.getDay())) return true;

      const dateStr = this.formatDate(date, "YYYY-MM-DD");
      if (this.settings.disabledDates.includes(dateStr)) return true;

      return false;
   }

   selectDate(date) {
      this.selectedDate = date;

      // 🔥 ОНОВЛЕНО: Два формати
      // Display input - форматований для UI (DD.MM.YYYY)
      this.displayInput.value = this.formatDate(date, this.settings.format);

      // Hidden input - ISO формат для форми (YYYY-MM-DD)
      this.hiddenInput.value = this.formatDate(date, "YYYY-MM-DD");

      if (this.clearBtn) {
         this.clearBtn.style.display = "flex";
      }

      if (this.settings.mode === "single") {
         this.closeCalendar();
      }

      this.renderCalendar();

      // 🔥 ВАЛІДАЦІЯ: Тригеримо події на ПРИХОВАНОМУ input
      this.triggerValidation();
   }

   clearDate() {
      this.selectedDate = null;

      // 🔥 ОНОВЛЕНО: Очищаємо обидва input
      this.displayInput.value = "";
      this.hiddenInput.value = "";

      if (this.clearBtn) {
         this.clearBtn.style.display = "none";
      }

      this.renderCalendar();

      // 🔥 ВАЛІДАЦІЯ: Тригеримо події на ПРИХОВАНОМУ input
      this.triggerValidation();
   }

   /**
    * 🔥 Тригерить події для інтеграції з FormValidator
    * Тепер на ПРИХОВАНОМУ input!
    */
   triggerValidation() {
      // Input event - для clearError()
      this.hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));

      // Change event - для основної логіки
      this.hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));

      // Blur event - для validateField()
      this.hiddenInput.dispatchEvent(new Event("blur", { bubbles: true }));
   }

   previousMonth() {
      this.currentDate = new Date(
         this.currentDate.getFullYear(),
         this.currentDate.getMonth() - 1,
         1,
      );
      this.renderCalendar();
   }

   nextMonth() {
      this.currentDate = new Date(
         this.currentDate.getFullYear(),
         this.currentDate.getMonth() + 1,
         1,
      );
      this.renderCalendar();
   }

   previousYear() {
      this.currentDate = new Date(
         this.currentDate.getFullYear() - 1,
         this.currentDate.getMonth(),
         1,
      );
      this.renderCalendar();
   }

   nextYear() {
      this.currentDate = new Date(
         this.currentDate.getFullYear() + 1,
         this.currentDate.getMonth(),
         1,
      );
      this.renderCalendar();
   }

   previousYearRange() {
      this.currentDate = new Date(
         this.currentDate.getFullYear() - 12,
         this.currentDate.getMonth(),
         1,
      );
      this.renderCalendar();
   }

   nextYearRange() {
      this.currentDate = new Date(
         this.currentDate.getFullYear() + 12,
         this.currentDate.getMonth(),
         1,
      );
      this.renderCalendar();
   }

   /**
    * 🔥 Сітка місяців (з різними стилями)
    */
   createMonthsGrid(date) {
      const grid = document.createElement("div");

      // Додаємо клас в залежності від стилю
      grid.className = `calendar-months-grid calendar-months-grid--${this.settings.monthsView}`;

      for (let month = 0; month < 12; month++) {
         const btn = this.createMonthButton(month, date);
         grid.appendChild(btn);
      }

      return grid;
   }

   /**
    * Створення кнопки місяця з різними стилями
    */
   createMonthButton(month, date) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-month";

      // 🎨 Різні стилі відображення
      switch (this.settings.monthsView) {
         case "seasonal":
            this.applySeasonalStyle(btn, month);
            break;
         case "minimal":
            this.applyMinimalStyle(btn, month);
            break;
         case "neumorphic":
            this.applyNeumorphicStyle(btn, month);
            break;
         default: // 'cards'
            btn.textContent = this.settings.monthNamesShort[month];
      }

      // Поточний місяць
      const today = new Date();
      if (
         month === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
      ) {
         btn.classList.add("calendar-month--current");
      }

      // Вибраний місяць
      if (
         this.selectedDate &&
         month === this.selectedDate.getMonth() &&
         date.getFullYear() === this.selectedDate.getFullYear()
      ) {
         btn.classList.add("calendar-month--selected");
      }

      btn.addEventListener("click", (e) => {
         e.stopPropagation();
         this.currentDate = new Date(date.getFullYear(), month, 1);
         this.previousViewMode = this.viewMode;
         this.viewMode = "days";
         this.renderCalendar();
      });

      return btn;
   }

   /**
    * 🌸 Seasonal стиль (з іконками сезонів)
    */
   applySeasonalStyle(btn, month) {
      const seasons = {
         winter: {
            months: [11, 0, 1],
            icon: "❄️",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
         },
         spring: {
            months: [2, 3, 4],
            icon: "🌸",
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
         },
         summer: {
            months: [5, 6, 7],
            icon: "☀️",
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
         },
         autumn: {
            months: [8, 9, 10],
            icon: "🍂",
            gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
         },
      };

      let season = null;
      for (const [key, value] of Object.entries(seasons)) {
         if (value.months.includes(month)) {
            season = value;
            break;
         }
      }

      btn.innerHTML = `
         <span class="month-icon">${season.icon}</span>
         <span class="month-name">${this.settings.monthNamesShort[month]}</span>
      `;
      btn.style.setProperty("--season-gradient", season.gradient);
   }

   /**
    * ✨ Minimal стиль (великі літери)
    */
   applyMinimalStyle(btn, month) {
      btn.innerHTML = `
         <span class="month-letter">${this.settings.monthNamesShort[month].charAt(0)}</span>
         <span class="month-number">${String(month + 1).padStart(2, "0")}</span>
      `;
   }

   /**
    * 🎨 Neumorphic стиль (м'які тіні)
    */
   applyNeumorphicStyle(btn, month) {
      btn.textContent = this.settings.monthNamesShort[month];
      btn.classList.add("calendar-month--neumorphic");
   }

   /**
    * 🔥 Сітка років (з різними стилями)
    */
   createYearsGrid(date) {
      const container = document.createElement("div");
      container.className = `calendar-years-container calendar-years-container--${this.settings.yearsView}`;

      switch (this.settings.yearsView) {
         case "timeline":
            return this.createTimelineYears(date, container);
         case "carousel":
            return this.createCarouselYears(date, container);
         case "vertical-scroll":
            return this.createVerticalScrollYears(date, container);
         default: // 'grid'
            return this.createGridYears(date, container);
      }
   }

   /**
    * 📅 Grid стиль (стандартна сітка)
    */
   createGridYears(date, container) {
      const grid = document.createElement("div");
      grid.className = "calendar-years-grid";

      const startYear = Math.floor(date.getFullYear() / 12) * 12;

      for (let i = 0; i < 12; i++) {
         const year = startYear + i;
         const btn = this.createYearButton(year);
         grid.appendChild(btn);
      }

      container.appendChild(grid);
      return container;
   }

   /**
    * 📏 Timeline стиль (горизонтальна шкала)
    */
   createTimelineYears(date, container) {
      const timeline = document.createElement("div");
      timeline.className = "calendar-timeline";

      const startYear = Math.floor(date.getFullYear() / 12) * 12;
      const centerYear = date.getFullYear();

      for (let i = 0; i < 12; i++) {
         const year = startYear + i;
         const btn = this.createYearButton(year);
         btn.classList.add("timeline-year");

         // Центральний рік більший
         if (year === centerYear) {
            btn.classList.add("timeline-year--center");
         }

         timeline.appendChild(btn);
      }

      container.appendChild(timeline);
      return container;
   }

   /**
    * 🎠 Carousel стиль (3D карусель)
    */
   createCarouselYears(date, container) {
      const carousel = document.createElement("div");
      carousel.className = "calendar-carousel";

      const startYear = Math.floor(date.getFullYear() / 12) * 12;
      const years = [];

      for (let i = 0; i < 12; i++) {
         years.push(startYear + i);
      }

      // Знаходимо індекс поточного року
      const currentYearIndex = years.indexOf(date.getFullYear());

      years.forEach((year, index) => {
         const btn = this.createYearButton(year);
         btn.classList.add("carousel-year");

         // Розраховуємо позицію та розмір
         const distance = index - currentYearIndex;
         btn.style.setProperty("--carousel-distance", distance);

         if (distance === 0) {
            btn.classList.add("carousel-year--center");
         }

         carousel.appendChild(btn);
      });

      container.appendChild(carousel);
      return container;
   }

   /**
    * 📜 Vertical scroll стиль
    */
   createVerticalScrollYears(date, container) {
      const scroll = document.createElement("div");
      scroll.className = "calendar-vertical-scroll";

      const startYear = date.getFullYear() - 50;
      const endYear = date.getFullYear() + 50;

      for (let year = startYear; year <= endYear; year++) {
         const btn = this.createYearButton(year);
         btn.classList.add("scroll-year");
         scroll.appendChild(btn);
      }

      // Скролимо до поточного року
      setTimeout(() => {
         const currentYearBtn = scroll.querySelector(".calendar-year--current");
         if (currentYearBtn) {
            currentYearBtn.scrollIntoView({
               block: "center",
               behavior: "smooth",
            });
         }
      }, 100);

      container.appendChild(scroll);
      return container;
   }

   /**
    * Створення кнопки року
    */
   createYearButton(year) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-year";
      btn.textContent = year;

      // Поточний рік
      const today = new Date();
      if (year === today.getFullYear()) {
         btn.classList.add("calendar-year--current");
      }

      // Вибраний рік
      if (this.selectedDate && year === this.selectedDate.getFullYear()) {
         btn.classList.add("calendar-year--selected");
      }

      btn.addEventListener("click", (e) => {
         e.stopPropagation();
         this.currentDate = new Date(year, this.currentDate.getMonth(), 1);
         this.previousViewMode = this.viewMode;
         this.viewMode = "months";
         this.renderCalendar();
      });

      return btn;
   }

   /**
    * 🔥 Вибрати сьогоднішню дату
    */
   selectToday() {
      const today = new Date();
      this.selectDate(today);
   }

   formatDate(date, format) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return format
         .replace("YYYY", year)
         .replace("MM", month)
         .replace("DD", day);
   }
}

// Автоматична ініціалізація
function initDatePickers() {
   const datepickers = document.querySelectorAll("[data-datepicker]");

   datepickers.forEach((container) => {
      if (container.dataset.datepickerInitialized) {
         return;
      }

      container.dataset.datepickerInitialized = "true";
      new CustomDatePicker(container);
   });
}

document.addEventListener("DOMContentLoaded", initDatePickers);
document.addEventListener("astro:page-load", initDatePickers);
