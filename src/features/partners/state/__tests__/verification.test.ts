import {
  daysRemaining,
  hasStarted,
  isExpired,
  isPublished,
  isVerified,
  needsReverification,
  offerVisibility,
  reverifyDeadline,
} from '../index';

const NOW = new Date('2026-06-01T00:00:00.000Z');

describe('verified crown comes only from the record', () => {
  it('grants no crown without a record', () => {
    expect(isVerified(null, NOW)).toBe(false);
    expect(isVerified(undefined, NOW)).toBe(false);
  });

  it('grants no crown for pending / rejected / expired records', () => {
    expect(isVerified({ status: 'pending', validUntil: null }, NOW)).toBe(false);
    expect(isVerified({ status: 'rejected', validUntil: null }, NOW)).toBe(false);
    expect(isVerified({ status: 'expired', validUntil: null }, NOW)).toBe(false);
  });

  it('grants the crown for a live verified record', () => {
    expect(isVerified({ status: 'verified', validUntil: null }, NOW)).toBe(true);
    expect(
      isVerified({ status: 'verified', validUntil: '2027-01-01T00:00:00.000Z' }, NOW),
    ).toBe(true);
  });

  it('drops the crown once validUntil passes or is unparseable', () => {
    expect(
      isVerified({ status: 'verified', validUntil: '2026-05-01T00:00:00.000Z' }, NOW),
    ).toBe(false);
    expect(isVerified({ status: 'verified', validUntil: 'not-a-date' }, NOW)).toBe(false);
  });

  it('flags re-verification only for lapsed verified records', () => {
    expect(needsReverification({ status: 'verified', validUntil: null }, NOW)).toBe(false);
    expect(
      needsReverification({ status: 'verified', validUntil: '2026-05-01T00:00:00.000Z' }, NOW),
    ).toBe(true);
    expect(needsReverification({ status: 'pending', validUntil: null }, NOW)).toBe(false);
  });

  it('computes a re-verification deadline and rejects bad input', () => {
    expect(reverifyDeadline('2026-01-01T00:00:00.000Z', 365)).toBe('2027-01-01T00:00:00.000Z');
    expect(reverifyDeadline('nope', 365)).toBeNull();
    expect(reverifyDeadline('2026-01-01T00:00:00.000Z', 0)).toBeNull();
  });
});

describe('offer expiry and visibility', () => {
  const base = { status: 'active' as const, validFrom: null, validUntil: null };

  it('is open-ended when validUntil is absent', () => {
    expect(isExpired(base, NOW)).toBe(false);
    expect(daysRemaining(base, NOW)).toBeNull();
    expect(offerVisibility(base, NOW)).toBe('live');
  });

  it('expires at and after the boundary', () => {
    const at = { ...base, validUntil: NOW.toISOString() };
    expect(isExpired(at, NOW)).toBe(true);
    expect(offerVisibility(at, NOW)).toBe('expired');
    expect(isPublished(at, NOW)).toBe(false);
  });

  it('reports scheduled before validFrom', () => {
    const future = { ...base, validFrom: '2026-07-01T00:00:00.000Z' };
    expect(hasStarted(future, NOW)).toBe(false);
    expect(offerVisibility(future, NOW)).toBe('scheduled');
    expect(isPublished(future, NOW)).toBe(false);
  });

  it('never publishes a non-active offer', () => {
    expect(offerVisibility({ ...base, status: 'draft' }, NOW)).toBe('not_published');
    expect(offerVisibility({ ...base, status: 'in_review' }, NOW)).toBe('not_published');
  });

  it('counts whole days remaining and floors at zero', () => {
    expect(daysRemaining({ validUntil: '2026-06-11T00:00:00.000Z' }, NOW)).toBe(10);
    expect(daysRemaining({ validUntil: '2026-05-01T00:00:00.000Z' }, NOW)).toBe(0);
    expect(daysRemaining({ validUntil: 'nope' }, NOW)).toBeNull();
  });
});
