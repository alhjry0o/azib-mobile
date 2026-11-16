import type { AuthSession } from '@/providers';
import { hasStaffRole, resolveGate } from '../routing';

const baseUser: AuthSession['user'] = {
  id: 'u1',
  email: 'demo@azib.invalid',
  phone: null,
  displayName: 'Demo User',
  dataOrigin: 'demo',
  createdAt: new Date().toISOString(),
};

const session: AuthSession = { user: baseUser, expiresAt: new Date().toISOString() };
const pending: AuthSession = {
  ...session,
  pendingVerification: { channel: 'email', target: 'demo@azib.invalid' },
};

const base = {
  hydrated: true,
  onboardingCompleted: true,
  sessionLoading: false,
};

describe('resolveGate with guests and verification (P06.1)', () => {
  it('sends signed-out users to auth', () => {
    expect(resolveGate({ ...base, session: { ok: true, value: null } })).toBe('auth');
  });

  it('lets a local guest into the tabs', () => {
    expect(resolveGate({ ...base, isGuest: true, session: { ok: true, value: null } })).toBe('ready');
  });

  it('routes pending verification to verify', () => {
    expect(resolveGate({ ...base, session: { ok: true, value: pending } })).toBe('verify');
  });

  it('routes a verified session to ready', () => {
    expect(resolveGate({ ...base, session: { ok: true, value: session } })).toBe('ready');
  });
});

describe('hasStaffRole with real roles', () => {
  it('denies when roles are absent or empty', () => {
    expect(hasStaffRole(baseUser)).toBe(false);
    expect(hasStaffRole({ ...baseUser, roles: [] })).toBe(false);
  });

  it('denies self-declared intents', () => {
    expect(hasStaffRole({ ...baseUser, roles: ['member', 'applicant', 'donor'] })).toBe(false);
  });

  it('allows explicit staff roles', () => {
    expect(hasStaffRole({ ...baseUser, roles: ['member', 'reviewer'] })).toBe(true);
    expect(hasStaffRole({ ...baseUser, roles: ['admin'] })).toBe(true);
  });
});
