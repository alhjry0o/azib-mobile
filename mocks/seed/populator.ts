// populateDemoSeed — injects demo data into the mock repositories.
// Honest about coverage: some repositories do not expose create/update
// via their contract (content/notification/search). Those are reported
// as `unsupported` rather than silently skipped.
//
// Do NOT call this in backend mode. It intentionally no-ops and reports
// `skipped: 'not-demo-mode'`.

import type { RepositoryContainer } from '@/repositories/container';

import { buildDemoSeedBundle } from './index';

export interface PopulateReport {
  readonly ok: boolean;
  readonly skipped: 'not-demo-mode' | null;
  readonly created: Readonly<Record<string, number>>;
  readonly unsupported: readonly string[];
  readonly errors: readonly string[];
}

const UNSUPPORTED_REPOS = ['content', 'notifications', 'search'] as const;

export async function populateDemoSeed(
  container: RepositoryContainer,
): Promise<PopulateReport> {
  if (container.mode !== 'demo') {
    return {
      ok: true,
      skipped: 'not-demo-mode',
      created: {},
      unsupported: [],
      errors: [],
    };
  }

  const bundle = buildDemoSeedBundle();
  const created: Record<string, number> = {};
  const errors: string[] = [];

  async function tryCreate(
    name: string,
    items: readonly unknown[],
    fn: (item: unknown) => Promise<{ ok: boolean; error?: unknown }>,
  ): Promise<void> {
    let count = 0;
    for (const item of items) {
      const r = await fn(item);
      if (r.ok) {
        count += 1;
      } else {
        errors.push(`${name}: ${JSON.stringify(r.error)}`);
      }
    }
    created[name] = count;
  }

  await tryCreate('profiles', bundle.profiles, (i) =>
    container.profiles.create(i as (typeof bundle.profiles)[number]),
  );
  await tryCreate('programs', bundle.programs, (i) =>
    container.programs.create(i as (typeof bundle.programs)[number]),
  );
  await tryCreate('applications', bundle.applications, (i) =>
    container.applications.create(i as (typeof bundle.applications)[number]),
  );
  await tryCreate('weddings', bundle.weddings, (i) =>
    container.weddings.create(i as (typeof bundle.weddings)[number]),
  );
  await tryCreate('partners', bundle.partners, (i) =>
    container.partners.create(i as (typeof bundle.partners)[number]),
  );
  await tryCreate('offers', bundle.offers, (i) =>
    container.offers.create(i as (typeof bundle.offers)[number]),
  );
  await tryCreate('souk', bundle.souk, (i) =>
    container.souk.create(i as (typeof bundle.souk)[number]),
  );
  await tryCreate('jobs', bundle.jobs, (i) =>
    container.jobs.create({
      titleKey: (i as (typeof bundle.jobs)[number]).titleKey,
      partnerId: (i as (typeof bundle.jobs)[number]).partnerId,
    }),
  );
  await tryCreate('volunteers', bundle.volunteers, (i) =>
    container.volunteers.create(i as (typeof bundle.volunteers)[number]),
  );
  await tryCreate('donations', bundle.donations, (i) =>
    container.donations.create(i as (typeof bundle.donations)[number]),
  );
  await tryCreate('disbursements', bundle.disbursements, (i) =>
    container.disbursements.create(i as (typeof bundle.disbursements)[number]),
  );
  await tryCreate('audit', bundle.audit, (i) =>
    container.audit.append(i as (typeof bundle.audit)[number]),
  );

  // Settings uses update(), not create().
  let settingsCount = 0;
  for (const s of bundle.settings) {
    const r = await container.settings.update(s.key, s.value);
    if (r.ok) settingsCount += 1;
    else errors.push(`settings: ${JSON.stringify(r.error)}`);
  }
  created.settings = settingsCount;

  return {
    ok: errors.length === 0,
    skipped: null,
    created: Object.freeze(created),
    unsupported: [...UNSUPPORTED_REPOS],
    errors: Object.freeze(errors),
  };
}
