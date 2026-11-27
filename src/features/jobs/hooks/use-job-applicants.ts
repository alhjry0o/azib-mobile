import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { JobApplication } from '@/repositories/contracts/job-application';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  hireApplication,
  markApplicationViewed,
  rejectApplication,
  shortlistApplication,
} from '../services/application-service';
import { readApplicantCvFileId } from '../services/cv-service';
import { toEmployerApplicantView, type EmployerApplicantView } from '../state/public-view';

export interface ApplicantsPayload {
  readonly isOwner: boolean;
  readonly rows: readonly EmployerApplicantView[];
}

export interface JobApplicantsApi {
  readonly data: ApplicantsPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  markViewed(applicationId: string): Promise<Result<JobApplication>>;
  shortlist(applicationId: string): Promise<Result<JobApplication>>;
  reject(applicationId: string, reasonKey: string): Promise<Result<JobApplication>>;
  hire(applicationId: string): Promise<Result<JobApplication>>;
  readCv(applicationId: string): Promise<Result<string>>;
  refetch: () => void;
}

/** Employer-only. If the viewer is not the publisher, NO applicant is fetched. */
export function useJobApplicants(jobId: string): JobApplicantsApi {
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
    queryKey: ['jobs', 'applicants', container.mode, jobId, userId],
    enabled: container.mode === 'demo' && jobId.length > 0 && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<ApplicantsPayload>> => {
      const job = await container.repositories.jobs.getById(jobId);
      if (!job.ok) return job;
      if (!job.value) return { ok: false, error: AppError.notFound({ code: 'JOB_NOT_FOUND' }) };
      if (job.value.publisherId !== userId) {
        return { ok: true, value: { isOwner: false, rows: [] } };
      }
      const listed = await container.repositories.jobApplications.listByJob(jobId);
      if (!listed.ok) return listed;
      return {
        ok: true,
        value: { isOwner: true, rows: listed.value.map(toEmployerApplicantView) },
      };
    },
  });

  const run = useCallback(
    async (fn: () => Promise<Result<JobApplication>>): Promise<Result<JobApplication>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['jobs'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [userId, client],
  );

  const markViewed = useCallback(
    (applicationId: string) =>
      run(() => markApplicationViewed(deps, applicationId, userId ?? '', 'member', new Date())),
    [run, deps, userId],
  );
  const shortlist = useCallback(
    (applicationId: string) =>
      run(() => shortlistApplication(deps, applicationId, userId ?? '', 'member', new Date())),
    [run, deps, userId],
  );
  const reject = useCallback(
    (applicationId: string, reasonKey: string) =>
      run(() =>
        rejectApplication(deps, applicationId, userId ?? '', 'member', new Date(), reasonKey),
      ),
    [run, deps, userId],
  );
  const hire = useCallback(
    (applicationId: string) =>
      run(() => hireApplication(deps, applicationId, userId ?? '', 'member', new Date())),
    [run, deps, userId],
  );

  const readCv = useCallback(
    async (applicationId: string): Promise<Result<string>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await readApplicantCvFileId(deps, applicationId, userId, 'member');
      if (!result.ok) setActionError(result.error);
      setBusy(false);
      return result;
    },
    [deps, userId],
  );

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
    markViewed,
    shortlist,
    reject,
    hire,
    readCv,
    refetch,
  };
}
