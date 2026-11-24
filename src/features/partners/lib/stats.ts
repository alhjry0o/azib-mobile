// Aggregate-only engagement stats. No viewer identity, and small numbers are
// suppressed by reusing the proven P07 policy module (D-8).
// buildStatCell is amount-coupled and has no meaning here (no money in stats),
// so only the count suppressor is reused.
import {
  SMALL_NUMBER_THRESHOLD,
  suppressSmallNumber,
  type StatValue,
} from '@/features/home/stats-privacy';

export interface OfferStatsInput {
  readonly offerId: string;
  readonly views: number;
  readonly saves: number;
  readonly threshold?: number;
}

export interface OfferStats {
  readonly offerId: string;
  readonly views: StatValue;
  readonly saves: StatValue;
  readonly threshold: number;
}

export function computeOfferStats(input: OfferStatsInput): OfferStats {
  const threshold = input.threshold ?? SMALL_NUMBER_THRESHOLD;
  return Object.freeze({
    offerId: input.offerId,
    views: suppressSmallNumber(input.views, threshold),
    saves: suppressSmallNumber(input.saves, threshold),
    threshold,
  });
}

export function totalViews(counters: Readonly<Record<string, number>>): number {
  let sum = 0;
  for (const value of Object.values(counters)) {
    if (Number.isFinite(value)) sum += value;
  }
  return sum;
}
