// Demo location tree for Yemen (P06.2).
// Names are i18n keys (profile:locations.*), never literal text — same
// convention as the rest of the seed framework.
// Every row is demo data awaiting human verification before real use.
export type LocationLevel = 'governorate' | 'district' | 'area';

export interface SeedLocation {
  readonly id: string;
  readonly parentId: string | null;
  readonly level: LocationLevel;
  readonly nameKey: string;
  readonly dataOrigin: 'demo';
  readonly verificationStatus: 'pending-human-review';
}

function row(id: string, parentId: string | null, level: LocationLevel): SeedLocation {
  return {
    id,
    parentId,
    level,
    nameKey: `profile:locations.${id}`,
    dataOrigin: 'demo',
    verificationStatus: 'pending-human-review',
  };
}

export const seedLocations: readonly SeedLocation[] = [
  row('sanaa', null, 'governorate'),
  row('aden', null, 'governorate'),
  row('taiz', null, 'governorate'),
  row('hodeidah', null, 'governorate'),
  row('ibb', null, 'governorate'),
  row('dhamar', null, 'governorate'),

  row('maeen', 'sanaa', 'district'),
  row('sabain', 'sanaa', 'district'),
  row('thawra', 'sanaa', 'district'),
  row('shuaub', 'sanaa', 'district'),
  row('azal', 'sanaa', 'district'),
  row('khormaksar', 'aden', 'district'),
  row('qahira', 'taiz', 'district'),
  row('hawak', 'hodeidah', 'district'),
  row('ibb-city', 'ibb', 'district'),
  row('dhamar-city', 'dhamar', 'district'),

  row('hadda', 'maeen', 'area'),
  row('shumaila', 'maeen', 'area'),
  row('hasaba', 'sabain', 'area'),
  row('hurriya', 'thawra', 'area'),
  row('jeruf', 'shuaub', 'area'),
  row('bab-salam', 'azal', 'area'),
  row('khormaksar-1', 'khormaksar', 'area'),
] as const;
