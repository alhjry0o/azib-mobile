import { EnvValidationError, parseEnv } from '@/config/env';

describe('parseEnv', () => {
  it('applies defaults when optional variables are absent', () => {
    const env = parseEnv({});
    expect(env.APP_MODE).toBe('development');
    expect(env.ENV).toBe('local');
    expect(env.SUPABASE_URL).toBe(null);
    expect(env.SUPABASE_ANON_KEY).toBe(null);
    expect(env.isSupabaseConfigured).toBe(false);
  });

  it('accepts valid values', () => {
    const env = parseEnv({
      EXPO_PUBLIC_APP_MODE: 'production',
      EXPO_PUBLIC_ENV: 'prod',
      EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(env.APP_MODE).toBe('production');
    expect(env.ENV).toBe('prod');
    expect(env.SUPABASE_URL).toBe('https://x.supabase.co');
    expect(env.SUPABASE_ANON_KEY).toBe('anon-key');
    expect(env.isSupabaseConfigured).toBe(true);
  });

  it('rejects invalid APP_MODE', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_APP_MODE: 'demo' })).toThrow(EnvValidationError);
  });

  it('rejects invalid ENV', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_ENV: 'production' })).toThrow(EnvValidationError);
  });

  it('rejects Supabase URL without key', () => {
    expect(() =>
      parseEnv({
        EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
      }),
    ).toThrow(EnvValidationError);
  });

  it('rejects Supabase key without URL', () => {
    expect(() =>
      parseEnv({
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toThrow(EnvValidationError);
  });

  it('EnvValidationError exposes issues array', () => {
    try {
      parseEnv({ EXPO_PUBLIC_APP_MODE: 'nope' });
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(EnvValidationError);
      if (e instanceof EnvValidationError) {
        expect(e.issues.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns frozen object', () => {
    const env = parseEnv({});
    expect(Object.isFrozen(env)).toBe(true);
  });
});
