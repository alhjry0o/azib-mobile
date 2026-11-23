import {
  DEFAULT_WITHDRAWAL_POLICY,
  computeWithdrawalImpact,
  isWithdrawalWindowOpen,
} from '../withdrawal-impact';
import type { CostSharingInput } from '../cost-sharing';

const before: CostSharingInput = {
  members: [
    { memberId: 'a', weight: 1 },
    { memberId: 'b', weight: 1 },
    { memberId: 'c', weight: 1 },
  ],
  items: [
    { id: 'i1', scope: 'shared', amount: 100000 },
    { id: 'i2', scope: 'individual', amount: 20000, memberId: 'c' },
  ],
  mode: 'equal',
};

const scheduledDate = '2026-06-15T16:00:00.000Z';

describe('withdrawal impact', () => {
  it('re-splits shared costs across the remaining members', () => {
    const result = computeWithdrawalImpact({
      before,
      leavingMemberId: 'c',
      scheduledDate,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.remainingShares.map((s) => s.shared)).toEqual([50000, 50000]);
    expect(result.value.remainingSharedTotal).toBe(100000);
    expect(result.value.leavingMemberCost?.individual).toBe(20000);
  });

  it('drops the leaving member individual items', () => {
    const result = computeWithdrawalImpact({
      before,
      leavingMemberId: 'c',
      scheduledDate,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.remainingShares.every((s) => s.individual === 0)).toBe(true);
  });

  it('reports an open window far from the date and a closed one near it', () => {
    const early = computeWithdrawalImpact({
      before,
      leavingMemberId: 'c',
      scheduledDate,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });
    const late = computeWithdrawalImpact({
      before,
      leavingMemberId: 'c',
      scheduledDate,
      now: new Date('2026-06-10T00:00:00.000Z'),
    });
    if (early.ok) expect(early.value.windowOpen).toBe(true);
    if (late.ok) expect(late.value.windowOpen).toBe(false);
    expect(
      isWithdrawalWindowOpen(scheduledDate, new Date('2026-05-16T16:00:00.000Z')),
    ).toBe(true);
    expect(
      isWithdrawalWindowOpen(scheduledDate, new Date('2026-05-17T16:00:00.000Z')),
    ).toBe(false);
  });

  it('handles the last member leaving without inventing an allocation', () => {
    const result = computeWithdrawalImpact({
      before: {
        members: [{ memberId: 'a', weight: 1 }],
        items: [{ id: 'i1', scope: 'shared', amount: 5000 }],
        mode: 'equal',
      },
      leavingMemberId: 'a',
      scheduledDate,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.remainingShares).toEqual([]);
    expect(result.value.unassignedSharedTotal).toBe(5000);
  });

  it('rejects an unknown leaving member and carries the policy version', () => {
    expect(
      computeWithdrawalImpact({
        before,
        leavingMemberId: 'ghost',
        scheduledDate,
        now: new Date(),
      }).ok,
    ).toBe(false);
    const result = computeWithdrawalImpact({
      before,
      leavingMemberId: 'c',
      scheduledDate,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });
    if (result.ok) {
      expect(result.value.policyVersion).toBe(DEFAULT_WITHDRAWAL_POLICY.version);
      expect(DEFAULT_WITHDRAWAL_POLICY.policyStatus).toBe('pending-human-approval');
    }
  });
});
