import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockDonationRepository } from '@/repositories/mock/donation';
import { createDemoPaymentProvider } from '@/providers/mock/demo-payment';
import { createMockPaymentProvider } from '@/providers/mock/payment';
import {
  cancelDonationIntent,
  createDonationIntent,
  handoffToProvider,
  simulateProviderOutcome,
  verifyDonation,
} from '../donation-intent-service';
import { toReceiptView } from '../receipt-service';

function setup() {
  return {
    donations: createMockDonationRepository(),
    payment: createDemoPaymentProvider(),
    audit: createMockAuditRepository(),
  };
}

const input = {
  donorId: 'donor-1',
  programId: 'program-1',
  amount: 50000,
  anonymous: false,
  idempotencyKey: 'intent-key-1',
};

describe('donation intent service', () => {
  it('creates an intent and audits it', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    expect(created.ok).toBe(true);
    if (created.ok) expect(created.value.status).toBe('intent_created');
    const entries = await deps.audit.list();
    if (entries.ok) expect(entries.value.total).toBe(1);
  });

  it('requires an idempotency key and returns the same intent on retry', async () => {
    const deps = setup();
    const missing = await createDonationIntent(deps, { ...input, idempotencyKey: '  ' });
    expect(missing.ok).toBe(false);
    const first = await createDonationIntent(deps, input);
    const second = await createDonationIntent(deps, input);
    if (first.ok && second.ok) expect(second.value.id).toBe(first.value.id);
  });

  it('walks the full demo lifecycle to verified with a receipt', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const id = created.value.id;

    expect(toReceiptView(created.value)).toBeNull();
    await handoffToProvider(deps, id);
    await simulateProviderOutcome(deps, id, 'confirm');
    const confirmed = await deps.donations.getById(id);
    if (confirmed.ok && confirmed.value) {
      expect(confirmed.value.status).toBe('provider_confirmed');
      expect(toReceiptView(confirmed.value)).toBeNull();
    }
    const verified = await verifyDonation(deps, id, 'finance-1');
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.value.status).toBe('verified');
      expect(toReceiptView(verified.value)?.receiptNumber).toContain('AZIB-DEMO-RCP-');
    }
  });

  it('refuses verification while the provider has not confirmed', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    await handoffToProvider(deps, created.value.id);
    const early = await verifyDonation(deps, created.value.id, 'finance-1');
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error.meta.code).toBe('INVALID_TRANSITION');
  });

  it('refuses verification when the provider declined', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    await handoffToProvider(deps, created.value.id);
    await simulateProviderOutcome(deps, created.value.id, 'decline');
    const result = await verifyDonation(deps, created.value.id, 'finance-1');
    expect(result.ok).toBe(false);
  });

  it('client cannot write past intent_created', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    await handoffToProvider(deps, created.value.id);
    const cancel = await cancelDonationIntent(deps, created.value.id, input.donorId);
    expect(cancel.ok).toBe(false);
    if (!cancel.ok) expect(cancel.error.kind).toBe('Forbidden');
  });

  it('only the owner may cancel an intent', async () => {
    const deps = setup();
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const stranger = await cancelDonationIntent(deps, created.value.id, 'someone-else');
    expect(stranger.ok).toBe(false);
    const owner = await cancelDonationIntent(deps, created.value.id, input.donorId);
    expect(owner.ok).toBe(true);
    if (owner.ok) expect(owner.value.status).toBe('cancelled');
  });

  it('demo simulation is unavailable with a non-demo provider', async () => {
    const deps = { ...setup(), payment: createMockPaymentProvider() };
    const created = await createDonationIntent(deps, input);
    if (!created.ok) throw new Error('setup failed');
    await handoffToProvider(deps, created.value.id);
    const result = await simulateProviderOutcome(deps, created.value.id, 'confirm');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NotConnected');
  });
});
