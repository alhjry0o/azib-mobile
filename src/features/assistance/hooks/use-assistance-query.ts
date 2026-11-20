import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Program } from '@/repositories/contracts/program';
import { useProviderContainer } from '@/providers';
import { RULES_V1, getRulesSource } from '../engine';
import type { EligibilityRules } from '../engine/rules.types';

export function rulesQueryKey(sourceId: string) {
  return ['assistance', 'rules', sourceId] as const;
}

export interface RulesApi {
  readonly data: EligibilityRules;
  readonly isLoading: boolean;
}

export function useEligibilityRules(): RulesApi {
  const source = getRulesSource();
  const query = useQuery({
    queryKey: rulesQueryKey(source.id),
    queryFn: () => source.load(),
    staleTime: Infinity,
  });
  return {
    data: query.data?.ok ? query.data.value : RULES_V1,
    isLoading: query.isLoading,
  };
}

export interface ProgramsApi {
  readonly programs: readonly Program[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  refetch(): void;
}

export function useOpenPrograms(): ProgramsApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: ['assistance', 'programs', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 30_000,
    queryFn: async (): Promise<Result<readonly Program[]>> => {
      const listed = await container.repositories.programs.list({ limit: 50 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items.filter((p) => p.status === 'open') };
    },
  });
  return {
    programs: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
