import { createMockDonationRepository } from '../donation';

async function intent(repo = createMockDonationRepository()) {
  const created = await repo.create({
    donorId: 'donor-1',
    amount: 50000,
    programId: 'program-1',
    anonymous: true,
    idempotencyKey: 'key-1',
  });
  if (!created.ok) throw new Error('setup failed');
  return { repo, id: created.value.id };
}

describe('MockDonationRepository — P09 additions', () => {
  it('creates an intent (not a received amount)', async () => {
    const { repo, id } = await intent();
    const found = await repo.getById(id);
    expect(found.ok).toBe(true);
    if (!found.ok || !found.value) return;
    expect(found.value.status).toBe('intent_created');
    expect(found.value.dataOrigin).toBe('demo');
    expect(found.value.receiptNumber).toBeNull();
    expect(found.value.anonymous).toBe(true);
  });

  it('is idempotent for the same donor and key', async () => {
    const repo = createMockDonationRepository();
    const first = await repo.create({ donorId: 'd1', amount: 100, idempotencyKey: 'k' });
    const second = await repo.create({ donorId: 'd1', amount: 100, idempotencyKey: 'k' });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) expect(second.value.id).toBe(first.value.id);
    const listed = await repo.list();
    if (listed.ok) expect(listed.value.total).toBe(1);
  });

  it('different keys or donors create separate intents', async () => {
    const repo = createMockDonationRepository();
    await repo.create({ donorId: 'd1', amount: 100, idempotencyKey: 'k1' });
    await repo.create({ donorId: 'd1', amount: 100, idempotencyKey: 'k2' });
    await repo.create({ donorId: 'd2', amount: 100, idempotencyKey: 'k1' });
    const listed = await repo.list();
    if (listed.ok) expect(listed.value.total).toBe(3);
  });

  it('creates duplicates when no key is supplied (legacy behaviour)', async () => {
    const repo = createMockDonationRepository();
    await repo.create({ donorId: 'd1', amount: 100 });
    await repo.create({ donorId: 'd1', amount: 100 });
    const listed = await repo.list();
    if (listed.ok) expect(listed.value.total).toBe(2);
  });

  it('advance applies the lifecycle and mints the receipt only at verify', async () => {
    const { repo, id } = await intent();
    await repo.advance(id, { type: 'handoff', providerReference: 'pledge-1' }, 'provider');
    const pending = await repo.getById(id);
    if (pending.ok && pending.value) {
      expect(pending.value.status).toBe('provider_pending');
      expect(pending.value.providerReference).toBe('pledge-1');
      expect(pending.value.receiptNumber).toBeNull();
    }
    await repo.advance(id, { type: 'provider_confirm', providerReference: 'pledge-1' }, 'provider');
    const confirmed = await repo.getById(id);
    if (confirmed.ok && confirmed.value) expect(confirmed.value.receiptNumber).toBeNull();

    await repo.advance(
      id,
      { type: 'verify', verifiedBy: 'finance-1', receiptNumber: 'RCP-1' },
      'finance_officer',
    );
    const verified = await repo.getById(id);
    if (verified.ok && verified.value) {
      expect(verified.value.status).toBe('verified');
      expect(verified.value.receiptNumber).toBe('RCP-1');
      expect(verified.value.verifiedBy).toBe('finance-1');
    }
  });

  it('advance returns NotFound for unknown ids', async () => {
    const repo = createMockDonationRepository();
    const result = await repo.advance('nope', { type: 'cancel' }, 'donor');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NotFound');
  });
});
