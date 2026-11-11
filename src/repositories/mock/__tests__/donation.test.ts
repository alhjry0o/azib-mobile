import { appendOnlyRepositoryContract } from '../../__tests__/contracts/append-only.contract';
import { createMockDonationRepository } from '../donation';

describe('MockDonationRepository', () => {
  appendOnlyRepositoryContract({
    getRepo: () => createMockDonationRepository(),
    validCreate: { donorId: 'donor-1', amount: 5000 },
    invalidCreate: { donorId: '', amount: -1 },
    expectedDataOrigin: 'demo',
  });

  it('listByDonor returns matching donations only', async () => {
    const repo = createMockDonationRepository();
    await repo.create({ donorId: 'donor-a', amount: 100 });
    await repo.create({ donorId: 'donor-a', amount: 200 });
    await repo.create({ donorId: 'donor-b', amount: 300 });
    const r = await repo.listByDonor('donor-a');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(2);
      expect(r.value.items.every((d) => d.donorId === 'donor-a')).toBe(true);
    }
  });

  it('records dataOrigin=demo (ADR-0005 Non-Custodial: no money moves in-app)', async () => {
    const repo = createMockDonationRepository();
    const r = await repo.create({ donorId: 'd1', amount: 100 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.dataOrigin).toBe('demo');
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockDonationRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
