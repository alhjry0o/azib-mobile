// Yemeni phone normalization. Pure, no IO. Accepts +967 / 00967 / 967 / 0 forms.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

export interface CleanedPhone {
  /** +967XXXXXXXXX */
  readonly e164: string;
  /** 967XXXXXXXXX — wa.me expects digits only. */
  readonly digits: string;
  /** 7XXXXXXXX */
  readonly national: string;
}

const VALID_SECOND_DIGITS: readonly string[] = ['0', '1', '3', '7', '8'];

export function cleanYemeniPhone(raw: string): Result<CleanedPhone> {
  const stripped = raw.replace(/[\s\-().]/g, '');
  if (stripped.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'EMPTY_PHONE' }) };
  }
  if (!/^\+?\d+$/.test(stripped)) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_YEMENI_PHONE' }) };
  }
  let digits = stripped.replace(/^\+/, '');
  if (digits.startsWith('00967')) digits = digits.slice(5);
  else if (digits.startsWith('967')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length !== 9 || digits.charAt(0) !== '7') {
    return { ok: false, error: AppError.validation({ code: 'INVALID_YEMENI_PHONE' }) };
  }
  if (!VALID_SECOND_DIGITS.includes(digits.charAt(1))) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_YEMENI_PHONE' }) };
  }
  return ok(
    Object.freeze({
      e164: `+967${digits}`,
      digits: `967${digits}`,
      national: digits,
    }),
  );
}
