// Standalone demo Souk fixtures (NOT part of SeedBundle) — mirrors the
// partner-marketplace.ts precedent so the bundle-wide PII test stays untouched.
// Everything here is fabricated. No phones, no addresses, no real people.
export const SEED_SOUK_DATA_ORIGIN = 'demo' as const;

export const seedSoukReportReasons: readonly string[] = [
  'marketplace:souk.report.reasons.forSale',
  'marketplace:souk.report.reasons.misleading',
  'marketplace:souk.report.reasons.unavailable',
  'marketplace:souk.report.reasons.unsafe',
];

export const seedSoukRequestReasons: readonly string[] = [
  'طلب توضيحي لتجهيز مسكن جديد لأسرة ناشئة.',
  'طلب توضيحي لاستبدال أدوات مطبخ تالفة.',
];

/** Demo handover codes are always prefixed so they are never mistaken for real. */
export const seedSoukHandoverCodes: readonly string[] = [
  'AZIB-DEMO-HO-000001',
  'AZIB-DEMO-HO-000002',
];

export const seedSoukMessages: readonly { authorKey: string; text: string }[] = [
  { authorKey: 'seed-user-1', text: 'العنصر جاهز للاستلام في المنطقة العامة المتفق عليها.' },
  { authorKey: 'seed-user-2', text: 'شكراً، سأتواصل لتحديد وقت مناسب للاستلام.' },
];
