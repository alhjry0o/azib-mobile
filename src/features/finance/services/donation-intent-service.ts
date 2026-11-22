// Donation intent orchestration. The client creates an intent and may cancel
// it before handoff — nothing else. Provider stages run through the demo
// provider; 'verified' is written only by a finance actor (server in P18).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  Donation,
  DonationRepository,
} from '@/repositories/contracts/donation';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { PaymentProvider } from '@/providers/contracts/payment';
import { isDemoPaymentProvider } from '@/providers/mock/demo-payment';
import {
  assertClientDonationWrite,
  assertDonationTransition,
  toDonationWorkflowStatus,
} from '../state-machines/donation-machine';
import { assertPositiveIntegerAmount, assertProofReference } from '../state-machines/guards';
import { appendFinanceAudit } from './finance-audit';
import { buildReceiptNumber } from './receipt-service';

export interface DonationIntentDeps {
  readonly donations: DonationRepository;
  readonly payment: PaymentProvider;
  readonly audit: AuditRepository;
}

export interface CreateIntentInput {
  readonly donorId: string;
  readonly programId: string;
  readonly amount: number;
  readonly anonymous: boolean;
  readonly idempotencyKey: string;
  readonly note?: string | null;
}

export async function createDonationIntent(
  deps: DonationIntentDeps,
  input: CreateIntentInput,
): Promise<Result<Donation>> {
  const amount = assertPositiveIntegerAmount(input.amount);
  if (!amount.ok) return amount;
  if (input.idempotencyKey.trim().length === 0) {
    return { ok: false, error: AppError.validation({ code: 'IDEMPOTENCY_KEY_REQUIRED' }) };
  }
  const created = await deps.donations.create({
    donorId: input.donorId,
    amount: input.amount,
    programId: input.programId,
    anonymous: input.anonymous,
    idempotencyKey: input.idempotencyKey,
    note: input.note ?? null,
  });
  if (!created.ok) return created;
  await appendFinanceAudit(deps.audit, {
    actorId: input.donorId,
    action: 'donation.intent_created',
    target: `donation:${created.value.id}`,
    to: 'intent_created',
  });
  return created;
}

/** The only write the client may perform after creation. */
export async function cancelDonationIntent(
  deps: DonationIntentDeps,
  donationId: string,
  donorId: string,
): Promise<Result<Donation>> {
  const found = await deps.donations.getById(donationId);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DONATION_NOT_FOUND' }) };
  if (existing.donorId !== donorId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_DONATION_OWNER' }) };
  }
  const allowed = assertClientDonationWrite(existing.status, 'cancelled');
  if (!allowed.ok) return allowed;
  const moved = await deps.donations.advance(donationId, { type: 'cancel' }, 'donor');
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: donorId,
    action: 'donation.cancelled',
    target: `donation:${donationId}`,
    from: toDonationWorkflowStatus(existing.status),
    to: 'cancelled',
  });
  return moved;
}

export async function handoffToProvider(
  deps: DonationIntentDeps,
  donationId: string,
): Promise<Result<Donation>> {
  const found = await deps.donations.getById(donationId);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DONATION_NOT_FOUND' }) };

  const from = toDonationWorkflowStatus(existing.status);
  const allowed = assertDonationTransition(from, 'provider_pending', 'provider');
  if (!allowed.ok) return allowed;

  const pledge = await deps.payment.recordPledge({
    amount: existing.amount,
    currency: 'YER',
  });
  if (!pledge.ok) return pledge;

  const reference = assertProofReference(pledge.value.id);
  if (!reference.ok) return reference;

  const moved = await deps.donations.advance(
    donationId,
    { type: 'handoff', providerReference: reference.value },
    'provider',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: 'payment-provider',
    action: 'donation.provider_pending',
    target: `donation:${donationId}`,
    from,
    to: 'provider_pending',
  });
  return moved;
}

/** Demo-only: represents the licensed provider's callback. Never in backend mode. */
export async function simulateProviderOutcome(
  deps: DonationIntentDeps,
  donationId: string,
  outcome: 'confirm' | 'decline',
): Promise<Result<Donation>> {
  if (!isDemoPaymentProvider(deps.payment)) {
    return { ok: false, error: AppError.notConnected({ code: 'PROVIDER_NOT_DEMO' }) };
  }
  const found = await deps.donations.getById(donationId);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DONATION_NOT_FOUND' }) };

  const from = toDonationWorkflowStatus(existing.status);
  const target = outcome === 'confirm' ? 'provider_confirmed' : 'declined';
  const allowed = assertDonationTransition(from, target, 'provider');
  if (!allowed.ok) return allowed;

  const reference = existing.providerReference ?? '';
  const settled =
    outcome === 'confirm'
      ? await deps.payment.__confirmPledge(reference)
      : await deps.payment.__declinePledge(reference);
  if (!settled.ok) return settled;

  const moved = await deps.donations.advance(
    donationId,
    outcome === 'confirm'
      ? { type: 'provider_confirm', providerReference: reference }
      : { type: 'provider_decline' },
    'provider',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: 'payment-provider',
    action: `donation.${target}`,
    target: `donation:${donationId}`,
    from,
    to: target,
  });
  return moved;
}

/** Finance/server only. Mints the receipt at the moment of verification. */
export async function verifyDonation(
  deps: DonationIntentDeps,
  donationId: string,
  verifiedBy: string,
): Promise<Result<Donation>> {
  const found = await deps.donations.getById(donationId);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DONATION_NOT_FOUND' }) };

  const from = toDonationWorkflowStatus(existing.status);
  const allowed = assertDonationTransition(from, 'verified', 'finance_officer');
  if (!allowed.ok) return allowed;

  const verified = await deps.payment.verifyExternalPayment(existing.providerReference ?? '');
  if (!verified.ok) return verified;
  if (verified.value === null) {
    return { ok: false, error: AppError.conflict({ code: 'PROVIDER_NOT_CONFIRMED' }) };
  }

  const issuedAt = new Date().toISOString();
  const moved = await deps.donations.advance(
    donationId,
    {
      type: 'verify',
      verifiedBy,
      receiptNumber: buildReceiptNumber(donationId, issuedAt),
    },
    'finance_officer',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: verifiedBy,
    action: 'donation.verified',
    target: `donation:${donationId}`,
    from,
    to: 'verified',
  });
  return ok(moved.value);
}
