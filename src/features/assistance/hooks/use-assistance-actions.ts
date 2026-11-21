import { useCallback, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  Application,
  ApplicationPayload,
} from '@/repositories/contracts/application';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { applyTransition } from '../services/workflow-service';
import { useEligibilityRules } from './use-assistance-query';

export interface ResubmitInput {
  readonly payload: ApplicationPayload;
  readonly notes: string | null;
}

export interface AssistanceActionsApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  resubmit(input: ResubmitInput): Promise<Result<Application>>;
  appeal(statement: string, documentIds: readonly string[]): Promise<Result<Application>>;
  cancel(): Promise<Result<Application>>;
  clearError(): void;
}

export function useAssistanceActions(id: string): AssistanceActionsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const rules = useEligibilityRules();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const settle = useCallback(
    async <T,>(run: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setError(null);
      const result = await run();
      if (!result.ok) setError(result.error);
      else await client.invalidateQueries({ queryKey: ['assistance'] });
      setBusy(false);
      return result;
    },
    [client],
  );

  const deps = useMemo(
    () => ({
      applications: container.repositories.applications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const resubmit = useCallback(
    (input: ResubmitInput) =>
      settle(async () => {
        const actorId = auth.user?.id;
        if (!actorId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        const patched = await container.repositories.applications.update(id, {
          payload: input.payload,
          notes: input.notes,
        });
        if (!patched.ok) return patched;
        return applyTransition(deps, {
          applicationId: id,
          to: 'submitted',
          actor: 'applicant',
          actorId,
        });
      }),
    [settle, auth.user, container, id, deps],
  );

  const appeal = useCallback(
    (statement: string, documentIds: readonly string[]) =>
      settle(async () => {
        const actorId = auth.user?.id;
        if (!actorId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return applyTransition(deps, {
          applicationId: id,
          to: 'appealed',
          actor: 'applicant',
          actorId,
          appealWindowDays: rules.data.appealWindowDays,
          patch: {
            appeal: {
              submittedAt: new Date().toISOString(),
              statement,
              documentIds: [...documentIds],
              status: 'pending',
              resolution: null,
            },
          },
        });
      }),
    [settle, auth.user, id, deps, rules.data],
  );

  const cancel = useCallback(
    () =>
      settle(async () => {
        const actorId = auth.user?.id;
        if (!actorId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return applyTransition(deps, {
          applicationId: id,
          to: 'cancelled',
          actor: 'applicant',
          actorId,
        });
      }),
    [settle, auth.user, id, deps],
  );

  return { busy, error, resubmit, appeal, cancel, clearError: () => setError(null) };
}
