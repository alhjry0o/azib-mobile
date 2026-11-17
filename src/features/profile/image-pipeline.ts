// ALL expo-image-picker / expo-image-manipulator calls live here so the
// surface is easy to adjust if the SDK API differs.
// Privacy rule: if normalization fails we DO NOT upload the original file.
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppError, toAppError } from '@/core/errors';
import type { Result } from '@/core/result';

export const AVATAR_SIZE = 512;
export const MAX_AVATAR_BYTES = 8 * 1024 * 1024;

export interface PickedImage {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
}

export interface CropRect {
  readonly originX: number;
  readonly originY: number;
  readonly width: number;
  readonly height: number;
}

/** Center square of any rectangle. Pure and unit-testable. */
export function centerSquare(width: number, height: number): CropRect {
  const side = Math.max(1, Math.min(width, height));
  return {
    originX: Math.max(0, Math.floor((width - side) / 2)),
    originY: Math.max(0, Math.floor((height - side) / 2)),
    width: side,
    height: side,
  };
}

export async function pickAvatar(): Promise<Result<PickedImage | null>> {
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
    if (picked.canceled) return { ok: true, value: null };
    const asset = picked.assets[0];
    if (!asset) return { ok: true, value: null };
    if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_AVATAR_BYTES) {
      return { ok: false, error: AppError.validation({ code: 'AVATAR_TOO_LARGE' }) };
    }
    return {
      ok: true,
      value: { uri: asset.uri, width: asset.width, height: asset.height },
    };
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

/**
 * Center-crops to a square, resizes to AVATAR_SIZE and re-encodes as JPEG.
 * Re-encoding drops EXIF metadata (device verification still pending).
 */
export async function normalizeAvatar(image: PickedImage): Promise<Result<string>> {
  try {
    const context = ImageManipulator.manipulate(image.uri);
    context.crop(centerSquare(image.width, image.height));
    context.resize({ width: AVATAR_SIZE, height: AVATAR_SIZE });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { ok: true, value: saved.uri };
  } catch (caught) {
    return {
      ok: false,
      error: AppError.unknown({ code: 'IMAGE_PROCESSING_FAILED', cause: caught }),
    };
  }
}
