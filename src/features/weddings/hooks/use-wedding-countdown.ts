import { useQuery } from '@tanstack/react-query';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';

export interface CountdownValue {
  readonly scheduledDate: string;
  readonly days: number;
  readonly hours: number;
  readonly isPast: boolean;
  readonly progress: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 90 * DAY_MS;

/** The clock is read inside queryFn, never during render. */
export function useWeddingCountdown(groupId: string) {
  const container = useProviderContainer();
  return useQuery({
    queryKey: ['weddings', 'countdown', container.mode, groupId],
    enabled: container.mode === 'demo' && groupId.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<Result<CountdownValue | null>> => {
      const found = await container.repositories.weddings.getById(groupId);
      if (!found.ok) return found;
      if (!found.value) return { ok: true, value: null };
      const target = Date.parse(found.value.scheduledDate);
      const now = Date.now();
      const remaining = Number.isNaN(target) ? 0 : target - now;
      const clamped = Math.max(0, remaining);
      return {
        ok: true,
        value: {
          scheduledDate: found.value.scheduledDate,
          days: Math.floor(clamped / DAY_MS),
          hours: Math.floor((clamped % DAY_MS) / (60 * 60 * 1000)),
          isPast: remaining <= 0,
          progress: Math.max(0, Math.min(1, 1 - clamped / WINDOW_MS)),
        },
      };
    },
  });
}
