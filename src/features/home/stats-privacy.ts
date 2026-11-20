// Community statistics with small-number suppression (D-2) and strict
// demo/real separation (D-6). Amounts are suppressed together with counts:
// a total over a tiny group would reveal that group.
import type { Disbursement } from '@/repositories/contracts/disbursement';
import type { Donation } from '@/repositories/contracts/donation';

/**
 * PENDING_POLICY — provisional value from PRODUCT_POLICIES #8, approved by the
 * owner for P07. The UI must always show that the threshold awaits approval.
 */
export const SMALL_NUMBER_THRESHOLD = 10;

export type StatValue =
  | { readonly kind: 'value'; readonly value: number }
  | { readonly kind: 'suppressed' };

export interface StatCell {
  readonly count: StatValue;
  readonly total: StatValue;
}

export interface OriginRecord {
  readonly dataOrigin: 'demo' | 'real';
}

export function suppressSmallNumber(
  count: number,
  threshold: number = SMALL_NUMBER_THRESHOLD,
): StatValue {
  if (!Number.isFinite(count)) return { kind: 'suppressed' };
  const safe = Math.floor(count);
  if (safe < threshold) return { kind: 'suppressed' };
  return { kind: 'value', value: safe };
}

export function buildStatCell(
  count: number,
  total: number,
  threshold: number = SMALL_NUMBER_THRESHOLD,
): StatCell {
  const cellCount = suppressSmallNumber(count, threshold);
  if (cellCount.kind === 'suppressed') {
    return { count: cellCount, total: { kind: 'suppressed' } };
  }
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.round(total)) : 0;
  return { count: cellCount, total: { kind: 'value', value: safeTotal } };
}

function sumAmounts(rows: readonly { readonly amount: number }[]): number {
  let sum = 0;
  for (const row of rows) {
    if (Number.isFinite(row.amount)) sum += row.amount;
  }
  return sum;
}

export interface CommunityStatsBucket {
  readonly donations: StatCell;
  readonly disbursements: StatCell;
  readonly beneficiaries: StatValue;
  /** Confirmed records only — used to decide empty vs ready. */
  readonly recordCount: number;
}

export interface CommunityStats {
  readonly demo: CommunityStatsBucket;
  readonly real: CommunityStatsBucket;
}

export interface CommunityStatsInput {
  readonly donations: readonly Donation[];
  readonly disbursements: readonly Disbursement[];
  readonly beneficiaries: readonly OriginRecord[];
  readonly threshold?: number;
}

function buildBucket(
  donations: readonly Donation[],
  disbursements: readonly Disbursement[],
  beneficiaryCount: number,
  threshold: number,
): CommunityStatsBucket {
  const confirmedDonations = donations.filter((row) => row.status === 'confirmed');
  const confirmedDisbursements = disbursements.filter((row) => row.status === 'confirmed');
  return {
    donations: buildStatCell(
      confirmedDonations.length,
      sumAmounts(confirmedDonations),
      threshold,
    ),
    disbursements: buildStatCell(
      confirmedDisbursements.length,
      sumAmounts(confirmedDisbursements),
      threshold,
    ),
    beneficiaries: suppressSmallNumber(beneficiaryCount, threshold),
    recordCount: confirmedDonations.length + confirmedDisbursements.length + beneficiaryCount,
  };
}

export function computeCommunityStats(input: CommunityStatsInput): CommunityStats {
  const threshold = input.threshold ?? SMALL_NUMBER_THRESHOLD;
  const demoDonations = input.donations.filter((row) => row.dataOrigin === 'demo');
  const realDonations = input.donations.filter((row) => row.dataOrigin === 'real');
  const demoDisbursements = input.disbursements.filter((row) => row.dataOrigin === 'demo');
  const realDisbursements = input.disbursements.filter((row) => row.dataOrigin === 'real');
  const demoBeneficiaries = input.beneficiaries.filter((row) => row.dataOrigin === 'demo');
  const realBeneficiaries = input.beneficiaries.filter((row) => row.dataOrigin === 'real');

  return {
    demo: buildBucket(demoDonations, demoDisbursements, demoBeneficiaries.length, threshold),
    real: buildBucket(realDonations, realDisbursements, realBeneficiaries.length, threshold),
  };
}

/** Total records seen (any status/origin) — drives the honest empty state. */
export function totalRecordCount(input: CommunityStatsInput): number {
  return input.donations.length + input.disbursements.length + input.beneficiaries.length;
}
