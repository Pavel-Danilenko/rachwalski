// src/config/fonts.ts
// ─────────────────────────────────────────────────────────────────────────────
// Налаштування шрифтів проєкту
//
// GOOGLE FONTS:
//   1. Вкажи шрифт у googleFonts[]
//   2. Скопіюй назву в settings.scss → $font-primary / $font-secondary
//   3. Готово — URL генерується автоматично
//
// МІСЦЕВІ ШРИФТИ (local):
//   1. Поклади файли в /public/fonts/
//   2. Вкажи у localFonts[]
//   3. CSS @font-face генерується в base/_fonts.scss
// ─────────────────────────────────────────────────────────────────────────────

export interface GoogleFont {
   family: string;
   weights?: number[];
   italic?: boolean;
   subsets?: ("latin" | "latin-ext" | "cyrillic" | "cyrillic-ext")[];
   display?: "swap" | "block" | "fallback" | "optional";
}

export interface LocalFont {
   family: string;
   src: string; // шлях з /public/fonts/ напр. "Inter/Inter-Regular.woff2"
   weight?: number | string;
   style?: "normal" | "italic";
   display?: "swap" | "block" | "fallback" | "optional";
}

// ─── Google Fonts ─────────────────────────────────────────────────────────────
// Залиш [] якщо не використовуєш Google Fonts
export const googleFonts: GoogleFont[] = [
   {
      family: "DM Sans",
      weights: [200, 300, 400, 500, 600, 700],
      subsets: ["latin", "cyrillic"],
      display: "swap",
   },
   // {
   //    family: "Playfair Display",
   //    weights: [400, 700],
   //    italic: true,
   //    subsets: ["latin"],
   //    display: "swap",
   // },
];

// ─── Local Fonts ──────────────────────────────────────────────────────────────
// Залиш [] якщо не використовуєш локальні шрифти
export const localFonts: LocalFont[] = [
   // {
   //    family: "MyFont",
   //    src: "MyFont/MyFont-Regular.woff2",
   //    weight: 400,
   //    style: "normal",
   //    display: "swap",
   // },
   // {
   //    family: "MyFont",
   //    src: "MyFont/MyFont-Bold.woff2",
   //    weight: 700,
   //    style: "normal",
   //    display: "swap",
   // },
];

// ─── Генератор URL для Google Fonts ──────────────────────────────────────────
export function buildGoogleFontsUrl(fonts: GoogleFont[]): string | null {
   if (!fonts.length) return null;

   const families = fonts.map((f) => {
      const name = f.family.replace(/ /g, "+");
      const axes: string[] = [];

      if (f.italic) axes.push("ital");
      axes.push("wght");

      const axisTag = axes.join(",");
      let values: string;

      if (f.italic && f.weights?.length) {
         // ital,wght → "0,400;0,700;1,400;1,700"
         const normal = f.weights.map((w) => `0,${w}`);
         const italics = f.weights.map((w) => `1,${w}`);
         values = [...normal, ...italics].join(";");
      } else if (f.weights?.length) {
         values = f.weights.join(";");
      } else {
         values = "400";
      }

      return `family=${name}:${axisTag}@${values}`;
   });

   const subsets = [...new Set(fonts.flatMap((f) => f.subsets ?? ["latin"]))];
   const display = fonts[0]?.display ?? "swap";

   return `https://fonts.googleapis.com/css2?${families.join("&")}&display=${display}&subset=${subsets.join(",")}`;
}
