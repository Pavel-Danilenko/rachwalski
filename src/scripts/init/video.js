// video.js — підтримка адаптивних <source> (mobile/desktop, webm/mp4),
// lazy-завантаження через IntersectionObserver та prefers-reduced-motion.

const selectorAttr = "[data-video]";

function prefersReducedMotion() {
   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Обирає webm/mp4 джерела залежно від поточної ширини екрана
function getDesiredSources(video) {
   const bp = parseInt(video.dataset.mobileBreakpoint, 10);
   const isMobile = !Number.isNaN(bp) && window.matchMedia(`(max-width: ${bp}px)`).matches;

   const webm = (isMobile && video.dataset.webmMobile) || video.dataset.webm || "";
   const src  = (isMobile && video.dataset.srcMobile)  || video.dataset.src  || "";

   return { webm, src };
}

// Перебудовує <source> елементи, якщо потрібна інша пара (mobile ⇄ desktop)
function applySources(video) {
   const { webm, src } = getDesiredSources(video);
   const key = `${webm}|${src}`;
   if (video.dataset.appliedSources === key) return;

   const wasPlaying = !video.paused && !video.ended;
   video.dataset.appliedSources = key;
   video.innerHTML = "";

   if (webm) {
      const source = document.createElement("source");
      source.src  = webm;
      source.type = "video/webm";
      video.appendChild(source);
   }
   if (src) {
      const source = document.createElement("source");
      source.src  = src;
      source.type = "video/mp4";
      video.appendChild(source);
   }

   video.load();
   if (wasPlaying) video.play().catch(() => {});
}

function tryAutoplay(video) {
   if (!video.autoplay || prefersReducedMotion()) return;
   video.play().catch(() => {});
}

function initVideo() {
   const videos = document.querySelectorAll(selectorAttr);
   if (!videos.length) return;

   const responsiveVideos = [];

   videos.forEach((video) => {
      if (video.dataset.videoInit) return;
      video.dataset.videoInit = "true";

      const wrapper = video.closest(".video-wrapper");

      video.addEventListener("playing", () => {
         wrapper?.classList.add("is-playing");
      });

      if (video.dataset.mobileBreakpoint) responsiveVideos.push(video);

      if (video.dataset.lazy === "true") {
         const observer = new IntersectionObserver(
            (entries, obs) => {
               entries.forEach((entry) => {
                  if (!entry.isIntersecting) return;
                  applySources(video);
                  tryAutoplay(video);
                  obs.unobserve(video);
               });
            },
            { rootMargin: "200px" },
         );
         observer.observe(video);
      } else {
         applySources(video);
         tryAutoplay(video);
      }
   });

   // На зміну ширини — перевіряємо чи треба підмінити mobile ⇄ desktop джерела
   if (responsiveVideos.length) {
      let resizeTimer = null;
      window.addEventListener("resize", () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(() => {
            responsiveVideos.forEach((video) => {
               // До видимості (lazy, ще не в viewport) джерела не підміняємо
               if (video.dataset.lazy === "true" && !video.dataset.appliedSources) return;
               applySources(video);
            });
         }, 200);
      });
   }
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initVideo);
} else {
   initVideo();
}

document.addEventListener("page:ready", initVideo);
