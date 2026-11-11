// 4pt spacing scale.

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  11: 64,
  12: 80,
} as const;

export type Spacing = typeof spacing;
export type SpacingToken = keyof Spacing;

export const MIN_TOUCH_TARGET = 44;
