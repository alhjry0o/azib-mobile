import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { daysRemaining, offerVisibility } from '../state/expiry';
import type { OfferView } from './use-partner-profile';

export interface SavedOffersApi {
  readonly rows: readonly OfferView[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function useSavedOffers(): SavedOffersApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: ['partners', 'saved', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly OfferView[]>> => {
      if (!userId) return { ok: true, value: [] };
      const saved = await container.repositories.partnerEngagement.listSaved(userId);
      if (!saved.ok) return saved;
      const now = new Date();
      const rows: OfferView[] = [];
      for (const row of saved.value) {
        const found = await container.repositories.offers.getById(row.offerId);
        if (!found.ok) return found;
        if (!found.value) continue;
        rows.push({
          offer: found.value,
          visibility: offerVisibility(found.value, now),
          daysLeft: daysRemaining(found.value, now),
        });
      }
      return { ok: true, value: rows };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    rows: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
