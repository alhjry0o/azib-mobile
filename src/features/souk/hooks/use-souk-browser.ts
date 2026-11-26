import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukItem } from '@/repositories/contracts/souk';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_SOUK_FILTERS,
  filterItems,
  type SoukFilters,
} from '../state/filters';
import { toPublicItemView, type PublicSoukItemView } from '../state/public-view';

export interface SoukBrowserApi {
  readonly rows: readonly PublicSoukItemView[];
  readonly filters: SoukFilters;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  setFilters: (next: SoukFilters) => void;
  clearFilters: () => void;
  refetch: () => void;
}

/** Public surface: only the projection leaves this hook. */
export function useSoukBrowser(): SoukBrowserApi {
  const container = useProviderContainer();
  const [filters, setFilters] = useState<SoukFilters>(DEFAULT_SOUK_FILTERS);

  const query = useQuery({
    queryKey: ['souk', 'browser', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 15_000,
    queryFn: async (): Promise<Result<readonly SoukItem[]>> => {
      const listed = await container.repositories.souk.list({ limit: 200 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items };
    },
  });

  const rows = useMemo(() => {
    const items = query.data?.ok ? query.data.value : [];
    return filterItems(items, filters).map(toPublicItemView);
  }, [query.data, filters]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  const clearFilters = useCallback(() => setFilters(DEFAULT_SOUK_FILTERS), []);

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
