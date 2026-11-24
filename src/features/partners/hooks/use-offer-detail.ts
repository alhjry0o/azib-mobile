import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Offer } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { computeOfferStats } from '../lib/stats';
import type { StatValue } from '@/features/home/stats-privacy';
import { daysRemaining, offerVisibility, type OfferVisibility } from '../state/expiry';
import { isVerified } from '../state/verification';
import { recordOfferView } from '../services/engagement-service';

export interface OfferDetailPayload {
  readonly offer: Offer;
  readonly partner: Partner | null;
  readonly verified: boolean;
  readonly visibility: OfferVisibility;
  readonly daysLeft: number | null;
  readonly views: StatValue;
  readonly saved: boolean;
  readonly evaluatedAt: string;
}

export interface OfferDetailApi {
  readonly data: OfferDetailPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function useOfferDetail(offerId: string): OfferDetailApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: ['partners', 'offer', container.mode, offerId, userId],
    enabled: container.mode === 'demo' && offerId.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<OfferDetailPayload | null>> => {
      const found = await container.repositories.offers.getById(offerId);
      if (!found.ok) return found;
      if (!found.value) return { ok: true, value: null };
      const offer = found.value;
      const partner = await container.repositories.partners.getById(offer.partnerId);
      const latest = await container.repositories.partnerVerifications.getLatest(offer.partnerId);
      const views = await container.repositories.partnerEngagement.getViews(offerId);
      const saved = userId
        ? await container.repositories.partnerEngagement.listSaved(userId)
        : { ok: true as const, value: [] };
      const now = new Date();
      const savedRows = saved.ok ? saved.value : [];
      return {
        ok: true,
        value: {
          offer,
          partner: partner.ok ? partner.value : null,
          verified: isVerified(latest.ok ? latest.value : null, now),
          visibility: offerVisibility(offer, now),
          daysLeft: daysRemaining(offer, now),
          views: computeOfferStats({
            offerId,
            views: views.ok ? views.value : 0,
            saves: 0,
          }).views,
          saved: savedRows.some((row) => row.offerId === offerId),
          evaluatedAt: now.toISOString(),
        },
      };
    },
  });

  // Counting a view is a repository write, not React state — safe in an effect.
  useEffect(() => {
    if (container.mode !== 'demo' || offerId.length === 0) return;
    let cancelled = false;
    void recordOfferView(
      {
        offers: container.repositories.offers,
        offerReports: container.repositories.offerReports,
        engagement: container.repositories.partnerEngagement,
        audit: container.repositories.audit,
      },
      offerId,
    ).then((result) => {
      if (!cancelled && result.ok) {
        void client.invalidateQueries({ queryKey: ['partners', 'offer'] });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [container, client, offerId]);

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
