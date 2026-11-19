// Sunset Cover Studio — canvas cover renderer.
// One function, drawCover, paints the whole poster: the photo panels with a
// neon-sunset grade, the gutters and frame, the grain and vignette, and the
// bold caption lettering. The editor preview and the PNG export both call it,
// so what you see is exactly what you share.

// Panel layouts, as fractions of the inner frame. Every layout works at any
// export aspect: the fractions are of width and height, not pixels.
export const LAYOUTS = {
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
  sky.addColorStop(0, `rgba(${top[0]},${top[1]},${top[2]},${0.34 * strength})`);
  sky.addColorStop(0.55, `rgba(${mid[0]},${mid[1]},${mid[2]},${0.22 * strength})`);
  sky.addColorStop(1, `rgba(${bottom[0]},${bottom[1]},${bottom[2]},${0.3 * strength})`);
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

// The caption block: big display type with an outline and a neon shadow,
// over a dark scrim so it reads on any photo. The block is rotated about its
// own left edge, so the lettering never slides sideways off the cover, and
// the title and subtitle are shrunk until they fit the cover's width.
function paintCaption(ctx, state, w, h, frame) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  let size = Math.max(28, Math.round(h * 0.115 * (state.titleSize || 1)));
  const scrimH = Math.round(h * (title && subtitle ? 0.3 : 0.22));
  const scrimY = state.titlePos === 'top' ? frame : h - frame - scrimH;
  const scrim = ctx.createLinearGradient(0, scrimY, 0, scrimY + scrimH);
  if (state.titlePos === 'top') {
    scrim.addColorStop(0, 'rgba(8,2,16,0.82)');
    scrim.addColorStop(1, 'rgba(8,2,16,0)');
  } else {
    scrim.addColorStop(0, 'rgba(8,2,16,0)');
    scrim.addColorStop(1, 'rgba(8,2,16,0.85)');
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
  if (title) {
    // Shrink the title until its widest wrapped line fits the cover.
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
    const blockH = lines.length * lineH;
    let y = state.titlePos === 'top'
      ? scrimY + Math.round(scrimH * 0.32) + size * 0.5
      : scrimY + scrimH - Math.round(scrimH * 0.18) - blockH + size;
    if (subtitle) y -= Math.round(size * 0.42);
    ctx.lineJoin = 'round';
    for (const lineText of lines) {
      ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
      ctx.shadowColor = 'rgba(255,0,140,0.85)';
      ctx.shadowBlur = Math.round(size * 0.16);
      ctx.shadowOffsetX = Math.round(size * 0.045);
      ctx.shadowOffsetY = Math.round(size * 0.045);
      ctx.strokeStyle = 'rgba(10,2,18,0.9)';
      ctx.lineWidth = Math.max(3, Math.round(size * 0.09));
      ctx.strokeText(lineText, pad, y);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = state.titleColor === 'pink' ? '#ffd7ef' : '#ffffff';
      ctx.fillText(lineText, pad, y);
      y += lineH;
    }
  }
  if (subtitle) {
    // Shrink the subtitle's tracking, then its size, until it fits.
    let subSize = Math.max(14, Math.round(size * 0.3));
    let spacing = Math.round(subSize * 0.18);
    const setSubFont = () => {
      ctx.font = `700 ${subSize}px 'Arial Narrow', Arial, sans-serif`;
      try { ctx.letterSpacing = `${spacing}px`; } catch (_) { /* older canvas */ }
    };
    setSubFont();
    while (ctx.measureText(subtitle).width > maxW && (spacing > 0 || subSize > 12)) {
      if (spacing > 0) spacing = Math.max(0, spacing - 2);
      else subSize -= 2;
      setSubFont();
    }
    const subY = state.titlePos === 'top'
      ? scrimY + Math.round(scrimH * 0.82)
      : scrimY + scrimH - Math.round(scrimH * 0.1);
    ctx.fillStyle = '#ffd166';
    ctx.fillText(subtitle, pad, subY);
    try { ctx.letterSpacing = '0px'; } catch (_) { /* older canvas */ }
  }
  ctx.restore();
}

// The small corner tag every cover carries: the city name, original to this app.
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

// Render the whole cover into ctx at w x h. photos is a Map of id -> Image.
// Panels whose photo is missing get a sunset-gradient placeholder instead.
export function drawCover(ctx, state, w, h) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const strength = state.gradeStrength == null ? 0.85 : state.gradeStrength;
  const frame = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  const gutter = Math.max(4, Math.round(Math.min(w, h) * 0.009));

  ctx.save();
  ctx.fillStyle = '#0a0212';
  ctx.fillRect(0, 0, w, h);
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };

  layout.slots.forEach((slot, i) => {
    const rect = {
      x: inner.x + slot.x * inner.w + (slot.x > 0 ? gutter / 2 : 0),
      y: inner.y + slot.y * inner.h + (slot.y > 0 ? gutter / 2 : 0),
      w: slot.w * inner.w - (slot.x > 0 ? gutter / 2 : 0) - (slot.x + slot.w < 1 ? gutter / 2 : 0),
      h: slot.h * inner.h - (slot.y > 0 ? gutter / 2 : 0) - (slot.y + slot.h < 1 ? gutter / 2 : 0),
    };
    const panel = (state.panels && state.panels[i]) || blankPanel();
    const img = panel.photoId ? state.photos.get(panel.photoId) : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (img) {
      ctx.filter = `saturate(${grade.saturate}) contrast(${grade.contrast})`;
      paintPhoto(ctx, img, rect, panel);
      ctx.filter = 'none';
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

  paintCaption(ctx, state, w, h, frame);
  paintCityTag(ctx, w, h, frame);
  ctx.restore();
}

// Slot rectangles in canvas pixels, for hit-testing clicks and drags.
export function slotRects(state, w, h) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const frame = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  const gutter = Math.max(4, Math.round(Math.min(w, h) * 0.009));
  const inner = { x: frame, y: frame, w: w - frame * 2, h: h - frame * 2 };
  return layout.slots.map((slot) => ({
    x: inner.x + slot.x * inner.w + (slot.x > 0 ? gutter / 2 : 0),
    y: inner.y + slot.y * inner.h + (slot.y > 0 ? gutter / 2 : 0),
    w: slot.w * inner.w - (slot.x > 0 ? gutter / 2 : 0) - (slot.x + slot.w < 1 ? gutter / 2 : 0),
    h: slot.h * inner.h - (slot.y > 0 ? gutter / 2 : 0) - (slot.y + slot.h < 1 ? gutter / 2 : 0),
  }));
}
