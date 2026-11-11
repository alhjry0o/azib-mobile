import type { CreateProfileInput } from './types';

// Fabricated names. No real people. No real phone numbers (fictional pattern +967000…).
export const seedProfiles: readonly CreateProfileInput[] = [
  {
    userId: 'seed-user-1',
    displayName: 'أحمد اليماني',
    gender: 'male',
    maritalStatus: 'single',
    city: 'صنعاء',
    phone: '+967000000001',
  },
  {
    userId: 'seed-user-2',
    displayName: 'فاطمة الصنعانية',
    gender: 'female',
    maritalStatus: 'single',
    city: 'صنعاء',
    phone: '+967000000002',
  },
  {
    userId: 'seed-user-3',
    displayName: 'خالد الحضرمي',
    gender: 'male',
    maritalStatus: 'engaged',
    city: 'عدن',
    phone: null,
  },
  {
    userId: 'seed-user-4',
    displayName: 'سميرة التعزية',
    gender: 'female',
    maritalStatus: 'single',
    city: 'تعز',
    phone: null,
  },
];
