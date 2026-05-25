const MD = 768;

function setNavPrimaryWidth() {
   const body = document.querySelector(".nav-overlay__body");
   if (!body) return;

   if (window.innerWidth < MD) {
      body.style.removeProperty("--nav-primary-w");
      return;
   }

   const list = document.querySelector(".nav-overlay__list");
   const primary = document.querySelector(".nav-overlay__primary");
   if (!list || !primary) return;

   const style = getComputedStyle(primary);
   const realPrimaryW = parseFloat(style.paddingLeft) + list.offsetWidth;
   body.style.setProperty("--nav-primary-w", `${realPrimaryW}px`);
}

document.addEventListener("page:ready", setNavPrimaryWidth);
window.addEventListener("resize", setNavPrimaryWidth);
setNavPrimaryWidth();

const listEl = document.querySelector(".nav-overlay__list");
if (listEl) new ResizeObserver(setNavPrimaryWidth).observe(listEl);
