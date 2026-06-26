import { interpolate } from "flubber";
import { bodyLock, bodyUnlock } from "@scripts/global/block-scroll";

// Геометрія логотипу (простір wordmark-а 0 0 214 24)
const DIA_O = "M 13.827762280714676,0.4277340000000116 C 14.2622504197298,0.4277340000000116 14.718407404552575,0.47098834990068283 15.152895543567691,0.5357170816081798 C 15.28318642412913,0.5572748051296443 15.391808458882917,0.5787214063649166 15.522099339444349,0.6002791298863848 C 17.0211389801896,0.8808073413809296 18.15069701934272,1.6362722040648876 18.976335605757644,2.9091779924071375 C 20.323415520133796,4.937715326862634 21.67021762879448,6.922914969702809 23.03896638897829,8.929783458350656 C 23.690698597500973,9.857654548063245 24.950825322931006,11.109447102028795 26.03704567046881,11.843131996618908 C 24.950825322931014,12.576816891209013 23.669029751693312,13.82833163945908 23.03896638897829,14.756202729171683 C 21.67021762879448,16.763071217819515 20.30146886861066,18.747993054944217 18.976335605757644,20.77653038939971 C 18.150697019342726,22.049713983457437 17.02113898018961,22.826458763947393 15.522099339444349,23.085373690777367 C 15.39180845888291,23.085373690777367 15.283186424129124,23.107042536585027 15.152895543567691,23.128711382392687 C 14.718407404552575,23.193440114100184 14.2622504197298,23.23650000000002 13.827762280714676,23.23650000000002 L 8.743917687379206,23.23650000000002 C 8.309429548364083,23.23650000000002 7.8532725635413065,23.193440114100184 7.418784424526191,23.128711382392687 C 7.288493543964751,23.128711382392687 7.179871509210972,23.107042536585027 7.049302822934049,23.085373690777367 C 5.550540987904274,22.804789918139726 4.420705143035679,22.049713983457437 3.595344362336238,20.77653038939971 C 2.270211099483223,18.747993054944217 0.9012956558701113,16.763071217819515 -0.4673419820275093,14.756202729171683 C -1.1191019711217365,13.806662793651427 -2.379173135408678,12.57681689120902 -3.4871456704687773,11.843131996618908 C -2.4008975423594308,11.109447102028795 -1.1191019711217365,9.857654548063238 -0.48906638897826227,8.929783458350656 C 0.8795990294909082,6.922914969702816 2.248264447960082,4.937715326862637 3.573675516528578,2.9091779924071375 C 4.399036297228015,1.6362722040648876 5.550540987904274,0.8592218372879117 7.0276339771263885,0.6002791298863848 C 7.157924857687828,0.5786936257933668 7.266824698157084,0.5573025857011906 7.39711557871853,0.5357170816081798 C 7.831603717733646,0.47098834990068283 8.287760702556422,0.4277340000000116 8.722248841571545,0.4277340000000116 L 13.82776228071467,0.4277340000000116";
const DIA_I = "M 12.17648510788484,1.3340195856195898 C 11.611706088308285,0.9888737647037438 10.894689536647139,0.9888737647037438 10.351579362878244,1.3340195856195898 C 9.830138034917002,1.6793320899647242 9.373981050094226,2.1754930978170286 9.004499448502084,2.758051683184487 C 7.614359648226095,4.916046481054977 6.158657699096157,7.052372433117803 4.7465712472970125,9.210367230988297 C 4.181792227720457,10.051840743185736 3.7689729345129983,11.001380678705992 3.7689729345129983,11.843131996618908 C 3.7689729345129983,12.662936663008686 4.181792227720457,13.612476598528943 4.7465712472970125,14.475618956534042 C 6.15865769909615,16.63361375440453 7.592412996702944,18.769661900751878 9.004499448502084,20.927656698622364 C 9.395649895901887,21.510215283989822 9.830138034917002,22.028322943365268 10.351579362878244,22.351966601902745 C 10.9163583824548,22.6970013005324 11.633374934115945,22.6970013005324 12.17648510788484,22.351966601902745 C 12.697926435846082,22.0066540975576 13.154361226384342,21.510215283989822 13.523565022260993,20.927656698622364 C 14.913982628252473,18.769661900751878 16.369406771666927,16.63361375440453 17.781493223466068,14.475618956534042 C 18.346272243042623,13.634145444336603 18.759369341965563,12.662936663008686 18.759369341965563,11.843131996618908 C 18.737700496157903,11.001380678705985 18.346272243042623,10.051840743185728 17.781493223466068,9.210367230988297 C 16.369406771666927,7.05237243311781 14.935651474060133,4.91604648105498 13.523565022260993,2.758051683184487 C 13.132692380576682,2.175493097817025 12.697926435846082,1.657941049872548 12.17648510788484,1.3340195856195862";
const R_O   = "M22.5499 23.2365C21.5951 22.5806 20.4851 21.4926 19.9262 20.667C18.7308 18.9 17.5354 17.1408 16.371 15.3584C15.6491 14.2395 14.6555 13.5605 13.3514 13.329C13.0564 13.2827 12.7692 13.2441 12.3733 13.1824C12.9788 13.0821 13.4911 13.0281 13.9957 12.9201C15.5715 12.6037 17.0541 12.0713 18.1719 10.8676C21.1061 7.71172 19.7554 2.57281 15.6413 1.17619C14.1432 0.666933 12.6062 0.489463 11.046 0.427734H0C1.49039 1.48484 1.5292 3.01262 1.52144 4.53269V19.3321C1.5292 20.7982 1.45158 22.2334 0.0232873 23.221H6.87753C6.55151 22.7504 6.13233 22.2797 5.89946 21.7318C5.68987 21.2303 5.59672 20.6362 5.5812 20.0806C5.55015 18.0436 5.56567 16.0065 5.56567 13.9772C5.56567 13.8923 5.56567 13.684 5.56567 13.684C5.56567 13.684 7.68482 13.6994 8.71723 13.6762C9.99027 13.6454 10.9218 14.1701 11.6049 15.2272C12.8391 17.1331 14.1044 19.0235 15.3464 20.9217C15.8354 21.6624 16.1925 22.5034 16.2002 23.2365H22.5499Z";
const R_C   = "M5.71316 11.7086H5.58896V2.48021C5.58896 2.48021 9.61767 2.44935 11.5583 2.59595C13.887 2.75799 15.1678 4.20862 15.2687 6.51572C15.3231 7.60369 15.2765 8.68394 14.7564 9.67932C14.1044 10.9062 12.971 11.4772 11.6825 11.5698C9.70306 11.7086 7.70035 11.6701 5.71316 11.7086Z";
const MCX = 11.209582315146902, MCY = -1.6430853643519718, RCX = 11.275;
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

   const morphMs   = Number(preloader.dataset.morphDuration) || 1500;
   const markScale = Number(preloader.dataset.markScale)     || 2.5;
   const stepMs    = Number(preloader.dataset.letterInterval) || 60;
   const ltrMs     = Number(preloader.dataset.letterDuration) || 1000;
   const fadeMs    = Number(preloader.dataset.fadeDuration)   || 600;
   const minTime   = Number(preloader.dataset.minDisplayTime) || 0;
   const maxWait   = Number(preloader.dataset.maxWait)        || 8000;

   const svg     = preloader.querySelector(".preloader__logo");
   const wordG   = preloader.querySelector(".preloader__wordG");
   const markG   = preloader.querySelector(".preloader__markG");
   const morphEl = preloader.querySelector(".preloader__morph");
   const letters = [...preloader.querySelectorAll(".preloader__ltr")];
   if (!svg || !wordG || !markG || !morphEl) return;

   const root = preloader; // CSS-змінні ставимо на сам прелоудер
   root.style.setProperty("--morph-dur", morphMs + "ms");
   root.style.setProperty("--ltr-dur", ltrMs + "ms");

   // Виставляємо стартові трансформи БЕЗ переходу (інакше знак "в'їжджає" збоку,
   // бо на wordG/markG висить transition). is-init вимикає переходи на цю мить.
   preloader.classList.add("is-init");

   // великий центрований стан знаку (морф -> identity)
   markG.style.setProperty("--bigT",
      `translate(${(RCX - markScale * MCX).toFixed(2)}px, ${(VB_CENTER_Y - markScale * MCY).toFixed(2)}px) scale(${markScale})`);
   wordG.style.transform = `translate(${TX_R}px, 0)`;

   const iOuter = interpolate(DIA_O, R_O, { maxSegmentLength: 2 });
   const iInner = interpolate(DIA_I, R_C, { maxSegmentLength: 2 });
   const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
   morphEl.setAttribute("d", iOuter(0) + " " + iInner(0));

   bodyLock();

   const startTime = Date.now();
   let pageLoaded = false;
   let animDone = false;
   let raf = 0;

   function runMorph() {
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      (function frame(now) {
         const t = Math.min((now - t0) / morphMs, 1);
         const e = ease(t);
         morphEl.setAttribute("d", iOuter(e) + " " + iInner(e));
         if (t < 1) raf = requestAnimationFrame(frame);
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

   // — таймлайн появи —
   const T_IN = 50, T_COLLAPSE = 1150, T_MORPH = 1750;
   const T_WORD = T_MORPH + morphMs + 200;
   const seqEnd = T_WORD + (letters.length - 1) * stepMs + ltrMs + 300;

   void preloader.offsetWidth; // зафіксувати стартові трансформи без анімації

   requestAnimationFrame(() => {
      preloader.classList.remove("is-init"); // вмикаємо переходи назад
      setTimeout(() => preloader.classList.add("s-in"), T_IN);
      setTimeout(() => preloader.classList.add("s-collapse"), T_COLLAPSE);
      setTimeout(() => { preloader.classList.add("s-morph"); runMorph(); }, T_MORPH);
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
