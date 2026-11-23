// Pure cost sharing. Individual items belong to one member; shared items are
// apportioned by Equal / Weighted / Custom. Custom must sum exactly.
// Invariant: sum(shares.total) === grandTotal, always, with integers only.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { SplitMode } from '@/repositories/contracts/wedding-budget';
import { distributeByLargestRemainder, type ShareWeight } from './largest-remainder';

export interface CostMember {
  readonly memberId: string;
  readonly weight?: number;
  readonly customAmount?: number;
}

export interface CostItem {
  readonly id: string;
  readonly scope: 'shared' | 'individual';
  readonly amount: number;
  readonly memberId?: string | null;
}

export interface CostSharingInput {
  readonly members: readonly CostMember[];
  readonly items: readonly CostItem[];
  readonly mode: SplitMode;
}

export interface MemberCost {
  readonly memberId: string;
  readonly individual: number;
  readonly shared: number;
  readonly total: number;
}

export interface CostSharingReport {
  readonly mode: SplitMode;
  readonly sharedTotal: number;
  readonly individualTotal: number;
  readonly grandTotal: number;
  readonly shares: readonly MemberCost[];
}

export function computeCostSharing(input: CostSharingInput): Result<CostSharingReport> {
  if (input.members.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'NO_MEMBERS' }) };
  }
  const ids = new Set<string>();
  for (const member of input.members) {
    if (!member.memberId || ids.has(member.memberId)) {
      return { ok: false, error: AppError.validation({ code: 'DUPLICATE_MEMBER' }) };
    }
    ids.add(member.memberId);
  }

  let sharedTotal = 0;
  let individualTotal = 0;
  const individualByMember = new Map<string, number>();

  for (const item of input.items) {
    if (!Number.isInteger(item.amount) || item.amount < 0) {
      return { ok: false, error: AppError.validation({ code: 'INVALID_AMOUNT' }) };
    }
    if (item.scope === 'individual') {
      const owner = item.memberId ?? null;
      if (!owner || !ids.has(owner)) {
        return { ok: false, error: AppError.validation({ code: 'UNKNOWN_MEMBER' }) };
      }
      individualTotal += item.amount;
      individualByMember.set(owner, (individualByMember.get(owner) ?? 0) + item.amount);
    } else {
      sharedTotal += item.amount;
    }
  }

  let weights: readonly ShareWeight[];
  if (input.mode === 'custom') {
    let customSum = 0;
    const customWeights: ShareWeight[] = [];
    for (const member of input.members) {
      const amount = member.customAmount;
      if (amount === undefined || !Number.isInteger(amount) || amount < 0) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_CUSTOM_SHARE' }) };
      }
      customSum += amount;
      // Zero-amount members still receive an allocation row of 0.
      customWeights.push({ memberId: member.memberId, weight: 1 });
    }
    if (customSum !== sharedTotal) {
      return { ok: false, error: AppError.validation({ code: 'CUSTOM_SUM_MISMATCH' }) };
    }
    const shares = input.members.map((member) =>
      Object.freeze({ memberId: member.memberId, amount: member.customAmount ?? 0 }),
    );
    return ok(buildReport(input.mode, sharedTotal, individualTotal, shares, individualByMember));
  }

  if (input.mode === 'weighted') {
    const weighted: ShareWeight[] = [];
    for (const member of input.members) {
      const weight = member.weight;
      if (weight === undefined || !Number.isInteger(weight) || weight <= 0) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_WEIGHT' }) };
      }
      weighted.push({ memberId: member.memberId, weight });
    }
    weights = weighted;
  } else {
    weights = input.members.map((member) => ({ memberId: member.memberId, weight: 1 }));
  }

  const allocated = distributeByLargestRemainder(sharedTotal, weights);
  if (!allocated.ok) return allocated;
  return ok(
    buildReport(input.mode, sharedTotal, individualTotal, allocated.value, individualByMember),
  );
}

function buildReport(
  mode: SplitMode,
  sharedTotal: number,
  individualTotal: number,
  shared: readonly { readonly memberId: string; readonly amount: number }[],
  individualByMember: ReadonlyMap<string, number>,
): CostSharingReport {
  const shares = shared.map((row) => {
    const individual = individualByMember.get(row.memberId) ?? 0;
    return Object.freeze({
      memberId: row.memberId,
      individual,
      shared: row.amount,
      total: individual + row.amount,
    });
  });
  return Object.freeze({
    mode,
    sharedTotal,
    individualTotal,
    grandTotal: sharedTotal + individualTotal,
    shares,
  });
}
