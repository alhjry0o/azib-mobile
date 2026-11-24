import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Offer } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import { useProviderContainer } from '@/providers';
import { daysRemaining, offerVisibility, type OfferVisibility } from '../state/expiry';
import { isVerified } from '../state/verification';

export interface OfferView {
  readonly offer: Offer;
  readonly visibility: OfferVisibility;
  readonly daysLeft: number | null;
}

export interface PartnerProfilePayload {
  readonly partner: Partner;
  readonly verified: boolean;
  readonly offers: readonly OfferView[];
  readonly evaluatedAt: string;
}

export interface PartnerProfileApi {
  readonly data: PartnerProfilePayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function usePartnerProfile(partnerId: string): PartnerProfileApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: ['partners', 'profile', container.mode, partnerId],
    enabled: container.mode === 'demo' && partnerId.length > 0,
    staleTime: 10_000,
    queryFn: async (): Promise<Result<PartnerProfilePayload | null>> => {
      const found = await container.repositories.partners.getById(partnerId);
      if (!found.ok) return found;
      if (!found.value) return { ok: true, value: null };
      const latest = await container.repositories.partnerVerifications.getLatest(partnerId);
      const offers = await container.repositories.offers.list({ limit: 200 });
      if (!offers.ok) return offers;
      const now = new Date();
      const views: OfferView[] = offers.value.items
        .filter((o) => o.partnerId === partnerId)
        .map((offer) => ({
          offer,
          visibility: offerVisibility(offer, now),
          daysLeft: daysRemaining(offer, now),
        }))
        .filter((v) => v.visibility === 'live' || v.visibility === 'scheduled');
      return {
        ok: true,
        value: {
          partner: found.value,
          verified: isVerified(latest.ok ? latest.value : null, now),
          offers: views,
          evaluatedAt: now.toISOString(),
        },
      };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
