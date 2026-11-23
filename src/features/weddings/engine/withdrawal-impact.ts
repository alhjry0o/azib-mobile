// Recomputes the split after a withdrawal, and reports the policy window.
// The leaving member's individual items drop out; shared costs are re-split
// across the remaining active members. No money moves inside the app.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { computeCostSharing, type CostSharingInput, type MemberCost } from './cost-sharing';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface WithdrawalPolicy {
  readonly version: string;
  readonly noticeDays: number;
  readonly policyStatus: 'pending-human-approval';
}

/** PENDING_POLICY — provisional 30-day notice, owner-approved for P10 use. */
export const DEFAULT_WITHDRAWAL_POLICY: WithdrawalPolicy = Object.freeze({
  version: 'withdrawal-v1',
  noticeDays: 30,
  policyStatus: 'pending-human-approval',
});

export interface WithdrawalImpactInput {
  readonly before: CostSharingInput;
  readonly leavingMemberId: string;
  readonly scheduledDate: string;
  readonly now: Date;
  readonly policy?: WithdrawalPolicy;
}

export interface WithdrawalImpact {
  readonly leavingMemberId: string;
  readonly leavingMemberCost: MemberCost | null;
  readonly remainingShares: readonly MemberCost[];
  readonly remainingSharedTotal: number;
  readonly unassignedSharedTotal: number;
  readonly windowOpen: boolean;
  readonly policyVersion: string;
  readonly reasonKey: string;
}

export function isWithdrawalWindowOpen(
  scheduledDate: string,
  now: Date,
  policy: WithdrawalPolicy = DEFAULT_WITHDRAWAL_POLICY,
): boolean {
  const scheduled = Date.parse(scheduledDate);
  if (Number.isNaN(scheduled)) return false;
  return now.getTime() <= scheduled - policy.noticeDays * DAY_MS;
}

export function computeWithdrawalImpact(
  input: WithdrawalImpactInput,
): Result<WithdrawalImpact> {
  const policy = input.policy ?? DEFAULT_WITHDRAWAL_POLICY;
  const leaving = input.before.members.find((m) => m.memberId === input.leavingMemberId);
  if (!leaving) {
    return { ok: false, error: AppError.validation({ code: 'UNKNOWN_MEMBER' }) };
  }

  const beforeReport = computeCostSharing(input.before);
  if (!beforeReport.ok) return beforeReport;
  const leavingMemberCost =
    beforeReport.value.shares.find((s) => s.memberId === input.leavingMemberId) ?? null;

  const remainingMembers = input.before.members.filter(
    (m) => m.memberId !== input.leavingMemberId,
  );
  const remainingItems = input.before.items.filter(
    (item) => item.scope === 'shared' || item.memberId !== input.leavingMemberId,
  );
  const sharedTotal = beforeReport.value.sharedTotal;
  const windowOpen = isWithdrawalWindowOpen(input.scheduledDate, input.now, policy);

  if (remainingMembers.length === 0) {
    return ok(
      Object.freeze({
        leavingMemberId: input.leavingMemberId,
        leavingMemberCost,
        remainingShares: Object.freeze([]),
        remainingSharedTotal: 0,
        unassignedSharedTotal: sharedTotal,
        windowOpen,
        policyVersion: policy.version,
        reasonKey: 'weddings:withdrawal.reasons.groupEmpty',
      }),
    );
  }

  const afterReport = computeCostSharing({
    members: remainingMembers,
    items: remainingItems,
    mode: input.before.mode,
  });
  if (!afterReport.ok) return afterReport;

  return ok(
    Object.freeze({
      leavingMemberId: input.leavingMemberId,
      leavingMemberCost,
      remainingShares: afterReport.value.shares,
      remainingSharedTotal: afterReport.value.sharedTotal,
      unassignedSharedTotal: 0,
      windowOpen,
      policyVersion: policy.version,
      reasonKey: windowOpen
        ? 'weddings:withdrawal.reasons.withinWindow'
        : 'weddings:withdrawal.reasons.windowClosed',
    }),
  );
}
