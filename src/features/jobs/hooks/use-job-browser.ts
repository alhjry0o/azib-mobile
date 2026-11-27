import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Job } from '@/repositories/contracts/job';
import { useProviderContainer } from '@/providers';
import { DEFAULT_JOB_FILTERS, filterJobs, type JobFilters } from '../state/filters';
import { toPublicJobView, type PublicJobView } from '../state/public-view';

interface BrowserPayload {
  readonly items: readonly Job[];
  readonly evaluatedAt: string;
}

export interface JobBrowserApi {
  readonly rows: readonly PublicJobView[];
  readonly filters: JobFilters;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  setFilters: (next: JobFilters) => void;
  clearFilters: () => void;
  refetch: () => void;
}

/** Public surface: only the projection leaves this hook. */
export function useJobBrowser(): JobBrowserApi {
  const container = useProviderContainer();
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);

  const query = useQuery({
    queryKey: ['jobs', 'browser', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 15_000,
    queryFn: async (): Promise<Result<BrowserPayload>> => {
      const listed = await container.repositories.jobs.list({ limit: 200 });
      if (!listed.ok) return listed;
      return { ok: true, value: { items: listed.value.items, evaluatedAt: new Date().toISOString() } };
    },
  });

  const rows = useMemo(() => {
    const payload = query.data?.ok ? query.data.value : null;
    if (!payload) return [];
    return filterJobs(payload.items, filters, new Date(payload.evaluatedAt)).map(toPublicJobView);
  }, [query.data, filters]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  const clearFilters = useCallback(() => setFilters(DEFAULT_JOB_FILTERS), []);

  return {
    rows,
    filters,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    setFilters,
    clearFilters,
    refetch,
  };
}
