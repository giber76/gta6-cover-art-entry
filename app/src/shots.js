// Sunset Cover Studio — fixed scenes for screenshots.
// ?shot=editor shows the page with sample photos loaded and a caption set.
// ?shot=cover shows the cover alone, edge to edge. window.__shotReady is set
// once the cover is painted, so a screenshot never catches a half-drawn page.

import { LAYOUTS, GRADES, defaultPanels, drawCover } from './render.js';

function imageMap(state) {
  return new Map([...state.photos].map(([id, p]) => [id, p.img]));
}

function ready() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

async function paintWhenFontsReady(paint) {
  try { await document.fonts.load('100px Anton'); } catch (_) { /* fallback fonts */ }
  paint();
  try { await document.fonts.ready; paint(); } catch (_) { /* already painted */ }
  ready();
}

export async function runShot(shot, query, api) {
  const { state, loadSample, renderPreview, syncUI } = api;
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('sub') ?? 'One last job on the boardwalk';
  const layout = query.get('layout') ?? 'poster';
  const grade = query.get('grade') ?? 'sunset';

  // Load the two sample photos, then place them on purpose: the sunset
  // boulevard shot leads, the pier fills the smaller panels.
  const pierId = await loadSample('pier');
  const blvdId = await loadSample('boulevard');
  state.layout = LAYOUTS[layout] ? layout : 'poster';
  state.grade = GRADES[grade] ? grade : 'sunset';
  state.title = caption;
  state.subtitle = subtitle;
  state.panels = defaultPanels(state.layout);
  const hero = state.panels[0];
  if (hero) hero.photoId = blvdId;
  if (state.panels[1]) state.panels[1].photoId = pierId;
  if (state.panels[2]) state.panels[2].photoId = blvdId;
  if (state.panels[3]) state.panels[3].photoId = pierId;
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
