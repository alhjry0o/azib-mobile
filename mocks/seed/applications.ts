import type { CreateApplicationInput } from './types';

// applicantId references seedProfiles[*].userId (cross-link within demo bundle).
export const seedApplications: readonly CreateApplicationInput[] = [
  {
    applicantId: 'seed-user-1',
    programId: 'seed-program-1',
    requestedAmount: 150000,
    notes: 'طلب مساعدة لتغطية تكاليف الزواج.',
  },
  {
    applicantId: 'seed-user-4',
    programId: 'seed-program-1',
    requestedAmount: 100000,
    notes: null,
  },
  {
    applicantId: 'seed-user-3',
    programId: 'seed-program-2',
    requestedAmount: 250000,
    notes: 'حالة طارئة — تم تسجيلها للتجربة.',
  },
];
