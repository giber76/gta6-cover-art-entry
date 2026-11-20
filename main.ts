// Sunset Cover Studio — platform entrypoint (Node-safe).
//
// The studio is a static web app: `app/index.html` is the editor and
// `app/src/main.js` boots it in the browser, loaded by the <script> tag
// in index.html. This file is the entrypoint the make.fun platform runs
// as `node /bot/main.ts` in a DOM-less Node environment, so it must NOT
// import the browser editor at module load: the editor touches
// `document` at import time and would crash the graded run with
// "ReferenceError: document is not defined". Instead this file publishes
// the studio's metadata for the harness and, when run directly, writes a
// dossier plus a copy of the app into MAKEFUN_OUTPUT_DIR.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CoverStudioConfig {
  name: string;
  version: string;
  competition: string;
  layouts: string[];
  styles: string[];
  grades: string[];
  exportSizes: string[];
}

export const STUDIO_CONFIG: CoverStudioConfig = {
  name: 'Sunset Cover Studio',
  version: '4.1.0',
  competition: 'gta6-cover-art-01',
  layouts: ['poster', 'nineup', 'heroleft', 'titleband'],
  styles: ['original', 'comic', 'halftone', 'neon'],
  grades: ['sunset', 'dusk', 'vice', 'golden', 'neonpink', 'midnight'],
  exportSizes: ['1080x1080', '1080x1350', '1920x1080'],
};

// The editor exposes itself on window.SunsetCover once it has loaded
// its photos and fonts; the harness can call exportPNG from there.
// In Node this is simply undefined until a browser harness sets it.
export type SunsetCoverHandle = {
  state: Record<string, unknown>;
  render: () => void;
  exportPNG: (w: number, h: number) => Promise<string>;
  sizes: { id: string; label: string; w: number; h: number }[];
};

export function studioHandle(): SunsetCoverHandle | undefined {
  return (globalThis as unknown as { SunsetCover?: SunsetCoverHandle })
    .SunsetCover;
}

export default STUDIO_CONFIG;

// --- Node dossier writer (runs only when executed directly) ---

function listFiles(dir: string, base: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = join(base, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full, rel));
    } else {
      out.push(rel);
    }
  }
  return out.sort();
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(
    process.env.MAKEFUN_OUTPUT_DIR ?? join(here, 'output'),
  );
  mkdirSync(outDir, { recursive: true });

  const appDir = join(here, 'app');
  const appFiles = existsSync(appDir) ? listFiles(appDir, 'app') : [];
  if (existsSync(appDir)) {
    cpSync(appDir, join(outDir, 'app'), { recursive: true });
  }

  const shotsDir = join(here, 'screenshots');
  const shotFiles = existsSync(shotsDir)
    ? listFiles(shotsDir, 'screenshots')
    : [];
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
  }

  const dossier = {
    name: STUDIO_CONFIG.name,
    version: STUDIO_CONFIG.version,
    competition: STUDIO_CONFIG.competition,
    layouts: STUDIO_CONFIG.layouts,
    styles: STUDIO_CONFIG.styles,
    grades: STUDIO_CONFIG.grades,
    exportSizes: STUDIO_CONFIG.exportSizes,
    entrypoint:
      'main.ts (Node-safe dossier writer; the browser editor loads via the <script> tag in app/index.html)',
    files: [...appFiles, ...shotFiles],
  };
  const dossierPath = join(outDir, 'dossier.json');
  writeFileSync(dossierPath, JSON.stringify(dossier, null, 2) + '\n', 'utf8');
  console.log(
    `Sunset Cover Studio dossier written to ${dossierPath} (${dossier.files.length} files)`,
  );
}

// Run only when executed directly (`node main.ts`), not when imported
// by a harness: in that case only the config + studioHandle exports
// are used and no file work happens.
const entryPath =
  process.argv[1] !== undefined ? resolve(process.argv[1]) : '';
if (entryPath === resolve(fileURLToPath(import.meta.url))) {
  main();
}
