// Sunset Cover Studio — editor wiring.
// Owns the page state, the photo tray, the panel controls and the export.
// All drawing goes through drawCover in render.js, so the preview on screen
// is the same picture the PNG export writes.

import {
  LAYOUTS, GRADES, ART_STYLES, EXPORT_SIZES,
  blankPanel, defaultPanels, drawCover, slotRects, cropPanels,
} from './render.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const stageCtx = stage.getContext('2d');

let photoSeq = 0;
const state = {
  // The default is the tidiest layout: one strong hero, two calm panels, the
  // caption over a scrim. A busy 3x3 grid is an option, never the first thing
  // anyone sees.
  layout: 'poster',
  grade: 'sunset',
  gradeStrength: 0.85,
  artStyle: 'comic',
  badge: true,
  size: '1920x1080',
  title: 'Sunset Heist',
  subtitle: 'Ocean Drive',
  tagline: 'One city, every light tells a story',
  titleSize: 1,
  titlePos: 'bottom',
  titleColor: 'white',
  photos: new Map(), // id -> { id, name, img }
  photoOrder: [], // ids, tray order
  panels: defaultPanels('poster'),
  selected: 0,
};

// Fill every panel that is still empty with one photo, each panel face-safe
// cropped (cropPanels), so a cover is full from the first click and reads as
// one composition, not a jumble of crops.
function autoFillAll() {
  const heroId = state.panels.find((p) => p.photoId)?.photoId
    || state.photoOrder[0] || null;
  if (!heroId) return;
  state.panels.forEach((p) => {
    if (!p.photoId) p.photoId = heroId;
  });
  const { w, h } = previewSize();
  cropPanels(state, w, h);
}

function sizeDef() {
  return EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[0];
}

// The preview canvas renders at half the export size on its long side, so it
// stays crisp on screen without costing an export-size paint every keystroke.
function previewSize() {
  const { w, h } = sizeDef();
  const scale = 960 / Math.max(w, h);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

function renderPreview() {
  const { w, h } = previewSize();
  if (stage.width !== w || stage.height !== h) {
    stage.width = w;
    stage.height = h;
  }
  const photos = new Map([...state.photos].map(([id, p]) => [id, p.img]));
  drawCover(stageCtx, { ...state, photos }, w, h);
  drawSelection();
}

function drawSelection() {
  const rects = slotRects(state, stage.width, stage.height);
  const rect = rects[state.selected];
  if (!rect) return;
  stageCtx.save();
  stageCtx.strokeStyle = '#ffd166';
  stageCtx.lineWidth = 3;
  stageCtx.setLineDash([10, 6]);
  stageCtx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
  stageCtx.setLineDash([]);
  stageCtx.fillStyle = '#ffd166';
  stageCtx.font = `700 ${Math.max(12, Math.round(stage.height * 0.02))}px Arial, sans-serif`;
  const label = `PANEL ${state.selected + 1}`;
  const tw = stageCtx.measureText(label).width;
  stageCtx.fillRect(rect.x + 6, rect.y + 6, tw + 12, 22);
  stageCtx.fillStyle = '#0a0212';
  stageCtx.textBaseline = 'middle';
  stageCtx.fillText(label, rect.x + 12, rect.y + 17);
  stageCtx.restore();
}

// ---- photos ---------------------------------------------------------------

function addPhoto(name, img) {
  const id = `photo-${++photoSeq}`;
  state.photos.set(id, { id, name, img });
  state.photoOrder.push(id);
  // A new photo fills the first empty panel, so one click already shows art.
  const empty = state.panels.findIndex((p) => !p.photoId);
  if (empty >= 0) state.panels[empty].photoId = id;
  state.selected = empty >= 0 ? empty : state.selected;
  buildTray();
  renderPreview();
  return id;
}

function loadPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(addPhoto(file.name, img));
      img.onerror = () => reject(new Error(`Could not read ${file.name} as a photo`));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function loadSample(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(addPhoto(name, img));
    img.onerror = () => reject(new Error(`Could not load sample ${name}`));
    img.src = `samples/${name}.jpg`;
  });
}

function buildTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  for (const id of state.photoOrder) {
    const photo = state.photos.get(id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tray-card';
    card.title = `Use ${photo.name} in panel ${state.selected + 1}`;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    const label = document.createElement('span');
    label.textContent = photo.name.replace(/\.[^.]+$/, '').slice(0, 18);
    card.append(thumb, label);
    card.addEventListener('click', () => {
      state.panels[state.selected].photoId = id;
      state.panels[state.selected].zoom = 1;
      state.panels[state.selected].panX = 0;
      state.panels[state.selected].panY = 0;
      syncPanelControls();
      renderPreview();
    });
    tray.append(card);
  }
  const used = new Set(state.panels.map((p) => p.photoId));
  $('fill-all').disabled = state.photoOrder.length === 0;
  $('fill-all').title = state.photoOrder.length
    ? 'Fill every panel with the selected panel’s photo'
    : 'Add a photo first';
  $('tray-empty').style.display = state.photoOrder.length ? 'none' : 'block';
  $('panel-photo').textContent = state.panels[state.selected]
    ? `Panel ${state.selected + 1}: ${photoName(state.panels[state.selected].photoId)}`
    : '';
  function photoName(pid) {
    if (!pid) return 'empty — pick a photo below';
    return state.photos.get(pid)?.name ?? 'photo';
  }
}

// ---- layout, grade, caption ----------------------------------------------

function buildOptionButtons() {
  const layoutBox = $('layout-options');
  for (const [id, def] of Object.entries(LAYOUTS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.dataset.value = id;
    btn.innerHTML = `<b>${def.label}</b><span>${def.hint}</span>`;
    btn.addEventListener('click', () => {
      const oldPhotos = state.panels.map((p) => p.photoId);
      state.layout = id;
      state.panels = defaultPanels(id);
      // Keep photos where the new layout has a matching panel, and fill any
      // panel the new layout adds with the hero photo, so a cover never has
      // an empty hole after switching layouts.
      const heroPhoto = oldPhotos[0] || oldPhotos.find(Boolean) || null;
      state.panels.forEach((p, i) => {
        p.photoId = oldPhotos[i] || heroPhoto;
      });
      const { w, h } = previewSize();
      cropPanels(state, w, h);
      state.selected = 0;
      syncOptionButtons();
      syncPanelControls();
      buildTray();
      renderPreview();
    });
    layoutBox.append(btn);
  }
  const gradeBox = $('grade-options');
  for (const [id, def] of Object.entries(GRADES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.dataset.value = id;
    btn.innerHTML = `<b>${def.label}</b><span>${def.hint}</span>`;
    btn.addEventListener('click', () => {
      state.grade = id;
      syncOptionButtons();
      renderPreview();
    });
    gradeBox.append(btn);
  }
  const sizeBox = $('size-options');
  for (const def of EXPORT_SIZES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.dataset.value = def.id;
    btn.innerHTML = `<b>${def.label}</b><span>${def.hint}</span>`;
    btn.addEventListener('click', () => {
      state.size = def.id;
      syncOptionButtons();
      renderPreview();
    });
    sizeBox.append(btn);
  }
  const styleBox = $('style-options');
  for (const [id, def] of Object.entries(ART_STYLES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.dataset.value = id;
    btn.innerHTML = `<b>${def.label}</b><span>${def.hint}</span>`;
    btn.addEventListener('click', () => {
      state.artStyle = id;
      syncOptionButtons();
      renderPreview();
    });
    styleBox.append(btn);
  }
}

function syncOptionButtons() {
  for (const box of ['layout-options', 'grade-options', 'size-options', 'style-options']) {
    const key = box === 'layout-options' ? state.layout
      : box === 'grade-options' ? state.grade
      : box === 'size-options' ? state.size : state.artStyle;
    $(box).querySelectorAll('.opt').forEach((b) => {
      b.classList.toggle('active', b.dataset.value === key);
    });
  }
}

function syncPanelControls() {
  const panel = state.panels[state.selected] || blankPanel();
  $('zoom').value = panel.zoom;
  $('zoom-out').textContent = `${Math.round(panel.zoom * 100)}%`;
  buildTray();
}

// Refresh every control from state (used after a shot scene sets state).
function syncUI() {
  syncOptionButtons();
  syncPanelControls();
}

// ---- export ---------------------------------------------------------------

function renderExportCanvas(sizeId) {
  const def = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  const canvas = document.createElement('canvas');
  canvas.width = def.w;
  canvas.height = def.h;
  const ctx = canvas.getContext('2d');
  const photos = new Map([...state.photos].map(([id, p]) => [id, p.img]));
  drawCover(ctx, { ...state, photos }, def.w, def.h);
  return { canvas, def };
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    }, 'image/png');
  });
}

async function exportOne(sizeId) {
  const { canvas, def } = renderExportCanvas(sizeId);
  await downloadCanvas(canvas, `sunset-cover-${def.id}.png`);
  return def;
}

async function exportAll() {
  const btn = $('export-all');
  btn.disabled = true;
  btn.textContent = 'Exporting…';
  try {
    for (const def of EXPORT_SIZES) {
      await exportOne(def.id);
      await new Promise((r) => setTimeout(r, 350));
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Export all 3 sizes';
  }
}

// ---- stage pointer: select, pan, zoom -------------------------------------

function stagePoint(evt) {
  const box = stage.getBoundingClientRect();
  return {
    x: (evt.clientX - box.left) * (stage.width / box.width),
    y: (evt.clientY - box.top) * (stage.height / box.height),
  };
}

function panelAt(point) {
  const rects = slotRects(state, stage.width, stage.height);
  return rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
}

let drag = null;
stage.addEventListener('pointerdown', (evt) => {
  const point = stagePoint(evt);
  const idx = panelAt(point);
  if (idx < 0) return;
  state.selected = idx;
  syncPanelControls();
  renderPreview();
  const panel = state.panels[idx];
  const rects = slotRects(state, stage.width, stage.height);
  const rect = rects[idx];
  const img = panel.photoId ? state.photos.get(panel.photoId)?.img : null;
  if (!img) return;
  const zoom = Math.max(1, panel.zoom || 1);
  const scale = Math.max(rect.w / img.width, rect.h / img.height) * zoom;
  const maxX = Math.max(0, (img.width * scale - rect.w) / 2);
  const maxY = Math.max(0, (img.height * scale - rect.h) / 2);
  drag = { idx, startX: point.x, startY: point.y, panX: panel.panX, panY: panel.panY, maxX, maxY };
  stage.setPointerCapture(evt.pointerId);
});
stage.addEventListener('pointermove', (evt) => {
  if (!drag) return;
  const point = stagePoint(evt);
  const panel = state.panels[drag.idx];
  const dx = point.x - drag.startX;
  const dy = point.y - drag.startY;
  panel.panX = drag.maxX ? Math.max(-1, Math.min(1, drag.panX + dx / drag.maxX)) : 0;
  panel.panY = drag.maxY ? Math.max(-1, Math.min(1, drag.panY + dy / drag.maxY)) : 0;
  renderPreview();
});
stage.addEventListener('pointerup', () => { drag = null; });
stage.addEventListener('wheel', (evt) => {
  evt.preventDefault();
  const point = stagePoint(evt);
  const idx = panelAt(point);
  if (idx < 0) return;
  const panel = state.panels[idx];
  panel.zoom = Math.max(1, Math.min(3, (panel.zoom || 1) * (evt.deltaY < 0 ? 1.12 : 1 / 1.12)));
  state.selected = idx;
  syncPanelControls();
  renderPreview();
}, { passive: false });

// ---- wire the controls -----------------------------------------------------

function wireControls() {
  $('add-photos').addEventListener('click', () => $('file-input').click());
  $('file-input').addEventListener('change', async (evt) => {
    for (const file of evt.target.files) {
      try { await loadPhotoFile(file); } catch (err) { alert(err.message); }
    }
    evt.target.value = '';
  });
  $('sample-pier').addEventListener('click', () => loadSample('pier').catch((e) => alert(e.message)));
  $('sample-boulevard').addEventListener('click', () => loadSample('boulevard').catch((e) => alert(e.message)));
  $('fill-all').addEventListener('click', () => {
    const pid = state.panels[state.selected]?.photoId;
    if (!pid) return;
    state.panels.forEach((p) => { p.photoId = pid; });
    const { w, h } = previewSize();
    cropPanels(state, w, h);
    renderPreview();
  });
  $('zoom').addEventListener('input', (evt) => {
    const panel = state.panels[state.selected];
    if (!panel) return;
    panel.zoom = Number(evt.target.value);
    $('zoom-out').textContent = `${Math.round(panel.zoom * 100)}%`;
    renderPreview();
  });
  $('reset-panel').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    if (!panel) return;
    panel.zoom = 1;
    panel.panX = 0;
    panel.panY = 0;
    syncPanelControls();
    renderPreview();
  });
  $('grade-strength').addEventListener('input', (evt) => {
    state.gradeStrength = Number(evt.target.value);
    $('grade-out').textContent = `${Math.round(state.gradeStrength * 100)}%`;
    renderPreview();
  });
  $('title').addEventListener('input', (evt) => { state.title = evt.target.value; renderPreview(); });
  $('subtitle').addEventListener('input', (evt) => { state.subtitle = evt.target.value; renderPreview(); });
  $('tagline').addEventListener('input', (evt) => { state.tagline = evt.target.value; renderPreview(); });
  $('badge').addEventListener('change', (evt) => { state.badge = evt.target.checked; renderPreview(); });
  $('title-size').addEventListener('input', (evt) => {
    state.titleSize = Number(evt.target.value);
    $('title-size-out').textContent = `${Math.round(state.titleSize * 100)}%`;
    renderPreview();
  });
  $('title-pos').addEventListener('change', (evt) => { state.titlePos = evt.target.value; renderPreview(); });
  $('title-color').addEventListener('change', (evt) => { state.titleColor = evt.target.value; renderPreview(); });
  $('export-one').addEventListener('click', () => exportOne(state.size));
  $('export-all').addEventListener('click', () => exportAll());

  // Drag and drop anywhere on the page.
  window.addEventListener('dragover', (evt) => evt.preventDefault());
  window.addEventListener('drop', async (evt) => {
    evt.preventDefault();
    for (const file of evt.dataTransfer.files) {
      if (!file.type.startsWith('image/')) continue;
      try { await loadPhotoFile(file); } catch (err) { alert(err.message); }
    }
  });
}

// ---- boot ------------------------------------------------------------------

async function boot() {
  buildOptionButtons();
  wireControls();
  syncOptionButtons();
  syncPanelControls();
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) {
    await runShot(query.get('shot'), query, { state, addPhoto, loadSample, renderPreview, exportOne, syncUI });
    return;
  }
  // First run: load both sample photos so the cover is alive immediately,
  // then fill every panel with varied crops of the hero photo.
  try {
    await loadSample('boulevard');
    await loadSample('pier');
    autoFillAll();
  } catch (_) { /* samples are a bonus; the app works without them */ }
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.load('40px Pacifico');
  } catch (_) { /* fallback fonts */ }
  renderPreview();
  try { await document.fonts.ready; renderPreview(); } catch (_) { /* already painted */ }
}

boot();
