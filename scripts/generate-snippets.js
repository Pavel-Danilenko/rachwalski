/**
 * generate-snippets.js
 * Читає breakpoints з settings.scss і кольори з _palette.scss
 * і оновлює scss.code-snippets автоматично.
 * Запуск: npm run snippets
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── Парсимо settings.scss ────────────────────────────────────────────────────
const settings = readFileSync(resolve(root, "src/styles/settings.scss"), "utf8");

function parseVar(name) {
   const m = settings.match(new RegExp(`\\$${name}:\\s*([\\d.]+)`));
   return m ? parseFloat(m[1]) : null;
}

const mobile   = parseVar("mobile")               ?? 767.98;
const tablet   = parseVar("tablet")               ?? 991.98;
const maxWidth = parseVar("max-width")             ?? 1440;
const maxWCont = parseVar("max-width-container")   ?? 1280;
const contPad  = parseVar("container-padding")     ?? 30;
const pc       = maxWCont + contPad;

const BPS = {
   xs:  320,
   sm:  480,
   md:  Math.round(mobile),
   lg:  Math.round(tablet),
   xl:  pc,
   xxl: maxWidth,
};

// ── Парсимо _palette.scss ────────────────────────────────────────────────────
const palette = readFileSync(resolve(root, "src/styles/base/_palette.scss"), "utf8");

function parseMapKeys(src) {
   const keys = [];
   // Знаходимо всі мапи $xxx: ( ... )
   const mapRe = /\$\w+:\s*\(([^)]+)\)/g;
   let mapMatch;
   while ((mapMatch = mapRe.exec(src)) !== null) {
      const mapBody = mapMatch[1];
      // Витягуємо ключі "key":
      const keyRe = /"([^"]+)":/g;
      let keyMatch;
      while ((keyMatch = keyRe.exec(mapBody)) !== null) {
         const key = keyMatch[1];
         if (!keys.includes(key)) keys.push(key);
      }
   }
   return keys;
}

const paletteKeys = parseMapKeys(palette);
const colorVars = paletteKeys.map(k => `--color-${k}`);

// ── Генеруємо сніпет для кольорів ────────────────────────────────────────────
function buildColorSnippet(keys) {
   const choices = keys.join(",");
   return `   "color variable": {
      "prefix": "cv",
      "scope": "scss,css",
      "body": "var(--color-\${1|${choices}|})",
      "description": "CSS color variable — всі кольори з palette.scss"
   },`;
}

// ── Генеруємо сніпети для брейкпоінтів ───────────────────────────────────────
function buildBreakpointSnippets() {
   const entries = Object.entries(BPS);
   const toList   = entries.map(([k, v]) => `${k}≤${v}`).join(" · ");
   const fromList  = entries.map(([k, v]) => `${k}≥${v}`).join(" · ");

   const toItems = entries.map(([k, v]) => `
   "respond-to ${k.padEnd(3)} ≤${v}px": {
      "prefix": "rp",
      "body": "@include respond-to(\\"${k}\\") {\\n\\t$0\\n}",
      "description": "max-width ${v}px"
   },`).join("");

   const fromItems = entries.map(([k, v]) => `
   "respond-from ${k.padEnd(3)} ≥${v}px": {
      "prefix": "rpf",
      "body": "@include respond-from(\\"${k}\\") {\\n\\t$0\\n}",
      "description": "min-width ${v}px"
   },`).join("");

   return { toList, fromList, toItems, fromItems };
}

// ── Оновлюємо scss.code-snippets ─────────────────────────────────────────────
const snippetsPath = resolve(root, ".vscode/scss.code-snippets");
let content = readFileSync(snippetsPath, "utf8");

// 1. Кольори
content = content.replace(
   /("color variable"[\s\S]*?\},)/,
   buildColorSnippet(paletteKeys)
);

// 2. respond-to
const { toList, fromList, toItems, fromItems } = buildBreakpointSnippets();

content = content.replace(
   /("respond-to breakpoint"[\s\S]*?"description": "max-width[^"]+",\s*\n)([\s\S]*?)(\s*"respond-to custom")/,
   (_, head, _old, tail) => {
      const newHead = head.replace(/max-width[^"]+/, `max-width  ${toList}`);
      return `${newHead}${toItems}\n${tail}`;
   }
);

// 3. respond-from
content = content.replace(
   /("respond-from breakpoint"[\s\S]*?"description": "min-width[^"]+",\s*\n)([\s\S]*?)(\s*"respond-from custom")/,
   (_, head, _old, tail) => {
      const newHead = head.replace(/min-width[^"]+/, `min-width  ${fromList}`);
      return `${newHead}${fromItems}\n${tail}`;
   }
);

writeFileSync(snippetsPath, content, "utf8");

console.log("✅ scss.code-snippets оновлено");
console.log("   Breakpoints:", BPS);
console.log("   Colors:", colorVars.length, "змінних →", colorVars.slice(0, 4).join(", ") + "...");
