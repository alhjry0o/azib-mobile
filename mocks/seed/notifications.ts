import type { SeedNotification } from './types';

export const seedNotifications: readonly SeedNotification[] = [
  {
    userId: 'seed-user-1',
    titleKey: 'common.appName',
    bodyKey: 'common.phaseLabel',
    read: false,
  },
  {
    userId: 'seed-user-2',
    titleKey: 'common.appName',
    bodyKey: 'common.demo.description',
    read: true,
  },
];
