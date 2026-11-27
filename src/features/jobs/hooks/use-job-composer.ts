import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Job, JobApplicationMethod, JobSchedule, JobWorkType } from '@/repositories/contracts/job';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { JobDraftSchema } from '../schemas';
import { createJobDraft, publishJob } from '../services/job-service';
import { useJobLimits } from './use-job-limits';

export interface JobComposerForm {
  readonly title: string;
  readonly publisherName: string;
  readonly category: string;
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly workType: JobWorkType;
  readonly schedule: JobSchedule;
  readonly salaryMin: number | null;
  readonly salaryMax: number | null;
  readonly requirements: readonly string[];
  readonly applicationMethod: JobApplicationMethod;
  readonly applicationInstructions: string | null;
  readonly deadline: string | null;
  readonly publisherTermsAccepted: boolean;
}

export const EMPTY_JOB_FORM: JobComposerForm = Object.freeze({
  title: '',
  publisherName: '',
  category: 'retail',
  description: '',
  governorateId: '',
  districtId: null,
  workType: 'professional',
  schedule: 'full_time',
  salaryMin: null,
  salaryMax: null,
  requirements: [],
  applicationMethod: 'in_app',
  applicationInstructions: null,
  deadline: null,
  publisherTermsAccepted: false,
});

export interface JobComposerApi {
  readonly form: JobComposerForm;
  readonly requireReview: boolean;
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly fieldErrors: Readonly<Record<string, string>>;
  patch: (patch: Partial<JobComposerForm>) => void;
  submit: () => Promise<Result<Job>>;
}

export function useJobComposer(): JobComposerApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const { limits } = useJobLimits();
  const userId = auth.user?.id ?? null;
  const [form, setForm] = useState<JobComposerForm>(EMPTY_JOB_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({});

  const deps = useMemo(
    () => ({ jobs: container.repositories.jobs, audit: container.repositories.audit }),
    [container],
  );

  const patch = useCallback((next: Partial<JobComposerForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const submit = useCallback(async (): Promise<Result<Job>> => {
    setBusy(true);
    setError(null);
    const parsed = JobDraftSchema.safeParse(form);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (out[key] === undefined) out[key] = issue.message;
      }
      setFieldErrors(out);
      const failure = AppError.validation({ code: 'INVALID_JOB' });
      setError(failure);
      setBusy(false);
      return { ok: false, error: failure };
    }
    setFieldErrors({});
    if (!userId) {
      const failure = AppError.auth({ code: 'NO_SESSION' });
      setError(failure);
      setBusy(false);
      return { ok: false, error: failure };
    }
    const now = new Date();
    const created = await createJobDraft(
      deps,
      { ...parsed.data, publisherId: userId },
      limits,
      now,
    );
    if (!created.ok) {
      setError(created.error);
      setBusy(false);
      return created;
    }
    const published = await publishJob(deps, created.value.id, userId, limits, now);
    if (!published.ok) {
      setError(published.error);
      setBusy(false);
      return published;
    }
    await client.invalidateQueries({ queryKey: ['jobs'] });
    setForm(EMPTY_JOB_FORM);
    setBusy(false);
    return published;
  }, [form, userId, deps, limits, client]);

  return {
    form,
    requireReview: limits.requireReview,
    busy,
    error,
    fieldErrors,
    patch,
    submit,
  };
}
