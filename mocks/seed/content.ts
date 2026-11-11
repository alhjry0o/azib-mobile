import type { SeedContentRecord } from './types';

// Content references i18n keys. Actual Arabic content lands in P15.
// We reuse existing keys to avoid inventing new namespaces here.
export const seedContent: readonly SeedContentRecord[] = [
  {
    slug: 'welcome',
    titleKey: 'learn:title',
    bodyKey: 'learn:notConnectedYet',
  },
  {
    slug: 'azib-charter',
    titleKey: 'legal:title',
    bodyKey: 'legal:notConnectedYet',
  },
];
