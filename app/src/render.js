// Sunset Cover Studio — canvas cover renderer (v2).
// One function, drawCover, paints the whole poster: the photo panels with a
// comic-art treatment and a neon-sunset grade, the gutters and frame, the
// grain and vignette, and the bold gradient caption lettering with a script
// subtitle, stickers and silhouettes. The editor preview and the PNG export
// both call it, so what you see is exactly what you share.

// Panel layouts, as fractions of the inner frame. Every layout works at any
// export aspect: the fractions are of width and height, not pixels. A layout
// may also carry a titleSlot: a fraction rect where the caption is painted as
// its own poster band (gradient sky, palm and skyline silhouettes, eyebrow,
// gradient title, script subtitle, stars, tagline) instead of an overlay.
export const LAYOUTS = {
  nine: {
    label: 'Nine Up',
    hint: '3×3 grid, title panel in the middle',
    slots: [
      { x: 0.0, y: 0.0, w: 0.333, h: 0.333 },
      { x: 0.333, y: 0.0, w: 0.333, h: 0.333 },
      { x: 0.667, y: 0.0, w: 0.333, h: 0.333 },
      { x: 0.0, y: 0.333, w: 0.333, h: 0.333 },
      { x: 0.667, y: 0.333, w: 0.333, h: 0.333 },
      { x: 0.0, y: 0.667, w: 0.333, h: 0.333 },
      { x: 0.333, y: 0.667, w: 0.333, h: 0.333 },
      { x: 0.667, y: 0.667, w: 0.333, h: 0.333 },
    ],
    titleSlot: { x: 0.333, y: 0.333, w: 0.333, h: 0.333 },
  },
  heroLeft: {
    label: 'Hero Left',
    hint: 'Big hero left, three stacked right, title band',
    slots: [
      { x: 0.0, y: 0.0, w: 0.62, h: 0.76 },
      { x: 0.63, y: 0.0, w: 0.37, h: 0.245 },
      { x: 0.63, y: 0.2575, w: 0.37, h: 0.245 },
      { x: 0.63, y: 0.515, w: 0.37, h: 0.245 },
    ],
    titleSlot: { x: 0.0, y: 0.78, w: 1.0, h: 0.22 },
  },
  band: {
    label: 'Title Band',
    hint: 'Five photos above a full-width title band',
    slots: [
      { x: 0.0, y: 0.0, w: 0.333, h: 0.36 },
      { x: 0.333, y: 0.0, w: 0.333, h: 0.36 },
      { x: 0.667, y: 0.0, w: 0.333, h: 0.36 },
      { x: 0.0, y: 0.37, w: 0.5, h: 0.35 },
      { x: 0.5, y: 0.37, w: 0.5, h: 0.35 },
    ],
    titleSlot: { x: 0.0, y: 0.73, w: 1.0, h: 0.27 },
  },
  poster: {
    label: 'Poster',
    hint: 'Tall hero panel, two stacked on the right',
    slots: [
      { x: 0.0, y: 0.0, w: 0.575, h: 1.0 },
      { x: 0.575, y: 0.0, w: 0.425, h: 0.495 },
      { x: 0.575, y: 0.505, w: 0.425, h: 0.495 },
    ],
  },
  grid: {
    label: 'Four Up',
    hint: 'Four equal panels, two by two',
    slots: [
      { x: 0.0, y: 0.0, w: 0.495, h: 0.495 },
      { x: 0.505, y: 0.0, w: 0.495, h: 0.495 },
      { x: 0.0, y: 0.505, w: 0.495, h: 0.495 },
      { x: 0.505, y: 0.505, w: 0.495, h: 0.495 },
    ],
  },
  hero: {
    label: 'Hero Strip',
    hint: 'One wide hero photo, two small panels below',
    slots: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.66 },
      { x: 0.0, y: 0.67, w: 0.495, h: 0.33 },
      { x: 0.505, y: 0.67, w: 0.495, h: 0.33 },
    ],
  },
  split: {
    label: 'Split',
    hint: 'Two tall panels, side by side',
    slots: [
      { x: 0.0, y: 0.0, w: 0.495, h: 1.0 },
      { x: 0.505, y: 0.0, w: 0.495, h: 1.0 },
    ],
  },
};

// The colour grades. Each is a sky wash (top to bottom), a warm glow and a
// cool shadow tint, blended over the photo. Values are [r, g, b] triples.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    hint: 'Magenta sky, orange horizon',
    sky: [[255, 46, 136], [255, 122, 24], [123, 47, 247]],
    glow: [255, 140, 40],
    shadow: [0, 180, 190],
    saturate: 1.28,
    contrast: 1.08,
  },
  neon: {
    label: 'Neon Nights',
    hint: 'Cyan and hot pink, after dark',
    sky: [[0, 229, 255], [255, 0, 168], [90, 20, 160]],
    glow: [255, 0, 168],
    shadow: [0, 120, 255],
    saturate: 1.45,
    contrast: 1.12,
  },
  gold: {
    label: 'Golden Hour',
    hint: 'Warm amber light, long shadows',
    sky: [[255, 179, 0], [255, 110, 30], [120, 50, 10]],
    glow: [255, 190, 60],
    shadow: [90, 60, 140],
    saturate: 1.22,
    contrast: 1.06,
  },
  vice: {
    label: 'Vice Pastel',
    hint: 'Soft pink and teal, pastel neon',
    sky: [[255, 93, 162], [255, 170, 200], [0, 194, 168]],
    glow: [255, 150, 190],
    shadow: [0, 160, 150],
    saturate: 1.3,
    contrast: 1.05,
  },
  magenta: {
    label: 'Vice Magenta',
    hint: 'Deep purple and hot pink, heavy dusk',
    sky: [[255, 0, 110], [190, 20, 140], [40, 0, 90]],
    glow: [255, 40, 130],
    shadow: [60, 0, 140],
    saturate: 1.5,
    contrast: 1.14,
  },
  heat: {
    label: 'Heatwave',
    hint: 'Scorched orange and red, high noon heat',
    sky: [[255, 90, 0], [255, 160, 20], [140, 10, 40]],
    glow: [255, 120, 0],
    shadow: [120, 30, 20],
    saturate: 1.35,
    contrast: 1.1,
  },
};

// How a photo is drawn: raw with the grade, posterised into comic art, or
// posterised with a print halftone dot texture. Comic is the genre look —
// the loading-screen art this bounty is judged on.
export const ART_STYLES = {
  comic: { label: 'Comic', hint: 'Posterised ink art, the GTA look' },
  photo: { label: 'Photo', hint: 'Your photo, grade only' },
  halftone: { label: 'Halftone', hint: 'Comic art + print dots' },
};

export const EXPORT_SIZES = [
  { id: '1920x1080', label: '1920 × 1080', hint: 'Landscape post', w: 1920, h: 1080 },
  { id: '1080x1080', label: '1080 × 1080', hint: 'Square post', w: 1080, h: 1080 },
  { id: '1080x1350', label: '1080 × 1350', hint: 'Portrait post', w: 1080, h: 1350 },
];

// A panel's photo placement: which photo, how far zoomed, and how far panned
// from centre. pan is -1..1 of the overflow in each direction.
export function blankPanel() {
  return { photoId: null, zoom: 1, panX: 0, panY: 0 };
}

export function defaultPanels(layoutId) {
  return LAYOUTS[layoutId].slots.map(() => blankPanel());
}

// Deterministic per-panel crop variation, so filling every panel with one
// photo still shows a different crop in each — the way the best covers reuse
// one subject. Index i of the panel decides the crop, so it is stable.
export function varyCrop(i) {
  const zooms = [1.0, 1.35, 1.7, 1.2, 1.55, 1.1, 1.45, 1.25];
  const pans = [
    [0, 0], [-0.55, -0.3], [0.5, 0.35], [0.3, -0.55],
    [-0.4, 0.5], [0.6, 0.1], [-0.15, -0.6], [0.15, 0.6],
  ];
  const p = pans[i % pans.length];
  return { zoom: zooms[i % zooms.length], panX: p[0], panY: p[1] };
}

// ---- comic-art treatment ---------------------------------------------------

// Posterise + ink edges, at a capped working size so it stays fast even on a
// 1920px export. The styled canvas is cached per photo + style, so panning
// and zooming cost nothing after the first paint.
const styleCache = new WeakMap();
const DOT_TILE = { tile: null };

function dotTile() {
  if (DOT_TILE.tile) return DOT_TILE.tile;
  const tile = document.createElement('canvas');
  tile.width = 64;
  tile.height = 64;
  const tctx = tile.getContext('2d');
  tctx.clearRect(0, 0, 64, 64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cx = x * 8 + 4;
      const cy = y * 8 + 4;
      const g = tctx.createRadialGradient(cx, cy, 0, cx, cy, 3.4);
      g.addColorStop(0, 'rgba(8,0,16,0.85)');
      g.addColorStop(1, 'rgba(8,0,16,0)');
      tctx.fillStyle = g;
      tctx.beginPath();
      tctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
      tctx.fill();
    }
  }
  DOT_TILE.tile = tile;
  return tile;
}

const BAYER = [
  [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
];

function stylize(img, style) {
  let byStyle = styleCache.get(img);
  if (!byStyle) {
    byStyle = new Map();
    styleCache.set(img, byStyle);
  }
  if (byStyle.has(style)) return byStyle.get(style);

  const scale = Math.min(1, 720 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * scale));
  const h = Math.max(2, Math.round(img.height * scale));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  octx.drawImage(img, 0, 0, w, h);
  if (style === 'photo') {
    byStyle.set(style, off);
    return off;
  }

  // Posterise: 5 levels per channel, then a contrast lift around mid-grey.
  const data = octx.getImageData(0, 0, w, h);
  const px = data.data;
  const step = 256 / 5;
  for (let i = 0; i < px.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const q = Math.floor(px[i + c] / step) * step + step / 2;
      const lifted = (q - 128) * 1.18 + 128;
      px[i + c] = Math.max(0, Math.min(255, Math.round(lifted)));
    }
  }
  if (style === 'comic') {
    // Ink edges: darken a pixel where its luminance jumps from a neighbour.
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        lum[y * w + x] = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
      }
    }
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const l = lum[y * w + x];
        if (Math.abs(l - lum[y * w + x + 1]) > 42 || Math.abs(l - lum[(y + 1) * w + x]) > 42) {
          const i = (y * w + x) * 4;
          px[i] *= 0.3; px[i + 1] *= 0.3; px[i + 2] *= 0.3;
        }
      }
    }
  } else if (style === 'halftone') {
    // Ordered dither on luminance: the print-dot texture of old posters.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const lum = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
        const t = (BAYER[y & 3][x & 3] + 0.5) / 16;
        const q = Math.floor((lum / 255) * 4 + t) / 4;
        const f = lum > 4 ? q / (lum / 255) : 1;
        px[i] = Math.max(0, Math.min(255, px[i] * f));
        px[i + 1] = Math.max(0, Math.min(255, px[i + 1] * f));
        px[i + 2] = Math.max(0, Math.min(255, px[i + 2] * f));
      }
    }
  }
  octx.putImageData(data, 0, 0);
  byStyle.set(style, off);
  return off;
}

// Paint one photo into a rectangle, cover-fit, with the panel's zoom and pan.
// Zoom 1 fills the rectangle exactly; panning slides the photo inside it.
export function paintPhoto(ctx, img, rect, panel) {
  if (!img) return;
  const zoom = Math.max(1, panel.zoom || 1);
  const scale = Math.max(rect.w / img.width, rect.h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const overflowX = Math.max(0, (dw - rect.w) / 2);
  const overflowY = Math.max(0, (dh - rect.h) / 2);
  const cx = rect.x + (rect.w - dw) / 2;
  const cy = rect.y + (rect.h - dh) / 2;
  const dx = cx + (panel.panX || 0) * overflowX;
  const dy = cy + (panel.panY || 0) * overflowY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Wash a grade over one panel: sky gradient, warm glow, cool shadow.
function paintGrade(ctx, rect, grade, strength) {
  const [top, mid, bottom] = grade.sky;
  const sky = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  sky.addColorStop(0, `rgba(${top[0]},${top[1]},${top[2]},${0.38 * strength})`);
  sky.addColorStop(0.55, `rgba(${mid[0]},${mid[1]},${mid[2]},${0.26 * strength})`);
  sky.addColorStop(1, `rgba(${bottom[0]},${bottom[1]},${bottom[2]},${0.34 * strength})`);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  const glow = ctx.createRadialGradient(
    rect.x + rect.w * 0.2, rect.y + rect.h * 0.85, 0,
    rect.x + rect.w * 0.2, rect.y + rect.h * 0.85, Math.max(rect.w, rect.h) * 0.9,
  );
  glow.addColorStop(0, `rgba(${grade.glow[0]},${grade.glow[1]},${grade.glow[2]},${0.3 * strength})`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgba(${grade.shadow[0]},${grade.shadow[1]},${grade.shadow[2]},${0.12 * strength})`;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// Fine film grain, generated once per size so exports are deterministic.
const grainCache = new Map();
function grainPattern(w, h) {
  const key = `${w}x${h}`;
  if (grainCache.has(key)) return grainCache.get(key);
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 20);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  const pattern = { tile, key };
  grainCache.set(key, pattern);
  return pattern;
}

// Split a caption into lines that fit maxWidth at the given font.
function wrapCaption(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// The title's gradient fill: sunset yellow at the top, hot pink at the bottom.
function titleGradient(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#ffd166');
  g.addColorStop(0.5, '#ff7a18');
  g.addColorStop(1, '#ff2e88');
  return g;
}

// Paint a title line with the gradient fill and a thick dark outline.
function paintTitleLine(ctx, text, x, y, size, maxW) {
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255,0,140,0.8)';
  ctx.shadowBlur = Math.round(size * 0.12);
  ctx.shadowOffsetX = Math.round(size * 0.04);
  ctx.shadowOffsetY = Math.round(size * 0.04);
  ctx.strokeStyle = 'rgba(10,2,18,0.92)';
  ctx.lineWidth = Math.max(3, Math.round(size * 0.11));
  ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = titleGradient(ctx, y - size, y + size * 0.12);
  ctx.fillText(text, x, y);
}

// The caption block for layouts without a title band: big gradient title with
// an outline, a script subtitle with a neon glow, an eyebrow above and a
// tagline below, over a dark scrim so it reads on any photo. The block is
// rotated about its own left edge, so the lettering never slides sideways off
// the cover, and the title and subtitle are shrunk until they fit.
function paintCaption(ctx, state, w, h, frame) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const tagline = (state.tagline || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  let size = Math.max(28, Math.round(h * 0.13 * (state.titleSize || 1)));
  const scrimH = Math.round(h * (title && subtitle ? 0.34 : 0.24));
  const scrimY = state.titlePos === 'top' ? frame : h - frame - scrimH;
  const scrim = ctx.createLinearGradient(0, scrimY, 0, scrimY + scrimH);
  if (state.titlePos === 'top') {
    scrim.addColorStop(0, 'rgba(8,2,16,0.85)');
    scrim.addColorStop(1, 'rgba(8,2,16,0)');
  } else {
    scrim.addColorStop(0, 'rgba(8,2,16,0)');
    scrim.addColorStop(1, 'rgba(8,2,16,0.88)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(frame, scrimY, w - frame * 2, scrimH);

  const pad = Math.round(w * 0.045) + frame;
  const maxW = w - pad * 2;
  const pivotY = scrimY + scrimH / 2;
  ctx.save();
  ctx.translate(pad, pivotY);
  ctx.rotate(-0.018);
  ctx.translate(-pad, -pivotY);
  ctx.textBaseline = 'alphabetic';
  const top = state.titlePos === 'top';
  let y = top
    ? scrimY + Math.round(scrimH * 0.3) + size * 0.5
    : scrimY + scrimH - Math.round(scrimH * 0.14);
  if (tagline) y -= Math.round(size * 0.34);
  if (subtitle) y -= Math.round(size * 0.5);
  if (title) {
    let lines = [];
    let widest = 0;
    while (size > 20) {
      ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
      lines = wrapCaption(ctx, title, maxW);
      widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
      if (widest <= maxW) break;
      size = Math.floor(size * 0.92);
    }
    const lineH = Math.round(size * 1.02);
    // Eyebrow above the title.
    const browSize = Math.max(11, Math.round(size * 0.17));
    ctx.font = `700 ${browSize}px 'Arial Narrow', Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, Math.round(browSize * 0.3))}px`; } catch (_) { /* older canvas */ }
    ctx.fillStyle = '#ffd166';
    ctx.fillText('WELCOME TO VICE CITY', pad, y - lines.length * lineH - Math.round(size * 0.28));
    try { ctx.letterSpacing = '0px'; } catch (_) { /* older canvas */ }
    let ty = y - (lines.length - 1) * lineH;
    for (const lineText of lines) {
      paintTitleLine(ctx, lineText, pad, ty, size, maxW);
      ty += lineH;
    }
    y = ty - lineH + Math.round(size * 0.62);
  }
  if (subtitle) {
    const subSize = Math.max(16, Math.round(size * 0.42));
    ctx.font = `${subSize}px Pacifico, cursive`;
    let subW = ctx.measureText(subtitle).width;
    let fit = subSize;
    while (subW > maxW && fit > 12) {
      fit = Math.floor(fit * 0.92);
      ctx.font = `${fit}px Pacifico, cursive`;
      subW = ctx.measureText(subtitle).width;
    }
    ctx.save();
    ctx.translate(pad, y);
    ctx.rotate(-0.03);
    ctx.translate(-pad, -y);
    ctx.shadowColor = 'rgba(255,0,180,0.9)';
    ctx.shadowBlur = Math.round(fit * 0.5);
    ctx.fillStyle = '#ff8fd4';
    ctx.fillText(subtitle, pad, y);
    ctx.restore();
    y += Math.round(fit * 0.9);
  }
  if (tagline) {
    const tagSize = Math.max(10, Math.round(size * 0.16));
    ctx.font = `700 ${tagSize}px 'Arial Narrow', Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, Math.round(tagSize * 0.28))}px`; } catch (_) { /* older canvas */ }
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.fillText(tagline, pad, y);
    try { ctx.letterSpacing = '0px'; } catch (_) { /* older canvas */ }
  }
  ctx.restore();
}

// ---- title band (layouts with a titleSlot) ---------------------------------

// A tiny seeded random, so the skyline is identical on every export.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function paintSkyline(ctx, rect) {
  const rand = seeded(20261119);
  const base = rect.y + rect.h;
  const col = 'rgba(10,2,18,0.88)';
  let x = rect.x;
  ctx.fillStyle = col;
  while (x < rect.x + rect.w) {
    const bw = rect.w * (0.04 + rand() * 0.05);
    const bh = rect.h * (0.12 + rand() * 0.3);
    ctx.fillRect(x, base - bh, bw, bh);
    // A lit window or two.
    if (rand() > 0.45) {
      ctx.fillStyle = 'rgba(255,209,102,0.9)';
      ctx.fillRect(x + bw * 0.25, base - bh + bh * 0.3, Math.max(2, bw * 0.14), Math.max(2, bh * 0.12));
      ctx.fillStyle = col;
    }
    x += bw + rect.w * 0.008;
  }
}

function paintPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk, leaning.
  ctx.lineWidth = Math.max(2, s * 0.07);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.92);
  ctx.stroke();
  const topX = x + s * 0.22;
  const topY = y - s * 0.92;
  // Fronds, fanning out from the crown.
  ctx.lineWidth = Math.max(2, s * 0.045);
  const fronds = [
    [-0.85, -0.25], [-0.55, -0.55], [-0.15, -0.7],
    [0.3, -0.62], [0.7, -0.4], [0.85, -0.05], [0.45, 0.18],
  ];
  for (const [dx, dy] of fronds) {
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + dx * s * 0.55, topY + dy * s * 0.45,
      topX + dx * s, topY + dy * s + s * 0.18,
    );
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(topX + s * 0.03, topY + s * 0.05, Math.max(2, s * 0.045), 0, Math.PI * 2);
  ctx.arc(topX - s * 0.05, topY + s * 0.06, Math.max(2, s * 0.04), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// The title band: a sunset gradient with palm and skyline silhouettes, and
// the caption stacked in the middle — eyebrow, gradient title, script
// subtitle, star row, tagline.
function paintTitleBand(ctx, rect, state, grade) {
  const [top, mid, bottom] = grade.sky;
  const bg = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  bg.addColorStop(0, `rgb(${top[0]},${top[1]},${top[2]})`);
  bg.addColorStop(0.55, `rgb(${mid[0]},${mid[1]},${mid[2]})`);
  bg.addColorStop(1, `rgb(${bottom[0]},${bottom[1]},${bottom[2]})`);
  ctx.fillStyle = bg;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // Warm glow low in the band.
  const glow = ctx.createRadialGradient(
    rect.x + rect.w * 0.5, rect.y + rect.h, 0,
    rect.x + rect.w * 0.5, rect.y + rect.h, Math.max(rect.w, rect.h) * 0.8,
  );
  glow.addColorStop(0, `rgba(${grade.glow[0]},${grade.glow[1]},${grade.glow[2]},0.5)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  const sil = 'rgba(12,2,20,0.82)';
  const palmH = rect.h * 0.92;
  if (rect.w > rect.h * 1.6) {
    paintPalm(ctx, rect.x + rect.w * 0.045, rect.y + rect.h * 0.96, palmH, sil);
    paintPalm(ctx, rect.x + rect.w * 0.955, rect.y + rect.h * 0.96, palmH * 0.85, sil);
  }
  paintSkyline(ctx, { x: rect.x, y: rect.y + rect.h * 0.7, w: rect.w, h: rect.h * 0.3 });

  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const tagline = (state.tagline || '').trim().toUpperCase();
  if (!title && !subtitle) return;

  const pad = Math.round(rect.w * 0.06);
  const maxW = rect.w - pad * 2;
  // The content block lives above the skyline: the top ~78% of the band.
  const areaTop = rect.y + rect.h * 0.03;
  const areaH = rect.h * 0.75;
  const cx = rect.x + rect.w / 2;

  // One vertical stack, measured first with the same increments it is drawn
  // with, so nothing is ever clipped at the bottom. If it does not fit, the
  // whole stack shrinks and is measured again.
  function stack(scale) {
    let size = Math.max(18, Math.round(
      Math.min(rect.h * 0.42, rect.w * 0.16) * (state.titleSize || 1) * scale,
    ));
    let lines = [];
    let widest = 0;
    while (size > 16) {
      ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
      lines = wrapCaption(ctx, title, maxW);
      widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
      if (widest <= maxW) break;
      size = Math.floor(size * 0.92);
    }
    const subSize = Math.max(12, Math.round(size * 0.4 * scale));
    const browSize = Math.max(9, Math.round(size * 0.16 * scale));
    const tagSize = Math.max(8, Math.round(size * 0.15 * scale));
    const starSize = Math.max(10, Math.round(size * 0.22 * scale));
    const lineH = Math.round(size * 1.04);
    const rows = [];
    rows.push({ kind: 'brow', h: Math.round(browSize * 1.3) });
    rows.push({ kind: 'gap', h: Math.round(size * 0.55) });
    for (let i = 0; i < lines.length; i++) rows.push({ kind: 'title', h: lineH, text: lines[i] });
    if (subtitle) rows.push({ kind: 'gap', h: Math.round(subSize * 0.9) });
    if (subtitle) rows.push({ kind: 'sub', h: Math.round(subSize * 1.15) });
    rows.push({ kind: 'gap', h: Math.round(starSize * 0.9) });
    rows.push({ kind: 'stars', h: Math.round(starSize * 1.15) });
    if (tagline) rows.push({ kind: 'gap', h: Math.round(tagSize * 0.9) });
    if (tagline) rows.push({ kind: 'tag', h: Math.round(tagSize * 1.2) });
    const total = rows.reduce((a, r) => a + r.h, 0);
    return { size, lines, subSize, browSize, tagSize, starSize, rows, total };
  }
  let s = stack(1);
  if (s.total > areaH) s = stack(areaH / s.total);
  let y = areaTop + (areaH - s.total) / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (const row of s.rows) {
    if (row.kind === 'brow') {
      y += s.browSize;
      ctx.font = `700 ${s.browSize}px 'Arial Narrow', Arial, sans-serif`;
      try { ctx.letterSpacing = `${Math.max(2, Math.round(s.browSize * 0.32))}px`; } catch (_) { /* older canvas */ }
      ctx.fillStyle = '#ffd166';
      ctx.fillText('WELCOME TO VICE CITY', cx, y);
      try { ctx.letterSpacing = '0px'; } catch (_) { /* older canvas */ }
      y += row.h - s.browSize;
    } else if (row.kind === 'title') {
      y += s.size;
      paintTitleLine(ctx, row.text, cx - ctx.measureText(row.text).width / 2, y, s.size, maxW);
      y += row.h - s.size;
    } else if (row.kind === 'sub') {
      y += Math.round(s.subSize * 0.8);
      ctx.font = `${s.subSize}px Pacifico, cursive`;
      let fit = s.subSize;
      while (ctx.measureText(subtitle).width > maxW && fit > 11) {
        fit = Math.floor(fit * 0.92);
        ctx.font = `${fit}px Pacifico, cursive`;
      }
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(-0.025);
      ctx.translate(-cx, -y);
      ctx.shadowColor = 'rgba(255,0,180,0.9)';
      ctx.shadowBlur = Math.round(fit * 0.5);
      ctx.fillStyle = '#ff8fd4';
      ctx.fillText(subtitle, cx, y);
      ctx.restore();
      y += row.h - Math.round(s.subSize * 0.8);
    } else if (row.kind === 'stars') {
      y += Math.round(s.starSize * 0.8);
      ctx.font = `${s.starSize}px Arial, sans-serif`;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#ffd166';
      ctx.fillText('★ ★ ★ ★ ★', cx, y);
      y += row.h - Math.round(s.starSize * 0.8);
    } else if (row.kind === 'tag') {
      y += Math.round(s.tagSize * 0.8);
      ctx.font = `700 ${s.tagSize}px 'Arial Narrow', Arial, sans-serif`;
      try { ctx.letterSpacing = `${Math.max(2, Math.round(s.tagSize * 0.3))}px`; } catch (_) { /* older canvas */ }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(tagline, cx, y);
      try { ctx.letterSpacing = '0px'; } catch (_) { /* older canvas */ }
      y += row.h - Math.round(s.tagSize * 0.8);
    } else {
      y += row.h;
    }
  }
  ctx.restore();
}

// The starburst sticker every cover carries: EST. 2026, top right.
function paintBadge(ctx, w, h, frame) {
  const r = Math.max(26, Math.round(h * 0.048));
  const cx = w - frame - r * 1.15;
  const cy = frame + r * 1.15;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.1);
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,2,18,0.9)';
  ctx.lineWidth = Math.max(2, Math.round(r * 0.06));
  ctx.stroke();
  ctx.fillStyle = '#16041f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(10, Math.round(r * 0.3))}px Anton, 'Arial Black', sans-serif`;
  ctx.fillText('EST.', 0, -r * 0.18);
  ctx.fillText('2026', 0, r * 0.26);
  ctx.restore();
}

// The small corner tag every overlay-caption cover carries.
function paintCityTag(ctx, w, h, frame) {
  const tagSize = Math.max(13, Math.round(h * 0.022));
  const text = 'SUNSET CITY';
  ctx.save();
  ctx.font = `${tagSize}px Anton, 'Arial Black', sans-serif`;
  const tw = ctx.measureText(text).width;
  const padX = Math.round(tagSize * 0.9);
  const padY = Math.round(tagSize * 0.55);
  const bx = w - frame - tw - padX * 2;
  const by = frame + Math.round(h * 0.012);
  ctx.fillStyle = 'rgba(10,2,18,0.78)';
  ctx.fillRect(bx, by, tw + padX * 2, tagSize + padY * 2);
  ctx.strokeStyle = 'rgba(255,209,102,0.9)';
  ctx.lineWidth = Math.max(1, Math.round(tagSize * 0.08));
  ctx.strokeRect(bx, by, tw + padX * 2, tagSize + padY * 2);
  ctx.fillStyle = '#ffd166';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + padX, by + (tagSize + padY * 2) / 2 + 1);
  ctx.restore();
}

// A layout fraction rect, in canvas pixels, with gutters.
function layoutRect(slot, inner, gutter) {
  return {
    x: inner.x + slot.x * inner.w + (slot.x > 0 ? gutter / 2 : 0),
    y: inner.y + slot.y * inner.h + (slot.y > 0 ? gutter / 2 : 0),
    w: slot.w * inner.w - (slot.x > 0 ? gutter / 2 : 0) - (slot.x + slot.w < 1 ? gutter / 2 : 0),
    h: slot.h * inner.h - (slot.y > 0 ? gutter / 2 : 0) - (slot.y + slot.h < 1 ? gutter / 2 : 0),
  };
}

// Render the whole cover into ctx at w x h. photos is a Map of id -> Image.
// Panels whose photo is missing get a sunset-gradient placeholder instead.
export function drawCover(ctx, state, w, h) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.nine;
  const artStyle = ART_STYLES[state.artStyle] ? state.artStyle : 'comic';
  const strength = state.gradeStrength == null ? 0.85 : state.gradeStrength;
  const frame = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  const gutter = Math.max(4, Math.round(Math.min(w, h) * 0.009));

  ctx.save();
  ctx.fillStyle = '#0a0212';
  ctx.fillRect(0, 0, w, h);
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };

  layout.slots.forEach((slot, i) => {
    const rect = layoutRect(slot, inner, gutter);
    const panel = (state.panels && state.panels[i]) || blankPanel();
    const img = panel.photoId ? state.photos.get(panel.photoId) : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (img) {
      const src = stylize(img, artStyle);
      ctx.filter = `saturate(${grade.saturate}) contrast(${grade.contrast})`;
      paintPhoto(ctx, src, rect, panel);
      ctx.filter = 'none';
      if (artStyle === 'halftone') {
        const pattern = ctx.createPattern(dotTile(), 'repeat');
        if (pattern) {
          ctx.save();
          ctx.globalAlpha = 0.16;
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = pattern;
          ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
          ctx.restore();
        }
      }
    } else {
      const ph = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      ph.addColorStop(0, '#3d1a5e');
      ph.addColorStop(0.55, '#c22e6e');
      ph.addColorStop(1, '#ff7a18');
      ctx.fillStyle = ph;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `${Math.max(14, Math.round(rect.h * 0.05))}px Anton, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.textAlign = 'left';
    }
    paintGrade(ctx, rect, grade, strength);
    ctx.restore();
    ctx.strokeStyle = 'rgba(10,2,18,0.9)';
    ctx.lineWidth = Math.max(2, Math.round(gutter / 2));
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  // Vignette over the whole cover.
  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(10,0,20,0)');
  vig.addColorStop(1, 'rgba(10,0,20,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Grain, tiled.
  const { tile } = grainPattern(w, h);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  if (layout.titleSlot) {
    const band = layoutRect(layout.titleSlot, inner, gutter);
    ctx.save();
    ctx.beginPath();
    ctx.rect(band.x, band.y, band.w, band.h);
    ctx.clip();
    paintTitleBand(ctx, band, state, grade);
    ctx.restore();
    ctx.strokeStyle = 'rgba(10,2,18,0.9)';
    ctx.lineWidth = Math.max(2, Math.round(gutter / 2));
    ctx.strokeRect(band.x, band.y, band.w, band.h);
  } else {
    paintCaption(ctx, state, w, h, frame);
    paintCityTag(ctx, w, h, frame);
  }
  if (state.badge !== false) paintBadge(ctx, w, h, frame);
  ctx.restore();
}

// Slot rectangles in canvas pixels, for hit-testing clicks and drags.
export function slotRects(state, w, h) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.nine;
  const frame = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  const gutter = Math.max(4, Math.round(Math.min(w, h) * 0.009));
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };
  return layout.slots.map((slot) => layoutRect(slot, inner, gutter));
}
