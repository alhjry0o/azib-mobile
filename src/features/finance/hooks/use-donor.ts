import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Donation } from '@/repositories/contracts/donation';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import type { AppMode } from '@/stores';
import { selectReceipts, type ReceiptView } from '../services/receipt-service';

export function myDonationsQueryKey(mode: AppMode, userId: string | null) {
  return ['finance', 'donations', mode, userId] as const;
}

interface DonorPayload {
  readonly donations: readonly Donation[];
  readonly programNames: Readonly<Record<string, string>>;
}

export interface DonorApi {
  readonly donations: readonly Donation[];
  readonly receipts: readonly ReceiptView[];
  readonly programNames: Readonly<Record<string, string>>;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch(): void;
}

export function useDonor(): DonorApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: myDonationsQueryKey(container.mode, userId),
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 15_000,
    queryFn: async (): Promise<Result<DonorPayload>> => {
      if (!userId) return { ok: true, value: { donations: [], programNames: {} } };
      const listed = await container.repositories.donations.listByDonor(userId);
      if (!listed.ok) return listed;
      const programs = await container.repositories.programs.list({ limit: 50 });
      const names: Record<string, string> = {};
      if (programs.ok) {
        for (const program of programs.value.items) names[program.id] = program.nameKey;
      }
      return { ok: true, value: { donations: listed.value.items, programNames: names } };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  const value = query.data?.ok ? query.data.value : null;
  const donations = value?.donations ?? [];

  return {
    donations,
    receipts: selectReceipts(donations),
    programNames: value?.programNames ?? {},
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
