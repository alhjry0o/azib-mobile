import type { CreateWeddingInput } from './types';

// Demo group weddings. Group metadata added in P10.1 (additive).
// All ids reference the fabricated seed users; no real people or places.
export const seedWeddings: readonly CreateWeddingInput[] = [
  {
    titleKey: 'weddings.first_group_2026',
    scheduledDate: '2026-06-15T16:00:00.000Z',
    capacity: 40,
    organizerId: 'seed-user-1',
    coOrganizerIds: ['seed-user-2'],
    governorateId: 'sanaa',
    districtId: 'maeen',
    city: 'صنعاء',
    alternateDate: '2026-06-22T16:00:00.000Z',
    targetCount: 8,
    descriptionKey: 'weddings:demo.first.description',
    withdrawalPolicyVersion: 'withdrawal-v1',
    maxGroupSize: 12,
  },
  {
    titleKey: 'weddings.spring_batch_2026',
    scheduledDate: '2026-04-20T16:00:00.000Z',
    capacity: 25,
    organizerId: 'seed-user-3',
    coOrganizerIds: [],
    governorateId: 'aden',
    districtId: 'khormaksar',
    city: 'عدن',
    alternateDate: null,
    targetCount: 6,
    descriptionKey: 'weddings:demo.spring.description',
    withdrawalPolicyVersion: 'withdrawal-v1',
    maxGroupSize: 12,
  },
];
