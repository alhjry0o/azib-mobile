// Maps AppError to a translation key. Provider codes win over generic kinds.
import type { AppError, AppErrorKind } from '@/core/errors';

const KIND_KEYS: Record<AppErrorKind, string> = {
  Network: 'errors:network',
  Auth: 'errors:auth',
  Forbidden: 'errors:forbidden',
  Validation: 'errors:validation',
  NotFound: 'errors:notFound',
  Conflict: 'errors:conflict',
  NotConnected: 'errors:notConnected',
  Unknown: 'errors:unknown',
};

const CODE_KEYS: ReadonlySet<string> = new Set([
  'INVALID_CREDENTIALS',
  'AUTH_TOO_MANY_ATTEMPTS',
  'EMAIL_TAKEN',
  'OTP_INVALID',
  'OTP_EXPIRED',
  'OTP_MAX_ATTEMPTS',
  'OTP_RESEND_COOLDOWN',
  'NO_PENDING_VERIFICATION',
  'ACCOUNT_NOT_FOUND',
  'EMPTY_CREDENTIALS',
  'CHALLENGE_NOT_FOUND',
]);

export function authErrorKey(error: AppError): string {
  const code = error.meta.code;
  if (code && CODE_KEYS.has(code)) return `auth:codes.${code}`;
  return KIND_KEYS[error.kind];
}
