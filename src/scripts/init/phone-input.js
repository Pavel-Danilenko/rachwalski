// Правила форматування: [мін цифр, макс цифр, маска]
const PHONE_RULES = {
   AF: [9,  9,  "XX XXX XXXX"],  AL: [9,  9,  "XXX XXX XXX"],
   DZ: [9,  9,  "XXX XXX XXX"],  AR: [10, 10, "XX XXXX XXXX"],
   AM: [8,  8,  "XX XXX XXX"],   AU: [9,  9,  "XXX XXX XXX"],
   AT: [7,  13, "XXXX XXXXXXX"], AZ: [9,  9,  "XX XXX XXXX"],
   BY: [9,  9,  "XX XXX XXXX"],  BE: [9,  9,  "XXX XX XX XX"],
   BR: [10, 11, "XX XXXXX XXXX"],BG: [8,  9,  "XXX XXX XXX"],
   CA: [10, 10, "XXX XXX XXXX"], CL: [9,  9,  "X XXXX XXXX"],
   CN: [11, 11, "XXX XXXX XXXX"],CO: [10, 10, "XXX XXX XXXX"],
   HR: [8,  9,  "XX XXX XXXX"],  CZ: [9,  9,  "XXX XXX XXX"],
   DK: [8,  8,  "XX XX XX XX"],  EG: [10, 10, "XXX XXX XXXX"],
   EE: [7,  8,  "XXXX XXXX"],    FI: [9,  10, "XXX XXXXXXX"],
   FR: [9,  9,  "X XX XX XX XX"],GE: [9,  9,  "XXX XXX XXX"],
   DE: [10, 11, "XXXX XXXXXXX"], GR: [10, 10, "XXX XXX XXXX"],
   HU: [9,  9,  "XX XXX XXXX"],  IN: [10, 10, "XXXXX XXXXX"],
   ID: [9,  12, "XXX XXXX XXXX"],IE: [9,  9,  "XXX XXX XXX"],
   IL: [9,  9,  "XX XXX XXXX"],  IT: [9,  10, "XXX XXX XXXX"],
   JP: [10, 11, "XXX XXXX XXXX"],KZ: [10, 10, "XXX XXX XXXX"],
   LV: [8,  8,  "XXXX XXXX"],    LT: [8,  8,  "XXX XXXXX"],
   MY: [9,  10, "XX XXXX XXXX"], MX: [10, 10, "XXX XXX XXXX"],
   MD: [8,  8,  "XX XXX XXX"],   NL: [9,  9,  "X XX XX XX XX"],
   NZ: [8,  10, "XX XXX XXXX"],  NG: [10, 10, "XXX XXX XXXX"],
   NO: [8,  8,  "XXX XX XXX"],   PK: [10, 10, "XXX XXX XXXX"],
   PH: [10, 10, "XXX XXX XXXX"], PL: [9,  9,  "XXX XXX XXX"],
   PT: [9,  9,  "XXX XXX XXX"],  RO: [9,  9,  "XXX XXX XXX"],
   SA: [9,  9,  "XX XXX XXXX"],  RS: [9,  9,  "XX XXX XXXX"],
   SG: [8,  8,  "XXXX XXXX"],    SK: [9,  9,  "XXX XXX XXX"],
   SI: [8,  8,  "XX XXX XXX"],   ZA: [9,  9,  "XX XXX XXXX"],
   KR: [9,  10, "XXX XXXX XXXX"],ES: [9,  9,  "XXX XXX XXX"],
   SE: [9,  10, "XXX XXX XXXX"], CH: [9,  9,  "XX XXX XX XX"],
   TW: [9,  9,  "XXX XXX XXX"],  TH: [9,  9,  "XXX XXX XXX"],
   TR: [10, 10, "XXX XXX XXXX"], UA: [9,  9,  "XX XXX XX XX"],
   AE: [9,  9,  "XX XXX XXXX"],  UK: [10, 10, "XXXX XXX XXX"],
   US: [10, 10, "XXX XXX XXXX"], UZ: [9,  9,  "XX XXX XXXX"],
   VN: [9,  10, "XXX XXX XXXX"],
};

function applyMask(digits, mask) {
   if (!mask) return digits.match(/.{1,3}/g)?.join(" ") ?? digits;
   let out = "", i = 0;
   for (const ch of mask) {
      if (i >= digits.length) break;
      out += ch === "X" ? digits[i++] : (i < digits.length ? ch : "");
   }
   return out;
}

function getRule(iso) {
   return PHONE_RULES[iso] ?? [7, 15, null];
}

function buildPhoneInput(wrapper) {
   if (wrapper.dataset.initialized) return;
   wrapper.dataset.initialized = "true";

   const showCode   = wrapper.dataset.showCode === "true";
   const trigger    = wrapper.querySelector(".phone-input__trigger");
   const flagEl     = wrapper.querySelector(".phone-input__flag");
   const dialEl     = wrapper.querySelector(".phone-input__dial");
   const numberInput= wrapper.querySelector(".phone-input__number");
   const hiddenInput= wrapper.querySelector(".phone-input__value");
   const searchInput= wrapper.querySelector(".phone-input__search");
   const list       = wrapper.querySelector(".phone-input__list");
   const noResults  = wrapper.querySelector(".phone-input__no-results");

   let selectedIso  = wrapper.querySelector(".phone-input__option.is-active")?.dataset.iso ?? "UA";
   let selectedDial = wrapper.querySelector(".phone-input__option.is-active")?.dataset.dial ?? "+380";
   let digits       = "";

   // ── Форматування ────────────────────────────────────────────────────────
   function reformat(raw) {
      const [, maxLen, mask] = getRule(selectedIso);
      const trimmed = raw.slice(0, maxLen);
      return { digits: trimmed, formatted: applyMask(trimmed, mask) };
   }

   // ── Синхронізація з FormValidator ────────────────────────────────────────
   function syncValue() {
      hiddenInput.value = digits ? `${selectedDial}${digits}` : "";
      hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
   }

   // ── Дропдаун ─────────────────────────────────────────────────────────────
   function openDropdown() {
      trigger.setAttribute("aria-expanded", "true");
      wrapper.classList.add("is-open");
      searchInput?.focus();
   }

   function closeDropdown() {
      trigger.setAttribute("aria-expanded", "false");
      wrapper.classList.remove("is-open");
      if (searchInput) {
         searchInput.value = "";
         filterList("");
      }
   }

   function filterList(query) {
      const q = query.toLowerCase().trim();
      let visible = 0;
      list.querySelectorAll(".phone-input__option").forEach((opt) => {
         const match = !q
            || opt.dataset.name.includes(q)
            || opt.dataset.dial.includes(q)
            || opt.dataset.iso.toLowerCase().includes(q);
         opt.style.display = match ? "" : "none";
         if (match) visible++;
      });
      if (noResults) noResults.style.display = visible === 0 ? "" : "none";
   }

   // ── Вибір країни ──────────────────────────────────────────────────────────
   function selectCountry(iso, dial, flagOrCode) {
      selectedIso  = iso;
      selectedDial = dial;

      flagEl.textContent = showCode ? iso : flagOrCode;
      dialEl.textContent = dial;

      // Переформатуємо номер під нові правила
      if (digits) {
         const { digits: d, formatted } = reformat(digits);
         digits = d;
         numberInput.value = formatted;
      }

      list.querySelectorAll(".phone-input__option").forEach((opt) => {
         opt.classList.toggle("is-active", opt.dataset.iso === iso);
      });

      closeDropdown();
      numberInput.focus();
      syncValue();
   }

   // ── Events: тригер ────────────────────────────────────────────────────────
   trigger.addEventListener("click", () => {
      wrapper.classList.contains("is-open") ? closeDropdown() : openDropdown();
   });

   trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         wrapper.classList.contains("is-open") ? closeDropdown() : openDropdown();
      }
      if (e.key === "Escape") closeDropdown();
   });

   // ── Events: список ────────────────────────────────────────────────────────
   list.addEventListener("click", (e) => {
      const opt = e.target.closest(".phone-input__option");
      if (!opt) return;
      e.stopPropagation();
      const flagSpan = opt.querySelector(".phone-input__option-flag");
      selectCountry(opt.dataset.iso, opt.dataset.dial, flagSpan?.textContent ?? opt.dataset.iso);
   });

   // ── Events: пошук ────────────────────────────────────────────────────────
   if (searchInput) {
      searchInput.addEventListener("input", (e) => filterList(e.target.value));
      searchInput.addEventListener("click", (e) => e.stopPropagation());
      searchInput.addEventListener("keydown", (e) => {
         if (e.key === "Escape") closeDropdown();
      });
   }

   // ── Events: закрити при кліку поза ───────────────────────────────────────
   document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) closeDropdown();
   });

   // ── Events: поле номера ───────────────────────────────────────────────────
   numberInput.addEventListener("input", (e) => {
      const target = e.target;
      const cursorPos = target.selectionStart;
      const digitsBeforeCursor = target.value
         .slice(0, cursorPos)
         .replace(/\D/g, "").length;

      const raw = target.value.replace(/\D/g, "");
      const { digits: d, formatted } = reformat(raw);
      digits = d;
      target.value = formatted;

      // Відновлюємо позицію курсора
      let newCursor = formatted.length, counted = 0;
      for (let i = 0; i < formatted.length; i++) {
         if (/\d/.test(formatted[i])) {
            counted++;
            if (counted === digitsBeforeCursor) { newCursor = i + 1; break; }
         }
      }
      target.setSelectionRange(newCursor, newCursor);
      syncValue();
   });

   numberInput.addEventListener("focus", () => wrapper.classList.add("is-focused"));

   numberInput.addEventListener("blur", () => {
      wrapper.classList.remove("is-focused");
      syncValue(); // синхронізуємо навіть якщо нічого не вводили
      setTimeout(() => hiddenInput.dispatchEvent(new Event("blur")), 0);
   });
}

function initPhoneInputs() {
   document.querySelectorAll("[data-phone-input]").forEach(buildPhoneInput);
}

initPhoneInputs();
document.addEventListener("page:ready", initPhoneInputs);
