# Video — гнучкий відео-компонент

Компонент для `<video>` з підтримкою webm/mp4, адаптивних mobile/desktop джерел, lazy-завантаження, poster-зображення (через `Img`) та кнопки play зі спрайту іконок.

```
src/components/media/Video.astro
src/styles/components/media/_video.scss
src/scripts/init/video.js
src/icons/play.svg
scripts/video-optimize.mjs
```

---

## Стиснення відео (.mp4 + .webm)

Просто покладіть оригінальний `.mp4` (з камери, монтажки тощо) в `src/assets/video/` і запустіть:

```bash
npm run video:optimize
```

Скрипт рекурсивно сканує `src/assets/video/**/*.mp4` (крім `*.original.mp4`) і для кожного файлу:

1. **При першому запуску** — перейменовує оригінал у `name.original.mp4` (бекап, не видаляється, у git не комітиться — див. `.gitignore`).
2. Генерує стиснений `name.mp4` (h264 + AAC) та `name.webm` (VP9 + Opus) з цього бекапу.

Імпортуєте в компонент звичні `name.mp4` / `name.webm` — це вже стиснені файли, тому в білд потрапляють лише вони. `name.original.mp4` ніде не імпортується і в `dist` не йде.

Повторний запуск нічого не ламає: якщо `name.mp4`/`name.webm` вже новіші за `name.original.mp4` — файл пропускається.

> Якщо потрібно перестиснути з новими налаштуваннями — видаліть `name.mp4`/`name.webm` (або просто скиньте `--quality` і запустіть знову; скрипт перегенерує застарілі файли). `name.original.mp4` лишається джерелом для повторного стиснення.

### Налаштування стиснення

Як і `quality` у зображеннях — параметр `--quality` (0-100, дефолт `90`). Вище = краща якість і більший файл, нижче = сильніше стиснення.

```bash
npm run video:optimize                                    # дефолт quality=90
npm run video:optimize -- --quality=70                    # сильніше стиснення, менший файл
npm run video:optimize -- --quality=60 --audio-bitrate=64k --cpu-used=4
npm run video:optimize -- --max-width=1920                # cap роздільності (напр. 4K → 1080p)
```

| Флаг | Дефолт | Опис |
|---|---|---|
| `--quality` | `90` | 0-100 → VP9 CRF 40…15, h264 CRF 35…16 (0 = сильне стиснення, 100 = найкраща якість) |
| `--audio-bitrate` | `96k` | Бітрейт аудіо (Opus для webm, AAC для mp4) |
| `--cpu-used` | `2` | Швидкість кодування: 0 (повільно/якісно) … 5 (швидко). Для h264 мапиться на preset `veryslow`…`veryfast` |
| `--keyframe-interval` | — | Кількість кадрів між keyframe-ами. **Потрібно для `playbackRate > 1` в Safari.** Рекомендовано `30` (1 keyframe/сек при 30fps). Без цього Safari зависає між keyframe-ами при прискоренні |
| `--max-width` | — (нативна роздільність) | Максимальна ширина у px. Джерело ширше за це значення — масштабується вниз (висота пропорційно). Джерело вужче/дорівнює — **не чіпається** (апскейлу ніколи не буде). Один прапорець безпечно покриває і desktop (4K→cap), і mobile (portrait 1080px лишається як є, бо він вже вужчий за типовий cap) |

> **Чому `--max-width` варто ставити майже завжди для hero/фонових відео:** переважна більшість екранів рендерить браузер у CSS-пікселях ≤1920px, навіть на 4K-моніторах (OS-scaling). Для автоплей-відео на фоні секції (не відео, яке розглядають на fullscreen) 1080p виглядає візуально ідентично 4K, але важить у 4+ рази менше. Знімати відразу в 4K зручно для монтажу/майбутнього перевикористання — а `--max-width=1920` при стисканні відсікає зайву вагу без втрати видимої якості.

```astro
---
import demoMp4 from "@assets/video/demo.mp4";   // стиснений npm run video:optimize
import demoWebm from "@assets/video/demo.webm"; // стиснений npm run video:optimize
---

<Video src={demoMp4} webm={demoWebm} width={1920} height={1080} />
```

---

## Сніпети

| Prefix | Опис |
|---|---|
| `fvideo` | Звичайне відео з кнопкою play (autoplay вимкнено) |
| `fvideo:banner` | Банерне відео (autoplay, loop, muted, webm+mp4, мобільні джерела, poster) |

---

## Підключення

```astro
---
import Video from "@components/media/Video.astro";
import demoMp4 from "@assets/video/demo.mp4";
import demoWebm from "@assets/video/demo.webm";
---
```

> Відео ОБОВ'ЯЗКОВО імпортувати через `import` — Vite скопіює файл у `dist` з хешем у імені.

---

## Базове використання

```astro
<Video src={demoMp4} webm={demoWebm} width={1920} height={1080} />
```

---

## Всі пропси

| Проп | Тип | Дефолт | Опис |
|---|---|---|---|
| `src` | `string` | — | **Обов'язковий.** Desktop fallback (mp4) |
| `webm` | `string` | — | Desktop webm — буде першим у списку `<source>` (пріоритетний формат) |
| `srcMobile` | `string` | — | Mobile fallback (mp4) |
| `webmMobile` | `string` | — | Mobile webm |
| `mobileBreakpoint` | `number` | `767` | Межа mobile/desktop у px (для `srcMobile`/`webmMobile`) |
| `poster` | `ImageMetadata` | — | Poster-зображення, рендериться через `Picture` (`astro:assets`) |
| `posterAlt` | `string` | `""` | Alt для poster |
| `width` | `number` | — | Ширина — разом з `height` задає `aspect-ratio` |
| `height` | `number` | — | Висота |
| `autoplay` | `boolean` | `true` | Автозапуск (вимикається при `prefers-reduced-motion: reduce`) |
| `loop` | `boolean` | `true` | Циклічне відтворення |
| `muted` | `boolean` | `true` | Без звуку |
| `playsinline` | `boolean` | `true` | Inline-відтворення на iOS |
| `controls` | `boolean` | `false` | Нативні controls браузера |
| `preload` | `"none"` \| `"metadata"` \| `"auto"` | `"metadata"` | Ігнорується якщо `lazy` |
| `objectFit` | `"cover"` \| `"contain"` \| `"fill"` \| `"none"` | `"cover"` | CSS `object-fit` для відео і poster |
| `lazy` | `boolean` | `true` | Підвантажувати джерела тільки біля viewport (IntersectionObserver) |
| `pauseOffscreen` | `boolean` | `true` | Ставити відео на паузу, коли воно виходить за межі екрана, і продовжувати при поверненні (економія CPU/батареї) |
| `respectDataSaver` | `boolean` | `true` | Не запускати autoplay, якщо у користувача увімкнено Data Saver або повільне з'єднання (`2g`/`slow-2g`) |
| `playbackRate` | `number` | `1` | Швидкість відтворення. `0.5` — вдвічі повільніше (slow-motion), `2` — вдвічі швидше. Зручно для атмосферних фонових відео |
| `showPlayButton` | `boolean` | `!controls` | Кнопка play по центру |
| `playIcon` | `string` | `"play"` | Назва іконки зі спрайту (`src/icons/*.svg`) |
| `class` | `string` | `""` | Клас на `<video>` |
| `wrapperClass` | `string` | `""` | Клас на обгортці `<div>` |

> Будь-які інші атрибути (`...restProps`) передаються прямо на `<video>`.

---

## Приклади

### Банерне відео (декоративне, autoplay)
```astro
<Video
   src={heroMp4}
   webm={heroWebm}
   srcMobile={heroMobileMp4}
   webmMobile={heroMobileWebm}
   poster={heroPoster}
   width={1920}
   height={1080}
   wrapperClass="hero__video"
/>
```

Autoplay + loop + muted + playsinline увімкнені за замовчуванням, кнопка play та controls — не показуються. На `prefers-reduced-motion: reduce` автозапуск не спрацює, відео покаже poster.

### Звичайне відео з кнопкою play
```astro
<Video
   src={demoMp4}
   webm={demoWebm}
   poster={demoPoster}
   autoplay={false}
   loop={false}
   muted={false}
   width={1920}
   height={1080}
/>
```

`controls={false}` (дефолт) → `showPlayButton` автоматично `true`. Клік по кнозі запускає відео.

### Із нативними controls (без кнопки play)
```astro
<Video src={demoMp4} controls autoplay={false} loop={false} muted={false} lazy={false} />
```

### Автозапуск один раз, без повтору
```astro
<Video src={demoMp4} webm={demoWebm} loop={false} width={1920} height={1080} />
```

`autoplay` (дефолт `true`) і `loop` — незалежні пропси. Відео запуститься автоматично і зупиниться на останньому кадрі після завершення. Кнопка play з'явиться знову (через подію `ended`) — клік перезапустить відео з початку.

### Вимкнути offscreen-паузу або Data Saver
```astro
<!-- Відео грає завжди, навіть поза екраном і на повільному з'єднанні -->
<Video src={demoMp4} pauseOffscreen={false} respectDataSaver={false} width={1920} height={1080} />
```

За дефолтом обидва увімкнені:
- `pauseOffscreen` — будь-яке відео (autoplay чи запущене вручну) ставиться на паузу при виході з viewport і продовжує при поверненні.
- `respectDataSaver` — autoplay-відео не запуститься автоматично, якщо у користувача `navigator.connection.saveData` або `effectiveType` дорівнює `2g`/`slow-2g`; натомість покажеться poster + кнопка play для ручного запуску.

### Кастомна іконка play зі спрайту
```astro
<!-- src/icons/my-play.svg буде доступний автоматично через IconSprite -->
<Video src={demoMp4} autoplay={false} loop={false} muted={false} playIcon="my-play" />
```

### Зміна швидкості відтворення
```astro
<!-- Slow-motion: вдвічі повільніше — атмосферний ефект для фонових відео -->
<Video src={bgMp4} webm={bgWebm} lazy={false} playbackRate={0.5} />

<!-- Прискорене: вдвічі швидше -->
<Video src={bgMp4} playbackRate={2} />
```

Значення `playbackRate`:
- `< 1` — сповільнене (0.5 = 50% швидкості, `0.25` = 25%)
- `1` — нормальна швидкість (дефолт)
- `> 1` — прискорене (1.5 = 150%, `2` = 200%)

> **Обмеження `playbackRate` по браузерах:**
> - **Safari** — зависає при `> 2` (WebKit decoder bug). JS автоматично обмежує до `2`, вказати можна будь-яке.
> - **Chrome / Firefox** — зависає приблизно при `> 15`.
>
> Для `playbackRate > 1` відео **обов'язково** треба перекодувати з частими keyframe-ами, інакше
> Safari застрягає між ними при прискореному відтворенні:
> ```bash
> # Видали перекодовані файли (оригінал .original.mp4 залишається)
> rm src/assets/video/назва.mp4
> rm src/assets/video/назва.webm
>
> # Перекодуй з keyframe кожну секунду (30 кадрів при 30fps)
> npm run video:optimize -- --keyframe-interval=30
> ```
> Без цього при `playbackRate > 1` Safari може показувати чорний екран або frozen кадр.

---

## Aspect ratio

Якщо передати `width` і `height` — обгортка отримає `aspect-ratio` через CSS-змінну (запобігає layout shift).

```astro
<!-- aspect-ratio: 16/9 буде встановлено автоматично -->
<Video src={demoMp4} width={1280} height={720} />
```

---

## Структура HTML

```html
<div class="video-wrapper is-playing" style="--aspect-ratio: 16/9">
   <div class="video-wrapper__poster">
      <picture>...</picture>
   </div>
   <video class="video-wrapper__video" data-video data-lazy="true" ...>
      <source type="video/webm" src="...">
      <source type="video/mp4" src="...">
   </video>
   <button type="button" class="video-wrapper__play" data-video-play aria-label="Play video">
      <span class="icon">...</span>
   </button>
</div>
```

- `.is-playing` додається після першого старту відтворення — ховає poster.
- `.video-wrapper__play.is-hidden` — коли відео не на паузі (керується JS).

---

## Стилізація

Базові стилі лежать в `_video.scss`, повторювати їх не потрібно. Розмір і кольори кнопки play — **без хардкоду**, через CSS-змінні з фолбеками. Перевизначай їх на своєму класі (`wrapperClass`):

```scss
.hero__video {
   .video-wrapper__play {
      --video-play-size: 5rem;       // розмір кнопки (дефолт 4rem)
      --video-play-icon-size: 2rem;  // розмір іконки (дефолт 1.5rem, font-size для .icon = 1em)
      --video-play-bg: rgba(0, 0, 0, 0.3);
      --video-play-bg-hover: rgba(0, 0, 0, 0.5);
      --video-play-color: var(--color-white);
   }
}
```

Розмір/позиція обгортки — звичайний CSS:

```scss
.hero__video {
   width: 100%;
   height: 100vh;
}
```
