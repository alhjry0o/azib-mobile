// Aggregate Souk stats. estimatedValue is UNVERIFIED and never a public price;
// it is suppressed together with small counts (reuses the P07 policy module).
import {
  SMALL_NUMBER_THRESHOLD,
  suppressSmallNumber,
  type StatValue,
} from '@/features/home/stats-privacy';
import type { SoukItem } from '@/repositories/contracts/souk';
import { toItemWorkflowStatus } from './item-machine';

export interface SoukStatsInput {
  readonly items: readonly SoukItem[];
  readonly threshold?: number;
}

export interface SoukStats {
  readonly availableCount: StatValue;
  readonly handedOverCount: StatValue;
  /** Unverified donor estimate. Aggregate + suppressed only. */
  readonly estimatedTotal: StatValue;
  readonly unverified: true;
  readonly threshold: number;
}

export function computeSoukStats(input: SoukStatsInput): SoukStats {
  const threshold = input.threshold ?? SMALL_NUMBER_THRESHOLD;
  let available = 0;
  let handedOver = 0;
  let estimated = 0;
  let estimatedCount = 0;
  for (const item of input.items) {
    const status = toItemWorkflowStatus(item.status);
    if (status === 'available') available += 1;
    if (status === 'handed_over') handedOver += 1;
    const value = item.estimatedValue ?? null;
    if (value !== null && Number.isFinite(value)) {
      estimated += value;
      estimatedCount += 1;
    }
  }
  const estimateGate = suppressSmallNumber(estimatedCount, threshold);
  return Object.freeze({
    availableCount: suppressSmallNumber(available, threshold),
    handedOverCount: suppressSmallNumber(handedOver, threshold),
    estimatedTotal:
      estimateGate.kind === 'suppressed' ? estimateGate : suppressSmallNumber(estimated, 1),
    unverified: true as const,
    threshold,
  });
}
