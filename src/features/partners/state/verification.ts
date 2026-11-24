// The Verified crown comes ONLY from a live verification record (D-3).
// Partner.status is deliberately NOT an input to isVerified.
import type { PartnerVerification } from '@/repositories/contracts/partner-verification';

const DAY_MS = 24 * 60 * 60 * 1000;

export type VerificationSnapshot = Pick<PartnerVerification, 'status' | 'validUntil'>;

export function isVerificationActive(
  verification: VerificationSnapshot | null | undefined,
  now: Date,
): boolean {
  if (!verification || verification.status !== 'verified') return false;
  const until = verification.validUntil ?? null;
  if (until === null) return true;
  const stamp = Date.parse(until);
  if (Number.isNaN(stamp)) return false;
  return stamp > now.getTime();
}

/**
 * Badge source of truth. A partner whose `status` field says 'verified'
 * but has no live record gets NO crown.
 */
export function isVerified(
  verification: VerificationSnapshot | null | undefined,
  now: Date,
): boolean {
  return isVerificationActive(verification, now);
}

export function reverifyDeadline(verifiedAt: string, intervalDays: number): string | null {
  const stamp = Date.parse(verifiedAt);
  if (Number.isNaN(stamp) || !Number.isFinite(intervalDays) || intervalDays <= 0) return null;
  return new Date(stamp + intervalDays * DAY_MS).toISOString();
}

export function needsReverification(
  verification: VerificationSnapshot | null | undefined,
  now: Date,
): boolean {
  if (!verification || verification.status !== 'verified') return false;
  return !isVerificationActive(verification, now);
}
