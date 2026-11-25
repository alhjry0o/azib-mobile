import { ItemDraftSchema, ItemReportSchema, buildItemDraftSchema } from '../item';
import { ExperienceRatingSchema, HandoverConfirmSchema, SoukRequestSchema } from '../request';

const draft = {
  title: 'Bedroom set',
  category: 'furniture' as const,
  condition: 'good' as const,
  description: 'A gently used bedroom set offered as an in-kind donation.',
  governorateId: 'sanaa',
  districtId: null,
  deliveryMethod: 'self_pickup' as const,
  imageFileIds: [],
  imageFingerprints: [],
  estimatedValue: null,
  noResaleConsent: true,
};

describe('souk item schemas', () => {
  it('accepts a complete draft and requires the no-resale consent', () => {
    expect(ItemDraftSchema.safeParse(draft).success).toBe(true);
    expect(ItemDraftSchema.safeParse({ ...draft, noResaleConsent: false }).success).toBe(false);
  });

  it('bounds images by the injected ceiling', () => {
    const schema = buildItemDraftSchema(2);
    const three = ['a', 'b', 'c'];
    expect(
      schema.safeParse({ ...draft, imageFileIds: three, imageFingerprints: three }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ ...draft, imageFileIds: ['a'], imageFingerprints: ['a'] }).success,
    ).toBe(true);
  });

  it('rejects a negative estimate and unknown categories', () => {
    expect(ItemDraftSchema.safeParse({ ...draft, estimatedValue: -1 }).success).toBe(false);
    expect(ItemDraftSchema.safeParse({ ...draft, category: 'crypto' }).success).toBe(false);
  });

  it('validates a report with a reason and a meaningful detail', () => {
    const report = {
      itemId: 'i1',
      targetKind: 'item' as const,
      targetId: 'i1',
      reasonKey: 'marketplace:souk.report.reasons.forSale',
      detail: 'The description asks for money in exchange.',
    };
    expect(ItemReportSchema.safeParse(report).success).toBe(true);
    expect(ItemReportSchema.safeParse({ ...report, detail: 'short' }).success).toBe(false);
    expect(ItemReportSchema.safeParse({ ...report, reasonKey: '' }).success).toBe(false);
  });
});

describe('souk request / handover / rating schemas', () => {
  it('requires a meaningful request reason', () => {
    expect(SoukRequestSchema.safeParse({ reason: 'Setting up a new home.' }).success).toBe(true);
    expect(SoukRequestSchema.safeParse({ reason: 'need' }).success).toBe(false);
  });

  it('bounds the handover code and the rating', () => {
    expect(HandoverConfirmSchema.safeParse({ code: 'AZIB-DEMO-HO-000001' }).success).toBe(true);
    expect(HandoverConfirmSchema.safeParse({ code: '123' }).success).toBe(false);
    expect(ExperienceRatingSchema.safeParse({ score: 5, note: null }).success).toBe(true);
    expect(ExperienceRatingSchema.safeParse({ score: 6, note: null }).success).toBe(false);
  });
});
