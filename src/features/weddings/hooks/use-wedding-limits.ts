import { useQuery } from '@tanstack/react-query';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_MAX_GROUP_SIZE,
  SYSTEM_SETTINGS_KEY,
  resolveMaxGroupSize,
} from '../config/limits';

export interface WeddingLimitsApi {
  readonly maxGroupSize: number;
  readonly fromSettings: boolean;
  readonly isLoading: boolean;
}

export function useWeddingLimits(): WeddingLimitsApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: ['weddings', 'limits', container.mode],
    staleTime: 60_000,
    queryFn: async () => {
      const found = await container.repositories.settings.get(SYSTEM_SETTINGS_KEY);
      if (!found.ok || !found.value) return { max: DEFAULT_MAX_GROUP_SIZE, fromSettings: false };
      const max = resolveMaxGroupSize(found.value.value);
      return { max, fromSettings: max !== DEFAULT_MAX_GROUP_SIZE };
    },
  });
  return {
    maxGroupSize: query.data?.max ?? DEFAULT_MAX_GROUP_SIZE,
    fromSettings: query.data?.fromSettings === true,
    isLoading: query.isLoading,
  };
}
