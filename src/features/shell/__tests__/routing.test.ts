import { AppError } from '@/core/errors';
import type { AuthSession } from '@/providers';
import { hasStaffRole, isTabActive, resolveGate, stripGroups } from '../routing';

const session: AuthSession = {
  user: {
    id: 'u1',
    email: 'demo@azib.invalid',
    phone: null,
    displayName: 'Demo User',
    dataOrigin: 'demo',
    createdAt: new Date().toISOString(),
  },
  expiresAt: new Date().toISOString(),
};

describe('resolveGate', () => {
  it('returns loading while stores are not hydrated', () => {
    expect(
      resolveGate({
        hydrated: false,
        onboardingCompleted: false,
        sessionLoading: false,
        session: { ok: true, value: null },
      }),
    ).toBe('loading');
  });

  it('returns loading while the session query is pending', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: true,
        sessionLoading: true,
        session: undefined,
      }),
    ).toBe('loading');
  });

  it('routes to onboarding when not completed', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: false,
        sessionLoading: false,
        session: { ok: true, value: null },
      }),
    ).toBe('onboarding');
  });

  it('routes to auth when completed with no session', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: true,
        sessionLoading: false,
        session: { ok: true, value: null },
      }),
    ).toBe('auth');
  });

  it('routes to ready when a session exists', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: true,
        sessionLoading: false,
        session: { ok: true, value: session },
      }),
    ).toBe('ready');
  });

  it('routes to not-connected for NotConnected errors', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: true,
        sessionLoading: false,
        session: { ok: false, error: AppError.notConnected() },
      }),
    ).toBe('not-connected');
  });

  it('routes to error for other errors', () => {
    expect(
      resolveGate({
        hydrated: true,
        onboardingCompleted: true,
        sessionLoading: false,
        session: { ok: false, error: AppError.network() },
      }),
    ).toBe('error');
  });
});

describe('stripGroups', () => {
  it('removes group segments', () => {
    expect(stripGroups('/(tabs)/services')).toBe('/services');
    expect(stripGroups('/(features)/(main)/souk')).toBe('/souk');
  });

  it('keeps root for group-only paths', () => {
    expect(stripGroups('/(tabs)')).toBe('/');
    expect(stripGroups('/')).toBe('/');
  });
});

describe('isTabActive', () => {
  it('matches home for root and index', () => {
    expect(isTabActive('/', '/')).toBe(true);
    expect(isTabActive('/index', '/')).toBe(true);
    expect(isTabActive('/(tabs)', '/')).toBe(true);
  });

  it('matches non-home tabs with and without groups', () => {
    expect(isTabActive('/services', '/services')).toBe(true);
    expect(isTabActive('/(tabs)/services', '/services')).toBe(true);
    expect(isTabActive('/services', '/account')).toBe(false);
  });
});

describe('hasStaffRole', () => {
  it('denies everyone until roles exist (P06/P17)', () => {
    expect(hasStaffRole(session.user)).toBe(false);
  });
});
