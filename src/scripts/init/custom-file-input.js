/**
 * ============================================
 * CUSTOM FILE INPUT - ПОВНИЙ ТУТОРІАЛ
 * ============================================
 *
 * Гнучкий компонент для завантаження файлів з валідацією,
 * drag & drop, превью зображень, сортуванням та багато іншого.
 *
 * Всі функції можна вмикати/вимикати через атрибути!
 *
 * ============================================
 * БАЗОВЕ ВИКОРИСТАННЯ
 * ============================================
 *
 * Мінімальний приклад (один файл):
 *
 * <CustomFileInput
 *    name="photo"
 *    buttonText="Додати фото"
 *    required
 * />
 *
 * ============================================
 * ОСНОВНІ ПАРАМЕТРИ
 * ============================================
 *
 * name (обов'язковий)
 * Ім'я поля для форми
 *
 * id (опціонально)
 * ID елемента (за замовчуванням: file-{name})
 *
 * required (boolean)
 * Чи обов'язкове поле
 * Приклад: required={true}
 *
 * accept (string)
 * Дозволені типи файлів
 * Приклад: accept=".jpg,.png,.pdf"
 * Приклад: accept="image/*"
 *
 * maxSize (number)
 * Максимальний розмір файлу в МБ
 * Приклад: maxSize={5}
 *
 * multiple (boolean)
 * Дозволити вибір кількох файлів
 * Приклад: multiple={true}
 *
 * maxFiles (number)
 * Максимальна кількість файлів (для multiple)
 * Приклад: maxFiles={10}
 *
 * ============================================
 * ВІДОБРАЖЕННЯ СПИСКУ ФАЙЛІВ
 * ============================================
 *
 * showFileList (boolean, за замовчуванням: true)
 * Показувати список вибраних файлів
 *
 * showPreview (boolean, за замовчуванням: true)
 * Показувати превью для зображень
 *
 * showFileListAccordion (boolean, за замовчуванням: true)
 * Показувати список у вигляді accordion
 *
 * accordionDefaultOpen (boolean, за замовчуванням: false)
 * Чи відкритий accordion за замовчуванням
 *
 * compactList (boolean, за замовчуванням: false)
 * Компактний режим списку (менші картки)
 *
 * Приклад:
 * <CustomFileInput
 *    name="documents"
 *    multiple={true}
 *    showFileList={true}
 *    showPreview={true}
 *    showFileListAccordion={true}
 *    accordionDefaultOpen={false}
 *    compactList={false}
 * />
 *
 * ============================================
 * ДОДАТКОВІ ФУНКЦІЇ
 * ============================================
 *
 * showRemoveAll (boolean, за замовчуванням: true)
 * Кнопка "Видалити всі файли"
 *
 * showClearButton (boolean, за замовчуванням: false)
 * Кнопка очищення під drag&drop зоною
 * Корисно коли вимкнений список файлів
 *
 * showButtonCounter (boolean, за замовчуванням: true)
 * Показувати кількість файлів у кнопці
 * Приклад: "Додати ще (3/10)"
 *
 * showProgress (boolean, за замовчуванням: false)
 * Показувати прогрес бар завантаження
 *
 * showDropZone (boolean, за замовчуванням: true)
 * Показувати overlay при dragover
 *
 * showMaxFilesHint (boolean, за замовчуванням: true)
 * Підказка про максимальну кількість файлів
 *
 * showTotalSize (boolean, за замовчуванням: true)
 * Показувати загальний розмір всіх файлів
 *
 * showFileTypeBadges (boolean, за замовчуванням: true)
 * Кольорові badges біля назви файлу (PDF, DOC, IMG)
 *
 * enableSort (boolean, за замовчуванням: false)
 * Дозволити сортування файлів
 *
 * compact (boolean, за замовчуванням: false)
 * Компактний режим всього компонента
 *
 * Приклад всіх функцій:
 * <CustomFileInput
 *    name="files"
 *    multiple={true}
 *    showRemoveAll={true}
 *    showClearButton={true}
 *    showButtonCounter={true}
 *    showProgress={false}
 *    showDropZone={true}
 *    showMaxFilesHint={true}
 *    showTotalSize={true}
 *    showFileTypeBadges={true}
 *    enableSort={true}
 *    compactList={false}
 *    compact={false}
 * />
 *
 * ============================================
 * ТЕКСТИ (i18n)
 * ============================================
 *
 * Всі тексти можна змінити для підтримки різних мов!
 *
 * buttonText (за замовчуванням: "Додати файл")
 * Текст кнопки завантаження
 *
 * buttonTextWithFiles (за замовчуванням: "Додати ще ({count}/{max})")
 * Текст кнопки коли вже є файли
 * Плейсхолдери: {count} - кількість файлів, {max} - максимум
 *
 * dragText (за замовчуванням: "Або перетягніть файл сюди")
 * Текст під кнопкою
 *
 * dropZoneText (за замовчуванням: "Відпустіть файли тут")
 * Текст при dragover
 *
 * fileListText (за замовчуванням: "Обрані файли:")
 * Заголовок списку файлів
 *
 * fileListButtonText (за замовчуванням: "Переглянути файли ({count})")
 * Текст кнопки accordion
 * Плейсхолдер: {count} - кількість файлів
 *
 * removeFileText (за замовчуванням: "Видалити")
 * Aria-label кнопки видалення
 *
 * removeAllText (за замовчуванням: "Видалити всі")
 * Текст кнопки "Видалити всі"
 *
 * clearButtonText (за замовчуванням: "Очистити")
 * Текст кнопки очищення
 *
 * emptyStateText (за замовчуванням: "Файлів поки немає")
 * Текст коли список пустий
 *
 * progressText (за замовчуванням: "Завантаження... {percent}%")
 * Текст прогрес бару
 * Плейсхолдер: {percent} - відсоток
 *
 * totalSizeText (за замовчуванням: "Загальний розмір: {size}")
 * Текст загального розміру
 * Плейсхолдер: {size} - розмір з одиницями
 *
 * maxFilesText (за замовчуванням: "Максимум {max} файлів")
 * Повідомлення при досягненні ліміту
 * Плейсхолдер: {max} - максимум файлів
 *
 * maxFilesHintText (за замовчуванням: "Макс. {max} файлів")
 * Підказка під drag зоною
 * Плейсхолдер: {max} - максимум файлів
 *
 * fileSizeText (за замовчуванням: "MB")
 * Одиниця виміру розміру
 *
 * sortByNameText (за замовчуванням: "За назвою")
 * Текст опції сортування
 *
 * sortBySizeText (за замовчуванням: "За розміром")
 * Текст опції сортування
 *
 * sortByTypeText (за замовчуванням: "За типом")
 * Текст опції сortування
 *
 * Приклад для української мови:
 * <CustomFileInput
 *    name="files"
 *    buttonText="Завантажити"
 *    dragText="або перетягни сюди"
 *    fileListText="Твої файли:"
 *    removeAllText="Видалити все"
 *    emptyStateText="Немає файлів"
 *    totalSizeText="Всього: {size}"
 * />
 *
 * Приклад для англійської мови:
 * <CustomFileInput
 *    name="files"
 *    buttonText="Upload file"
 *    dragText="or drag and drop here"
 *    fileListText="Your files:"
 *    removeAllText="Remove all"
 *    emptyStateText="No files yet"
 *    totalSizeText="Total: {size}"
 * />
 *
 * ============================================
 * ВАЛІДАЦІЯ
 * ============================================
 *
 * Компонент інтегрується з FormValidator!
 *
 * errorRequired (string)
 * Повідомлення якщо поле обов'язкове і пусте
 *
 * errorFileType (string)
 * Повідомлення про невірний тип файлу
 *
 * errorFileSize (string)
 * Повідомлення про завеликий файл
 *
 * errorMaxFiles (string)
 * Повідомлення про перевищення кількості файлів
 *
 * Приклад:
 * <CustomFileInput
 *    name="avatar"
 *    required
 *    accept="image/*"
 *    maxSize={2}
 *    errorRequired="Будь ласка, додайте фото"
 *    errorFileType="Тільки зображення (JPG, PNG)"
 *    errorFileSize="Файл завеликий (макс 2MB)"
 * />
 *
 * ============================================
 * ТИПОВІ СЦЕНАРІЇ ВИКОРИСТАННЯ
 * ============================================
 *
 * 1️⃣ ОДИН ФАЙЛ (АВАТАР)
 * ──────────────────────
 * <CustomFileInput
 *    name="avatar"
 *    accept="image/*"
 *    maxSize={2}
 *    required
 *    buttonText="Вибрати фото"
 *    showFileList={true}
 *    showPreview={true}
 *    showFileListAccordion={false}
 *    errorRequired="Додайте аватар"
 * />
 *
 * 2️⃣ КІЛЬКА ДОКУМЕНТІВ
 * ──────────────────────
 * <CustomFileInput
 *    name="documents"
 *    accept=".pdf,.doc,.docx"
 *    maxSize={10}
 *    multiple={true}
 *    maxFiles={5}
 *    buttonText="Додати документи"
 *    showFileList={true}
 *    showFileListAccordion={true}
 *    showRemoveAll={true}
 *    showTotalSize={true}
 *    showFileTypeBadges={true}
 *    enableSort={true}
 *    errorRequired="Додайте хоча б один документ"
 * />
 *
 * 3️⃣ МІНІМАЛЬНИЙ (БЕЗ СПИСКУ)
 * ──────────────────────
 * <CustomFileInput
 *    name="file"
 *    showFileList={false}
 *    showClearButton={true}
 *    buttonText="Вибрати файл"
 *    clearButtonText="Скасувати"
 * />
 *
 * 4️⃣ КОМПАКТНИЙ ДЛЯ МОБІЛОК
 * ──────────────────────
 * <CustomFileInput
 *    name="photos"
 *    accept="image/*"
 *    multiple={true}
 *    compact={true}
 *    compactList={true}
 *    showFileListAccordion={true}
 *    accordionDefaultOpen={false}
 * />
 *
 * 5️⃣ З ПРОГРЕСОМ (СИМУЛЯЦІЯ ЗАВАНТАЖЕННЯ)
 * ──────────────────────
 * <CustomFileInput
 *    name="upload"
 *    multiple={true}
 *    showProgress={true}
 *    progressText="Обробка... {percent}%"
 * />
 *
 * 6️⃣ БЕЗ DRAG & DROP
 * ──────────────────────
 * <CustomFileInput
 *    name="file"
 *    showDropZone={false}
 *    dragText=""
 * />
 *
 * 7️⃣ БАГАТО ЗОБРАЖЕНЬ З ПРЕВЬЮ
 * ──────────────────────
 * <CustomFileInput
 *    name="gallery"
 *    accept="image/*"
 *    multiple={true}
 *    maxFiles={20}
 *    showPreview={true}
 *    showFileTypeBadges={false}
 *    enableSort={true}
 *    sortByNameText="За ім'ям"
 *    sortBySizeText="За розміром"
 * />
 *
 * ============================================
 * ФУНКЦІЇ ВАЛІДАЦІЇ (FormValidator)
 * ============================================
 *
 * Компонент автоматично працює з FormValidator:
 *
 * ✅ Валідація при закритті діалогу без вибору
 * ✅ Валідація при видаленні файлів
 * ✅ Валідація типу файлу (accept)
 * ✅ Валідація розміру (maxSize)
 * ✅ Валідація кількості (maxFiles)
 * ✅ Показ помилок через .error-message
 * ✅ Класи .error і .success на .form-group
 *
 * Приклад ініціалізації валідатора:
 *
 * const form = document.querySelector('#my-form');
 * new FormValidator(form);
 *
 * ============================================
 * ДОДАТКОВІ МОЖЛИВОСТІ
 * ============================================
 *
 * 🎨 SKELETON LOADER
 * Автоматично показується поки завантажується превью зображення
 *
 * 🏷️ КОЛЬОРОВІ BADGES
 * PDF - червоний, DOC - синій, IMG - зелений, XLS - зелений, ZIP - жовтий
 *
 * 📊 СОРТУВАННЯ
 * За назвою (A-Z), За розміром (більші спочатку), За типом (по розширенню)
 *
 * 📱 МОБІЛЬНА ОПТИМІЗАЦІЯ
 * Responsive дизайн, touch-friendly кнопки (мін 44px)
 *
 * ♿ ДОСТУПНІСТЬ
 * Aria-labels, keyboard navigation, screen reader friendly
 *
 * 🌍 i18n READY
 * Всі тексти через атрибути, підтримка будь-якої мови
 *
 * ============================================
 * ВАЖЛИВІ НОТАТКИ
 * ============================================
 *
 * ⚠️ Прихований input завжди після кастомного
 * Це потрібно для валідації (error-message додається після input)
 *
 * ⚠️ Файли передаються на бекенд
 * Використовується прихований <input type="file">
 * Файли доступні через FormData при submit
 *
 * ⚠️ localStorage НЕ використовується
 * Файли зберігаються в пам'яті до відправки форми
 *
 * ⚠️ Astro View Transitions
 * Автоматична підтримка через astro:page-load event
 *
 * ============================================
 * СТИЛІЗАЦІЯ
 * ============================================
 *
 * Всі стилі в custom-file-input.scss
 * Можна перевизначити через CSS змінні або класи
 *
 * Основні класи:
 * .custom-file-input - основний контейнер
 * .custom-file-input__button - кнопка завантаження
 * .custom-file-input__file-list - список файлів
 * .custom-file-input__file-item - картка файлу
 * .custom-file-input--compact - компактний режим
 *
 * ============================================
 * ПРИКЛАД ПОВНОЇ КОНФІГУРАЦІЇ
 * ============================================
 *
 * <CustomFileInput
 *    // Основні
 *    name="documents"
 *    id="doc-upload"
 *    required={true}
 *    accept=".pdf,.doc,.docx,.jpg,.png"
 *    maxSize={10}
 *    multiple={true}
 *    maxFiles={10}
 *
 *    // Відображення
 *    showFileList={true}
 *    showPreview={true}
 *    showFileListAccordion={true}
 *    accordionDefaultOpen={false}
 *    compactList={false}
 *    compact={false}
 *
 *    // Функції
 *    showRemoveAll={true}
 *    showClearButton={false}
 *    showButtonCounter={true}
 *    showProgress={false}
 *    showDropZone={true}
 *    showMaxFilesHint={true}
 *    showTotalSize={true}
 *    showFileTypeBadges={true}
 *    enableSort={true}
 *
 *    // Тексти
 *    buttonText="Додати файли"
 *    buttonTextWithFiles="Додати ще ({count}/{max})"
 *    dragText="Або перетягніть файли сюди"
 *    dropZoneText="Відпустіть для завантаження"
 *    fileListText="Ваші файли:"
 *    fileListButtonText="Файли ({count})"
 *    removeFileText="Видалити"
 *    removeAllText="Очистити все"
 *    clearButtonText="Скасувати"
 *    emptyStateText="Немає файлів"
 *    progressText="Завантаження {percent}%"
 *    totalSizeText="Разом: {size}"
 *    maxFilesText="Максимум {max} файлів"
 *    maxFilesHintText="До {max} файлів"
 *    fileSizeText="МБ"
 *    sortByNameText="По імені"
 *    sortBySizeText="По розміру"
 *    sortByTypeText="По типу"
 *
 *    // Валідація
 *    errorRequired="Додайте файли"
 *    errorFileType="Невірний тип файлу"
 *    errorFileSize="Файл завеликий (макс 10МБ)"
 *    errorMaxFiles="Максимум 10 файлів"
 * />
 *
 * ============================================
 * ПІДТРИМКА
 * ============================================
 *
 * Браузери: Всі сучасні (Chrome, Firefox, Safari, Edge)
 * Мобільні: iOS Safari, Chrome Android
 * Astro: 2.0+
 *
 * ============================================
 * АВТОР
 * ============================================
 *
 * Створено для DanylenkoTemplateStart
 * Версія: 1.0.0
 *
 * ============================================
 */

//======================================================

class CustomFileInputHandler {
   constructor(container) {
      this.container = container;
      this.button = container.querySelector(".custom-file-input__button");
      this.buttonText = container.querySelector(
         ".custom-file-input__button-text",
      );

      // Шукаємо елементи після контейнера (в form-group)
      const formGroup = container.closest(".form-group");
      this.input = formGroup?.querySelector(".custom-file-input__hidden");
      this.fileListContainer = formGroup?.querySelector(
         ".custom-file-input__file-list",
      );
      this.filesContainer = formGroup?.querySelector(
         ".custom-file-input__files",
      );
      this.emptyState = formGroup?.querySelector(
         ".custom-file-input__empty-state",
      );
      this.accordionToggle = formGroup?.querySelector(
         ".custom-file-input__accordion-toggle",
      );
      this.accordionContent = formGroup?.querySelector(
         ".custom-file-input__accordion-content",
      );
      this.accordionTitle = formGroup?.querySelector(
         ".custom-file-input__accordion-title",
      );
      this.removeAllBtn = formGroup?.querySelector(
         ".custom-file-input__remove-all-btn",
      );
      this.progressContainer = formGroup?.querySelector(
         ".custom-file-input__progress",
      );
      this.progressFill = formGroup?.querySelector(
         ".custom-file-input__progress-fill",
      );
      this.progressText = formGroup?.querySelector(
         ".custom-file-input__progress-text",
      );
      this.dropZoneOverlay = container.querySelector(
         ".custom-file-input__drop-zone-overlay",
      );
      this.clearButton = container.querySelector(
         ".custom-file-input__clear-button",
      );
      this.maxFilesHint = container.querySelector(
         ".custom-file-input__max-files-hint",
      );
      this.totalSizeContainer = formGroup?.querySelector(
         ".custom-file-input__total-size",
      );
      this.sortSelect = formGroup?.querySelector(
         ".custom-file-input__sort-select",
      );

      if (!this.input || !this.button) return;

      this.isProcessing = false;
      this.dialogOpened = false;
      this.selectedFiles = [];
      this.currentSort = "name";

      // Читаємо налаштування з data-атрибутів
      this.settings = {
         showFileList: container.dataset.showFileList === "true",
         showPreview: container.dataset.showPreview === "true",
         showAccordion: container.dataset.showAccordion === "true",
         accordionDefaultOpen:
            container.dataset.accordionDefaultOpen === "true",
         showRemoveAll: container.dataset.showRemoveAll === "true",
         showButtonCounter: container.dataset.showButtonCounter === "true",
         showProgress: container.dataset.showProgress === "true",
         showDropZone: container.dataset.showDropZone === "true",
         showClearButton: container.dataset.showClearButton === "true",
         showMaxFilesHint: container.dataset.showMaxFilesHint === "true",
         showTotalSize: container.dataset.showTotalSize === "true",
         showFileTypeBadges: container.dataset.showFileTypeBadges === "true",
         enableSort: container.dataset.enableSort === "true",
         compactList: container.dataset.compactList === "true",
         buttonText: container.dataset.buttonText || "Додати файл",
         buttonTextWithFiles:
            container.dataset.buttonTextWithFiles ||
            "Додати ще ({count}/{max})",
         fileListButtonText:
            container.dataset.fileListButtonText ||
            "Переглянути файли ({count})",
         removeFileText: container.dataset.removeFileText || "Видалити",
         removeAllText: container.dataset.removeAllText || "Видалити всі",
         clearButtonText: container.dataset.clearButtonText || "Очистити",
         fileSizeText: container.dataset.fileSizeText || "MB",
         emptyStateText:
            container.dataset.emptyStateText || "Файлів поки немає",
         progressText:
            container.dataset.progressText || "Завантаження... {percent}%",
         totalSizeText:
            container.dataset.totalSizeText || "Загальний розмір: {size}",
         sortByNameText: container.dataset.sortByNameText || "За назвою",
         sortBySizeText: container.dataset.sortBySizeText || "За розміром",
         sortByTypeText: container.dataset.sortByTypeText || "За типом",
         maxFiles: parseInt(container.dataset.maxFiles) || null,
         maxFilesText:
            container.dataset.maxFilesText || "Максимум {max} файлів",
         maxFilesHintText:
            container.dataset.maxFilesHintText || "Макс. {max} файлів",
      };

      this.init();
   }

   init() {
      // Клік на кнопку
      this.button.addEventListener("click", (e) => {
         e.preventDefault();
         e.stopPropagation();

         if (!this.isProcessing) {
            if (
               this.settings.maxFiles &&
               this.selectedFiles.length >= this.settings.maxFiles
            ) {
               this.showMaxFilesError();
               return;
            }

            this.dialogOpened = true;
            this.input.click();
            this.checkDialogClosed();
         }
      });

      // Зміна файлів
      this.input.addEventListener("change", (e) => {
         this.dialogOpened = false;
         this.handleFileSelect(e);
      });

      // Accordion toggle
      if (this.accordionToggle) {
         this.accordionToggle.addEventListener("click", () => {
            this.toggleAccordion();
         });
      }

      // Видалити всі
      if (this.removeAllBtn) {
         this.removeAllBtn.addEventListener("click", () => {
            this.removeAllFiles();
         });
      }

      // Кнопка очищення
      if (this.clearButton) {
         this.clearButton.addEventListener("click", () => {
            this.removeAllFiles();
         });
      }

      // Сортування
      if (this.sortSelect) {
         this.sortSelect.addEventListener("change", (e) => {
            this.currentSort = e.target.value;
            this.sortFiles();
            this.updateFileList();
         });
      }

      // Drag & Drop
      this.setupDragAndDrop();

      // Показуємо accordion одразу якщо він включений
      if (this.settings.showAccordion && this.fileListContainer) {
         this.fileListContainer.style.display = "block";

         // Відкриваємо accordion якщо потрібно
         if (this.settings.accordionDefaultOpen && this.accordionContent) {
            this.accordionContent.classList.add(
               "custom-file-input__accordion-content--open",
            );
         }

         // Показуємо empty state якщо немає файлів і accordion відкритий
         if (this.selectedFiles.length === 0 && this.emptyState) {
            if (this.settings.accordionDefaultOpen) {
               this.emptyState.style.display = "flex";
            }
         }
      }

      // Ініціалізуємо тексти одразу
      this.updateButtonText();
      this.updateAccordionTitle();
      this.updateMaxFilesHint();
      this.updateTotalSize();
   }

   handleFileSelect(e) {
      const files = Array.from(e.target.files);

      if (files.length > 0) {
         this.isProcessing = true;

         if (this.settings.maxFiles) {
            const totalFiles = this.selectedFiles.length + files.length;
            if (totalFiles > this.settings.maxFiles) {
               this.showMaxFilesError();
               this.isProcessing = false;
               return;
            }
         }

         // Показуємо прогрес якщо включено
         if (this.settings.showProgress) {
            this.showProgress();
         }

         this.addFiles(files);
         this.animateSuccess();

         setTimeout(() => {
            this.isProcessing = false;
            if (this.settings.showProgress) {
               this.hideProgress();
            }
         }, 500);
      }
   }

   addFiles(files) {
      files.forEach((file) => {
         this.selectedFiles.push(file);
      });

      // Сортуємо якщо включено
      if (this.settings.enableSort) {
         this.sortFiles();
      }

      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();
      this.updateClearButton();
      this.updateTotalSize();
   }

   updateFileList() {
      if (!this.settings.showFileList || !this.filesContainer) return;

      // Завжди показуємо контейнер якщо accordion включений
      if (this.fileListContainer) {
         if (this.settings.showAccordion) {
            // Для accordion - завжди показуємо
            this.fileListContainer.style.display = "block";
         } else {
            // Без accordion - показуємо тільки якщо є файли
            this.fileListContainer.style.display =
               this.selectedFiles.length > 0 ? "block" : "none";
         }
      }

      // Показуємо/ховаємо empty state
      if (this.emptyState) {
         this.emptyState.style.display =
            this.selectedFiles.length === 0 ? "flex" : "none";
      }

      // Показуємо/ховаємо кнопку "Видалити всі"
      if (this.removeAllBtn) {
         this.removeAllBtn.style.display =
            this.selectedFiles.length > 0 ? "flex" : "none";
      }

      // Показуємо/ховаємо загальний розмір
      if (this.totalSizeContainer) {
         this.totalSizeContainer.style.display =
            this.selectedFiles.length > 0 ? "block" : "none";
      }

      // Очищаємо список
      this.filesContainer.innerHTML = "";

      // Додаємо кожен файл
      this.selectedFiles.forEach((file, index) => {
         const fileItem = this.createFileItem(file, index);
         this.filesContainer.appendChild(fileItem);
      });
   }

   createFileItem(file, index) {
      const item = document.createElement("div");
      item.className = "custom-file-input__file-item";

      const preview = this.createFilePreview(file);

      const info = document.createElement("div");
      info.className = "custom-file-input__file-info";

      const topRow = document.createElement("div");
      topRow.className = "custom-file-input__file-top-row";

      const name = document.createElement("span");
      name.className = "custom-file-input__file-name";
      name.textContent = file.name;
      name.title = file.name;

      topRow.appendChild(name);

      // Badge для типу файлу
      if (this.settings.showFileTypeBadges) {
         const badge = this.createFileTypeBadge(file);
         topRow.appendChild(badge);
      }

      const size = document.createElement("span");
      size.className = "custom-file-input__file-size";
      size.textContent = this.formatFileSize(file.size);

      info.appendChild(topRow);
      info.appendChild(size);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "custom-file-input__remove-btn";
      removeBtn.setAttribute("aria-label", this.settings.removeFileText);

      const formGroup = this.container.closest(".form-group");
      const removeIconTemplate = formGroup.querySelector("#file-remove-icon");
      if (removeIconTemplate) {
         removeBtn.appendChild(removeIconTemplate.content.cloneNode(true));
      } else {
         removeBtn.innerHTML = "✕";
      }

      removeBtn.addEventListener("click", () => this.removeFile(index));

      item.appendChild(preview);
      item.appendChild(info);
      item.appendChild(removeBtn);

      return item;
   }

   createFileTypeBadge(file) {
      const badge = document.createElement("span");
      badge.className = "custom-file-input__file-badge";

      const ext = file.name.split(".").pop().toLowerCase();

      // Визначаємо тип та колір
      let type = "FILE";
      let color = "gray";

      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
         type = "IMG";
         color = "green";
      } else if (ext === "pdf") {
         type = "PDF";
         color = "red";
      } else if (["doc", "docx"].includes(ext)) {
         type = "DOC";
         color = "blue";
      } else if (["xls", "xlsx"].includes(ext)) {
         type = "XLS";
         color = "green";
      } else if (["zip", "rar", "7z"].includes(ext)) {
         type = "ZIP";
         color = "yellow";
      }

      badge.textContent = type;
      badge.dataset.color = color;

      return badge;
   }

   createFilePreview(file) {
      const preview = document.createElement("div");
      preview.className = "custom-file-input__file-preview";

      if (this.settings.showPreview && file.type.startsWith("image/")) {
         // Skeleton loader поки завантажується
         const skeleton = document.createElement("div");
         skeleton.className = "custom-file-input__skeleton";
         preview.appendChild(skeleton);

         const img = document.createElement("img");
         img.className = "custom-file-input__file-img";

         const reader = new FileReader();
         reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
               // Прибираємо skeleton коли зображення завантажилось
               skeleton.remove();
               preview.appendChild(img);
            };
         };
         reader.readAsDataURL(file);
      } else {
         const icon = this.getFileIconFromTemplate(file);
         preview.appendChild(icon);
      }

      return preview;
   }

   getFileIconFromTemplate(file) {
      const ext = file.name.split(".").pop().toLowerCase();
      const formGroup = this.container.closest(".form-group");

      let templateId = "file-icon-default";

      if (ext === "pdf") {
         templateId = "file-icon-pdf";
      } else if (["doc", "docx"].includes(ext)) {
         templateId = "file-icon-doc";
      }

      const template = formGroup.querySelector(`#${templateId}`);
      if (template) {
         return template.content.cloneNode(true);
      }

      const div = document.createElement("div");
      div.innerHTML = "📄";
      return div;
   }

   formatFileSize(bytes) {
      if (bytes === 0) return "0 " + this.settings.fileSizeText;

      const mb = bytes / (1024 * 1024);
      return mb.toFixed(2) + " " + this.settings.fileSizeText;
   }

   removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();

      // Прибираємо success клас якщо файлів немає
      if (this.selectedFiles.length === 0) {
         this.container.classList.remove("custom-file-input--success");
      }

      // ВАЖЛИВО: Тригеримо валідацію
      this.triggerValidation();
   }

   removeAllFiles() {
      this.selectedFiles = [];
      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();

      // Прибираємо success клас
      this.container.classList.remove("custom-file-input--success");

      // ВАЖЛИВО: Тригеримо валідацію
      this.triggerValidation();
   }

   updateHiddenInput() {
      const dt = new DataTransfer();

      this.selectedFiles.forEach((file) => {
         dt.items.add(file);
      });

      this.input.files = dt.files;
   }

   updateButtonText() {
      if (!this.settings.showButtonCounter || !this.buttonText) return;

      if (this.selectedFiles.length === 0) {
         this.buttonText.textContent = this.settings.buttonText;
      } else {
         let text = this.settings.buttonTextWithFiles.replace(
            "{count}",
            this.selectedFiles.length,
         );

         if (this.settings.maxFiles) {
            text = text.replace("{max}", this.settings.maxFiles);
         } else {
            text = text.replace("/{max}", "");
         }

         this.buttonText.textContent = text;
      }
   }

   updateAccordionTitle() {
      if (!this.accordionTitle) return;

      const text = this.settings.fileListButtonText.replace(
         "{count}",
         this.selectedFiles.length,
      );

      this.accordionTitle.textContent = text;
   }

   updateMaxFilesHint() {
      // Оновлюємо підказку про максимум файлів
      const formGroup = this.container.closest(".form-group");
      const maxFilesHint = formGroup?.querySelector(
         ".custom-file-input__max-files-hint",
      );

      if (maxFilesHint && this.settings.maxFiles) {
         const text = maxFilesHint.dataset.text || "Максимум {max} файлів";
         maxFilesHint.textContent = text.replace(
            "{max}",
            this.settings.maxFiles,
         );
      }
   }

   updateClearButton() {
      if (!this.clearButton) return;

      // Показуємо кнопку тільки якщо є файли
      this.clearButton.style.display =
         this.selectedFiles.length > 0 ? "inline-flex" : "none";
   }

   updateTotalSize() {
      if (!this.totalSizeContainer || !this.settings.showTotalSize) return;

      const totalBytes = this.selectedFiles.reduce(
         (sum, file) => sum + file.size,
         0,
      );
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

      const text = this.settings.totalSizeText.replace(
         "{size}",
         `${totalMB} ${this.settings.fileSizeText}`,
      );

      this.totalSizeContainer.textContent = text;
   }

   sortFiles() {
      switch (this.currentSort) {
         case "name":
            this.selectedFiles.sort((a, b) => a.name.localeCompare(b.name));
            break;
         case "size":
            this.selectedFiles.sort((a, b) => b.size - a.size);
            break;
         case "type":
            this.selectedFiles.sort((a, b) => {
               const extA = a.name.split(".").pop().toLowerCase();
               const extB = b.name.split(".").pop().toLowerCase();
               return extA.localeCompare(extB);
            });
            break;
      }
   }

   toggleAccordion() {
      if (!this.accordionContent) return;

      const isOpen = this.accordionContent.classList.contains(
         "custom-file-input__accordion-content--open",
      );

      if (isOpen) {
         this.accordionContent.classList.remove(
            "custom-file-input__accordion-content--open",
         );
      } else {
         this.accordionContent.classList.add(
            "custom-file-input__accordion-content--open",
         );

         // Показуємо empty state якщо немає файлів
         if (this.selectedFiles.length === 0 && this.emptyState) {
            this.emptyState.style.display = "flex";
         }
      }
   }

   showProgress() {
      if (!this.progressContainer) return;

      this.progressContainer.style.display = "block";
      let percent = 0;

      const interval = setInterval(() => {
         percent += 10;
         if (this.progressFill) {
            this.progressFill.style.width = percent + "%";
         }
         if (this.progressText) {
            this.progressText.textContent = this.settings.progressText.replace(
               "{percent}",
               percent,
            );
         }

         if (percent >= 100) {
            clearInterval(interval);
         }
      }, 50);
   }

   hideProgress() {
      if (!this.progressContainer) return;

      setTimeout(() => {
         this.progressContainer.style.display = "none";
         if (this.progressFill) {
            this.progressFill.style.width = "0%";
         }
      }, 300);
   }

   showMaxFilesError() {
      const message = this.settings.maxFilesText.replace(
         "{max}",
         this.settings.maxFiles,
      );
      alert(message);
   }

   animateSuccess() {
      this.container.classList.add("custom-file-input--uploading");

      setTimeout(() => {
         this.container.classList.remove("custom-file-input--uploading");
         this.container.classList.add("custom-file-input--success");
      }, 300);
   }

   checkDialogClosed() {
      const focusHandler = () => {
         setTimeout(() => {
            if (this.dialogOpened) {
               this.dialogOpened = false;
               this.triggerValidation();
            }
         }, 300);

         window.removeEventListener("focus", focusHandler);
      };

      window.addEventListener("focus", focusHandler);
   }

   triggerValidation() {
      const blurEvent = new Event("blur", { bubbles: true });
      this.input.dispatchEvent(blurEvent);
   }

   setupDragAndDrop() {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
         this.container.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
         });
      });

      ["dragenter", "dragover"].forEach((eventName) => {
         this.container.addEventListener(eventName, () => {
            this.container.classList.add("custom-file-input--dragover");
         });
      });

      ["dragleave", "drop"].forEach((eventName) => {
         this.container.addEventListener(eventName, () => {
            this.container.classList.remove("custom-file-input--dragover");
         });
      });

      this.container.addEventListener("drop", (e) => {
         const files = Array.from(e.dataTransfer.files);

         if (files.length > 0) {
            this.addFiles(files);
            this.animateSuccess();
         }
      });
   }
}

// Автоматична ініціалізація
function initFileInputs() {
   const fileInputs = document.querySelectorAll("[data-file-input]");

   fileInputs.forEach((container) => {
      if (container.dataset.fileInputInitialized) {
         return;
      }

      container.dataset.fileInputInitialized = "true";
      new CustomFileInputHandler(container);
   });
}

document.addEventListener("DOMContentLoaded", initFileInputs);
document.addEventListener("astro:page-load", initFileInputs);
