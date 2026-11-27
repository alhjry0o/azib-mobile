// Pure 7×3 availability grid. No Date, no timezone, no locale.
export const AVAILABILITY_DAYS = 7;
export const AVAILABILITY_SLOTS = 3;
export const AVAILABILITY_CELLS = AVAILABILITY_DAYS * AVAILABILITY_SLOTS;

export type AvailabilityGrid = readonly boolean[];

export const AVAILABILITY_SLOT_KEYS = ['morning', 'afternoon', 'evening'] as const;
export type AvailabilitySlotKey = (typeof AVAILABILITY_SLOT_KEYS)[number];

export function emptyAvailability(): AvailabilityGrid {
  return Object.freeze(Array.from({ length: AVAILABILITY_CELLS }, () => false));
}

export function isValidAvailability(value: unknown): value is AvailabilityGrid {
  return (
    Array.isArray(value) &&
    value.length === AVAILABILITY_CELLS &&
    value.every((cell) => typeof cell === 'boolean')
  );
}

export function cellIndex(day: number, slot: number): number | null {
  if (!Number.isInteger(day) || !Number.isInteger(slot)) return null;
  if (day < 0 || day >= AVAILABILITY_DAYS) return null;
  if (slot < 0 || slot >= AVAILABILITY_SLOTS) return null;
  return day * AVAILABILITY_SLOTS + slot;
}

export function daySlotOf(index: number): { day: number; slot: number } | null {
  if (!Number.isInteger(index) || index < 0 || index >= AVAILABILITY_CELLS) return null;
  return { day: Math.floor(index / AVAILABILITY_SLOTS), slot: index % AVAILABILITY_SLOTS };
}

export function toggleCell(grid: AvailabilityGrid, index: number): AvailabilityGrid {
  if (!isValidAvailability(grid)) return emptyAvailability();
  if (!Number.isInteger(index) || index < 0 || index >= AVAILABILITY_CELLS) return grid;
  return Object.freeze(grid.map((cell, i) => (i === index ? !cell : cell)));
}

export function countAvailable(grid: AvailabilityGrid): number {
  if (!isValidAvailability(grid)) return 0;
  return grid.reduce((sum, cell) => (cell ? sum + 1 : sum), 0);
}

export function normalizeAvailability(value: unknown): AvailabilityGrid {
  return isValidAvailability(value) ? Object.freeze([...value]) : emptyAvailability();
}
