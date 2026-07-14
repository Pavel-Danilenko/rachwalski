// nav.ts — єдиний конфіг навігації
// Змінюєш url/label тут → оновлюється скрізь: меню, footer, sitemap
//
// Використання в шаблоні:
//   import { nav } from "@config/nav";
//   <NavItem nav="about" />

export type NavItem = {
   label: string;
   url?: string; // звичайне посилання
   goto?: string; // скрол до секції: "#section-id"
   gotoOffset?: string; // відступ для скролу: ".header" | "80" | ".header, 20"
   target?: "_blank"; // відкрити в новій вкладці
   children?: Record<string, NavItem>;
};

export const nav = {
   // ── Основні сторінки ──────────────────────────────────────────────────

   main: {
      label: "Main page",
      url: "/",
   },
   biography: {
      label: "Biography",
      url: "/biography",
   },

   rhinoplasty: {
      label: "Rhinoplasty",
      url: "/rhinoplasty",
   },
   fees: {
      label: "Fees",
      url: "/fees",
   },

   clinicAlphand: {
      label: "Clinic Alphand",
      url: "/clinic-alphand",
   },

   consultationLocations: {
      label: "Consultation locations",
      url: "/consultation-locations",
   },

   testimonials: {
      label: "Testimonials",
      url: "/testimonials",
   },

   alphabet: {
      label: "Alphabet",
      url: "/alphabet",
   },

   blog: {
      label: "Blog",
      url: "/blog",
   },

   contact: {
      label: "Contact us",
      url: "/contact",
   },

   facialAssessment: {
      label: "Assessment by Area",
      url: "/facial-assessment",
   },

   // ── Facial Assessment (тимчасові плейсхолдери) ───────────────────────────
   faUpperBrowAssessment:     { label: "Brow assessment",        url: "/brow-assessment" },
   faUpperEyelidEvaluation:   { label: "Eyelid evaluation",      url: "/eyelid-evaluation" },

   // ── Facial Surgery (тимчасові плейсхолдери) ──────────────────────────────
   fsNoseRhinoplasty:         { label: "Rhinoplasty",            url: "/rhinoplasty" },
   fsNoseSeptoplasty:         { label: "Septoplasty",            url: "/septoplasty" },

   fsEarsOtoplasty:           { label: "Otoplasty",              url: "/otoplasty" },

   // ── Aesthetic Medicine (тимчасові плейсхолдери) ───────────────────────────
   amBotoxForehead:           { label: "Forehead lines",         url: "/forehead-lines" },

   amHaLipFiller:             { label: "Lip filler",             url: "/lip-filler" },

   // ── З дочірніми пунктами ──────────────────────────────────────────────
   // services: {
   //    label: "Послуги",
   //    url: "/services",
   //    children: {
   //       web:    { label: "Веб-розробка", url: "/services/web" },
   //       design: { label: "Дизайн",       url: "/services/design" },
   //    },
   // },

   // ── Скрол до секції (без переходу на іншу сторінку) ──────────────────
   // scrollContact: {
   //    label: "Контакти",
   //    goto: "#contact",
   //    gotoOffset: ".header",
   // },
} satisfies Record<string, NavItem>;

export type NavKey = keyof typeof nav;
