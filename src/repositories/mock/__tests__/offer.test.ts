import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockOfferRepository } from '../offer';

describe('MockOfferRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockOfferRepository(),
    validCreate: {
      partnerId: 'partner-1',
      titleKey: 'offers.demo.title',
      discountPercent: 15,
    },
    invalidCreate: {
      partnerId: '',
      titleKey: '',
      discountPercent: 150,
    },
    validUpdate: { discountPercent: 25 },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockOfferRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
