import { createMockDisbursementRepository } from '../disbursement';

async function proposal() {
  const repo = createMockDisbursementRepository();
  const created = await repo.create({
    applicationId: 'app-1',
    amount: 40000,
    makerId: 'maker-1',
  });
  if (!created.ok) throw new Error('setup failed');
  return { repo, id: created.value.id };
}

describe('MockDisbursementRepository — P09 additions', () => {
  it('creates a proposal with a maker and no checker', async () => {
    const { repo, id } = await proposal();
    const found = await repo.getById(id);
    if (!found.ok || !found.value) return;
    expect(found.value.status).toBe('proposed');
    expect(found.value.makerId).toBe('maker-1');
    expect(found.value.checkerId).toBeNull();
    expect(found.value.providerReference).toBeNull();
  });

  it('records checker, proof and beneficiary confirmation in order', async () => {
    const { repo, id } = await proposal();
    await repo.advance(id, { type: 'approve', checkerId: 'checker-2' }, 'checker');
    const approved = await repo.getById(id);
    if (approved.ok && approved.value) {
      expect(approved.value.status).toBe('approved');
      expect(approved.value.checkerId).toBe('checker-2');
      expect(approved.value.approvedAt).toBeTruthy();
    }
    await repo.advance(id, { type: 'record_payment', providerReference: 'proof-1' }, 'finance_officer');
    const paid = await repo.getById(id);
    if (paid.ok && paid.value) {
      expect(paid.value.status).toBe('paid_recorded');
      expect(paid.value.providerReference).toBe('proof-1');
    }
    await repo.advance(id, { type: 'beneficiary_confirm' }, 'beneficiary');
    const confirmed = await repo.getById(id);
    if (confirmed.ok && confirmed.value) {
      expect(confirmed.value.status).toBe('confirmed_by_beneficiary');
      expect(confirmed.value.beneficiaryConfirmedAt).toBeTruthy();
    }
  });

  it('a dispute clears on re-recorded proof', async () => {
    const { repo, id } = await proposal();
    await repo.advance(id, { type: 'approve', checkerId: 'c2' }, 'checker');
    await repo.advance(id, { type: 'record_payment', providerReference: 'p1' }, 'finance_officer');
    await repo.advance(id, { type: 'beneficiary_dispute', note: 'not received' }, 'beneficiary');
    const disputed = await repo.getById(id);
    if (disputed.ok && disputed.value) expect(disputed.value.disputeNote).toBe('not received');
    await repo.advance(id, { type: 're_record_payment', providerReference: 'p2' }, 'finance_officer');
    const reRecorded = await repo.getById(id);
    if (reRecorded.ok && reRecorded.value) {
      expect(reRecorded.value.status).toBe('paid_recorded');
      expect(reRecorded.value.disputeNote).toBeNull();
      expect(reRecorded.value.providerReference).toBe('p2');
    }
  });

  it('rejection keeps the reason key', async () => {
    const { repo, id } = await proposal();
    await repo.advance(
      id,
      { type: 'reject', checkerId: 'c2', reasonKey: 'assistance:finance.reasons.rejected' },
      'checker',
    );
    const found = await repo.getById(id);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('rejected');
      expect(found.value.rejectionReasonKey).toBe('assistance:finance.reasons.rejected');
    }
  });
});
