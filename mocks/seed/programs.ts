import type { CreateProgramInput } from './types';

export const seedPrograms: readonly CreateProgramInput[] = [
  {
    nameKey: 'programs.marriage_support',
    descriptionKey: 'programs.marriage.support.desc',
    status: 'open',
    minAmount: 50000,
    maxAmount: 300000,
  },
  {
    nameKey: 'programs.emergency_wedding',
    descriptionKey: 'programs.emergency.wedding.desc',
    status: 'open',
    minAmount: 100000,
    maxAmount: 500000,
  },
  {
    nameKey: 'programs.seasonal_support',
    descriptionKey: 'programs.seasonal.support.desc',
    status: 'draft',
    minAmount: 20000,
    maxAmount: 150000,
  },
];
