import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

// Геометрія: знак logo-mark (простір 541×355) вписаний групою .preloader__mark
// (transform у розмітці) в простір wordmark-а (0 0 214 24) так, щоб R знаку
// точно лягала на R слова. MCX/MCY — центр ромбового кластера знаку в локальних
// координатах markG: MCX = -11.4642 + 0.1246·270.5, MCY = -21.0035 + 0.1246·177.5.
const MCX = 22.2401, MCY = 1.113, RCX = 11.275;
const TX_R = 95.73, TX_F = 0.18;   // зсув wordG: R по центру -> фінальний центр
const VB_CENTER_Y = 12;

let _running = false;

function initPreloaderLogo() {
   if (_running) return;

   const preloader = document.getElementById("preloader");
   if (!preloader) return;
   // is:inline робить прелоудер видимим лише на першому візиті/reload. Якщо прихований — пропускаємо.
   if (preloader.style.opacity !== "1") return;
   _running = true;

   const collapseAt  = Number(preloader.dataset.collapseAt)       || 1150;
   const drawAt      = Number(preloader.dataset.drawAt)           || 2100;
   const petalMs     = Number(preloader.dataset.petalDuration)    || 600;
   const petalStep   = Number(preloader.dataset.petalStep)        || 120;
   const dissolveMs  = Number(preloader.dataset.dissolveDuration) || 800;
   const dissolveStr = Number(preloader.dataset.dissolveStrength) || 90;
   const drawMs    = Number(preloader.dataset.drawDuration)   || 1500;
   const placeMs   = Number(preloader.dataset.placeDuration)  || 1000;
   const markScale = Number(preloader.dataset.markScale)      || 2.5;
   const stepMs    = Number(preloader.dataset.letterInterval) || 60;
   const ltrMs     = Number(preloader.dataset.letterDuration) || 1000;
   const fadeMs    = Number(preloader.dataset.fadeDuration)   || 600;
   const minTime   = Number(preloader.dataset.minDisplayTime) || 0;
   const maxWait   = Number(preloader.dataset.maxWait)        || 8000;

   const svg   = preloader.querySelector(".preloader__logo");
   const wordG = preloader.querySelector(".preloader__wordG");
   const markG = preloader.querySelector(".preloader__markG");
   const dispEl = preloader.querySelector("#preloader-dissolve feDisplacementMap");
   const letters = [...preloader.querySelectorAll(".preloader__ltr")];
   if (!svg || !wordG || !markG) return;

   // Хаотична поява ромбів: випадковий порядок + нерівні паузи (щораз інші).
   // petalStep — базовий крок між появами, джиттер додає до 70% кроку зверху.
   const petals = [...preloader.querySelectorAll(".preloader__petal")];
   petals
      .map((el) => ({ el, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .forEach(({ el }, pos) => {
         const jitter = Math.random() * petalStep * 0.7;
         el.style.setProperty("--in-delay", Math.round(pos * petalStep + jitter) + "ms");
      });

   const root = preloader; // CSS-змінні ставимо на сам прелоудер
   root.style.setProperty("--petal-dur", petalMs + "ms");
   root.style.setProperty("--petal-step", petalStep + "ms");
   root.style.setProperty("--dissolve-dur", dissolveMs + "ms");
   root.style.setProperty("--draw-dur", drawMs + "ms");
   root.style.setProperty("--place-dur", placeMs + "ms");
   root.style.setProperty("--ltr-dur", ltrMs + "ms");

   // Виставляємо стартові трансформи БЕЗ переходу (інакше знак "в'їжджає" збоку,
   // бо на wordG/markG висить transition). is-init вимикає переходи на цю мить.
   preloader.classList.add("is-init");

   // великий центрований стан знаку (s-place -> identity, R стає на місце в слові)
   markG.style.setProperty("--bigT",
      `translate(${(RCX - markScale * MCX).toFixed(2)}px, ${(VB_CENTER_Y - markScale * MCY).toFixed(2)}px) scale(${markScale})`);
   wordG.style.transform = `translate(${TX_R}px, 0)`;

   bodyLock();

   const startTime = Date.now();
   let pageLoaded = false;
   let animDone = false;

   // Розпилення контуру ромба: CSS не анімує scale у feDisplacementMap,
   // тому крутимо його вручну (0 → dissolveStr, ease-in — розліт прискорюється),
   // синхронно з фейдом контуру в CSS (--dissolve-dur).
   function runDissolve() {
      if (!dispEl) return;
      const t0 = performance.now();
      (function frame(now) {
         const t = Math.min((now - t0) / dissolveMs, 1);
         dispEl.setAttribute("scale", String(dissolveStr * t * t));
         if (t < 1) requestAnimationFrame(frame);
      })(performance.now());
   }

   function revealWord() {
      // слово однією плавною хвилею з'їжджає до центру за час каскаду
      const glide = (letters.length - 1) * stepMs + ltrMs * 0.6;
      root.style.setProperty("--recenter", glide + "ms");
      wordG.style.transform = `translate(${TX_F}px, 0)`;
      letters.forEach((el, i) => setTimeout(() => { el.style.opacity = "1"; }, i * stepMs));
      setTimeout(() => preloader.classList.add("show-sub"), (letters.length - 1) * stepMs + ltrMs * 0.5);
   }

   // — таймлайн: ромби -> 3 зникають, у нижнього гасне заливка (лишається строк)
   //   і проявляється паличка -> контур розпилюється, R добудовується вліво від
   //   палички -> R їде на місце -> дописується слово —
   const T_IN = 50, T_COLLAPSE = collapseAt, T_DRAW = drawAt;
   const T_PLACE = T_DRAW + drawMs + 100;
   const T_WORD  = T_PLACE + placeMs + 100;
   const seqEnd  = T_WORD + (letters.length - 1) * stepMs + ltrMs + 300;

   void preloader.offsetWidth; // зафіксувати стартові трансформи без анімації

   requestAnimationFrame(() => {
      preloader.classList.remove("is-init"); // вмикаємо переходи назад
      setTimeout(() => preloader.classList.add("s-in"), T_IN);
      setTimeout(() => preloader.classList.add("s-collapse"), T_COLLAPSE);
      setTimeout(() => { preloader.classList.add("s-draw"); runDissolve(); }, T_DRAW);
      setTimeout(() => preloader.classList.add("s-place"), T_PLACE);
      setTimeout(() => { preloader.classList.add("s-word"); revealWord(); }, T_WORD);
      setTimeout(() => { animDone = true; tryHide(); }, seqEnd);
   });

   function tryHide() {
      if (!pageLoaded || !animDone) return;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minTime - elapsed);
      setTimeout(() => {
         bodyUnlock();
         document.documentElement.classList.add("preloader-loaded");
         preloader.style.transition = `opacity ${fadeMs}ms ease, visibility ${fadeMs}ms ease`;
         preloader.style.opacity = "0";
         preloader.style.visibility = "hidden";
         // диспатчимо коли ПОЧИНАЄТЬСЯ затухання — щоб відео-інтро стартувало під ним без чорного провалу
         document.dispatchEvent(new CustomEvent("preloader:hidden"));
         setTimeout(() => { preloader.style.display = "none"; }, fadeMs + 50);
      }, remaining);
   }

   if (document.readyState === "complete") {
      pageLoaded = true;
   } else {
      window.addEventListener("load", () => { pageLoaded = true; tryHide(); }, { once: true });
      // стеля: не чекаємо вічно на важкі ресурси
      setTimeout(() => { if (!pageLoaded) { pageLoaded = true; tryHide(); } }, maxWait);
   }
}

initPreloaderLogo();
