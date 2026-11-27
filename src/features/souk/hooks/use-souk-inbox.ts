import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { cancelRequest, decideRequest } from '../services/request-service';

export interface InboxRow {
  readonly request: SoukRequest;
  readonly itemId: string;
  readonly itemTitle: string;
}

export interface SoukInboxApi {
  readonly rows: readonly InboxRow[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  decide(requestId: string, decision: 'accepted' | 'rejected', reasonKey?: string): Promise<Result<SoukRequest>>;
  cancel(requestId: string): Promise<Result<SoukRequest>>;
  refetch: () => void;
}

/** Donor-side inbox: requests submitted on the current user's own items. */
export function useSoukInbox(): SoukInboxApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      souk: container.repositories.souk,
      requests: container.repositories.soukRequests,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['souk', 'inbox', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly InboxRow[]>> => {
      if (!userId) return { ok: true, value: [] };
      const listed = await container.repositories.souk.list({ limit: 200 });
      if (!listed.ok) return listed;
      const mine = listed.value.items.filter((item) => item.donorId === userId);
      const rows: InboxRow[] = [];
      for (const item of mine) {
        const requests = await container.repositories.soukRequests.listByItem(item.id);
        if (!requests.ok) return requests;
        for (const request of requests.value) {
          rows.push({
            request,
            itemId: item.id,
            itemTitle: item.title ?? item.titleKey,
          });
        }
      }
      return { ok: true, value: rows };
    },
  });

  const run = useCallback(
    async (fn: () => Promise<Result<SoukRequest>>): Promise<Result<SoukRequest>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['souk'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [userId, client],
  );

  const decide = useCallback(
    (requestId: string, decision: 'accepted' | 'rejected', reasonKey?: string) =>
      run(() =>
        decideRequest(deps, requestId, userId ?? '', 'member', decision, new Date(), reasonKey),
      ),
    [run, deps, userId],
  );

  const cancel = useCallback(
    (requestId: string) => run(() => cancelRequest(deps, requestId, userId ?? '', 'member')),
    [run, deps, userId],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    rows: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    busy,
    actionError,
    decide,
    cancel,
    refetch,
  };
}
