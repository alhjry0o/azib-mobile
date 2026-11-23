import { computeCostSharing, type CostSharingInput } from '../cost-sharing';

const threeMembers = [
  { memberId: 'a', weight: 1 },
  { memberId: 'b', weight: 1 },
  { memberId: 'c', weight: 1 },
];

function report(input: CostSharingInput) {
  const result = computeCostSharing(input);
  if (!result.ok) throw new Error(`expected ok: ${result.error.meta.code ?? ''}`);
  return result.value;
}

describe('cost sharing', () => {
  it('equal split of 100000 across three', () => {
    const value = report({
      members: threeMembers,
      items: [{ id: 'i1', scope: 'shared', amount: 100000 }],
      mode: 'equal',
    });
    expect(value.shares.map((s) => s.shared)).toEqual([33334, 33333, 33333]);
    expect(value.grandTotal).toBe(100000);
  });

  it('individual items are never redistributed', () => {
    const value = report({
      members: threeMembers,
      items: [
        { id: 'i1', scope: 'individual', amount: 20000, memberId: 'a' },
        { id: 'i2', scope: 'shared', amount: 90000 },
      ],
      mode: 'equal',
    });
    expect(value.shares.find((s) => s.memberId === 'a')?.total).toBe(50000);
    expect(value.shares.find((s) => s.memberId === 'b')?.total).toBe(30000);
    expect(value.shares.find((s) => s.memberId === 'c')?.total).toBe(30000);
    expect(value.grandTotal).toBe(110000);
  });

  it('weighted split honours declared weights', () => {
    const value = report({
      members: [
        { memberId: 'a', weight: 1 },
        { memberId: 'b', weight: 2 },
        { memberId: 'c', weight: 3 },
      ],
      items: [{ id: 'i1', scope: 'shared', amount: 100000 }],
      mode: 'weighted',
    });
    expect(value.shares.map((s) => s.shared)).toEqual([16667, 33333, 50000]);
  });

  it('custom split must equal the shared total exactly', () => {
    const bad = computeCostSharing({
      members: [
        { memberId: 'a', customAmount: 40000 },
        { memberId: 'b', customAmount: 40000 },
      ],
      items: [{ id: 'i1', scope: 'shared', amount: 100000 }],
      mode: 'custom',
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.meta.code).toBe('CUSTOM_SUM_MISMATCH');

    const good = report({
      members: [
        { memberId: 'a', customAmount: 60000 },
        { memberId: 'b', customAmount: 40000 },
      ],
      items: [{ id: 'i1', scope: 'shared', amount: 100000 }],
      mode: 'custom',
    });
    expect(good.shares.map((s) => s.shared)).toEqual([60000, 40000]);
  });

  it('rejects unknown individual owners and invalid amounts', () => {
    expect(
      computeCostSharing({
        members: threeMembers,
        items: [{ id: 'i1', scope: 'individual', amount: 100, memberId: 'ghost' }],
        mode: 'equal',
      }).ok,
    ).toBe(false);
    expect(
      computeCostSharing({
        members: threeMembers,
        items: [{ id: 'i1', scope: 'shared', amount: 1.5 }],
        mode: 'equal',
      }).ok,
    ).toBe(false);
    expect(computeCostSharing({ members: [], items: [], mode: 'equal' }).ok).toBe(false);
  });

  it('handles a zero-cost budget and a single member', () => {
    const zero = report({ members: threeMembers, items: [], mode: 'equal' });
    expect(zero.grandTotal).toBe(0);
    expect(zero.shares.every((s) => s.total === 0)).toBe(true);
    const single = report({
      members: [{ memberId: 'a', weight: 1 }],
      items: [{ id: 'i1', scope: 'shared', amount: 7 }],
      mode: 'equal',
    });
    expect(single.shares[0]?.total).toBe(7);
  });

  it('sum of member totals always equals the grand total', () => {
    const value = report({
      members: threeMembers,
      items: [
        { id: 'i1', scope: 'shared', amount: 100001 },
        { id: 'i2', scope: 'individual', amount: 33333, memberId: 'b' },
      ],
      mode: 'equal',
    });
    expect(value.shares.reduce((s, r) => s + r.total, 0)).toBe(value.grandTotal);
  });
});
