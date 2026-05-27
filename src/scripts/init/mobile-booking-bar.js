const THRESHOLD = window.innerHeight * 0.3;

function initMobileBookingBar() {
   const bar = document.querySelector("[data-mobile-booking-bar]");
   if (!bar) return;

   function update() {
      bar.classList.toggle("is-visible", window.scrollY >= THRESHOLD);
   }

   window.addEventListener("scroll", update, { passive: true });
   update();
}

initMobileBookingBar();
document.addEventListener("page:ready", initMobileBookingBar);
