// Boundary module (ADR-0022): the ONLY place expo-crypto is called.
// Real HMAC over document bytes lives in an Edge Function in P18.
import * as Crypto from 'expo-crypto';
import { AppError, toAppError } from '@/core/errors';
import type { Result } from '@/core/result';

export async function sha256Hex(input: string): Promise<Result<string>> {
  const normalized = input.trim();
  if (normalized.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'EMPTY_HASH_INPUT' }) };
  }
  try {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      normalized,
    );
    return { ok: true, value: digest };
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

/** Case/whitespace-insensitive fingerprint for identity numbers and phones. */
export async function fingerprint(value: string): Promise<Result<string>> {
  return sha256Hex(value.replace(/[\s-]/g, '').toLowerCase());
}
