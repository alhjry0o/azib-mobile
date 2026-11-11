import type { SeedJob } from './types';

export const seedJobs: readonly SeedJob[] = [
  {
    titleKey: 'jobs.accountant',
    partnerId: 'seed-partner-1',
    status: 'open',
  },
  {
    titleKey: 'jobs.cashier',
    partnerId: 'seed-partner-3',
    status: 'open',
  },
  {
    titleKey: 'jobs.photographer_assistant',
    partnerId: 'seed-partner-4',
    status: 'draft',
  },
];
