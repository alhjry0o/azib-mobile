import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Disbursement } from '@/repositories/contracts/disbursement';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { beneficiaryRespond } from '../services/disbursement-service';

export type BeneficiaryOutcome = 'confirmed_by_beneficiary' | 'disputed';

export interface DisbursementActionsApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  respond(
    id: string,
    outcome: BeneficiaryOutcome,
    note?: string,
  ): Promise<Result<Disbursement>>;
  clearError(): void;
}

export function useDisbursementActions(): DisbursementActionsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      disbursements: container.repositories.disbursements,
      applications: container.repositories.applications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const respond = useCallback(
    async (
      id: string,
      outcome: BeneficiaryOutcome,
      note?: string,
    ): Promise<Result<Disbursement>> => {
      setBusy(true);
      setError(null);
      const beneficiaryUserId = auth.user?.id;
      if (!beneficiaryUserId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await beneficiaryRespond(deps, id, {
        beneficiaryUserId,
        outcome,
        note,
      });
      if (result.ok) await client.invalidateQueries({ queryKey: ['finance'] });
      else setError(result.error);
      setBusy(false);
      return result;
    },
    [auth.user, deps, client],
  );

  return { busy, error, respond, clearError: () => setError(null) };
}
