# Sunset Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/giber76/gta6-cover-art-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/giber76/gta6-cover-art-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A web app that builds GTA VI-style sunset cover art. Pick a layout, an art
style and a sunset grade, nudge each panel's crop, and export a print-ready
PNG. Everything runs in the browser — the photos and fonts are bundled, so
there are no network requests at all.

## What it makes

- **4 layouts** — Poster (the default), Nine Up (3×3 with a centre title
  panel), Hero Left, and Title Band.
- **4 art styles** — Original, Comic, Halftone, and Neon.
- **6 sunset grades** — Sunset, Dusk, Vice, Golden, Neon Pink, Midnight.
- **Per-panel crop** — zoom from 1.0× to 1.15× and a small pan, with
  face-safe cropping: the pan is computed so the subject's face stays
  near the centre of the panel and can never leave the frame.
- **One subject per cover** — every panel shows the Boulevard Hero by
  default, so a grid never mixes two different people.
- **PNG export** — 1080×1080, 1080×1350, and 1920×1080.

## Run it

Serve the `app/` directory with any static server and open
`index.html`, for example:

```sh
cd app && python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

- `main.ts` — platform entrypoint, boots the editor.
- `app/index.html` — the editor page.
- `app/src/main.js` — editor state, controls, and export.
- `app/src/render.js` — the canvas cover renderer (layouts, face-safe
  crops, styles, grades, lettering).
- `app/src/shots.js` — the bundled sample photos and their focus points.
- `app/style.css` — editor styles.
- `app/fonts/` — Anton and Pacifico, vendored under the SIL Open Font
  License (`OFL.txt`).
- `app/samples/` — the two bundled sunset photographs.

## License

MIT — see `LICENSE`.
