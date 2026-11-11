import type { CreateDonationInput } from './types';

// Fictional donors. Amounts are YER demo values, not real transactions.
export const seedDonations: readonly CreateDonationInput[] = [
  { donorId: 'seed-donor-1', amount: 100000, note: 'تبرع تجريبي.' },
  { donorId: 'seed-donor-2', amount: 50000, note: null },
  { donorId: 'seed-donor-3', amount: 250000, note: 'دعم برنامج الأعراس.' },
];
