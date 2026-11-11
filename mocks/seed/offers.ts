import type { CreateOfferInput } from './types';

// partnerId references seedPartners by index (mock ids differ — associations in docs only).
// Numeric fields reflect demo values, not real prices.
export const seedOffers: readonly CreateOfferInput[] = [
  {
    partnerId: 'seed-partner-1',
    titleKey: 'offers.catering_20',
    discountPercent: 20,
  },
  {
    partnerId: 'seed-partner-2',
    titleKey: 'offers.venue_15',
    discountPercent: 15,
  },
  {
    partnerId: 'seed-partner-3',
    titleKey: 'offers.clothing_10',
    discountPercent: 10,
  },
];
