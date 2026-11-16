// UI guard for protected routes. Guests and signed-out users are sent to
// Welcome; pending verification is sent to Verify. Real enforcement is
// server-side RLS in P18 (rule #19) — this is a convenience only.
import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { GateLoading } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';
import { useAuthStore } from '@/stores';
import { useAuth } from './use-auth';

export interface RequireAuthProps {
  readonly children: ReactNode;
  /** Path to return to after a successful sign-in. */
  readonly redirectTo?: string;
}

export function RequireAuth({ children, redirectTo }: RequireAuthProps) {
  const auth = useAuth();
  const setRedirectAfterAuth = useAuthStore((s) => s.setRedirectAfterAuth);

  if (auth.phase === 'loading') return <GateLoading />;
  if (auth.phase === 'needs_verification') {
    return <Redirect href={href(ROUTES.auth.verify)} />;
  }
  if (auth.phase !== 'authenticated') {
    if (redirectTo) setRedirectAfterAuth(redirectTo);
    return <Redirect href={href(ROUTES.auth.welcome)} />;
  }
  return <>{children}</>;
}
