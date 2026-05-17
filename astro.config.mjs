import { defineConfig } from "astro/config";
import { ImageOptimize } from "@datarose/vite-plugin-media-optimize";
import dotenv from "dotenv";
import deleteUnusedImages from "astro-delete-unused-images";
import compress from "@playform/compress";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

dotenv.config();

const imageMode = process.env.PUBLIC_IMAGE_MODE || "plugin";
const isStatic = process.env.BUILD_MODE === "static";
const isWP = process.env.BUILD_MODE === "wp";
const isDev = process.env.NODE_ENV === "development";

const deleteUnused = process.env.PUBLIC_DELETE_UNUSED_IMAGES !== "true";

console.log(
   `${isWP ? "WP BUILD -" : isStatic ? "STATIC BUILD -" : ""} IMAGE MODE:`,
   imageMode,
);

export default defineConfig({
   site: process.env.PUBLIC_SITE_URL || "https://example.com/",
   outDir: isStatic ? "./dist-static" : isWP ? "./dist-wp" : "./dist",

   output: isStatic ? "static" : "server",
   ...(!isStatic && {
      adapter: node({ mode: "standalone" }),
   }),

   build: {
      minify: !isWP,
   },

   vite: {
      plugins: [
         !isDev && imageMode === "plugin" &&
            ImageOptimize({
               quality: 80,
               logStats: true,
               include: [/^img\//],
            }),
      ].filter(Boolean),

      build: {
         // Barba.js replaces only data-barba container, not <head> link tags.
         // Without this, page-specific CSS chunks are never loaded after navigation.
         // Barba.js doesn't update <head> CSS links on navigation —
         // all styles must be in one bundle for transitions to work correctly.
         cssCodeSplit: isWP || isStatic ? false : true,
      },

      css: {
         preprocessorOptions: {
            scss: {
               charset: false,
               includePaths: ["./src/styles"],
               // Автоматично додає @use utils тільки якщо файл його ще не має.
               // Захищає нові файли та inline <style lang="scss"> блоки.
               additionalData: (source) =>
                  source.includes('@use "@styles/utils"')
                     ? source
                     : `@use "@styles/utils" as *;\n${source}`,
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

      ...(isWP && {
         build: {
            minify: isWP || isStatic ? "esbuild" : false,
            assetsInlineLimit: 0,
            cssCodeSplit: true,
            rollupOptions: {
               output: {
                  entryFileNames: "js/[name].js",
                  chunkFileNames: "js/[name].js",
                  assetFileNames: (assetInfo) => {
                     const name = assetInfo.names?.[0] ?? "";
                     if (name.endsWith(".css")) return "css/[name][extname]";
                     if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(name)) return "_astro/[name][extname]";
                     return "assets/[name][extname]";
                  },
               },
            },
         },
      }),
   },

   integrations: [
      !isDev && deleteUnused && !isStatic && deleteUnusedImages({}),
      !isDev && compress({
         CSS: false,
         JavaScript: false,
         SVG: false,
         JSON: false,
         Image: false,
         HTML: isWP
            ? {
                 "html-minifier-terser": {
                    removeComments: true,
                    collapseWhitespace: false,
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
      sitemap({
         changefreq: "weekly",
         priority: 0.7,
         filter: (page) => !page.includes("/secret/"),
      }),
   ].filter(Boolean),

   server: {
      host: true,
      port: 4321,
      open: true,
   },
   preview: {
      host: true,
      port: 4321,
   },
});
