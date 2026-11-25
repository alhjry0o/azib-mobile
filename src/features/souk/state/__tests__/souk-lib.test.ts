import type { SoukItem } from '@/repositories/contracts/souk';
import { SMALL_NUMBER_THRESHOLD } from '@/features/home/stats-privacy';
import {
  DEFAULT_SOUK_FILTERS,
  DEFAULT_SOUK_LIMITS,
  SOUK_CATEGORIES,
  computeSoukStats,
  detectDuplicate,
  filterItems,
  hasActiveSoukFilters,
  isItemExpired,
  itemExpiryFrom,
  resolveSoukLimits,
} from '../index';

function item(patch: Partial<SoukItem> = {}): SoukItem {
  return {
    id: 'i1',
    titleKey: 'marketplace:souk.customItem',
    category: 'furniture',
    status: 'available',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    dataOrigin: 'demo',
    title: 'Bedroom set',
    condition: 'good',
    deliveryMethod: 'self_pickup',
    governorateId: 'sanaa',
    donorId: 'donor-1',
    estimatedValue: 10000,
    ...patch,
  };
}

describe('souk filters', () => {
  const rows = [
    item(),
    item({ id: 'i2', category: 'textiles', governorateId: 'aden', condition: 'new' }),
    item({ id: 'i3', status: 'draft' }),
    item({ id: 'i4', status: 'handed_over' }),
  ];

  it('shows only available items by default', () => {
    expect(filterItems(rows, DEFAULT_SOUK_FILTERS).map((i) => i.id)).toEqual(['i1', 'i2']);
  });

  it('never shows drafts even when including unavailable', () => {
    const result = filterItems(rows, { ...DEFAULT_SOUK_FILTERS, includeUnavailable: true });
    expect(result.map((i) => i.id)).toEqual(['i1', 'i2', 'i4']);
  });

  it('filters by category, area, condition and delivery', () => {
    expect(
      filterItems(rows, { ...DEFAULT_SOUK_FILTERS, category: 'textiles' }).map((i) => i.id),
    ).toEqual(['i2']);
    expect(
      filterItems(rows, { ...DEFAULT_SOUK_FILTERS, governorateId: 'aden' }).map((i) => i.id),
    ).toEqual(['i2']);
    expect(
      filterItems(rows, { ...DEFAULT_SOUK_FILTERS, condition: 'new' }).map((i) => i.id),
    ).toEqual(['i2']);
    expect(
      filterItems(rows, { ...DEFAULT_SOUK_FILTERS, deliveryMethod: 'volunteer_help' }),
    ).toEqual([]);
  });

  it('matches free text and reports active filters', () => {
    expect(
      filterItems(rows, { ...DEFAULT_SOUK_FILTERS, text: 'bedroom' }).map((i) => i.id),
    ).toEqual(['i1']);
    expect(hasActiveSoukFilters(DEFAULT_SOUK_FILTERS)).toBe(false);
    expect(hasActiveSoukFilters({ ...DEFAULT_SOUK_FILTERS, text: 'x' })).toBe(true);
    expect(SOUK_CATEGORIES.length).toBe(11);
  });
});

describe('duplicate detection (metadata fingerprints only)', () => {
  const existing = [item({ imageFingerprints: ['fp-1'], title: 'Bedroom set' })];

  it('flags a reused fingerprint', () => {
    const result = detectDuplicate(
      { imageFingerprints: ['fp-1'], title: null, governorateId: null, donorId: null },
      existing,
    );
    expect(result.flagged).toBe(true);
    expect(result.basis).toBe('fingerprint');
    expect(result.matchedItemId).toBe('i1');
  });

  it('flags the same title + area + donor', () => {
    const result = detectDuplicate(
      {
        imageFingerprints: [],
        title: 'bedroom set',
        governorateId: 'sanaa',
        donorId: 'donor-1',
      },
      existing,
    );
    expect(result.flagged).toBe(true);
    expect(result.basis).toBe('title_area');
  });

  it('honestly misses a renamed file with a different title', () => {
    const result = detectDuplicate(
      {
        imageFingerprints: ['fp-renamed'],
        title: 'Different title',
        governorateId: 'aden',
        donorId: 'donor-2',
      },
      existing,
    );
    expect(result.flagged).toBe(false);
    expect(result.basis).toBe('none');
  });
});

describe('souk limits and expiry', () => {
  it('falls back to provisional defaults for invalid settings', () => {
    expect(resolveSoukLimits(undefined)).toEqual(DEFAULT_SOUK_LIMITS);
    expect(resolveSoukLimits({ soukMaxActiveRequests: 'three' })).toEqual(DEFAULT_SOUK_LIMITS);
    expect(resolveSoukLimits({ soukMaxActiveRequests: 0 })).toEqual(DEFAULT_SOUK_LIMITS);
    expect(resolveSoukLimits({ soukItemExpiryDays: 9999 })).toEqual(DEFAULT_SOUK_LIMITS);
  });

  it('accepts valid settings and can switch review ON', () => {
    const limits = resolveSoukLimits({
      soukMaxActiveRequests: 5,
      soukMaxItemImages: 6,
      soukItemExpiryDays: 30,
      soukRequireItemReview: true,
    });
    expect(limits.maxActiveRequests).toBe(5);
    expect(limits.maxItemImages).toBe(6);
    expect(limits.itemExpiryDays).toBe(30);
    expect(limits.requireItemReview).toBe(true);
  });

  it('computes and evaluates expiry', () => {
    const expiry = itemExpiryFrom('2026-06-01T00:00:00.000Z', 60);
    expect(expiry).toBe('2026-07-31T00:00:00.000Z');
    expect(itemExpiryFrom('nope', 60)).toBeNull();
    expect(isItemExpired(expiry, new Date('2026-07-30T00:00:00.000Z'))).toBe(false);
    expect(isItemExpired(expiry, new Date('2026-08-01T00:00:00.000Z'))).toBe(true);
    expect(isItemExpired(null, new Date())).toBe(false);
  });
});

describe('souk stats (unverified estimate, suppressed)', () => {
  it('suppresses small counts and the estimate together', () => {
    const stats = computeSoukStats({ items: [item()] });
    expect(stats.availableCount.kind).toBe('suppressed');
    expect(stats.estimatedTotal.kind).toBe('suppressed');
    expect(stats.unverified).toBe(true);
    expect(stats.threshold).toBe(SMALL_NUMBER_THRESHOLD);
  });

  it('reveals aggregates at or above the threshold', () => {
    const items = Array.from({ length: 12 }, (_, i) => item({ id: `i${i}` }));
    const stats = computeSoukStats({ items });
    expect(stats.availableCount.kind).toBe('value');
    if (stats.availableCount.kind === 'value') expect(stats.availableCount.value).toBe(12);
    expect(stats.estimatedTotal.kind).toBe('value');
  });

  it('honours a custom threshold and counts handed-over items', () => {
    const stats = computeSoukStats({
      items: [item({ status: 'handed_over' }), item({ id: 'i2', status: 'claimed' })],
      threshold: 2,
    });
    expect(stats.handedOverCount.kind).toBe('value');
    if (stats.handedOverCount.kind === 'value') expect(stats.handedOverCount.value).toBe(2);
  });
});
