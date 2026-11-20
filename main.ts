// Sunset Cover Studio — gta6-cover-art-01 entrypoint (Node 22).
//
// The studio is a static web app: `app/index.html` is the editor and
// `app/src/main.js` boots it in the browser, loaded by the <script> tag
// in index.html. This file is the entrypoint the make.fun grader runs
// as `node /bot/main.ts` in a DOM-less Node environment, so it must NOT
// import the browser editor at module load: the editor touches
// `document` at import time and would crash the graded run with
// "ReferenceError: document is not defined" (that is what killed v6).
// Instead this file hands the deliverable in: it copies app/ and
// screenshots/ into the output directory and writes dossier.json with
// the vendored make.fun library, so the judge reads exactly what is
// handed in. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

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
  version: '4.2.0',
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

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty: the dossier text budget, at
// most four screenshots of at most 256 KiB, and app/ within 993 files
// / 48 MiB.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn(folder: string): number {
  const from = join(repoRoot, folder);
  const to = join(outputDir, folder);
  if (!existsSync(from)) return 0;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  return readdirSync(from).length;
}

mkdirSync(outputDir, { recursive: true });
const appEntries = handIn('app');
const shotEntries = handIn('screenshots');
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierCaps));
console.log(`sunset-cover-studio: handed in ${appEntries} app entries and ${shotEntries} screenshots`);
