import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { OfferReport } from '@/repositories/contracts/offer-report';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { reportOffer, saveOffer, unsaveOffer } from '../services/engagement-service';

export interface OfferActionsApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  save(): Promise<Result<unknown>>;
  unsave(): Promise<Result<void>>;
  report(reasonKey: string, detail: string): Promise<Result<OfferReport>>;
  clearError(): void;
}

export function useOfferActions(offerId: string): OfferActionsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      offers: container.repositories.offers,
      offerReports: container.repositories.offerReports,
      engagement: container.repositories.partnerEngagement,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['partners'] });
      else setError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const save = useCallback(
    () =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return saveOffer(deps, offerId, userId);
      }),
    [run, userId, deps, offerId],
  );

  const unsave = useCallback(
    () =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return unsaveOffer(deps, offerId, userId);
      }),
    [run, userId, deps, offerId],
  );

  const report = useCallback(
    (reasonKey: string, detail: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return reportOffer(deps, offerId, userId, reasonKey, detail);
      }),
    [run, userId, deps, offerId],
  );

  return { busy, error, save, unsave, report, clearError: () => setError(null) };
}
