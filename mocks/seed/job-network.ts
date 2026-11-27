// Standalone demo fixtures (NOT part of SeedBundle) — mirrors the P11/P12
// precedent so the bundle-wide PII test stays untouched. All fabricated.
export const SEED_JOB_NETWORK_DATA_ORIGIN = 'demo' as const;

export const seedJobReportReasons: readonly string[] = [
  'jobs:report.reasons.fake',
  'jobs:report.reasons.expired',
  'jobs:report.reasons.unpaid',
  'jobs:report.reasons.misleading',
];

export const seedApplicationReasons: readonly string[] = [
  'jobs:reasons.notQualified',
  'jobs:reasons.positionFilled',
  'jobs:reasons.incompleteProfile',
];

export const seedVolunteerTaskTitles: readonly string[] = [
  'marketplace:volunteers.tasks.delivery',
  'marketplace:volunteers.tasks.wedding',
  'marketplace:volunteers.tasks.partnerVisit',
];

export const seedVolunteerRegions: readonly string[] = ['sanaa', 'aden', 'taiz'];
