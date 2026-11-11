import { createMockSearchProvider } from '@/providers/mock';

import { createMockSearchRepository } from '../search';

describe('MockSearchRepository', () => {
  it('delegates to SearchProvider and unwraps items', async () => {
    const provider = createMockSearchProvider(undefined, [
      { id: '1', score: 1, item: { name: 'wedding partner' } },
      { id: '2', score: 1, item: { name: 'souk' } },
    ]);
    const repo = createMockSearchRepository(provider);
    const r = await repo.search<{ name: string }>('wedding');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.length).toBe(1);
      expect(r.value[0]?.name).toBe('wedding partner');
    }
  });

  it('returns empty for empty query', async () => {
    const provider = createMockSearchProvider();
    const repo = createMockSearchRepository(provider);
    const r = await repo.search('   ');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([]);
  });

  it('respects limit', async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      score: 1,
      item: { name: 'match' },
    }));
    const provider = createMockSearchProvider(undefined, items);
    const repo = createMockSearchRepository(provider);
    const r = await repo.search('match', { limit: 3 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.length).toBe(3);
  });

  it('propagates provider errors', async () => {
    const provider = createMockSearchProvider({ forceErrorKind: 'Network' });
    const repo = createMockSearchRepository(provider);
    const r = await repo.search('anything');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
