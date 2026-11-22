import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import type { AppMode } from '@/stores';
import type { DisbursementRow } from '../components/DisbursementCard';

export function beneficiaryDisbursementsQueryKey(mode: AppMode, userId: string | null) {
  return ['finance', 'beneficiary-disbursements', mode, userId] as const;
}

export interface BeneficiaryDisbursementsApi {
  readonly rows: readonly DisbursementRow[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch(): void;
}

/** Only the beneficiary's own applications are ever read here. */
export function useBeneficiaryDisbursements(): BeneficiaryDisbursementsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: beneficiaryDisbursementsQueryKey(container.mode, userId),
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 15_000,
    queryFn: async (): Promise<Result<readonly DisbursementRow[]>> => {
      if (!userId) return { ok: true, value: [] };
      const applications = await container.repositories.applications.listByApplicant(userId);
      if (!applications.ok) return applications;
      const rows: DisbursementRow[] = [];
      for (const application of applications.value) {
        const listed = await container.repositories.disbursements.listByApplication(application.id);
        if (!listed.ok) return listed;
        for (const disbursement of listed.value.items) {
          rows.push({ disbursement, application });
        }
      }
      return { ok: true, value: rows };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    rows: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
