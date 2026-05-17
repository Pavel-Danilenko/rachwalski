// custom-search.js — кнопка очищення для CustomSearch компонента

function initCustomSearch() {
   document.querySelectorAll(".custom-search").forEach((wrapper) => {
      if (wrapper.dataset.customSearchInit) return;
      wrapper.dataset.customSearchInit = "true";

      const input    = wrapper.querySelector(".custom-search__input");
      const clearBtn = wrapper.querySelector(".custom-search__clear");
      if (!input || !clearBtn) return;

      const toggle = () => wrapper.classList.toggle("has-value", input.value.length > 0);

      input.addEventListener("input", toggle);

      clearBtn.addEventListener("click", () => {
         input.value = "";
         wrapper.classList.remove("has-value");
         input.dispatchEvent(new Event("input",  { bubbles: true }));
         input.dispatchEvent(new Event("search", { bubbles: true }));
         input.focus();
      });
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initCustomSearch);
} else {
   initCustomSearch();
}

document.addEventListener("page:ready", initCustomSearch);
