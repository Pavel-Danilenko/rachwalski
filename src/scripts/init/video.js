// video.js — підтримка адаптивних <source> (mobile/desktop, webm/mp4),
// lazy-завантаження через IntersectionObserver та prefers-reduced-motion.

import { bodyLock, bodyUnlock, resetBodyLock } from "@scripts/global/block-scroll";

const selectorAttr = "[data-video]";

function prefersReducedMotion() {
   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Data Saver / повільне з'єднання (2g) — увімкнено користувачем або провайдером
function isDataSaverOn() {
   const conn = navigator.connection;
   if (!conn) return false;
   return Boolean(conn.saveData) || conn.effectiveType === "slow-2g" || conn.effectiveType === "2g";
}

// Обирає webm/mp4 джерела залежно від поточної ширини екрана
function getDesiredSources(video) {
   const bp = parseInt(video.dataset.mobileBreakpoint, 10);
   const isMobile = !Number.isNaN(bp) && window.matchMedia(`(max-width: ${bp}px)`).matches;

   const webm = (isMobile && video.dataset.webmMobile) || video.dataset.webm || "";
   const src  = (isMobile && video.dataset.srcMobile)  || video.dataset.src  || "";

   return { webm, src };
}

// Safari повертає "maybe" для video/webm (canPlayType не гарантує роботу),
// але реально WebM-відео або не грає, або грає без відеокадрів (known bug).
// navigator.vendor === "Apple Computer, Inc." — надійний маркер Safari/WebKit на macOS і iOS.
const isSafari = navigator.vendor === "Apple Computer, Inc.";
const supportsWebm = !isSafari && !!document.createElement("video").canPlayType("video/webm");

// Вибирає найкраще підтримуване джерело і встановлює video.src напряму.
// Пряме video.src надійніше ніж динамічні <source>-елементи в Safari:
// при <source> Safari може "застрягнути" на невідомому форматі і не перейти до наступного.
// Повертає true, якщо джерело дійсно змінилось (відео перезавантажилось).
function applySources(video) {
   const { webm, src } = getDesiredSources(video);
   const key = `${webm}|${src}`;
   if (video.dataset.appliedSources === key) return false;

   const wasPlaying = !video.paused && !video.ended;
   video.dataset.appliedSources = key;

   // Пряме video.src= надійніше ніж <source>-елементи при динамічному управлінні в Safari.
   // НЕ викликаємо video.load() — зміна src автоматично перезапускає завантаження,
   // а нативний autoplay-атрибут спрацьовує без потреби в JS play() (Safari це дозволяє,
   // але блокує programmatic play() без user gesture).
   const bestSrc = (webm && supportsWebm) ? webm : src;
   video.innerHTML = "";
   if (bestSrc) video.src = bestSrc;

   if (wasPlaying) {
      video.play().catch(() => {
         video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
      });
   }
   return true;
}

function tryAutoplay(video) {
   if (!video.autoplay || prefersReducedMotion()) return;
   // Safari: якщо native autoplay вже запустив відео до виконання JS — не викликаємо play()
   // ще раз, щоб уникнути конфлікту (подвійний play() може призвести до стопу або зависання).
   if (!video.paused) return;
   // play() може відхилитись якщо відео ще не буфернуло.
   // Якщо відхилено — слухаємо canplay і повторюємо.
   // Якщо знову відхилено — браузер заблокував autoplay, мовчки ігноруємо.
   video.play().catch(() => {
      video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
   });
}

// Заморожує відео на останньому кадрі (для повторних SPA-переходів на pageIntro-відео)
// Слухаємо loadedmetadata, бо applySources() нижче викличе video.load() і скине readyState
function freezeOnLastFrame(video) {
   const seekToEnd = () => {
      if (video.duration) video.currentTime = video.duration;
   };
   // Якщо метадані вже є — шукаємо одразу (Safari native autoplay встигає до JS)
   if (video.readyState >= 1) seekToEnd();
   // Завжди реєструємо loadedmetadata як резерв: applySources нижче може перезавантажити
   // відео при зміні mobile ⇄ desktop джерел, скинувши readyState і currentTime.
   // Без цього listener seekToEnd не спрацює для нового src.
   video.addEventListener("loadedmetadata", seekToEnd, { once: true });
}

// pageIntro-відео: на свіжому заході/reload — лок скролу + хедер прихований
// (через клас "intro-video" на <html>, знятий на ended). При SPA-переході
// клас уже відсутній — відео не грає, показуємо останній кадр.
// Сигналізує іншим скриптам (напр. video-hotspots.js), що відео-інтро завершилось
function markIntroDone() {
   document.documentElement.dataset.introVideoDone = "true";
   document.dispatchEvent(new CustomEvent("video-intro:done"));
}

// Блокує скрол і хедер на час відтворення pageIntro-відео, знімає лок на "ended"
function lockForIntro(video) {
   // Autoplay не відбудеться (Data Saver / prefers-reduced-motion) —
   // одразу прибираємо лок і показуємо хедер, інакше вони "застрягнуть" назавжди
   // Перевіряємо originalAutoplay — lockForIntro сам встановлює video.autoplay = false
   // щоб Safari не перестартував після pause(), тому video.autoplay вже може бути false.
   const wantsAutoplay = video.dataset.originalAutoplay !== "false";
   if (!wantsAutoplay || prefersReducedMotion()) {
      document.documentElement.classList.remove("intro-video");
      markIntroDone();
      return;
   }

   bodyLock();

   let finished = false;
   // timeupdate — резерв для Safari: "ended" може не стрілити коли playbackRate != 1
   // з <source> елементами (WebKit bug). Відстежуємо currentTime вручну.
   const onTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration) finish();
   };
   const finish = () => {
      if (finished) return;
      finished = true;
      video.removeEventListener("timeupdate", onTimeUpdate);
      document.documentElement.classList.remove("intro-video");
      bodyUnlock();
      markIntroDone();
   };

   if (video.ended) { finish(); return; }

   video.addEventListener("ended", finish, { once: true });
   video.addEventListener("timeupdate", onTimeUpdate);

   // Зупиняємо native autoplay і чекаємо буфер перед стартом.
   // Safari при зміні playbackRate > 1 посередині відтворення вимагає N× більше даних
   // і "зависає" поки не добуферить — це і є причина 30-секундного чорного екрана.
   // Рішення: встановити rate ДО першого play(), коли буфер уже готовий.
   // preload="auto" продовжує завантаження навіть на паузі.
   video.autoplay = false; // без цього Safari може перестартувати autoplay після pause()
   if (!video.paused) video.pause();

   const startIntro = () => {
      const rate = video.dataset.playbackRate ? parseFloat(video.dataset.playbackRate) : 1;
      // Safari WebKit bug: playbackRate > 1 зависає незалежно від буфера — проблема декодера
      // (відео застрягає між keyframe-ами). На Safari грає на 1×; Chrome/Firefox отримають rate.
      if (rate > 1 && !isSafari) video.playbackRate = rate;
      video.play().catch(() => {
         video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
      });
   };

   // canplaythrough: браузер має достатньо буфера для відтворення до кінця (при 1×).
   // На localhost завантажується майже миттєво; встановлення rate до play() означає
   // що Safari не перебуферовує — він отримує rate ще до першого кадру.
   if (video.readyState >= 4) {
      startIntro();
   } else {
      video.addEventListener("canplaythrough", startIntro, { once: true });
   }

   // Запобіжник: якщо canplaythrough/play так і не відбувся (заблокований autoplay
   // або дуже повільна мережа) — розблоковуємо сторінку щоб не зависла назавжди.
   const fallbackTimer = setTimeout(() => {
      video.removeEventListener("canplaythrough", startIntro);
      if (video.paused && !video.ended) finish();
   }, 8000);
   video.addEventListener("playing", () => clearTimeout(fallbackTimer), { once: true });
}

function setupPageIntro(video) {
   if (video.dataset.pageIntro !== "true") return;

   if (document.documentElement.classList.contains("intro-video")) {
      lockForIntro(video);
   } else {
      video.autoplay = false;
      video.pause(); // Safari стартує native autoplay до виконання JS — примусово зупиняємо
      freezeOnLastFrame(video);
   }
}

// Перезапуск інтро при заміні джерел відео (mobile ⇄ desktop) на resize —
// відео грає з початку, тож хедер/доти/скрол повертаються в стан "до інтро"
function restartIntro(video) {
   document.documentElement.classList.add("intro-video");
   document.documentElement.dataset.introVideoDone = "false";
   document.dispatchEvent(new CustomEvent("video-intro:restart"));
   // lockForIntro раніше поставив video.autoplay = false — відновлюємо перед повторним викликом
   video.autoplay = video.dataset.originalAutoplay !== "false";
   lockForIntro(video);
}

function initVideo() {
   const videos = document.querySelectorAll(selectorAttr);
   if (!videos.length) return;

   const responsiveVideos = [];

   videos.forEach((video) => {
      if (video.dataset.videoInit) return;
      video.dataset.videoInit = "true";

      const wrapper = video.closest(".video-wrapper");
      const playBtn = wrapper?.querySelector("[data-video-play]");

      // Data Saver / повільне з'єднання — не запускаємо autoplay
      if (video.dataset.respectDataSaver !== "false" && video.autoplay && isDataSaverOn()) {
         video.autoplay = false;
         video.pause();
      }

      // Зберігаємо оригінальне значення autoplay після Data Saver (lockForIntro може його змінити)
      video.dataset.originalAutoplay = video.autoplay ? "true" : "false";

      // Poster ховається назавжди після першого старту відтворення
      video.addEventListener("playing", () => {
         wrapper?.classList.add("is-playing");
      }, { once: true });

      // Кнопка play видима тільки коли відео на паузі (і не приховане через offscreen-пауза)
      if (playBtn) {
         const syncPlayButton = () => {
            const hidden = !video.paused || video.dataset.pausedOffscreen === "true";
            playBtn.classList.toggle("is-hidden", hidden);
         };
         syncPlayButton();
         video.addEventListener("play", syncPlayButton);
         video.addEventListener("pause", syncPlayButton);
         video.addEventListener("ended", syncPlayButton);

         playBtn.addEventListener("click", () => {
            applySources(video);
            video.play().catch(() => {});
         });
      }

      // Пауза коли відео виходить за межі екрана, продовження при поверненні.
      // pageIntro-відео завжди fullscreen і повинно грати без перерв — observer не потрібен.
      if (video.dataset.pauseOffscreen !== "false" && video.dataset.pageIntro !== "true") {
         const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  if (video.dataset.pausedOffscreen === "true") {
                     video.dataset.pausedOffscreen = "false";
                     video.play().catch(() => {});
                  }
               } else if (!video.paused) {
                  video.dataset.pausedOffscreen = "true";
                  video.pause();
               }
            });
         });
         visibilityObserver.observe(video);
      }

      // pageIntro: playbackRate встановлюється всередині lockForIntro (перед play())
      if (video.dataset.playbackRate && video.dataset.pageIntro !== "true") {
         const rate = parseFloat(video.dataset.playbackRate);
         if (rate > 0) {
            const applyRate = () => { video.playbackRate = rate; };
            if (video.readyState >= 4) {
               applyRate();
            } else {
               video.addEventListener("canplaythrough", applyRate, { once: true });
            }
         }
      }

      if (video.dataset.mobileBreakpoint) responsiveVideos.push(video);

      setupPageIntro(video);

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
               const changed = applySources(video);
               // pageIntro-відео перезавантажилось (mobile ⇄ desktop) і грає з початку —
               // повертаємо стан "до інтро" (хедер/доти сховані, скрол заблокований)
               if (changed && video.dataset.pageIntro === "true") {
                  restartIntro(video);
               }
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

// Якщо користувач пішов зі сторінки до завершення відео-інтро —
// одразу повертаємо хедер і розблоковуємо скрол (інакше вони "застрягнуть")
document.addEventListener("page:leave", () => {
   if (document.documentElement.classList.contains("intro-video")) {
      document.documentElement.classList.remove("intro-video");
      resetBodyLock();
   }
});
