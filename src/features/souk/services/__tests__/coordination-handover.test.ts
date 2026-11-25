import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockProfileRepository } from '@/repositories/mock/profile';
import { createMockSoukRepository } from '@/repositories/mock/souk';
import { createMockSoukChatRepository } from '@/repositories/mock/souk-chat';
import { createMockSoukRequestRepository } from '@/repositories/mock/souk-request';
import {
  readCounterpartyContact,
  removeMessage,
  sendCoordinationMessage,
  setContactConsent,
} from '../coordination-service';
import { confirmHandover, rateExperience, readRatingForStaff } from '../handover-service';
import { createItemDraft, submitItemForPublication } from '../item-service';
import { createRequest, decideRequest } from '../request-service';
import { DEFAULT_SOUK_LIMITS } from '../../state/limits';

function setup() {
  return {
    souk: createMockSoukRepository(),
    requests: createMockSoukRequestRepository(),
    chat: createMockSoukChatRepository(),
    profiles: createMockProfileRepository(),
    audit: createMockAuditRepository(),
  };
}

async function accepted() {
  const deps = setup();
  const now = new Date('2026-06-01T00:00:00.000Z');
  const created = await createItemDraft(
    deps,
    {
      donorId: 'donor-1',
      title: 'Bedroom set',
      category: 'furniture',
      condition: 'good',
      description: 'A gently used bedroom set offered as an in-kind donation.',
      governorateId: 'sanaa',
      districtId: null,
      deliveryMethod: 'self_pickup',
      imageFileIds: [],
      imageFingerprints: [],
      estimatedValue: null,
      noResaleConsent: true,
    },
    DEFAULT_SOUK_LIMITS,
    now,
  );
  if (!created.ok) throw new Error('setup failed');
  await submitItemForPublication(deps, created.value.id, 'donor-1', DEFAULT_SOUK_LIMITS, now);
  const request = await createRequest(
    deps,
    created.value.id,
    'recipient-1',
    'Setting up a new home.',
    DEFAULT_SOUK_LIMITS,
    now,
  );
  if (!request.ok) throw new Error('setup failed');
  await decideRequest(deps, request.value.id, 'donor-1', 'member', 'accepted', now);
  await deps.profiles.create({
    userId: 'recipient-1',
    displayName: 'Recipient',
    gender: 'unspecified',
    maritalStatus: 'single',
    phone: '+967700000001',
  });
  return { deps, requestId: request.value.id, itemId: created.value.id, now };
}

describe('coordination chat and disclosure', () => {
  it('blocks phones and links, and allows plain coordination text', async () => {
    const { deps, requestId } = await accepted();
    const now = new Date();
    const blocked = await sendCoordinationMessage(deps, requestId, 'donor-1', 'call 771234567', now);
    expect(blocked.ok).toBe(false);
    const allowed = await sendCoordinationMessage(
      deps,
      requestId,
      'donor-1',
      'Ready for pickup at the agreed public area.',
      now,
    );
    expect(allowed.ok).toBe(true);
  });

  it('refuses chat to a non-party', async () => {
    const { deps, requestId } = await accepted();
    const result = await sendCoordinationMessage(deps, requestId, 'stranger', 'hello there', new Date());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Forbidden');
  });

  it('discloses the counterparty phone only after BOTH consents', async () => {
    const { deps, requestId } = await accepted();
    const before = await readCounterpartyContact(deps, requestId, 'donor-1');
    expect(before.ok).toBe(true);
    if (before.ok) {
      expect(before.value.state).toBe('awaiting_consents');
      expect(before.value.phone).toBeNull();
    }
    await setContactConsent(deps, requestId, 'donor-1', true);
    const oneSided = await readCounterpartyContact(deps, requestId, 'donor-1');
    if (oneSided.ok) expect(oneSided.value.phone).toBeNull();
    await setContactConsent(deps, requestId, 'recipient-1', true);
    const ready = await readCounterpartyContact(deps, requestId, 'donor-1');
    expect(ready.ok).toBe(true);
    if (ready.ok) {
      expect(ready.value.state).toBe('ready');
      expect(ready.value.phone).toBe('+967700000001');
    }
    const stranger = await readCounterpartyContact(deps, requestId, 'stranger');
    if (stranger.ok) expect(stranger.value.phone).toBeNull();
  });

  it('only a moderator removes a message', async () => {
    const { deps, requestId } = await accepted();
    const sent = await sendCoordinationMessage(deps, requestId, 'donor-1', 'Pickup at noon.', new Date());
    if (!sent.ok) throw new Error('setup failed');
    const denied = await removeMessage(deps, sent.value.id, 'member', 'donor-1');
    expect(denied.ok).toBe(false);
    const removed = await removeMessage(deps, sent.value.id, 'moderator', 'mod-1');
    expect(removed.ok).toBe(true);
  });
});

describe('dual handover and rating', () => {
  it('needs both confirmations with the correct code', async () => {
    const { deps, requestId, itemId } = await accepted();
    const request = await deps.requests.getById(requestId);
    if (!request.ok || !request.value) throw new Error('setup failed');
    const code = request.value.handoverCode ?? '';
    const now = new Date();

    const wrong = await confirmHandover(deps, requestId, 'donor-1', 'wrong-code', now);
    expect(wrong.ok).toBe(false);

    const donorOnly = await confirmHandover(deps, requestId, 'donor-1', code, now);
    expect(donorOnly.ok).toBe(true);
    if (donorOnly.ok) expect(donorOnly.value.status).toBe('accepted');

    const both = await confirmHandover(deps, requestId, 'recipient-1', code, now);
    expect(both.ok).toBe(true);
    if (both.ok) expect(both.value.status).toBe('handed_over');
    const item = await deps.souk.getById(itemId);
    if (item.ok && item.value) expect(item.value.status).toBe('handed_over');
  });

  it('rates only after handover, and keeps the rating staff-private', async () => {
    const { deps, requestId } = await accepted();
    const early = await rateExperience(deps, requestId, 'recipient-1', 5, null, new Date());
    expect(early.ok).toBe(false);

    const request = await deps.requests.getById(requestId);
    if (!request.ok || !request.value) throw new Error('setup failed');
    const code = request.value.handoverCode ?? '';
    const now = new Date();
    await confirmHandover(deps, requestId, 'donor-1', code, now);
    await confirmHandover(deps, requestId, 'recipient-1', code, now);

    const rated = await rateExperience(deps, requestId, 'recipient-1', 5, 'Smooth', now);
    expect(rated.ok).toBe(true);
    if (!rated.ok) return;
    const denied = readRatingForStaff(rated.value, 'member');
    expect(denied.ok).toBe(false);
    const staff = readRatingForStaff(rated.value, 'moderator');
    expect(staff.ok).toBe(true);
    if (staff.ok) expect(staff.value?.score).toBe(5);
  });
});
