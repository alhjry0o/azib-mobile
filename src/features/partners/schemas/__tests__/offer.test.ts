import { OfferDraftSchema, OfferReportSchema } from '../offer';

const draft = {
  title: 'Demo hall discount',
  category: 'halls' as const,
  governorateId: 'sanaa',
  discountType: 'percent' as const,
  discountValue: 20,
  audience: 'beneficiaries' as const,
  products: ['Venue booking'],
  terms: null,
  validFrom: '2026-06-01T00:00:00.000Z',
  validUntil: '2026-07-01T00:00:00.000Z',
  imageFileIds: [],
};

describe('offer draft schema', () => {
  it('accepts a complete draft', () => {
    expect(OfferDraftSchema.safeParse(draft).success).toBe(true);
  });

  it('rejects an inverted or empty validity window', () => {
    expect(
      OfferDraftSchema.safeParse({ ...draft, validUntil: draft.validFrom }).success,
    ).toBe(false);
    expect(
      OfferDraftSchema.safeParse({ ...draft, validUntil: '2026-05-01T00:00:00.000Z' }).success,
    ).toBe(false);
  });

  it('bounds percent discounts and requires a positive value for money types', () => {
    expect(OfferDraftSchema.safeParse({ ...draft, discountValue: 101 }).success).toBe(false);
    expect(
      OfferDraftSchema.safeParse({ ...draft, discountType: 'fixed', discountValue: 0 }).success,
    ).toBe(false);
    expect(
      OfferDraftSchema.safeParse({ ...draft, discountType: 'fixed', discountValue: 5000 }).success,
    ).toBe(true);
    expect(
      OfferDraftSchema.safeParse({ ...draft, discountType: 'gift', discountValue: 0 }).success,
    ).toBe(true);
  });

  it('rejects fractional values and unknown categories', () => {
    expect(OfferDraftSchema.safeParse({ ...draft, discountValue: 10.5 }).success).toBe(false);
    expect(OfferDraftSchema.safeParse({ ...draft, category: 'crypto' }).success).toBe(false);
  });
});

describe('offer report schema', () => {
  it('requires a reason and a meaningful detail', () => {
    const valid = { offerId: 'o1', reasonKey: 'marketplace:report.reasons.wrongDiscount', detail: 'The discount is not applied at the shop.' };
    expect(OfferReportSchema.safeParse(valid).success).toBe(true);
    expect(OfferReportSchema.safeParse({ ...valid, reasonKey: '' }).success).toBe(false);
    expect(OfferReportSchema.safeParse({ ...valid, detail: 'short' }).success).toBe(false);
  });
});
