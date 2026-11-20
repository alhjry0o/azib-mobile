// Demo data tooling (D-1). Uses ONLY existing repository contracts:
// populateDemoSeed() creates records, then we publish them (update) and
// link offers to real verified partners so the home dashboard is truthful
// and readable. Nothing here changes a contract or a mock factory.
import type { RepositoryContainer } from '@/repositories/container';
import { seedOffers } from '../../../mocks/seed/offers';
import { populateDemoSeed } from '../../../mocks/seed/populator';

export interface DemoSeedSummary {
  readonly ok: boolean;
  readonly created: Readonly<Record<string, number>>;
  readonly published: number;
  readonly linkedOffers: number;
  readonly unsupported: readonly string[];
  readonly errors: readonly string[];
}

const WEDDING_TITLES = ['home:demo.weddings.first', 'home:demo.weddings.second'] as const;
const SOUK_TITLES = [
  'home:demo.souk.furniture',
  'home:demo.souk.kitchen',
  'home:demo.souk.bedding',
] as const;
const JOB_TITLES = [
  'home:demo.jobs.accountant',
  'home:demo.jobs.cashier',
  'home:demo.jobs.photographer',
] as const;
const OFFER_TITLES = [
  'home:demo.offers.catering',
  'home:demo.offers.venue',
  'home:demo.offers.clothing',
] as const;

function titleAt(list: readonly string[], index: number): string {
  return list[index] ?? list[0] ?? 'home:title';
}

export async function populateHomeDemoData(
  repositories: RepositoryContainer,
): Promise<DemoSeedSummary> {
  if (repositories.mode !== 'demo') {
    return {
      ok: false,
      created: {},
      published: 0,
      linkedOffers: 0,
      unsupported: [],
      errors: ['NOT_DEMO_MODE'],
    };
  }

  const report = await populateDemoSeed(repositories);
  const errors: string[] = [...report.errors];
  let published = 0;
  let linkedOffers = 0;

  const partnersResult = await repositories.partners.list({ limit: 100 });
  const partnerIds: string[] = [];
  if (partnersResult.ok) {
    for (const partner of partnersResult.value.items) {
      partnerIds.push(partner.id);
      if (partner.status !== 'verified') {
        const updated = await repositories.partners.update(partner.id, { status: 'verified' });
        if (updated.ok) published += 1;
        else errors.push('partners: update failed');
      }
    }
  } else {
    errors.push('partners: list failed');
  }

  const weddings = await repositories.weddings.list({ limit: 100 });
  if (weddings.ok) {
    for (let i = 0; i < weddings.value.items.length; i += 1) {
      const wedding = weddings.value.items[i];
      if (!wedding) continue;
      const updated = await repositories.weddings.update(wedding.id, {
        status: 'open',
        titleKey: titleAt(WEDDING_TITLES, i),
      });
      if (updated.ok) published += 1;
      else errors.push('weddings: update failed');
    }
  }

  const souk = await repositories.souk.list({ limit: 100 });
  if (souk.ok) {
    for (let i = 0; i < souk.value.items.length; i += 1) {
      const item = souk.value.items[i];
      if (!item) continue;
      const updated = await repositories.souk.update(item.id, {
        status: 'available',
        titleKey: titleAt(SOUK_TITLES, i),
      });
      if (updated.ok) published += 1;
      else errors.push('souk: update failed');
    }
  }

  const jobs = await repositories.jobs.list({ limit: 100 });
  if (jobs.ok) {
    for (let i = 0; i < jobs.value.items.length; i += 1) {
      const job = jobs.value.items[i];
      if (!job) continue;
      const updated = await repositories.jobs.update(job.id, {
        status: 'open',
        titleKey: titleAt(JOB_TITLES, i),
      });
      if (updated.ok) published += 1;
      else errors.push('jobs: update failed');
    }
  }

  // Seed offers reference partner ids that mock repositories never minted.
  // Create properly linked offers once; orphan seed offers stay draft/hidden.
  const offers = await repositories.offers.list({ limit: 100 });
  if (offers.ok && partnerIds.length > 0) {
    const alreadyLinked = offers.value.items.some((offer) =>
      partnerIds.includes(offer.partnerId),
    );
    if (!alreadyLinked) {
      for (let i = 0; i < seedOffers.length; i += 1) {
        const seed = seedOffers[i];
        if (!seed) continue;
        const partnerId = partnerIds[i % partnerIds.length] ?? partnerIds[0];
        if (!partnerId) continue;
        const created = await repositories.offers.create({
          partnerId,
          titleKey: titleAt(OFFER_TITLES, i),
          discountPercent: seed.discountPercent,
        });
        if (!created.ok) {
          errors.push('offers: create failed');
          continue;
        }
        const activated = await repositories.offers.update(created.value.id, {
          status: 'active',
        });
        if (activated.ok) linkedOffers += 1;
        else errors.push('offers: activate failed');
      }
    }
  }

  return {
    ok: errors.length === 0,
    created: report.created,
    published,
    linkedOffers,
    unsupported: report.unsupported,
    errors,
  };
}
