import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Partner } from '@/repositories/contracts/partner';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { pickPrepareUploadMedia } from '../services/media-service';
import { registerPartner, resubmitVerification } from '../services/registration-service';
import { PartnerRegistrationSchema } from '../schemas/registration';

export interface RegistrationForm {
  readonly displayName: string;
  readonly category: string;
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly city: string | null;
  readonly contactPhone: string;
  readonly whatsapp: string | null;
  readonly imageFileIds: readonly string[];
  readonly documentFileIds: readonly string[];
  readonly termsAccepted: boolean;
}

export const EMPTY_REGISTRATION: RegistrationForm = Object.freeze({
  displayName: '',
  category: 'halls',
  description: '',
  governorateId: '',
  districtId: null,
  city: null,
  contactPhone: '',
  whatsapp: null,
  imageFileIds: [],
  documentFileIds: [],
  termsAccepted: false,
});

export interface PartnerRegistrationApi {
  readonly form: RegistrationForm;
  readonly busy: boolean;
  readonly uploading: boolean;
  readonly error: AppError | null;
  readonly fieldErrors: Readonly<Record<string, string>>;
  patch: (patch: Partial<RegistrationForm>) => void;
  uploadMedia: (target: 'image' | 'document', source: 'image' | 'pdf') => Promise<Result<void>>;
  removeMedia: (target: 'image' | 'document', fileId: string) => void;
  submit: () => Promise<Result<Partner>>;
  resubmit: (partnerId: string) => Promise<Result<Partner>>;
}

export function usePartnerRegistration(): PartnerRegistrationApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [form, setForm] = useState<RegistrationForm>(EMPTY_REGISTRATION);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({});

  const deps = useMemo(
    () => ({
      partners: container.repositories.partners,
      verifications: container.repositories.partnerVerifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const patch = useCallback((next: Partial<RegistrationForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const uploadMedia = useCallback(
    async (target: 'image' | 'document', source: 'image' | 'pdf'): Promise<Result<void>> => {
      setUploading(true);
      setError(null);
      const result = await pickPrepareUploadMedia(container.storage, source);
      setUploading(false);
      if (!result.ok) {
        setError(result.error);
        return result;
      }
      if (!result.value) return { ok: true, value: undefined };
      const fileId = result.value.fileId;
      setForm((prev) =>
        target === 'image'
          ? { ...prev, imageFileIds: [...prev.imageFileIds, fileId] }
          : { ...prev, documentFileIds: [...prev.documentFileIds, fileId] },
      );
      return { ok: true, value: undefined };
    },
    [container],
  );

  const removeMedia = useCallback((target: 'image' | 'document', fileId: string) => {
    setForm((prev) =>
      target === 'image'
        ? { ...prev, imageFileIds: prev.imageFileIds.filter((id) => id !== fileId) }
        : { ...prev, documentFileIds: prev.documentFileIds.filter((id) => id !== fileId) },
    );
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

  const submit = useCallback(async (): Promise<Result<Partner>> => {
    setBusy(true);
    setError(null);
    const parsed = PartnerRegistrationSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(collect(parsed.error.issues));
      const failure = AppError.validation({ code: 'INVALID_REGISTRATION' });
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
    const result = await registerPartner(deps, { ...parsed.data, ownerId: userId });
    if (result.ok) {
      await client.invalidateQueries({ queryKey: ['partners'] });
      setForm(EMPTY_REGISTRATION);
    } else {
      setError(result.error);
    }
    setBusy(false);
    return result;
  }, [form, collect, userId, deps, client]);

  const resubmit = useCallback(
    async (partnerId: string): Promise<Result<Partner>> => {
      setBusy(true);
      setError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await resubmitVerification(deps, partnerId, userId, form.documentFileIds);
      if (result.ok) await client.invalidateQueries({ queryKey: ['partners'] });
      else setError(result.error);
      setBusy(false);
      return result;
    },
    [userId, deps, form.documentFileIds, client],
  );

  return {
    form,
    busy,
    uploading,
    error,
    fieldErrors,
    patch,
    uploadMedia,
    removeMedia,
    submit,
    resubmit,
  };
}
