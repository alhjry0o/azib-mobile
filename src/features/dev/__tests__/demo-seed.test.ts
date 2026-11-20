import type { AppEnv } from '@/config/env';
import { createProviderContainer } from '@/providers/container';
import { populateHomeDemoData } from '../demo-seed';

const env: AppEnv = Object.freeze({
  APP_MODE: 'development',
  ENV: 'local',
  SUPABASE_URL: null,
  SUPABASE_ANON_KEY: null,
  isSupabaseConfigured: false,
});

describe('populateHomeDemoData', () => {
  it('refuses to run outside demo mode', async () => {
    const container = createProviderContainer({ mode: 'backend', env });
    const summary = await populateHomeDemoData(container.repositories);
    expect(summary.ok).toBe(false);
    expect(summary.errors).toContain('NOT_DEMO_MODE');
  });

  it('creates, publishes and links demo data through the contracts', async () => {
    const container = createProviderContainer({ mode: 'demo', env });
    const summary = await populateHomeDemoData(container.repositories);
    expect(summary.ok).toBe(true);
    expect(summary.published).toBeGreaterThan(0);
    expect(summary.linkedOffers).toBe(3);

    const weddings = await container.repositories.weddings.list({ limit: 50 });
    expect(weddings.ok).toBe(true);
    if (weddings.ok) {
      expect(weddings.value.items.every((w) => w.status === 'open')).toBe(true);
      expect(weddings.value.items[0]?.titleKey.startsWith('home:demo.')).toBe(true);
    }

    const partners = await container.repositories.partners.list({ limit: 50 });
    expect(partners.ok).toBe(true);
    if (partners.ok) {
      expect(partners.value.items.every((p) => p.status === 'verified')).toBe(true);
    }

    const offers = await container.repositories.offers.list({ limit: 50 });
    expect(offers.ok).toBe(true);
    if (offers.ok && partners.ok) {
      const ids = partners.value.items.map((p) => p.id);
      const active = offers.value.items.filter((o) => o.status === 'active');
      expect(active.length).toBe(3);
      expect(active.every((o) => ids.includes(o.partnerId))).toBe(true);
      expect(active.every((o) => o.dataOrigin === 'demo')).toBe(true);
    }

    const jobs = await container.repositories.jobs.list({ limit: 50 });
    expect(jobs.ok).toBe(true);
    if (jobs.ok) expect(jobs.value.items.every((j) => j.status === 'open')).toBe(true);
  });

  it('does not duplicate linked offers on a second run', async () => {
    const container = createProviderContainer({ mode: 'demo', env });
    await populateHomeDemoData(container.repositories);
    const second = await populateHomeDemoData(container.repositories);
    expect(second.linkedOffers).toBe(0);
    const offers = await container.repositories.offers.list({ limit: 100 });
    if (offers.ok) {
      expect(offers.value.items.filter((o) => o.status === 'active').length).toBe(3);
    }
  });
});
