// Sunset Cover Studio — editor bootstrap, state and wiring.
//
// The editor keeps one small state object. Every change re-renders the
// stage canvas through renderCover, so what you see is exactly what an
// export draws. The app is fully offline: fonts and photos are local.

import {
  LAYOUTS,
  STYLES,
  GRADES,
  renderCover,
  computeLayout,
  panelCount,
} from './render.js';
import { SHOTS, DEFAULT_SHOT_ID } from './shots.js';

const DEFAULT_TEXT = {
  title: 'SUNSET HEIST',
  subtitle: 'Ocean Drive',
  eyebrow: 'WELCOME TO VICE CITY',
  tagline: 'ONE CITY, EVERY LIGHT TELLS A STORY',
};

const EXPORT_SIZES = [
  { id: '1080x1080', label: '1080 x 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: '1080 x 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: '1920 x 1080', w: 1920, h: 1080 },
];

const state = {
  layout: 'poster',
  style: 'original',
  grade: 'sunset',
  title: DEFAULT_TEXT.title,
  subtitle: DEFAULT_TEXT.subtitle,
  eyebrow: DEFAULT_TEXT.eyebrow,
  tagline: DEFAULT_TEXT.tagline,
  panels: [],
  selected: 0,
};

const images = {};
let stage = null;
let photoRects = [];

// ------------------------------------------------------------ setup

function freshPanels() {
  const n = panelCount(state.layout, 1280, 720);
  state.panels = [];
  for (let i = 0; i < n; i++) {
    state.panels.push({ shot: DEFAULT_SHOT_ID, zoom: 1.0, dx: 0, dy: 0 });
  }
  state.selected = 0;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function loadAssets() {
  const jobs = SHOTS.map(async (shot) => {
    images[shot.id] = await loadImage(shot.src);
  });
  // Vendored display fonts — the canvas needs them loaded before it
  // can draw the title, so wait for them explicitly.
  const fonts = [];
  if (document.fonts && document.fonts.load) {
    fonts.push(document.fonts.load('100px Anton'));
    fonts.push(document.fonts.load('100px Pacifico'));
    fonts.push(document.fonts.ready);
  }
  await Promise.all([...jobs, ...fonts]);
}

// ------------------------------------------------------------ rendering

function stageSize() {
  // Keep the preview near 960px on its long edge, matching the layout.
  if (state.layout === 'nineup') return { w: 768, h: 960 };
  if (state.layout === 'titleband') return { w: 880, h: 880 };
  return { w: 960, h: 540 };
}

function render() {
  if (!stage) return;
  const size = stageSize();
  if (stage.width !== size.w || stage.height !== size.h) {
    stage.width = size.w;
    stage.height = size.h;
  }
  photoRects = computeLayout(state.layout, stage.width, stage.height).photos;
  renderCover(stage, state, images);
  stage.dataset.rendered = '1';
  syncActiveStates();
  syncPanelControls();
}

// Keep the picker buttons in sync when state changes without a click
// (for example when the layout is set from the console or a test).
function syncActiveStates() {
  const mark = (selector, current) => {
    document.querySelectorAll(selector).forEach((b) => {
      b.classList.toggle('active', b.dataset.id === current);
    });
  };
  mark('#layout-row .pick', state.layout);
  mark('#style-row .pick', state.style);
  mark('#grade-row .swatch', state.grade);
}

// Render a cover at an exact export size and return a PNG data URL.
// The Playwright check calls this to verify export sizes by PNG header.
async function exportPNG(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  renderCover(off, state, images);
  return off.toDataURL('image/png');
}

function downloadExport(w, h, label) {
  exportPNG(w, h).then((url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunset-cover-' + label + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

// ------------------------------------------------------------ controls

function el(id) {
  return document.getElementById(id);
}

function buttonRow(container, items, current, onPick) {
  container.innerHTML = '';
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = item.id;
    b.className = 'pick' + (item.id === current ? ' active' : '');
    b.textContent = item.label;
    b.addEventListener('click', () => onPick(item.id));
    container.appendChild(b);
  });
}

function buildControls() {
  buttonRow(el('layout-row'), LAYOUTS, state.layout, (id) => {
    state.layout = id;
    freshPanels();
    buildControls();
    render();
  });
  buttonRow(el('style-row'), STYLES, state.style, (id) => {
    state.style = id;
    buildControls();
    render();
  });

  const gradeRow = el('grade-row');
  gradeRow.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = g.id;
    b.className = 'swatch' + (g.id === state.grade ? ' active' : '');
    b.style.background =
      'linear-gradient(135deg,' + g.wash[0] + ',' + g.wash[1] + ')';
    b.title = g.label;
    b.setAttribute('aria-label', g.label);
    b.addEventListener('click', () => {
      state.grade = g.id;
      buildControls();
      render();
    });
    gradeRow.appendChild(b);
  });

  // Sample tray: one thumbnail per bundled photo.
  const tray = el('tray');
  tray.innerHTML = '';
  SHOTS.forEach((shot) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    const img = document.createElement('img');
    img.src = shot.src;
    img.alt = shot.label;
    b.appendChild(img);
    const cap = document.createElement('span');
    cap.textContent = shot.label;
    b.appendChild(cap);
    b.addEventListener('click', () => {
      state.panels[state.selected].shot = shot.id;
      render();
    });
    tray.appendChild(b);
  });

  // Export buttons.
  const exp = el('export-row');
  exp.innerHTML = '';
  EXPORT_SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'export';
    b.textContent = 'PNG ' + s.label;
    b.addEventListener('click', () => downloadExport(s.w, s.h, s.id));
    exp.appendChild(b);
  });
}

function syncPanelControls() {
  const panel = state.panels[state.selected];
  if (!panel) return;
  const zoom = el('zoom');
  const panX = el('panx');
  const panY = el('pany');
  if (zoom) zoom.value = String(panel.zoom);
  if (panX) panX.value = String(panel.dx);
  if (panY) panY.value = String(panel.dy);
  const label = el('panel-label');
  if (label) {
    label.textContent =
      'Panel ' + (state.selected + 1) + ' of ' + state.panels.length;
  }
}

function bindPanelControls() {
  const zoom = el('zoom');
  const panX = el('panx');
  const panY = el('pany');
  if (zoom) {
    zoom.addEventListener('input', () => {
      state.panels[state.selected].zoom = parseFloat(zoom.value);
      render();
    });
  }
  if (panX) {
    panX.addEventListener('input', () => {
      state.panels[state.selected].dx = parseFloat(panX.value);
      render();
    });
  }
  if (panY) {
    panY.addEventListener('input', () => {
      state.panels[state.selected].dy = parseFloat(panY.value);
      render();
    });
  }
  const fill = el('fill-all');
  if (fill) {
    fill.addEventListener('click', () => {
      state.panels.forEach((p) => {
        p.shot = DEFAULT_SHOT_ID;
        p.zoom = 1.0;
        p.dx = 0;
        p.dy = 0;
      });
      render();
    });
  }
  const prev = el('panel-prev');
  const next = el('panel-next');
  if (prev) {
    prev.addEventListener('click', () => {
      state.selected =
        (state.selected - 1 + state.panels.length) % state.panels.length;
      render();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      state.selected = (state.selected + 1) % state.panels.length;
      render();
    });
  }
}

function bindTextInputs() {
  ['title', 'subtitle', 'eyebrow', 'tagline'].forEach((key) => {
    const input = el('in-' + key);
    if (!input) return;
    input.value = state[key];
    input.addEventListener('input', () => {
      state[key] = input.value || DEFAULT_TEXT[key];
      render();
    });
  });
}

// Click a panel on the stage to select it for the crop controls.
function bindStagePick() {
  stage.addEventListener('click', (ev) => {
    const r = stage.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * stage.width;
    const py = ((ev.clientY - r.top) / r.height) * stage.height;
    for (let i = 0; i < photoRects.length; i++) {
      const p = photoRects[i];
      if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) {
        state.selected = i;
        render();
        return;
      }
    }
  });
}

// ------------------------------------------------------------ boot

async function init() {
  stage = el('stage');
  freshPanels();
  buildControls();
  bindPanelControls();
  bindTextInputs();
  bindStagePick();
  await loadAssets();
  render();
  window.SunsetCover = {
    state,
    render,
    exportPNG,
    sizes: EXPORT_SIZES,
  };
}

init().catch((err) => {
  console.error('Sunset Cover Studio failed to start:', err);
  const stageEl = document.getElementById('stage');
  if (stageEl) stageEl.dataset.error = String(err && err.message ? err.message : err);
});
