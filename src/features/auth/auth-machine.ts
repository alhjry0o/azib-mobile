// Pure auth state machine (P06.1). No React, no IO — fully unit-testable.
import type { AuthSession } from '@/providers';
import type { Result } from '@/core/result';

export type AuthPhase =
  | 'loading'
  | 'unauthenticated'
  | 'guest'
  | 'authenticated'
  | 'needs_verification';

export type AuthEvent =
  | { readonly type: 'HYDRATED' }
  | { readonly type: 'SESSION_LOADING' }
  | { readonly type: 'SESSION_RESOLVED'; readonly session: AuthSession | null }
  | { readonly type: 'GUEST_STARTED' }
  | { readonly type: 'GUEST_ENDED' }
  | { readonly type: 'SIGNED_OUT' }
  | { readonly type: 'SESSION_EXPIRED' }
  | { readonly type: 'VERIFICATION_REQUIRED' };

const ALLOWED: Record<AuthPhase, readonly AuthEvent['type'][]> = {
  loading: ['HYDRATED', 'SESSION_LOADING', 'SESSION_RESOLVED', 'GUEST_STARTED'],
  unauthenticated: ['SESSION_LOADING', 'SESSION_RESOLVED', 'GUEST_STARTED', 'SIGNED_OUT'],
  guest: ['SESSION_LOADING', 'SESSION_RESOLVED', 'GUEST_STARTED', 'GUEST_ENDED', 'SIGNED_OUT'],
  authenticated: [
    'SESSION_LOADING',
    'SESSION_RESOLVED',
    'SIGNED_OUT',
    'SESSION_EXPIRED',
    'VERIFICATION_REQUIRED',
  ],
  needs_verification: [
    'SESSION_LOADING',
    'SESSION_RESOLVED',
    'SIGNED_OUT',
    'SESSION_EXPIRED',
    'VERIFICATION_REQUIRED',
  ],
};

export const INITIAL_AUTH_PHASE: AuthPhase = 'loading';

export function isValidTransition(phase: AuthPhase, event: AuthEvent): boolean {
  return ALLOWED[phase].includes(event.type);
}

function phaseForSession(session: AuthSession | null): AuthPhase {
  if (!session) return 'unauthenticated';
  return session.pendingVerification ? 'needs_verification' : 'authenticated';
}

/** Invalid events leave the phase untouched (never throw, never guess). */
export function transition(phase: AuthPhase, event: AuthEvent): AuthPhase {
  if (!isValidTransition(phase, event)) return phase;
  switch (event.type) {
    case 'HYDRATED':
      return 'unauthenticated';
    case 'SESSION_LOADING':
      return 'loading';
    case 'SESSION_RESOLVED': {
      const next = phaseForSession(event.session);
      if (next === 'unauthenticated' && phase === 'guest') return 'guest';
      return next;
    }
    case 'GUEST_STARTED':
      return 'guest';
    case 'GUEST_ENDED':
    case 'SIGNED_OUT':
    case 'SESSION_EXPIRED':
      return 'unauthenticated';
    case 'VERIFICATION_REQUIRED':
      return 'needs_verification';
  }
}

export interface DerivePhaseInput {
  readonly hydrated: boolean;
  readonly guestActive: boolean;
  readonly sessionLoading: boolean;
  readonly session: Result<AuthSession | null> | undefined;
}

export function deriveAuthPhase(input: DerivePhaseInput): AuthPhase {
  if (!input.hydrated || input.sessionLoading || input.session === undefined) return 'loading';
  if (!input.session.ok) return 'unauthenticated';
  if (input.session.value) return phaseForSession(input.session.value);
  return input.guestActive ? 'guest' : 'unauthenticated';
}
