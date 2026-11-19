// Sample photographs bundled with Sunset Cover Studio.
//
// Each shot carries a focus point (fx, fy, both 0..1) — the spot the
// face-safe crop keeps near the centre of any panel that shows it.
// The boulevard hero is the only subject a cover shows by default;
// the pier stays in the tray as a second sample for the user to pick.

export const SHOTS = [
  {
    id: 'boulevard',
    label: 'Boulevard Hero',
    src: 'samples/boulevard.jpg',
    // The subject's face sits just above the middle of the frame.
    focus: { x: 0.52, y: 0.26 },
  },
  {
    id: 'pier',
    label: 'Sunset Pier',
    src: 'samples/pier.jpg',
    // The pier's vanishing point, where the eye is drawn.
    focus: { x: 0.55, y: 0.45 },
  },
];

export const DEFAULT_SHOT_ID = 'boulevard';

export function shotById(id) {
  return SHOTS.find((s) => s.id === id) || SHOTS[0];
}
