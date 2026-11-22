import type { Donation } from '@/repositories/contracts/donation';
import { buildReceiptNumber, selectReceipts, toReceiptView } from '../receipt-service';

function donation(patch: Partial<Donation> = {}): Donation {
  return {
    id: 'donation-abc123',
    donorId: 'donor-1',
    amount: 50000,
    currency: 'YER',
    status: 'intent_created',
    note: null,
    createdAt: '2026-11-16T10:00:00.000Z',
    updatedAt: '2026-11-16T10:00:00.000Z',
    dataOrigin: 'demo',
    programId: 'program-1',
    anonymous: false,
    receiptNumber: null,
    verifiedAt: null,
    ...patch,
  };
}

describe('receipt service', () => {
  it('never produces a receipt before verification', () => {
    for (const status of ['intent_created', 'provider_pending', 'provider_confirmed'] as const) {
      expect(toReceiptView(donation({ status }))).toBeNull();
    }
  });

  it('requires a minted number even when verified', () => {
    expect(toReceiptView(donation({ status: 'verified' }))).toBeNull();
  });

  it('produces a receipt for a verified donation', () => {
    const view = toReceiptView(
      donation({
        status: 'verified',
        receiptNumber: 'RCP-1',
        verifiedAt: '2026-11-16T12:00:00.000Z',
        anonymous: true,
      }),
    );
    expect(view).not.toBeNull();
    expect(view?.receiptNumber).toBe('RCP-1');
    expect(view?.anonymous).toBe(true);
    expect(view?.issuedAt).toBe('2026-11-16T12:00:00.000Z');
  });

  it('never exposes donor identity in the receipt view', () => {
    const view = toReceiptView(
      donation({ status: 'verified', receiptNumber: 'RCP-1' }),
    );
    expect(JSON.stringify(view)).not.toContain('donor-1');
  });

  it('selects only verified donations', () => {
    const rows = [
      donation({ id: 'a' }),
      donation({ id: 'b', status: 'verified', receiptNumber: 'RCP-B' }),
      donation({ id: 'c', status: 'declined' }),
    ];
    expect(selectReceipts(rows).length).toBe(1);
  });

  it('builds a demo-labeled deterministic number', () => {
    const a = buildReceiptNumber('donation-abc123', '2026-11-16T12:00:00.000Z');
    const b = buildReceiptNumber('donation-abc123', '2026-11-16T12:00:00.000Z');
    expect(a).toBe(b);
    expect(a.startsWith('AZIB-DEMO-RCP-2026-')).toBe(true);
  });
});
