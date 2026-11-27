import {
  AVAILABILITY_CELLS,
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
  cellIndex,
  countAvailable,
  daySlotOf,
  emptyAvailability,
  isValidAvailability,
  normalizeAvailability,
  toggleCell,
} from '../index';

describe('availability grid (7×3, pure)', () => {
  it('is exactly 21 boolean cells', () => {
    expect(AVAILABILITY_DAYS).toBe(7);
    expect(AVAILABILITY_SLOTS).toBe(3);
    expect(AVAILABILITY_CELLS).toBe(21);
    const grid = emptyAvailability();
    expect(grid.length).toBe(21);
    expect(isValidAvailability(grid)).toBe(true);
    expect(countAvailable(grid)).toBe(0);
  });

  it('maps day/slot to index and back', () => {
    expect(cellIndex(0, 0)).toBe(0);
    expect(cellIndex(1, 0)).toBe(3);
    expect(cellIndex(6, 2)).toBe(20);
    expect(cellIndex(7, 0)).toBeNull();
    expect(cellIndex(0, 3)).toBeNull();
    expect(cellIndex(1.5, 0)).toBeNull();
    expect(daySlotOf(20)).toEqual({ day: 6, slot: 2 });
    expect(daySlotOf(21)).toBeNull();
    expect(daySlotOf(-1)).toBeNull();
  });

  it('toggles a single cell immutably and ignores out-of-range indexes', () => {
    const grid = emptyAvailability();
    const next = toggleCell(grid, 5);
    expect(countAvailable(next)).toBe(1);
    expect(next[5]).toBe(true);
    expect(grid[5]).toBe(false);
    expect(toggleCell(next, 5)).toEqual(grid);
    expect(toggleCell(grid, 99)).toEqual(grid);
    expect(toggleCell(grid, -1)).toEqual(grid);
  });

  it('rejects malformed grids and normalises them honestly', () => {
    expect(isValidAvailability([])).toBe(false);
    expect(isValidAvailability(Array.from({ length: 20 }, () => false))).toBe(false);
    expect(isValidAvailability(Array.from({ length: 21 }, () => 'yes'))).toBe(false);
    expect(isValidAvailability(null)).toBe(false);
    expect(countAvailable([true, true])).toBe(0);
    expect(normalizeAvailability('nope').length).toBe(21);
    expect(countAvailable(normalizeAvailability('nope'))).toBe(0);
  });
});
