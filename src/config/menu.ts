// src/config/menu.ts
import type { ui, defaultLang } from "@i18n/ui";

export interface MenuItem {
   key: keyof (typeof ui)[typeof defaultLang]; // ← строгий тип з автодоповненням!
   href: string;
   submenu?: MenuItem[];
   target?: "_blank" | "_self";
   icon?: string;
   disabled?: boolean;
}

export const menu: MenuItem[] = [
   {
      key: "menu.home",
      href: "/",
   },
   {
      key: "menu.about",
      href: "/about",
   },
   {
      key: "menu.services",
      href: "/services",
      submenu: [
         {
            key: "menu.services.web",
            href: "/services/web",
         },
         {
            key: "menu.services.design",
            href: "/services/design",
            submenu: [
               {
                  key: "menu.services.design.ui",
                  href: "/services/design/ui",
               },
               {
                  key: "menu.services.design.branding",
                  href: "/services/design/branding",
               },
            ],
         },
         {
            key: "menu.services.mobile",
            href: "/services/mobile",
         },
      ],
   },
   {
      key: "menu.contact",
      href: "/contact",
   },
];
