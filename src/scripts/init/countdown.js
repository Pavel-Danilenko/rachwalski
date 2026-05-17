const timers = new Map();

function pad(n) {
   return String(n).padStart(2, "0");
}

function computeTime(deadline) {
   let diff = Math.max(0, Math.floor((new Date(deadline) - Date.now()) / 1000));
   const days = Math.floor(diff / 86400);
   diff -= days * 86400;
   const hours = Math.floor(diff / 3600);
   diff -= hours * 3600;
   const minutes = Math.floor(diff / 60);
   diff -= minutes * 60;
   const seconds = diff;
   return { days, hours, minutes, seconds };
}

function getLabel(labelObj, format) {
   if (!labelObj || format === "none") return null;
   return format === "long" ? labelObj.long : labelObj.short;
}

// Анімує заміну числа залежно від режиму
function animateNumber(wrap, newVal, mode) {
   const current = wrap.querySelector(".countdown__number");
   if (!current || current.textContent === newVal) return;

   if (mode === "none") {
      current.textContent = newVal;
      return;
   }

   // Клонуємо старий елемент як "exit", новий як "enter"
   const exit = current;
   const enter = current.cloneNode(true);
   enter.textContent = newVal;

   exit.classList.add("is-exit");
   enter.classList.add("is-enter");
   wrap.appendChild(enter);

   // Прибираємо після завершення анімації
   const cleanup = () => {
      exit.remove();
      enter.classList.remove("is-enter");
   };
   enter.addEventListener("animationend", cleanup, { once: true });
   // Fallback якщо animationend не стріляє
   setTimeout(cleanup, 500);
}

function initCountdowns() {
   document.querySelectorAll("[data-countdown]").forEach((el) => {
      if (timers.has(el)) return;

      const deadline = el.dataset.deadline;
      const units = el.dataset.units.split(",");
      const labelFormat = el.dataset.labelFormat ?? "short";
      const labels = JSON.parse(el.dataset.labels ?? "{}");
      const animation = el.dataset.animation ?? "none";
      const animPerUnit = JSON.parse(el.dataset.animationPerUnit ?? "{}");
      const onExpireFn = el.dataset.onExpire;
      let expired = false;

      function tick() {
         const time = computeTime(deadline);
         const total = time.days + time.hours + time.minutes + time.seconds;

         units.forEach((unit) => {
            const block = el.querySelector(`[data-unit="${unit}"]`);
            if (!block) return;

            const wrap = block.querySelector(".countdown__num-wrap");
            const lblEl = block.querySelector(".countdown__label");
            const mode = animPerUnit[unit] ?? animation;

            if (wrap) animateNumber(wrap, pad(time[unit]), mode);

            if (lblEl) {
               const text = getLabel(labels[unit], labelFormat);
               if (text !== null) lblEl.textContent = text;
            }
         });

         if (total <= 0 && !expired) {
            expired = true;
            el.classList.add("countdown--expired");
            clearInterval(id);
            timers.delete(el);

            if (onExpireFn) {
               try {
                  new Function(onExpireFn)();
               } catch (e) {
                  console.warn("[Countdown] onExpire error:", e);
               }
            }

            el.dispatchEvent(
               new CustomEvent("countdown:expire", { bubbles: true }),
            );
         }
      }

      tick();
      const id = setInterval(tick, 1000);
      timers.set(el, id);
   });
}

function cleanup() {
   timers.forEach((id) => clearInterval(id));
   timers.clear();
}

document.addEventListener("page:leave", cleanup);
document.addEventListener("page:ready", initCountdowns);
initCountdowns();
