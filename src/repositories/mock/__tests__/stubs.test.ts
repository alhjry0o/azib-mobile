import {
  createStubAuditRepository,
  createStubContentRepository,
  createStubDisbursementRepository,
  createStubDonationRepository,
  createStubJobRepository,
  createStubNotificationRepository,
  createStubOfferRepository,
  createStubPartnerRepository,
  createStubSearchRepository,
  createStubSettingsRepository,
  createStubSoukRepository,
  createStubVolunteerRepository,
  createStubWeddingRepository,
} from '../stubs';

describe('Not-yet-implemented repository stubs', () => {
  it('donations return NotConnected', async () => {
    const r = await createStubDonationRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('disbursements return NotConnected', async () => {
    const r = await createStubDisbursementRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('weddings return NotConnected', async () => {
    const r = await createStubWeddingRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('partners return NotConnected', async () => {
    const r = await createStubPartnerRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('offers return NotConnected', async () => {
    const r = await createStubOfferRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('souk returns NotConnected', async () => {
    const r = await createStubSoukRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('jobs return NotConnected', async () => {
    const r = await createStubJobRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('volunteers return NotConnected', async () => {
    const r = await createStubVolunteerRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('content returns NotConnected', async () => {
    const r = await createStubContentRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('notifications return NotConnected', async () => {
    const r = await createStubNotificationRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('search returns NotConnected', async () => {
    const r = await createStubSearchRepository().search('query');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('audit returns NotConnected', async () => {
    const r = await createStubAuditRepository().list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });

  it('settings returns NotConnected', async () => {
    const r = await createStubSettingsRepository().get('key');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotConnected');
  });
});
