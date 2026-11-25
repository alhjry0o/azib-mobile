// Dual handover confirmation with a demo-labelled code (D-6).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

export const HANDOVER_CODE_PREFIX = 'AZIB-DEMO-HO';
export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const RATING_NOTE_MAX = 300;

/** Deterministic and demo-labelled. The official code is server-side (P18). */
export function buildHandoverCode(requestId: string, acceptedAt: string): string {
  const tail = `${requestId}${acceptedAt}`.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `${HANDOVER_CODE_PREFIX}-${tail.padStart(6, '0')}`;
}

export function isHandoverComplete(
  donorConfirmedAt: string | null | undefined,
  recipientConfirmedAt: string | null | undefined,
): boolean {
  return Boolean(donorConfirmedAt) && Boolean(recipientConfirmedAt);
}

export interface ConfirmInput {
  readonly requestStatus: string;
  readonly storedCode: string | null;
  readonly enteredCode: string;
  readonly donorId: string;
  readonly requesterId: string;
  readonly userId: string;
}

export type ConfirmRole = 'donor' | 'recipient';

export function assertCanConfirmHandover(input: ConfirmInput): Result<ConfirmRole> {
  if (input.requestStatus !== 'accepted') {
    return { ok: false, error: AppError.conflict({ code: 'HANDOVER_NOT_READY' }) };
  }
  const role: ConfirmRole | null =
    input.userId === input.donorId
      ? 'donor'
      : input.userId === input.requesterId
        ? 'recipient'
        : null;
  if (role === null) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_A_PARTY' }) };
  }
  if (!input.storedCode || input.enteredCode.trim() !== input.storedCode) {
    return { ok: false, error: AppError.validation({ code: 'HANDOVER_CODE_MISMATCH' }) };
  }
  return ok(role);
}

export interface RatingInput {
  readonly score: number;
  readonly note?: string | null;
}

export interface ValidRating {
  readonly score: number;
  readonly note: string | null;
}

/** Experience quality only. Never a moral or behaviour score (D-7). */
export function validateRating(input: RatingInput): Result<ValidRating> {
  if (
    !Number.isInteger(input.score) ||
    input.score < RATING_MIN ||
    input.score > RATING_MAX
  ) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_RATING' }) };
  }
  const note = (input.note ?? '').trim();
  if (note.length > RATING_NOTE_MAX) {
    return { ok: false, error: AppError.validation({ code: 'RATING_NOTE_TOO_LONG' }) };
  }
  return ok({ score: input.score, note: note.length > 0 ? note : null });
}
