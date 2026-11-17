// Pure location-tree helpers. The demo tree lives in mocks/seed (P06.2) and
// is replaced by a real table in P18. Names are i18n keys, never literal text.
import { seedLocations, type SeedLocation } from '../../../mocks/seed/locations';

export type { LocationLevel, SeedLocation } from '../../../mocks/seed/locations';

const BY_ID = new Map<string, SeedLocation>(seedLocations.map((l) => [l.id, l]));

export function childrenOf(parentId: string | null): readonly SeedLocation[] {
  return seedLocations.filter((l) => l.parentId === parentId);
}

export function locationById(id: string | null | undefined): SeedLocation | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}

/** Root -> leaf chain for any node id. Empty when the id is unknown. */
export function locationChain(id: string | null | undefined): readonly SeedLocation[] {
  const chain: SeedLocation[] = [];
  let current = locationById(id);
  let guard = 0;
  while (current && guard < 8) {
    chain.unshift(current);
    current = locationById(current.parentId);
    guard += 1;
  }
  return chain;
}

export interface CascadeSelection {
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly areaId: string | null;
}

/** Splits a stored leaf id back into the three cascade levels. */
export function selectionFromId(id: string | null | undefined): CascadeSelection {
  const chain = locationChain(id);
  const governorate = chain.find((l) => l.level === 'governorate') ?? null;
  const district = chain.find((l) => l.level === 'district') ?? null;
  const area = chain.find((l) => l.level === 'area') ?? null;
  return {
    governorateId: governorate?.id ?? null,
    districtId: district?.id ?? null,
    areaId: area?.id ?? null,
  };
}

/** Deepest selected id — this is what Profile.city stores. */
export function deepestId(selection: CascadeSelection): string | null {
  return selection.areaId ?? selection.districtId ?? selection.governorateId ?? null;
}

export function isValidChain(selection: CascadeSelection): boolean {
  const governorate = locationById(selection.governorateId);
  if (!governorate || governorate.level !== 'governorate') return false;
  const district = locationById(selection.districtId);
  if (!district || district.parentId !== governorate.id) return false;
  if (selection.areaId === null) return true;
  const area = locationById(selection.areaId);
  return !!area && area.parentId === district.id;
}
