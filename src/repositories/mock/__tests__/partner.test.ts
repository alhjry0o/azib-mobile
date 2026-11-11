import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockPartnerRepository } from '../partner';

describe('MockPartnerRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockPartnerRepository(),
    validCreate: {
      displayName: 'Demo Partner',
      category: 'catering',
    },
    invalidCreate: {
      displayName: '',
      category: '',
    },
    validUpdate: { status: 'verified' as const },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockPartnerRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
