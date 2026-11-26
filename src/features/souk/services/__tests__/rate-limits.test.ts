import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockSoukRepository } from '@/repositories/mock/souk';
import { createMockSoukRequestRepository } from '@/repositories/mock/souk-request';
import { createItemDraft, submitItemForPublication } from '../item-service';
import { createRequest } from '../request-service';
import { DEFAULT_SOUK_LIMITS, resolveSoukLimits } from '../../state/limits';

// The injected clock MUST match the storage clock: repositories stamp with
// new Date(), so a fixed past date would exclude every stored timestamp.
function storageAlignedNow(): Date {
  return new Date();
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

function itemSetup() {
  return { souk: createMockSoukRepository(), audit: createMockAuditRepository() };
}

function requestSetup() {
  return {
    souk: createMockSoukRepository(),
    requests: createMockSoukRequestRepository(),
    audit: createMockAuditRepository(),
  };
}

describe('item creation rate limit', () => {
  it('refuses the fourth item inside the window', async () => {
    const deps = itemSetup();
    for (let i = 0; i < DEFAULT_SOUK_LIMITS.itemCreateRate.maxMessages; i += 1) {
      const created = await createItemDraft(
        deps,
        { ...draft, title: `Bedroom set ${i}` },
        DEFAULT_SOUK_LIMITS,
        storageAlignedNow(),
      );
      expect(created.ok).toBe(true);
    }
    const blocked = await createItemDraft(
      deps,
      { ...draft, title: 'One more set' },
      DEFAULT_SOUK_LIMITS,
      storageAlignedNow(),
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.meta.code).toBe('ITEM_RATE_LIMITED');
  });
});

describe('request creation rate limit', () => {
  it('refuses the sixth request inside the window', async () => {
    const deps = requestSetup();
    const limits = resolveSoukLimits({ soukMaxActiveRequests: 20 });
    const itemDeps = { souk: deps.souk, audit: deps.audit };
    const itemIds: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      const created = await createItemDraft(
        itemDeps,
        { ...draft, donorId: `donor-${i}`, title: `Set ${i}` },
        resolveSoukLimits({ soukMaxActiveRequests: 20 }),
        storageAlignedNow(),
      );
      if (!created.ok) throw new Error('setup failed');
      const published = await submitItemForPublication(
        itemDeps,
        created.value.id,
        `donor-${i}`,
        limits,
        storageAlignedNow(),
      );
      if (!published.ok) throw new Error('setup failed');
      itemIds.push(created.value.id);
    }

    for (let i = 0; i < limits.requestCreateRate.maxMessages; i += 1) {
      const id = itemIds[i];
      if (!id) throw new Error('setup failed');
      const requested = await createRequest(
        deps,
        id,
        'requester-1',
        'Setting up a new home for a young family.',
        limits,
        storageAlignedNow(),
      );
      expect(requested.ok).toBe(true);
    }
    const lastId = itemIds[5];
    if (!lastId) throw new Error('setup failed');
    const blocked = await createRequest(
      deps,
      lastId,
      'requester-1',
      'Setting up a new home for a young family.',
      limits,
      storageAlignedNow(),
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.meta.code).toBe('REQUEST_RATE_LIMITED');
  });
});
