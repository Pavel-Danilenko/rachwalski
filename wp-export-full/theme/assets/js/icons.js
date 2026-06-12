function initIcons() {
  document.querySelectorAll(".icon[data-icon]").forEach((icon) => {
    const symbol = document.getElementById(`icon-${icon.getAttribute("data-icon")}`);
    if (!symbol) return;
    const viewBox = symbol.getAttribute("viewBox");
    if (viewBox) icon.setAttribute("viewBox", viewBox);
  });
}
initIcons();
document.addEventListener("page:ready", initIcons);
