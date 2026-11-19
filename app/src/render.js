// Canvas cover renderer for Sunset Cover Studio.
//
// A cover is a set of photo panels plus a title treatment, drawn onto a
// canvas of any size. Layouts are defined in fractions of the canvas, so
// the same cover renders cleanly at 1920x1080, 1080x1080 or 1080x1350.
//
// The two rules that matter most:
//  - Face-safe crops: a panel never zooms past 1.15x, and its pan is
//    computed so the photo's focus point (the subject's face) lands near
//    the panel centre. A face can never be panned out of frame.
//  - One subject per cover: every photo panel shows the same shot by
//    default, so a grid never mixes two different people.

import { shotById } from './shots.js';

// ---------------------------------------------------------------- layouts

export const LAYOUTS = [
  { id: 'poster', label: 'Poster' },
  { id: 'nineup', label: 'Nine Up' },
  { id: 'heroleft', label: 'Hero Left' },
  { id: 'titleband', label: 'Title Band' },
];

// ---------------------------------------------------------------- styles

// A style is a canvas filter for the photo plus an optional dot overlay
// that gives the print / comic feel. The dot overlay is drawn as a
// repeating pattern clipped to the panel.
export const STYLES = [
  { id: 'original', label: 'Original', filter: 'none', dots: null },
  {
    id: 'comic',
    label: 'Comic',
    filter: 'saturate(1.6) contrast(1.35) brightness(1.04)',
    dots: { spacing: 7, radius: 1.1, alpha: 0.10 },
  },
  {
    id: 'halftone',
    label: 'Halftone',
    filter: 'grayscale(0.55) contrast(1.55) brightness(1.06)',
    dots: { spacing: 9, radius: 1.8, alpha: 0.16 },
  },
  {
    id: 'neon',
    label: 'Neon',
    filter: 'saturate(2.2) contrast(1.15) hue-rotate(-12deg)',
    dots: { spacing: 6, radius: 0.9, alpha: 0.07 },
  },
];

// ---------------------------------------------------------------- grades

// A grade is a gentle filter on the photo plus a colour wash laid over
// the whole cover before the title text is drawn, so the lettering
// stays crisp while the photos share one sunset mood.
export const GRADES = [
  {
    id: 'sunset',
    label: 'Sunset',
    filter: 'sepia(0.22) saturate(1.35)',
    wash: ['#ff9a3d', '#ff5e7a'],
  },
  {
    id: 'dusk',
    label: 'Dusk',
    filter: 'saturate(1.2) brightness(0.96)',
    wash: ['#7b5cff', '#ff6b9d'],
  },
  {
    id: 'vice',
    label: 'Vice',
    filter: 'saturate(1.45) hue-rotate(8deg)',
    wash: ['#ff2e88', '#19c8c8'],
  },
  {
    id: 'golden',
    label: 'Golden',
    filter: 'sepia(0.38) saturate(1.5)',
    wash: ['#ffd23d', '#ff7a1a'],
  },
  {
    id: 'neonpink',
    label: 'Neon Pink',
    filter: 'saturate(1.8) hue-rotate(-20deg)',
    wash: ['#ff2fb3', '#7a2bff'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    filter: 'saturate(1.1) brightness(0.9)',
    wash: ['#1b2a6b', '#8a3ffc'],
  },
];

export function styleById(id) {
  return STYLES.find((s) => s.id === id) || STYLES[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// ---------------------------------------------------------------- geometry

// Panel rects for a layout, in canvas pixels. Every photo panel gets a
// stable index so its crop jitter is deterministic.
export function computeLayout(layoutId, W, H) {
  const g = Math.max(4, Math.round(Math.min(W, H) * 0.012));
  const photos = [];
  let title = null;

  if (layoutId === 'poster') {
    const split = Math.round(W * 0.6);
    photos.push({ x: 0, y: 0, w: split, h: H, index: 0 });
    photos.push({ x: split + g, y: 0, w: W - split - g, h: Math.round(H / 2) - Math.ceil(g / 2), index: 1 });
    photos.push({ x: split + g, y: Math.round(H / 2) + Math.ceil(g / 2), w: W - split - g, h: H - Math.round(H / 2) - Math.ceil(g / 2), index: 2 });
    // Title overlays the bottom of the hero, left aligned.
    title = {
      kind: 'overlay',
      x: Math.round(W * 0.035),
      w: Math.round(W * 0.56),
      bottom: Math.round(H * 0.045),
      align: 'left',
    };
  } else if (layoutId === 'nineup') {
    const cw = (W - g * 2) / 3;
    const ch = (H - g * 2) / 3;
    let n = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = Math.round(c * (cw + g));
        const y = Math.round(r * (ch + g));
        const w = Math.round(cw);
        const h = Math.round(ch);
        if (r === 1 && c === 1) {
          title = { kind: 'panel', x, y, w, h, align: 'center' };
        } else {
          photos.push({ x, y, w, h, index: n });
          n++;
        }
      }
    }
  } else if (layoutId === 'heroleft') {
    const split = Math.round(W * 0.55);
    photos.push({ x: 0, y: 0, w: split, h: H, index: 0 });
    // Title lives on its own gradient panel on the right.
    title = {
      kind: 'panel',
      x: split + g,
      y: 0,
      w: W - split - g,
      h: H,
      align: 'left',
    };
  } else {
    // titleband: five photo panels across the top, title band below.
    const bandH = Math.round(H * 0.32);
    const topH = H - bandH - g;
    const pw = (W - g * 4) / 5;
    for (let i = 0; i < 5; i++) {
      photos.push({
        x: Math.round(i * (pw + g)),
        y: 0,
        w: Math.round(pw),
        h: topH,
        index: i,
      });
    }
    title = {
      kind: 'band',
      x: 0,
      y: topH + g,
      w: W,
      h: bandH,
      align: 'center',
    };
  }

  // The tag sits top-left, the starburst top-right — opposite corners,
  // so they can never collide.
  const tag = { x: Math.round(W * 0.02), y: Math.round(H * 0.025) };
  const burst = {
    x: Math.round(W * 0.965),
    y: Math.round(H * 0.055),
    r: Math.round(Math.min(W, H) * 0.055),
  };
  return { photos, title, tag, burst, gutter: g };
}

// ---------------------------------------------------------------- cropping

// Face-safe crop: scale the photo to cover the panel, then place it so
// the focus point lands near the panel centre (plus a tiny deterministic
// nudge per panel for variety). Zoom is clamped to 1.0..1.15 and the
// placement is clamped so the photo always covers the panel.
export function drawPhotoPanel(ctx, img, focus, rect, zoom, dx, dy, style) {
  const { x, y, w, h, index } = rect;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const z = Math.min(1.15, Math.max(1.0, zoom || 1.0));
  const base = Math.max(w / iw, h / ih);
  const scale = base * z;
  const dw = iw * scale;
  const dh = ih * scale;

  // Small deterministic nudge so sibling panels do not look identical.
  const nudgeX = (((index * 37) % 7) - 3) * 0.012 * w;
  const nudgeY = (((index * 53) % 5) - 2) * 0.012 * h;
  const cx = x + w / 2 + (dx || 0) * w * 0.06 + nudgeX;
  const cy = y + h / 2 + (dy || 0) * h * 0.06 + nudgeY;

  let ox = cx - focus.x * dw;
  let oy = cy - focus.y * dh;
  // Clamp so the photo always covers the panel — no gaps, no bare canvas.
  ox = Math.min(x, Math.max(x + w - dw, ox));
  oy = Math.min(y, Math.max(y + h - dh, oy));

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = style.filter || 'none';
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.filter = 'none';
  if (style.dots) {
    drawDots(ctx, x, y, w, h, style.dots);
  }
  // A hairline edge keeps panels distinct on light grades.
  ctx.strokeStyle = 'rgba(20,10,30,0.55)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.004));
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

let dotPatternCache = {};
function dotPattern(spacing, radius) {
  const key = spacing + ':' + radius;
  if (dotPatternCache[key]) return dotPatternCache[key];
  const c = document.createElement('canvas');
  c.width = spacing;
  c.height = spacing;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,8,28,1)';
  g.beginPath();
  g.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2);
  g.fill();
  const pattern = document.createElement('canvas').getContext('2d')
    .createPattern(c, 'repeat');
  dotPatternCache[key] = pattern;
  return pattern;
}

function drawDots(ctx, x, y, w, h, dots) {
  ctx.save();
  ctx.globalAlpha = dots.alpha;
  ctx.fillStyle = dotPattern(dots.spacing, dots.radius);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------- text

// Shrink a font until the text fits the width. Returns the size to use.
function fitSize(ctx, text, maxW, start, family, weight) {
  let size = start;
  ctx.font = weight + ' ' + size + 'px ' + family;
  const w = ctx.measureText(text).width;
  if (w > maxW && w > 0) {
    size = Math.max(10, Math.floor(size * (maxW / w) * 0.98));
  }
  return size;
}

function gradientTitle(ctx, x, y, w) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, '#ffb03d');
  grad.addColorStop(0.45, '#ff5e7a');
  grad.addColorStop(1, '#ff2fb3');
  return grad;
}

// Draw the eyebrow / title / subtitle / tagline block. The block is
// measured first, then placed so its bottom sits at `bottom` — the text
// can never run off the canvas edge.
export function drawTitleBlock(ctx, area, text) {
  const { x, w, bottom, align } = area;
  const H = ctx.canvas.height;
  const pad = Math.round(H * 0.02);

  const titleStart = Math.round(H * 0.115);
  const titleSize = fitSize(ctx, text.title, w, titleStart, 'Anton, sans-serif', '400');
  const subStart = Math.round(H * 0.052);
  const subSize = fitSize(ctx, text.subtitle, w, subStart, 'Pacifico, cursive', '400');
  const eyeStart = Math.max(11, Math.round(H * 0.024));
  const eyeSize = fitSize(ctx, text.eyebrow, w, eyeStart, 'Anton, sans-serif', '400');
  const tagStart = Math.max(10, Math.round(H * 0.02));
  const tagSize = fitSize(ctx, text.tagline, w, tagStart, 'Anton, sans-serif', '400');

  const lineGap = Math.round(H * 0.012);
  const blockH =
    eyeSize + lineGap +
    titleSize * 1.02 + lineGap * 0.5 +
    subSize * 1.15 + lineGap +
    tagSize * 1.2 + pad;
  let cy = bottom - blockH;

  ctx.save();
  ctx.textAlign = align;
  const ax = align === 'center' ? x + w / 2 : x;
  const maxX = align === 'center' ? x + w / 2 : x + w;

  // Eyebrow.
  ctx.font = '400 ' + eyeSize + 'px Anton, sans-serif';
  ctx.fillStyle = '#ffd23d';
  ctx.fillText(text.eyebrow, ax, cy + eyeSize);
  cy += eyeSize + lineGap;

  // Title, gradient fill with a dark edge so it reads over any photo.
  ctx.font = '400 ' + titleSize + 'px Anton, sans-serif';
  ctx.lineWidth = Math.max(2, Math.round(titleSize / 14));
  ctx.strokeStyle = 'rgba(40,8,40,0.85)';
  ctx.lineJoin = 'round';
  const titleY = cy + titleSize;
  ctx.strokeText(text.title, ax, titleY);
  ctx.fillStyle = gradientTitle(ctx, x, titleY - titleSize, w);
  ctx.fillText(text.title, ax, titleY);
  cy += titleSize * 1.02 + lineGap * 0.5;

  // Script subtitle.
  ctx.font = '400 ' + subSize + 'px Pacifico, cursive';
  ctx.fillStyle = '#ff7ab8';
  const subY = cy + subSize;
  ctx.fillText(text.subtitle, ax, subY);
  cy += subSize * 1.15 + lineGap;

  // Tagline.
  ctx.font = '400 ' + tagSize + 'px Anton, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(text.tagline, ax, cy + tagSize);
  ctx.restore();

  return { top: bottom - blockH, height: blockH, titleSize, maxX };
}

// A solid gradient panel (Nine Up centre, Hero Left right side) with the
// title block centred in it and a small skyline along its bottom edge.
function drawTitlePanel(ctx, rect, text) {
  const { x, y, w, h } = rect;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#ff5e7a');
  grad.addColorStop(0.55, '#ff8a3d');
  grad.addColorStop(1, '#7a2bff');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Skyline silhouette along the bottom.
  const base = y + h;
  ctx.fillStyle = 'rgba(30,8,45,0.9)';
  let bx = x;
  let seed = 11;
  while (bx < x + w) {
    seed = (seed * 73 + 41) % 97;
    const bw = Math.max(6, Math.round(w * 0.09));
    const bh = Math.round(h * (0.06 + (seed % 10) * 0.012));
    ctx.fillRect(bx, base - bh, bw, bh);
    bx += bw + 2;
  }

  // Stars above the title.
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const starY = y + h * 0.14;
  for (let i = -2; i <= 2; i++) {
    const sx = x + w / 2 + i * Math.round(w * 0.09);
    drawStar(ctx, sx, starY, Math.round(h * 0.018));
  }

  const area = {
    x: x + Math.round(w * 0.07),
    w: Math.round(w * 0.86),
    bottom: Math.round(y + h * 0.82),
    align: 'center',
  };
  drawTitleBlock(ctx, area, text);
  ctx.restore();
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- chrome

// The SUNSET CITY chip, top-left.
function drawTag(ctx, x, y, label) {
  const h = Math.round(ctx.canvas.height * 0.042);
  ctx.save();
  ctx.font = '400 ' + Math.round(h * 0.52) + 'px Anton, sans-serif';
  const tw = ctx.measureText(label).width;
  const w = tw + h * 0.9;
  ctx.fillStyle = 'rgba(20,8,28,0.82)';
  roundRect(ctx, x, y, w, h, h * 0.28);
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + h * 0.45, y + h * 0.52);
  ctx.restore();
}

// The EST. 2026 starburst, top-right.
function drawBurst(ctx, cx, cy, r, top, bottom) {
  ctx.save();
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd23d';
  ctx.fill();
  ctx.lineWidth = Math.max(2, Math.round(r * 0.08));
  ctx.strokeStyle = 'rgba(40,8,40,0.9)';
  ctx.stroke();
  ctx.fillStyle = '#2b0a2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '400 ' + Math.round(r * 0.34) + 'px Anton, sans-serif';
  ctx.fillText(top, cx, cy - r * 0.2);
  ctx.fillText(bottom, cx, cy + r * 0.24);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------- render

// Draw one full cover. `opts` carries layout, style, grade, the title
// text and one panel entry per photo panel. `images` maps shot id to a
// loaded HTMLImageElement. The cover background is dark so any gap reads
// as a deliberate border, never as white.
export function renderCover(canvas, opts, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const style = styleById(opts.style);
  const grade = gradeById(opts.grade);
  const layout = computeLayout(opts.layout, W, H);

  ctx.save();
  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, W, H);

  // Photo panels.
  layout.photos.forEach((rect, i) => {
    const panel = (opts.panels && opts.panels[i]) || {};
    const shot = shotById(panel.shot || 'boulevard');
    const img = images[shot.id];
    if (!img) return;
    ctx.save();
    ctx.filter = grade.filter || 'none';
    drawPhotoPanel(ctx, img, shot.focus, rect, panel.zoom, panel.dx, panel.dy, style);
    ctx.restore();
  });

  // Grade wash over the whole cover, before any lettering.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Title treatment.
  const text = {
    title: opts.title || 'SUNSET HEIST',
    subtitle: opts.subtitle || 'Ocean Drive',
    eyebrow: opts.eyebrow || 'WELCOME TO VICE CITY',
    tagline: opts.tagline || 'ONE CITY, EVERY LIGHT TELLS A STORY',
  };
  if (layout.title) {
    if (layout.title.kind === 'overlay') {
      drawTitleBlock(ctx, {
        x: layout.title.x,
        w: layout.title.w,
        bottom: H - layout.title.bottom,
        align: 'left',
      }, text);
    } else if (layout.title.kind === 'panel') {
      drawTitlePanel(ctx, layout.title, text);
    } else {
      // band: gradient strip with the title block centred in it.
      const band = layout.title;
      const grad = ctx.createLinearGradient(band.x, band.y, band.x, band.y + band.h);
      grad.addColorStop(0, '#ff5e7a');
      grad.addColorStop(0.55, '#ff8a3d');
      grad.addColorStop(1, '#7a2bff');
      ctx.fillStyle = grad;
      ctx.fillRect(band.x, band.y, band.w, band.h);
      drawTitleBlock(ctx, {
        x: band.x + Math.round(band.w * 0.06),
        w: Math.round(band.w * 0.88),
        bottom: Math.round(band.y + band.h * 0.92),
        align: 'center',
      }, text);
    }
  }

  // Tag and starburst, opposite corners.
  drawTag(ctx, layout.tag.x, layout.tag.y, 'SUNSET CITY');
  drawBurst(ctx, layout.burst.x, layout.burst.y, layout.burst.r, 'EST.', '2026');

  ctx.restore();
}

// How many photo panels a layout has (the editor builds one panel entry
// per photo panel).
export function panelCount(layoutId, W, H) {
  return computeLayout(layoutId, W || 1280, H || 720).photos.length;
}
