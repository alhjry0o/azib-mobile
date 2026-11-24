import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Offer } from '@/repositories/contracts/offer';
import type {
  ServiceRequest,
  ServiceRequestStatus,
} from '@/repositories/contracts/wedding-budget';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  createServiceRequest,
  respondServiceRequest,
} from '../services/service-request-service';

export interface ServicesPayload {
  readonly requests: readonly ServiceRequest[];
  readonly offers: readonly Offer[];
}

export interface WeddingServicesApi {
  readonly requests: readonly ServiceRequest[];
  readonly offers: readonly Offer[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  request(partnerId: string, categoryKey: string, message: string): Promise<Result<ServiceRequest>>;
  respond(
    requestId: string,
    status: ServiceRequestStatus,
    reply?: string,
  ): Promise<Result<ServiceRequest>>;
}

export function useWeddingServices(groupId: string): WeddingServicesApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      budgets: container.repositories.weddingBudgets,
      groups: container.repositories.weddingGroups,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['weddings', 'services', container.mode, groupId],
    enabled: container.mode === 'demo' && groupId.length > 0,
    staleTime: 10_000,
    queryFn: async (): Promise<Result<ServicesPayload>> => {
      const requests = await deps.budgets.listServiceRequests(groupId);
      if (!requests.ok) return requests;
      const offers = await container.repositories.offers.list({ limit: 50 });
      if (!offers.ok) return offers;
      return {
        ok: true,
        value: {
          requests: requests.value,
          offers: offers.value.items.filter((o) => o.status === 'active'),
        },
      };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setActionError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['weddings'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const request = useCallback(
    (partnerId: string, categoryKey: string, message: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return createServiceRequest(deps, groupId, userId, { partnerId, categoryKey, message });
      }),
    [run, userId, deps, groupId],
  );

  const respond = useCallback(
    (requestId: string, status: ServiceRequestStatus, reply?: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return respondServiceRequest(deps, groupId, requestId, userId, status, reply);
      }),
    [run, userId, deps, groupId],
  );

  return {
    requests: query.data?.ok ? query.data.value.requests : [],
    offers: query.data?.ok ? query.data.value.offers : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    busy,
    actionError,
    request,
    respond,
  };
}
