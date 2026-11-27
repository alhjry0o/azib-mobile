import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { confirmHandover, rateExperience } from '../services/handover-service';
import { toPartyRequestView, type PartyRequestView } from '../state/public-view';
import { toRequestWorkflowStatus } from '../state/request-machine';

export interface HandoverPayload {
  readonly request: PartyRequestView;
  readonly itemTitle: string;
  readonly completed: boolean;
}

export interface SoukHandoverApi {
  readonly data: HandoverPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  confirm(code: string): Promise<Result<SoukRequest>>;
  rate(score: number, note: string | null): Promise<Result<SoukRequest>>;
  refetch: () => void;
}

export function useSoukHandover(requestId: string): SoukHandoverApi {
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
    queryKey: ['souk', 'handover', container.mode, requestId, userId],
    enabled: container.mode === 'demo' && requestId.length > 0 && userId !== null,
    staleTime: 3_000,
    queryFn: async (): Promise<Result<HandoverPayload | null>> => {
      const found = await container.repositories.soukRequests.getById(requestId);
      if (!found.ok) return found;
      const request = found.value;
      if (!request) return { ok: true, value: null };
      const item = await container.repositories.souk.getById(request.itemId);
      if (!item.ok) return item;
      if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
      return {
        ok: true,
        value: {
          request: toPartyRequestView(request),
          itemTitle: item.value.title ?? item.value.titleKey,
          completed: toRequestWorkflowStatus(request.status) === 'handed_over',
        },
      };
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

  const confirm = useCallback(
    (code: string) => run(() => confirmHandover(deps, requestId, userId ?? '', code, new Date())),
    [run, deps, requestId, userId],
  );

  const rate = useCallback(
    (score: number, note: string | null) =>
      run(() => rateExperience(deps, requestId, userId ?? '', score, note, new Date())),
    [run, deps, requestId, userId],
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
    confirm,
    rate,
    refetch,
  };
}
