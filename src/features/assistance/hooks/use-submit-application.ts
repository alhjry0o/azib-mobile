import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Application } from '@/repositories/contracts/application';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { useAssistanceDraftStore } from '@/stores';
import { buildPayload } from '../schemas/wizard';
import { submitAssistance } from '../services/submission-service';
import { useEligibilityRules } from './use-assistance-query';

export interface SubmitApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  submit(): Promise<Result<Application>>;
}

export function useSubmitApplication(): SubmitApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const rules = useEligibilityRules();
  const client = useQueryClient();
  const draft = useAssistanceDraftStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const submit = useCallback(async (): Promise<Result<Application>> => {
    const fail = (e: AppError): Result<Application> => {
      setError(e);
      setBusy(false);
      return { ok: false, error: e };
    };
    setBusy(true);
    setError(null);

    const applicantId = auth.user?.id;
    if (!applicantId) return fail(AppError.auth({ code: 'NO_SESSION' }));
    if (!draft.programId) return fail(AppError.validation({ code: 'NO_PROGRAM' }));
    if (!draft.requestedAmount || draft.requestedAmount <= 0) {
      return fail(AppError.validation({ code: 'INVALID_AMOUNT' }));
    }

    const payload = buildPayload(draft);
    if (!payload.ok) return fail(payload.error);

    const result = await submitAssistance(
      { applications: container.repositories.applications, audit: container.repositories.audit },
      {
        applicantId,
        programId: draft.programId,
        requestedAmount: draft.requestedAmount,
        notes: draft.notes.trim().length > 0 ? draft.notes.trim() : null,
        payload: payload.value,
        rules: rules.data,
      },
    );
    if (!result.ok) return fail(result.error);

    draft.reset();
    await client.invalidateQueries({ queryKey: ['assistance'] });
    setBusy(false);
    return result;
  }, [auth.user, container, client, draft, rules.data]);

  return { busy, error, submit };
}
