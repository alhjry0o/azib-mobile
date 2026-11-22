import { createDemoPaymentProvider, isDemoPaymentProvider } from '../demo-payment';
import { createMockPaymentProvider } from '../payment';

describe('DemoPaymentProvider (ADR-0005)', () => {
  it('exposes no forbidden payment method and no card field', () => {
    const provider = createDemoPaymentProvider();
    const keys = Object.keys(provider);
    for (const forbidden of ['charge', 'capture', 'refund', 'createIntent', 'createPaymentMethod']) {
      expect(keys).not.toContain(forbidden);
    }
    expect(provider.capabilities).toEqual(['recordPledge', 'verifyExternalPayment']);
  });

  it('records an intent as pending demo data', async () => {
    const provider = createDemoPaymentProvider();
    const result = await provider.recordPledge({ amount: 5000, currency: 'YER' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('pending');
    expect(result.value.dataOrigin).toBe('demo');
  });

  it('rejects zero, negative and fractional amounts', async () => {
    const provider = createDemoPaymentProvider();
    for (const amount of [0, -1, 10.5]) {
      const result = await provider.recordPledge({ amount, currency: 'YER' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('Validation');
    }
  });

  it('never confirms without the demo lifecycle step', async () => {
    const provider = createDemoPaymentProvider();
    const pledge = await provider.recordPledge({ amount: 1000, currency: 'YER' });
    if (!pledge.ok) throw new Error('setup failed');
    const before = await provider.verifyExternalPayment(pledge.value.id);
    expect(before.ok).toBe(true);
    if (before.ok) expect(before.value).toBeNull();

    await provider.__confirmPledge(pledge.value.id);
    const after = await provider.verifyExternalPayment(pledge.value.id);
    expect(after.ok).toBe(true);
    if (after.ok) expect(after.value?.status).toBe('confirmed');
  });

  it('returns null for unknown references', async () => {
    const provider = createDemoPaymentProvider();
    const result = await provider.verifyExternalPayment('nope');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeNull();
  });

  it('cannot settle a pledge twice', async () => {
    const provider = createDemoPaymentProvider();
    const pledge = await provider.recordPledge({ amount: 1000, currency: 'YER' });
    if (!pledge.ok) throw new Error('setup failed');
    await provider.__confirmPledge(pledge.value.id);
    const again = await provider.__declinePledge(pledge.value.id);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.meta.code).toBe('PLEDGE_ALREADY_SETTLED');
  });

  it('the type guard distinguishes demo from the plain mock', () => {
    expect(isDemoPaymentProvider(createDemoPaymentProvider())).toBe(true);
    expect(isDemoPaymentProvider(createMockPaymentProvider())).toBe(false);
  });
});
