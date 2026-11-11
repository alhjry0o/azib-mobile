import type { CreateSoukItemInput } from './types';

// Generic Arabic item titles. Not real listings.
export const seedSouk: readonly CreateSoukItemInput[] = [
  { titleKey: 'souk.furniture_set', category: 'furniture' },
  { titleKey: 'souk.kitchen_basic', category: 'kitchenware' },
  { titleKey: 'souk.bedding_set', category: 'textiles' },
];
