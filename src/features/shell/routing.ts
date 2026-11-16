// Pure routing decisions for the shell. No React, fully unit-testable.
import type { AuthSession, AuthUser } from '@/providers';
import { STAFF_ROLES } from '@/providers';
import type { Result } from '@/core/result';

export type GateStatus =
  | 'loading'
  | 'onboarding'
  | 'auth'
  | 'verify'
  | 'ready'
  | 'not-connected'
  | 'error';

export interface GateInput {
  /** Persisted stores (app-mode + onboarding + auth) finished hydrating. */
  readonly hydrated: boolean;
  readonly onboardingCompleted: boolean;
  readonly sessionLoading: boolean;
  readonly session: Result<AuthSession | null> | undefined;
  /** Local guest session (no server data). Defaults to false. */
  readonly isGuest?: boolean;
}

export function resolveGate(input: GateInput): GateStatus {
  if (!input.hydrated || input.sessionLoading || input.session === undefined) {
    return 'loading';
  }
  if (!input.onboardingCompleted) return 'onboarding';
  if (!input.session.ok) {
    return input.session.error.kind === 'NotConnected' ? 'not-connected' : 'error';
  }
  if (input.session.value !== null) {
    return input.session.value.pendingVerification ? 'verify' : 'ready';
  }
  return input.isGuest ? 'ready' : 'auth';
}

/** Removes Expo Router group segments: '/(tabs)/services' -> '/services'. */
export function stripGroups(path: string): string {
  const segments = path
    .split('/')
    .filter((s) => s.length > 0 && !(s.startsWith('(') && s.endsWith(')')));
  return `/${segments.join('/')}`;
}

export function isTabActive(pathname: string, tabPath: string): boolean {
  const current = stripGroups(pathname);
  if (tabPath === '/') return current === '/' || current === '/index';
  return current === tabPath;
}

/**
 * Staff access is granted only by an explicit staff role on the session.
 * Absent roles (older sessions) deny by default. Self-declared sign-up intents
 * are never staff roles. The UI guard is a convenience only; real enforcement
 * is server-side RLS (P18), per rule #19.
 */
export function hasStaffRole(user: AuthUser): boolean {
  const roles = user.roles;
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => STAFF_ROLES.includes(role));
}
