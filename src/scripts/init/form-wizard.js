/**
 * FormWizard - мультикрокові форми з ProgressStepper
 * Працює з існуючою валідацією з contact-form.js
 * Ніякого тексту в JS - все через атрибути!
 * З плавними переходами, кліком на степпер, inline редагуванням та прогресом
 * Опціональне блокування кнопки "Далі" через data-wizard-disable-next="true"
 */

/**
 * ============================================================================
 * FormWizard - ПОВНИЙ ТУТОРІАЛ
 * ============================================================================
 *
 * Мультикрокові форми з ProgressStepper, валідацією, анімаціями та inline редагуванням.
 * Працює з існуючою валідацією з contact-form.js — ніякого тексту в JS!
 *
 * ============================================================================
 * БАЗОВЕ ВИКОРИСТАННЯ
 * ============================================================================
 *
 * 1. МІНІМАЛЬНА КОНФІГУРАЦІЯ:
 *
 * ```astro
 * <ProgressStepper
 *    steps={[
 *       { label: "Крок 1" },
 *       { label: "Крок 2" },
 *       { label: "Крок 3" },
 *    ]}
 *    currentStep={1}
 *    id="my-stepper"
 * />
 *
 * <ContactForm
 *    formId="wizard-form"
 *    wizardId="my-stepper"
 *    successMessage="Готово!"
 * >
 *    <div data-wizard-step="1">
 *       <h2>Крок 1</h2>
 *       <input name="name" required />
 *    </div>
 *
 *    <div data-wizard-step="2">
 *       <h2>Крок 2</h2>
 *       <input name="email" type="email" required />
 *    </div>
 *
 *    <div data-wizard-step="3" data-wizard-summary>
 *       <h2>Підсумок</h2>
 *    </div>
 *
 *    <div class="wizard-buttons">
 *       <button type="button" data-wizard-prev>Назад</button>
 *       <button type="button" data-wizard-next>Далі</button>
 *       <button type="submit" data-wizard-submit>Відправити</button>
 *    </div>
 * </ContactForm>
 * ```
 *
 * ============================================================================
 * ОБОВ'ЯЗКОВІ АТРИБУТИ
 * ============================================================================
 *
 * ProgressStepper:
 * - id="..."                    - Унікальний ID (має співпадати з wizardId форми)
 * - steps={[...]}               - Масив об'єктів {label: "..."}
 * - currentStep={1}             - Початковий крок (зазвичай 1)
 *
 * ContactForm:
 * - formId="..."                - ID форми
 * - wizardId="..."              - ID степпера (має співпадати з ProgressStepper id)
 * - successMessage="..."        - Повідомлення після успішної відправки
 *
 * Кроки:
 * - data-wizard-step="1"        - Номер кроку (1, 2, 3...)
 * - data-wizard-summary         - Останній крок (підсумок)
 *
 * Кнопки:
 * - data-wizard-prev            - Кнопка "Назад"
 * - data-wizard-next            - Кнопка "Далі"
 * - data-wizard-submit          - Кнопка відправки (показується на останньому кроці)
 *
 * ============================================================================
 * ОПЦІОНАЛЬНІ АТРИБУТИ
 * ============================================================================
 *
 * === PROGRESSSTEPPER ===
 *
 * orientation="horizontal|vertical"
 * - Орієнтація степпера
 * - За замовчуванням: "horizontal"
 *
 * size="sm|md|lg"
 * - Розмір кружків і ліній
 * - За замовчуванням: "md"
 *
 * checkIcon="icon-name"
 * - Кастомна іконка для завершених кроків (зі спрайту)
 * - Замість дефолтної галочки
 * - Приклад: checkIcon="check-circle"
 *
 * activeIcon="icon-name"
 * - Кастомна іконка для активного кроку
 * - Приклад: activeIcon="star"
 *
 * color="#3b82f6"
 * - Кастомний колір активного кроку
 *
 * showLabels={false}
 * - Сховати назви кроків
 *
 * showNumbers={false}
 * - Сховати номери в кружках
 *
 * showCheckmarks={false}
 * - Сховати галочки у завершених кроках
 *
 * showLine={false}
 * - Сховати лінії між кроками
 *
 * responsive={false}
 * - Вимкнути адаптивність (horizontal → vertical на mobile)
 *
 * data-allow-click="false"
 * - Заборонити клік на степпер для переходу між кроками
 * - За замовчуванням можна клікати на пройдені кроки
 *
 * === CONTACTFORM ===
 *
 * wizardDisableNext={true}
 * - Блокувати кнопку "Далі" поки поля не валідні
 * - Кнопка буде disabled поки required поля порожні
 * - Рекомендовано для покращення UX
 *
 * modalType="modal|inline"
 * - Де показувати success/error повідомлення
 * - "modal" - у модальному вікні на весь екран
 * - "inline" - під формою
 * - За замовчуванням: "inline"
 *
 * lockScroll={true}
 * - Блокувати скрол при відкритті modal
 * - Працює тільки якщо modalType="modal"
 *
 * === КРОКИ ===
 *
 * data-wizard-label="Назва кроку"
 * - Кастомна назва для підсумку (якщо не хочеш брати з h2/h3)
 *
 * data-wizard-edit-text="Edit"
 * - Текст кнопки редагування в підсумку
 * - За замовчуванням: "✎"
 * - Додається до кроку з data-wizard-summary
 *
 * === ПОЛЯ ===
 *
 * data-wizard-field="Назва поля"
 * - Кастомна назва поля для підсумку
 * - Якщо не вказано — береться автоматично з <label>, placeholder або name
 *
 * data-wizard-value-checked="Так"
 * - Текст для checkbox коли він checked
 * - За замовчуванням: "✓"
 *
 * data-wizard-value-label="Опція 1"
 * - Текст для radio button у підсумку
 * - За замовчуванням: value
 *
 * data-wizard-value-files="2 файли"
 * - Текст для file input у підсумку
 * - За замовчуванням: список назв файлів
 *
 * ============================================================================
 * ПРИКЛАДИ ВИКОРИСТАННЯ
 * ============================================================================
 *
 * === 1. БАЗОВИЙ WIZARD З 3 КРОКАМИ ===
 *
 * <ProgressStepper
 *    id="signup-wizard"
 *    steps={[
 *       { label: "Особисті дані" },
 *       { label: "Контакти" },
 *       { label: "Підсумок" },
 *    ]}
 *    currentStep={1}
 * />
 *
 * <ContactForm
 *    formId="signup-form"
 *    wizardId="signup-wizard"
 *    wizardDisableNext={true}
 *    successMessage="Реєстрація завершена!"
 * >
 *    <div data-wizard-step="1">
 *       <h2>Крок 1: Особисті дані</h2>
 *       <div class="form-group">
 *          <label for="name">Ім'я *</label>
 *          <input id="name" name="name" required />
 *       </div>
 *    </div>
 *
 *    <div data-wizard-step="2">
 *       <h2>Крок 2: Контакти</h2>
 *       <div class="form-group">
 *          <label for="email">Email *</label>
 *          <input id="email" name="email" type="email" required />
 *       </div>
 *    </div>
 *
 *    <div data-wizard-step="3" data-wizard-summary data-wizard-edit-text="Змінити">
 *       <h2>Крок 3: Підсумок</h2>
 *    </div>
 *
 *    <div class="wizard-buttons">
 *       <button type="button" data-wizard-prev>Назад</button>
 *       <button type="button" data-wizard-next>Далі</button>
 *       <button type="submit" data-wizard-submit>Відправити</button>
 *    </div>
 * </ContactForm>
 *
 * === 2. З КАСТОМНИМИ ІКОНКАМИ ===
 *
 * <ProgressStepper
 *    id="order-wizard"
 *    checkIcon="check-circle"
 *    activeIcon="star"
 *    steps={[...]}
 *    currentStep={1}
 * />
 *
 * === 3. ВЕРТИКАЛЬНИЙ СТЕППЕР БЕЗ ЛІНІЙ ===
 *
 * <ProgressStepper
 *    id="survey-wizard"
 *    orientation="vertical"
 *    showLine={false}
 *    size="sm"
 *    steps={[...]}
 *    currentStep={1}
 * />
 *
 * === 4. З MODAL ПОВІДОМЛЕННЯМИ ===
 *
 * <ContactForm
 *    formId="wizard-form"
 *    wizardId="my-stepper"
 *    modalType="modal"
 *    lockScroll={true}
 *    successMessage="Дякуємо!"
 *    errorMessage="Помилка відправки"
 * >
 *    ...
 * </ContactForm>
 *
 * === 5. КАСТОМНІ НАЗВИ ПОЛІВ У ПІДСУМКУ ===
 *
 * <input
 *    name="firstName"
 *    data-wizard-field="Ім'я"
 *    required
 * />
 *
 * <input
 *    type="checkbox"
 *    name="subscribe"
 *    data-wizard-value-checked="Так, підписуюсь"
 * />
 *
 * <input
 *    type="radio"
 *    name="plan"
 *    value="pro"
 *    data-wizard-value-label="Професійний план"
 * />
 *
 * ============================================================================
 * ОСОБЛИВОСТІ
 * ============================================================================
 *
 * 1. АВТОМАТИЧНЕ ВИЗНАЧЕННЯ НАЗВ ПОЛІВ
 *    - Якщо немає data-wizard-field, назва береться автоматично:
 *      1) <label for="field-id">
 *      2) <label> в .form-group
 *      3) placeholder
 *      4) name атрибут
 *
 * 2. ВАЛІДАЦІЯ
 *    - При кліку "Далі" спрацьовує повна валідація
 *    - Якщо є помилки — перехід блокується
 *    - Якщо wizardDisableNext={true} — кнопка disabled поки поля порожні
 *
 * 3. КЛІК НА СТЕППЕР
 *    - За замовчуванням можна клікати на пройдені кроки
 *    - Щоб заборонити: data-allow-click="false" на ProgressStepper
 *
 * 4. INLINE РЕДАГУВАННЯ
 *    - У підсумку біля кожного поля є кнопка ✏️ (показується при hover)
 *    - Клік відкриває інпут для редагування прямо в підсумку
 *    - Enter = зберегти, Escape = скасувати
 *
 * 5. АНІМАЦІЇ
 *    - Плавні переходи між кроками (fade + slide)
 *    - Анімована лінія прогресу
 *    - Shimmer ефект на прогрес-барі заповнення
 *
 * 6. ПРОГРЕС ЗАПОВНЕННЯ
 *    - У підсумку показується скільки полів заповнено в кожному кроці
 *    - Приклад: "2/3 поля (67%)"
 *
 * 7. СПРАЙТ ІКОНКИ
 *    - checkIcon і activeIcon використовують спрайт з /src/icons/
 *    - Формат: <use href="#icon-{name}"></use>
 *    - Назва без розширення .svg
 *
 * ============================================================================
 * SCSS КЛАСИ ДЛЯ КАСТОМІЗАЦІЇ
 * ============================================================================
 *
 * CSS змінні (можна перевизначити):
 * --stepper-color: #3b82f6               - Колір активного кроку
 * --stepper-color-inactive: #d1d5db      - Колір неактивних кроків
 * --stepper-color-completed: #10b981     - Колір завершених кроків
 * --stepper-circle-size: 40px            - Розмір кружків
 * --stepper-line-thickness: 4px          - Товщина ліній
 * --stepper-gap: 16px                    - Відступ між елементами
 *
 * Класи степпера:
 * .progress-stepper                      - Контейнер
 * .progress-stepper__step                - Окремий крок
 * .progress-stepper__step--active        - Активний крок
 * .progress-stepper__step--completed     - Завершений крок
 * .progress-stepper__step-circle         - Кружок кроку
 * .progress-stepper__line                - Лінія між кроками
 * .progress-stepper__line-fill           - Заповнена частина лінії
 *
 * Класи підсумку:
 * .wizard-summary                        - Контейнер підсумку
 * .wizard-summary__section               - Секція одного кроку
 * .wizard-summary__title                 - Назва кроку
 * .wizard-summary__edit                  - Кнопка редагування секції
 * .wizard-summary__field                 - Окреме поле
 * .wizard-summary__field-label           - Назва поля
 * .wizard-summary__field-value           - Значення поля
 * .wizard-summary__field-edit            - Кнопка inline редагування
 * .wizard-summary__progress              - Прогрес заповнення
 * .wizard-summary__progress-bar          - Прогрес-бар
 * .wizard-summary__progress-fill         - Заповнена частина прогресу
 *
 * Класи анімації:
 * .wizard-step--active                   - Активний крок (видимий)
 * .wizard-step--hidden                   - Прихований крок
 * .wizard-step--enter                    - Крок входить (анімація)
 * .wizard-step--exit                     - Крок виходить (анімація)
 *
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 *
 * ПРОБЛЕМА: Wizard не ініціалізується
 * РІШЕННЯ: Перевір що:
 *   - ProgressStepper має id="..."
 *   - ContactForm має wizardId="..." що співпадає з id степпера
 *   - Є хоча б один <div data-wizard-step="1">
 *   - formWizard.js імпортований (зазвичай через ProgressStepper)
 *
 * ПРОБЛЕМА: Кнопка "Далі" не працює
 * РІШЕННЯ: Перевір що:
 *   - Кнопка має data-wizard-next атрибут
 *   - Кнопка має type="button" (не type="submit")
 *   - Валідація проходить (required поля заповнені)
 *
 * ПРОБЛЕМА: Підсумок порожній
 * РІШЕННЯ: Перевір що:
 *   - Поля мають name атрибут
 *   - Поля заповнені (порожні поля не показуються)
 *   - Для кастомних назв додай data-wizard-field="..."
 *
 * ПРОБЛЕМА: Лінія зелена на старті
 * РІШЕННЯ: Оновити SCSS — додати @if $i > 1 у циклах заповнення
 *
 * ПРОБЛЕМА: Кастомні іконки не показуються
 * РІШЕННЯ: Перевір що:
 *   - Іконка існує в /src/icons/{name}.svg
 *   - IconSprite рендериться на сторінці
 *   - Назва передана без розширення: checkIcon="check" не checkIcon="check.svg"
 *
 * ============================================================================
 * СУМІСНІСТЬ
 * ============================================================================
 *
 * - Працює з Astro View Transitions
 * - Працює з існуючою валідацією contact-form.js
 * - Адаптивний (horizontal → vertical на mobile)
 * - Підтримує всі типи інпутів: text, email, checkbox, radio, select, textarea, file
 * - Не потребує додаткових залежностей
 *
 * ============================================================================
 */

class FormWizard {
   constructor() {
      this.wizards = new Map();
      this.init();
   }

   init() {
      const forms = document.querySelectorAll("[data-wizard]");

      if (forms.length === 0) return;

      forms.forEach((form) => {
         const wizardId = form.dataset.wizard;
         const steps = form.querySelectorAll("[data-wizard-step]");

         if (steps.length === 0) {
            console.warn("FormWizard: No steps found for", wizardId);
            return;
         }

         const wizard = {
            id: wizardId,
            form: form,
            steps: steps,
            currentStep: 1,
            totalSteps: steps.length,
            data: new Map(),
            stepper: document.getElementById(wizardId),
         };

         this.wizards.set(wizardId, wizard);
         this.setupWizard(wizard);
      });
   }

   setupWizard(wizard) {
      wizard.steps.forEach((step, index) => {
         if (index === 0) {
            step.classList.add("wizard-step--active");
         } else {
            step.classList.add("wizard-step--hidden");
         }
      });

      this.attachNavigation(wizard);
      this.attachFieldListeners(wizard);
      this.attachStepperClicks(wizard);

      const disableNextButton =
         wizard.form.dataset.wizardDisableNext === "true";
      if (disableNextButton) {
         this.attachRealTimeValidation(wizard);
         this.updateNextButtonState(wizard);
      }

      this.toggleButtons(wizard);
   }

   /**
    * Валідація в реальному часі (для disabled стану кнопки)
    */
   attachRealTimeValidation(wizard) {
      wizard.steps.forEach((step, index) => {
         const stepNumber = index + 1;
         const inputs = step.querySelectorAll("input, textarea, select");

         inputs.forEach((input) => {
            input.addEventListener("input", () => {
               if (wizard.currentStep === stepNumber) {
                  this.updateNextButtonState(wizard);
               }
            });

            input.addEventListener("change", () => {
               if (wizard.currentStep === stepNumber) {
                  this.updateNextButtonState(wizard);
               }
            });
         });
      });
   }

   /**
    * Оновлення стану кнопки "Далі"
    */
   updateNextButtonState(wizard) {
      const nextButtons = wizard.form.querySelectorAll("[data-wizard-next]");
      const isValid = this.validateCurrentStepSilent(wizard);

      nextButtons.forEach((btn) => {
         btn.disabled = !isValid;
      });
   }

   /**
    * Перевірка валідності поточного кроку (без показу помилок)
    */
   validateCurrentStepSilent(wizard) {
      const currentStepEl = wizard.steps[wizard.currentStep - 1];
      const inputs = currentStepEl.querySelectorAll("input, textarea, select");
      let isValid = true;

      inputs.forEach((input) => {
         if (!input.hasAttribute("required")) return;

         if (input.type === "checkbox" && !input.checked) {
            isValid = false;
         } else if (input.type === "radio") {
            const radioGroup = wizard.form.querySelectorAll(
               `input[name="${input.name}"]`,
            );
            const isChecked = Array.from(radioGroup).some(
               (radio) => radio.checked,
            );
            if (!isChecked) isValid = false;
         } else if (
            input.tagName === "SELECT" &&
            (!input.value || input.value === "")
         ) {
            isValid = false;
         } else if (!input.value || !input.value.trim()) {
            isValid = false;
         }
      });

      return isValid;
   }

   /**
    * Повна валідація поточного кроку (з показом помилок)
    */
   validateCurrentStep(wizard) {
      const currentStepEl = wizard.steps[wizard.currentStep - 1];
      const inputs = currentStepEl.querySelectorAll("input, textarea, select");
      let isValid = true;

      inputs.forEach((input) => {
         input.dispatchEvent(new Event("blur", { bubbles: true }));

         const formGroup = input.closest(".form-group");
         if (formGroup && formGroup.classList.contains("error")) {
            isValid = false;
         }
      });

      return isValid;
   }

   /**
    * Збір даних з полів
    */
   attachFieldListeners(wizard) {
      wizard.steps.forEach((step, index) => {
         const stepNumber = index + 1;
         const fields = step.querySelectorAll("input, textarea, select");

         fields.forEach((field) => {
            field.addEventListener("input", () => {
               this.collectStepData(wizard, stepNumber);
            });

            field.addEventListener("change", () => {
               this.collectStepData(wizard, stepNumber);
            });
         });
      });
   }

   /**
    * Збір даних з кроку — лейбл береться автоматично!
    */
   collectStepData(wizard, stepNumber) {
      const step = wizard.steps[stepNumber - 1];
      const fields = step.querySelectorAll("input, textarea, select");
      const stepData = {};

      fields.forEach((field) => {
         if (field.type === "hidden" || field.type === "submit") return;

         const name = field.name || field.id;
         if (!name) return;

         const label =
            field.dataset.wizardField ||
            step
               .querySelector(`label[for="${field.id}"]`)
               ?.textContent?.replace(/\*/g, "")
               .trim() ||
            field
               .closest(".form-group")
               ?.querySelector("label")
               ?.textContent?.replace(/\*/g, "")
               .trim() ||
            field.placeholder ||
            name;

         let value = "";

         if (field.type === "checkbox") {
            if (field.checked) {
               value =
                  field.dataset.wizardValueChecked ||
                  field.dataset.wizardValueYes ||
                  "✓";
            } else {
               return;
            }
         } else if (field.type === "radio") {
            if (field.checked) {
               value = field.dataset.wizardValueLabel || field.value;
            } else {
               return;
            }
         } else if (field.tagName === "SELECT") {
            const selectedOption = field.options[field.selectedIndex];
            value = selectedOption ? selectedOption.text : field.value;
         } else if (field.type === "file") {
            if (field.files && field.files.length > 0) {
               const fileNames = Array.from(field.files)
                  .map((f) => f.name)
                  .join(", ");
               value = field.dataset.wizardValueFiles || fileNames;
            } else {
               return;
            }
         } else {
            value = field.value;
         }

         if (value) {
            stepData[name] = {
               label: label,
               value: value,
               stepNumber: stepNumber,
            };
         }
      });

      wizard.data.set(stepNumber, stepData);
   }

   /**
    * Навігація
    */
   attachNavigation(wizard) {
      wizard.form.querySelectorAll("[data-wizard-next]").forEach((btn) => {
         btn.addEventListener("click", (e) => {
            e.preventDefault();

            this.collectStepData(wizard, wizard.currentStep);

            if (!this.validateCurrentStep(wizard)) {
               return;
            }

            if (wizard.currentStep < wizard.totalSteps) {
               this.showStep(wizard, wizard.currentStep + 1);
            }
         });
      });

      wizard.form.querySelectorAll("[data-wizard-prev]").forEach((btn) => {
         btn.addEventListener("click", (e) => {
            e.preventDefault();

            if (wizard.currentStep > 1) {
               this.showStep(wizard, wizard.currentStep - 1);
            }
         });
      });
   }

   /**
    * Клік на степпер для переходу на пройдені кроки
    */
   attachStepperClicks(wizard) {
      if (!wizard.stepper) return;

      const allowClick = wizard.stepper.dataset.allowClick !== "false";
      if (!allowClick) return;

      const stepElements = wizard.stepper.querySelectorAll(
         ".progress-stepper__step",
      );

      stepElements.forEach((stepEl, index) => {
         const stepNumber = index + 1;

         stepEl.addEventListener("click", () => {
            const isCompleted = stepNumber < wizard.currentStep;
            const isActive = stepNumber === wizard.currentStep;

            if (isCompleted || isActive) {
               this.showStep(wizard, stepNumber);
            }
         });

         stepEl.style.cursor = "pointer";
      });
   }

   /**
    * Показати крок з анімацією
    */
   showStep(wizard, stepNumber) {
      const previousStep = wizard.steps[wizard.currentStep - 1];
      const nextStep = wizard.steps[stepNumber - 1];

      if (previousStep && previousStep !== nextStep) {
         previousStep.classList.add("wizard-step--exit");

         setTimeout(() => {
            previousStep.classList.remove(
               "wizard-step--active",
               "wizard-step--exit",
            );
            previousStep.classList.add("wizard-step--hidden");
         }, 300);
      }

      setTimeout(
         () => {
            nextStep.classList.remove("wizard-step--hidden");
            nextStep.classList.add("wizard-step--enter");

            requestAnimationFrame(() => {
               nextStep.classList.remove("wizard-step--enter");
               nextStep.classList.add("wizard-step--active");
            });

            if (nextStep.hasAttribute("data-wizard-summary")) {
               this.generateSummary(wizard, nextStep);
            }
         },
         previousStep && previousStep !== nextStep ? 300 : 0,
      );

      wizard.currentStep = stepNumber;

      if (wizard.stepper) {
         this.updateStepper(wizard.stepper, stepNumber);
      }

      this.toggleButtons(wizard);

      const disableNextButton =
         wizard.form.dataset.wizardDisableNext === "true";
      if (disableNextButton) {
         this.updateNextButtonState(wizard);
      }
   }

   /**
    * Генерація підсумку
    */
   generateSummary(wizard, summaryStep) {
      for (let i = 1; i < wizard.totalSteps; i++) {
         this.collectStepData(wizard, i);
      }

      // ✅ Текст кнопки з атрибуту — ніякого тексту в JS!
      const editButtonText = summaryStep.dataset.wizardEditText || "✎";

      const stepLabels = Array.from(wizard.steps).map((step, index) => {
         return (
            step.dataset.wizardLabel ||
            step.querySelector("h2, h3")?.textContent?.trim() ||
            `Step ${index + 1}`
         );
      });

      let html = '<div class="wizard-summary">';

      wizard.data.forEach((stepData, stepNum) => {
         if (!stepData || Object.keys(stepData).length === 0) return;

         const stepLabel = stepLabels[stepNum - 1] || `Step ${stepNum}`;

         const stepElement = wizard.steps[stepNum - 1];
         const allFields = stepElement.querySelectorAll(
            'input:not([type="hidden"]):not([type="submit"]), textarea, select',
         );
         const totalFields = allFields.length;
         const filledFields = Object.keys(stepData).length;
         const progressPercent =
            totalFields > 0
               ? Math.round((filledFields / totalFields) * 100)
               : 0;

         html += `<div class="wizard-summary__section">`;
         html += `<div class="wizard-summary__section-header">`;
         html += `<div class="wizard-summary__title-wrapper">`;
         html += `<h3 class="wizard-summary__title">${stepLabel}</h3>`;
         html += `<div class="wizard-summary__progress">`;
         html += `<div class="wizard-summary__progress-bar">`;
         html += `<div class="wizard-summary__progress-fill" style="width: ${progressPercent}%"></div>`;
         html += `</div>`;
         html += `<span class="wizard-summary__progress-text">${filledFields}/${totalFields}</span>`;
         html += `</div>`;
         html += `</div>`;
         html += `<button type="button" class="wizard-summary__edit" data-wizard-edit="${stepNum}">${editButtonText}</button>`;
         html += `</div>`;
         html += `<div class="wizard-summary__fields">`;

         Object.entries(stepData).forEach(([name, data]) => {
            html += `<div class="wizard-summary__field" data-field-name="${name}">`;
            html += `<span class="wizard-summary__field-label">${data.label}:</span>`;
            html += `<span class="wizard-summary__field-value" data-editable-field="${name}">${data.value}</span>`;
            html += `<button type="button" class="wizard-summary__field-edit" data-edit-field="${name}" data-step="${stepNum}">✏️</button>`;
            html += `</div>`;
         });

         html += `</div>`;
         html += `</div>`;
      });

      html += "</div>";

      const existing = summaryStep.querySelector(".wizard-summary");
      if (existing) {
         existing.remove();
      }
      summaryStep.insertAdjacentHTML("afterbegin", html);

      summaryStep.querySelectorAll("[data-wizard-edit]").forEach((btn) => {
         btn.addEventListener("click", () => {
            const editStep = parseInt(btn.dataset.wizardEdit);
            this.showStep(wizard, editStep);
         });
      });

      summaryStep.querySelectorAll("[data-edit-field]").forEach((btn) => {
         btn.addEventListener("click", () => {
            const fieldName = btn.dataset.editField;
            const stepNum = parseInt(btn.dataset.step);
            this.enableInlineEdit(wizard, fieldName, stepNum, btn);
         });
      });
   }

   /**
    * Inline редагування поля в підсумку
    */
   enableInlineEdit(wizard, fieldName, stepNum, editButton) {
      const fieldContainer = editButton.closest(".wizard-summary__field");
      const valueSpan = fieldContainer.querySelector(
         ".wizard-summary__field-value",
      );

      const stepElement = wizard.steps[stepNum - 1];
      const originalField = stepElement.querySelector(`[name="${fieldName}"]`);

      if (!originalField) return;

      valueSpan.style.display = "none";
      editButton.style.display = "none";

      let editElement;

      if (originalField.tagName === "SELECT") {
         editElement = document.createElement("select");
         editElement.innerHTML = originalField.innerHTML;
         editElement.value = originalField.value;
      } else if (originalField.tagName === "TEXTAREA") {
         editElement = document.createElement("textarea");
         editElement.value = originalField.value;
         editElement.rows = 2;
      } else if (originalField.type === "checkbox") {
         editElement = document.createElement("input");
         editElement.type = "checkbox";
         editElement.checked = originalField.checked;
      } else if (originalField.type === "radio") {
         const radioGroup = wizard.form.querySelectorAll(
            `input[name="${fieldName}"]`,
         );
         const radioContainer = document.createElement("div");
         radioContainer.className = "wizard-summary__radio-group";

         radioGroup.forEach((radio) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "inline_" + fieldName;
            input.value = radio.value;
            input.checked = radio.checked;

            label.appendChild(input);
            label.appendChild(
               document.createTextNode(
                  " " + (radio.dataset.wizardValueLabel || radio.value),
               ),
            );
            radioContainer.appendChild(label);
         });

         editElement = radioContainer;
      } else {
         editElement = document.createElement("input");
         editElement.type = originalField.type;
         editElement.value = originalField.value;
      }

      editElement.className = "wizard-summary__field-input";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "wizard-summary__field-save";
      saveBtn.textContent = "✓";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "wizard-summary__field-cancel";
      cancelBtn.textContent = "✗";

      valueSpan.insertAdjacentElement("afterend", editElement);
      editElement.insertAdjacentElement("afterend", saveBtn);
      saveBtn.insertAdjacentElement("afterend", cancelBtn);

      if (editElement.focus) editElement.focus();

      saveBtn.addEventListener("click", () => {
         let newValue;

         if (originalField.type === "checkbox") {
            originalField.checked = editElement.checked;
            newValue = editElement.checked
               ? originalField.dataset.wizardValueChecked || "✓"
               : "";
         } else if (originalField.type === "radio") {
            const selectedRadio = editElement.querySelector("input:checked");
            if (selectedRadio) {
               const originalRadio = wizard.form.querySelector(
                  `input[name="${fieldName}"][value="${selectedRadio.value}"]`,
               );
               if (originalRadio) {
                  originalRadio.checked = true;
                  newValue =
                     originalRadio.dataset.wizardValueLabel ||
                     originalRadio.value;
               }
            }
         } else if (originalField.tagName === "SELECT") {
            originalField.value = editElement.value;
            newValue = editElement.options[editElement.selectedIndex].text;
         } else {
            originalField.value = editElement.value;
            newValue = editElement.value;
         }

         valueSpan.textContent = newValue;
         valueSpan.style.display = "";
         editButton.style.display = "";

         editElement.remove();
         saveBtn.remove();
         cancelBtn.remove();

         this.collectStepData(wizard, stepNum);
      });

      cancelBtn.addEventListener("click", () => {
         valueSpan.style.display = "";
         editButton.style.display = "";

         editElement.remove();
         saveBtn.remove();
         cancelBtn.remove();
      });

      if (editElement.addEventListener) {
         editElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && originalField.tagName !== "TEXTAREA") {
               e.preventDefault();
               saveBtn.click();
            } else if (e.key === "Escape") {
               e.preventDefault();
               cancelBtn.click();
            }
         });
      }
   }

   /**
    * Оновлення степпера з підтримкою кастомних іконок через спрайти
    */
   updateStepper(stepper, stepNumber) {
      const totalSteps = parseInt(stepper.dataset.totalSteps);
      // ✅ Беремо іконки з атрибутів степпера — data-check-icon і data-active-icon
      const checkIcon = stepper.dataset.checkIcon;
      const activeIcon = stepper.dataset.activeIcon;

      stepper.setAttribute("data-current-step", stepNumber);

      const progress = ((stepNumber - 1) / (totalSteps - 1)) * 100;
      stepper.style.setProperty("--stepper-progress", `${progress}%`);

      const stepElements = stepper.querySelectorAll(".progress-stepper__step");
      stepElements.forEach((stepEl, index) => {
         const stepNum = index + 1;

         stepEl.classList.remove(
            "progress-stepper__step--active",
            "progress-stepper__step--completed",
         );

         if (stepNum === stepNumber) {
            stepEl.classList.add("progress-stepper__step--active");
         } else if (stepNum < stepNumber) {
            stepEl.classList.add("progress-stepper__step--completed");
         }

         const marker = stepEl.querySelector(".progress-stepper__step-circle");

         if (stepNum < stepNumber) {
            // ✅ Завершений крок — кастомна іконка або дефолтна галочка
            if (checkIcon) {
               marker.innerHTML = `<svg class="progress-stepper__check-icon"><use href="#icon-${checkIcon}"></use></svg>`;
            } else {
               marker.innerHTML = `
                  <svg class="progress-stepper__check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                     <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
               `;
            }
         } else if (stepNum === stepNumber && activeIcon) {
            // ✅ Активний крок — кастомна іконка (якщо передана)
            marker.innerHTML = `<svg class="progress-stepper__active-icon"><use href="#icon-${activeIcon}"></use></svg>`;
         } else {
            marker.innerHTML = `<span class="progress-stepper__step-number">${stepNum}</span>`;
         }
      });

      this.updateStepperLines(stepper, stepNumber);
   }

   /**
    * Оновлення ліній
    */
   updateStepperLines(stepper, stepNumber) {
      const lines = stepper.querySelectorAll(".progress-stepper__line");

      lines.forEach((line, index) => {
         const lineFill = line.querySelector(".progress-stepper__line-fill");
         if (!lineFill) return;

         if (stepNumber > index + 1) {
            lineFill.style.width = "100%";
            lineFill.style.height = "100%";
         } else {
            lineFill.style.width = "0";
            lineFill.style.height = "0";
         }
      });
   }

   /**
    * Показ/приховування кнопок
    */
   toggleButtons(wizard) {
      const prevButtons = wizard.form.querySelectorAll("[data-wizard-prev]");
      const nextButtons = wizard.form.querySelectorAll("[data-wizard-next]");
      const submitButtons = wizard.form.querySelectorAll(
         "[data-wizard-submit]",
      );

      prevButtons.forEach((btn) => {
         btn.style.display = wizard.currentStep === 1 ? "none" : "inline-block";
      });

      if (wizard.currentStep === wizard.totalSteps) {
         nextButtons.forEach((btn) => (btn.style.display = "none"));
         submitButtons.forEach((btn) => (btn.style.display = "inline-block"));
      } else {
         nextButtons.forEach((btn) => (btn.style.display = "inline-block"));
         submitButtons.forEach((btn) => (btn.style.display = "none"));
      }
   }

   destroy() {
      this.wizards.clear();
   }
}

// Ініціалізація
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => {
      window.formWizard = new FormWizard();
   });
} else {
   window.formWizard = new FormWizard();
}

// Astro View Transitions
document.addEventListener("astro:page-load", () => {
   if (window.formWizard) {
      window.formWizard.destroy();
   }
   window.formWizard = new FormWizard();
});

document.addEventListener("astro:after-swap", () => {
   if (window.formWizard) {
      window.formWizard.destroy();
   }
   window.formWizard = new FormWizard();
});

export default FormWizard;
