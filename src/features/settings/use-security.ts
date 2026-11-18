// Password change + session management through the AuthProvider contract.
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { AuthSessionInfo } from '@/providers';
import { useProviderContainer } from '@/providers';
import { useSession } from '@/features/shell/use-session';
import type { AppMode } from '@/stores';

export function sessionsQueryKey(mode: AppMode) {
  return ['auth', 'sessions', mode] as const;
}

export interface SecurityApi {
  readonly sessions: readonly AuthSessionInfo[];
  readonly loading: boolean;
  readonly busy: boolean;
  readonly error: AppError | null;
  changePassword(currentPassword: string, newPassword: string): Promise<Result<void>>;
  revoke(sessionId: string): Promise<Result<void>>;
  refresh(): void;
  clearError(): void;
}

export function useSecurity(): SecurityApi {
  const container = useProviderContainer();
  const session = useSession();
  const client = useQueryClient();
  const mode = container.mode;
  const signedIn = session.result?.ok === true && session.result.value !== null;

  const query = useQuery({
    queryKey: sessionsQueryKey(mode),
    enabled: signedIn,
    staleTime: 15_000,
    queryFn: async (): Promise<Result<readonly AuthSessionInfo[]>> =>
      container.auth.listSessions(),
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const result = query.data;
  const sessions = result?.ok ? result.value : [];

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<Result<void>> => {
      setBusy(true);
      setError(null);
      const changed = await container.auth.changePassword({ currentPassword, newPassword });
      if (!changed.ok) setError(changed.error);
      setBusy(false);
      return changed;
    },
    [container],
  );

  const revoke = useCallback(
    async (sessionId: string): Promise<Result<void>> => {
      setBusy(true);
      setError(null);
      const revoked = await container.auth.revokeSession(sessionId);
      if (!revoked.ok) {
        setError(revoked.error);
        setBusy(false);
        return revoked;
      }
      const next = await container.auth.listSessions();
      client.setQueryData(sessionsQueryKey(mode), next);
      const current = await container.auth.getSession();
      if (current.ok) session.setSession(current.value);
      setBusy(false);
      return revoked;
    },
    [container, client, mode, session],
  );

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const clearError = useCallback(() => setError(null), []);

  return {
    sessions,
    loading: query.isLoading,
    busy,
    error,
    changePassword,
    revoke,
    refresh,
    clearError,
  };
}
