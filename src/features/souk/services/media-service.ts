// Reuses the proven P08 upload pipeline (AGENT_RULES §1 #7): type/size checks,
// image re-encoding (drops EXIF), failure ⇒ NO upload, metadata fingerprint.
// LIMIT: the fingerprint is metadata-based; renaming evades it (#51).
// Limits are Souk-owned so partner changes cannot affect this feature.
import type { Result } from '@/core/result';
import type { FileStorageProvider, UploadedFile } from '@/providers/contracts/storage';
import {
  pickImageDocument,
  prepareDocument,
} from '@/features/assistance/services/document-pipeline';
import { SOUK_MEDIA_LIMITS } from '../state/limits';

export interface SoukImage {
  readonly fileId: string;
  readonly fingerprint: string;
}

export async function pickPrepareUploadSoukImage(
  storage: FileStorageProvider,
): Promise<Result<SoukImage | null>> {
  const picked = await pickImageDocument();
  if (!picked.ok) return picked;
  if (!picked.value) return { ok: true, value: null };

  const prepared = await prepareDocument(picked.value, SOUK_MEDIA_LIMITS);
  if (!prepared.ok) return prepared;

  const uploaded: Result<UploadedFile> = await storage.uploadFile(prepared.value.uri, {
    contentType: prepared.value.mimeType,
  });
  if (!uploaded.ok) return uploaded;

  return {
    ok: true,
    value: Object.freeze({
      fileId: uploaded.value.id,
      fingerprint: prepared.value.sha256,
    }),
  };
}
