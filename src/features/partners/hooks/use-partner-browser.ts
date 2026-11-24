import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Partner } from '@/repositories/contracts/partner';
import { useProviderContainer } from '@/providers';
import {
  DEFAULT_PARTNER_FILTERS,
  filterPartners,
  type PartnerFilters,
  type VerificationIndex,
} from '../lib/filters';
import { isVerified, type VerificationSnapshot } from '../state/verification';

export interface PartnerRow {
  readonly partner: Partner;
  readonly verified: boolean;
  readonly offerCount: number;
}

interface BrowserPayload {
  readonly rows: readonly PartnerRow[];
  readonly evaluatedAt: string;
}

export interface PartnerBrowserApi {
  readonly rows: readonly PartnerRow[];
  readonly filters: PartnerFilters;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  setFilters: (next: PartnerFilters) => void;
  clearFilters: () => void;
  refetch: () => void;
}

export function usePartnerBrowser(): PartnerBrowserApi {
  const container = useProviderContainer();
  const [filters, setFilters] = useState<PartnerFilters>(DEFAULT_PARTNER_FILTERS);

  const query = useQuery({
    queryKey: ['partners', 'browser', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 15_000,
    queryFn: async (): Promise<Result<BrowserPayload>> => {
      const listed = await container.repositories.partners.list({ limit: 100 });
      if (!listed.ok) return listed;
      const offers = await container.repositories.offers.list({ limit: 200 });
      if (!offers.ok) return offers;
      const now = new Date();
      const rows: PartnerRow[] = [];
      for (const partner of listed.value.items) {
        const latest = await container.repositories.partnerVerifications.getLatest(partner.id);
        const snapshot: VerificationSnapshot | null = latest.ok ? latest.value : null;
        rows.push({
          partner,
          verified: isVerified(snapshot, now),
          offerCount: offers.value.items.filter((o) => o.partnerId === partner.id).length,
        });
      }
      return { ok: true, value: { rows, evaluatedAt: now.toISOString() } };
    },
  });

  const payload = query.data?.ok ? query.data.value : null;

  const rows = useMemo(() => {
    if (!payload) return [];
    const index: Record<string, VerificationSnapshot | null> = {};
    for (const row of payload.rows) {
      index[row.partner.id] = row.verified
        ? { status: 'verified', validUntil: null }
        : null;
    }
    const index_: VerificationIndex = index;
    const allowed = filterPartners(
      payload.rows.map((r) => r.partner),
      filters,
      index_,
      new Date(payload.evaluatedAt),
    );
    const ids = new Set(allowed.map((p) => p.id));
    return payload.rows.filter((r) => ids.has(r.partner.id));
  }, [payload, filters]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  const clearFilters = useCallback(() => setFilters(DEFAULT_PARTNER_FILTERS), []);

  return {
    rows,
    filters,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    setFilters,
    clearFilters,
    refetch,
  };
}
