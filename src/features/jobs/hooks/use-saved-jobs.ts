import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { toPublicJobView, type PublicJobView } from '../state/public-view';

export interface SavedJobsApi {
  readonly rows: readonly PublicJobView[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function useSavedJobs(): SavedJobsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: ['jobs', 'saved', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly PublicJobView[]>> => {
      if (!userId) return { ok: true, value: [] };
      const saved = await container.repositories.jobEngagement.listSaved(userId);
      if (!saved.ok) return saved;
      const rows: PublicJobView[] = [];
      for (const row of saved.value) {
        const found = await container.repositories.jobs.getById(row.jobId);
        if (!found.ok) return found;
        if (found.value) rows.push(toPublicJobView(found.value));
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
