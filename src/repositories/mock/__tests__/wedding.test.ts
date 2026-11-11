import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockWeddingRepository } from '../wedding';

describe('MockWeddingRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockWeddingRepository(),
    validCreate: {
      titleKey: 'weddings.demo.title',
      scheduledDate: '2026-12-01T10:00:00.000Z',
      capacity: 100,
    },
    invalidCreate: {
      titleKey: '',
      scheduledDate: 'nope',
      capacity: -1,
    },
    validUpdate: { capacity: 200 },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockWeddingRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
