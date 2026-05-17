class CustomFileInputHandler {
   constructor(container) {
      this.container = container;
      this.button = container.querySelector(".custom-file-input__button");
      this.buttonText = container.querySelector(
         ".custom-file-input__button-text",
      );

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

      // Всі тексти і налаштування — виключно з data-атрибутів
      this.settings = {
         variant: container.dataset.variant || "default",
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
         maxFiles: parseInt(container.dataset.maxFiles) || null,

         // Тексти
         buttonText: container.dataset.buttonText,
         buttonTextWithFiles: container.dataset.buttonTextWithFiles,
         fileListButtonText: container.dataset.fileListButtonText,
         removeFileText: container.dataset.removeFileText,
         removeAllText: container.dataset.removeAllText,
         clearButtonText: container.dataset.clearButtonText,
         fileSizeText: container.dataset.fileSizeText,
         emptyStateText: container.dataset.emptyStateText,
         progressText: container.dataset.progressText,
         totalSizeText: container.dataset.totalSizeText,
         sortByNameText: container.dataset.sortByNameText,
         sortBySizeText: container.dataset.sortBySizeText,
         sortByTypeText: container.dataset.sortByTypeText,
         maxFilesText: container.dataset.maxFilesText,
         maxFilesHintText: container.dataset.maxFilesHintText,

         // Іконки зі спрайту — undefined якщо не передано
         iconPdf: container.dataset.iconPdf || null,
         iconDoc: container.dataset.iconDoc || null,
         iconDefault: container.dataset.iconDefault || null,
         removeIcon: container.dataset.removeIcon || null,
      };

      this.init();
   }

   init() {
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

      this.input.addEventListener("change", (e) => {
         this.dialogOpened = false;
         this.handleFileSelect(e);
      });

      if (this.accordionToggle) {
         this.accordionToggle.addEventListener("click", () =>
            this.toggleAccordion(),
         );
      }

      if (this.removeAllBtn) {
         this.removeAllBtn.addEventListener("click", () =>
            this.removeAllFiles(),
         );
      }

      if (this.clearButton) {
         this.clearButton.addEventListener("click", () =>
            this.removeAllFiles(),
         );
      }

      if (this.sortSelect) {
         this.sortSelect.addEventListener("change", (e) => {
            this.currentSort = e.target.value;
            this.sortFiles();
            this.updateFileList();
         });
      }

      // Drag & Drop тільки для default варіанту
      if (this.settings.variant === "default") {
         this.setupDragAndDrop();
      }

      // Accordion ініціалізація
      if (this.settings.showAccordion && this.fileListContainer) {
         this.fileListContainer.style.display = "block";

         if (this.settings.accordionDefaultOpen && this.accordionContent) {
            this.accordionContent.classList.add(
               "custom-file-input__accordion-content--open",
            );
         }

         if (
            this.selectedFiles.length === 0 &&
            this.emptyState &&
            this.settings.accordionDefaultOpen
         ) {
            this.emptyState.style.display = "flex";
         }
      }

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

         if (this.settings.showProgress) this.showProgress();

         this.addFiles(files);
         this.animateSuccess();

         setTimeout(() => {
            this.isProcessing = false;
            if (this.settings.showProgress) this.hideProgress();
         }, 500);
      }
   }

   addFiles(files) {
      files.forEach((file) => this.selectedFiles.push(file));

      if (this.settings.enableSort) this.sortFiles();

      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();
      this.updateClearButton();
      this.updateTotalSize();
   }

   updateFileList() {
      if (!this.settings.showFileList || !this.filesContainer) return;

      if (this.fileListContainer) {
         if (this.settings.showAccordion) {
            this.fileListContainer.style.display = "block";
         } else {
            this.fileListContainer.style.display =
               this.selectedFiles.length > 0 ? "block" : "none";
         }
      }

      if (this.emptyState) {
         this.emptyState.style.display =
            this.selectedFiles.length === 0 ? "flex" : "none";
      }

      if (this.removeAllBtn) {
         this.removeAllBtn.style.display =
            this.selectedFiles.length > 0 ? "flex" : "none";
      }

      if (this.totalSizeContainer) {
         this.totalSizeContainer.style.display =
            this.selectedFiles.length > 0 ? "block" : "none";
      }

      this.filesContainer.innerHTML = "";

      this.selectedFiles.forEach((file, index) => {
         this.filesContainer.appendChild(this.createFileItem(file, index));
      });
   }

   createFileItem(file, index) {
      const tpl = this.container
         .closest(".form-group")
         ?.querySelector(".file-item-template");
      const item = tpl
         ? tpl.content.cloneNode(true).firstElementChild
         : document.createElement("div");

      if (!tpl) item.className = "custom-file-input__file-item";

      const nameEl = item.querySelector(".custom-file-input__file-name");
      if (nameEl) {
         nameEl.textContent = file.name;
         nameEl.title = file.name;
      }

      const sizeEl = item.querySelector(".custom-file-input__file-size");
      if (sizeEl) sizeEl.textContent = this.formatFileSize(file.size);

      const previewEl = item.querySelector(".custom-file-input__file-preview");
      if (previewEl) previewEl.replaceWith(this.createFilePreview(file));

      if (this.settings.showFileTypeBadges) {
         const topRow = item.querySelector(".custom-file-input__file-top-row");
         topRow?.appendChild(this.createFileTypeBadge(file));
      }

      const removeBtn = item.querySelector(".custom-file-input__remove-btn");
      if (removeBtn) {
         removeBtn.setAttribute("aria-label", this.settings.removeFileText);

         // Іконка видалення через спрайт якщо передано
         if (this.settings.removeIcon) {
            removeBtn.appendChild(
               this.createSpriteIcon(this.settings.removeIcon),
            );
         }

         removeBtn.addEventListener("click", () => this.removeFile(index));
      }

      return item;
   }

   // Створює <svg><use href="#icon-{name}"></svg> для спрайту
   createSpriteIcon(iconName, extraClass = "") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.classList.add("icon");
      if (extraClass) svg.classList.add(extraClass);

      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", `#icon-${iconName}`);
      svg.appendChild(use);

      // Копіюємо viewBox зі спрайту якщо є (як в Icon.astro)
      const symbol = document.getElementById(`icon-${iconName}`);
      if (symbol) {
         const viewBox = symbol.getAttribute("viewBox");
         if (viewBox) svg.setAttribute("viewBox", viewBox);
      }

      return svg;
   }

   createFileTypeBadge(file) {
      const badge = document.createElement("span");
      badge.className = "custom-file-input__file-badge";

      const ext = file.name.split(".").pop().toLowerCase();

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
         const skeleton = document.createElement("div");
         skeleton.className = "custom-file-input__skeleton";
         preview.appendChild(skeleton);

         const img = document.createElement("img");
         img.className = "custom-file-input__file-img";

         const reader = new FileReader();
         reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
               skeleton.remove();
               preview.appendChild(img);
            };
         };
         reader.readAsDataURL(file);
      } else {
         // Визначаємо потрібну іконку зі спрайту
         const iconName = this.getFileIconName(file);
         if (iconName) {
            preview.appendChild(this.createSpriteIcon(iconName));
         }
      }

      return preview;
   }

   // Повертає назву іконки зі спрайту для типу файлу
   getFileIconName(file) {
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "pdf" && this.settings.iconPdf) {
         return this.settings.iconPdf;
      }

      if (["doc", "docx"].includes(ext) && this.settings.iconDoc) {
         return this.settings.iconDoc;
      }

      // Для зображень без preview або решти файлів
      return this.settings.iconDefault || null;
   }

   formatFileSize(bytes) {
      if (bytes === 0) return `0 ${this.settings.fileSizeText}`;
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} ${this.settings.fileSizeText}`;
   }

   removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();
      this.updateClearButton();
      this.updateTotalSize();

      if (this.selectedFiles.length === 0) {
         this.container.classList.remove("custom-file-input--success");
      }

      this.triggerValidation();
   }

   removeAllFiles() {
      this.selectedFiles = [];
      this.updateFileList();
      this.updateHiddenInput();
      this.updateButtonText();
      this.updateAccordionTitle();
      this.updateClearButton();
      this.updateTotalSize();

      this.container.classList.remove("custom-file-input--success");
      this.triggerValidation();
   }

   updateHiddenInput() {
      const dt = new DataTransfer();
      this.selectedFiles.forEach((file) => dt.items.add(file));
      this.input.files = dt.files;
   }

   updateButtonText() {
      if (!this.settings.showButtonCounter || !this.buttonText) return;

      if (this.selectedFiles.length === 0) {
         this.buttonText.textContent = this.settings.buttonText;
         return;
      }

      let text = this.settings.buttonTextWithFiles.replace(
         "{count}",
         this.selectedFiles.length,
      );
      text = this.settings.maxFiles
         ? text.replace("{max}", this.settings.maxFiles)
         : text.replace("/{max}", "");

      this.buttonText.textContent = text;
   }

   updateAccordionTitle() {
      if (!this.accordionTitle) return;
      this.accordionTitle.textContent =
         this.settings.fileListButtonText.replace(
            "{count}",
            this.selectedFiles.length,
         );
   }

   updateMaxFilesHint() {
      const formGroup = this.container.closest(".form-group");
      const maxFilesHint = formGroup?.querySelector(
         ".custom-file-input__max-files-hint",
      );

      if (maxFilesHint && this.settings.maxFiles) {
         const text =
            maxFilesHint.dataset.text || this.settings.maxFilesHintText;
         maxFilesHint.textContent = text.replace(
            "{max}",
            this.settings.maxFiles,
         );
      }
   }

   updateClearButton() {
      if (!this.clearButton) return;
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

      this.totalSizeContainer.textContent = this.settings.totalSizeText.replace(
         "{size}",
         `${totalMB} ${this.settings.fileSizeText}`,
      );
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
         if (this.progressFill) this.progressFill.style.width = `${percent}%`;
         if (this.progressText) {
            this.progressText.textContent = this.settings.progressText.replace(
               "{percent}",
               percent,
            );
         }
         if (percent >= 100) clearInterval(interval);
      }, 50);
   }

   hideProgress() {
      if (!this.progressContainer) return;
      setTimeout(() => {
         this.progressContainer.style.display = "none";
         if (this.progressFill) this.progressFill.style.width = "0%";
      }, 300);
   }

   showMaxFilesError() {
      alert(
         this.settings.maxFilesText.replace("{max}", this.settings.maxFiles),
      );
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
      this.input.dispatchEvent(new Event("blur", { bubbles: true }));
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
   document.querySelectorAll("[data-file-input]").forEach((container) => {
      if (container.dataset.fileInputInitialized) return;
      container.dataset.fileInputInitialized = "true";
      new CustomFileInputHandler(container);
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initFileInputs);
} else {
   initFileInputs();
}

document.addEventListener("page:ready", initFileInputs);
