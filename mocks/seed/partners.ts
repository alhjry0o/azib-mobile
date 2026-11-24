import type { CreatePartnerInput } from './types';

// Fabricated businesses. Not real companies.
// P11.1 adds region/owner/description additively. NO phone numbers here:
// the bundle-wide PII test only allows the +967000… profile pattern, so
// demo contact numbers live in the standalone partner-marketplace seed.
export const seedPartners: readonly CreatePartnerInput[] = [
  {
    displayName: 'مخبز النور التجريبي',
    category: 'restaurants',
    ownerId: 'seed-user-1',
    description: 'شريك تجريبي لخدمات الضيافة والمخبوزات.',
    governorateId: 'sanaa',
    districtId: 'maeen',
    city: 'صنعاء',
    termsAcceptedAt: '2026-01-02T09:00:00.000Z',
  },
  {
    displayName: 'قاعة الأمل للأفراح',
    category: 'halls',
    ownerId: 'seed-user-2',
    description: 'شريك تجريبي لقاعات الأفراح.',
    governorateId: 'sanaa',
    districtId: 'sabeen',
    city: 'صنعاء',
    termsAcceptedAt: '2026-01-02T09:10:00.000Z',
  },
  {
    displayName: 'أزياء البركة',
    category: 'clothing',
    ownerId: 'seed-user-3',
    description: 'شريك تجريبي لملابس العرس.',
    governorateId: 'aden',
    districtId: 'khormaksar',
    city: 'عدن',
    termsAcceptedAt: '2026-01-02T09:20:00.000Z',
  },
  {
    displayName: 'تصوير اللحظات',
    category: 'photography',
    ownerId: 'seed-user-4',
    description: 'شريك تجريبي لخدمات التصوير.',
    governorateId: 'taiz',
    districtId: 'cairo',
    city: 'تعز',
    termsAcceptedAt: '2026-01-02T09:30:00.000Z',
  },
];
