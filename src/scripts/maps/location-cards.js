import gotoBlock from "@scripts/global/goto-block";

const selector = "[data-location-card]";

// Клік по адресі картки локації (Cabinet Paris 08 / 16):
// підсвічуємо картку, скролимо до карти і відкриваємо InfoWindow
// потрібного маркера (google-map.js слухає подію "map:focus-location").
function initLocationCards() {
   document.querySelectorAll(selector).forEach((button) => {
      if (button.dataset.locationCardInit) return;
      button.dataset.locationCardInit = "true";

      button.addEventListener("click", () => {
         const index = parseInt(button.dataset.locationIndex, 10);
         if (Number.isNaN(index)) return;

         const card = button.closest(".cl-card, .location-card");

         document
            .querySelectorAll(".cl-card, .location-card")
            .forEach((c) => c.classList.remove("is-active"));
         if (card) card.classList.add("is-active");

         if (!document.querySelector("[data-google-map]")) return;

         gotoBlock("[data-google-map]", ".header");
         document.dispatchEvent(
            new CustomEvent("map:focus-location", { detail: { index } }),
         );
      });
   });
}

initLocationCards();
document.addEventListener("page:ready", initLocationCards);
