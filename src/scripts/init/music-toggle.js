// music-toggle.js — кнопка вкл/викл фонової музики (напр. у video-banner).
// Браузери блокують autoplay зі звуком — музика грає лише після кліку.
// Вибір користувача зберігається в localStorage: при поверненні на сторінку
// в межах того ж сеансу (SPA-перехід назад) музика відновлюється автоматично.

const STORAGE_KEY = "music-enabled";
const storage = sessionStorage;
// Міграція: прибираємо старе значення з localStorage (раніше використовувався localStorage)
localStorage.removeItem(STORAGE_KEY);
const TYPES = { webm: "audio/webm", src: "audio/mpeg" };

// Плавна зміна громкості (fade in/out), скасовує попередній fade при повторному викликy
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

function showToggles() {
   document.querySelectorAll("[data-music-toggle]").forEach((el) => {
      el.classList.add("is-visible");
   });
}

function tryShowToggles() {
   if (document.documentElement.classList.contains("intro-video")) return;
   showToggles();
}

function initMusicToggle() {
   document.querySelectorAll("[data-music-toggle]").forEach((wrapper) => {
      if (wrapper.dataset.musicToggleInit) return;
      wrapper.dataset.musicToggleInit = "true";

      const audio = wrapper.querySelector("[data-music-toggle-audio]");
      const btn = wrapper.querySelector("[data-music-toggle-btn]");
      if (!audio || !btn) return;

      const targetVolume = parseFloat(wrapper.dataset.volume);
      const volume = Number.isFinite(targetVolume) ? targetVolume : 0.6;
      const fadeDuration = parseInt(wrapper.dataset.fade, 10) || 0;
      const hasTracks = Boolean(wrapper.dataset.tracks);

      let hasSource = audio.querySelector("source") !== null;
      if (!hasSource && hasTracks) {
         hasSource = applyRandomTrack(audio, wrapper.dataset.tracks);
      }

      if (!hasSource) {
         // Немає аудіо-джерела (ні src/webm, ні tracks) — ховаємо кнопку
         wrapper.hidden = true;
         return;
      }

      audio.volume = 0;

      // Плейлист — не зациклюємо один трек, на "ended" переходимо до наступного
      if (hasTracks) audio.loop = false;

      const setPlaying = (playing) => {
         wrapper.classList.toggle("is-playing", playing);
         btn.setAttribute("aria-pressed", String(playing));
      };

      // Стан кнопки синхронізується з реальними play/pause аудіо
      // (включно з авто-переходами треків та паузою при зміні вкладки)
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
               // Chrome може відхилити Promise але audio реально грає (quirk при SPA).
               // Даємо 200ms щоб браузер встиг стрілити pause-подію після blocked autoplay,
               // тоді перевіряємо фактичний стан.
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

      // Плейлист — трек закінчився, переходимо до наступного випадкового
      if (hasTracks) {
         audio.addEventListener("ended", () => {
            applyRandomTrack(audio, wrapper.dataset.tracks);
            audio.volume = 0;
            audio.play().then(() => fadeVolume(audio, volume, fadeDuration)).catch(() => {});
         });
      }

      if (storage.getItem(STORAGE_KEY) === "true") play();
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", () => { initMusicToggle(); tryShowToggles(); });
} else {
   initMusicToggle();
   tryShowToggles();
}

document.addEventListener("page:ready", () => { initMusicToggle(); tryShowToggles(); });

// Відео завершилось → показуємо кнопку музики
document.addEventListener("video-intro:done", showToggles);

// Відео перезапустилось (resize) → ховаємо
document.addEventListener("video-intro:restart", () => {
   document.querySelectorAll("[data-music-toggle]").forEach((el) => {
      el.classList.remove("is-visible");
   });
});

// SPA-перехід на іншу сторінку — зупиняємо музику разом з відео-інтро
document.addEventListener("page:leave", () => {
   document.querySelectorAll("[data-music-toggle-audio]").forEach((audio) => {
      if (audio._fadeRaf) cancelAnimationFrame(audio._fadeRaf);
      audio.pause();
   });
});

// Перемикання вкладки — ставимо на паузу і відновлюємо без зміни вибору
// користувача (localStorage не торкаємо, це лише тимчасова пауза)
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
