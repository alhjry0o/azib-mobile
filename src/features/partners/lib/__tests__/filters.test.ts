import type { Offer } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import { PARTNER_CATEGORIES } from '../categories';
import {
  DEFAULT_OFFER_FILTERS,
  DEFAULT_PARTNER_FILTERS,
  filterOffers,
  filterPartners,
  hasActivePartnerFilters,
} from '../filters';

const NOW = new Date('2026-06-01T00:00:00.000Z');

function partner(patch: Partial<Partner> = {}): Partner {
  return {
    id: 'p1',
    displayName: 'Demo Hall',
    category: 'halls',
    status: 'verified',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataOrigin: 'demo',
    governorateId: 'sanaa',
    description: 'A demo venue',
    ...patch,
  };
}

function offer(patch: Partial<Offer> = {}): Offer {
  return {
    id: 'o1',
    partnerId: 'p1',
    titleKey: 'offers.demo',
    discountPercent: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataOrigin: 'demo',
    title: 'Demo discount',
    category: 'halls',
    governorateId: 'sanaa',
    audience: 'beneficiaries',
    validUntil: '2026-12-31T00:00:00.000Z',
    ...patch,
  };
}

describe('partner filters', () => {
  const rows = [
    partner(),
    partner({ id: 'p2', category: 'gold', governorateId: 'aden', displayName: 'Demo Gold' }),
    partner({ id: 'p3', status: 'suspended' }),
  ];
  const verifications = {
    p1: { status: 'verified' as const, validUntil: null },
    p2: null,
    p3: null,
  };

  it('hides suspended partners and keeps the rest by default', () => {
    const result = filterPartners(rows, DEFAULT_PARTNER_FILTERS, verifications, NOW);
    expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('filters by category, region and free text', () => {
    expect(
      filterPartners(rows, { ...DEFAULT_PARTNER_FILTERS, category: 'gold' }, verifications, NOW).map(
        (p) => p.id,
      ),
    ).toEqual(['p2']);
    expect(
      filterPartners(
        rows,
        { ...DEFAULT_PARTNER_FILTERS, governorateId: 'aden' },
        verifications,
        NOW,
      ).map((p) => p.id),
    ).toEqual(['p2']);
    expect(
      filterPartners(rows, { ...DEFAULT_PARTNER_FILTERS, text: 'hall' }, verifications, NOW).map(
        (p) => p.id,
      ),
    ).toEqual(['p1']);
  });

  it('verifiedOnly uses the record, not the status field', () => {
    const result = filterPartners(
      rows,
      { ...DEFAULT_PARTNER_FILTERS, verifiedOnly: true },
      verifications,
      NOW,
    );
    expect(result.map((p) => p.id)).toEqual(['p1']);
    // p2 has no record even if its status field were 'verified'.
    const forged = [partner({ id: 'p9', status: 'verified' })];
    expect(
      filterPartners(forged, { ...DEFAULT_PARTNER_FILTERS, verifiedOnly: true }, {}, NOW),
    ).toEqual([]);
  });

  it('reports whether any filter is active', () => {
    expect(hasActivePartnerFilters(DEFAULT_PARTNER_FILTERS)).toBe(false);
    expect(hasActivePartnerFilters({ ...DEFAULT_PARTNER_FILTERS, text: 'x' })).toBe(true);
  });

  it('exposes exactly fourteen categories', () => {
    expect(PARTNER_CATEGORIES.length).toBe(14);
  });
});

describe('offer filters', () => {
  const rows = [
    offer(),
    offer({ id: 'o2', validUntil: '2026-05-01T00:00:00.000Z' }),
    offer({ id: 'o3', status: 'draft' }),
    offer({ id: 'o4', audience: 'everyone', category: 'gold' }),
  ];

  it('shows only live offers by default', () => {
    expect(filterOffers(rows, DEFAULT_OFFER_FILTERS, NOW).map((o) => o.id)).toEqual(['o1', 'o4']);
  });

  it('can include expired ones explicitly', () => {
    const result = filterOffers(rows, { ...DEFAULT_OFFER_FILTERS, includeExpired: true }, NOW);
    expect(result.map((o) => o.id)).toContain('o2');
    expect(result.map((o) => o.id)).not.toContain('o3');
  });

  it('filters by audience and category', () => {
    expect(
      filterOffers(rows, { ...DEFAULT_OFFER_FILTERS, audience: 'beneficiaries' }, NOW).map(
        (o) => o.id,
      ),
    ).toEqual(['o1']);
    expect(
      filterOffers(rows, { ...DEFAULT_OFFER_FILTERS, category: 'gold' }, NOW).map((o) => o.id),
    ).toEqual(['o4']);
  });
});
