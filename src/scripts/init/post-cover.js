function placeCover() {
   const cover = document.querySelector(".post-body__cover");
   if (!cover) return;

   const body = cover.closest(".post-body");
   if (!body) return;

   const h2s = [...body.querySelectorAll("h2")];

   if (h2s.length >= 2) {
      h2s[1].before(cover);
   } else {
      body.appendChild(cover);
   }

   cover.classList.add("is-placed");
}

placeCover();
document.addEventListener("page:ready", placeCover);
