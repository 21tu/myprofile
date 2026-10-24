export const characterAnimations = {
  spring: { stiffness: 200, damping: 20 },
  blink: { min: 2500, max: 6000, duration: 120 },
  track: { eyes: 6, head: 6, idle: 1500 },
  breathing: 4,
  sway: 6,
  reactions: ['jump', 'spin', 'surprised', 'wave'],
  durations: { jump: 600, spin: 700, surprised: 500, wave: 700 },
} as const;
export type Reaction = (typeof characterAnimations.reactions)[number];
