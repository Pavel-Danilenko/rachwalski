function getBars() {
   return document.querySelectorAll("[data-mobile-booking-bar]");
}

function showAll() {
   getBars().forEach((bar) => bar.classList.add("is-visible"));
}

function hideAll() {
   getBars().forEach((bar) => bar.classList.remove("is-visible"));
}

function tryShow(delay = 600) {
   if (document.documentElement.classList.contains("intro-video")) return;
   setTimeout(showAll, delay);
}

function initMobileBookingBar() {
   if (!getBars().length) return;
   tryShow();
}

initMobileBookingBar();
document.addEventListener("page:ready", initMobileBookingBar);

// Відео завершилось → показуємо панель
document.addEventListener("video-intro:done", showAll);

// Відео перезапустилось (resize mobile↔desktop) → ховаємо до наступного done
document.addEventListener("video-intro:restart", hideAll);

// SPA: при виході ховаємо
document.addEventListener("page:leave", hideAll);
