// Motion tokens. Every duration is subject to useMotion().duration()
// which returns 0 when Reduce Motion is enabled.

export const durations = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 360,
  extraSlow: 560,
} as const;

export const easings = {
  // Bezier arrays compatible with Reanimated's Easing.bezier.
  standard: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
} as const;

export const springs = {
  gentle: { damping: 20, stiffness: 120, mass: 1 } as const,
  bouncy: { damping: 12, stiffness: 180, mass: 1 } as const,
} as const;

export type Durations = typeof durations;
export type Easings = typeof easings;
export type Springs = typeof springs;
