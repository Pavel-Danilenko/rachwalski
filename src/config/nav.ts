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
   faUpperForeheadAnalysis:   { label: "Forehead analysis",      url: "/forehead-analysis" },
   faUpperBrowAssessment:     { label: "Brow assessment",        url: "/brow-assessment" },
   faUpperEyelidEvaluation:   { label: "Eyelid evaluation",      url: "/eyelid-evaluation" },

   faMidCheekAssessment:      { label: "Cheek assessment",       url: "/cheek-assessment" },
   faMidNasalEvaluation:      { label: "Nasal evaluation",       url: "/nasal-evaluation" },

   faLowerJawline:            { label: "Jawline assessment",     url: "/jawline-assessment" },
   faLowerChin:               { label: "Chin evaluation",        url: "/chin-evaluation" },
   faLowerLip:                { label: "Lip analysis",           url: "/lip-analysis" },
   faLowerNeck:               { label: "Neck assessment",        url: "/neck-assessment" },

   faOtherEar:                { label: "Ear assessment",         url: "/ear-assessment" },
   faOtherSkin:               { label: "Skin quality",           url: "/skin-quality" },
   faOtherHarmony:            { label: "Overall harmony",        url: "/overall-harmony" },
   faOtherSymmetry:           { label: "Facial symmetry",        url: "/facial-symmetry" },

   // ── Facial Surgery (тимчасові плейсхолдери) ──────────────────────────────
   fsNoseRhinoplasty:         { label: "Rhinoplasty",            url: "/rhinoplasty" },
   fsNoseSeptoplasty:         { label: "Septoplasty",            url: "/septoplasty" },
   fsNoseTipRefinement:       { label: "Tip refinement",         url: "/tip-refinement" },

   fsEarsOtoplasty:           { label: "Otoplasty",              url: "/otoplasty" },
   fsEarsEarlobeRepair:       { label: "Earlobe repair",         url: "/earlobe-repair" },

   fsEyelidsUpper:            { label: "Upper blepharoplasty",   url: "/upper-blepharoplasty" },
   fsEyelidsLower:            { label: "Lower blepharoplasty",   url: "/lower-blepharoplasty" },
   fsEyelidsPtosis:           { label: "Ptosis correction",      url: "/ptosis-correction" },

   fsFaceNeckFacelift:        { label: "Facelift",               url: "/facelift" },
   fsFaceNeckNecklift:        { label: "Neck lift",              url: "/neck-lift" },
   fsFaceNeckBrowLift:        { label: "Brow lift",              url: "/brow-lift" },

   // ── Aesthetic Medicine (тимчасові плейсхолдери) ───────────────────────────
   amBotoxForehead:           { label: "Forehead lines",         url: "/forehead-lines" },
   amBotoxCrowsFeet:          { label: "Crow's feet",            url: "/crows-feet" },
   amBotoxGlabellar:          { label: "Glabellar lines",        url: "/glabellar-lines" },

   amHaLipFiller:             { label: "Lip filler",             url: "/lip-filler" },
   amHaCheekAugmentation:     { label: "Cheek augmentation",     url: "/cheek-augmentation" },
   amHaNasolabial:            { label: "Nasolabial folds",       url: "/nasolabial-folds" },

   amCollagenSculptra:        { label: "Sculptra",               url: "/sculptra" },
   amCollagenRadiesse:        { label: "Radiesse",               url: "/radiesse" },
   amCollagenProfhilo:        { label: "Profhilo",               url: "/profhilo" },

   amRfMorpheus:              { label: "Morpheus8",              url: "/morpheus8" },
   amRfSecretRf:              { label: "Secret RF",              url: "/secret-rf" },
   amRfFractional:            { label: "Fractional RF",          url: "/fractional-rf" },

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
