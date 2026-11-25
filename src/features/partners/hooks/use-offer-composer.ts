import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Offer } from '@/repositories/contracts/offer';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  cancelOffer,
  createOfferDraft,
  editOfferDraft,
  renewOffer,
  submitOfferForReview,
} from '../services/offer-lifecycle-service';
import { pickPrepareUploadMedia } from '../services/media-service';
import { OfferDraftSchema, type OfferDraftValues } from '../schemas/offer';

export const EMPTY_OFFER_DRAFT: OfferDraftValues = Object.freeze({
  title: '',
  category: 'halls',
  governorateId: '',
  discountType: 'percent',
  discountValue: 0,
  audience: 'beneficiaries',
  products: [],
  terms: null,
  validFrom: '',
  validUntil: '',
  imageFileIds: [],
}) as OfferDraftValues;

export interface OfferComposerApi {
  readonly form: OfferDraftValues;
  readonly busy: boolean;
  readonly uploading: boolean;
  readonly error: AppError | null;
  readonly fieldErrors: Readonly<Record<string, string>>;
  patch: (patch: Partial<OfferDraftValues>) => void;
  uploadImage: () => Promise<Result<void>>;
  removeImage: (fileId: string) => void;
  saveDraft: (partnerId: string, offerId: string | null) => Promise<Result<Offer>>;
  submitForReview: (offerId: string) => Promise<Result<Offer>>;
  cancel: (offerId: string) => Promise<Result<Offer>>;
  renew: (offerId: string, validFrom: string, validUntil: string) => Promise<Result<Offer>>;
}

export function useOfferComposer(initial?: OfferDraftValues): OfferComposerApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [form, setForm] = useState<OfferDraftValues>(initial ?? EMPTY_OFFER_DRAFT);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({});

  const deps = useMemo(
    () => ({
      offers: container.repositories.offers,
      partners: container.repositories.partners,
      verifications: container.repositories.partnerVerifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const patch = useCallback((next: Partial<OfferDraftValues>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const uploadImage = useCallback(async (): Promise<Result<void>> => {
    setUploading(true);
    setError(null);
    const result = await pickPrepareUploadMedia(container.storage, 'image');
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return result;
    }
    if (!result.value) return { ok: true, value: undefined };
    const fileId = result.value.fileId;
    setForm((prev) => ({ ...prev, imageFileIds: [...prev.imageFileIds, fileId] }));
    return { ok: true, value: undefined };
  }, [container]);

  const removeImage = useCallback((fileId: string) => {
    setForm((prev) => ({
      ...prev,
      imageFileIds: prev.imageFileIds.filter((id) => id !== fileId),
    }));
  }, []);

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['partners'] });
      else setError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const saveDraft = useCallback(
    (partnerId: string, offerId: string | null) =>
      run(async () => {
        const parsed = OfferDraftSchema.safeParse(form);
        if (!parsed.success) {
          const out: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? 'form');
            if (out[key] === undefined) out[key] = issue.message;
          }
          setFieldErrors(out);
          return { ok: false, error: AppError.validation({ code: 'INVALID_OFFER' }) };
        }
        setFieldErrors({});
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return offerId
          ? editOfferDraft(deps, offerId, userId, parsed.data)
          : createOfferDraft(deps, userId, partnerId, parsed.data);
      }),
    [run, form, userId, deps],
  );

  const submitForReview = useCallback(
    (offerId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return submitOfferForReview(deps, offerId, userId);
      }),
    [run, userId, deps],
  );

  const cancel = useCallback(
    (offerId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return cancelOffer(deps, offerId, userId);
      }),
    [run, userId, deps],
  );

  const renew = useCallback(
    (offerId: string, validFrom: string, validUntil: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return renewOffer(deps, offerId, userId, validFrom, validUntil);
      }),
    [run, userId, deps],
  );

  return {
    form,
    busy,
    uploading,
    error,
    fieldErrors,
    patch,
    uploadImage,
    removeImage,
    saveDraft,
    submitForReview,
    cancel,
    renew,
  };
}
