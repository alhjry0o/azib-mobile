// Pure routing decisions for the shell. No React, fully unit-testable.
import type { AuthSession, AuthUser } from '@/providers';
import type { Result } from '@/core/result';

export type GateStatus =
  | 'loading'
  | 'onboarding'
  | 'auth'
  | 'ready'
  | 'not-connected'
  | 'error';

export interface GateInput {
  /** Both persisted stores (app-mode + onboarding) finished hydrating. */
  readonly hydrated: boolean;
  readonly onboardingCompleted: boolean;
  readonly sessionLoading: boolean;
  readonly session: Result<AuthSession | null> | undefined;
}

export function resolveGate(input: GateInput): GateStatus {
  if (!input.hydrated || input.sessionLoading || input.session === undefined) {
    return 'loading';
  }
  if (!input.onboardingCompleted) return 'onboarding';
  if (!input.session.ok) {
    return input.session.error.kind === 'NotConnected' ? 'not-connected' : 'error';
  }
  return input.session.value !== null ? 'ready' : 'auth';
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
 * Staff role check. AuthUser has no roles field until P06/P17 deliver it.
 * Deny-by-default: nobody passes until roles exist. The UI guard is a
 * convenience only; real enforcement is server-side RLS (P18), per rule #19.
 */
export function hasStaffRole(_user: AuthUser): boolean {
  return false;
}
