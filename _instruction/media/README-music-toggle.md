# MusicToggle — кнопка фонової музики

Гнучка кнопка вкл/викл фонової музики (напр. для `video-banner` на головній). Підтримує кілька аудіо-форматів, плейлист з випадковим треком, fade in/out та повне налаштування вигляду/позиції через CSS-змінні.

```
src/components/media/MusicToggle.astro
src/styles/components/media/_music-toggle.scss
src/scripts/init/music-toggle.js
src/icons/volume.svg
src/icons/volume-mute.svg
scripts/audio-optimize.mjs
```

---

## Стиснення аудіо (будь-який формат → mp3 + webm)

Клієнти часто присилають музику у важких форматах (wav, flac, aiff — десятки MB). Покладіть такий файл в `src/assets/audio/` і запустіть:

```bash
npm run audio:optimize
```

Скрипт рекурсивно сканує `src/assets/audio/**/*` (`.wav`, `.flac`, `.aiff`, `.aif`, `.m4a`, `.wma`, `.aac`) і для кожного файлу:

1. **При першому запуску** — перейменовує оригінал у `name.original.<ext>` (бекап, не видаляється, у git не комітиться — див. `.gitignore`).
2. Генерує стиснені `name.mp3` (LAME) та `name.webm` (Opus) з цього бекапу.

Імпортуєте в компонент `name.mp3` / `name.webm` — це вже стиснені файли, тому в білд потрапляють лише вони. `name.original.<ext>` ніде не імпортується і в `dist` не йде.

Повторний запуск нічого не ламає: якщо `name.mp3`/`.webm` вже новіші за `name.original.<ext>` — файл пропускається.

> Якщо потрібно перестиснути з новими налаштуваннями — видаліть `name.mp3`/`.webm` (або зробіть `touch` на `name.original.<ext>`). `name.original.<ext>` лишається джерелом для повторного стиснення.

### Налаштування якості

Як і `--quality` у `video:optimize` — 0-100, дефолт `90` (висока якість, "легка" музика для фону залишається невеликою за розміром навіть при високій якості завдяки Opus/LAME).

```bash
npm run audio:optimize                    # дефолт quality=90
npm run audio:optimize -- --quality=70    # сильніше стиснення, менший файл
```

| Формат | quality=0 | quality=90 (дефолт) | quality=100 |
|---|---|---|---|
| `.mp3` (LAME) | `-q:a 9` (~65kbps) | `-q:a 1` (~220-260kbps) | `-q:a 0` (~245kbps, max) |
| `.webm` (Opus) | `48k` | `178k` | `192k` |

```astro
---
import trackMp3 from "@assets/audio/banner-music.mp3";   // стиснений npm run audio:optimize
import trackWebm from "@assets/audio/banner-music.webm";  // стиснений npm run audio:optimize
---

<MusicToggle webm={trackWebm} src={trackMp3} class="video-banner__music" />
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `fmusic` | Базова кнопка з одним mp3-файлом |
| `fmusic:formats` | Один трек з webm/mp3 fallback |
| `fmusic:playlist` | Плейлист — випадковий трек при кожному заході |
| `fmusic:custom` | Кастомна позиція/розмір/громкість/fade через CSS-змінні |

---

## Підключення

```astro
---
import MusicToggle from "@components/media/MusicToggle.astro";
import trackMp3 from "@assets/audio/banner-music.mp3";
---

<section class="video-banner">
   ...
   <MusicToggle src={trackMp3} class="video-banner__music" />
</section>
```

> Аудіо ОБОВ'ЯЗКОВО імпортувати через `import` (як відео/зображення) — Vite скопіює файл у `dist` з хешем у імені. Можна й просто `/audio/...` шлях у `public/`.

**Якщо не передати ні `src`/`webm`, ні `tracks` — кнопка автоматично сховається** (керує JS, `wrapper.hidden = true`). Компонент можна лишати в розмітці заздалегідь — з'явиться сам, як тільки додасте аудіо-джерело.

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `src` | `string` | — | mp3-файл (fallback, найширша підтримка) |
| `webm` | `string` | — | webm-файл (опціонально, кращий стиск/якість) |
| `tracks` | `Track[]` | — | Плейлист: `{ src, webm? }[]`. Якщо передано — `src`/`webm` вище ігноруються, JS обирає випадковий трек при кожному заході |
| `volume` | `number` | `0.6` | Цільова громкість 0..1, до якої йде fade-in |
| `fade` | `number` | `800` | Тривалість fade in/out у мс. `0` — миттєво, без анімації |
| `class` | `string` | — | Додатковий клас на обгортку (для CSS-змінних) |

---

## Базове використання (один трек, mp3)

```astro
---
import MusicToggle from "@components/media/MusicToggle.astro";
import trackMp3 from "@assets/audio/banner-music.mp3";
---

<MusicToggle src={trackMp3} class="video-banner__music" />
```

---

## Декілька форматів (краще стиснення)

Порядок `<source>` всередині `<audio>`: **webm → mp3** (від кращого стиску/якості до найширшої підтримки браузерами). `webm` (Opus) дає менший файл при тій же якості, `mp3` — гарантований fallback для Safari/старих браузерів.

```astro
---
import trackMp3 from "@assets/audio/banner-music.mp3";
import trackWebm from "@assets/audio/banner-music.webm";
---

<MusicToggle
   webm={trackWebm}
   src={trackMp3}
   class="video-banner__music"
/>
```

---

## Плейлист — випадковий трек при кожному заході

```astro
---
import track1Mp3 from "@assets/audio/track-1.mp3";
import track1Webm from "@assets/audio/track-1.webm";
import track2Mp3 from "@assets/audio/track-2.mp3";
import track2Webm from "@assets/audio/track-2.webm";
import track3Mp3 from "@assets/audio/track-3.mp3";
---

<MusicToggle
   tracks={[
      { src: track1Mp3, webm: track1Webm },
      { src: track2Mp3, webm: track2Webm },
      { src: track3Mp3 },
   ]}
   class="video-banner__music"
/>
```

JS обирає випадковий трек при ініціалізації, а потім **автоматично перемикається на наступний випадковий трек** (відмінний від попереднього), коли поточний дограє до кінця — справжній плейлист, а не повтор одного треку по колу.

---

## Громкість та fade in/out

```astro
<!-- Тихіше і повільніший плавний вхід/вихід звуку -->
<MusicToggle src={trackMp3} volume={0.35} fade={1500} class="video-banner__music" />

<!-- Без fade — миттєво вкл/викл -->
<MusicToggle src={trackMp3} fade={0} class="video-banner__music" />
```

- При вкл: `audio.volume` стартує з `0` і плавно йде до `volume` за `fade` мс.
- При викл: `audio.volume` плавно йде до `0`, і тільки після цього `audio.pause()`.

---

## Стилізація — без хардкоду, через CSS-змінні

Базові стилі лежать в `_music-toggle.scss`, повторювати їх не потрібно. Всі розміри/кольори/позиція — CSS-змінні з фолбеками, перевизначай на класі обгортки:

```scss
.video-banner__music {
   --music-toggle-right: 1rem; // позиція справа (мобільні)
   --music-toggle-bottom: 1rem; // позиція знизу (мобільні)
   --music-toggle-right-md: 2.5rem; // позиція справа від breakpoint "md"
   --music-toggle-bottom-md: 2.5rem; // позиція знизу від breakpoint "md"
   --music-toggle-size: 3rem; // діаметр кнопки (дефолт 2.75rem)
   --music-toggle-icon-size: 1.25rem; // розмір іконки (дефолт 1.125rem)
   --music-toggle-bg: rgba(0, 0, 0, 0.3);
   --music-toggle-bg-hover: rgba(0, 0, 0, 0.5);
   --music-toggle-border: rgba(255, 255, 255, 0.2);
   --music-toggle-color: var(--color-white);
   --music-toggle-z: 30;
}
```

Якщо потрібна позиція зліва/зверху — перевизнач `right`/`bottom` на `auto` і додай `left`/`top` звичайним CSS на тому ж класі.

---

## Структура HTML

```html
<div class="music-toggle is-playing" data-music-toggle data-volume="0.6" data-fade="800">
   <audio loop preload="none" data-music-toggle-audio>
      <source src="/audio/banner-music.webm" type="audio/webm" />
      <source src="/audio/banner-music.mp3" type="audio/mpeg" />
   </audio>
   <button type="button" class="music-toggle__btn" data-music-toggle-btn aria-label="Toggle background music" aria-pressed="true">
      <svg class="music-toggle__icon music-toggle__icon--on">...</svg>
      <svg class="music-toggle__icon music-toggle__icon--off">...</svg>
   </button>
</div>
```

- `.is-playing` — додається/знімається JS після успішного `play()`/`pause()`, перемикає іконки `--on`/`--off`.
- `[hidden]` — компонент сам ховається, якщо немає аудіо-джерела (ні пропсів, ні `tracks`).

---

## Поведінка та обмеження

- **Autoplay зі звуком блокується браузерами** — музика стартує лише після кліку по кнозі.
- **Вибір користувача запам'ятовується** в `localStorage` (`music-enabled`). При SPA-переході назад на сторінку з компонентом музика автоматично відновлюється (в межах того ж сеансу — браузер вже вважає, що користувач взаємодіяв зі сторінкою).
- **На `page:leave`** (SPA-перехід на іншу сторінку) музика ставиться на паузу автоматично.
- **При перемиканні вкладки браузера** (Page Visibility API) музика автоматично ставиться на паузу і відновлюється при поверненні — без зміни збереженого вибору користувача в `localStorage`.
- **Плейлист (`tracks`)** автоматично переходить на наступний випадковий трек, коли поточний дограє до кінця (без повторів того ж треку підряд, якщо в плейлисті більше одного).
- Кнопка (`is-playing` / `aria-pressed`) синхронізується з реальними `play`/`pause` подіями `<audio>` — стан коректний навіть при авто-переходах треків чи паузі по вкладці.
- Компонент незалежний від `<Video>` / `video-banner__hotspots` — не синхронізується з відтворенням відео, просто грає у фоні (по колу для одного треку, по плейлисту — для `tracks`).

---

## Barba.js

`music-toggle.js` ініціалізується на `page:ready` (як і `video.js`), з guard'ом `data-music-toggle-init` на обгортці — конфліктів з Barba немає, окремого запису в `cleanupPage()` не потрібно.

- Компонент рендериться всередині `[data-barba="container"]`, тому при переході на іншу сторінку елемент видаляється Barba разом з контейнером — `<audio>` зупиняється і звільняється автоматично.
- При поверненні на сторінку з компонентом створюється новий `<audio>` без `data-music-toggle-init` — `initMusicToggle()` ініціалізує його з нуля. Якщо `localStorage["music-enabled"] === "true"` — музика стартує автоматично (sticky activation від кліку по Barba-лінку дозволяє `play()` без додаткового кліку).
- `page:leave` зупиняє `<audio>` (з cancel поточного fade) ще до видалення контейнера — без "залишкового" звуку під час переходу.
