import type { CreateSoukItemInput } from './types';

// Generic Arabic item titles. Not real listings, no real people, no phones.
// P12.1 adds donor/condition/area/delivery additively. The mock factory keeps
// status 'available' so these stay browsable.
// estimatedValue is a DONOR ESTIMATE for aggregate stats only — never a price.
export const seedSouk: readonly CreateSoukItemInput[] = [
  {
    titleKey: 'souk.furniture_set',
    category: 'furniture',
    donorId: 'seed-user-1',
    title: 'طقم أثاث تجريبي',
    description: 'طقم غرفة نوم بحالة جيدة، للتبرع فقط دون أي مقابل.',
    condition: 'good',
    governorateId: 'sanaa',
    districtId: 'maeen',
    deliveryMethod: 'self_pickup',
    estimatedValue: 120000,
    noResaleConsentAt: '2026-01-02T09:00:00.000Z',
  },
  {
    titleKey: 'souk.kitchen_basic',
    category: 'kitchenware',
    donorId: 'seed-user-2',
    title: 'أدوات مطبخ أساسية',
    description: 'أواني وأدوات مطبخ جديدة غير مستخدمة، تبرع عيني.',
    condition: 'new',
    governorateId: 'aden',
    districtId: 'khormaksar',
    deliveryMethod: 'donor_delivers',
    estimatedValue: 40000,
    noResaleConsentAt: '2026-01-02T09:10:00.000Z',
  },
  {
    titleKey: 'souk.bedding_set',
    category: 'textiles',
    donorId: 'seed-user-3',
    title: 'مفروشات سرير',
    description: 'مفروشات بحالة مقبولة، تُسلَّم بالاستلام الذاتي.',
    condition: 'acceptable',
    governorateId: 'taiz',
    districtId: 'cairo',
    deliveryMethod: 'volunteer_help',
    estimatedValue: 25000,
    noResaleConsentAt: '2026-01-02T09:20:00.000Z',
  },
];
