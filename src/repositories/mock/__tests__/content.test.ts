import type { ContentRecord } from '../../contracts/content';
import { createMockContentRepository } from '../content';

const seed: readonly ContentRecord[] = [
  {
    id: 'c1',
    slug: 'welcome',
    titleKey: 'learn:welcome.title',
    bodyKey: 'learn:welcome.body',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataOrigin: 'demo',
  },
];

describe('MockContentRepository', () => {
  it('returns null for unknown id', async () => {
    const repo = createMockContentRepository();
    const r = await repo.getById('missing');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('returns null for unknown slug', async () => {
    const repo = createMockContentRepository(undefined, seed);
    const r = await repo.getBySlug('missing');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('returns record by slug', async () => {
    const repo = createMockContentRepository(undefined, seed);
    const r = await repo.getBySlug('welcome');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value?.id).toBe('c1');
  });

  it('lists seeded records', async () => {
    const repo = createMockContentRepository(undefined, seed);
    const r = await repo.list();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.total).toBe(1);
  });

  it('has no create method (read-only)', () => {
    const repo = createMockContentRepository();
    expect('create' in repo).toBe(false);
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockContentRepository({ forceErrorKind: 'Network' }, seed);
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
