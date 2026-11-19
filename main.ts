// Sunset Cover Studio — platform entrypoint.
//
// The studio is a static web app: `app/index.html` is the editor and
// `app/src/main.js` boots it. This file is the entrypoint the make.fun
// platform loads — it pulls the editor in for its side effect (the
// editor wires its own controls and renders the stage) and publishes
// the studio's metadata for the harness.

import './app/src/main.js';

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
  version: '4.0.0',
  competition: 'gta6-cover-art-01',
  layouts: ['poster', 'nineup', 'heroleft', 'titleband'],
  styles: ['original', 'comic', 'halftone', 'neon'],
  grades: ['sunset', 'dusk', 'vice', 'golden', 'neonpink', 'midnight'],
  exportSizes: ['1080x1080', '1080x1350', '1920x1080'],
};

// The editor exposes itself on window.SunsetCover once it has loaded
// its photos and fonts; the harness can call exportPNG from there.
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
