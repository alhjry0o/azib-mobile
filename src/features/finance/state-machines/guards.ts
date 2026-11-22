// Pure financial guards (P09.1). No IO, no React.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { ApplicationStatus } from '@/repositories/contracts/application';

/** Maker and Checker must be different people; a missing maker cannot be separated. */
export function assertDistinctMakerChecker(
  makerId: string | null | undefined,
  checkerId: string,
): Result<void> {
  if (!makerId || makerId.trim().length === 0) {
    return { ok: false, error: AppError.conflict({ code: 'MAKER_REQUIRED' }) };
  }
  if (!checkerId || checkerId.trim().length === 0) {
    return { ok: false, error: AppError.validation({ code: 'CHECKER_REQUIRED' }) };
  }
  if (makerId === checkerId) {
    return { ok: false, error: AppError.forbidden({ code: 'MAKER_EQUALS_CHECKER' }) };
  }
  return ok(undefined);
}

export function assertProofReference(
  reference: string | null | undefined,
): Result<string> {
  const trimmed = (reference ?? '').trim();
  if (trimmed.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'PROOF_REQUIRED' }) };
  }
  if (trimmed.length > 200) {
    return { ok: false, error: AppError.validation({ code: 'PROOF_TOO_LONG' }) };
  }
  return ok(trimmed);
}

export function assertPositiveIntegerAmount(amount: number): Result<number> {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_AMOUNT' }) };
  }
  return ok(amount);
}

/** Cumulative disbursements may never exceed the approved requested amount. */
export function assertAmountWithinCap(
  existingTotal: number,
  amount: number,
  cap: number,
): Result<void> {
  const valid = assertPositiveIntegerAmount(amount);
  if (!valid.ok) return valid;
  if (!Number.isFinite(existingTotal) || existingTotal < 0) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_EXISTING_TOTAL' }) };
  }
  if (existingTotal + amount > cap) {
    return { ok: false, error: AppError.conflict({ code: 'AMOUNT_CAP_EXCEEDED' }) };
  }
  return ok(undefined);
}

/** 'disbursed' is the legacy alias of 'disbursing' and stays readable. */
export const DISBURSABLE_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'approved',
  'disbursing',
  'disbursed',
];

export function assertApplicationDisbursable(status: ApplicationStatus): Result<void> {
  if (!DISBURSABLE_APPLICATION_STATUSES.includes(status)) {
    return { ok: false, error: AppError.conflict({ code: 'APPLICATION_NOT_APPROVED' }) };
  }
  return ok(undefined);
}

/** Rejected proposals do not consume the cap. */
export function committedTotal(
  rows: readonly { readonly amount: number; readonly status: string }[],
): number {
  let sum = 0;
  for (const row of rows) {
    if (row.status === 'rejected') continue;
    if (Number.isFinite(row.amount)) sum += row.amount;
  }
  return sum;
}
