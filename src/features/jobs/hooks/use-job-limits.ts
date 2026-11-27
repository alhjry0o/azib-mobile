import { useQuery } from '@tanstack/react-query';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_JOB_LIMITS,
  SYSTEM_SETTINGS_KEY,
  resolveJobLimits,
  type JobLimits,
} from '../state/limits';

export interface JobLimitsApi {
  readonly limits: JobLimits;
  readonly isLoading: boolean;
}

export function useJobLimits(): JobLimitsApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: ['jobs', 'limits', container.mode],
    staleTime: 60_000,
    queryFn: async (): Promise<JobLimits> => {
      const found = await container.repositories.settings.get(SYSTEM_SETTINGS_KEY);
      if (!found.ok || !found.value) return DEFAULT_JOB_LIMITS;
      return resolveJobLimits(found.value.value);
    },
  });
  return { limits: query.data ?? DEFAULT_JOB_LIMITS, isLoading: query.isLoading };
}
