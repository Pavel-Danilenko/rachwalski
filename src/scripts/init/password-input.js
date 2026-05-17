const CHECKS = {
   length:    (val, min) => val.length >= min,
   uppercase: (val)      => /[A-Z]/.test(val),
   lowercase: (val)      => /[a-z]/.test(val),
   numbers:   (val)      => /[0-9]/.test(val),
   special:   (val)      => /[^A-Za-z0-9]/.test(val),
};

function calcStrength(value, items) {
   if (!value) return 0;
   let passed = 0;
   items.forEach(([req, min]) => {
      if (CHECKS[req]?.(value, min)) passed++;
   });
   if (passed === 0) return 0;
   if (passed <= Math.ceil(items.length / 3)) return 1;
   if (passed < items.length) return 2;
   return 3;
}

function buildPasswordInput(wrapper) {
   if (wrapper.dataset.initialized) return;
   wrapper.dataset.initialized = "true";

   const input   = wrapper.querySelector(".password-input__input");
   const toggle  = wrapper.querySelector(".password-input__toggle");
   const capsEl  = wrapper.querySelector("[data-capslock]");
   const eyeGaze = wrapper.querySelector(".eye-gaze");
   const strengthEl   = wrapper.querySelector("[data-strength]");
   const requiresEl   = wrapper.querySelector("[data-requirements]");

   // ── Збираємо вимоги з DOM ────────────────────────────────────────────────
   const reqItems = [];
   requiresEl?.querySelectorAll("[data-req]").forEach((li) => {
      reqItems.push([li.dataset.req, parseInt(li.dataset.min ?? "0")]);
   });

   // ── Eye tracking з lerp — плавна інерція зіниці ──────────────────────────
   if (eyeGaze) {
      let curX = 0, curY = 0;
      let tgtX = 0, tgtY = 0;
      let raf  = null;

      const lerp = (a, b, t) => a + (b - a) * t;

      const tick = () => {
         curX = lerp(curX, tgtX, 0.07);
         curY = lerp(curY, tgtY, 0.07);
         eyeGaze.style.transform = `translate(${curX}px, ${curY}px)`;

         if (Math.abs(curX - tgtX) > 0.005 || Math.abs(curY - tgtY) > 0.005) {
            raf = requestAnimationFrame(tick);
         } else {
            eyeGaze.style.transform = `translate(${tgtX}px, ${tgtY}px)`;
            raf = null;
         }
      };

      const startTick = () => {
         if (!raf) raf = requestAnimationFrame(tick);
      };

      const track = (e) => {
         if (wrapper.classList.contains("is-visible")) return;
         const rect  = toggle.getBoundingClientRect();
         const cx    = rect.left + rect.width  / 2;
         const cy    = rect.top  + rect.height / 2;
         const dx    = (e.clientX - cx) / (rect.width  / 2);
         const dy    = (e.clientY - cy) / (rect.height / 2);
         const dist  = Math.sqrt(dx * dx + dy * dy);
         const clamp = dist > 1 ? 1 / dist : 1;
         tgtX = dx * clamp * 2.2;
         tgtY = dy * clamp * 2.2;
         startTick();
      };

      const reset = () => {
         tgtX = 0;
         tgtY = 0;
         startTick();
      };

      wrapper.addEventListener("mousemove", track);
      wrapper.addEventListener("mouseleave", reset);
   }

   // ── Toggle show/hide ─────────────────────────────────────────────────────
   toggle?.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      wrapper.classList.toggle("is-visible", isHidden);
      input.focus();
   });

   // ── Caps Lock ────────────────────────────────────────────────────────────
   if (capsEl) {
      const updateCaps = (e) => {
         const on = e.getModifierState?.("CapsLock");
         capsEl.style.display = on ? "" : "none";
         wrapper.classList.toggle("has-capslock", !!on);
      };
      input.addEventListener("keydown", updateCaps);
      input.addEventListener("keyup",   updateCaps);
   }

   // ── Strength + Requirements ──────────────────────────────────────────────
   function updateFeedback(value) {
      // Requirements checklist
      requiresEl?.querySelectorAll("[data-req]").forEach((li) => {
         const req = li.dataset.req;
         const min = parseInt(li.dataset.min ?? "0");
         const ok  = CHECKS[req]?.(value, min) ?? false;
         li.classList.toggle("is-met", ok);
      });

      // Strength meter
      if (!strengthEl) return;
      const level = calcStrength(value, reqItems.length ? reqItems : [["length", 8]]);
      const label = strengthEl.querySelector(".password-input__strength-label");

      strengthEl.dataset.level = value ? String(level) : "";

      const texts = { 1: strengthEl.dataset.weak, 2: strengthEl.dataset.medium, 3: strengthEl.dataset.strong };
      if (label) label.textContent = value ? (texts[level] ?? "") : "";
   }

   input.addEventListener("input", (e) => updateFeedback(e.target.value));

   // ── Валідація errorWeak через FormValidator ──────────────────────────────
   input.addEventListener("blur", () => {
      if (!input.value || !input.dataset.errorWeak) return;
      const level = calcStrength(input.value, reqItems.length ? reqItems : [["length", 8]]);
      if (level < 2) {
         // Додаємо помилку через FormValidator якщо вона вже ініціалізована
         const formGroup = input.closest(".form-group");
         const errEl = formGroup?.querySelector(".error-message");
         if (errEl && !formGroup.classList.contains("error")) {
            formGroup.classList.add("error");
            errEl.textContent = input.dataset.errorWeak;
         }
      }
   });

   input.addEventListener("input", () => {
      const formGroup = input.closest(".form-group");
      if (formGroup?.classList.contains("error")) {
         formGroup.classList.remove("error");
         const errEl = formGroup.querySelector(".error-message");
         if (errEl) errEl.textContent = "";
      }
   });
}

function initPasswordInputs() {
   document.querySelectorAll("[data-password-input]").forEach(buildPasswordInput);
}

initPasswordInputs();
document.addEventListener("page:ready", initPasswordInputs);
