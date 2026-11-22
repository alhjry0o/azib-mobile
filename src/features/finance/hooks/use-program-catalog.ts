import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Program } from '@/repositories/contracts/program';
import { useProviderContainer } from '@/providers';
import type { AppMode } from '@/stores';

export function programCatalogQueryKey(mode: AppMode) {
  return ['finance', 'programs', mode] as const;
}
export function programDetailQueryKey(mode: AppMode, id: string) {
  return ['finance', 'program', mode, id] as const;
}

export interface ProgramCatalogApi {
  readonly programs: readonly Program[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch(): void;
}

export function useProgramCatalog(): ProgramCatalogApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: programCatalogQueryKey(container.mode),
    enabled: container.mode === 'demo',
    staleTime: 30_000,
    queryFn: async (): Promise<Result<readonly Program[]>> => {
      const listed = await container.repositories.programs.list({ limit: 50 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items.filter((p) => p.status === 'open') };
    },
  });
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  return {
    programs: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}

export interface ProgramDetailApi {
  readonly program: Program | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch(): void;
}

export function useProgramDetail(id: string): ProgramDetailApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: programDetailQueryKey(container.mode, id),
    enabled: container.mode === 'demo' && id.length > 0,
    staleTime: 30_000,
    queryFn: () => container.repositories.programs.getById(id),
  });
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  return {
    program: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
