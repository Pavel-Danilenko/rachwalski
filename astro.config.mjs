import { defineConfig } from "astro/config";
import { ImageOptimize } from "@datarose/vite-plugin-media-optimize";
import dotenv from "dotenv";
import { shopifyIntegration } from "./src/integrations/shopify/index.ts";
import deleteUnusedImages from "astro-delete-unused-images";
import compress from "@playform/compress";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

dotenv.config();

const imageMode = process.env.PUBLIC_IMAGE_MODE || "plugin";
const isStatic = process.env.BUILD_MODE === "static";
const isWP = process.env.BUILD_MODE === "wp";
const isShopify = process.env.BUILD_MODE === "shopify";

const deleteUnused = process.env.PUBLIC_DELETE_UNUSED_IMAGES !== "true";

console.log(
   `${isWP ? "WP BUILD -" : isStatic ? "STATIC BUILD -" : isShopify ? "SHOPIFY BUILD -" : ""} IMAGE MODE:`,
   imageMode,
);

export default defineConfig({
   site: process.env.PUBLIC_SITE_URL || "https://example.com/",
   outDir: isShopify
      ? "./dist-shopify"
      : isStatic
        ? "./dist-static"
        : isWP
          ? "./dist-wp"
          : "./dist",

   output: isShopify || isStatic ? "static" : "server",
   ...(!isShopify &&
      !isStatic && {
         adapter: node({ mode: "standalone" }),
      }),

   build: {
      minify: !(isWP || isShopify),
   },

   vite: {
      plugins: [
         imageMode === "plugin" &&
            ImageOptimize({
               quality: 80,
               logStats: true,
               include: [/^img\//],
            }),
      ].filter(Boolean),

      css: {
         preprocessorOptions: {
            scss: {
               charset: false,
               includePaths: ["./src/styles"],
               additionalData: `@use "@styles/utils" as *;\n`,
            },
         },
      },

      resolve: {
         alias: {
            "@": "/src",
            "@components": "/src/components",
            "@layouts": "/src/layouts",
            "@scripts": "/src/scripts",
            "@styles": "/src/styles",
            "@assets": "/src/assets",
            "@data": "/src/data",
            "@config": "/src/config",
            "@i18n": "/src/i18n",
         },
      },

      ...((isWP || isShopify || isStatic) && {
         build: {
            minify: isWP || isStatic ? "esbuild" : false,
            assetsInlineLimit: 0,
            cssCodeSplit: true,
            rollupOptions: {
               output: {
                  entryFileNames: isShopify ? "[name].js" : "js/[name].js",
                  chunkFileNames: isShopify ? "[name].js" : "js/[name].js",
                  assetFileNames: (assetInfo) => {
                     if (isShopify) return "[name][extname]";
                     if (assetInfo.name?.endsWith(".css")) {
                        if (
                           assetInfo.name.match(/-\d+$/) ||
                           assetInfo.name.includes("-")
                        ) {
                           return "css/main[extname]";
                        }
                        return "css/[name][extname]";
                     }
                     if (
                        /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(
                           assetInfo.name || "",
                        )
                     ) {
                        return "_astro/[name][extname]";
                     }
                     return "assets/[name][extname]";
                  },
               },
               manualChunks: (id) => {
                  if (id.includes("astro")) return "astro-runtime";
                  if (id.includes("components")) return "components";
               },
            },
         },
      }),
   },

   integrations: [
      deleteUnused && !isShopify && !isStatic && deleteUnusedImages({}),

      compress({
         CSS: false,
         JavaScript: false,
         SVG: false,
         JSON: false,
         Image: false,
         HTML: isShopify
            ? false
            : isWP
              ? {
                   "html-minifier-terser": {
                      removeComments: true,
                      collapseWhitespace: false,
                      removeAttributeQuotes: false,
                      removeEmptyAttributes: true,
                      minifyCSS: false,
                      minifyJS: false,
                      preserveLineBreaks: true,
                      removeScriptTypeAttributes: true,
                      removeStyleLinkTypeAttributes: true,
                   },
                }
              : {
                   "html-minifier-terser": {
                      removeComments: true,
                      collapseWhitespace: true,
                      removeAttributeQuotes: true,
                      removeEmptyAttributes: true,
                      minifyCSS: false,
                      minifyJS: false,
                      preserveLineBreaks: false,
                      removeScriptTypeAttributes: true,
                      removeStyleLinkTypeAttributes: true,
                   },
                },
      }),

      !isShopify &&
         sitemap({
            changefreq: "weekly",
            priority: 0.7,
            filter: (page) => !page.includes("/secret/"),
         }),

      isShopify && shopifyIntegration(),
   ].filter(Boolean),

   server: {
      host: true,
      port: 4321,
      open: true,
   },
   preview: {
      host: true,
      port: 4321,
      open: true,
   },
});
