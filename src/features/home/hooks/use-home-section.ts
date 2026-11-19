// One query per section (never a single page-wide query).
// Backend mode is honestly NotConnected: repositories are still mocks (P03 #9).
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import type { AppMode } from '@/stores';

export type HomeSectionStatus = 'loading' | 'empty' | 'error' | 'not-connected' | 'ready';

export function homeSectionQueryKey(mode: AppMode, id: string) {
  return ['home', mode, id] as const;
}

export interface ResolveStatusInput {
  readonly mode: AppMode;
  readonly enabled: boolean;
  readonly isLoading: boolean;
  readonly result: Result<readonly unknown[]> | undefined;
}

export function resolveSectionStatus(input: ResolveStatusInput): HomeSectionStatus {
  if (input.mode !== 'demo') return 'not-connected';
  if (!input.enabled) return 'empty';
  if (input.isLoading || input.result === undefined) return 'loading';
  if (!input.result.ok) return 'error';
  return input.result.value.length === 0 ? 'empty' : 'ready';
}

export interface HomeSectionApi<T> {
  readonly status: HomeSectionStatus;
  readonly data: readonly T[];
  readonly error: AppError | null;
  readonly isFetching: boolean;
  refetch(): void;
}

export interface UseHomeSectionOptions<T> {
  /** Section-unique key segment, e.g. 'weddings'. */
  readonly id: string;
  readonly fetch: () => Promise<Result<readonly T[]>>;
  readonly enabled?: boolean;
}

export function useHomeSection<T>(options: UseHomeSectionOptions<T>): HomeSectionApi<T> {
  const container = useProviderContainer();
  const enabled = options.enabled !== false;
  const query = useQuery({
    queryKey: homeSectionQueryKey(container.mode, options.id),
    queryFn: options.fetch,
    enabled: enabled && container.mode === 'demo',
    staleTime: 30_000,
  });

  const result = query.data;
  const status = resolveSectionStatus({
    mode: container.mode,
    enabled,
    isLoading: query.isLoading,
    result,
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    status,
    data: result?.ok ? result.value : [],
    error: result && !result.ok ? result.error : null,
    isFetching: query.isFetching,
    refetch,
  };
}
