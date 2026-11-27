import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukReport } from '@/repositories/contracts/souk-report';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { createReport } from '../services/report-service';

export interface SoukReportApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly submitted: boolean;
  submit(reasonKey: string, detail: string): Promise<Result<SoukReport>>;
}

export function useSoukReport(itemId: string): SoukReportApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const deps = useMemo(
    () => ({
      reports: container.repositories.soukReports,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const submit = useCallback(
    async (reasonKey: string, detail: string): Promise<Result<SoukReport>> => {
      setBusy(true);
      setError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await createReport(deps, {
        itemId,
        targetKind: 'item',
        targetId: itemId,
        reporterId: userId,
        reasonKey,
        detail,
      });
      if (result.ok) {
        setSubmitted(true);
        await client.invalidateQueries({ queryKey: ['souk'] });
      } else {
        setError(result.error);
      }
      setBusy(false);
      return result;
    },
    [deps, itemId, userId, client],
  );

  return { busy, error, submitted, submit };
}
