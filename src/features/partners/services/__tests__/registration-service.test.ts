import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockPartnerRepository } from '@/repositories/mock/partner';
import { createMockPartnerVerificationRepository } from '@/repositories/mock/partner-verification';
import { registerPartner, resubmitVerification } from '../registration-service';
import { decideVerification, expirePartner } from '../verification-service';

function setup() {
  return {
    partners: createMockPartnerRepository(),
    verifications: createMockPartnerVerificationRepository(),
    audit: createMockAuditRepository(),
  };
}

const input = {
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
};

describe('partner registration', () => {
  it('registers and lands in pending_verification with a record', async () => {
    const deps = setup();
    const result = await registerPartner(deps, input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('pending_verification');
    expect(result.value.contactPhone).toBe('+967771234567');
    expect(result.value.whatsapp).toBe('+967771234567');
    const latest = await deps.verifications.getLatest(result.value.id);
    if (latest.ok) expect(latest.value?.status).toBe('pending');
  });

  it('requires terms, documents and a valid Yemeni phone', async () => {
    const deps = setup();
    expect((await registerPartner(deps, { ...input, termsAccepted: false })).ok).toBe(false);
    expect((await registerPartner(deps, { ...input, documentFileIds: [] })).ok).toBe(false);
    expect((await registerPartner(deps, { ...input, contactPhone: '123' })).ok).toBe(false);
    expect((await registerPartner(deps, { ...input, ownerId: '' })).ok).toBe(false);
  });

  it('grants the crown only after a verifier decides', async () => {
    const deps = setup();
    const created = await registerPartner(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const latest = await deps.verifications.getLatest(created.value.id);
    if (!latest.ok || !latest.value) throw new Error('setup failed');

    const denied = await decideVerification(
      deps,
      created.value.id,
      latest.value.id,
      'partner_owner',
      'owner-1',
      'verified',
    );
    expect(denied.ok).toBe(false);

    const verified = await decideVerification(
      deps,
      created.value.id,
      latest.value.id,
      'partner_verifier',
      'verifier-1',
      'verified',
    );
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.value.status).toBe('verified');
      expect(verified.value.reverifyAfter).toBeTruthy();
    }
  });

  it('requires a reason to reject and allows re-submission afterwards', async () => {
    const deps = setup();
    const created = await registerPartner(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const latest = await deps.verifications.getLatest(created.value.id);
    if (!latest.ok || !latest.value) throw new Error('setup failed');
    const noReason = await decideVerification(
      deps,
      created.value.id,
      latest.value.id,
      'partner_verifier',
      'verifier-1',
      'rejected',
    );
    expect(noReason.ok).toBe(false);
    await decideVerification(
      deps,
      created.value.id,
      latest.value.id,
      'partner_verifier',
      'verifier-1',
      'rejected',
      'marketplace:dev.rejectReason',
    );
    const resubmitted = await resubmitVerification(deps, created.value.id, 'owner-1', ['doc-2']);
    expect(resubmitted.ok).toBe(true);
    if (resubmitted.ok) expect(resubmitted.value.status).toBe('pending_verification');
  });

  it('expires a verified partner through the system actor only', async () => {
    const deps = setup();
    const created = await registerPartner(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const latest = await deps.verifications.getLatest(created.value.id);
    if (!latest.ok || !latest.value) throw new Error('setup failed');
    await decideVerification(
      deps,
      created.value.id,
      latest.value.id,
      'partner_verifier',
      'verifier-1',
      'verified',
    );
    const expired = await expirePartner(deps, created.value.id, 'system-1');
    expect(expired.ok).toBe(true);
    if (expired.ok) expect(expired.value.status).toBe('expired');
  });
});
