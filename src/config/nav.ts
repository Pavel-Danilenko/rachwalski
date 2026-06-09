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
   faUpperForeheadAnalysis:   { label: "Forehead analysis",      url: "/rhinoplasty" },
   faUpperBrowAssessment:     { label: "Brow assessment",        url: "/rhinoplasty" },
   faUpperEyelidEvaluation:   { label: "Eyelid evaluation",      url: "/rhinoplasty" },

   faMidCheekAssessment:      { label: "Cheek assessment",       url: "/rhinoplasty" },
   faMidNasalEvaluation:      { label: "Nasal evaluation",       url: "/rhinoplasty" },

   faLowerJawline:            { label: "Jawline assessment",     url: "/rhinoplasty" },
   faLowerChin:               { label: "Chin evaluation",        url: "/rhinoplasty" },
   faLowerLip:                { label: "Lip analysis",           url: "/rhinoplasty" },
   faLowerNeck:               { label: "Neck assessment",        url: "/rhinoplasty" },

   faOtherEar:                { label: "Ear assessment",         url: "/rhinoplasty" },
   faOtherSkin:               { label: "Skin quality",           url: "/rhinoplasty" },
   faOtherHarmony:            { label: "Overall harmony",        url: "/rhinoplasty" },
   faOtherSymmetry:           { label: "Facial symmetry",        url: "/rhinoplasty" },

   // ── Facial Surgery (тимчасові плейсхолдери) ──────────────────────────────
   fsNoseRhinoplasty:         { label: "Rhinoplasty",            url: "/rhinoplasty" },
   fsNoseSeptoplasty:         { label: "Septoplasty",            url: "/rhinoplasty" },
   fsNoseTipRefinement:       { label: "Tip refinement",         url: "/rhinoplasty" },

   fsEarsOtoplasty:           { label: "Otoplasty",              url: "/rhinoplasty" },
   fsEarsEarlobeRepair:       { label: "Earlobe repair",         url: "/rhinoplasty" },

   fsEyelidsUpper:            { label: "Upper blepharoplasty",   url: "/rhinoplasty" },
   fsEyelidsLower:            { label: "Lower blepharoplasty",   url: "/rhinoplasty" },
   fsEyelidsPtosis:           { label: "Ptosis correction",      url: "/rhinoplasty" },

   fsFaceNeckFacelift:        { label: "Facelift",               url: "/rhinoplasty" },
   fsFaceNeckNecklift:        { label: "Neck lift",              url: "/rhinoplasty" },
   fsFaceNeckBrowLift:        { label: "Brow lift",              url: "/rhinoplasty" },

   // ── Aesthetic Medicine (тимчасові плейсхолдери) ───────────────────────────
   amBotoxForehead:           { label: "Forehead lines",         url: "/rhinoplasty" },
   amBotoxCrowsFeet:          { label: "Crow's feet",            url: "/rhinoplasty" },
   amBotoxGlabellar:          { label: "Glabellar lines",        url: "/rhinoplasty" },

   amHaLipFiller:             { label: "Lip filler",             url: "/rhinoplasty" },
   amHaCheekAugmentation:     { label: "Cheek augmentation",     url: "/rhinoplasty" },
   amHaNasolabial:            { label: "Nasolabial folds",       url: "/rhinoplasty" },

   amCollagenSculptra:        { label: "Sculptra",               url: "/rhinoplasty" },
   amCollagenRadiesse:        { label: "Radiesse",               url: "/rhinoplasty" },
   amCollagenProfhilo:        { label: "Profhilo",               url: "/rhinoplasty" },

   amRfMorpheus:              { label: "Morpheus8",              url: "/rhinoplasty" },
   amRfSecretRf:              { label: "Secret RF",              url: "/rhinoplasty" },
   amRfFractional:            { label: "Fractional RF",          url: "/rhinoplasty" },

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
