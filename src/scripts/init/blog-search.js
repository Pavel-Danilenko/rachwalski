// blog-search.js — пошук по картках блогу
// Налаштування через data-атрибути на [data-blog-search]:
//   data-debounce="300"   — затримка пошуку в мс (default: 0)
//   data-min-chars="2"    — мінімум символів для старту (default: 2)
//   data-highlight="true" — підсвічувати текст збігів (default: false)
//
// Текст "нічого не знайдено" — в HTML через [data-search-empty] (не в JS!)
// Приклад: <p data-search-empty hidden>No articles found</p>

export const selector = "[data-blog-search]";

// ── Highlight helpers ──────────────────────────────────────────────────────

function highlightText(el, query) {
   if (!el) return;
   // Зберігаємо оригінал тільки один раз
   if (!el.dataset.originalHtml) el.dataset.originalHtml = el.innerHTML;
   const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
   const re = new RegExp(`(${escaped})`, "gi");
   el.innerHTML = el.dataset.originalHtml.replace(re, "<mark>$1</mark>");
}

function restoreText(el) {
   if (!el || !el.dataset.originalHtml) return;
   el.innerHTML = el.dataset.originalHtml;
   delete el.dataset.originalHtml;
}

// ── Debounce ───────────────────────────────────────────────────────────────

function debounce(fn, delay) {
   if (!delay) return fn;
   let timer;
   return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// ── Init ───────────────────────────────────────────────────────────────────

function initBlogSearch() {
   const input = document.querySelector(selector);
   if (!input) return;
   if (input.dataset.blogSearchInit) return;
   input.dataset.blogSearchInit = "true";

   // Читаємо налаштування з data-атрибутів
   const debounceMs  = parseInt(input.dataset.debounce ?? "0", 10);
   const minChars    = parseInt(input.dataset.minChars  ?? "2", 10);
   const doHighlight = input.dataset.highlight === "true";

   const paginationRoot = document.querySelector("[data-pagination-root]");

   // Елемент "нічого не знайдено" — рендериться в HTML, JS тільки ховає/показує
   const emptyEl = document.querySelector("[data-search-empty]");

   function getCards() {
      return [...document.querySelectorAll(".post-card")];
   }

   function getText(card, sel) {
      return card.querySelector(sel)?.textContent?.toLowerCase() ?? "";
   }

   function applyFilter(query) {
      const q = query.toLowerCase().trim();
      const cards = getCards();

      cards.forEach((card) => {
         // Скидаємо highlight
         if (doHighlight) {
            restoreText(card.querySelector(".post-card__title"));
            restoreText(card.querySelector(".post-card__excerpt"));
         }

         if (q.length < minChars) {
            card.removeAttribute("data-search-excluded");
            return;
         }

         const title    = getText(card, ".post-card__title");
         const excerpt  = getText(card, ".post-card__excerpt");
         const category = getText(card, ".post-card__category");
         const matches  = title.includes(q) || excerpt.includes(q) || category.includes(q);

         if (matches) {
            card.removeAttribute("data-search-excluded");
            if (doHighlight) {
               highlightText(card.querySelector(".post-card__title"),   query.trim());
               highlightText(card.querySelector(".post-card__excerpt"), query.trim());
            }
         } else {
            card.setAttribute("data-search-excluded", "");
         }
      });

      // Оновлюємо пагінацію
      paginationRoot?.dispatchEvent(new CustomEvent("pagination:filter"));

      // "Нічого не знайдено"
      if (emptyEl) {
         const hasResults = q.length >= minChars
            ? cards.some((c) => !c.hasAttribute("data-search-excluded"))
            : true;
         emptyEl.hidden = hasResults;
      }
   }

   const debouncedFilter = debounce(applyFilter, debounceMs);

   input.addEventListener("input", (e) => debouncedFilter(e.target.value));

   input.addEventListener("search", (e) => {
      if (!e.target.value) applyFilter("");
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initBlogSearch);
} else {
   initBlogSearch();
}

document.addEventListener("page:ready", initBlogSearch);
