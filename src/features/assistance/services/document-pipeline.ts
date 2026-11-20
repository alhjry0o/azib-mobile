// Boundary module (ADR-0022): the ONLY place document/image pickers and the
// manipulator are called for assistance documents.
// Privacy: images are re-encoded (drops EXIF). PDFs are validated only — we
// never claim to strip PDF metadata (D-7). Processing failure ⇒ NO upload.
// Fingerprint: demo-grade sha256 over metadata; content HMAC lands in P18.
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppError, toAppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { DocumentLimits } from '../engine/rules.types';
import { sha256Hex } from './hash';

export const PDF_MIME_TYPE = 'application/pdf';
export const IMAGE_MIME_TYPES: readonly string[] = ['image/jpeg', 'image/png'];
export const DOCUMENT_MAX_WIDTH = 1600;

export interface PickedDocument {
  readonly uri: string;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
}

export interface PreparedDocument extends PickedDocument {
  readonly sha256: string;
}

export async function pickImageDocument(): Promise<Result<PickedDocument | null>> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, error: AppError.forbidden({ code: 'PHOTO_PERMISSION_DENIED' }) };
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (picked.canceled) return ok(null);
    const asset = picked.assets[0];
    if (!asset) return ok(null);
    return ok({
      uri: asset.uri,
      name: asset.fileName ?? 'document.jpg',
      size: asset.fileSize ?? 0,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

export async function pickPdfDocument(): Promise<Result<PickedDocument | null>> {
  try {
    const picked = await DocumentPicker.getDocumentAsync({
      type: [PDF_MIME_TYPE],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) return ok(null);
    const asset = picked.assets[0];
    if (!asset) return ok(null);
    return ok({
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? PDF_MIME_TYPE,
    });
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

export function validateDocument(
  document: PickedDocument,
  limits: DocumentLimits,
): Result<void> {
  const isPdf = document.mimeType === PDF_MIME_TYPE;
  const isImage = IMAGE_MIME_TYPES.includes(document.mimeType);
  if (!isPdf && !isImage) {
    return { ok: false, error: AppError.validation({ code: 'UNSUPPORTED_DOCUMENT_TYPE' }) };
  }
  if (!limits.allowedMimeTypes.includes(document.mimeType)) {
    return { ok: false, error: AppError.validation({ code: 'UNSUPPORTED_DOCUMENT_TYPE' }) };
  }
  const max = isPdf ? limits.pdfMaxBytes : limits.imageMaxBytes;
  if (document.size > max) {
    return { ok: false, error: AppError.validation({ code: 'DOCUMENT_TOO_LARGE' }) };
  }
  return ok(undefined);
}

export async function prepareDocument(
  document: PickedDocument,
  limits: DocumentLimits,
): Promise<Result<PreparedDocument>> {
  const valid = validateDocument(document, limits);
  if (!valid.ok) return valid;

  const hashed = await sha256Hex(`${document.mimeType}|${document.size}|${document.name}`);
  if (!hashed.ok) return hashed;

  if (document.mimeType === PDF_MIME_TYPE) {
    return ok({ ...document, sha256: hashed.value });
  }

  try {
    const processed = await ImageManipulator.manipulateAsync(
      document.uri,
      [{ resize: { width: DOCUMENT_MAX_WIDTH } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );
    return ok({
      uri: processed.uri,
      name: document.name,
      mimeType: 'image/jpeg',
      size: document.size,
      sha256: hashed.value,
    });
  } catch (caught) {
    return {
      ok: false,
      error: AppError.unknown({ code: 'DOCUMENT_PROCESSING_FAILED', cause: caught }),
    };
  }
}
