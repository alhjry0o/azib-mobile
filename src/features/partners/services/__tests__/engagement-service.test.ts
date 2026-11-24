import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockOfferRepository } from '@/repositories/mock/offer';
import { createMockOfferReportRepository } from '@/repositories/mock/offer-report';
import { createMockPartnerEngagementRepository } from '@/repositories/mock/partner-engagement';
import {
  recordOfferView,
  reportOffer,
  saveOffer,
  unsaveOffer,
} from '../engagement-service';

async function setup() {
  const deps = {
    offers: createMockOfferRepository(),
    offerReports: createMockOfferReportRepository(),
    engagement: createMockPartnerEngagementRepository(),
    audit: createMockAuditRepository(),
  };
  const created = await deps.offers.create({
    partnerId: 'p1',
    titleKey: 'marketplace:offers.title',
    discountPercent: 10,
  });
  if (!created.ok) throw new Error('setup failed');
  return { deps, offerId: created.value.id };
}

describe('engagement service', () => {
  it('saves once and unsaves', async () => {
    const { deps, offerId } = await setup();
    await saveOffer(deps, offerId, 'u1');
    await saveOffer(deps, offerId, 'u1');
    const saved = await deps.engagement.listSaved('u1');
    if (saved.ok) expect(saved.value.length).toBe(1);
    await unsaveOffer(deps, offerId, 'u1');
    const after = await deps.engagement.listSaved('u1');
    if (after.ok) expect(after.value.length).toBe(0);
  });

  it('refuses unknown offers and missing sessions', async () => {
    const { deps, offerId } = await setup();
    const unknown = await saveOffer(deps, 'nope', 'u1');
    expect(unknown.ok).toBe(false);
    const noSession = await saveOffer(deps, offerId, '');
    expect(noSession.ok).toBe(false);
  });

  it('validates a report and writes one audit entry', async () => {
    const { deps, offerId } = await setup();
    const short = await reportOffer(deps, offerId, 'u1', 'marketplace:report.reasons.expired', 'short');
    expect(short.ok).toBe(false);
    const created = await reportOffer(
      deps,
      offerId,
      'u1',
      'marketplace:report.reasons.wrongDiscount',
      'The discount is not applied at the shop.',
    );
    expect(created.ok).toBe(true);
    const entries = await deps.audit.list();
    if (entries.ok) expect(entries.value.total).toBe(1);
  });

  it('counts views without any viewer identity', async () => {
    const { deps, offerId } = await setup();
    await recordOfferView(deps, offerId);
    const second = await recordOfferView(deps, offerId);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.value).toBe(2);
    const views = await deps.engagement.getViews(offerId);
    if (views.ok) expect(views.value).toBe(2);
  });
});
