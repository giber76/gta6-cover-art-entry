[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/giber76/gta6-cover-art-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/giber76/gta6-cover-art-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Sunset Cover Studio

Turn your photo and a caption into GTA-style multi-panel cover art — offline,
in your browser. Made for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

## What it does

- **Any photo:** load your own photos from your machine (or drag and drop them),
  crop and position each one by dragging and scrolling, and fill several panels
  with one photo or several.
- **Multi-panel covers:** seven layouts — Poster (tall hero + two
  stacked, the tidy default), Hero Left (big hero + three stacked + title
  band), Title Band (five photos above a full-width title band), Nine Up
  (3×3 with a title panel in the middle), Four Up (2×2), Hero Strip (wide
  hero + two below), Split (two tall panels). Layouts with a title band paint
  the caption as its own poster strip: sunset gradient, palm and skyline
  silhouettes, eyebrow, gradient title, script subtitle, star row and
  tagline.
- **Neat by construction:** a cover is one subject, not a jumble. Every
  panel keeps its photo's face in frame: crops are gentle (1.0–1.15x zoom)
  and face-anchored, so a portrait photo in a wide panel still shows the
  whole face, and a cover never mixes two different people across its
  panels. Fill-all and the screenshot covers use one hero photo; the
  other sample stays in the tray for the editor.
- **Comic art:** three art styles — Comic (the photo posterised into ink art
  with edge inking, the GTA loading-screen look), Photo (grade only) and
  Halftone (comic art + print dots). The treatment is painted on canvas, so
  it works on any photo, offline.
- **Neon-sunset grades:** Sunset, Neon Nights, Golden Hour, Vice Pastel, Vice
  Magenta and Heatwave, with a strength slider. The grade is painted on
  canvas: sky wash, warm glow, cool shadows, vignette and film grain.
- **Bold caption lettering:** editable title (gradient yellow-to-pink with a
  thick outline), script subtitle in Pacifico with a neon glow, eyebrow and
  tagline, plus an EST. 2026 starburst sticker — top or bottom, sized to
  taste, in the title band or over the photos.
- **Fast export:** one click exports a PNG in 1080×1080, 1080×1350 and
  1920×1080 — or export a single size.

## Run it

Any static server works; the app makes no network request at all:

```sh
cd app
python3 -m http.server 8080
# open http://localhost:8080
```

Your photos are read on your own machine and never uploaded.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the workbench styles
- `app/src/render.js` — the canvas cover renderer (layouts, art styles,
  grades, title band, caption, stickers)
- `app/src/main.js` — editor wiring (photos, panels, export)
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=editor`, `?shot=cover`)
- `app/fonts/Anton-Regular.ttf` — Anton display type (SIL Open Font License)
- `app/fonts/Pacifico-Regular.ttf` — Pacifico script type (SIL Open Font License)
- `app/samples/` — two image-model sample photos from the make.fun kit, free to use
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `screenshots/` — the cover and the editor at work

## Originality

Everything here is original work. No Rockstar Games logo, wordmark, official
artwork, character or font is used. Lettering is set in
[Anton](https://github.com/googlefonts/AntonFont) and
[Pacifico](https://github.com/googlefonts/Pacifico) under the SIL Open Font
License (see `app/fonts/OFL.txt`).

## License

MIT — see [LICENSE](LICENSE).
