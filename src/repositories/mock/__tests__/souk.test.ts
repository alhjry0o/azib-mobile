import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockSoukRepository } from '../souk';

describe('MockSoukRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockSoukRepository(),
    validCreate: {
      titleKey: 'souk.demo.title',
      category: 'furniture',
    },
    invalidCreate: {
      titleKey: '',
      category: '',
    },
    validUpdate: { status: 'reserved' as const },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockSoukRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
