import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { saveJob, unsaveJob } from '../services/engagement-service';
import { daysRemaining, isAcceptingApplications, jobVisibility, type JobVisibility } from '../state/expiry';
import {
  toApplicantOwnView,
  toPublicJobView,
  type ApplicantOwnView,
  type PublicJobView,
} from '../state/public-view';

export interface JobDetailPayload {
  readonly job: PublicJobView;
  readonly isOwner: boolean;
  readonly saved: boolean;
  readonly myApplication: ApplicantOwnView | null;
  readonly canApply: boolean;
  readonly visibility: JobVisibility;
  readonly daysLeft: number | null;
}

export interface JobDetailApi {
  readonly data: JobDetailPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  toggleSave(): Promise<Result<unknown>>;
  refetch: () => void;
}

export function useJobDetail(jobId: string): JobDetailApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const engagementDeps = useMemo(
    () => ({
      engagement: container.repositories.jobEngagement,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['jobs', 'detail', container.mode, jobId, userId],
    enabled: container.mode === 'demo' && jobId.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<JobDetailPayload | null>> => {
      const found = await container.repositories.jobs.getById(jobId);
      if (!found.ok) return found;
      const job = found.value;
      if (!job) return { ok: true, value: null };
      const now = new Date();
      const isOwner = userId !== null && job.publisherId === userId;

      let saved = false;
      let myApplication: ApplicantOwnView | null = null;
      if (userId) {
        const saves = await container.repositories.jobEngagement.listSaved(userId);
        saved = saves.ok ? saves.value.some((s) => s.jobId === jobId) : false;
        const mine = await container.repositories.jobApplications.listByApplicant(userId);
        if (!mine.ok) return mine;
        const application = mine.value.find((a) => a.jobId === jobId) ?? null;
        myApplication = application ? toApplicantOwnView(application) : null;
      }

      return {
        ok: true,
        value: {
          job: toPublicJobView(job),
          isOwner,
          saved,
          myApplication,
          canApply:
            userId !== null && !isOwner && myApplication === null && isAcceptingApplications(job, now),
          visibility: jobVisibility(job, now),
          daysLeft: daysRemaining(job.expiresAt ?? null, now),
        },
      };
    },
  });

  const toggleSave = useCallback(async (): Promise<Result<unknown>> => {
    setBusy(true);
    setActionError(null);
    if (!userId) {
      const failure = AppError.auth({ code: 'NO_SESSION' });
      setActionError(failure);
      setBusy(false);
      return { ok: false, error: failure };
    }
    const isSaved = query.data?.ok ? query.data.value?.saved === true : false;
    const result = isSaved
      ? await unsaveJob(engagementDeps, jobId, userId)
      : await saveJob(engagementDeps, jobId, userId);
    if (result.ok) await client.invalidateQueries({ queryKey: ['jobs'] });
    else setActionError(result.error);
    setBusy(false);
    return result;
  }, [userId, query.data, engagementDeps, jobId, client]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    busy,
    actionError,
    toggleSave,
    refetch,
  };
}
