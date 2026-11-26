import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukCondition, SoukDeliveryMethod, SoukItem } from '@/repositories/contracts/souk';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { buildItemDraftSchema } from '../schemas/item';
import { createItemDraft, submitItemForPublication } from '../services/item-service';
import { pickPrepareUploadSoukImage, type SoukImage } from '../services/media-service';
import { useSoukLimits } from './use-souk-limits';

export interface SoukComposerForm {
  readonly title: string;
  readonly category: string;
  readonly condition: SoukCondition;
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly deliveryMethod: SoukDeliveryMethod;
  readonly estimatedValue: number | null;
  readonly noResaleConsent: boolean;
}

export const EMPTY_SOUK_FORM: SoukComposerForm = Object.freeze({
  title: '',
  category: 'furniture',
  condition: 'good',
  description: '',
  governorateId: '',
  districtId: null,
  deliveryMethod: 'self_pickup',
  estimatedValue: null,
  noResaleConsent: false,
});

export interface SoukComposerApi {
  readonly form: SoukComposerForm;
  readonly images: readonly SoukImage[];
  readonly maxImages: number;
  readonly busy: boolean;
  readonly uploading: boolean;
  readonly error: AppError | null;
  readonly fieldErrors: Readonly<Record<string, string>>;
  patch: (patch: Partial<SoukComposerForm>) => void;
  addImage: () => Promise<Result<void>>;
  removeImage: (fileId: string) => void;
  submit: () => Promise<Result<SoukItem>>;
}

export function useSoukComposer(): SoukComposerApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const { limits } = useSoukLimits();
  const userId = auth.user?.id ?? null;
  const [form, setForm] = useState<SoukComposerForm>(EMPTY_SOUK_FORM);
  const [images, setImages] = useState<readonly SoukImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({});

  const deps = useMemo(
    () => ({ souk: container.repositories.souk, audit: container.repositories.audit }),
    [container],
  );

  const schema = useMemo(
    () => buildItemDraftSchema(limits.maxItemImages),
    [limits.maxItemImages],
  );

  const patch = useCallback((next: Partial<SoukComposerForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const addImage = useCallback(async (): Promise<Result<void>> => {
    setUploading(true);
    setError(null);
    if (images.length >= limits.maxItemImages) {
      const failure = AppError.validation({ code: 'TOO_MANY_IMAGES' });
      setError(failure);
      setUploading(false);
      return { ok: false, error: failure };
    }
    const result = await pickPrepareUploadSoukImage(container.storage);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return result;
    }
    if (!result.value) return { ok: true, value: undefined };
    const uploaded = result.value;
    setImages((prev) => [...prev, uploaded]);
    return { ok: true, value: undefined };
  }, [container, images.length, limits.maxItemImages]);

  const removeImage = useCallback((fileId: string) => {
    setImages((prev) => prev.filter((image) => image.fileId !== fileId));
  }, []);

  const submit = useCallback(async (): Promise<Result<SoukItem>> => {
    setBusy(true);
    setError(null);
    const candidate = {
      ...form,
      imageFileIds: images.map((i) => i.fileId),
      imageFingerprints: images.map((i) => i.fingerprint),
    };
    const parsed = schema.safeParse(candidate);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (out[key] === undefined) out[key] = issue.message;
      }
      setFieldErrors(out);
      const failure = AppError.validation({ code: 'INVALID_ITEM' });
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
    const created = await createItemDraft(
      deps,
      { ...parsed.data, donorId: userId },
      limits,
      now,
    );
    if (!created.ok) {
      setError(created.error);
      setBusy(false);
      return created;
    }
    const published = await submitItemForPublication(
      deps,
      created.value.id,
      userId,
      limits,
      now,
    );
    if (!published.ok) {
      setError(published.error);
      setBusy(false);
      return published;
    }
    await client.invalidateQueries({ queryKey: ['souk'] });
    setForm(EMPTY_SOUK_FORM);
    setImages([]);
    setBusy(false);
    return published;
  }, [schema, form, images, userId, deps, limits, client]);

  return {
    form,
    images,
    maxImages: limits.maxItemImages,
    busy,
    uploading,
    error,
    fieldErrors,
    patch,
    addImage,
    removeImage,
    submit,
  };
}
