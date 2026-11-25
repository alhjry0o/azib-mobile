import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Offer } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import type { PartnerVerification } from '@/repositories/contracts/partner-verification';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { computeOfferStats, type OfferStats } from '../lib/stats';
import { daysRemaining, offerVisibility, type OfferVisibility } from '../state/expiry';
import { isVerified } from '../state/verification';

export interface MyOfferRow {
  readonly offer: Offer;
  readonly visibility: OfferVisibility;
  readonly daysLeft: number | null;
  readonly stats: OfferStats;
}

export interface MyPartnerPayload {
  readonly partner: Partner | null;
  readonly verification: PartnerVerification | null;
  readonly verified: boolean;
  readonly offers: readonly MyOfferRow[];
}

export interface MyPartnerApi {
  readonly data: MyPartnerPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function useMyPartner(): MyPartnerApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: ['partners', 'mine', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<MyPartnerPayload>> => {
      const empty: MyPartnerPayload = {
        partner: null,
        verification: null,
        verified: false,
        offers: [],
      };
      if (!userId) return { ok: true, value: empty };
      const listed = await container.repositories.partners.list({ limit: 100 });
      if (!listed.ok) return listed;
      const partner = listed.value.items.find((p) => p.ownerId === userId) ?? null;
      if (!partner) return { ok: true, value: empty };

      const latest = await container.repositories.partnerVerifications.getLatest(partner.id);
      const offers = await container.repositories.offers.list({ limit: 200 });
      if (!offers.ok) return offers;
      const mine = offers.value.items.filter((o) => o.partnerId === partner.id);
      const counters = await container.repositories.partnerEngagement.getViewsForOffers(
        mine.map((o) => o.id),
      );
      const views = counters.ok ? counters.value : {};
      const now = new Date();
      const rows: MyOfferRow[] = mine.map((offer) => ({
        offer,
        visibility: offerVisibility(offer, now),
        daysLeft: daysRemaining(offer, now),
        stats: computeOfferStats({
          offerId: offer.id,
          views: views[offer.id] ?? 0,
          saves: 0,
        }),
      }));
      return {
        ok: true,
        value: {
          partner,
          verification: latest.ok ? latest.value : null,
          verified: isVerified(latest.ok ? latest.value : null, now),
          offers: rows,
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
