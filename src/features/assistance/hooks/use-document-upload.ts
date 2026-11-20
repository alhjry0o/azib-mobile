import { useCallback, useState } from 'react';
import type { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  ApplicationDocument,
  ApplicationDocumentKind,
} from '@/repositories/contracts/application';
import { useProviderContainer } from '@/providers';
import {
  pickImageDocument,
  pickPdfDocument,
  prepareDocument,
} from '../services/document-pipeline';
import { useEligibilityRules } from './use-assistance-query';

export type DocumentSource = 'image' | 'pdf';

export interface DocumentUploadApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  upload(kind: ApplicationDocumentKind, source: DocumentSource): Promise<Result<ApplicationDocument | null>>;
  clearError(): void;
}

export function useDocumentUpload(): DocumentUploadApi {
  const container = useProviderContainer();
  const rules = useEligibilityRules();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const upload = useCallback(
    async (
      kind: ApplicationDocumentKind,
      source: DocumentSource,
    ): Promise<Result<ApplicationDocument | null>> => {
      setBusy(true);
      setError(null);
      const fail = (e: AppError): Result<ApplicationDocument | null> => {
        setError(e);
        setBusy(false);
        return { ok: false, error: e };
      };

      const picked = source === 'image' ? await pickImageDocument() : await pickPdfDocument();
      if (!picked.ok) return fail(picked.error);
      if (!picked.value) {
        setBusy(false);
        return ok(null);
      }

      const prepared = await prepareDocument(picked.value, rules.data.documentLimits);
      if (!prepared.ok) return fail(prepared.error);

      const uploaded = await container.storage.uploadFile(prepared.value.uri, {
        contentType: prepared.value.mimeType,
      });
      if (!uploaded.ok) return fail(uploaded.error);

      setBusy(false);
      return ok({
        id: uploaded.value.id,
        kind,
        fileId: uploaded.value.id,
        fileName: prepared.value.name,
        mimeType: prepared.value.mimeType,
        size: prepared.value.size,
        sha256: prepared.value.sha256,
        uploadedAt: new Date().toISOString(),
      });
    },
    [container, rules.data],
  );

  return { busy, error, upload, clearError: () => setError(null) };
}
