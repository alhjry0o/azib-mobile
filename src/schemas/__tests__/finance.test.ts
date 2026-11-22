import {
  CreateDisbursementInputSchema,
  CreateDonationInputSchema,
  CreateProgramInputSchema,
  DisbursementStatusSchema,
  DonationStatusSchema,
  ProgramKindSchema,
} from '../index';

describe('finance schemas (P09)', () => {
  it('donation statuses keep legacy values and add the four stages', () => {
    for (const status of ['pending', 'confirmed', 'declined'] as const) {
      expect(DonationStatusSchema.safeParse(status).success).toBe(true);
    }
    for (const status of [
      'intent_created',
      'provider_pending',
      'provider_confirmed',
      'verified',
      'cancelled',
    ] as const) {
      expect(DonationStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(DonationStatusSchema.safeParse('received').success).toBe(false);
  });

  it('disbursement statuses keep legacy values and add the workflow', () => {
    for (const status of ['pending', 'confirmed', 'proposed', 'approved'] as const) {
      expect(DisbursementStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(DisbursementStatusSchema.safeParse('paid').success).toBe(false);
  });

  it('donation amounts must be positive integers', () => {
    expect(CreateDonationInputSchema.safeParse({ donorId: 'd', amount: 100 }).success).toBe(true);
    expect(CreateDonationInputSchema.safeParse({ donorId: 'd', amount: 10.5 }).success).toBe(false);
    expect(CreateDonationInputSchema.safeParse({ donorId: 'd', amount: 0 }).success).toBe(false);
  });

  it('accepts the additive donation fields', () => {
    const parsed = CreateDonationInputSchema.safeParse({
      donorId: 'd',
      amount: 100,
      programId: 'p',
      anonymous: true,
      idempotencyKey: 'k',
    });
    expect(parsed.success).toBe(true);
  });

  it('disbursement amounts must be positive integers', () => {
    expect(
      CreateDisbursementInputSchema.safeParse({ applicationId: 'a', amount: 1.5 }).success,
    ).toBe(false);
    expect(
      CreateDisbursementInputSchema.safeParse({ applicationId: 'a', amount: 100, makerId: 'm' })
        .success,
    ).toBe(true);
  });

  it('program kind is optional and constrained', () => {
    const base = { nameKey: 'p', descriptionKey: 'p.d', minAmount: 1, maxAmount: 2 };
    expect(CreateProgramInputSchema.safeParse(base).success).toBe(true);
    expect(CreateProgramInputSchema.safeParse({ ...base, kind: 'qard_hasan' }).success).toBe(true);
    expect(CreateProgramInputSchema.safeParse({ ...base, kind: 'loan' }).success).toBe(false);
    expect(ProgramKindSchema.options.length).toBe(5);
  });
});
