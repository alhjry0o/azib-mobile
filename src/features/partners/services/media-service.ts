// Reuses the proven assistance upload pipeline (AGENT_RULES §1 #7):
// type/size validation, image re-encoding (drops EXIF), failure ⇒ NO upload.
// Only the limits differ, and they live in the marketplace config.
import type { Result } from '@/core/result';
import type { FileStorageProvider, UploadedFile } from '@/providers/contracts/storage';
import {
  pickImageDocument,
  pickPdfDocument,
  prepareDocument,
} from '@/features/assistance/services/document-pipeline';
import { PARTNER_MEDIA_LIMITS } from '../config/limits';

export interface UploadedPartnerMedia {
  readonly fileId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly sha256: string;
}

export async function pickPrepareUploadMedia(
  storage: FileStorageProvider,
  source: 'image' | 'pdf',
): Promise<Result<UploadedPartnerMedia | null>> {
  const picked = source === 'image' ? await pickImageDocument() : await pickPdfDocument();
  if (!picked.ok) return picked;
  if (!picked.value) return { ok: true, value: null };

  const prepared = await prepareDocument(picked.value, PARTNER_MEDIA_LIMITS);
  if (!prepared.ok) return prepared;

  const uploaded: Result<UploadedFile> = await storage.uploadFile(prepared.value.uri, {
    contentType: prepared.value.mimeType,
  });
  if (!uploaded.ok) return uploaded;

  return {
    ok: true,
    value: Object.freeze({
      fileId: uploaded.value.id,
      fileName: prepared.value.name,
      mimeType: prepared.value.mimeType,
      size: prepared.value.size,
      sha256: prepared.value.sha256,
    }),
  };
}
