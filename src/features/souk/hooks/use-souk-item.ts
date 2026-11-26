import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { createRequest } from '../services/request-service';
import { toItemWorkflowStatus } from '../state/item-machine';
import { toPartyRequestView, toPublicItemView, type PartyRequestView, type PublicSoukItemView } from '../state/public-view';
import { useSoukLimits } from './use-souk-limits';

export interface SoukItemPayload {
  readonly item: PublicSoukItemView;
  readonly isOwner: boolean;
  readonly myRequest: PartyRequestView | null;
  readonly canRequest: boolean;
}

export interface SoukItemApi {
  readonly data: SoukItemPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  request(reason: string): Promise<Result<SoukRequest>>;
  refetch: () => void;
}

export function useSoukItem(itemId: string): SoukItemApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const { limits } = useSoukLimits();
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
    queryKey: ['souk', 'item', container.mode, itemId, userId],
    enabled: container.mode === 'demo' && itemId.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<SoukItemPayload | null>> => {
      const found = await container.repositories.souk.getById(itemId);
      if (!found.ok) return found;
      const item = found.value;
      if (!item) return { ok: true, value: null };
      const isOwner = userId !== null && item.donorId === userId;
      let myRequest: PartyRequestView | null = null;
      if (userId) {
        const requests = await container.repositories.soukRequests.listByItem(itemId);
        if (!requests.ok) return requests;
        const mine = requests.value.find((r) => r.requesterId === userId) ?? null;
        myRequest = mine ? toPartyRequestView(mine) : null;
      }
      return {
        ok: true,
        value: {
          item: toPublicItemView(item),
          isOwner,
          myRequest,
          canRequest:
            !isOwner && userId !== null && toItemWorkflowStatus(item.status) === 'available',
        },
      };
    },
  });

  const request = useCallback(
    async (reason: string): Promise<Result<SoukRequest>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await createRequest(deps, itemId, userId, reason, limits, new Date());
      if (result.ok) await client.invalidateQueries({ queryKey: ['souk'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [deps, itemId, userId, limits, client],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    busy,
    actionError,
    request,
    refetch,
  };
}
