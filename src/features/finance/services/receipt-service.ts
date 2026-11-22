// A receipt exists ONLY for a verified donation (D-6). Never before.
// The number is demo-labeled; the official one is minted server-side in P18.
import type { Donation } from '@/repositories/contracts/donation';

export interface ReceiptView {
  readonly receiptNumber: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly programId: string | null;
  readonly issuedAt: string;
  readonly anonymous: boolean;
  readonly dataOrigin: 'demo' | 'real';
}

export function buildReceiptNumber(donationId: string, issuedAt: string): string {
  const year = issuedAt.slice(0, 4);
  const tail = donationId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `AZIB-DEMO-RCP-${year}-${tail.padStart(6, '0')}`;
}

export function toReceiptView(donation: Donation): ReceiptView | null {
  if (donation.status !== 'verified') return null;
  const number = donation.receiptNumber ?? null;
  if (!number) return null;
  return Object.freeze({
    receiptNumber: number,
    amount: donation.amount,
    currency: donation.currency,
    programId: donation.programId ?? null,
    issuedAt: donation.verifiedAt ?? donation.updatedAt,
    anonymous: donation.anonymous === true,
    dataOrigin: donation.dataOrigin,
  });
}

export function selectReceipts(donations: readonly Donation[]): readonly ReceiptView[] {
  const out: ReceiptView[] = [];
  for (const donation of donations) {
    const view = toReceiptView(donation);
    if (view) out.push(view);
  }
  return out;
}
