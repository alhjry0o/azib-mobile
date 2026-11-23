// Pure discovery filtering. Public rows never carry member identities.
import type { Wedding } from '@/repositories/contracts/wedding';
import { toGroupStatus } from '../state/group-machine';
import { sizeBucket, type GroupSizeBucket } from '../config/limits';

export type DiscoveryStatusFilter = 'any' | 'open' | 'planning' | 'agreed';
export type DiscoverySizeFilter = 'any' | GroupSizeBucket;

export interface DiscoveryFilters {
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly status: DiscoveryStatusFilter;
  readonly size: DiscoverySizeFilter;
  /** 'YYYY-MM' or null. */
  readonly month: string | null;
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = Object.freeze({
  governorateId: null,
  districtId: null,
  status: 'any',
  size: 'any',
  month: null,
});

export interface DiscoveryRow {
  readonly wedding: Wedding;
  readonly memberCount: number;
}

export function filterGroups(
  rows: readonly DiscoveryRow[],
  filters: DiscoveryFilters,
): readonly DiscoveryRow[] {
  return rows.filter((row) => {
    const { wedding } = row;
    const status = toGroupStatus(wedding.status);
    if (status === 'cancelled' || status === 'draft') return false;
    if (filters.status !== 'any' && status !== filters.status) return false;
    if (filters.governorateId && wedding.governorateId !== filters.governorateId) return false;
    if (filters.districtId && wedding.districtId !== filters.districtId) return false;
    if (filters.size !== 'any' && sizeBucket(row.memberCount) !== filters.size) return false;
    if (filters.month && wedding.scheduledDate.slice(0, 7) !== filters.month) return false;
    return true;
  });
}

export function hasActiveFilters(filters: DiscoveryFilters): boolean {
  return (
    filters.governorateId !== null ||
    filters.districtId !== null ||
    filters.status !== 'any' ||
    filters.size !== 'any' ||
    filters.month !== null
  );
}
