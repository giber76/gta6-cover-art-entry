// Sunset Cover Studio — fixed scenes for screenshots.
// ?shot=editor shows the page with sample photos loaded and a caption set.
// ?shot=cover shows the cover alone, edge to edge. window.__shotReady is set
// once the cover is painted, so a screenshot never catches a half-drawn page.

import { LAYOUTS, GRADES, EXPORT_SIZES, defaultPanels, drawCover, cropPanels } from './render.js';

function imageMap(state) {
  return new Map([...state.photos].map(([id, p]) => [id, p.img]));
}

function ready() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

async function paintWhenFontsReady(paint) {
  try { await document.fonts.load('100px Anton'); await document.fonts.load('40px Pacifico'); } catch (_) { /* fallback fonts */ }
  paint();
  try { await document.fonts.ready; paint(); } catch (_) { /* already painted */ }
  ready();
}

// The preview canvas renders at half the export size on its long side.
function previewSizeFor(sizeId) {
  const def = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  const scale = 960 / Math.max(def.w, def.h);
  return { w: Math.round(def.w * scale), h: Math.round(def.h * scale) };
}

export async function runShot(shot, query, api) {
  const { state, loadSample, renderPreview, syncUI } = api;
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('sub') ?? 'Ocean Drive';
  // The default cover is the tidiest layout: one strong hero, two calm
  // panels, the caption over a scrim — never the busy 3x3 grid.
  const layout = query.get('layout') ?? 'poster';
  const grade = query.get('grade') ?? 'sunset';
  const style = query.get('style') ?? 'comic';
  const size = query.get('size') ?? '1920x1080';
  const [sw, sh] = size.split('x').map(Number);
  // The cover is painted at the viewport's own pixels (capped at 1600 wide),
  // full bleed: the screenshot shows exactly what is painted, so the crop
  // and the paint must use the same size.
  const coverW = Math.min(window.innerWidth, 1600);
  const coverH = sw > 0 && sh > 0 ? Math.round((coverW * sh) / sw) : 720;
  const viewW = shot === 'cover' ? coverW : previewSizeFor(size).w;
  const viewH = shot === 'cover' ? coverH : previewSizeFor(size).h;

  // Load both sample photos (the tray shows both), but a cover is ONE
  // subject: every panel shows the boulevard hero, face-safe cropped, so the
  // composition reads as one deliberate poster instead of a jumble of two
  // different people at random crops. v2 mixed boulevard and pier across the
  // grid and the user called it messy — v3 never mixes subjects in a cover.
  const pierId = await loadSample('pier');
  const blvdId = await loadSample('boulevard');
  void pierId;
  state.layout = LAYOUTS[layout] ? layout : 'poster';
  state.grade = GRADES[grade] ? grade : 'sunset';
  state.artStyle = style;
  state.title = caption;
  state.subtitle = subtitle;
  state.panels = defaultPanels(state.layout);
  state.panels.forEach((p) => { p.photoId = blvdId; });
  cropPanels(state, viewW, viewH);
  state.selected = 0;

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    if (sw > 0 && sh > 0) state.size = `${sw}x${sh}`;
    const stage = document.getElementById('stage');
    // Paint the cover at the viewport's own pixels, full bleed.
    const vw = coverW;
    const vh = coverH;
    stage.width = vw;
    stage.height = vh;
    stage.style.width = '100vw';
    stage.style.height = `${vh}px`;
    await paintWhenFontsReady(() => {
      drawCover(stage.getContext('2d'), { ...state, photos: imageMap(state) }, vw, vh);
    });
    return;
  }

  // Editor scene: the whole app, photo loaded, panels and controls visible.
  syncUI();
  await paintWhenFontsReady(() => renderPreview());
}
