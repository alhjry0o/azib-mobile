import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { JobReport } from '@/repositories/contracts/job-engagement';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { reportJob } from '../services/engagement-service';

export interface JobReportApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly submitted: boolean;
  submit(reasonKey: string, detail: string): Promise<Result<JobReport>>;
}

export function useJobReport(jobId: string): JobReportApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const deps = useMemo(
    () => ({
      engagement: container.repositories.jobEngagement,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const submit = useCallback(
    async (reasonKey: string, detail: string): Promise<Result<JobReport>> => {
      setBusy(true);
      setError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await reportJob(deps, jobId, userId, reasonKey, detail);
      if (result.ok) {
        setSubmitted(true);
        await client.invalidateQueries({ queryKey: ['jobs'] });
      } else {
        setError(result.error);
      }
      setBusy(false);
      return result;
    },
    [deps, jobId, userId, client],
  );

  return { busy, error, submitted, submit };
}
