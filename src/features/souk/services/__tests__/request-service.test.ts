import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockSoukRepository } from '@/repositories/mock/souk';
import { createMockSoukRequestRepository } from '@/repositories/mock/souk-request';
import { createItemDraft, submitItemForPublication } from '../item-service';
import { cancelRequest, createRequest, decideRequest } from '../request-service';
import { DEFAULT_SOUK_LIMITS, resolveSoukLimits } from '../../state/limits';

function setup() {
  return {
    souk: createMockSoukRepository(),
    requests: createMockSoukRequestRepository(),
    audit: createMockAuditRepository(),
  };
}

const draft = {
  donorId: 'donor-1',
  title: 'Bedroom set',
  category: 'furniture',
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

async function availableItem(deps: ReturnType<typeof setup>, donorId = 'donor-1') {
  const now = new Date('2026-06-01T00:00:00.000Z');
  const created = await createItemDraft(deps, { ...draft, donorId }, DEFAULT_SOUK_LIMITS, now);
  if (!created.ok) throw new Error('setup failed');
  const published = await submitItemForPublication(
    deps,
    created.value.id,
    donorId,
    DEFAULT_SOUK_LIMITS,
    now,
  );
  if (!published.ok) throw new Error('setup failed');
  return published.value.id;
}

describe('souk request service', () => {
  it('creates a request and refuses own items / unavailable items', async () => {
    const deps = setup();
    const itemId = await availableItem(deps);
    const now = new Date();
    const own = await createRequest(deps, itemId, 'donor-1', 'Setting up a new home.', DEFAULT_SOUK_LIMITS, now);
    expect(own.ok).toBe(false);
    if (!own.ok) expect(own.error.meta.code).toBe('OWN_ITEM');

    const created = await createRequest(
      deps,
      itemId,
      'recipient-1',
      'Setting up a new home.',
      DEFAULT_SOUK_LIMITS,
      now,
    );
    expect(created.ok).toBe(true);
    if (created.ok) expect(created.value.status).toBe('pending');
  });

  it('enforces the active-request ceiling and duplicate requests', async () => {
    const deps = setup();
    const limits = resolveSoukLimits({ soukMaxActiveRequests: 1 });
    const first = await availableItem(deps);
    const second = await availableItem(deps);
    const now = new Date();
    await createRequest(deps, first, 'recipient-1', 'Setting up a new home.', limits, now);
    const duplicate = await createRequest(deps, first, 'recipient-1', 'Setting up a new home.', limits, now);
    expect(duplicate.ok).toBe(false);
    const over = await createRequest(deps, second, 'recipient-1', 'Setting up a new home.', limits, now);
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error.meta.code).toBe('ACTIVE_REQUEST_LIMIT');
  });

  it('acceptance reserves the item and mints a demo handover code', async () => {
    const deps = setup();
    const itemId = await availableItem(deps);
    const now = new Date('2026-06-01T00:00:00.000Z');
    const request = await createRequest(deps, itemId, 'recipient-1', 'Setting up a new home.', DEFAULT_SOUK_LIMITS, now);
    if (!request.ok) throw new Error('setup failed');

    const stranger = await decideRequest(deps, request.value.id, 'someone', 'member', 'accepted', now);
    expect(stranger.ok).toBe(false);

    const accepted = await decideRequest(deps, request.value.id, 'donor-1', 'member', 'accepted', now);
    expect(accepted.ok).toBe(true);
    if (accepted.ok) expect(accepted.value.handoverCode?.startsWith('AZIB-DEMO-HO-')).toBe(true);
    const item = await deps.souk.getById(itemId);
    if (item.ok && item.value) {
      expect(item.value.status).toBe('reserved');
      expect(item.value.reservedForRequestId).toBe(request.value.id);
    }
  });

  it('cancelling an accepted request releases the item', async () => {
    const deps = setup();
    const itemId = await availableItem(deps);
    const now = new Date();
    const request = await createRequest(deps, itemId, 'recipient-1', 'Setting up a new home.', DEFAULT_SOUK_LIMITS, now);
    if (!request.ok) throw new Error('setup failed');
    await decideRequest(deps, request.value.id, 'donor-1', 'member', 'accepted', now);
    const cancelled = await cancelRequest(deps, request.value.id, 'recipient-1', 'member');
    expect(cancelled.ok).toBe(true);
    const item = await deps.souk.getById(itemId);
    if (item.ok && item.value) {
      expect(item.value.status).toBe('available');
      expect(item.value.reservedForRequestId).toBeNull();
    }
  });

  it('requires a reason to reject and refuses unavailable items', async () => {
    const deps = setup();
    const itemId = await availableItem(deps);
    const now = new Date();
    const request = await createRequest(deps, itemId, 'recipient-1', 'Setting up a new home.', DEFAULT_SOUK_LIMITS, now);
    if (!request.ok) throw new Error('setup failed');
    const noReason = await decideRequest(deps, request.value.id, 'donor-1', 'member', 'rejected', now);
    expect(noReason.ok).toBe(false);
    await decideRequest(deps, request.value.id, 'donor-1', 'member', 'accepted', now);
    const second = await createRequest(deps, itemId, 'recipient-2', 'Setting up a new home.', DEFAULT_SOUK_LIMITS, now);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.meta.code).toBe('ITEM_NOT_AVAILABLE');
  });
});
