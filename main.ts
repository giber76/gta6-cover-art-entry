// Sunset Cover Studio — gta6-cover-art-01 entry program (Node 22, standard
// library only). It hands the app in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes /output/dossier.json
// with the vendored make.fun library, so the judge reads exactly what is
// handed in. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty: the dossier text budget, at most
// four screenshots of at most 256 KiB, and app/ within 993 files / 48 MiB.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn(folder) {
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
