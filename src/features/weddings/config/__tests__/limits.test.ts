import {
  DEFAULT_MAX_GROUP_SIZE,
  HARD_MAX_GROUP_SIZE,
  MIN_GROUP_SIZE,
  resolveMaxGroupSize,
  sizeBucket,
} from '../limits';

describe('group size limits', () => {
  it('falls back to the provisional ceiling for absent or invalid values', () => {
    expect(resolveMaxGroupSize(undefined)).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize(null)).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize({})).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize({ maxGroupSize: 'ten' })).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize({ maxGroupSize: 1.5 })).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize({ maxGroupSize: MIN_GROUP_SIZE - 1 })).toBe(DEFAULT_MAX_GROUP_SIZE);
    expect(resolveMaxGroupSize({ maxGroupSize: HARD_MAX_GROUP_SIZE + 1 })).toBe(
      DEFAULT_MAX_GROUP_SIZE,
    );
  });

  it('accepts a valid configured ceiling', () => {
    expect(resolveMaxGroupSize({ maxGroupSize: 20 })).toBe(20);
    expect(resolveMaxGroupSize({ maxGroupSize: MIN_GROUP_SIZE })).toBe(MIN_GROUP_SIZE);
  });

  it('buckets group sizes deterministically', () => {
    expect(sizeBucket(2)).toBe('small');
    expect(sizeBucket(4)).toBe('small');
    expect(sizeBucket(5)).toBe('medium');
    expect(sizeBucket(8)).toBe('medium');
    expect(sizeBucket(9)).toBe('large');
  });
});
