// Standalone demo marketplace fixtures (NOT part of SeedBundle) — mirrors the
// wedding-planning.ts precedent, so the bundle-wide PII test stays untouched.
// Every phone here is FABRICATED and obviously synthetic (+9677000000xx).
// No real business, no real person, no copied production data.
export const SEED_MARKETPLACE_DATA_ORIGIN = 'demo' as const;

export interface SeedPartnerContact {
  readonly partnerKey: string;
  readonly contactPhone: string;
  readonly whatsapp: string;
  readonly latitude: number;
  readonly longitude: number;
}

export const seedPartnerContacts: readonly SeedPartnerContact[] = [
  {
    partnerKey: 'seed-partner-1',
    contactPhone: '+967700000001',
    whatsapp: '+967700000001',
    latitude: 15.3694,
    longitude: 44.191,
  },
  {
    partnerKey: 'seed-partner-2',
    contactPhone: '+967700000002',
    whatsapp: '+967700000002',
    latitude: 15.3547,
    longitude: 44.2066,
  },
  {
    partnerKey: 'seed-partner-3',
    contactPhone: '+967700000003',
    whatsapp: '+967700000003',
    latitude: 12.7855,
    longitude: 45.0187,
  },
];

/** Demo verification snapshots keyed by partnerKey. */
export const seedVerificationSnapshots: readonly {
  readonly partnerKey: string;
  readonly status: 'pending' | 'verified' | 'rejected' | 'expired';
  readonly validUntil: string | null;
}[] = [
  { partnerKey: 'seed-partner-1', status: 'verified', validUntil: '2027-01-01T00:00:00.000Z' },
  { partnerKey: 'seed-partner-2', status: 'verified', validUntil: '2027-01-01T00:00:00.000Z' },
  { partnerKey: 'seed-partner-3', status: 'pending', validUntil: null },
  { partnerKey: 'seed-partner-4', status: 'rejected', validUntil: null },
];

export const seedOfferReportReasons: readonly string[] = [
  'marketplace:report.reasons.wrongDiscount',
  'marketplace:report.reasons.expired',
  'marketplace:report.reasons.unreachable',
  'marketplace:report.reasons.misleading',
];

export const seedAmbassadorRegions: readonly string[] = ['sanaa', 'aden', 'taiz'];
