import { seedApplications } from './applications';
import { seedAudit } from './audit';
import { seedContent } from './content';
import { seedDisbursements } from './disbursements';
import { seedDonations } from './donations';
import { seedJobs } from './jobs';
import { seedNotifications } from './notifications';
import { seedOffers } from './offers';
import { seedPartners } from './partners';
import { seedProfiles } from './profiles';
import { seedPrograms } from './programs';
import { seedSettings } from './settings';
import { seedSouk } from './souk';
import { seedVolunteers } from './volunteers';
import { seedWeddings } from './weddings';

import type { SeedBundle } from './types';

export * from './types';
export { SEED_REFERENCE_DATE } from './types';

export {
  seedApplications,
  seedAudit,
  seedContent,
  seedDisbursements,
  seedDonations,
  seedJobs,
  seedNotifications,
  seedOffers,
  seedPartners,
  seedProfiles,
  seedPrograms,
  seedSettings,
  seedSouk,
  seedVolunteers,
  seedWeddings,
};

/**
 * Builds the full seed bundle. Pure function, no side effects.
 * Consumers (P05+) call `populateDemoSeed(container)` to inject into mocks.
 */
export function buildDemoSeedBundle(): SeedBundle {
  return {
    profiles: seedProfiles,
    programs: seedPrograms,
    applications: seedApplications,
    weddings: seedWeddings,
    partners: seedPartners,
    offers: seedOffers,
    souk: seedSouk,
    jobs: seedJobs,
    volunteers: seedVolunteers,
    donations: seedDonations,
    disbursements: seedDisbursements,
    content: seedContent,
    notifications: seedNotifications,
    audit: seedAudit,
    settings: seedSettings,
  };
}
