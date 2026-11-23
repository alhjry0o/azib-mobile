// Group size ceiling comes from system_settings (D-5). The fallback is a
// provisional value, never an approved policy.
export const SYSTEM_SETTINGS_KEY = 'system_settings';

/** PENDING_POLICY — provisional ceiling until the owner approves one. */
export const DEFAULT_MAX_GROUP_SIZE = 12;
export const MIN_GROUP_SIZE = 2;
export const HARD_MAX_GROUP_SIZE = 100;

export function resolveMaxGroupSize(value: unknown): number {
  if (typeof value !== 'object' || value === null) return DEFAULT_MAX_GROUP_SIZE;
  const raw = (value as Record<string, unknown>).maxGroupSize;
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return DEFAULT_MAX_GROUP_SIZE;
  if (raw < MIN_GROUP_SIZE || raw > HARD_MAX_GROUP_SIZE) return DEFAULT_MAX_GROUP_SIZE;
  return raw;
}

export type GroupSizeBucket = 'small' | 'medium' | 'large';

export const SIZE_BUCKET_LIMITS = Object.freeze({ smallMax: 4, mediumMax: 8 });

export function sizeBucket(count: number): GroupSizeBucket {
  if (count <= SIZE_BUCKET_LIMITS.smallMax) return 'small';
  if (count <= SIZE_BUCKET_LIMITS.mediumMax) return 'medium';
  return 'large';
}
