// Combines persisted stores + session query into one gate decision.
import { useAppModeStore, useAuthStore, useOnboardingStore } from '@/stores';
import { resolveGate, type GateStatus } from './routing';
import { useSession } from './use-session';

export interface ShellGate {
  readonly status: GateStatus;
  refetch(): void;
}

export function useShellGate(): ShellGate {
  const modeHydrated = useAppModeStore((s) => s.hydrated);
  const onboardingHydrated = useOnboardingStore((s) => s.hydrated);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const guestActive = useAuthStore((s) => s.guestActive);
  const completed = useOnboardingStore((s) => s.completed);
  const session = useSession();

  const status = resolveGate({
    hydrated: modeHydrated && onboardingHydrated && authHydrated,
    onboardingCompleted: completed,
    sessionLoading: session.isLoading,
    session: session.result,
    isGuest: guestActive,
  });

  return { status, refetch: session.refetch };
}
