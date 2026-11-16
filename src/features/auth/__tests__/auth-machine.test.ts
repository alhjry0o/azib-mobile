import type { AuthSession } from '@/providers';
import { AppError } from '@/core/errors';
import {
  INITIAL_AUTH_PHASE,
  deriveAuthPhase,
  isValidTransition,
  transition,
  type AuthEvent,
  type AuthPhase,
} from '../auth-machine';

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

const pending: AuthSession = {
  ...session,
  pendingVerification: { channel: 'email', target: 'demo@azib.invalid' },
};

const PHASES: readonly AuthPhase[] = [
  'loading',
  'unauthenticated',
  'guest',
  'authenticated',
  'needs_verification',
];

describe('auth machine', () => {
  it('starts in loading', () => {
    expect(INITIAL_AUTH_PHASE).toBe('loading');
  });

  it('hydrates to unauthenticated and resolves sessions', () => {
    expect(transition('loading', { type: 'HYDRATED' })).toBe('unauthenticated');
    expect(transition('loading', { type: 'SESSION_RESOLVED', session })).toBe('authenticated');
    expect(transition('loading', { type: 'SESSION_RESOLVED', session: pending })).toBe(
      'needs_verification',
    );
    expect(transition('loading', { type: 'SESSION_RESOLVED', session: null })).toBe(
      'unauthenticated',
    );
  });

  it('supports guest entry and upgrade to authenticated', () => {
    expect(transition('unauthenticated', { type: 'GUEST_STARTED' })).toBe('guest');
    expect(transition('guest', { type: 'SESSION_RESOLVED', session })).toBe('authenticated');
    expect(transition('guest', { type: 'SESSION_RESOLVED', session: null })).toBe('guest');
    expect(transition('guest', { type: 'GUEST_ENDED' })).toBe('unauthenticated');
  });

  it('signs out and expires from every signed-in phase', () => {
    for (const phase of ['authenticated', 'needs_verification', 'guest'] as const) {
      expect(transition(phase, { type: 'SIGNED_OUT' })).toBe('unauthenticated');
    }
    expect(transition('authenticated', { type: 'SESSION_EXPIRED' })).toBe('unauthenticated');
    expect(transition('needs_verification', { type: 'SESSION_EXPIRED' })).toBe('unauthenticated');
  });

  it('completes verification', () => {
    expect(transition('needs_verification', { type: 'SESSION_RESOLVED', session })).toBe(
      'authenticated',
    );
    expect(transition('authenticated', { type: 'VERIFICATION_REQUIRED' })).toBe(
      'needs_verification',
    );
  });

  it('rejects invalid transitions without changing the phase', () => {
    const invalid: readonly [AuthPhase, AuthEvent][] = [
      ['loading', { type: 'SIGNED_OUT' }],
      ['loading', { type: 'GUEST_ENDED' }],
      ['unauthenticated', { type: 'SESSION_EXPIRED' }],
      ['unauthenticated', { type: 'VERIFICATION_REQUIRED' }],
      ['guest', { type: 'VERIFICATION_REQUIRED' }],
      ['authenticated', { type: 'GUEST_STARTED' }],
      ['needs_verification', { type: 'GUEST_STARTED' }],
    ];
    for (const [phase, event] of invalid) {
      expect(isValidTransition(phase, event)).toBe(false);
      expect(transition(phase, event)).toBe(phase);
    }
  });

  it('never throws for any phase/event combination', () => {
    const events: readonly AuthEvent[] = [
      { type: 'HYDRATED' },
      { type: 'SESSION_LOADING' },
      { type: 'SESSION_RESOLVED', session: null },
      { type: 'SESSION_RESOLVED', session },
      { type: 'GUEST_STARTED' },
      { type: 'GUEST_ENDED' },
      { type: 'SIGNED_OUT' },
      { type: 'SESSION_EXPIRED' },
      { type: 'VERIFICATION_REQUIRED' },
    ];
    for (const phase of PHASES) {
      for (const event of events) {
        expect(PHASES).toContain(transition(phase, event));
      }
    }
  });
});

describe('deriveAuthPhase', () => {
  const base = { hydrated: true, guestActive: false, sessionLoading: false };

  it('is loading until stores hydrate and the query settles', () => {
    expect(deriveAuthPhase({ ...base, hydrated: false, session: undefined })).toBe('loading');
    expect(deriveAuthPhase({ ...base, sessionLoading: true, session: undefined })).toBe('loading');
    expect(deriveAuthPhase({ ...base, session: undefined })).toBe('loading');
  });

  it('maps sessions to authenticated / needs_verification', () => {
    expect(deriveAuthPhase({ ...base, session: { ok: true, value: session } })).toBe('authenticated');
    expect(deriveAuthPhase({ ...base, session: { ok: true, value: pending } })).toBe(
      'needs_verification',
    );
  });

  it('maps guests and signed-out users', () => {
    expect(deriveAuthPhase({ ...base, session: { ok: true, value: null } })).toBe('unauthenticated');
    expect(
      deriveAuthPhase({ ...base, guestActive: true, session: { ok: true, value: null } }),
    ).toBe('guest');
  });

  it('treats provider errors as unauthenticated (the gate shows the error)', () => {
    expect(
      deriveAuthPhase({ ...base, session: { ok: false, error: AppError.notConnected() } }),
    ).toBe('unauthenticated');
  });
});
