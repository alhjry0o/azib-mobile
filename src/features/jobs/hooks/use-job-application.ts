import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { JobApplication } from '@/repositories/contracts/job-application';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { applyToJob, withdrawApplication } from '../services/application-service';
import { pickPrepareUploadCv, type UploadedCv } from '../services/cv-service';
import { toApplicantOwnView, type ApplicantOwnView } from '../state/public-view';
import { useJobLimits } from './use-job-limits';

export interface JobApplyApi {
  readonly cv: UploadedCv | null;
  readonly busy: boolean;
  readonly uploading: boolean;
  readonly error: AppError | null;
  uploadCv(source: 'image' | 'pdf'): Promise<Result<void>>;
  removeCv(): void;
  apply(headline: string, message: string): Promise<Result<JobApplication>>;
}

export function useJobApply(jobId: string): JobApplyApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const { limits } = useJobLimits();
  const userId = auth.user?.id ?? null;
  const [cv, setCv] = useState<UploadedCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      jobs: container.repositories.jobs,
      jobApplications: container.repositories.jobApplications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const uploadCv = useCallback(
    async (source: 'image' | 'pdf'): Promise<Result<void>> => {
      setUploading(true);
      setError(null);
      const result = await pickPrepareUploadCv(container.storage, source);
      setUploading(false);
      if (!result.ok) {
        setError(result.error);
        return result;
      }
      setCv(result.value);
      return { ok: true, value: undefined };
    },
    [container],
  );

  const removeCv = useCallback(() => setCv(null), []);

  const apply = useCallback(
    async (headline: string, message: string): Promise<Result<JobApplication>> => {
      setBusy(true);
      setError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await applyToJob(
        deps,
        jobId,
        userId,
        headline,
        message,
        cv?.fileId ?? null,
        limits,
        new Date(),
      );
      if (result.ok) {
        await client.invalidateQueries({ queryKey: ['jobs'] });
        setCv(null);
      } else {
        setError(result.error);
      }
      setBusy(false);
      return result;
    },
    [deps, jobId, userId, cv, limits, client],
  );

  return { cv, busy, uploading, error, uploadCv, removeCv, apply };
}

export interface MyApplicationsApi {
  readonly rows: readonly ApplicantOwnView[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  withdraw(applicationId: string): Promise<Result<JobApplication>>;
  refetch: () => void;
}

export function useMyApplications(): MyApplicationsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      jobs: container.repositories.jobs,
      jobApplications: container.repositories.jobApplications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['jobs', 'my-applications', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly ApplicantOwnView[]>> => {
      if (!userId) return { ok: true, value: [] };
      const listed = await container.repositories.jobApplications.listByApplicant(userId);
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.map(toApplicantOwnView) };
    },
  });

  const withdraw = useCallback(
    async (applicationId: string): Promise<Result<JobApplication>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await withdrawApplication(deps, applicationId, userId, new Date());
      if (result.ok) await client.invalidateQueries({ queryKey: ['jobs'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [deps, userId, client],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    rows: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    busy,
    actionError,
    withdraw,
    refetch,
  };
}
