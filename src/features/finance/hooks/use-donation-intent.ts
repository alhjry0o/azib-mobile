import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import { AppError as Errors } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Donation } from '@/repositories/contracts/donation';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  createDonationIntent,
  handoffToProvider,
  simulateProviderOutcome,
} from '../services/donation-intent-service';
import { buildIdempotencyKey } from '../services/idempotency';

export interface DonationIntentApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly donation: Donation | null;
  create(amount: number, anonymous: boolean): Promise<Result<Donation>>;
  handoff(): Promise<Result<Donation>>;
  simulateConfirm(): Promise<Result<Donation>>;
}

export function useDonationIntent(programId: string): DonationIntentApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);

  const deps = useMemo(
    () => ({
      donations: container.repositories.donations,
      payment: container.payment,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const settle = useCallback(
    async (run: () => Promise<Result<Donation>>): Promise<Result<Donation>> => {
      setBusy(true);
      setError(null);
      const result = await run();
      if (result.ok) {
        setDonation(result.value);
        await client.invalidateQueries({ queryKey: ['finance'] });
      } else {
        setError(result.error);
      }
      setBusy(false);
      return result;
    },
    [client],
  );

  const create = useCallback(
    (amount: number, anonymous: boolean) =>
      settle(async () => {
        const donorId = auth.user?.id;
        if (!donorId) return { ok: false, error: Errors.auth({ code: 'NO_SESSION' }) };
        return createDonationIntent(deps, {
          donorId,
          programId,
          amount,
          anonymous,
          idempotencyKey: buildIdempotencyKey({ donorId, programId, amount, anonymous }),
        });
      }),
    [settle, auth.user, deps, programId],
  );

  const handoff = useCallback(
    () =>
      settle(async () => {
        if (!donation) return { ok: false, error: Errors.conflict({ code: 'NO_INTENT' }) };
        return handoffToProvider(deps, donation.id);
      }),
    [settle, donation, deps],
  );

  const simulateConfirm = useCallback(
    () =>
      settle(async () => {
        if (!donation) return { ok: false, error: Errors.conflict({ code: 'NO_INTENT' }) };
        return simulateProviderOutcome(deps, donation.id, 'confirm');
      }),
    [settle, donation, deps],
  );

  return { busy, error, donation, create, handoff, simulateConfirm };
}
