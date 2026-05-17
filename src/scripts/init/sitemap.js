class Sitemap {
   constructor(el) {
      this.el = el;
      this.breakpoint = parseInt(el.dataset.sitemapBreakpoint) || 768;
      this.mq = window.matchMedia(`(max-width: ${this.breakpoint}px)`);

      this.mq.addEventListener("change", (e) => this.onBreakpoint(e.matches));
      this.onBreakpoint(this.mq.matches);

      this.el.addEventListener("click", (e) => {
         const trigger = e.target.closest("[data-sitemap-trigger]");
         if (!trigger) return;
         const group = trigger.closest("[data-sitemap-group]");
         if (!group) return;
         group.classList.toggle("sitemap__group--open");
      });
   }

   onBreakpoint(isMobile) {
      this.el.classList.toggle("sitemap--accordion", isMobile);

      if (isMobile) {
         this.el.querySelectorAll("[data-sitemap-group]").forEach((group) => {
            group.classList.remove("sitemap__group--open");
         });
         this.el.querySelectorAll("[data-sitemap-group][data-sitemap-open]").forEach((group) => {
            group.classList.add("sitemap__group--open");
         });
      }
   }

   destroy() {
      this.mq.removeEventListener("change", this.onBreakpoint);
   }
}

function initSitemap() {
   document.querySelectorAll("[data-sitemap]").forEach((el) => {
      if (el.dataset.sitemapInitialized) return;
      el.dataset.sitemapInitialized = "true";
      new Sitemap(el);
   });
}

initSitemap();
document.addEventListener("page:ready", initSitemap);

export default Sitemap;
