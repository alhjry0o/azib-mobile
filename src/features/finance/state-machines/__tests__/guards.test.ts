import {
  assertAmountWithinCap,
  assertApplicationDisbursable,
  assertDistinctMakerChecker,
  assertPositiveIntegerAmount,
  assertProofReference,
  committedTotal,
} from '../guards';

describe('Maker ≠ Checker', () => {
  it('rejects the same person', () => {
    const result = assertDistinctMakerChecker('u1', 'u1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('MAKER_EQUALS_CHECKER');
  });

  it('rejects a missing maker (separation cannot be proven)', () => {
    expect(assertDistinctMakerChecker(null, 'u2').ok).toBe(false);
    expect(assertDistinctMakerChecker(undefined, 'u2').ok).toBe(false);
    expect(assertDistinctMakerChecker('  ', 'u2').ok).toBe(false);
  });

  it('rejects a missing checker', () => {
    const result = assertDistinctMakerChecker('u1', '');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('CHECKER_REQUIRED');
  });

  it('accepts two different people', () => {
    expect(assertDistinctMakerChecker('u1', 'u2').ok).toBe(true);
  });
});

describe('proof reference', () => {
  it('is required and bounded', () => {
    expect(assertProofReference(null).ok).toBe(false);
    expect(assertProofReference('   ').ok).toBe(false);
    expect(assertProofReference('x'.repeat(201)).ok).toBe(false);
    const valid = assertProofReference('  ref-1  ');
    expect(valid.ok).toBe(true);
    if (valid.ok) expect(valid.value).toBe('ref-1');
  });
});

describe('amounts', () => {
  it('requires positive integers', () => {
    expect(assertPositiveIntegerAmount(0).ok).toBe(false);
    expect(assertPositiveIntegerAmount(-1).ok).toBe(false);
    expect(assertPositiveIntegerAmount(10.5).ok).toBe(false);
    expect(assertPositiveIntegerAmount(100).ok).toBe(true);
  });

  it('caps cumulative disbursements at the requested amount', () => {
    expect(assertAmountWithinCap(0, 100000, 100000).ok).toBe(true);
    expect(assertAmountWithinCap(90000, 10000, 100000).ok).toBe(true);
    const over = assertAmountWithinCap(90001, 10000, 100000);
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error.meta.code).toBe('AMOUNT_CAP_EXCEEDED');
  });

  it('rejected proposals do not consume the cap', () => {
    const total = committedTotal([
      { amount: 50000, status: 'rejected' },
      { amount: 30000, status: 'approved' },
      { amount: 20000, status: 'paid_recorded' },
    ]);
    expect(total).toBe(50000);
  });
});

describe('application gate', () => {
  it('allows approved / disbursing (and the legacy alias)', () => {
    expect(assertApplicationDisbursable('approved').ok).toBe(true);
    expect(assertApplicationDisbursable('disbursing').ok).toBe(true);
    expect(assertApplicationDisbursable('disbursed').ok).toBe(true);
  });

  it('refuses every other status', () => {
    for (const status of ['draft', 'submitted', 'in_review', 'rejected', 'completed'] as const) {
      const result = assertApplicationDisbursable(status);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.meta.code).toBe('APPLICATION_NOT_APPROVED');
    }
  });
});
