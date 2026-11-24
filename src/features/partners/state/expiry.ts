// Expiry is derived from validUntil. The client computes and displays it,
// but never writes the 'expired' status (D-7).
import type { OfferStatus } from '@/repositories/contracts/offer';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface OfferValidity {
  readonly status: OfferStatus;
  readonly validFrom?: string | null;
  readonly validUntil?: string | null;
}

export type OfferVisibility = 'live' | 'scheduled' | 'expired' | 'not_published';

export function isExpired(offer: Pick<OfferValidity, 'validUntil'>, now: Date): boolean {
  const until = offer.validUntil ?? null;
  if (until === null) return false;
  const stamp = Date.parse(until);
  if (Number.isNaN(stamp)) return false;
  return stamp <= now.getTime();
}

export function hasStarted(offer: Pick<OfferValidity, 'validFrom'>, now: Date): boolean {
  const from = offer.validFrom ?? null;
  if (from === null) return true;
  const stamp = Date.parse(from);
  if (Number.isNaN(stamp)) return true;
  return stamp <= now.getTime();
}

export function offerVisibility(offer: OfferValidity, now: Date): OfferVisibility {
  if (offer.status !== 'active') return 'not_published';
  if (isExpired(offer, now)) return 'expired';
  if (!hasStarted(offer, now)) return 'scheduled';
  return 'live';
}

export function isPublished(offer: OfferValidity, now: Date): boolean {
  return offerVisibility(offer, now) === 'live';
}

/** Whole days remaining, floored at 0. Null validity means open-ended (null). */
export function daysRemaining(
  offer: Pick<OfferValidity, 'validUntil'>,
  now: Date,
): number | null {
  const until = offer.validUntil ?? null;
  if (until === null) return null;
  const stamp = Date.parse(until);
  if (Number.isNaN(stamp)) return null;
  return Math.max(0, Math.floor((stamp - now.getTime()) / DAY_MS));
}
