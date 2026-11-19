// Sunset Cover Studio — fixed scenes for screenshots.
// ?shot=editor shows the page with sample photos loaded and a caption set.
// ?shot=cover shows the cover alone, edge to edge. window.__shotReady is set
// once the cover is painted, so a screenshot never catches a half-drawn page.

import { LAYOUTS, GRADES, defaultPanels, drawCover, varyCrop } from './render.js';

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

export async function runShot(shot, query, api) {
  const { state, loadSample, renderPreview, syncUI } = api;
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('sub') ?? 'Ocean Drive';
  const layout = query.get('layout') ?? 'nine';
  const grade = query.get('grade') ?? 'sunset';
  const style = query.get('style') ?? 'comic';

  // Load the two sample photos, then place them on purpose: the sunset
  // boulevard shot leads, the pier fills the smaller panels, every panel
  // showing a different crop of its photo.
  const pierId = await loadSample('pier');
  const blvdId = await loadSample('boulevard');
  state.layout = LAYOUTS[layout] ? layout : 'nine';
  state.grade = GRADES[grade] ? grade : 'sunset';
  state.artStyle = style;
  state.title = caption;
  state.subtitle = subtitle;
  state.panels = defaultPanels(state.layout);
  const fill = [blvdId, pierId, blvdId, pierId, blvdId, pierId, blvdId, pierId];
  state.panels.forEach((p, i) => {
    p.photoId = fill[i % fill.length];
    const crop = varyCrop(i);
    p.zoom = crop.zoom;
    p.panX = crop.panX;
    // The boulevard photo is portrait: bias its crop to the top (positive
    // panY shifts the photo down, revealing its top), so the subject's face
    // stays in the landscape panels.
    p.panY = p.photoId === blvdId ? 0.5 - (i % 3) * 0.15 : crop.panY;
  });
  state.selected = 0;

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = query.get('size') ?? '1920x1080';
    const [w, h] = size.split('x').map(Number);
    if (w > 0 && h > 0) state.size = `${w}x${h}`;
    const stage = document.getElementById('stage');
    // Paint the cover at the viewport's own pixels, full bleed.
    const vw = Math.min(window.innerWidth, 1600);
    const vh = Math.round((vw * h) / w);
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
