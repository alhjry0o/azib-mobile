// Impact report: REAL + VERIFIED only (D-9). Demo never enters.
// Reuses the proven suppression module so amounts are withheld with counts.
import type { Disbursement } from '@/repositories/contracts/disbursement';
import type { Donation } from '@/repositories/contracts/donation';
import {
  SMALL_NUMBER_THRESHOLD,
  buildStatCell,
  suppressSmallNumber,
  type StatValue,
} from '@/features/home/stats-privacy';

export interface ImpactMetric {
  readonly key: string;
  readonly definitionKey: string;
  readonly count: StatValue;
  readonly total: StatValue | null;
}

export interface ImpactReport {
  readonly hasRealData: boolean;
  readonly threshold: number;
  readonly metrics: readonly ImpactMetric[];
}

export interface ImpactInput {
  readonly donations: readonly Donation[];
  readonly disbursements: readonly Disbursement[];
  readonly threshold?: number;
}

function sum(rows: readonly { readonly amount: number }[]): number {
  let total = 0;
  for (const row of rows) if (Number.isFinite(row.amount)) total += row.amount;
  return total;
}

export function computeImpactReport(input: ImpactInput): ImpactReport {
  const threshold = input.threshold ?? SMALL_NUMBER_THRESHOLD;

  const verifiedDonations = input.donations.filter(
    (d) => d.dataOrigin === 'real' && d.status === 'verified',
  );
  const confirmedDisbursements = input.disbursements.filter(
    (d) => d.dataOrigin === 'real' && d.status === 'confirmed_by_beneficiary',
  );
  const distinctApplications = new Set(confirmedDisbursements.map((d) => d.applicationId));

  const donationCell = buildStatCell(verifiedDonations.length, sum(verifiedDonations), threshold);
  const disbursementCell = buildStatCell(
    confirmedDisbursements.length,
    sum(confirmedDisbursements),
    threshold,
  );

  const metrics: readonly ImpactMetric[] = [
    Object.freeze({
      key: 'verifiedDonations',
      definitionKey: 'assistance:finance.impact.definitions.verifiedDonations',
      count: donationCell.count,
      total: donationCell.total,
    }),
    Object.freeze({
      key: 'confirmedDisbursements',
      definitionKey: 'assistance:finance.impact.definitions.confirmedDisbursements',
      count: disbursementCell.count,
      total: disbursementCell.total,
    }),
    Object.freeze({
      key: 'assistedCases',
      definitionKey: 'assistance:finance.impact.definitions.assistedCases',
      count: suppressSmallNumber(distinctApplications.size, threshold),
      total: null,
    }),
  ];

  return Object.freeze({
    hasRealData: verifiedDonations.length > 0 || confirmedDisbursements.length > 0,
    threshold,
    metrics,
  });
}
