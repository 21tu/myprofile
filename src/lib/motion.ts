// Durations are seconds for Motion; CSS uses the equivalent milliseconds.
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;
export const durations = {
  button: 0.2,
  card: 0.3,
  reveal: 0.6,
  text: 0.7,
} as const;
export const reveal = { distance: 24, duration: durations.reveal } as const;
export const stagger = 0.06;
export const magnetic = {
  max: 14,
  spring: { stiffness: 260, damping: 18, mass: 0.6 },
} as const;
