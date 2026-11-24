import {
  AUDIENCE_OPTIONS,
  DEFAULT_OFFER_AUDIENCE,
  DEFAULT_REVERIFICATION_DAYS,
  MAX_REVERIFICATION_DAYS,
  MIN_REVERIFICATION_DAYS,
  audienceOption,
  resolveOfferAudience,
  resolveReverificationDays,
} from '../limits';

describe('provisional marketplace policy', () => {
  it('falls back to 365 days for absent or invalid settings', () => {
    expect(resolveReverificationDays(undefined)).toBe(DEFAULT_REVERIFICATION_DAYS);
    expect(resolveReverificationDays(null)).toBe(DEFAULT_REVERIFICATION_DAYS);
    expect(resolveReverificationDays({})).toBe(DEFAULT_REVERIFICATION_DAYS);
    expect(resolveReverificationDays({ reverificationDays: 'year' })).toBe(
      DEFAULT_REVERIFICATION_DAYS,
    );
    expect(resolveReverificationDays({ reverificationDays: 10.5 })).toBe(
      DEFAULT_REVERIFICATION_DAYS,
    );
    expect(
      resolveReverificationDays({ reverificationDays: MIN_REVERIFICATION_DAYS - 1 }),
    ).toBe(DEFAULT_REVERIFICATION_DAYS);
    expect(
      resolveReverificationDays({ reverificationDays: MAX_REVERIFICATION_DAYS + 1 }),
    ).toBe(DEFAULT_REVERIFICATION_DAYS);
  });

  it('accepts a valid configured interval', () => {
    expect(resolveReverificationDays({ reverificationDays: 180 })).toBe(180);
  });

  it('only enables the beneficiaries audience for now', () => {
    expect(DEFAULT_OFFER_AUDIENCE).toBe('beneficiaries');
    expect(audienceOption('beneficiaries').enabled).toBe(true);
    expect(audienceOption('everyone').enabled).toBe(false);
    expect(audienceOption('engaged').enabled).toBe(false);
    expect(audienceOption('everyone').disabledReasonKey).toBe(
      'marketplace:audience.pendingPolicy',
    );
    expect(AUDIENCE_OPTIONS.length).toBe(3);
  });

  it('never resolves to a disabled audience', () => {
    expect(resolveOfferAudience({ offerAudience: 'everyone' })).toBe('beneficiaries');
    expect(resolveOfferAudience({ offerAudience: 'engaged' })).toBe('beneficiaries');
    expect(resolveOfferAudience({ offerAudience: 'nonsense' })).toBe('beneficiaries');
    expect(resolveOfferAudience({ offerAudience: 'beneficiaries' })).toBe('beneficiaries');
  });
});
