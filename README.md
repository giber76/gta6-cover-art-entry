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
- **Multi-panel covers:** four layouts — Poster (tall hero + two stacked),
  Four Up (2×2), Hero Strip (wide hero + two below), Split (two tall panels).
- **Neon-sunset grades:** Sunset, Neon Nights, Golden Hour and Vice Pastel, with
  a strength slider. The grade is painted on canvas: sky wash, warm glow, cool
  shadows, vignette and film grain.
- **Bold caption lettering:** editable title and subtitle in Anton, with an
  outline and a neon shadow, top or bottom, sized to taste.
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
- `app/src/render.js` — the canvas cover renderer (layouts, grades, caption)
- `app/src/main.js` — editor wiring (photos, panels, export)
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=editor`, `?shot=cover`)
- `app/fonts/Anton-Regular.ttf` — Anton display type (SIL Open Font License)
- `app/samples/` — two image-model sample photos from the make.fun kit, free to use
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `screenshots/` — the cover and the editor at work

## Originality

Everything here is original work. No Rockstar Games logo, wordmark, official
artwork, character or font is used. Lettering is set in
[Anton](https://github.com/googlefonts/AntonFont) under the SIL Open Font
License (see `app/fonts/OFL.txt`).

## License

MIT — see [LICENSE](LICENSE).
