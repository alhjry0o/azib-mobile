import { AppError } from '@/core/errors';
import type { AppEnv } from '@/config/env';
import { createProviderContainer } from '@/providers/container';
import { ALL_PROVIDER_NAMES } from '@/providers/types';

function envWith(supabaseConfigured: boolean): AppEnv {
  return Object.freeze({
    APP_MODE: 'development',
    ENV: 'local',
    SUPABASE_URL: supabaseConfigured ? 'https://x.supabase.co' : null,
    SUPABASE_ANON_KEY: supabaseConfigured ? 'anon-key' : null,
    isSupabaseConfigured: supabaseConfigured,
  });
}

describe('ProviderContainer', () => {
  describe('demo mode', () => {
    const container = createProviderContainer({ mode: 'demo', env: envWith(false) });

    it('is in demo mode', () => {
      expect(container.mode).toBe('demo');
    });

    it('all 12 providers are present', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        const p = (container as unknown as Record<string, { name: string }>)[name];
        expect(p!.name).toBe(name);
      }
    });

    it('all providers are in mock mode', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        const p = (container as unknown as Record<string, { mode: string }>)[name];
        expect(p!.mode).toBe('mock');
      }
    });

    it('registry marks all 12 providers as mock', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('mock');
      }
    });

    it('auth works end-to-end', async () => {
      const r = await container.auth.signIn({ email: 'demo@example.com', password: 'x' });
      expect(r.ok).toBe(true);
    });

    it('healthCheckAll updates registry with connected status', async () => {
      await container.healthCheckAll();
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('connected');
      }
    });

    it('repositories is in demo mode', () => {
      expect(container.repositories.mode).toBe('demo');
    });

    it('all 16 repositories are functional (fully implemented)', async () => {
      const r1 = await container.repositories.profiles.create({
        userId: 'u1',
        displayName: 'Test',
        gender: 'male',
        maritalStatus: 'single',
      });
      expect(r1.ok).toBe(true);

      const r2 = await container.repositories.applications.create({
        applicantId: 'a1',
        programId: 'p1',
        requestedAmount: 1000,
      });
      expect(r2.ok).toBe(true);

      const r3 = await container.repositories.programs.create({
        nameKey: 'p',
        descriptionKey: 'p.d',
        minAmount: 1,
        maxAmount: 100,
      });
      expect(r3.ok).toBe(true);

      const r4 = await container.repositories.donations.create({
        donorId: 'd1',
        amount: 5000,
      });
      expect(r4.ok).toBe(true);

      const r5 = await container.repositories.disbursements.create({
        applicationId: 'a1',
        amount: 5000,
      });
      expect(r5.ok).toBe(true);

      const r6 = await container.repositories.weddings.create({
        titleKey: 'w',
        scheduledDate: '2026-12-01T10:00:00.000Z',
        capacity: 50,
      });
      expect(r6.ok).toBe(true);

      const r7 = await container.repositories.partners.create({
        displayName: 'P',
        category: 'c',
      });
      expect(r7.ok).toBe(true);

      const r8 = await container.repositories.offers.create({
        partnerId: 'p',
        titleKey: 'o',
        discountPercent: 10,
      });
      expect(r8.ok).toBe(true);

      const r9 = await container.repositories.souk.create({
        titleKey: 's',
        category: 'f',
      });
      expect(r9.ok).toBe(true);

      const r10 = await container.repositories.jobs.create({
        titleKey: 'j',
        partnerId: 'p',
      });
      expect(r10.ok).toBe(true);

      const r11 = await container.repositories.volunteers.create({
        userId: 'u1',
        skillKey: 'sk',
      });
      expect(r11.ok).toBe(true);

      const r12 = await container.repositories.content.list();
      expect(r12.ok).toBe(true);

      const r13 = await container.repositories.notifications.list();
      expect(r13.ok).toBe(true);

      const r14 = await container.repositories.search.search('anything');
      expect(r14.ok).toBe(true);

      const r15 = await container.repositories.audit.append({
        actorId: 'u1',
        action: 'test',
        target: 'test:1',
      });
      expect(r15.ok).toBe(true);

      const r16 = await container.repositories.settings.update('theme', { color: 'dark' });
      expect(r16.ok).toBe(true);
    });
  });

  describe('backend mode with Supabase configured', () => {
    const container = createProviderContainer({ mode: 'backend', env: envWith(true) });

    it('is in backend mode', () => {
      expect(container.mode).toBe('backend');
    });

    it('all providers are NotConnected stubs', async () => {
      const r = await container.auth.signIn({ email: 'x@y.z', password: 'p' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotConnected');
    });

    it('registry starts with "configured" status', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('configured');
      }
    });

    it('healthCheckAll flips them to error (unavailable)', async () => {
      await container.healthCheckAll();
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('error');
      }
    });

    it('repositories is in backend mode', () => {
      expect(container.repositories.mode).toBe('backend');
    });
  });

  describe('backend mode without Supabase env', () => {
    const container = createProviderContainer({ mode: 'backend', env: envWith(false) });

    it('registry starts with "disabled" status', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('disabled');
      }
    });

    it('errors are AppError.NotConnected, not crashes', async () => {
      const r = await container.email.send({ to: 'a@b.c', subject: 's', body: 'b' });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error).toBeInstanceOf(AppError);
        expect(r.error.kind).toBe('NotConnected');
      }
    });
  });

  it('is frozen (cannot be mutated)', () => {
    const c = createProviderContainer({ mode: 'demo', env: envWith(false) });
    expect(Object.isFrozen(c)).toBe(true);
  });
});
