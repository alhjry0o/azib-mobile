import { createMockWeddingBudgetRepository } from '../wedding-budget';

async function version() {
  const repo = createMockWeddingBudgetRepository();
  const created = await repo.createVersion({
    groupId: 'g1',
    version: 1,
    splitMode: 'equal',
  });
  if (!created.ok) throw new Error('setup failed');
  return { repo, id: created.value.id };
}

describe('MockWeddingBudgetRepository', () => {
  it('resets approvals when an item is added', async () => {
    const { repo, id } = await version();
    await repo.approveShare(id, 'u1');
    const before = await repo.listApprovals(id);
    if (before.ok) expect(before.value.length).toBe(1);
    await repo.addItem({
      versionId: id,
      groupId: 'g1',
      category: 'hall',
      labelKey: 'weddings:budget.hall',
      amount: 100000,
      scope: 'shared',
    });
    const after = await repo.listApprovals(id);
    expect(after.ok).toBe(true);
    if (after.ok) expect(after.value.length).toBe(0);
  });

  it('resets approvals when the split configuration changes', async () => {
    const { repo, id } = await version();
    await repo.approveShare(id, 'u1');
    await repo.updateVersion(id, { splitMode: 'weighted', weights: [{ memberId: 'u1', weight: 2 }] });
    const approvals = await repo.listApprovals(id);
    if (approvals.ok) expect(approvals.value.length).toBe(0);
  });

  it('requires a member for individual items', async () => {
    const { repo, id } = await version();
    const bad = await repo.addItem({
      versionId: id,
      groupId: 'g1',
      category: 'clothing',
      labelKey: 'l',
      amount: 1000,
      scope: 'individual',
    });
    expect(bad.ok).toBe(false);
  });

  it('acknowledges an agreement once per member', async () => {
    const { repo, id } = await version();
    const agreement = await repo.createAgreement({
      groupId: 'g1',
      versionId: id,
      summaryKey: 'weddings:agreement.summary',
    });
    if (!agreement.ok) throw new Error('setup failed');
    await repo.acknowledgeAgreement(agreement.value.id, 'u1');
    const twice = await repo.acknowledgeAgreement(agreement.value.id, 'u1');
    expect(twice.ok).toBe(true);
    if (twice.ok) expect(twice.value.acknowledgements).toEqual(['u1']);
  });

  it('records a partner service request without any payment', async () => {
    const { repo } = await version();
    const request = await repo.createServiceRequest({
      groupId: 'g1',
      partnerId: 'p1',
      categoryKey: 'weddings:category.hall',
      message: 'availability request',
    });
    expect(request.ok).toBe(true);
    if (!request.ok) return;
    expect(request.value.status).toBe('sent');
    expect(Object.keys(request.value)).not.toContain('amountPaid');
    const replied = await repo.updateServiceRequest(request.value.id, 'accepted', 'available');
    expect(replied.ok).toBe(true);
    if (replied.ok) expect(replied.value.reply).toBe('available');
  });
});
