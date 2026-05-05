// module.exports = {
//   tabWidth: 3,
//   useTabs: false,
//   plugins: ["prettier-plugin-astro"],
// };
/** @type {import("prettier").Config} */
module.exports = {
   tabWidth: 3,
   useTabs: false,
   // Тепер Prettier знатиме і про Astro, і про PHP
   plugins: [
      "prettier-plugin-astro",
      "@prettier/plugin-php",
      "@shopify/prettier-plugin-liquid",
   ],

   overrides: [
      {
         files: "*.astro",
         options: {
            parser: "astro",
         },
      },
      {
         files: "*.php",
         options: {
            parser: "php",
         },
      },
      {
         files: "*.liquid", // ← додаємо
         options: { parser: "liquid-html" },
      },
   ],
};
