// Integer-only apportionment. No floating point comparisons anywhere:
// base = floor(numerator / weightSum), remainder = numerator % weightSum.
// Leftover units go to the largest remainders; ties break by declared order.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

export interface ShareWeight {
  readonly memberId: string;
  readonly weight: number;
}

export interface ShareAllocation {
  readonly memberId: string;
  readonly amount: number;
}

export function distributeByLargestRemainder(
  total: number,
  weights: readonly ShareWeight[],
): Result<readonly ShareAllocation[]> {
  if (!Number.isInteger(total) || total < 0 || !Number.isSafeInteger(total)) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_TOTAL' }) };
  }
  if (weights.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'NO_MEMBERS' }) };
  }

  const seen = new Set<string>();
  let weightSum = 0;
  for (const entry of weights) {
    if (!entry.memberId) {
      return { ok: false, error: AppError.validation({ code: 'INVALID_MEMBER' }) };
    }
    if (seen.has(entry.memberId)) {
      return { ok: false, error: AppError.validation({ code: 'DUPLICATE_MEMBER' }) };
    }
    if (!Number.isInteger(entry.weight) || entry.weight <= 0) {
      return { ok: false, error: AppError.validation({ code: 'INVALID_WEIGHT' }) };
    }
    seen.add(entry.memberId);
    weightSum += entry.weight;
  }

  const rows = weights.map((entry, index) => {
    const numerator = total * entry.weight;
    return {
      memberId: entry.memberId,
      index,
      base: Math.floor(numerator / weightSum),
      remainder: numerator % weightSum,
    };
  });

  const allocated = rows.reduce((sum, row) => sum + row.base, 0);
  let leftover = total - allocated;

  const ordered = [...rows].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  );
  const bonus = new Set<string>();
  for (const row of ordered) {
    if (leftover <= 0) break;
    bonus.add(row.memberId);
    leftover -= 1;
  }

  return ok(
    rows.map((row) =>
      Object.freeze({
        memberId: row.memberId,
        amount: row.base + (bonus.has(row.memberId) ? 1 : 0),
      }),
    ),
  );
}
