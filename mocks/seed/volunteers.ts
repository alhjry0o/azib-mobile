import type { CreateVolunteerInput } from './types';

// Fabricated demo volunteers. The availability grid is 7 days × 3 slots.
function grid(availableIndexes: readonly number[]): readonly boolean[] {
  return Array.from({ length: 21 }, (_, i) => availableIndexes.includes(i));
}

export const seedVolunteers: readonly CreateVolunteerInput[] = [
  {
    userId: 'seed-user-2',
    skillKey: 'volunteer.skills.translation',
    governorateIds: ['sanaa'],
    skills: ['volunteer.skills.translation'],
    helpTypes: ['wedding_coordination'],
    availability: grid([0, 1, 3, 4]),
    note: 'متطوع تجريبي للتنسيق.',
  },
  {
    userId: 'seed-user-4',
    skillKey: 'volunteer.skills.teaching',
    governorateIds: ['aden', 'taiz'],
    skills: ['volunteer.skills.teaching'],
    helpTypes: ['donation_delivery', 'partner_visits'],
    availability: grid([6, 7, 8, 12]),
    note: null,
  },
];
