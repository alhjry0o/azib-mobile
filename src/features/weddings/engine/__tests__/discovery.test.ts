import type { Wedding } from '@/repositories/contracts/wedding';
import { DEFAULT_DISCOVERY_FILTERS, filterGroups, hasActiveFilters } from '../discovery';

function wedding(patch: Partial<Wedding> = {}): Wedding {
  return {
    id: 'w1',
    titleKey: 'weddings:custom.title',
    scheduledDate: '2026-06-15T16:00:00.000Z',
    capacity: 8,
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataOrigin: 'demo',
    governorateId: 'sanaa',
    districtId: 'maeen',
    ...patch,
  };
}

const rows = [
  { wedding: wedding(), memberCount: 3 },
  { wedding: wedding({ id: 'w2', governorateId: 'aden', districtId: 'khormaksar' }), memberCount: 9 },
  { wedding: wedding({ id: 'w3', status: 'cancelled' }), memberCount: 2 },
  { wedding: wedding({ id: 'w4', status: 'draft' }), memberCount: 2 },
];

describe('discovery filtering', () => {
  it('hides cancelled and draft groups by default', () => {
    const result = filterGroups(rows, DEFAULT_DISCOVERY_FILTERS);
    expect(result.map((r) => r.wedding.id)).toEqual(['w1', 'w2']);
  });

  it('filters by governorate and district', () => {
    const result = filterGroups(rows, { ...DEFAULT_DISCOVERY_FILTERS, governorateId: 'aden' });
    expect(result.map((r) => r.wedding.id)).toEqual(['w2']);
    const none = filterGroups(rows, { ...DEFAULT_DISCOVERY_FILTERS, districtId: 'nowhere' });
    expect(none).toEqual([]);
  });

  it('filters by size bucket and month', () => {
    expect(
      filterGroups(rows, { ...DEFAULT_DISCOVERY_FILTERS, size: 'large' }).map((r) => r.wedding.id),
    ).toEqual(['w2']);
    expect(
      filterGroups(rows, { ...DEFAULT_DISCOVERY_FILTERS, month: '2026-06' }).length,
    ).toBe(2);
    expect(filterGroups(rows, { ...DEFAULT_DISCOVERY_FILTERS, month: '2026-07' })).toEqual([]);
  });

  it('filters by workflow status including the legacy alias', () => {
    const planning = [
      { wedding: wedding({ id: 'p1', status: 'closed' }), memberCount: 3 },
    ];
    expect(
      filterGroups(planning, { ...DEFAULT_DISCOVERY_FILTERS, status: 'planning' }).length,
    ).toBe(1);
  });

  it('reports whether any filter is active', () => {
    expect(hasActiveFilters(DEFAULT_DISCOVERY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_DISCOVERY_FILTERS, size: 'small' })).toBe(true);
  });
});
