import { appendOnlyRepositoryContract } from '../../__tests__/contracts/append-only.contract';
import { createMockDisbursementRepository } from '../disbursement';

describe('MockDisbursementRepository', () => {
  appendOnlyRepositoryContract({
    getRepo: () => createMockDisbursementRepository(),
    validCreate: { applicationId: 'app-1', amount: 10000 },
    invalidCreate: { applicationId: '', amount: -1 },
    expectedDataOrigin: 'demo',
  });

  it('listByApplication returns matching disbursements only', async () => {
    const repo = createMockDisbursementRepository();
    await repo.create({ applicationId: 'app-x', amount: 100 });
    await repo.create({ applicationId: 'app-x', amount: 200 });
    await repo.create({ applicationId: 'app-y', amount: 300 });
    const r = await repo.listByApplication('app-x');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(2);
      expect(r.value.items.every((d) => d.applicationId === 'app-x')).toBe(true);
    }
  });

  it('forceErrorKind: Unknown causes all methods to fail', async () => {
    const repo = createMockDisbursementRepository({ forceErrorKind: 'Unknown' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Unknown');
  });
});
