// Додаткові ефекти для wizard — auto-focus, Enter key, shake on error
// Кожен ефект вмикається через data-атрибут на <form>:
//   data-wizard-autofocus     — фокус першого поля при зміні кроку
//   data-wizard-enter-key     — Enter переходить між полями / на наступний крок
//   data-wizard-shake         — трясе крок при помилці валідації

let _wizardEffectsInited = false;

// ── Auto-height (як Swiper autoHeight) ───────────────────────────────────────
function initWizardAutoHeight() {
   document.querySelectorAll(".wizard-steps-wrapper").forEach((wrapper) => {
      if (wrapper.dataset.autoHeightInit) return;
      wrapper.dataset.autoHeightInit = "true";
      const getVisible = () =>
         wrapper.querySelector(".wizard-step--active, .wizard-step--enter");

      const setHeight = () => {
         const visible = getVisible();
         if (visible) wrapper.style.height = visible.scrollHeight + "px";
      };

      // Початкова висота
      setHeight();

      // ResizeObserver реагує на зміну розміру (в т.ч. коли wizard генерує summary HTML)
      const ro = new ResizeObserver(setHeight);
      wrapper.querySelectorAll("[data-wizard-step]").forEach((s) => ro.observe(s));

      // MutationObserver — для зміни класів (enter/active)
      const mo = new MutationObserver(setHeight);
      wrapper.querySelectorAll("[data-wizard-step]").forEach((s) => {
         mo.observe(s, { attributes: true, attributeFilter: ["class"] });
      });
   });
}

function initWizardEffects() {
   if (_wizardEffectsInited) return;
   const forms = document.querySelectorAll("form[data-wizard-shake], form[data-wizard-autofocus], form[data-wizard-enter-key]");
   if (!forms.length) return;
   _wizardEffectsInited = true;

      // ── Напрямок слайду (forward / back) ─────────────────────────────────────
   document.addEventListener("click", (e) => {
      const form = e.target.closest("form");
      if (!form) return;
      if (e.target.closest("[data-wizard-next]"))   form.dataset.wizardDir = "forward";
      if (e.target.closest("[data-wizard-prev]"))   form.dataset.wizardDir = "back";
   }, true);

   // ── Shake при помилці ──────────────────────────────────────────────────────
   document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-wizard-next]");
      if (!btn) return;

      const form = btn.closest("form[data-wizard-shake]");
      if (!form) return;

      setTimeout(() => {
         const activeStep = form.querySelector(".wizard-step--active");
         if (activeStep?.querySelector(".form-group.error")) {
            activeStep.classList.add("wizard-shake");
            activeStep.addEventListener("animationend", () => {
               activeStep.classList.remove("wizard-shake");
            }, { once: true });
         }
      }, 50);
   });

   // ── Auto-focus першого поля після зміни кроку ─────────────────────────────
   document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-wizard-next], [data-wizard-prev]");
      if (!btn) return;

      const form = btn.closest("form[data-wizard-autofocus]");
      if (!form) return;

      setTimeout(() => {
         const activeStep = form.querySelector(".wizard-step--active");
         const first = activeStep?.querySelector("input:not([type=hidden]), select, textarea");
         first?.focus();
      }, 320); // після анімації переходу
   });

   // ── Enter → наступне поле або кнопка "Далі" ───────────────────────────────
   document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const input = e.target.closest("input:not([type=submit]):not([type=button])");
      if (!input) return;

      const form = input.closest("form[data-wizard-enter-key]");
      if (!form) return;

      const activeStep = form.querySelector(".wizard-step--active");
      if (!activeStep?.contains(input)) return;

      const inputs = [...activeStep.querySelectorAll("input:not([type=hidden]), select, textarea")];
      const idx = inputs.indexOf(input);

      if (idx >= 0 && idx < inputs.length - 1) {
         // Є наступне поле в кроці — перейти до нього
         e.preventDefault();
         inputs[idx + 1].focus();
      } else if (idx === inputs.length - 1) {
         // Останнє поле кроку — натиснути "Далі"
         e.preventDefault();
         const nextBtn = form.querySelector("[data-wizard-next]");
         if (nextBtn && nextBtn.style.display !== "none") nextBtn.click();
      }
   });
}

initWizardAutoHeight();
initWizardEffects();
document.addEventListener("page:ready", () => {
   initWizardAutoHeight();
   initWizardEffects();
});
document.addEventListener("page:leave", () => {
   _wizardEffectsInited = false;
});
