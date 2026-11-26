import { useQuery } from '@tanstack/react-query';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_SOUK_LIMITS,
  SYSTEM_SETTINGS_KEY,
  resolveSoukLimits,
  type SoukLimits,
} from '../state/limits';

export interface SoukLimitsApi {
  readonly limits: SoukLimits;
  readonly isLoading: boolean;
}

export function useSoukLimits(): SoukLimitsApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: ['souk', 'limits', container.mode],
    staleTime: 60_000,
    queryFn: async (): Promise<SoukLimits> => {
      const found = await container.repositories.settings.get(SYSTEM_SETTINGS_KEY);
      if (!found.ok || !found.value) return DEFAULT_SOUK_LIMITS;
      return resolveSoukLimits(found.value.value);
    },
  });
  return { limits: query.data ?? DEFAULT_SOUK_LIMITS, isLoading: query.isLoading };
}
