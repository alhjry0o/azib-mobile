// Small pure date helpers used by CalendarModal and DatePicker.
// Avoid adding a date library; these cover the calendar grid needs only.

export function startOfDay(input: Date): Date {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function addMonths(input: Date, delta: number): Date {
  return new Date(input.getFullYear(), input.getMonth() + delta, 1);
}

export function getDaysInMonth(year: number, month: number): number {
  // month is 0-based (matches Date API)
  return new Date(year, month + 1, 0).getDate();
}

export interface CalendarCell {
  /** ISO date string (yyyy-mm-dd); null for padding cells. */
  readonly iso: string | null;
  readonly day: number | null;
  readonly isCurrentMonth: boolean;
}

/**
 * Builds a 7-column calendar grid.
 * Starts on Sunday. Fills to a full number of weeks (never cuts mid-week).
 */
export function buildCalendarGrid(year: number, month: number): readonly CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = getDaysInMonth(year, month);
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i += 1) {
    const dayIndex = i - firstWeekday + 1;
    if (dayIndex < 1 || dayIndex > daysInMonth) {
      cells.push({ iso: null, day: null, isCurrentMonth: false });
    } else {
      const date = new Date(year, month, dayIndex);
      const iso = `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      cells.push({ iso, day: dayIndex, isCurrentMonth: true });
    }
  }
  return cells;
}

export function toIsoDay(date: Date): string {
  return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}
