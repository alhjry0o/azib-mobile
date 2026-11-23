import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_DISCOVERY_FILTERS,
  filterGroups,
  type DiscoveryFilters,
  type DiscoveryRow,
} from '../engine/discovery';

export interface WeddingDiscoveryApi {
  readonly rows: readonly DiscoveryRow[];
  readonly filters: DiscoveryFilters;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  setFilters: (next: DiscoveryFilters) => void;
  clearFilters: () => void;
  refetch: () => void;
}

export function useWeddingDiscovery(): WeddingDiscoveryApi {
  const container = useProviderContainer();
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);

  const query = useQuery({
    queryKey: ['weddings', 'discovery', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 15_000,
    queryFn: async (): Promise<Result<readonly DiscoveryRow[]>> => {
      const listed = await container.repositories.weddings.list({ limit: 50 });
      if (!listed.ok) return listed;
      const rows: DiscoveryRow[] = [];
      for (const wedding of listed.value.items) {
        const members = await container.repositories.weddingGroups.listMembers(wedding.id);
        const memberCount = members.ok
          ? members.value.filter((m) => m.status === 'active').length
          : 0;
        rows.push({ wedding, memberCount });
      }
      return { ok: true, value: rows };
    },
  });

  const all = query.data?.ok ? query.data.value : [];
  const rows = useMemo(() => filterGroups(all, filters), [all, filters]);
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  const clearFilters = useCallback(() => setFilters(DEFAULT_DISCOVERY_FILTERS), []);

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
