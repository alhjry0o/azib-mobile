import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockJobRepository } from '../job';

describe('MockJobRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockJobRepository(),
    validCreate: {
      titleKey: 'jobs.demo.title',
      partnerId: 'partner-1',
    },
    invalidCreate: {
      titleKey: '',
      partnerId: '',
    },
    validUpdate: { status: 'open' as const },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockJobRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
