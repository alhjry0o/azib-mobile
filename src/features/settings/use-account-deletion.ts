// Scheduled account deletion with a grace period. The final purge is a
// server job in P18; here the request and its cancellation are real.
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { AccountDeletionRequest } from '@/providers';
import { useProviderContainer } from '@/providers';
import { useSession } from '@/features/shell/use-session';
import type { AppMode } from '@/stores';

export function deletionQueryKey(mode: AppMode) {
  return ['auth', 'deletion', mode] as const;
}

export interface DeletionApi {
  readonly request: AccountDeletionRequest | null;
  readonly busy: boolean;
  readonly error: AppError | null;
  schedule(password: string): Promise<Result<AccountDeletionRequest>>;
  cancel(): Promise<Result<void>>;
  clearError(): void;
}

export function useAccountDeletion(): DeletionApi {
  const container = useProviderContainer();
  const session = useSession();
  const client = useQueryClient();
  const mode = container.mode;
  const signedIn = session.result?.ok === true && session.result.value !== null;

  // The provider owns the request; the cache starts empty and is written on action.
  const query = useQuery({
    queryKey: deletionQueryKey(mode),
    enabled: signedIn,
    staleTime: Infinity,
    queryFn: () => Promise.resolve<AccountDeletionRequest | null>(null),
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const schedule = useCallback(
    async (password: string): Promise<Result<AccountDeletionRequest>> => {
      setBusy(true);
      setError(null);
      const scheduled = await container.auth.requestAccountDeletion({ password });
      if (scheduled.ok) client.setQueryData(deletionQueryKey(mode), scheduled.value);
      else setError(scheduled.error);
      setBusy(false);
      return scheduled;
    },
    [container, client, mode],
  );

  const cancel = useCallback(async (): Promise<Result<void>> => {
    setBusy(true);
    setError(null);
    const cancelled = await container.auth.cancelAccountDeletion();
    if (cancelled.ok) client.setQueryData(deletionQueryKey(mode), null);
    else setError(cancelled.error);
    setBusy(false);
    return cancelled;
  }, [container, client, mode]);

  const clearError = useCallback(() => setError(null), []);

  return { request: query.data ?? null, busy, error, schedule, cancel, clearError };
}
