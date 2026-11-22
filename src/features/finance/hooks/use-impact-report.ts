import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import type { AppMode } from '@/stores';
import { computeImpactReport, type ImpactReport } from '../services/impact-service';

export function impactQueryKey(mode: AppMode) {
  return ['finance', 'impact', mode] as const;
}

export interface ImpactReportApi {
  readonly report: ImpactReport | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch(): void;
}

/** Real + verified only. Demo never enters (ADR-0026). */
export function useImpactReport(): ImpactReportApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: impactQueryKey(container.mode),
    enabled: container.mode === 'demo',
    staleTime: 30_000,
    queryFn: async (): Promise<Result<ImpactReport>> => {
      const donations = await container.repositories.donations.list({ limit: 200 });
      if (!donations.ok) return donations;
      const disbursements = await container.repositories.disbursements.list({ limit: 200 });
      if (!disbursements.ok) return disbursements;
      return {
        ok: true,
        value: computeImpactReport({
          donations: donations.value.items,
          disbursements: disbursements.value.items,
        }),
      };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    report: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
