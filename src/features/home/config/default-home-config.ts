// Pure defaults + normalizers. No React, no IO — fully unit-testable.
import {
  HOME_QUICK_ACTION_IDS,
  HOME_SECTION_IDS,
  type HomeConfig,
  type HomeQuickActionId,
  type HomeSectionId,
} from './home-config.types';

export const DEFAULT_HOME_CONFIG: HomeConfig = Object.freeze({
  sections: HOME_SECTION_IDS,
  hiddenSections: Object.freeze([]) as readonly HomeSectionId[],
  hiddenQuickActions: Object.freeze([]) as readonly HomeQuickActionId[],
});

function isSectionId(value: string): value is HomeSectionId {
  return (HOME_SECTION_IDS as readonly string[]).includes(value);
}

/** Drops unknown/duplicate ids and appends any missing known id, preserving order. */
export function normalizeOrder(input: readonly string[]): readonly HomeSectionId[] {
  const seen: HomeSectionId[] = [];
  for (const value of input) {
    if (!isSectionId(value)) continue;
    if (seen.includes(value)) continue;
    seen.push(value);
  }
  for (const id of HOME_SECTION_IDS) {
    if (!seen.includes(id)) seen.push(id);
  }
  return seen;
}

export function hiddenFromMap(map: Readonly<Record<string, boolean>>): readonly HomeSectionId[] {
  return HOME_SECTION_IDS.filter((id) => map[id] === false);
}

export function hiddenQuickActionsFromMap(
  map: Readonly<Record<string, boolean>>,
): readonly HomeQuickActionId[] {
  return HOME_QUICK_ACTION_IDS.filter((id) => map[id] === false);
}

/** Moves an id by delta inside a list; returns the same list when out of range. */
export function moveInList<T>(list: readonly T[], id: T, delta: number): readonly T[] {
  const from = list.indexOf(id);
  if (from < 0) return list;
  const to = from + delta;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const moved = next[from];
  const target = next[to];
  if (moved === undefined || target === undefined) return list;
  next[from] = target;
  next[to] = moved;
  return next;
}
