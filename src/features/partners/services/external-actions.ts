// Boundary module (ADR-0022): the ONLY place expo-linking and Share are called.
// The allowlist is enforced BEFORE any URL leaves the app (D-6).
import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import { AppError, toAppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { isAllowedExternalUrl } from '../lib/external-links';

export async function openExternalUrl(url: string): Promise<Result<void>> {
  if (!isAllowedExternalUrl(url)) {
    return { ok: false, error: AppError.forbidden({ code: 'EXTERNAL_URL_BLOCKED' }) };
  }
  try {
    await Linking.openURL(url);
    return ok(undefined);
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

/** Native share sheet. Returns true when the user actually shared. */
export async function shareText(message: string): Promise<Result<boolean>> {
  const text = message.trim();
  if (text.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'EMPTY_SHARE' }) };
  }
  try {
    const result = await Share.share({ message: text });
    return ok(result.action === Share.sharedAction);
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}
