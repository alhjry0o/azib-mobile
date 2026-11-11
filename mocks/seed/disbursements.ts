import type { CreateDisbursementInput } from './types';

// applicationId references applications by index in the seed bundle.
export const seedDisbursements: readonly CreateDisbursementInput[] = [
  { applicationId: 'seed-application-1', amount: 100000 },
  { applicationId: 'seed-application-2', amount: 75000 },
];
