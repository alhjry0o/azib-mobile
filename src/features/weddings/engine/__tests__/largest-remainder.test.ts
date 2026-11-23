import { distributeByLargestRemainder } from '../largest-remainder';

function amounts(result: ReturnType<typeof distributeByLargestRemainder>): number[] {
  if (!result.ok) throw new Error('expected ok');
  return result.value.map((r) => r.amount);
}

describe('largest remainder apportionment', () => {
  it('splits 100000 across three equally: 33334 / 33333 / 33333', () => {
    const result = distributeByLargestRemainder(100000, [
      { memberId: 'a', weight: 1 },
      { memberId: 'b', weight: 1 },
      { memberId: 'c', weight: 1 },
    ]);
    expect(amounts(result)).toEqual([33334, 33333, 33333]);
  });

  it('splits 10 across four: 3 / 3 / 2 / 2', () => {
    const result = distributeByLargestRemainder(
      10,
      ['a', 'b', 'c', 'd'].map((memberId) => ({ memberId, weight: 1 })),
    );
    expect(amounts(result)).toEqual([3, 3, 2, 2]);
  });

  it('splits 7 across three: 3 / 2 / 2', () => {
    const result = distributeByLargestRemainder(
      7,
      ['a', 'b', 'c'].map((memberId) => ({ memberId, weight: 1 })),
    );
    expect(amounts(result)).toEqual([3, 2, 2]);
  });

  it('honours weights 1:2:3 for 100000', () => {
    const result = distributeByLargestRemainder(100000, [
      { memberId: 'a', weight: 1 },
      { memberId: 'b', weight: 2 },
      { memberId: 'c', weight: 3 },
    ]);
    expect(amounts(result)).toEqual([16667, 33333, 50000]);
  });

  it('always sums exactly to the total', () => {
    for (const total of [0, 1, 7, 10, 99999, 100000]) {
      const result = distributeByLargestRemainder(
        total,
        ['a', 'b', 'c', 'd', 'e'].map((memberId) => ({ memberId, weight: 1 })),
      );
      expect(amounts(result).reduce((s, n) => s + n, 0)).toBe(total);
    }
  });

  it('gives a single member the whole amount', () => {
    expect(amounts(distributeByLargestRemainder(12345, [{ memberId: 'a', weight: 1 }]))).toEqual([
      12345,
    ]);
  });

  it('rejects invalid input', () => {
    expect(distributeByLargestRemainder(-1, [{ memberId: 'a', weight: 1 }]).ok).toBe(false);
    expect(distributeByLargestRemainder(1.5, [{ memberId: 'a', weight: 1 }]).ok).toBe(false);
    expect(distributeByLargestRemainder(10, []).ok).toBe(false);
    expect(distributeByLargestRemainder(10, [{ memberId: 'a', weight: 0 }]).ok).toBe(false);
    expect(
      distributeByLargestRemainder(10, [
        { memberId: 'a', weight: 1 },
        { memberId: 'a', weight: 1 },
      ]).ok,
    ).toBe(false);
  });
});
