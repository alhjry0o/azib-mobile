import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukItem } from '@/repositories/contracts/souk';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  relistItem,
  submitItemForPublication,
  withdrawItem,
} from '../services/item-service';
import { cancelRequest } from '../services/request-service';
import { toPublicItemView, type PublicSoukItemView } from '../state/public-view';
import { useSoukLimits } from './use-souk-limits';

export interface SoukMineApi {
  readonly items: readonly PublicSoukItemView[];
  readonly requests: readonly SoukRequest[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  publish(itemId: string): Promise<Result<SoukItem>>;
  withdraw(itemId: string): Promise<Result<SoukItem>>;
  relist(itemId: string): Promise<Result<SoukItem>>;
  cancel(requestId: string): Promise<Result<SoukRequest>>;
  refetch: () => void;
}

export function useSoukMine(): SoukMineApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const { limits } = useSoukLimits();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const itemDeps = useMemo(
    () => ({ souk: container.repositories.souk, audit: container.repositories.audit }),
    [container],
  );
  const requestDeps = useMemo(
    () => ({
      souk: container.repositories.souk,
      requests: container.repositories.soukRequests,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['souk', 'mine', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<
      Result<{ items: readonly PublicSoukItemView[]; requests: readonly SoukRequest[] }>
    > => {
      const listed = await container.repositories.souk.list({ limit: 200 });
      if (!listed.ok) return listed;
      const mine = userId ? listed.value.items.filter((i) => i.donorId === userId) : [];
      const requests = userId
        ? await container.repositories.soukRequests.listByRequester(userId)
        : { ok: true as const, value: [] as readonly SoukRequest[] };
      if (!requests.ok) return requests;
      return { ok: true, value: { items: mine.map(toPublicItemView), requests: requests.value } };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
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

  const publish = useCallback(
    (itemId: string) =>
      run(() => submitItemForPublication(itemDeps, itemId, userId ?? '', limits, new Date())),
    [run, itemDeps, userId, limits],
  );
  const withdraw = useCallback(
    (itemId: string) => run(() => withdrawItem(itemDeps, itemId, userId ?? '')),
    [run, itemDeps, userId],
  );
  const relist = useCallback(
    (itemId: string) => run(() => relistItem(itemDeps, itemId, userId ?? '')),
    [run, itemDeps, userId],
  );
  const cancel = useCallback(
    (requestId: string) =>
      run(() => cancelRequest(requestDeps, requestId, userId ?? '', 'member')),
    [run, requestDeps, userId],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  const value = query.data?.ok ? query.data.value : null;
  return {
    items: value?.items ?? [],
    requests: value?.requests ?? [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    busy,
    actionError,
    publish,
    withdraw,
    relist,
    cancel,
    refetch,
  };
}
