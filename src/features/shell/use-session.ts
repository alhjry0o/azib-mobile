// Session access via AuthProvider.getSession() (P03 contract), cached by Query.
// Components never call providers directly elsewhere; they use this hook.
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthSession } from '@/providers';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import type { AppMode } from '@/stores';

export function sessionQueryKey(mode: AppMode) {
  return ['auth', 'session', mode] as const;
}

export interface SessionApi {
  readonly result: Result<AuthSession | null> | undefined;
  readonly isLoading: boolean;
  refetch(): void;
  setSession(session: AuthSession | null): void;
}

export function useSession(): SessionApi {
  const container = useProviderContainer();
  const client = useQueryClient();
  const mode = container.mode;
  const key = sessionQueryKey(mode);

  const query = useQuery({
    queryKey: key,
    queryFn: () => container.auth.getSession(),
    staleTime: 30_000,
  });

  const setSession = useCallback(
    (session: AuthSession | null) => {
      client.setQueryData(sessionQueryKey(mode), { ok: true, value: session });
    },
    [client, mode],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return { result: query.data, isLoading: query.isLoading, refetch, setSession };
}
