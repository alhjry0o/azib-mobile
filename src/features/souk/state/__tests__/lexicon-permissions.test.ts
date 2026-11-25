import {
  canCancelOwnRequest,
  canEditOwnItem,
  canSouk,
  canViewRatings,
  detectSaleWords,
  hasNoResaleConsent,
  toPartyRequestView,
  toPublicItemView,
} from '../index';
import type { SoukItem } from '@/repositories/contracts/souk';
import type { SoukRequest } from '@/repositories/contracts/souk-request';

describe('anti-commodification lexicon', () => {
  it('flags English sale words case-insensitively', () => {
    const result = detectSaleWords('Available for SALE, best price');
    expect(result.flagged).toBe(true);
    expect(result.matches).toContain('sale');
    expect(result.reasonKey).toBe('marketplace:souk.antiCommodification.warning');
  });

  it('flags Arabic sale words', () => {
    const arabic = detectSaleWords('للبيع مقابل مبلغ'); // i18n-allow-arabic
    expect(arabic.flagged).toBe(true);
  });

  it('passes a plain in-kind donation description', () => {
    const clean = detectSaleWords('Free donation of a bedroom set, no conditions');
    expect(clean.flagged).toBe(false);
    expect(clean.matches).toEqual([]);
    expect(clean.reasonKey).toBeNull();
  });

  it('requires an explicit no-resale consent timestamp', () => {
    expect(hasNoResaleConsent(null)).toBe(false);
    expect(hasNoResaleConsent(undefined)).toBe(false);
    expect(hasNoResaleConsent('2026-06-01T00:00:00.000Z')).toBe(true);
  });
});

describe('souk permissions', () => {
  it('guests only browse', () => {
    expect(canSouk('guest', 'browse_items')).toBe(true);
    expect(canSouk('guest', 'create_item')).toBe(false);
    expect(canSouk('guest', 'view_ratings')).toBe(false);
  });

  it('members act on their own items and requests only', () => {
    expect(canSouk('member', 'create_item')).toBe(true);
    expect(canEditOwnItem('member', true)).toBe(true);
    expect(canEditOwnItem('member', false)).toBe(false);
    expect(canCancelOwnRequest('member', false)).toBe(false);
    expect(canSouk('member', 'decide_request')).toBe(false);
    expect(canSouk('member', 'moderate_content')).toBe(false);
  });

  it('ratings are staff-private', () => {
    expect(canViewRatings('member')).toBe(false);
    expect(canViewRatings('moderator')).toBe(true);
    expect(canViewRatings('auditor')).toBe(true);
    expect(canViewRatings('admin')).toBe(true);
  });
});

describe('public and party projections', () => {
  const item: SoukItem = {
    id: 'i1',
    titleKey: 'marketplace:souk.customItem',
    category: 'furniture',
    status: 'available',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    dataOrigin: 'demo',
    donorId: 'donor-1',
    title: 'Bedroom set',
    estimatedValue: 120000,
    governorateId: 'sanaa',
  };

  const request: SoukRequest = {
    id: 'r1',
    itemId: 'i1',
    requesterId: 'recipient-1',
    reason: 'Setting up a new home.',
    status: 'accepted',
    donorContactConsent: true,
    recipientContactConsent: true,
    handoverCode: 'AZIB-DEMO-HO-000001',
    rating: 5,
    ratingNote: 'Great experience',
    ratedBy: 'recipient-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    dataOrigin: 'demo',
  };

  it('never exposes donorId or estimatedValue publicly', () => {
    const view = toPublicItemView(item);
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('donor-1');
    expect(serialized).not.toContain('120000');
    expect(Object.keys(view)).not.toContain('estimatedValue');
  });

  it('never exposes the rating on the party view', () => {
    const view = toPartyRequestView(request);
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('Great experience');
    expect(Object.keys(view)).not.toContain('rating');
    expect(view.handoverCode).toBe('AZIB-DEMO-HO-000001');
  });
});
