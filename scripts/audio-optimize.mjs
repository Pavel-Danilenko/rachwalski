/**
 * audio-optimize.mjs
 * Сканує src/assets/audio/**\/* (будь-який вхідний формат — wav, flac, aiff, m4a, wma, aac)
 * і для кожного файлу:
 *   1. При першому запуску — перейменовує оригінал у name.original.<ext> (бекап).
 *   2. Генерує стиснені name.mp3 (LAME) та name.webm (Opus) з бекапу.
 *
 * У білд (через import у MusicToggle тощо) потрапляють тільки стиснені
 * name.mp3 / name.webm — *.original.<ext> ніде не імпортується і в dist не йде.
 *
 * Запуск:
 *   npm run audio:optimize
 *   npm run audio:optimize -- --quality=90
 *   npm run audio:optimize -- --quality=70
 *
 * --quality  0-100, як "quality" у зображеннях/відео (дефолт 90).
 *            Вище = краща якість і більший файл, нижче = сильніше стиснення.
 *            MP3  (LAME -q):   9 (quality=0, ~65kbps) … 0 (quality=100, ~245kbps)
 *            WEBM (Opus -b:a): 48k (quality=0) … 192k (quality=100)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import ffmpegPath from "ffmpeg-static";

const root = process.cwd();
const audioDir = join(root, "src/assets/audio");

// ── CLI-аргументи ────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name, fallback) {
   const prefix = `--${name}=`;
   const found = args.find((arg) => arg.startsWith(prefix));
   return found ? found.slice(prefix.length) : fallback;
}

const QUALITY = Math.min(100, Math.max(0, Number(getArg("quality", "90"))));

// quality 0 → найсильніше стиснення, quality 100 → найкраща якість
const MP3_Q = Math.round(9 - (QUALITY / 100) * 9); // 9 (гірше) … 0 (краще)
const OPUS_BITRATE = `${Math.round(48 + (QUALITY / 100) * (192 - 48))}k`; // 48k … 192k

// Вхідні "сирі" формати — будь-що, що не є вже одним з наших цільових форматів
const SOURCE_EXTENSIONS = [".wav", ".flac", ".aiff", ".aif", ".m4a", ".wma", ".aac"];

// ── Пошук вихідних файлів ───────────────────────────────────────────────
// Повертає файли-джерела: або вже існуючі name.original.<ext> (бекапи з
// попередніх запусків), або "сирі" name.<ext> (ще не оброблені).
function findSourceFiles(dir) {
   if (!existsSync(dir)) return [];

   const results = [];
   for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
         results.push(...findSourceFiles(fullPath));
      } else if (/\.original\.[^.]+$/i.test(entry.name)) {
         results.push(fullPath);
      } else if (SOURCE_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
         results.push(fullPath);
      }
   }
   return results;
}

function needsConversion(srcPath, outPath) {
   if (!existsSync(outPath)) return true;
   return statSync(srcPath).mtimeMs > statSync(outPath).mtimeMs;
}

const sourceFiles = findSourceFiles(audioDir);

if (!sourceFiles.length) {
   console.log("Немає вхідних аудіо-файлів (wav/flac/aiff/m4a/wma/aac) у src/assets/audio — нічого стискати.");
   process.exit(0);
}

const targets = [
   {
      ext: ".mp3",
      label: `mp3 (LAME, q=${MP3_Q})`,
      args: ["-c:a", "libmp3lame", "-q:a", String(MP3_Q), "-ar", "44100"],
   },
   {
      ext: ".webm",
      label: `webm (Opus, b=${OPUS_BITRATE})`,
      args: ["-c:a", "libopus", "-b:a", OPUS_BITRATE],
   },
];

for (const sourcePath of sourceFiles) {
   const originalMatch = sourcePath.match(/^(.*)\.original(\.[^./]+)$/i);

   let originalPath, ext;
   if (originalMatch) {
      // Вже бекап з попереднього запуску — використовуємо як джерело напряму
      [, , ext] = originalMatch;
      originalPath = sourcePath;
   } else {
      // "Сирий" файл — перейменовуємо в бекап (перезаписує старий бекап, якщо є)
      ext = extname(sourcePath);
      originalPath = sourcePath.replace(new RegExp(`${ext}$`, "i"), `.original${ext}`);
      renameSync(sourcePath, originalPath);
      console.log(`📦 ${relative(root, sourcePath)} → ${relative(root, originalPath)} (бекап оригіналу)`);
   }

   const label = relative(root, originalPath);
   const base = originalPath.replace(new RegExp(`\\.original${ext.replace(".", "\\.")}$`, "i"), "");

   for (const target of targets) {
      const outPath = `${base}${target.ext}`;
      if (!needsConversion(originalPath, outPath)) {
         console.log(`⏭  ${relative(root, outPath)} — вже актуальний`);
         continue;
      }

      console.log(`🎵 ${label} → ${target.label} ...`);
      const start = Date.now();

      execFileSync(
         ffmpegPath,
         ["-y", "-i", originalPath, ...target.args, outPath],
         { stdio: "inherit" },
      );

      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`✅ ${relative(root, outPath)} (${seconds}s)`);
   }
}
