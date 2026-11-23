import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Wedding } from '@/repositories/contracts/wedding';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { createGroup } from '../services/group-service';
import { buildCreateGroupSchema } from '../schemas/group';
import { useWeddingLimits } from './use-wedding-limits';

export interface CreateGroupForm {
  readonly title: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly city: string | null;
  readonly scheduledDate: string;
  readonly alternateDate: string | null;
  readonly targetCount: number | null;
  readonly description: string | null;
  readonly withdrawalConsent: boolean;
}

export const EMPTY_GROUP_FORM: CreateGroupForm = Object.freeze({
  title: '',
  governorateId: '',
  districtId: null,
  city: null,
  scheduledDate: '',
  alternateDate: null,
  targetCount: null,
  description: null,
  withdrawalConsent: false,
});

export interface CreateGroupApi {
  readonly form: CreateGroupForm;
  readonly maxGroupSize: number;
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly fieldErrors: Readonly<Record<string, string>>;
  patch: (patch: Partial<CreateGroupForm>) => void;
  validateStep: (step: number) => boolean;
  submit: () => Promise<Result<Wedding>>;
  clearErrors: () => void;
}

export function useCreateGroup(): CreateGroupApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const limits = useWeddingLimits();
  const [form, setForm] = useState<CreateGroupForm>(EMPTY_GROUP_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({});

  const schema = useMemo(
    () => buildCreateGroupSchema(limits.maxGroupSize),
    [limits.maxGroupSize],
  );

  const deps = useMemo(
    () => ({
      weddings: container.repositories.weddings,
      groups: container.repositories.weddingGroups,
      notifications: container.repositories.notifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const patch = useCallback((next: Partial<CreateGroupForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const collect = useCallback(
    (issues: readonly { path: readonly (string | number | symbol)[]; message: string }[]) => {
      const out: Record<string, string> = {};
      for (const issue of issues) {
        const key = String(issue.path[0] ?? 'form');
        if (out[key] === undefined) out[key] = issue.message;
      }
      return out;
    },
    [],
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const candidate = { ...form, targetCount: form.targetCount ?? 0 };
      const parsed = schema.safeParse(candidate);
      const all = parsed.success ? {} : collect(parsed.error.issues);
      const stepFields: readonly string[] =
        step === 0
          ? ['title', 'governorateId', 'districtId', 'city']
          : step === 1
            ? ['scheduledDate', 'alternateDate', 'targetCount']
            : ['description', 'withdrawalConsent'];
      const scoped: Record<string, string> = {};
      for (const field of stepFields) {
        const message = all[field];
        if (message) scoped[field] = message;
      }
      setFieldErrors(scoped);
      return Object.keys(scoped).length === 0;
    },
    [form, schema, collect],
  );

  const submit = useCallback(async (): Promise<Result<Wedding>> => {
    setBusy(true);
    setError(null);
    const parsed = schema.safeParse({ ...form, targetCount: form.targetCount ?? 0 });
    if (!parsed.success) {
      setFieldErrors(collect(parsed.error.issues));
      const failure = AppError.validation({ code: 'INVALID_GROUP' });
      setError(failure);
      setBusy(false);
      return { ok: false, error: failure };
    }
    const organizerId = auth.user?.id;
    if (!organizerId) {
      const failure = AppError.auth({ code: 'NO_SESSION' });
      setError(failure);
      setBusy(false);
      return { ok: false, error: failure };
    }
    const result = await createGroup(deps, {
      organizerId,
      title: parsed.data.title,
      governorateId: parsed.data.governorateId,
      districtId: parsed.data.districtId,
      city: parsed.data.city,
      scheduledDate: parsed.data.scheduledDate,
      alternateDate: parsed.data.alternateDate,
      targetCount: parsed.data.targetCount,
      description: parsed.data.description,
      maxGroupSize: limits.maxGroupSize,
    });
    if (result.ok) {
      await client.invalidateQueries({ queryKey: ['weddings'] });
      setForm(EMPTY_GROUP_FORM);
      setFieldErrors({});
    } else {
      setError(result.error);
    }
    setBusy(false);
    return result;
  }, [schema, form, collect, auth.user, deps, limits.maxGroupSize, client]);

  return {
    form,
    maxGroupSize: limits.maxGroupSize,
    busy,
    error,
    fieldErrors,
    patch,
    validateStep,
    submit,
    clearErrors: () => {
      setError(null);
      setFieldErrors({});
    },
  };
}
