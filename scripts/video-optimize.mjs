/**
 * video-optimize.mjs
 * Сканує src/assets/video/**\/*.mp4 (крім *.original.mp4) і для кожного:
 *   1. При першому запуску — перейменовує оригінал у name.original.mp4 (бекап).
 *   2. Генерує стиснені name.mp4 (h264) та name.webm (VP9 + Opus) з бекапу.
 *
 * У білд (через import у компонентах) потрапляють тільки стиснені
 * name.mp4 / name.webm — *.original.mp4 ніде не імпортується і в dist не йде.
 *
 * Запуск:
 *   npm run video:optimize
 *   npm run video:optimize -- --quality=90
 *   npm run video:optimize -- --quality=60 --audio-bitrate=64k --cpu-used=4
 *
 * --quality            0-100, як "quality" у зображеннях (дефолт 90).
 *                       Вище = краща якість і більший файл, нижче = сильніше стиснення.
 *                       VP9 CRF: 40 (quality=0) … 15 (quality=100).
 *                       h264 CRF: 35 (quality=0) … 16 (quality=100).
 * --audio-bitrate      бітрейт аудіо (Opus для webm, AAC для mp4), напр. "96k" (дефолт 96k).
 * --cpu-used           швидкість кодування, 0 (повільно/якісно) … 5 (швидко), дефолт 2.
 *                       Для h264 мапиться на preset: veryslow…veryfast.
 * --keyframe-interval  кількість кадрів між keyframe-ами (дефолт: не встановлено = ffmpeg дефолт ~250).
 *                       Менше = більше keyframe-ів = більший файл, але потрібно для playbackRate > 1 в Safari.
 *                       Рекомендовано 30 (1 сек при 30fps) для відео з playbackRate > 1.
 *                       Приклад: --keyframe-interval=30
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import ffmpegPath from "ffmpeg-static";

const root = process.cwd();
const videoDir = join(root, "src/assets/video");

// ── CLI-аргументи ────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name, fallback) {
   const prefix = `--${name}=`;
   const found = args.find((arg) => arg.startsWith(prefix));
   return found ? found.slice(prefix.length) : fallback;
}

const QUALITY = Math.min(100, Math.max(0, Number(getArg("quality", "90"))));
const AUDIO_BITRATE = getArg("audio-bitrate", "96k");
const CPU_USED = Math.min(5, Math.max(0, Number(getArg("cpu-used", "2"))));
const KEYFRAME_INTERVAL = getArg("keyframe-interval", null);

// quality 0 → найсильніше стиснення, quality 100 → найкраща якість
const VP9_CRF = Math.round(40 - (QUALITY / 100) * (40 - 15));
const H264_CRF = Math.round(35 - (QUALITY / 100) * (35 - 16));

const X264_PRESETS = ["veryslow", "slower", "slow", "medium", "fast", "veryfast"];
const X264_PRESET = X264_PRESETS[CPU_USED];

// ── Пошук вихідних файлів ───────────────────────────────────────────────
function findMp4Files(dir) {
   if (!existsSync(dir)) return [];

   const results = [];
   for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
         results.push(...findMp4Files(fullPath));
      } else if (
         extname(entry.name).toLowerCase() === ".mp4" &&
         !entry.name.toLowerCase().endsWith(".original.mp4")
      ) {
         results.push(fullPath);
      }
   }
   return results;
}

function needsConversion(srcPath, outPath) {
   if (!existsSync(outPath)) return true;
   return statSync(srcPath).mtimeMs > statSync(outPath).mtimeMs;
}

const mp4Files = findMp4Files(videoDir);

if (!mp4Files.length) {
   console.log("Немає .mp4 файлів у src/assets/video — нічого стискати.");
   process.exit(0);
}

for (const mp4Path of mp4Files) {
   const originalPath = mp4Path.replace(/\.mp4$/i, ".original.mp4");
   const webmPath = mp4Path.replace(/\.mp4$/i, ".webm");

   // Перший запуск — зберігаємо оригінал як бекап
   if (!existsSync(originalPath)) {
      renameSync(mp4Path, originalPath);
      console.log(`📦 ${relative(root, mp4Path)} → ${relative(root, originalPath)} (бекап оригіналу)`);
   }

   const label = relative(root, originalPath);
   const mp4Outdated = needsConversion(originalPath, mp4Path);
   const webmOutdated = needsConversion(originalPath, webmPath);

   if (!mp4Outdated && !webmOutdated) {
      console.log(`⏭  ${label} — mp4/webm вже актуальні`);
      continue;
   }

   const kiLabel = KEYFRAME_INTERVAL ? `, keyframe=${KEYFRAME_INTERVAL}` : "";

   if (mp4Outdated) {
      console.log(`🎬 ${label} → .mp4 (quality=${QUALITY}, crf=${H264_CRF}, preset=${X264_PRESET}, audio=${AUDIO_BITRATE}${kiLabel}) ...`);
      const start = Date.now();

      execFileSync(
         ffmpegPath,
         [
            "-y",
            "-i", originalPath,
            "-c:v", "libx264",
            "-crf", String(H264_CRF),
            "-preset", X264_PRESET,
            "-pix_fmt", "yuv420p",
            // keyframe-interval: частіші keyframe-и потрібні для playbackRate > 1 в Safari.
            // За замовчуванням ffmpeg ставить ~250 кадрів (~8с при 30fps) — при 2.2× Safari
            // "застрягає" між keyframe-ами. --keyframe-interval=30 = 1 keyframe/сек при 30fps.
            ...(KEYFRAME_INTERVAL ? ["-g", KEYFRAME_INTERVAL, "-keyint_min", KEYFRAME_INTERVAL] : []),
            "-movflags", "+faststart",
            "-c:a", "aac",
            "-b:a", AUDIO_BITRATE,
            mp4Path,
         ],
         { stdio: "inherit" },
      );

      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`✅ ${relative(root, mp4Path)} (${seconds}s)`);
   }

   if (webmOutdated) {
      console.log(`🎬 ${label} → .webm (quality=${QUALITY}, crf=${VP9_CRF}, audio=${AUDIO_BITRATE}${kiLabel}) ...`);
      const start = Date.now();

      execFileSync(
         ffmpegPath,
         [
            "-y",
            "-i", originalPath,
            "-c:v", "libvpx-vp9",
            "-crf", String(VP9_CRF),
            "-b:v", "0",
            "-deadline", "good",
            "-cpu-used", String(CPU_USED),
            "-row-mt", "1",
            ...(KEYFRAME_INTERVAL ? ["-g", KEYFRAME_INTERVAL] : []),
            "-c:a", "libopus",
            "-b:a", AUDIO_BITRATE,
            webmPath,
         ],
         { stdio: "inherit" },
      );

      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`✅ ${relative(root, webmPath)} (${seconds}s)`);
   }
}
