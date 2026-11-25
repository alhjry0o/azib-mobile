import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockOfferRepository } from '@/repositories/mock/offer';
import { createMockPartnerRepository } from '@/repositories/mock/partner';
import { createMockPartnerVerificationRepository } from '@/repositories/mock/partner-verification';
import {
  cancelOffer,
  createOfferDraft,
  expireOffer,
  publishOffer,
  renewOffer,
  reviewOffer,
  submitOfferForReview,
} from '../offer-lifecycle-service';
import { registerPartner } from '../registration-service';
import { decideVerification } from '../verification-service';

function setup() {
  return {
    offers: createMockOfferRepository(),
    partners: createMockPartnerRepository(),
    verifications: createMockPartnerVerificationRepository(),
    audit: createMockAuditRepository(),
  };
}

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

async function verifiedPartner() {
  const deps = setup();
  const partner = await registerPartner(deps, {
    ownerId: 'owner-1',
    displayName: 'Demo Hall',
    category: 'halls',
    description: 'A demo venue for group weddings.',
    governorateId: 'sanaa',
    districtId: null,
    city: null,
    contactPhone: '0771234567',
    whatsapp: null,
    imageFileIds: [],
    documentFileIds: ['doc-1'],
    termsAccepted: true,
  });
  if (!partner.ok) throw new Error('setup failed');
  const latest = await deps.verifications.getLatest(partner.value.id);
  if (!latest.ok || !latest.value) throw new Error('setup failed');
  await decideVerification(
    deps,
    partner.value.id,
    latest.value.id,
    'partner_verifier',
    'verifier-1',
    'verified',
  );
  return { deps, partnerId: partner.value.id };
}

describe('offer lifecycle', () => {
  it('creates a draft and submits it for review', async () => {
    const { deps, partnerId } = await verifiedPartner();
    const created = await createOfferDraft(deps, 'owner-1', partnerId, draft);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('draft');
    const submitted = await submitOfferForReview(deps, created.value.id, 'owner-1');
    expect(submitted.ok).toBe(true);
    if (submitted.ok) expect(submitted.value.status).toBe('in_review');
  });

  it('rejects a non-approved audience', async () => {
    const { deps, partnerId } = await verifiedPartner();
    const result = await createOfferDraft(deps, 'owner-1', partnerId, {
      ...draft,
      audience: 'everyone',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('AUDIENCE_NOT_APPROVED');
  });

  it('refuses publication without a live verification record', async () => {
    const deps = setup();
    const partner = await deps.partners.create({
      displayName: 'Unverified',
      category: 'halls',
      ownerId: 'owner-2',
    });
    if (!partner.ok) throw new Error('setup failed');
    const created = await createOfferDraft(deps, 'owner-2', partner.value.id, draft);
    if (!created.ok) throw new Error('setup failed');
    await submitOfferForReview(deps, created.value.id, 'owner-2');
    await reviewOffer(deps, created.value.id, 'reviewer', 'reviewer-1', 'approved');
    const blocked = await publishOffer(deps, created.value.id, 'reviewer', 'reviewer-1');
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.meta.code).toBe('PARTNER_NOT_VERIFIED');
  });

  it('publishes after approval when the partner is verified', async () => {
    const { deps, partnerId } = await verifiedPartner();
    const created = await createOfferDraft(deps, 'owner-1', partnerId, draft);
    if (!created.ok) throw new Error('setup failed');
    await submitOfferForReview(deps, created.value.id, 'owner-1');
    await reviewOffer(deps, created.value.id, 'reviewer', 'reviewer-1', 'approved');
    const published = await publishOffer(deps, created.value.id, 'reviewer', 'reviewer-1');
    expect(published.ok).toBe(true);
    if (published.ok) {
      expect(published.value.status).toBe('active');
      expect(published.value.publishedAt).toBeTruthy();
    }
  });

  it('only the system writes expired, and renewal returns to review', async () => {
    const { deps, partnerId } = await verifiedPartner();
    const created = await createOfferDraft(deps, 'owner-1', partnerId, draft);
    if (!created.ok) throw new Error('setup failed');
    await submitOfferForReview(deps, created.value.id, 'owner-1');
    await reviewOffer(deps, created.value.id, 'reviewer', 'reviewer-1', 'approved');
    await publishOffer(deps, created.value.id, 'reviewer', 'reviewer-1');

    const ownerExpire = await cancelOffer(deps, created.value.id, 'owner-1');
    expect(ownerExpire.ok).toBe(true);

    const second = await createOfferDraft(deps, 'owner-1', partnerId, draft);
    if (!second.ok) throw new Error('setup failed');
    await submitOfferForReview(deps, second.value.id, 'owner-1');
    await reviewOffer(deps, second.value.id, 'reviewer', 'reviewer-1', 'approved');
    await publishOffer(deps, second.value.id, 'reviewer', 'reviewer-1');
    const expired = await expireOffer(deps, second.value.id, 'system-1');
    expect(expired.ok).toBe(true);
    const renewed = await renewOffer(
      deps,
      second.value.id,
      'owner-1',
      '2026-08-01T00:00:00.000Z',
      '2026-09-01T00:00:00.000Z',
    );
    expect(renewed.ok).toBe(true);
    if (renewed.ok) expect(renewed.value.status).toBe('in_review');
  });

  it('refuses actions from a non-owner', async () => {
    const { deps, partnerId } = await verifiedPartner();
    const created = await createOfferDraft(deps, 'owner-1', partnerId, draft);
    if (!created.ok) throw new Error('setup failed');
    const stranger = await submitOfferForReview(deps, created.value.id, 'someone-else');
    expect(stranger.ok).toBe(false);
    if (!stranger.ok) expect(stranger.error.kind).toBe('Forbidden');
  });
});
