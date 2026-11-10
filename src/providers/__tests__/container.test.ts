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
        const p = (container as unknown as Record<string, { name: string }>)[name]!;
        expect(p.name).toBe(name);
      }
    });

    it('all providers are in mock mode', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        const p = (container as unknown as Record<string, { mode: string }>)[name]!;
        expect(p.mode).toBe('mock');
      }
    });

    it('registry marks all 12 providers as mock', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('mock');
      }
    });

    it('auth works end-to-end', async () => {
      const r = await container.auth.signIn({
        email: 'demo@example.com',
        password: 'x',
      });
      expect(r.ok).toBe(true);
    });

    it('healthCheckAll updates registry with connected status', async () => {
      await container.healthCheckAll();
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('connected');
      }
    });
  });

  describe('backend mode with Supabase configured', () => {
    const container = createProviderContainer({ mode: 'backend', env: envWith(true) });

    it('is in backend mode', () => {
      expect(container.mode).toBe('backend');
    });

    it('all providers are NotConnected stubs', async () => {
      const r = await container.auth.signIn({
        email: 'x@y.z',
        password: 'p',
      });
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
  });

  describe('backend mode without Supabase env', () => {
    const container = createProviderContainer({ mode: 'backend', env: envWith(false) });

    it('registry starts with "disabled" status', () => {
      for (const name of ALL_PROVIDER_NAMES) {
        expect(container.registry.get(name).status).toBe('disabled');
      }
    });

    it('errors are AppError.NotConnected, not crashes', async () => {
      const r = await container.email.send({
        to: 'a@b.c',
        subject: 's',
        body: 'b',
      });
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
