import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  AmbassadorApplication,
  AmbassadorTask,
} from '@/repositories/contracts/ambassador';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { applyAmbassador, submitAmbassadorTask } from '../services/ambassador-service';
import { pickPrepareUploadMedia } from '../services/media-service';

export interface AmbassadorPayload {
  readonly application: AmbassadorApplication | null;
  readonly tasks: readonly AmbassadorTask[];
}

export interface AmbassadorApi {
  readonly application: AmbassadorApplication | null;
  readonly tasks: readonly AmbassadorTask[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  apply(governorateIds: readonly string[], motivation: string): Promise<Result<AmbassadorApplication>>;
  submitTask(
    taskId: string,
    nominatedPartnerId: string | null,
    photoFileIds: readonly string[],
  ): Promise<Result<AmbassadorTask>>;
  uploadPhoto(): Promise<Result<string | null>>;
  refetch(): void;
}

export function useAmbassador(): AmbassadorApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      ambassadors: container.repositories.ambassadors,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['partners', 'ambassador', container.mode, userId],
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<AmbassadorPayload>> => {
      if (!userId) return { ok: true, value: { application: null, tasks: [] } };
      const application = await deps.ambassadors.getApplicationByUser(userId);
      if (!application.ok) return application;
      const tasks = await deps.ambassadors.listTasks(userId);
      if (!tasks.ok) return tasks;
      return { ok: true, value: { application: application.value, tasks: tasks.value } };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setActionError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['partners'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const apply = useCallback(
    (governorateIds: readonly string[], motivation: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return applyAmbassador(deps, userId, governorateIds, motivation);
      }),
    [run, userId, deps],
  );

  const submitTask = useCallback(
    (taskId: string, nominatedPartnerId: string | null, photoFileIds: readonly string[]) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return submitAmbassadorTask(deps, taskId, userId, { nominatedPartnerId, photoFileIds });
      }),
    [run, userId, deps],
  );

  const uploadPhoto = useCallback(async (): Promise<Result<string | null>> => {
    setBusy(true);
    setActionError(null);
    const result = await pickPrepareUploadMedia(container.storage, 'image');
    setBusy(false);
    if (!result.ok) {
      setActionError(result.error);
      return result;
    }
    return { ok: true, value: result.value?.fileId ?? null };
  }, [container]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    application: query.data?.ok ? query.data.value.application : null,
    tasks: query.data?.ok ? query.data.value.tasks : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    busy,
    actionError,
    apply,
    submitTask,
    uploadPhoto,
    refetch,
  };
}
