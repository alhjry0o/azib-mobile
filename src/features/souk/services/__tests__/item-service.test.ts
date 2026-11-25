import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockSoukRepository } from '@/repositories/mock/souk';
import {
  createItemDraft,
  expireItem,
  relistItem,
  reviewItem,
  submitItemForPublication,
  withdrawItem,
} from '../item-service';
import { DEFAULT_SOUK_LIMITS, resolveSoukLimits } from '../../state/limits';

function setup() {
  return { souk: createMockSoukRepository(), audit: createMockAuditRepository() };
}

const input = {
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

describe('souk item service', () => {
  it('creates a DRAFT even though the factory defaults to available', async () => {
    const deps = setup();
    const created = await createItemDraft(deps, input, DEFAULT_SOUK_LIMITS, new Date());
    expect(created.ok).toBe(true);
    if (created.ok) expect(created.value.status).toBe('draft');
  });

  it('requires the no-resale consent and a valid draft', async () => {
    const deps = setup();
    const denied = await createItemDraft(
      deps,
      { ...input, noResaleConsent: false },
      DEFAULT_SOUK_LIMITS,
      new Date(),
    );
    expect(denied.ok).toBe(false);
    const invalid = await createItemDraft(
      deps,
      { ...input, title: 'x' },
      DEFAULT_SOUK_LIMITS,
      new Date(),
    );
    expect(invalid.ok).toBe(false);
  });

  it('publishes directly when review is off, and sets expiry', async () => {
    const deps = setup();
    const now = new Date('2026-06-01T00:00:00.000Z');
    const created = await createItemDraft(deps, input, DEFAULT_SOUK_LIMITS, now);
    if (!created.ok) throw new Error('setup failed');
    const published = await submitItemForPublication(
      deps,
      created.value.id,
      'donor-1',
      DEFAULT_SOUK_LIMITS,
      now,
    );
    expect(published.ok).toBe(true);
    if (published.ok) {
      expect(published.value.status).toBe('available');
      expect(published.value.expiresAt).toBe('2026-07-31T00:00:00.000Z');
    }
  });

  it('routes through pending_review when settings enable review', async () => {
    const deps = setup();
    const limits = resolveSoukLimits({ soukRequireItemReview: true });
    const now = new Date('2026-06-01T00:00:00.000Z');
    const created = await createItemDraft(deps, input, limits, now);
    if (!created.ok) throw new Error('setup failed');
    const submitted = await submitItemForPublication(
      deps,
      created.value.id,
      'donor-1',
      limits,
      now,
    );
    expect(submitted.ok).toBe(true);
    if (submitted.ok) expect(submitted.value.status).toBe('pending_review');

    const denied = await reviewItem(
      deps,
      created.value.id,
      'member',
      'someone',
      'available',
      limits,
      now,
    );
    expect(denied.ok).toBe(false);

    const approved = await reviewItem(
      deps,
      created.value.id,
      'moderator',
      'mod-1',
      'available',
      limits,
      now,
    );
    expect(approved.ok).toBe(true);
    if (approved.ok) expect(approved.value.status).toBe('available');
  });

  it('requires a reason to reject and refuses non-donor withdrawal', async () => {
    const deps = setup();
    const limits = resolveSoukLimits({ soukRequireItemReview: true });
    const now = new Date();
    const created = await createItemDraft(deps, input, limits, now);
    if (!created.ok) throw new Error('setup failed');
    await submitItemForPublication(deps, created.value.id, 'donor-1', limits, now);
    const noReason = await reviewItem(
      deps,
      created.value.id,
      'moderator',
      'mod-1',
      'rejected',
      limits,
      now,
    );
    expect(noReason.ok).toBe(false);
    const stranger = await withdrawItem(deps, created.value.id, 'someone-else');
    expect(stranger.ok).toBe(false);
  });

  it('expires by system and relists back to draft', async () => {
    const deps = setup();
    const now = new Date('2026-06-01T00:00:00.000Z');
    const created = await createItemDraft(deps, input, DEFAULT_SOUK_LIMITS, now);
    if (!created.ok) throw new Error('setup failed');
    await submitItemForPublication(deps, created.value.id, 'donor-1', DEFAULT_SOUK_LIMITS, now);
    const expired = await expireItem(deps, created.value.id, 'system-1');
    expect(expired.ok).toBe(true);
    const relisted = await relistItem(deps, created.value.id, 'donor-1');
    expect(relisted.ok).toBe(true);
    if (relisted.ok) {
      expect(relisted.value.status).toBe('draft');
      expect(relisted.value.expiresAt).toBeNull();
    }
  });

  it('flags sale words and duplicates without blocking creation', async () => {
    const deps = setup();
    const now = new Date();
    const first = await createItemDraft(
      deps,
      { ...input, imageFingerprints: ['fp-1'] },
      DEFAULT_SOUK_LIMITS,
      now,
    );
    if (!first.ok) throw new Error('setup failed');
    const second = await createItemDraft(
      deps,
      {
        ...input,
        title: 'Bedroom set for sale',
        imageFingerprints: ['fp-1'],
      },
      DEFAULT_SOUK_LIMITS,
      now,
    );
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.value.saleWordFlag).toBe(true);
      expect(second.value.duplicateFlag).toBe(true);
    }
  });

  it('returns NotFound for an unknown item instead of a fake success', async () => {
    const deps = setup();
    const result = await expireItem(deps, 'nope', 'system-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NotFound');
  });
});
