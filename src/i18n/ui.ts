// src/i18n/ui.ts

export const languages = {
   uk: "Українська",
   en: "English",
};

export const defaultLang = "uk";

export const ui = {
   uk: {
      "menu.home": "Головна 1",
      "menu.about": "Про нас",
      "menu.services": "Послуги",
      "menu.services.web": "Веб-розробка",
      "menu.services.design": "Дизайн",
      "menu.services.design.ui": "UI/UX",
      "menu.services.design.branding": "Брендинг",
      "menu.services.mobile": "Мобільні додатки",
      "menu.contact": "Контакти",
   },
   en: {
      "menu.home": "Home",
      "menu.about": "About",
      "menu.services": "Services",
      "menu.services.web": "Web Development",
      "menu.services.design": "Design",
      "menu.services.design.ui": "UI/UX",
      "menu.services.design.branding": "Branding",
      "menu.services.mobile": "Mobile Apps",
      "menu.contact": "Contact",
   },
} as const;
