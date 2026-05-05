/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRESSBAR COMPONENT - ТУТОРІАЛ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Компонент для створення анімованих прогрес барів (лінійних і кругових).
 * Інтегрується з DataWatch для автоматичної анімації при появі у viewport.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * БАЗОВЕ ВИКОРИСТАННЯ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. ПРОСТИЙ ЛІНІЙНИЙ ПРОГРЕС БАР:
 *
 *    <ProgressBar value={60} />
 *
 * 2. З ВІДОБРАЖЕННЯМ ЗНАЧЕННЯ:
 *
 *    <ProgressBar value={75} showValue />
 *    // Показує: "75%"
 *
 * 3. КРУГОВИЙ ПРОГРЕС:
 *
 *    <ProgressBar value={85} variant="circular" showValue />
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PROPS (ВЛАСТИВОСТІ)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * value: number (обов'язковий)
 *   - Поточне значення прогресу
 *   - Приклад: value={60}
 *
 * max: number (опціонально, за замовчуванням: 100)
 *   - Максимальне значення
 *   - Приклад: value={45} max={60}
 *
 * variant: 'linear' | 'circular' (за замовчуванням: 'linear')
 *   - Тип прогрес бару
 *   - Приклад: variant="circular"
 *
 * size: 'sm' | 'md' | 'lg' (за замовчуванням: 'md')
 *   - Розмір компонента
 *   - sm: малий (6px/80px)
 *   - md: середній (10px/120px)
 *   - lg: великий (16px/160px)
 *   - Приклад: size="lg"
 *
 * color: string (опціонально)
 *   - Колір або градієнт заповнення
 *   - Приклад: color="#10b981"
 *   - Приклад: color="linear-gradient(90deg, #667eea, #764ba2)"
 *
 * duration: number (за замовчуванням: 1)
 *   - Тривалість анімації в секундах
 *   - Приклад: duration={2}
 *
 * easing: string (за замовчуванням: 'ease-out')
 *   - Тип анімації: 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'bounce', 'elastic'
 *   - Приклад: easing="bounce"
 *
 * showValue: boolean (за замовчуванням: false)
 *   - Показувати значення поруч з баром
 *   - Приклад: showValue
 *
 * valueFormat: 'percentage' | 'fraction' (за замовчуванням: 'percentage')
 *   - Формат відображення значення
 *   - percentage: "75%"
 *   - fraction: "75/100"
 *   - Приклад: valueFormat="fraction"
 *
 * striped: boolean (за замовчуванням: false)
 *   - Смугастий патерн
 *   - Приклад: striped
 *
 * stripedAnimated: boolean (за замовчуванням: false)
 *   - Анімований смугастий патерн
 *   - Приклад: striped stripedAnimated
 *
 * rounded: boolean (за замовчуванням: false)
 *   - Повністю круглі краї
 *   - Приклад: rounded
 *
 * class: string (опціонально)
 *   - Додаткові CSS класи
 *   - Приклад: class="my-custom-progress"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ІНТЕГРАЦІЯ З DATAWATCH (АНІМАЦІЯ ПРИ ПОЯВІ)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. АНІМАЦІЯ ОДИН РАЗ (при першій появі у viewport):
 *
 *    <ProgressBar value={75} showValue data-watch-once />
 *
 * 2. АНІМАЦІЯ КОЖНОГО РАЗУ (при вході/виході з viewport):
 *
 *    <ProgressBar value={85} showValue data-watch />
 *
 * 3. З НАЛАШТУВАННЯМИ DATAWATCH:
 *
 *    <ProgressBar
 *      value={90}
 *      showValue
 *      data-watch-once
 *      data-watch-threshold={0.5}     // 50% елемента має бути видно
 *      data-watch-delay={300}          // затримка 300мс перед анімацією
 *      data-watch-margin="100px"       // почати анімацію за 100px до viewport
 *    />
 *
 * 4. БЕЗ АНІМАЦІЇ (статичний бар):
 *
 *    <ProgressBar value={60} showValue />
 *    // Не додавайте data-watch атрибути
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ПРИКЛАДИ ВИКОРИСТАННЯ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. SKILLS БАР (для портфоліо):
 *
 *    <ProgressBar
 *      value={90}
 *      showValue
 *      color="#10b981"
 *      data-watch-once
 *    >
 *      <strong>HTML/CSS</strong>
 *    </ProgressBar>
 *
 * 2. ЗАВАНТАЖЕННЯ ФАЙЛУ:
 *
 *    <ProgressBar
 *      value={uploadProgress}
 *      showValue
 *      striped
 *      stripedAnimated
 *      color="#3b82f6"
 *    />
 *
 * 3. КРУГОВИЙ ІНДИКАТОР ДОСЯГНЕНЬ:
 *
 *    <ProgressBar
 *      value={75}
 *      variant="circular"
 *      size="lg"
 *      color="linear-gradient(135deg, #667eea, #764ba2)"
 *      easing="elastic"
 *      showValue
 *      data-watch-once
 *    />
 *
 * 4. З КАСТОМНИМ КОНТЕНТОМ:
 *
 *    <ProgressBar value={85} variant="circular" data-watch-once>
 *      <strong style="font-size: 24px;">85%</strong>
 *      <span style="font-size: 12px; color: #888;">Complete</span>
 *    </ProgressBar>
 *
 * 5. BOUNCE ЕФЕКТ:
 *
 *    <ProgressBar
 *      value={95}
 *      easing="bounce"
 *      duration={1.5}
 *      showValue
 *      data-watch-once
 *    />
 *
 * 6. ДРІБ ЗАМІСТЬ ВІДСОТКІВ:
 *
 *    <ProgressBar
 *      value={45}
 *      max={60}
 *      showValue
 *      valueFormat="fraction"
 *      data-watch-once
 *    />
 *    // Показує: "45/60"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * КАСТОМІЗАЦІЯ ЧЕРЕЗ CSS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Доступні CSS змінні для перевизначення:
 *
 * --progress-height        // висота лінійного бару (за замовчуванням: 10px)
 * --progress-bg            // колір фону треку (за замовчуванням: #e5e7eb)
 * --progress-fill          // колір заповнення (за замовчуванням: #3b82f6)
 * --progress-radius        // радіус закруглення (за замовчуванням: 6px)
 * --progress-duration      // тривалість анімації (за замовчуванням: 1s)
 * --progress-value-color   // колір тексту значення (за замовчуванням: #374151)
 * --progress-stroke-width  // товщина обводки для circular (за замовчуванням: 8)
 *
 * ПРИКЛАД КАСТОМІЗАЦІЇ:
 *
 * <ProgressBar value={80} class="my-progress" showValue data-watch-once />
 *
 * <style>
 *   .my-progress {
 *     --progress-fill: linear-gradient(90deg, #f093fb, #f5576c);
 *     --progress-bg: rgba(0, 0, 0, 0.1);
 *     --progress-height: 14px;
 *     --progress-radius: 20px;
 *     --progress-duration: 2s;
 *   }
 * </style>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SLOTS (ДЛЯ КАСТОМНОГО КОНТЕНТУ)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. DEFAULT SLOT (поруч з баром):
 *
 *    <ProgressBar value={75}>
 *      <strong>JavaScript</strong>
 *      <span>75%</span>
 *    </ProgressBar>
 *
 * 2. LABEL SLOT (всередині бару):
 *
 *    <ProgressBar value={90} size="lg">
 *      <span slot="label" style="color: white; font-size: 12px;">90%</span>
 *    </ProgressBar>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ВАЖЛИВО
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. DataWatch має бути підключений окремо:
 *    import '../path/to/dataWatch.js';
 *
 * 2. Компонент підтримує Astro View Transitions автоматично
 *
 * 3. Анімація значення (лічильник) синхронізується з прогрес баром
 *
 * 4. Для форм з кроками краще використовувати окремий ProgressStepper компонент
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ProgressBar {
   constructor() {
      this.init();
   }

   init() {
      const progressBars = document.querySelectorAll(
         ".progress-bar[data-watch-once]",
      );

      if (progressBars.length === 0) return;

      progressBars.forEach((bar) => {
         // Слухаємо коли DataWatch додасть клас
         const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
               if (mutation.target.classList.contains("_watcher-view")) {
                  this.animateValue(bar);
                  observer.disconnect(); // одноразово
               }
            });
         });

         observer.observe(bar, {
            attributes: true,
            attributeFilter: ["class"],
         });
      });
   }

   animateValue(bar) {
      const valueElement = bar
         .closest(".progress-bar-wrapper")
         ?.querySelector(".progress-bar__value");
      if (!valueElement) return;

      const targetValue = parseFloat(bar.dataset.progressValue);
      const duration =
         parseFloat(
            getComputedStyle(bar).getPropertyValue("--progress-duration"),
         ) * 1000 || 1000;
      const isPercentage = valueElement.textContent.includes("%");
      const isFraction = valueElement.textContent.includes("/");

      let startTime = null;

      const animate = (currentTime) => {
         if (!startTime) startTime = currentTime;
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / duration, 1);

         // Easing function (ease-out)
         const easedProgress = 1 - Math.pow(1 - progress, 3);
         const currentValue = Math.round(easedProgress * targetValue);

         if (isPercentage) {
            valueElement.textContent = `${currentValue}%`;
         } else if (isFraction) {
            const max = bar.dataset.progressMax || 100;
            const fractionValue = Math.round((currentValue / 100) * max);
            valueElement.textContent = `${fractionValue}/${max}`;
         }

         if (progress < 1) {
            requestAnimationFrame(animate);
         }
      };

      requestAnimationFrame(animate);
   }

   destroy() {
      // Cleanup
   }
}

// Ініціалізація
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => {
      window.progressBar = new ProgressBar();
   });
} else {
   window.progressBar = new ProgressBar();
}

// Astro View Transitions
document.addEventListener("astro:page-load", () => {
   if (window.progressBar) {
      window.progressBar.destroy();
   }
   window.progressBar = new ProgressBar();
});

export default ProgressBar;
