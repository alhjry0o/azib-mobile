import { buildIdempotencyKey } from '../services/idempotency';

const base = { donorId: 'd1', programId: 'p1', amount: 50000, anonymous: false };

describe('buildIdempotencyKey', () => {
  it('is deterministic for identical inputs', () => {
    expect(buildIdempotencyKey(base)).toBe(buildIdempotencyKey({ ...base }));
  });

  it('changes when the amount changes', () => {
    expect(buildIdempotencyKey({ ...base, amount: 60000 })).not.toBe(buildIdempotencyKey(base));
  });

  it('changes with anonymity, donor or program', () => {
    expect(buildIdempotencyKey({ ...base, anonymous: true })).not.toBe(buildIdempotencyKey(base));
    expect(buildIdempotencyKey({ ...base, donorId: 'd2' })).not.toBe(buildIdempotencyKey(base));
    expect(buildIdempotencyKey({ ...base, programId: 'p2' })).not.toBe(buildIdempotencyKey(base));
  });

  it('floors fractional amounts and normalises non-finite ones', () => {
    expect(buildIdempotencyKey({ ...base, amount: 100.9 })).toBe(
      buildIdempotencyKey({ ...base, amount: 100 }),
    );
    expect(buildIdempotencyKey({ ...base, amount: Number.NaN })).toContain(':0:');
  });
});
