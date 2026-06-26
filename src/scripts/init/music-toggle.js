// music-toggle.js — кнопка вкл/викл фонової музики (напр. у video-banner).
// Браузери блокують autoplay зі звуком — музика грає лише після кліку.
// Вибір користувача зберігається в sessionStorage: при поверненні на сторінку
// в межах того ж сеансу (SPA-перехід назад) музика відновлюється автоматично.
//
// Архітектура Barba-сумісності:
// – Toggle рендериться ЗАВЖДИ в BaseLayout поза barba-контейнером.
// – Джерела (src/webm) передаються через data-атрибути barba-контейнера.
// – page:ready → читаємо джерела з контейнера, якщо є — активуємо; немає — ховаємо.
// – page:leave → зупиняємо музику і ховаємо toggle.

const STORAGE_KEY = "music-enabled";
const storage = sessionStorage;
// Міграція: прибираємо старе значення з localStorage (раніше використовувався localStorage)
localStorage.removeItem(STORAGE_KEY);
const TYPES = { webm: "audio/webm", src: "audio/mpeg" };

// Плавна зміна гучності (fade in/out), скасовує попередній fade при повторному виклику
function fadeVolume(audio, to, duration) {
   if (audio._fadeRaf) cancelAnimationFrame(audio._fadeRaf);

   if (!duration || duration <= 0) {
      audio.volume = to;
      return Promise.resolve();
   }

   const from = audio.volume;
   const start = performance.now();

   return new Promise((resolve) => {
      const step = (now) => {
         const t = Math.min((now - start) / duration, 1);
         audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
         if (t < 1) {
            audio._fadeRaf = requestAnimationFrame(step);
         } else {
            audio._fadeRaf = null;
            resolve();
         }
      };
      audio._fadeRaf = requestAnimationFrame(step);
   });
}

function trackKey(track) {
   return track.src || track.webm || "";
}

// Підставляє <source webm/mp3> треку в <audio>, запам'ятовує його key для exclude
function applyTrack(audio, track) {
   audio.innerHTML = "";

   ["webm", "src"].forEach((key) => {
      if (!track[key]) return;
      const source = document.createElement("source");
      source.src = track[key];
      source.type = TYPES[key];
      audio.appendChild(source);
   });

   audio.load();
   audio.dataset.currentTrack = trackKey(track);
   return audio.querySelector("source") !== null;
}

// Плейлист — обирає випадковий трек (відмінний від поточного, якщо їх більше одного)
function applyRandomTrack(audio, tracksJSON) {
   let tracks;
   try {
      tracks = JSON.parse(tracksJSON);
   } catch {
      return false;
   }
   if (!Array.isArray(tracks) || !tracks.length) return false;

   const pool =
      tracks.length > 1
         ? tracks.filter((t) => trackKey(t) !== audio.dataset.currentTrack)
         : tracks;

   const track = pool[Math.floor(Math.random() * pool.length)];
   return applyTrack(audio, track);
}

// Читає джерела аудіо з маркера всередині barba-контейнера.
// Маркер <meta data-music-page> замінюється Barba разом з innerHTML → надійно зникає на не-музичних сторінках.
function getPageMusicSources() {
   const marker = document.querySelector("[data-music-page]");
   if (!marker) return null;
   const src = marker.dataset.src;
   const webm = marker.dataset.webm;
   if (!src && !webm) return null;
   return { src: src || undefined, webm: webm || undefined };
}

// Підставляє джерела зі сторінки в audio-елемент (якщо ще не ті самі)
function injectPageSources(audio, sources) {
   const key = (sources.webm || sources.src || "");
   if (audio.dataset.injectedKey === key) return true; // вже завантажено

   audio.innerHTML = "";
   if (sources.webm) {
      const s = document.createElement("source");
      s.src = sources.webm;
      s.type = "audio/webm";
      audio.appendChild(s);
   }
   if (sources.src) {
      const s = document.createElement("source");
      s.src = sources.src;
      s.type = "audio/mpeg";
      audio.appendChild(s);
   }
   audio.load();
   audio.dataset.injectedKey = key;
   return audio.querySelector("source") !== null;
}

function showToggles() {
   document.querySelectorAll("[data-music-toggle]").forEach((el) => {
      el.hidden = false;
      el.classList.add("is-visible");
   });
}

function hideToggles() {
   document.querySelectorAll("[data-music-toggle]").forEach((el) => {
      el.classList.remove("is-visible");
   });
}

function tryShowToggles() {
   if (document.documentElement.classList.contains("intro-video")) return;
   showToggles();
}

function initMusicToggle() {
   document.querySelectorAll("[data-music-toggle]").forEach((wrapper) => {
      // Вже повністю ініціалізовано — тільки показуємо
      if (wrapper.dataset.musicToggleInit === "full") return;

      const audio = wrapper.querySelector("[data-music-toggle-audio]");
      const btn = wrapper.querySelector("[data-music-toggle-btn]");
      if (!audio || !btn) return;

      // Спочатку пробуємо взяти джерела з barba-контейнера (SPA-перехід)
      const pageSources = getPageMusicSources();
      const hasTracks = Boolean(wrapper.dataset.tracks);

      let hasSource = false;

      if (pageSources) {
         hasSource = injectPageSources(audio, pageSources);
      } else if (hasTracks) {
         hasSource = applyRandomTrack(audio, wrapper.dataset.tracks);
      } else {
         hasSource = audio.querySelector("source") !== null;
      }

      // Немає джерел — ховаємо та чекаємо наступного page:ready
      if (!hasSource) {
         wrapper.hidden = true;
         return;
      }

      // Є джерела але ще не підключали click-listener → повна ініціалізація
      if (!wrapper.dataset.musicToggleInit) {
         wrapper.dataset.musicToggleInit = "full";

         const targetVolume = parseFloat(wrapper.dataset.volume);
         const volume = Number.isFinite(targetVolume) ? targetVolume : 0.6;
         const fadeDuration = parseInt(wrapper.dataset.fade, 10) || 0;

         audio.volume = 0;

         if (hasTracks) audio.loop = false;

         const setPlaying = (playing) => {
            wrapper.classList.toggle("is-playing", playing);
            btn.setAttribute("aria-pressed", String(playing));
         };

         audio.addEventListener("play", () => setPlaying(true));
         audio.addEventListener("pause", () => setPlaying(false));

         const play = () => {
            audio
               .play()
               .then(() => {
                  fadeVolume(audio, volume, fadeDuration);
                  storage.setItem(STORAGE_KEY, "true");
               })
               .catch(() => {
                  setTimeout(() => {
                     if (audio.paused) setPlaying(false);
                  }, 200);
               });
         };

         const pause = () => {
            fadeVolume(audio, 0, fadeDuration).then(() => audio.pause());
            storage.setItem(STORAGE_KEY, "false");
         };

         btn.addEventListener("click", () => {
            if (audio.paused) play();
            else pause();
         });

         if (hasTracks) {
            audio.addEventListener("ended", () => {
               applyRandomTrack(audio, wrapper.dataset.tracks);
               audio.volume = 0;
               audio.play().then(() => fadeVolume(audio, volume, fadeDuration)).catch(() => {});
            });
         }

         if (storage.getItem(STORAGE_KEY) === "true") play();
      }
   });
}

function stopAllAudio() {
   document.querySelectorAll("[data-music-toggle-audio]").forEach((audio) => {
      if (audio._fadeRaf) cancelAnimationFrame(audio._fadeRaf);
      audio.pause();
   });
}

// ── Ініціалізація ─────────────────────────────────────────────────────────────

function initOnLoad() {
   if (getPageMusicSources()) {
      initMusicToggle();
      tryShowToggles();
   }
   // Немає музики на сторінці — toggle залишається прихованим (hidden за замовчуванням)
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initOnLoad);
} else {
   initOnLoad();
}

// page:music-status — barba.js dispatch'ає це ПЕРЕД page:ready з точним next.container.
// Надійніше ніж document.querySelector після page:ready (немає race condition).
document.addEventListener("page:music-status", ({ detail }) => {
   if (detail.hasMusic) {
      initMusicToggle();
      tryShowToggles();
   } else {
      hideToggles();
      document.querySelectorAll("[data-music-toggle-audio]").forEach((audio) => {
         delete audio.dataset.injectedKey;
      });
   }
});

// Прелоудер зник → показуємо кнопку з невеликою затримкою
document.addEventListener("preloader:hidden", () => {
   setTimeout(() => { if (getPageMusicSources()) showToggles(); }, 400);
});

// SPA-перехід починається — зупиняємо музику і ховаємо кнопку
document.addEventListener("page:leave", () => {
   stopAllAudio();
   hideToggles();
});

// Перемикання вкладки — ставимо на паузу і відновлюємо без зміни вибору
document.addEventListener("visibilitychange", () => {
   document.querySelectorAll("[data-music-toggle-audio]").forEach((audio) => {
      if (document.hidden) {
         if (!audio.paused) {
            audio.dataset.resumeOnVisible = "true";
            audio.pause();
         }
      } else if (audio.dataset.resumeOnVisible === "true") {
         delete audio.dataset.resumeOnVisible;
         audio.play().catch(() => {});
      }
   });
});
